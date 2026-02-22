-- Sync /app : création de groupe pour un user, liaison goals aux groupes, RLS.
-- À exécuter dans le SQL Editor du projet Supabase après les tables existantes (users, roles, groups, user_groups, goals, transactions, settings).

-- ========== 1. Fonction RPC : créer un groupe et y attacher l'utilisateur connecté ==========
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
  return gid;
end;
$$;

-- ========== 2. Lier les goals à un groupe ==========
alter table public.goals
  add column if not exists "group_id" uuid references public.groups(id) on delete cascade;

-- Optionnel : affecter les goals existants (sans group_id) à un groupe par défaut.
-- Décommenter et adapter si vous avez un group_id connu, sinon les lignes restent sans groupe (invisibles après RLS).
-- update public.goals set "group_id" = '<uuid-du-groupe>' where "group_id" is null;

-- RLS sur goals : remplacer "Allow all"
drop policy if exists "Allow all on goals" on public.goals;
create policy "Goals par groupe de l'utilisateur"
  on public.goals for all to authenticated
  using (
    "group_id" is not null
    and exists (
      select 1 from public.user_groups ug
      where ug.group_id = goals."group_id" and ug.user_id = auth.uid()
    )
  )
  with check (
    "group_id" is not null
    and exists (
      select 1 from public.user_groups ug
      where ug.group_id = goals."group_id" and ug.user_id = auth.uid()
    )
  );

-- ========== 3. RLS sur transactions (accès via le goal du groupe) ==========
drop policy if exists "Allow all on transactions" on public.transactions;
create policy "Transactions via goals du groupe"
  on public.transactions for all to authenticated
  using (
    exists (
      select 1 from public.goals g
      join public.user_groups ug on ug.group_id = g."group_id" and ug.user_id = auth.uid()
      where g.id = transactions."goalId"
    )
  )
  with check (
    exists (
      select 1 from public.goals g
      join public.user_groups ug on ug.group_id = g."group_id" and ug.user_id = auth.uid()
      where g.id = transactions."goalId"
    )
  );

-- ========== 4. Settings : on garde la table actuelle (une ligne id=1). La sync fera UPDATE. ==========
-- Pas de changement de schéma. RLS actuelle "Allow all" peut rester ou être restreinte plus tard.
