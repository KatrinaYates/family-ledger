-- Keep the lock trigger aligned with the canonical ledger_months columns.
create or replace function private.protect_locked_ledger_month()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if coalesce(old.workflow->>'status', 'draft') = 'locked' then
    if new.schema_version is distinct from old.schema_version
       or new.source_data is distinct from old.source_data
       or new.generation is distinct from old.generation
       or new.data_quality is distinct from old.data_quality
       or new.month_id is distinct from old.month_id
       or new.household_id is distinct from old.household_id then
      raise exception 'Locked month content cannot be changed. Unlock the month first.'
        using errcode = '55000';
    end if;
  end if;
  return new;
end;
$$;

-- Equal-access households do not need a role column or owner-only helper.
drop policy if exists "owners can update households" on public.households;
create policy "members can update households"
on public.households for update
to authenticated
using ((select private.is_household_member(id)))
with check ((select private.is_household_member(id)));

drop policy if exists "owners can read household invitations" on public.household_invitations;
create policy "members can read household invitations"
on public.household_invitations for select
to authenticated
using ((select private.is_household_member(household_id)));

drop policy if exists "owners can delete household invitations" on public.household_invitations;
create policy "members can delete household invitations"
on public.household_invitations for delete
to authenticated
using ((select private.is_household_member(household_id)));

create or replace function public.create_household(household_name text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  new_household_id uuid;
begin
  if (select auth.uid()) is null then
    raise exception 'Authentication required';
  end if;

  insert into public.households(name, created_by)
  values (household_name, (select auth.uid()))
  returning id into new_household_id;

  insert into public.household_members(household_id, user_id)
  values (new_household_id, (select auth.uid()));

  return new_household_id;
end;
$$;

create or replace function public.create_household_invitation(target_household_id uuid)
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
  if not private.is_household_member(target_household_id) then
    raise exception 'You do not have access to this household';
  end if;

  delete from public.household_invitations
  where household_id = target_household_id
    and expires_at <= now();

  raw_token := gen_random_uuid()::text || gen_random_uuid()::text;
  expiry := now() + interval '7 days';

  insert into public.household_invitations(
    household_id, token_digest, invited_by, expires_at
  ) values (
    target_household_id,
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
  invite_id uuid;
  invite_household_id uuid;
  invite_expires_at timestamptz;
begin
  current_user_id := (select auth.uid());
  if current_user_id is null then
    raise exception 'Authentication required';
  end if;

  select id, household_id, expires_at
  into invite_id, invite_household_id, invite_expires_at
  from public.household_invitations
  where token_digest = encode(extensions.digest(invitation_token, 'sha256'), 'hex')
  for update;

  if invite_id is null then
    raise exception 'Invitation not found';
  end if;
  if invite_expires_at <= now() then
    delete from public.household_invitations where id = invite_id;
    raise exception 'Invitation has expired';
  end if;

  insert into public.household_members(household_id, user_id)
  values (invite_household_id, current_user_id)
  on conflict (household_id, user_id) do nothing;

  delete from public.household_invitations where id = invite_id;
  return invite_household_id;
end;
$$;

revoke all on function public.create_household(text) from public, anon;
grant execute on function public.create_household(text) to authenticated;
revoke all on function public.create_household_invitation(uuid) from public, anon;
grant execute on function public.create_household_invitation(uuid) to authenticated;
revoke all on function public.accept_household_invitation(text) from public, anon;
grant execute on function public.accept_household_invitation(text) to authenticated;

drop function if exists public.create_household_invitation(uuid, text);
drop function if exists private.is_household_owner(uuid);

-- Remove expired one-time links and blank placeholder months.
delete from public.household_invitations where expires_at <= now();

delete from public.ledger_months lm
where lm.month_id in ('2026-08', '2026-09', '2026-10', '2026-11', '2026-12')
  and lm.workflow->>'sourceAsOf' is null
  and coalesce(lm.source_data->'spending'->>'total', '—') = '—'
  and coalesce(jsonb_array_length(lm.source_data->'spending'->'transactions'), 0) = 0
  and not exists (
    select 1 from public.meeting_entries me
    where me.household_id = lm.household_id and me.month_id = lm.month_id
  )
  and not exists (
    select 1 from public.actions a
    where a.household_id = lm.household_id
      and (a.origin_month_id = lm.month_id or a.carried_to_month_id = lm.month_id)
  );

-- Remove legacy JSON keys that have no reader in the current application.
update public.ledger_months
set source_data = source_data
  #- '{meeting,prompts}'
  #- '{meeting,sections}'
  #- '{meeting,insight}'
  #- '{future,closingInsight}'
  #- '{future,retirement,goalNote}'
  #- '{spending,closingInsight}'
  #- '{spending,transactionScope}'
  #- '{spending,transactionTotal}'
  #- '{spending,transactionCount}'
  #- '{handoff,feedback}'
where month_id = '2026-07';

-- Drop storage columns that are duplicated, permanently empty, or unsupported by the UI.
alter table public.ledger_months
  drop column generated_analysis,
  drop column meeting_data;

alter table public.household_members
  drop column role;

alter table public.household_invitations
  drop column email,
  drop column accepted_at,
  drop column accepted_by;

alter table public.meeting_entries
  drop column created_by;

alter table public.ledger_entries
  drop column created_by;

alter table public.actions
  drop column priority,
  drop column notes,
  drop column created_by;

-- These indexes duplicate the left-most keys of existing unique indexes.
drop index if exists public.ledger_months_household_idx;
drop index if exists public.meeting_entries_household_month_idx;
drop index if exists public.ledger_entries_household_idx;
