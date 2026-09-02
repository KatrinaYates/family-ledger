-- Family Ledger uses equal-access households. The role column remains for backwards
-- compatibility, but every participant is treated as an owner internally.
update public.household_members
set role = 'owner'
where role <> 'owner';

-- Invitations are now bearer links: no email is required or checked.
alter table public.household_invitations
  alter column email drop not null;

drop function if exists public.create_household_invitation(uuid, text);

create or replace function public.create_household_invitation(
  target_household_id uuid
)
returns table(invitation_id uuid, invitation_token text, expires_at timestamptz)
language plpgsql
security definer
set search_path = ''
as $$
declare
  raw_token text;
  new_id uuid;
  expiry timestamptz;
begin
  if (select auth.uid()) is null then
    raise exception 'Authentication required';
  end if;
  if not private.is_household_owner(target_household_id) then
    raise exception 'Only household participants can create invite links';
  end if;

  raw_token := gen_random_uuid()::text || gen_random_uuid()::text;
  expiry := now() + interval '7 days';

  insert into public.household_invitations(
    household_id, email, token_digest, invited_by, expires_at
  ) values (
    target_household_id,
    null,
    encode(extensions.digest(raw_token, 'sha256'), 'hex'),
    (select auth.uid()),
    expiry
  ) returning id into new_id;

  return query select new_id, raw_token, expiry;
end;
$$;

create or replace function public.accept_household_invitation(invitation_token text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid;
  invite public.household_invitations%rowtype;
begin
  current_user_id := (select auth.uid());
  if current_user_id is null then
    raise exception 'Authentication required';
  end if;

  select * into invite
  from public.household_invitations
  where token_digest = encode(extensions.digest(invitation_token, 'sha256'), 'hex')
  for update;

  if invite.id is null then
    raise exception 'Invitation not found';
  end if;
  if invite.accepted_at is not null then
    raise exception 'Invitation has already been accepted';
  end if;
  if invite.expires_at <= now() then
    raise exception 'Invitation has expired';
  end if;

  insert into public.household_members(household_id, user_id, role)
  values (invite.household_id, current_user_id, 'owner')
  on conflict (household_id, user_id)
  do update set role = 'owner';

  update public.household_invitations
  set accepted_at = now(), accepted_by = current_user_id
  where id = invite.id;

  return invite.household_id;
end;
$$;

revoke all on function public.create_household_invitation(uuid) from public, anon;
grant execute on function public.create_household_invitation(uuid) to authenticated;
revoke all on function public.accept_household_invitation(text) from public, anon;
grant execute on function public.accept_household_invitation(text) to authenticated;
