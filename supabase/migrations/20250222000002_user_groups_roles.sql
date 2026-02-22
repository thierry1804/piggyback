-- Phase 2 : Rôles (admin, contributor, observer) sur user_groups et RLS associée.

-- ========== 1. Colonne role sur user_groups ==========
alter table public.user_groups
  add column if not exists role text not null default 'admin'
  check (role in ('admin', 'contributor', 'observer'));

-- ========== 2. create_my_group : préciser role = 'admin' ==========
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
  insert into public.user_groups (user_id, group_id, role) values (auth.uid(), gid, 'admin');
  insert into public.abonnements (group_id, plan_id) values (gid, 'free');
  return gid;
end;
$$;

-- ========== 3. RLS goals : lecture pour tous les membres, écriture pour admin et contributor ==========
drop policy if exists "Goals par groupe de l'utilisateur" on public.goals;
create policy "Goals lecture par groupe"
  on public.goals for select to authenticated
  using (
    "group_id" is not null
    and exists (
      select 1 from public.user_groups ug
      where ug.group_id = goals."group_id" and ug.user_id = auth.uid()
    )
  );
create policy "Goals écriture admin ou contributor"
  on public.goals for all to authenticated
  using (
    "group_id" is not null
    and exists (
      select 1 from public.user_groups ug
      where ug.group_id = goals."group_id" and ug.user_id = auth.uid()
        and ug.role in ('admin', 'contributor')
    )
  )
  with check (
    "group_id" is not null
    and exists (
      select 1 from public.user_groups ug
      where ug.group_id = goals."group_id" and ug.user_id = auth.uid()
        and ug.role in ('admin', 'contributor')
    )
  );

-- ========== 4. RLS transactions : idem ==========
drop policy if exists "Transactions via goals du groupe" on public.transactions;
create policy "Transactions lecture via goals du groupe"
  on public.transactions for select to authenticated
  using (
    exists (
      select 1 from public.goals g
      join public.user_groups ug on ug.group_id = g."group_id" and ug.user_id = auth.uid()
      where g.id = transactions."goalId"
    )
  );
create policy "Transactions écriture admin ou contributor"
  on public.transactions for all to authenticated
  using (
    exists (
      select 1 from public.goals g
      join public.user_groups ug on ug.group_id = g."group_id" and ug.user_id = auth.uid()
        and ug.role in ('admin', 'contributor')
      where g.id = transactions."goalId"
    )
  )
  with check (
    exists (
      select 1 from public.goals g
      join public.user_groups ug on ug.group_id = g."group_id" and ug.user_id = auth.uid()
        and ug.role in ('admin', 'contributor')
      where g.id = transactions."goalId"
    )
  );
