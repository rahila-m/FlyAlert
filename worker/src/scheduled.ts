// Scheduled price checks (runs from the Cron Trigger in wrangler.jsonc).
//
// Each run:
//   1. pauses alerts whose departure date has passed,
//   2. takes the alerts checked longest ago (a small batch),
//   3. fetches fares for each one and stores the result in `price_checks`,
//   4. creates an in-app notification when the fare reaches the target,
//   5. records when the alert was checked.
//
// Request budget: the Workers Free plan allows 50 outgoing requests per run.
// Each alert needs up to 5 (flight data, save check, look up earlier
// notifications, create notification, update alert), plus up to 7 more when a
// phone notification is sent (find devices, send to up to 3, clean up).
// We count what we really use and stop early (the rest waits for the next
// hourly run) before an alert could push us over the limit.

import { mapOffers, withAffiliateMarker } from './offers'
import { getVapidKeys, MAX_PUSH_REQUESTS, notifyDevices, priceDropMessage } from './push-notify'
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
const SUBREQUEST_LIMIT = 50
const WORST_CASE_PER_ALERT = 5 + MAX_PUSH_REQUESTS
const DEFAULT_CHECK_INTERVAL_HOURS = 6

export interface CheckSummary {
  checked: number
  success: number
  noResults: number
  errors: number
  notified: number
  pushed: number // phone/browser notifications delivered
  stoppedEarly: boolean
}

export async function runPriceChecks(env: Env, now = new Date()): Promise<CheckSummary> {
  const config = { url: env.SUPABASE_URL, secretKey: env.SUPABASE_SECRET_KEY }
  const summary: CheckSummary = { checked: 0, success: 0, noResults: 0, errors: 0, notified: 0, pushed: 0, stoppedEarly: false }
  const vapidKeys = getVapidKeys(env)
  let requests = 2 // the two queries below

  const today = now.toISOString().slice(0, 10)
  await deactivatePastAlerts(config, today)

  // Can be lowered locally (PRICE_CHECK_INTERVAL_HOURS in .dev.vars) to test without waiting.
  const intervalHours = Number(env.PRICE_CHECK_INTERVAL_HOURS ?? DEFAULT_CHECK_INTERVAL_HOURS)
  const checkedBefore = new Date(now.getTime() - intervalHours * 60 * 60 * 1000)
  const alerts = await getAlertsDueForCheck(config, checkedBefore, BATCH_SIZE)

  for (const alert of alerts) {
    if (requests + WORST_CASE_PER_ALERT > SUBREQUEST_LIMIT) {
      summary.stoppedEarly = true
      break
    }
    requests += 3 // flight data, save check, update alert
    const request = alertToSearchRequest(alert)
    let row
    try {
      const rows = await fetchPrices(request, env.TRAVELPAYOUTS_TOKEN)
      const offers = mapOffers(rows, request, alert.currency, alert.flexible_days).map((offer) => ({
        ...offer,
        bookingUrl: withAffiliateMarker(offer.bookingUrl, env.TRAVELPAYOUTS_MARKER),
      }))
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
      requests++
      if (shouldNotify(row.price, Number(alert.target_price), lowestNotified)) {
        await insertInAppNotification(
          config,
          { user_id: alert.user_id, alert_id: alert.id, price_check_id: priceCheckId, price: row.price, currency: row.currency },
          now,
        )
        requests++
        summary.notified++

        // Also to the user's phone/computer, if they turned that on.
        if (vapidKeys) {
          const drop = {
            alertId: alert.id,
            origin: alert.origin_iata,
            destination: alert.destination_iata,
            price: row.price,
            targetPrice: Number(alert.target_price),
            currency: row.currency,
          }
          try {
            const push = await notifyDevices(config, vapidKeys, alert.user_id, (language) => priceDropMessage(drop, language))
            requests += push.requests
            summary.pushed += push.delivered
          } catch (error) {
            // The in-app notification is already saved; a push problem must not stop the run.
            requests += MAX_PUSH_REQUESTS
            console.warn('Push notification failed', error)
          }
        }
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
