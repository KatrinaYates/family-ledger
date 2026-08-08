create table public.household_invitations (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  email text not null,
  token_digest text not null unique,
  invited_by uuid not null references auth.users(id) on delete cascade,
  expires_at timestamptz not null default (now() + interval '7 days'),
  accepted_at timestamptz,
  accepted_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  constraint household_invitations_email_normalized check (email = lower(trim(email)))
);

create index household_invitations_household_idx on public.household_invitations(household_id);
create index household_invitations_email_idx on public.household_invitations(email);
create index household_invitations_invited_by_idx on public.household_invitations(invited_by);

alter table public.household_invitations enable row level security;
revoke all on public.household_invitations from anon, authenticated;
grant select, delete on public.household_invitations to authenticated;

create policy "owners can read household invitations"
on public.household_invitations for select
to authenticated
using ((select private.is_household_owner(household_id)));

create policy "owners can delete household invitations"
on public.household_invitations for delete
to authenticated
using ((select private.is_household_owner(household_id)));

create or replace function public.create_household_invitation(
  target_household_id uuid,
  invite_email text
)
returns table(invitation_id uuid, invitation_token text, expires_at timestamptz)
language plpgsql
security definer
set search_path = ''
as $$
declare
  normalized_email text;
  raw_token text;
  new_id uuid;
  expiry timestamptz;
begin
  if (select auth.uid()) is null then
    raise exception 'Authentication required';
  end if;
  if not private.is_household_owner(target_household_id) then
    raise exception 'Only household owners can invite members';
  end if;

  normalized_email := lower(trim(invite_email));
  if normalized_email = '' or position('@' in normalized_email) < 2 then
    raise exception 'A valid email address is required';
  end if;

  raw_token := gen_random_uuid()::text || gen_random_uuid()::text;
  expiry := now() + interval '7 days';

  delete from public.household_invitations
  where household_id = target_household_id
    and email = normalized_email
    and accepted_at is null;

  insert into public.household_invitations(
    household_id, email, token_digest, invited_by, expires_at
  ) values (
    target_household_id,
    normalized_email,
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
  current_email text;
  invite public.household_invitations%rowtype;
begin
  current_user_id := (select auth.uid());
  if current_user_id is null then
    raise exception 'Authentication required';
  end if;

  select lower(trim(email)) into current_email
  from auth.users
  where id = current_user_id;

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
  if current_email is null or current_email <> invite.email then
    raise exception 'Sign in with the email address this invitation was sent to';
  end if;

  insert into public.household_members(household_id, user_id, role)
  values (invite.household_id, current_user_id, 'member')
  on conflict (household_id, user_id) do nothing;

  update public.household_invitations
  set accepted_at = now(), accepted_by = current_user_id
  where id = invite.id;

  return invite.household_id;
end;
$$;

revoke all on function public.create_household_invitation(uuid, text) from public, anon;
grant execute on function public.create_household_invitation(uuid, text) to authenticated;
revoke all on function public.accept_household_invitation(text) from public, anon;
grant execute on function public.accept_household_invitation(text) to authenticated;
