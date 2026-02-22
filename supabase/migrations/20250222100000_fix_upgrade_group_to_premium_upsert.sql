-- Correctif : upgrade_group_to_premium doit créer un abonnement si le groupe n'en a pas
-- (cas : groupe créé avant la table abonnements ou sans ligne abonnements).

create or replace function public.upgrade_group_to_premium()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  gid uuid;
begin
  select ug.group_id into gid
  from public.user_groups ug
  where ug.user_id = auth.uid()
  limit 1;
  if gid is null then
    raise exception 'No group found for user';
  end if;

  insert into public.abonnements (group_id, plan_id)
  values (gid, 'premium')
  on conflict (group_id) do update
  set plan_id = 'premium', updated_at = now();
end;
$$;
