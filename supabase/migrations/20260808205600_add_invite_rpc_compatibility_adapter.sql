create or replace function public.create_household_invitation(
  target_household_id uuid,
  invite_email text
)
returns table(invitation_id uuid, invitation_token text, expires_at timestamptz)
language sql
security definer
set search_path = ''
as $$
  select * from public.create_household_invitation(target_household_id);
$$;

revoke all on function public.create_household_invitation(uuid, text) from public, anon;
grant execute on function public.create_household_invitation(uuid, text) to authenticated;
