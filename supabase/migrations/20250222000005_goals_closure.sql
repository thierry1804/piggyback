-- Phase 4 : Clôture et archivage des objectifs (lecture seule après clôture).

alter table public.goals
  add column if not exists closed_at timestamptz;
alter table public.goals
  add column if not exists closed_by uuid references auth.users(id);

-- RPC : clôturer un objectif (admin ou contributor). Passe le goal en lecture seule.
create or replace function public.close_goal(p_goal_id bigint)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  g_record record;
begin
  select id, group_id, closed_at into g_record
  from public.goals
  where id = p_goal_id;
  if not found then
    raise exception 'Goal not found';
  end if;
  if g_record.closed_at is not null then
    raise exception 'Goal already closed';
  end if;
  if not exists (
    select 1 from public.user_groups ug
    join public.goals g on g.group_id = ug.group_id
    where g.id = p_goal_id and ug.user_id = auth.uid()
      and ug.role in ('admin', 'contributor')
  ) then
    raise exception 'Only admin or contributor can close this goal';
  end if;

  update public.goals
  set closed_at = now(), closed_by = auth.uid()
  where id = p_goal_id;
end;
$$;

-- RLS : interdire UPDATE/DELETE sur un goal déjà clôturé (closed_at not null)
-- On garde les policies existantes mais on ajoute une contrainte via with check.
-- Policy "Goals écriture admin ou contributor" doit aussi exiger closed_at is null pour UPDATE/DELETE.
-- La façon la plus simple : trigger before update/delete sur goals qui refuse si closed_at est déjà renseigné.
create or replace function public.goals_prevent_edit_if_closed()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if OLD.closed_at is not null then
    raise exception 'Goal is closed and cannot be modified';
  end if;
  if TG_OP = 'UPDATE' and NEW.closed_at is not null then
    return NEW;
  end if;
  return NEW;
end;
$$;
drop trigger if exists goals_prevent_edit_when_closed on public.goals;
create trigger goals_prevent_edit_when_closed
  before update or delete on public.goals
  for each row
  execute function public.goals_prevent_edit_if_closed();

-- Empêcher insert/update/delete sur transactions dont le goal est clôturé
create or replace function public.transactions_prevent_edit_if_goal_closed()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  g_closed_at timestamptz;
begin
  select closed_at into g_closed_at from public.goals where id = coalesce(NEW."goalId", OLD."goalId");
  if g_closed_at is not null then
    raise exception 'Cannot modify transactions of a closed goal';
  end if;
  return coalesce(NEW, OLD);
end;
$$;
drop trigger if exists transactions_prevent_edit_when_goal_closed on public.transactions;
create trigger transactions_prevent_edit_when_goal_closed
  before insert or update or delete on public.transactions
  for each row
  execute function public.transactions_prevent_edit_if_goal_closed();

-- Événement goal_closed dans le journal
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
    if NEW.closed_at is not null and (OLD.closed_at is null) then
      insert into public.goal_events (goal_id, group_id, event_type, payload, user_id)
      values (NEW.id, NEW.group_id, 'goal_closed', jsonb_build_object('closed_at', NEW.closed_at), auth.uid());
    else
      insert into public.goal_events (goal_id, group_id, event_type, payload, user_id)
      values (NEW.id, NEW.group_id, 'goal_updated', jsonb_build_object(
        'name', NEW.name, 'targetAmount', NEW.targetAmount, 'currentAmount', NEW.currentAmount,
        'deadline', NEW.deadline
      ), auth.uid());
    end if;
  end if;
  return NEW;
end;
$$;
