-- Family Ledger core schema. Keep this migration free of personal financial data.
create extension if not exists pgcrypto;
create schema if not exists private;

create table public.households (
  id uuid primary key default gen_random_uuid(), name text not null,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.household_members (
  household_id uuid not null references public.households(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('owner','member')) default 'member',
  created_at timestamptz not null default now(), primary key (household_id,user_id)
);
create table public.ledger_months (
  id uuid primary key default gen_random_uuid(), household_id uuid not null references public.households(id) on delete cascade,
  month_id text not null check (month_id ~ '^\d{4}-(0[1-9]|1[0-2])$'), schema_version integer not null default 1,
  version integer not null default 1 check (version > 0), workflow jsonb not null default '{}'::jsonb,
  generation jsonb not null default '{}'::jsonb,
  data_quality jsonb not null default '{"staleConnections":[],"missingAccounts":[],"warnings":[]}'::jsonb,
  source_data jsonb not null default '{}'::jsonb, generated_analysis jsonb not null default '{}'::jsonb,
  meeting_data jsonb not null default '{}'::jsonb, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique (household_id,month_id)
);
create table public.meeting_entries (
  id uuid primary key default gen_random_uuid(), household_id uuid not null references public.households(id) on delete cascade,
  month_id text not null check (month_id ~ '^\d{4}-(0[1-9]|1[0-2])$'), entry_key text not null, value jsonb not null default 'null'::jsonb,
  created_by uuid references auth.users(id) on delete set null, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique (household_id,month_id,entry_key), foreign key (household_id,month_id) references public.ledger_months(household_id,month_id) on delete cascade
);
create table public.ledger_entries (
  id uuid primary key default gen_random_uuid(), household_id uuid not null references public.households(id) on delete cascade,
  entry_key text not null, value jsonb not null default 'null'::jsonb, created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique (household_id,entry_key)
);
create table public.actions (
  id uuid primary key, household_id uuid not null references public.households(id) on delete cascade,
  origin_month_id text not null check (origin_month_id ~ '^\d{4}-(0[1-9]|1[0-2])$'),
  carried_to_month_id text check (carried_to_month_id is null or carried_to_month_id ~ '^\d{4}-(0[1-9]|1[0-2])$'),
  title text not null default '', owner text not null default '', due_date date,
  status text not null check (status in ('not_started','in_progress','done','deferred')) default 'not_started',
  priority text not null default 'normal', notes text not null default '', completed_at timestamptz,
  created_by uuid references auth.users(id) on delete set null, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create index household_members_user_idx on public.household_members(user_id);
create index ledger_months_household_idx on public.ledger_months(household_id,month_id);
create index meeting_entries_household_month_idx on public.meeting_entries(household_id,month_id);
create index ledger_entries_household_idx on public.ledger_entries(household_id);
create index actions_household_origin_idx on public.actions(household_id,origin_month_id);
create index actions_household_carried_idx on public.actions(household_id,carried_to_month_id);
create index actions_household_status_idx on public.actions(household_id,status);
create index actions_created_by_idx on public.actions(created_by);
create index households_created_by_idx on public.households(created_by);
create index meeting_entries_created_by_idx on public.meeting_entries(created_by);
create index ledger_entries_created_by_idx on public.ledger_entries(created_by);

create or replace function private.is_household_member(target_household_id uuid) returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.household_members hm where hm.household_id=target_household_id and hm.user_id=(select auth.uid()));
$$;
create or replace function private.is_household_owner(target_household_id uuid) returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.household_members hm where hm.household_id=target_household_id and hm.user_id=(select auth.uid()) and hm.role='owner');
$$;
create or replace function public.create_household(household_name text) returns uuid language plpgsql security definer set search_path='' as $$
declare new_household_id uuid;
begin
 if (select auth.uid()) is null then raise exception 'Authentication required'; end if;
 insert into public.households(name,created_by) values(household_name,(select auth.uid())) returning id into new_household_id;
 insert into public.household_members(household_id,user_id,role) values(new_household_id,(select auth.uid()),'owner');
 return new_household_id;
end; $$;

alter table public.households enable row level security;
alter table public.household_members enable row level security;
alter table public.ledger_months enable row level security;
alter table public.meeting_entries enable row level security;
alter table public.ledger_entries enable row level security;
alter table public.actions enable row level security;

revoke all on public.households, public.household_members, public.ledger_months, public.meeting_entries, public.ledger_entries, public.actions from anon, authenticated;
grant select,update on public.households to authenticated;
grant select on public.household_members to authenticated;
grant select,insert,update,delete on public.ledger_months, public.meeting_entries, public.ledger_entries, public.actions to authenticated;
revoke all on function public.create_household(text) from public,anon;
grant execute on function public.create_household(text) to authenticated;

create policy "members can read households" on public.households for select to authenticated using ((select private.is_household_member(id)));
create policy "owners can update households" on public.households for update to authenticated using ((select private.is_household_owner(id))) with check ((select private.is_household_owner(id)));
create policy "members can read household members" on public.household_members for select to authenticated using ((select private.is_household_member(household_id)));

create policy "members can read ledger months" on public.ledger_months for select to authenticated using ((select private.is_household_member(household_id)));
create policy "members can insert ledger months" on public.ledger_months for insert to authenticated with check ((select private.is_household_member(household_id)));
create policy "members can update ledger months" on public.ledger_months for update to authenticated using ((select private.is_household_member(household_id))) with check ((select private.is_household_member(household_id)));
create policy "members can delete ledger months" on public.ledger_months for delete to authenticated using ((select private.is_household_member(household_id)));

create policy "members can read meeting entries" on public.meeting_entries for select to authenticated using ((select private.is_household_member(household_id)));
create policy "members can insert meeting entries" on public.meeting_entries for insert to authenticated with check ((select private.is_household_member(household_id)));
create policy "members can update meeting entries" on public.meeting_entries for update to authenticated using ((select private.is_household_member(household_id))) with check ((select private.is_household_member(household_id)));
create policy "members can delete meeting entries" on public.meeting_entries for delete to authenticated using ((select private.is_household_member(household_id)));

create policy "members can read ledger entries" on public.ledger_entries for select to authenticated using ((select private.is_household_member(household_id)));
create policy "members can insert ledger entries" on public.ledger_entries for insert to authenticated with check ((select private.is_household_member(household_id)));
create policy "members can update ledger entries" on public.ledger_entries for update to authenticated using ((select private.is_household_member(household_id))) with check ((select private.is_household_member(household_id)));
create policy "members can delete ledger entries" on public.ledger_entries for delete to authenticated using ((select private.is_household_member(household_id)));

create policy "members can read actions" on public.actions for select to authenticated using ((select private.is_household_member(household_id)));
create policy "members can insert actions" on public.actions for insert to authenticated with check ((select private.is_household_member(household_id)));
create policy "members can update actions" on public.actions for update to authenticated using ((select private.is_household_member(household_id))) with check ((select private.is_household_member(household_id)));
create policy "members can delete actions" on public.actions for delete to authenticated using ((select private.is_household_member(household_id)));

-- The project-level auto-RLS event trigger function should never be callable through the Data API.
revoke all on function public.rls_auto_enable() from public,anon,authenticated;
