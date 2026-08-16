create index if not exists household_invitations_accepted_by_idx
on public.household_invitations (accepted_by)
where accepted_by is not null;

alter policy "users can read their own household memberships"
on public.household_members
using (user_id = (select auth.uid()));
