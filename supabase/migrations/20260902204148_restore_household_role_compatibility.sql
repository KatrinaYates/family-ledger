-- Keep the previous deployed frontend readable while GitHub Pages updates.
-- Household access remains equal; this value is compatibility metadata only.
alter table public.household_members
  add column role text;

update public.household_members
set role = 'owner';

alter table public.household_members
  alter column role set default 'member',
  alter column role set not null,
  add constraint household_members_role_check check (role in ('owner', 'member'));

notify pgrst, 'reload schema';
