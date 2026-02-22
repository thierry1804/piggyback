-- Phase 3 : Historique inviolable (created_by, source sur transactions) et journal goal_events.

-- ========== 1. Transactions : created_by, source (append-only, pas de DELETE/UPDATE côté utilisateur) ==========
alter table public.transactions
  add column if not exists created_by uuid references auth.users(id);
alter table public.transactions
  add column if not exists source text default 'manual' check (source in ('manual', 'correction'));

-- ========== 2. Table goal_events ==========
create table if not exists public.goal_events (
  id uuid primary key default gen_random_uuid(),
  goal_id bigint references public.goals(id) on delete cascade,
  group_id uuid not null references public.groups(id) on delete cascade,
  event_type text not null,
  payload jsonb default '{}',
  user_id uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create index if not exists idx_goal_events_goal_id on public.goal_events(goal_id);
create index if not exists idx_goal_events_group_id on public.goal_events(group_id);
create index if not exists idx_goal_events_created_at on public.goal_events(created_at desc);

alter table public.goal_events enable row level security;

create policy "Goal events visibles par les membres du groupe"
  on public.goal_events for select to authenticated
  using (
    exists (
      select 1 from public.user_groups ug
      where ug.group_id = goal_events.group_id and ug.user_id = auth.uid()
    )
  );
create policy "Goal events insertion par admin/contributor"
  on public.goal_events for insert to authenticated
  with check (
    exists (
      select 1 from public.user_groups ug
      where ug.group_id = goal_events.group_id and ug.user_id = auth.uid()
        and ug.role in ('admin', 'contributor')
    )
  );

-- ========== 3. Fonction helper pour insérer un événement ==========
create or replace function public.insert_goal_event(
  p_goal_id bigint,
  p_group_id uuid,
  p_event_type text,
  p_payload jsonb default '{}'
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.goal_events (goal_id, group_id, event_type, payload, user_id)
  values (p_goal_id, p_group_id, p_event_type, p_payload, auth.uid());
end;
$$;

-- ========== 4. Triggers sur goals : après INSERT/UPDATE ==========
create or replace function public.goals_events_trigger_fn()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if TG_OP = 'INSERT' then
    insert into public.goal_events (goal_id, group_id, event_type, payload, user_id)
    values (NEW.id, NEW.group_id, 'goal_created', jsonb_build_object('name', NEW.name, 'targetAmount', NEW.targetAmount), auth.uid());
  elsif TG_OP = 'UPDATE' then
    insert into public.goal_events (goal_id, group_id, event_type, payload, user_id)
    values (NEW.id, NEW.group_id, 'goal_updated', jsonb_build_object(
      'name', NEW.name, 'targetAmount', NEW.targetAmount, 'currentAmount', NEW.currentAmount,
      'deadline', NEW.deadline
    ), auth.uid());
  end if;
  return NEW;
end;
$$;
drop trigger if exists goals_events_trigger on public.goals;
create trigger goals_events_trigger
  after insert or update on public.goals
  for each row
  execute function public.goals_events_trigger_fn();

-- ========== 5. Triggers sur transactions : après INSERT ==========
create or replace function public.transactions_events_trigger_fn()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  g_group_id uuid;
begin
  select g.group_id into g_group_id from public.goals g where g.id = NEW."goalId";
  if g_group_id is null then return NEW; end if;
  insert into public.goal_events (goal_id, group_id, event_type, payload, user_id)
  values (NEW."goalId", g_group_id, 'transaction_added',
    jsonb_build_object('amount', NEW.amount, 'note', NEW.note, 'source', coalesce(NEW.source, 'manual')),
    coalesce(NEW.created_by, auth.uid()));
  return NEW;
end;
$$;
drop trigger if exists transactions_events_trigger on public.transactions;
create trigger transactions_events_trigger
  after insert on public.transactions
  for each row
  execute function public.transactions_events_trigger_fn();
