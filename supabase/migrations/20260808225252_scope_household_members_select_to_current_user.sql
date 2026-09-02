drop policy if exists "members can read household members" on public.household_members;

create policy "users can read their own household memberships"
on public.household_members for select
to authenticated
using (user_id = (select auth.uid()));
