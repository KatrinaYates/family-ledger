create or replace function public.remove_household_member(
  target_household_id uuid,
  target_user_id uuid
)
returns void
language plpgsql
security definer
set search_path = ''
as $function$
declare
  current_user_id uuid;
begin
  current_user_id := (select auth.uid());

  if current_user_id is null then
    raise exception 'Authentication required';
  end if;

  if not private.is_household_owner(target_household_id) then
    raise exception 'You do not have permission to manage this household';
  end if;

  if target_user_id = current_user_id then
    raise exception 'You cannot remove yourself from the household';
  end if;

  if not exists (
    select 1
    from public.household_members hm
    where hm.household_id = target_household_id
      and hm.user_id = target_user_id
  ) then
    raise exception 'Household member not found';
  end if;

  delete from public.household_members
  where household_id = target_household_id
    and user_id = target_user_id;
end;
$function$;

revoke all on function public.remove_household_member(uuid, uuid) from public;
grant execute on function public.remove_household_member(uuid, uuid) to authenticated;
