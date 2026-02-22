-- Phase 6 : Partage lecture seule par lien (token).

create table if not exists public.goal_share_links (
  id uuid primary key default gen_random_uuid(),
  goal_id bigint not null references public.goals(id) on delete cascade,
  token text not null unique default encode(gen_random_bytes(24), 'hex'),
  created_at timestamptz default now(),
  expires_at timestamptz,
  created_by uuid references auth.users(id)
);

create index if not exists idx_goal_share_links_goal_id on public.goal_share_links(goal_id);
create index if not exists idx_goal_share_links_token on public.goal_share_links(token);

alter table public.goal_share_links enable row level security;

-- Seuls les admins du groupe peuvent créer/supprimer des liens
create policy "Share links: admin can manage"
  on public.goal_share_links for all to authenticated
  using (
    exists (
      select 1 from public.goals g
      join public.user_groups ug on ug.group_id = g.group_id and ug.user_id = auth.uid() and ug.role = 'admin'
      where g.id = goal_share_links.goal_id
    )
  )
  with check (
    exists (
      select 1 from public.goals g
      join public.user_groups ug on ug.group_id = g.group_id and ug.user_id = auth.uid() and ug.role = 'admin'
      where g.id = goal_share_links.goal_id
    )
  );

-- RPC : créer un lien de partage (admin du groupe du goal)
create or replace function public.create_goal_share_link(
  p_goal_id bigint,
  p_expires_in_days int default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  g_group_id uuid;
  link_token text;
  link_id uuid;
begin
  select g.group_id into g_group_id from public.goals g where g.id = p_goal_id;
  if g_group_id is null then
    raise exception 'Goal not found';
  end if;
  if not exists (
    select 1 from public.user_groups ug
    where ug.group_id = g_group_id and ug.user_id = auth.uid() and ug.role = 'admin'
  ) then
    raise exception 'Only group admin can create share links';
  end if;

  link_token := encode(gen_random_bytes(24), 'hex');
  insert into public.goal_share_links (goal_id, token, expires_at, created_by)
  values (
    p_goal_id,
    link_token,
    case when p_expires_in_days is not null then now() + (p_expires_in_days || ' days')::interval else null end,
    auth.uid()
  )
  returning id, token into link_id, link_token;
  return jsonb_build_object('id', link_id, 'token', link_token);
end;
$$;

-- RPC : lecture publique par token (pas d'auth requise) – retourne goal + transactions
create or replace function public.get_goal_by_share_token(p_token text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  link record;
  g record;
  tx_rows jsonb;
begin
  select id, goal_id, expires_at into link
  from public.goal_share_links
  where token = p_token;
  if not found then
    return null;
  end if;
  if link.expires_at is not null and link.expires_at < now() then
    return null;
  end if;

  select to_jsonb(g.*) into g
  from public.goals g
  where g.id = link.goal_id;
  if not found then
    return null;
  end if;

  select coalesce(jsonb_agg(to_jsonb(t.*) order by t."createdAt" desc), '[]'::jsonb) into tx_rows
  from public.transactions t
  where t."goalId" = link.goal_id;

  return jsonb_build_object('goal', g, 'transactions', tx_rows);
end;
$$;

-- Permettre l'appel sans auth pour la lecture par token
grant execute on function public.get_goal_by_share_token(text) to anon;
grant execute on function public.get_goal_by_share_token(text) to authenticated;
