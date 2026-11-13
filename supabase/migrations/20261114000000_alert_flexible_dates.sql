-- =============================================================================
-- FlyAlert: flexible dates for price alerts
-- =============================================================================
-- Our fare data comes from recent traveler searches, so exact dates often have
-- no fare. An alert can now also watch a few days before/after its dates.
--
-- How to run: Supabase Dashboard → SQL Editor → New query → paste → Run (once).
-- =============================================================================

begin;

-- 0 = exact dates only, 1–3 = also up to N days before/after the chosen dates.
alter table public.flight_alerts
  add column flexible_days smallint not null default 0
  check (flexible_days between 0 and 3);

-- With flexible dates the cheapest fare may be on another day, so store the
-- actual return departure too (outbound_departure_at already exists).
alter table public.price_checks
  add column return_departure_at timestamp; -- local airport time, no time zone

-- Users may choose flexible_days when creating an alert (not change it later).
grant insert (flexible_days) on public.flight_alerts to authenticated;

commit;
