create or replace function private.is_month_unlocked(
  target_household_id uuid,
  target_month_id text
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.ledger_months lm
    where lm.household_id = target_household_id
      and lm.month_id = target_month_id
      and coalesce(lm.workflow->>'status', 'draft') <> 'locked'
  );
$$;

drop policy if exists "members can insert meeting entries" on public.meeting_entries;
create policy "members can insert meeting entries"
on public.meeting_entries for insert
to authenticated
with check (
  (select private.is_household_member(household_id))
  and (select private.is_month_unlocked(household_id, month_id))
);

drop policy if exists "members can update meeting entries" on public.meeting_entries;
create policy "members can update meeting entries"
on public.meeting_entries for update
to authenticated
using (
  (select private.is_household_member(household_id))
  and (select private.is_month_unlocked(household_id, month_id))
)
with check (
  (select private.is_household_member(household_id))
  and (select private.is_month_unlocked(household_id, month_id))
);

drop policy if exists "members can delete meeting entries" on public.meeting_entries;
create policy "members can delete meeting entries"
on public.meeting_entries for delete
to authenticated
using (
  (select private.is_household_member(household_id))
  and (select private.is_month_unlocked(household_id, month_id))
);

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
       or new.generated_analysis is distinct from old.generated_analysis
       or new.meeting_data is distinct from old.meeting_data
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

drop trigger if exists protect_locked_ledger_month on public.ledger_months;
create trigger protect_locked_ledger_month
before update on public.ledger_months
for each row execute function private.protect_locked_ledger_month();
