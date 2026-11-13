// Scheduled price checks (runs from the Cron Trigger in wrangler.jsonc).
//
// Each run:
//   1. pauses alerts whose departure date has passed,
//   2. takes the alerts checked longest ago (a small batch),
//   3. fetches fares for each one and stores the result in `price_checks`,
//   4. records when the alert was checked.
//
// Batch size: the Workers Free plan allows 50 outgoing requests per run, and each
// alert needs 3 (flight data + save check + update alert), so 12 alerts fit safely.

import { mapOffers } from './offers'
import { alertToSearchRequest, buildErrorCheck, buildPriceCheck } from './price-check'
import {
  deactivatePastAlerts,
  getAlertsDueForCheck,
  insertPriceCheck,
  markAlertChecked,
  SupabaseError,
} from './supabase'
import { fetchPrices, UpstreamError } from './travelpayouts'

const BATCH_SIZE = 12
const CHECK_INTERVAL_HOURS = 6

export interface CheckSummary {
  checked: number
  success: number
  noResults: number
  errors: number
  stoppedEarly: boolean
}

export async function runPriceChecks(env: Env, now = new Date()): Promise<CheckSummary> {
  const config = { url: env.SUPABASE_URL, secretKey: env.SUPABASE_SECRET_KEY }
  const summary: CheckSummary = { checked: 0, success: 0, noResults: 0, errors: 0, stoppedEarly: false }

  const today = now.toISOString().slice(0, 10)
  await deactivatePastAlerts(config, today)

  const checkedBefore = new Date(now.getTime() - CHECK_INTERVAL_HOURS * 60 * 60 * 1000)
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

    await insertPriceCheck(config, row)
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
