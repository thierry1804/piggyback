-- Plans et abonnements : référentiel plans, table abonnements par groupe, RLS.
-- À exécuter après les tables groups, user_groups, goals, etc.

-- ========== 1. Table plans (référentiel) ==========
create table if not exists public.plans (
  id text primary key,
  name text not null,
  max_goals int,
  is_one_shot boolean default false,
  price_amount int,
  price_currency text default 'MGA',
  created_at timestamptz default now()
);

insert into public.plans (id, name, max_goals, is_one_shot, price_amount, price_currency)
values
  ('free', 'Gratuit', 1, false, null, 'MGA'),
  ('premium', 'Premium One-Shot', null, true, 15000, 'MGA')
on conflict (id) do nothing;

alter table public.plans enable row level security;

drop policy if exists "Plans en lecture pour les authentifiés" on public.plans;
create policy "Plans en lecture pour les authentifiés"
  on public.plans for select to authenticated
  using (true);

-- ========== 2. Table abonnements (un groupe a un abonnement -> un plan) ==========
create table if not exists public.abonnements (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  plan_id text not null references public.plans(id),
  started_at timestamptz not null default now(),
  ends_at timestamptz,
  payment_ref text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (group_id)
);

create index if not exists idx_abonnements_group_id on public.abonnements(group_id);
create index if not exists idx_abonnements_plan_id on public.abonnements(plan_id);

alter table public.abonnements enable row level security;

drop policy if exists "Abonnements par groupe de l'utilisateur" on public.abonnements;
create policy "Abonnements par groupe de l'utilisateur"
  on public.abonnements for all to authenticated
  using (
    exists (
      select 1 from public.user_groups ug
      where ug.group_id = abonnements.group_id and ug.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.user_groups ug
      where ug.group_id = abonnements.group_id and ug.user_id = auth.uid()
    )
  );

-- ========== 3. create_my_group : créer un abonnement free à la création du groupe ==========
create or replace function public.create_my_group(group_name text default null)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  gid uuid;
begin
  insert into public.groups (name) values (coalesce(nullif(trim(group_name), ''), 'Mon groupe')) returning id into gid;
  insert into public.user_groups (user_id, group_id) values (auth.uid(), gid);
  insert into public.abonnements (group_id, plan_id) values (gid, 'free');
  return gid;
end;
$$;
