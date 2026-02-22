-- Invitations : table et RPC (admin seulement peut inviter).

create table if not exists public.group_invitations (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  email text,
  token text not null unique default encode(gen_random_bytes(24), 'hex'),
  role text not null default 'contributor' check (role in ('admin', 'contributor', 'observer')),
  expires_at timestamptz,
  created_at timestamptz default now(),
  created_by uuid references auth.users(id)
);

create index if not exists idx_group_invitations_group_id on public.group_invitations(group_id);
create index if not exists idx_group_invitations_token on public.group_invitations(token);

alter table public.group_invitations enable row level security;

create policy "Invitations visibles par les membres du groupe"
  on public.group_invitations for select to authenticated
  using (
    exists (
      select 1 from public.user_groups ug
      where ug.group_id = group_invitations.group_id and ug.user_id = auth.uid()
    )
  );
create policy "Seuls les admins peuvent créer/supprimer des invitations"
  on public.group_invitations for all to authenticated
  using (
    exists (
      select 1 from public.user_groups ug
      where ug.group_id = group_invitations.group_id and ug.user_id = auth.uid()
        and ug.role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from public.user_groups ug
      where ug.group_id = group_invitations.group_id and ug.user_id = auth.uid()
        and ug.role = 'admin'
    )
  );

-- RPC : inviter par email (admin seulement). Crée une ligne avec token.
create or replace function public.invite_to_group(
  p_group_id uuid,
  p_email text,
  p_role text default 'contributor',
  p_expires_in_days int default 7
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  expires timestamptz;
  inv_id uuid;
  inv_token text;
begin
  if p_role not in ('admin', 'contributor', 'observer') then
    raise exception 'Invalid role %', p_role;
  end if;
  if not exists (
    select 1 from public.user_groups ug
    where ug.group_id = p_group_id and ug.user_id = auth.uid() and ug.role = 'admin'
  ) then
    raise exception 'Only group admins can invite';
  end if;

  expires := case when p_expires_in_days is null then null else now() + (p_expires_in_days || ' days')::interval end;
  insert into public.group_invitations (group_id, email, role, expires_at, created_by)
  values (p_group_id, nullif(trim(p_email), ''), p_role, expires, auth.uid())
  returning id, token into inv_id, inv_token;
  return jsonb_build_object('id', inv_id, 'token', inv_token);
end;
$$;

-- RPC : accepter une invitation (par token). Ajoute user_groups avec le rôle.
create or replace function public.accept_invitation(p_token text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  inv record;
  gid uuid;
begin
  select id, group_id, role, expires_at into inv
  from public.group_invitations
  where token = p_token;
  if not found then
    raise exception 'Invitation not found';
  end if;
  if inv.expires_at is not null and inv.expires_at < now() then
    raise exception 'Invitation expired';
  end if;
  if exists (
    select 1 from public.user_groups ug
    where ug.group_id = inv.group_id and ug.user_id = auth.uid()
  ) then
    raise exception 'Already a member';
  end if;

  insert into public.user_groups (user_id, group_id, role)
  values (auth.uid(), inv.group_id, inv.role)
  returning group_id into gid;
  delete from public.group_invitations where id = inv.id;
  return gid;
end;
$$;

-- RPC : premier group_id de l'utilisateur connecté.
create or replace function public.get_my_group_id()
returns uuid
language plpgsql
security definer
set search_path = ''
stable
as $$
declare
  gid uuid;
begin
  select ug.group_id into gid
  from public.user_groups ug
  where ug.user_id = auth.uid()
  limit 1;
  return gid;
end;
$$;

-- RPC : rôle de l'utilisateur connecté dans son groupe (premier groupe).
create or replace function public.get_my_group_role()
returns text
language plpgsql
security definer
set search_path = ''
stable
as $$
declare
  r text;
begin
  select ug.role into r
  from public.user_groups ug
  where ug.user_id = auth.uid()
  limit 1;
  return coalesce(r, 'admin');
end;
$$;

-- RPC : liste des membres du groupe (user_id, role) pour les membres du groupe.
create or replace function public.get_group_members(p_group_id uuid)
returns table (user_id uuid, role text)
language plpgsql
security definer
set search_path = ''
stable
as $$
begin
  if not exists (
    select 1 from public.user_groups ug
    where ug.group_id = p_group_id and ug.user_id = auth.uid()
  ) then
    return;
  end if;
  return query
  select ug.user_id, ug.role
  from public.user_groups ug
  where ug.group_id = p_group_id;
end;
$$;
