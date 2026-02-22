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
  -- Prix early-bird : après early_bird_cap souscriptions, utiliser price_amount_after_early
  price_amount_after_early int,
  early_bird_cap int,
  created_at timestamptz default now()
);

-- Ajouter les colonnes early-bird si la table existait déjà (migration antérieure sans ces colonnes)
alter table public.plans add column if not exists price_amount_after_early int;
alter table public.plans add column if not exists early_bird_cap int;

insert into public.plans (id, name, max_goals, is_one_shot, price_amount, price_currency, price_amount_after_early, early_bird_cap)
values
  ('free', 'Gratuit', 1, false, null, 'MGA', null, null),
  ('premium', 'Premium One-Shot', null, true, 15000, 'MGA', 25000, 100)
on conflict (id) do update set
  price_amount_after_early = excluded.price_amount_after_early,
  early_bird_cap = excluded.early_bird_cap;

-- Prix effectif d'un plan (early-bird pour premium : 15000 Ar pour les 100 premières, puis 25000 Ar)
create or replace function public.get_plan_effective_price(p_plan_id text)
returns int
language plpgsql
security definer
set search_path = ''
stable
as $$
declare
  p public.plans;
  premium_count int;
begin
  select * into p from public.plans where id = p_plan_id;
  if not found then
    return null;
  end if;
  if p.early_bird_cap is not null and p.price_amount_after_early is not null then
    select count(*) into premium_count from public.abonnements where plan_id = p_plan_id;
    if premium_count < p.early_bird_cap then
      return p.price_amount;
    else
      return p.price_amount_after_early;
    end if;
  end if;
  return p.price_amount;
end;
$$;

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
