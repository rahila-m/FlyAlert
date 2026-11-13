// Minimal client for Supabase's REST API (PostgREST), used by the scheduler.
//
// It uses the SECRET key, which bypasses Row Level Security. To keep that power
// small, this file only exposes the exact operations the scheduler needs.

import type { AlertToCheck, PriceCheckRow } from './price-check'

export class SupabaseError extends Error {}

interface Config {
  url: string
  secretKey: string
}

async function request(config: Config, path: string, init: RequestInit = {}): Promise<Response> {
  const response = await fetch(`${config.url}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: config.secretKey,
      Authorization: `Bearer ${config.secretKey}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
      ...init.headers,
    },
    signal: AbortSignal.timeout(8000),
  })
  if (!response.ok) {
    // Never include the key; the body has Postgres' error message.
    const body = await response.text().catch(() => '')
    throw new SupabaseError(`Supabase ${init.method ?? 'GET'} ${path.split('?')[0]} failed: ${response.status} ${body.slice(0, 200)}`)
  }
  return response
}

// Active alerts whose last check is older than `checkedBefore` (or never checked),
// oldest first, at most `limit`.
export async function getAlertsDueForCheck(config: Config, checkedBefore: Date, limit: number) {
  const params = new URLSearchParams({
    select: 'id,origin_iata,destination_iata,departure_date,return_date,adults,currency,flexible_days',
    is_active: 'eq.true',
    or: `(last_checked_at.is.null,last_checked_at.lt.${checkedBefore.toISOString()})`,
    order: 'last_checked_at.asc.nullsfirst',
    limit: String(limit),
  })
  const response = await request(config, `flight_alerts?${params}`)
  return (await response.json()) as AlertToCheck[]
}

// Alerts whose departure date has passed can no longer be booked: pause them.
export async function deactivatePastAlerts(config: Config, today: string): Promise<void> {
  const params = new URLSearchParams({ is_active: 'eq.true', departure_date: `lt.${today}` })
  await request(config, `flight_alerts?${params}`, {
    method: 'PATCH',
    body: JSON.stringify({ is_active: false }),
  })
}

export async function insertPriceCheck(config: Config, row: PriceCheckRow): Promise<void> {
  await request(config, 'price_checks', { method: 'POST', body: JSON.stringify(row) })
}

export async function markAlertChecked(config: Config, alertId: string, at: Date): Promise<void> {
  const params = new URLSearchParams({ id: `eq.${alertId}` })
  await request(config, `flight_alerts?${params}`, {
    method: 'PATCH',
    body: JSON.stringify({ last_checked_at: at.toISOString() }),
  })
}
