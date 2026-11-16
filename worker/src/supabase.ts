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
    select:
      'id,user_id,target_price,origin_iata,destination_iata,departure_date,return_date,adults,currency,flexible_days',
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

// Saves a check and returns its id (used to link a notification to the check).
export async function insertPriceCheck(config: Config, row: PriceCheckRow): Promise<string> {
  const response = await request(config, 'price_checks?select=id', {
    method: 'POST',
    body: JSON.stringify(row),
    headers: { Prefer: 'return=representation' },
  })
  const [created] = (await response.json()) as { id: string }[]
  return created.id
}

// The lowest price we already sent an in-app notification for (or null).
export async function getLowestNotifiedPrice(config: Config, alertId: string): Promise<number | null> {
  const params = new URLSearchParams({
    select: 'price',
    alert_id: `eq.${alertId}`,
    channel: 'eq.in_app',
    order: 'price.asc',
    limit: '1',
  })
  const response = await request(config, `notifications?${params}`)
  const [row] = (await response.json()) as { price: number | string }[]
  return row ? Number(row.price) : null
}

export async function insertInAppNotification(
  config: Config,
  notification: { user_id: string; alert_id: string; price_check_id: string; price: number; currency: string },
  sentAt: Date,
): Promise<void> {
  await request(config, 'notifications', {
    method: 'POST',
    body: JSON.stringify({
      ...notification,
      type: 'price_drop',
      channel: 'in_app',
      status: 'sent', // in-app notifications are "delivered" as soon as they're stored
      sent_at: sentAt.toISOString(),
    }),
  })
}

export async function markAlertChecked(config: Config, alertId: string, at: Date): Promise<void> {
  const params = new URLSearchParams({ id: `eq.${alertId}` })
  await request(config, `flight_alerts?${params}`, {
    method: 'PATCH',
    body: JSON.stringify({ last_checked_at: at.toISOString() }),
  })
}

// ---- Phone / browser notifications (Web Push) -------------------------------

export interface StoredPushSubscription {
  id: string
  endpoint: string
  p256dh: string
  auth: string
  language: 'en' | 'tr'
}

// The user's devices that turned on notifications (newest first, at most `limit`).
export async function getPushSubscriptions(
  config: Config,
  userId: string,
  limit: number,
): Promise<StoredPushSubscription[]> {
  const params = new URLSearchParams({
    select: 'id,endpoint,p256dh,auth,language',
    user_id: `eq.${userId}`,
    order: 'created_at.desc',
    limit: String(limit),
  })
  const response = await request(config, `push_subscriptions?${params}`)
  return response.json()
}

// Removes a device whose browser said the subscription no longer exists.
export async function deletePushSubscription(config: Config, id: string): Promise<void> {
  const params = new URLSearchParams({ id: `eq.${id}` })
  await request(config, `push_subscriptions?${params}`, { method: 'DELETE' })
}

// Checks a user's login token with Supabase Auth and returns their user id.
// Used by endpoints a signed-in user calls directly (e.g. "send a test notification").
export async function getUserIdFromToken(config: Config, accessToken: string): Promise<string | null> {
  const response = await fetch(`${config.url}/auth/v1/user`, {
    headers: { apikey: config.secretKey, Authorization: `Bearer ${accessToken}` },
    signal: AbortSignal.timeout(8000),
  })
  if (!response.ok) return null
  const user = (await response.json()) as { id?: unknown }
  return typeof user.id === 'string' ? user.id : null
}

// Permanently deletes a user from Supabase Auth. Their profile, alerts, price
// history, notifications and notification devices are removed automatically
// by the database ("on delete cascade").
export async function deleteAuthUser(config: Config, userId: string): Promise<void> {
  const response = await fetch(`${config.url}/auth/v1/admin/users/${encodeURIComponent(userId)}`, {
    method: 'DELETE',
    headers: { apikey: config.secretKey, Authorization: `Bearer ${config.secretKey}` },
    signal: AbortSignal.timeout(8000),
  })
  if (!response.ok) {
    const body = await response.text().catch(() => '')
    throw new SupabaseError(`Supabase DELETE user failed: ${response.status} ${body.slice(0, 200)}`)
  }
}
