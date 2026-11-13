// Scheduled price checks (runs from the Cron Trigger in wrangler.jsonc).
//
// Each run:
//   1. pauses alerts whose departure date has passed,
//   2. takes the alerts checked longest ago (a small batch),
//   3. fetches fares for each one and stores the result in `price_checks`,
//   4. creates an in-app notification when the fare reaches the target,
//   5. records when the alert was checked.
//
// Batch size: the Workers Free plan allows 50 outgoing requests per run.
// Each alert needs up to 5 (flight data, save check, look up earlier
// notifications, create notification, update alert) plus 2 per run, so 9 fit.

import { mapOffers } from './offers'
import { alertToSearchRequest, buildErrorCheck, buildPriceCheck, shouldNotify } from './price-check'
import {
  deactivatePastAlerts,
  getAlertsDueForCheck,
  getLowestNotifiedPrice,
  insertInAppNotification,
  insertPriceCheck,
  markAlertChecked,
  SupabaseError,
} from './supabase'
import { fetchPrices, UpstreamError } from './travelpayouts'

const BATCH_SIZE = 9
const DEFAULT_CHECK_INTERVAL_HOURS = 6

export interface CheckSummary {
  checked: number
  success: number
  noResults: number
  errors: number
  notified: number
  stoppedEarly: boolean
}

export async function runPriceChecks(env: Env, now = new Date()): Promise<CheckSummary> {
  const config = { url: env.SUPABASE_URL, secretKey: env.SUPABASE_SECRET_KEY }
  const summary: CheckSummary = { checked: 0, success: 0, noResults: 0, errors: 0, notified: 0, stoppedEarly: false }

  const today = now.toISOString().slice(0, 10)
  await deactivatePastAlerts(config, today)

  // Can be lowered locally (PRICE_CHECK_INTERVAL_HOURS in .dev.vars) to test without waiting.
  const intervalHours = Number(env.PRICE_CHECK_INTERVAL_HOURS ?? DEFAULT_CHECK_INTERVAL_HOURS)
  const checkedBefore = new Date(now.getTime() - intervalHours * 60 * 60 * 1000)
  const alerts = await getAlertsDueForCheck(config, checkedBefore, BATCH_SIZE)

  for (const alert of alerts) {
    const request = alertToSearchRequest(alert)
    let row
    try {
      const rows = await fetchPrices(request, env.TRAVELPAYOUTS_TOKEN)
      const offers = mapOffers(rows, request, alert.currency, alert.flexible_days)
      row = buildPriceCheck(alert, offers)
    } catch (error) {
      // Flight data problems are recorded as errors — never as a price.
      const kind = error instanceof UpstreamError ? error.kind : 'internal'
      if (!(error instanceof UpstreamError)) console.error('Unexpected error checking alert', alert.id, error)
      row = buildErrorCheck(alert, kind)
      if (kind === 'rate_limited') summary.stoppedEarly = true
    }

    const priceCheckId = await insertPriceCheck(config, row)

    // Price drop: notify only for a real price at/below target that is a new low.
    if (row.status === 'success' && row.price <= Number(alert.target_price)) {
      const lowestNotified = await getLowestNotifiedPrice(config, alert.id)
      if (shouldNotify(row.price, Number(alert.target_price), lowestNotified)) {
        await insertInAppNotification(
          config,
          { user_id: alert.user_id, alert_id: alert.id, price_check_id: priceCheckId, price: row.price, currency: row.currency },
          now,
        )
        summary.notified++
      }
    }

    await markAlertChecked(config, alert.id, now)
    summary.checked++
    if (row.status === 'success') summary.success++
    else if (row.status === 'no_results') summary.noResults++
    else summary.errors++

    // The provider asked us to slow down: leave the rest for the next run.
    if (summary.stoppedEarly) break
  }

  return summary
}

export async function handleScheduled(env: Env): Promise<void> {
  if (!env.SUPABASE_SECRET_KEY || !env.TRAVELPAYOUTS_TOKEN || !env.SUPABASE_URL) {
    console.error('Price checks skipped: SUPABASE_URL, SUPABASE_SECRET_KEY or TRAVELPAYOUTS_TOKEN missing')
    return
  }
  try {
    const summary = await runPriceChecks(env)
    console.log('Price checks finished', JSON.stringify(summary))
  } catch (error) {
    if (error instanceof SupabaseError) console.error('Price checks failed:', error.message)
    else console.error('Price checks failed unexpectedly', error)
    throw error // marks this cron run as failed in Cloudflare's logs
  }
}
