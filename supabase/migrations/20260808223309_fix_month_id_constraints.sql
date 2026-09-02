alter table public.ledger_months
  drop constraint if exists ledger_months_month_id_check,
  add constraint ledger_months_month_id_check
    check (month_id ~ '^[0-9]{4}-(0[1-9]|1[0-2])$');

alter table public.meeting_entries
  drop constraint if exists meeting_entries_month_id_check,
  add constraint meeting_entries_month_id_check
    check (month_id ~ '^[0-9]{4}-(0[1-9]|1[0-2])$');

alter table public.actions
  drop constraint if exists actions_origin_month_id_check,
  add constraint actions_origin_month_id_check
    check (origin_month_id ~ '^[0-9]{4}-(0[1-9]|1[0-2])$'),
  drop constraint if exists actions_carried_to_month_id_check,
  add constraint actions_carried_to_month_id_check
    check (
      carried_to_month_id is null
      or carried_to_month_id ~ '^[0-9]{4}-(0[1-9]|1[0-2])$'
    );
