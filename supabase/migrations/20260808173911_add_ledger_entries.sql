create table public.ledger_entries (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  entry_key text not null,
  value jsonb not null default 'null'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (household_id, entry_key)
);
create index ledger_entries_household_idx on public.ledger_entries(household_id);
create index ledger_entries_created_by_idx on public.ledger_entries(created_by);
alter table public.ledger_entries enable row level security;
revoke all on public.ledger_entries from anon, authenticated;
grant select, insert, update, delete on public.ledger_entries to authenticated;
create policy "members can read ledger entries" on public.ledger_entries for select to authenticated using ((select private.is_household_member(household_id)));
create policy "members can insert ledger entries" on public.ledger_entries for insert to authenticated with check ((select private.is_household_member(household_id)));
create policy "members can update ledger entries" on public.ledger_entries for update to authenticated using ((select private.is_household_member(household_id))) with check ((select private.is_household_member(household_id)));
create policy "members can delete ledger entries" on public.ledger_entries for delete to authenticated using ((select private.is_household_member(household_id)));
