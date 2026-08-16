create or replace function public.list_household_members(target_household_id uuid)
returns table (
  user_id uuid,
  email text,
  display_name text,
  joined_at timestamptz
)
language plpgsql
stable
security definer
set search_path = ''
as $function$
begin
  if (select auth.uid()) is null then
    raise exception 'Authentication required';
  end if;

  if not private.is_household_member(target_household_id) then
    raise exception 'You do not have access to this household';
  end if;

  return query
  select
    hm.user_id,
    u.email::text,
    coalesce(
      nullif(trim(u.raw_user_meta_data ->> 'full_name'), ''),
      nullif(trim(u.raw_user_meta_data ->> 'name'), ''),
      nullif(split_part(u.email, '@', 1), ''),
      'Household member'
    )::text as display_name,
    hm.created_at as joined_at
  from public.household_members hm
  join auth.users u on u.id = hm.user_id
  where hm.household_id = target_household_id
  order by hm.created_at, hm.user_id;
end;
$function$;

revoke all on function public.list_household_members(uuid) from public;
grant execute on function public.list_household_members(uuid) to authenticated;
