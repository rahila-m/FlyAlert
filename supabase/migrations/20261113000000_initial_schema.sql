-- =============================================================================
-- FlyAlert: initial database schema
-- =============================================================================
-- How to run: Supabase Dashboard → SQL Editor → New query → paste → Run.
-- Run it only once. Everything is inside a transaction: if any statement fails,
-- nothing is created and the database stays unchanged.
--
-- Tables
--   profiles       one row per user (settings + limits)
--   flight_alerts  a route + dates the user wants to track, with a target price
--   price_checks   one row per scheduled price check (successful OR failed)
--   notifications  price drop notifications (email and in-app)
--
-- Security model
--   • Row Level Security (RLS) is enabled on every table.
--   • Logged-in users can only see and change their OWN rows.
--   • Anonymous visitors get no access at all.
--   • Only the backend (service role key, never in the frontend) can write
--     price_checks and notifications, or change limits like max_active_alerts.
-- =============================================================================

begin;

-- -----------------------------------------------------------------------------
-- Helper: keep updated_at current on every UPDATE
-- -----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- -----------------------------------------------------------------------------
-- profiles
-- -----------------------------------------------------------------------------
-- The email address is NOT copied here: Supabase Auth (auth.users) already
-- stores it, and a second copy could get out of sync when a user changes it.
create table public.profiles (
  id                 uuid primary key references auth.users (id) on delete cascade,
  preferred_currency char(3) not null default 'USD'
                     check (preferred_currency ~ '^[A-Z]{3}$'),
  preferred_language text not null default 'en'
                     check (preferred_language in ('en', 'tr')),
  -- Per-user tracking limit. Users cannot change this (see grants below).
  max_active_alerts  smallint not null default 5
                     check (max_active_alerts between 0 and 100),
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Create a profile automatically when someone signs up.
-- SECURITY DEFINER lets this function insert into profiles even though the new
-- user has no session yet. search_path = '' prevents search-path attacks.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end;
$$;

revoke execute on function public.handle_new_user() from public, anon, authenticated;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- -----------------------------------------------------------------------------
-- flight_alerts
-- -----------------------------------------------------------------------------
-- An alert tracks a ROUTE + DATES (not one specific offer, because offer IDs
-- from flight APIs change all the time). Each check stores the cheapest
-- matching offer in price_checks.
create table public.flight_alerts (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null default auth.uid()
                   references public.profiles (id) on delete cascade,
  origin_iata      char(3) not null check (origin_iata ~ '^[A-Z]{3}$'),
  destination_iata char(3) not null check (destination_iata ~ '^[A-Z]{3}$'),
  trip_type        text not null check (trip_type in ('one-way', 'round-trip')),
  departure_date   date not null,
  return_date      date,
  adults           smallint not null default 1 check (adults between 1 and 9),
  travel_class     text not null default 'ECONOMY'
                   check (travel_class in ('ECONOMY', 'PREMIUM_ECONOMY', 'BUSINESS', 'FIRST')),
  target_price     numeric(10, 2) not null check (target_price > 0),
  currency         char(3) not null check (currency ~ '^[A-Z]{3}$'),
  is_active        boolean not null default true,
  last_checked_at  timestamptz, -- set by the backend scheduler
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),

  constraint flight_alerts_different_airports
    check (origin_iata <> destination_iata),
  constraint flight_alerts_return_date_matches_trip_type check (
    (trip_type = 'one-way' and return_date is null)
    or (trip_type = 'round-trip' and return_date is not null and return_date >= departure_date)
  )
);

-- Dashboard: "my alerts, newest first"
create index flight_alerts_user_created_idx
  on public.flight_alerts (user_id, created_at desc);

-- Scheduler: "active alerts that were checked longest ago"
create index flight_alerts_due_for_check_idx
  on public.flight_alerts (last_checked_at nulls first)
  where is_active;

create trigger flight_alerts_set_updated_at
  before update on public.flight_alerts
  for each row execute function public.set_updated_at();

-- Enforce the per-user limit of ACTIVE alerts (inserting, or re-activating).
create or replace function public.enforce_active_alert_limit()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  max_allowed  smallint;
  active_count integer;
begin
  if new.is_active and (tg_op = 'INSERT' or not old.is_active) then
    select max_active_alerts into max_allowed
      from public.profiles
     where id = new.user_id;

    select count(*) into active_count
      from public.flight_alerts
     where user_id = new.user_id
       and is_active;

    if active_count >= coalesce(max_allowed, 0) then
      raise exception 'You can have at most % active price alerts.', coalesce(max_allowed, 0)
        using errcode = 'P0001', hint = 'alert_limit_reached';
    end if;
  end if;
  return new;
end;
$$;

create trigger flight_alerts_enforce_active_limit
  before insert or update of is_active on public.flight_alerts
  for each row execute function public.enforce_active_alert_limit();

-- -----------------------------------------------------------------------------
-- price_checks  (replaces the separate flight_offers + price_history tables)
-- -----------------------------------------------------------------------------
-- One row per check attempt. Failed checks are stored too (for monitoring),
-- but constraints guarantee that ONLY successful checks can contain a price,
-- so an API error can never be shown on a chart as if it were a real price.
create table public.price_checks (
  id                    uuid primary key default gen_random_uuid(),
  alert_id              uuid not null references public.flight_alerts (id) on delete cascade,
  checked_at            timestamptz not null default now(),
  status                text not null check (status in ('success', 'no_results', 'error')),
  -- 'demo' rows come from generated test data and must never be presented as real prices.
  data_source           text not null check (data_source in ('api', 'demo')),
  provider              text,

  -- Cheapest matching offer (successful checks only)
  price                 numeric(10, 2) check (price > 0),
  currency              char(3) check (currency ~ '^[A-Z]{3}$'),
  airline               text,
  stops                 smallint check (stops >= 0),
  outbound_departure_at timestamp, -- local airport time, no time zone
  provider_offer_id     text,
  booking_url           text check (booking_url ~ '^https://'),
  offer_count           integer check (offer_count >= 0),

  error_code            text, -- e.g. 'rate_limited', 'timeout' (errors only)

  constraint price_checks_price_only_on_success check (
    (status = 'success' and price is not null and currency is not null)
    or (status <> 'success' and price is null and currency is null)
  ),
  constraint price_checks_error_code_only_on_error
    check ((status = 'error') = (error_code is not null))
);

-- Price history chart: "checks for this alert, in time order"
create index price_checks_alert_checked_idx
  on public.price_checks (alert_id, checked_at desc);

-- -----------------------------------------------------------------------------
-- notifications  (replaces notification_logs; also used for in-app messages)
-- -----------------------------------------------------------------------------
create table public.notifications (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references public.profiles (id) on delete cascade,
  alert_id       uuid references public.flight_alerts (id) on delete set null,
  price_check_id uuid references public.price_checks (id) on delete set null,
  type           text not null default 'price_drop' check (type in ('price_drop')),
  channel        text not null check (channel in ('email', 'in_app')),
  price          numeric(10, 2) not null check (price > 0),
  currency       char(3) not null check (currency ~ '^[A-Z]{3}$'),
  status         text not null default 'pending' check (status in ('pending', 'sent', 'failed')),
  read_at        timestamptz, -- in-app only; set when the user opens it
  created_at     timestamptz not null default now(),
  sent_at        timestamptz
);

-- Safety net against duplicate alerts: the same alert can't notify twice on
-- the same channel for the exact same price.
create unique index notifications_no_duplicate_price_idx
  on public.notifications (alert_id, channel, price, currency)
  where alert_id is not null;

create index notifications_user_created_idx
  on public.notifications (user_id, created_at desc);

create index notifications_unread_idx
  on public.notifications (user_id)
  where channel = 'in_app' and read_at is null;

-- -----------------------------------------------------------------------------
-- Row Level Security
-- -----------------------------------------------------------------------------
-- (select auth.uid()) is wrapped in a sub-select so Postgres evaluates it once
-- per query instead of once per row (recommended by Supabase for performance).

alter table public.profiles      enable row level security;
alter table public.flight_alerts enable row level security;
alter table public.price_checks  enable row level security;
alter table public.notifications enable row level security;

-- profiles
create policy "Users can view their own profile"
  on public.profiles for select to authenticated
  using ((select auth.uid()) = id);

create policy "Users can update their own profile"
  on public.profiles for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- flight_alerts
create policy "Users can view their own alerts"
  on public.flight_alerts for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can create their own alerts"
  on public.flight_alerts for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update their own alerts"
  on public.flight_alerts for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete their own alerts"
  on public.flight_alerts for delete to authenticated
  using ((select auth.uid()) = user_id);

-- price_checks: read-only for users, and only for their own alerts
create policy "Users can view checks of their own alerts"
  on public.price_checks for select to authenticated
  using (
    exists (
      select 1
        from public.flight_alerts a
       where a.id = price_checks.alert_id
         and a.user_id = (select auth.uid())
    )
  );

-- notifications
create policy "Users can view their own notifications"
  on public.notifications for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can mark their own notifications as read"
  on public.notifications for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- -----------------------------------------------------------------------------
-- Table and column privileges
-- -----------------------------------------------------------------------------
-- RLS decides WHICH ROWS a user can touch; grants decide WHICH COLUMNS and
-- operations are allowed at all. Start from zero, then allow only what's needed.
revoke all on public.profiles, public.flight_alerts, public.price_checks, public.notifications
  from anon, authenticated;

-- profiles: read own row; change only preferences (not limits)
grant select on public.profiles to authenticated;
grant update (preferred_currency, preferred_language) on public.profiles to authenticated;

-- flight_alerts: full control of own alerts, except backend-managed columns.
-- Route and dates can't be edited (old price history would no longer match);
-- the user creates a new alert instead.
grant select, delete on public.flight_alerts to authenticated;
grant insert (
  origin_iata, destination_iata, trip_type, departure_date, return_date,
  adults, travel_class, target_price, currency, is_active
) on public.flight_alerts to authenticated;
grant update (target_price, is_active) on public.flight_alerts to authenticated;

-- price_checks: read only (written by the backend)
grant select on public.price_checks to authenticated;

-- notifications: read, and mark as read
grant select on public.notifications to authenticated;
grant update (read_at) on public.notifications to authenticated;

-- Backend (service role): full access. This role bypasses RLS and its key is
-- only ever stored as a secret on the server (Cloudflare Workers).
grant all on public.profiles, public.flight_alerts, public.price_checks, public.notifications
  to service_role;

commit;
