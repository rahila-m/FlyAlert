// Daily exchange rates, used only to *display* an alert in the user's chosen
// currency (e.g. a TRY alert shown as ≈ AZN). Fares themselves always come
// from Travelpayouts in the alert's own currency.
//
// Source: ExchangeRate-API "Open Access" (free, no key, updated once a day).
// Terms: caching and commercial use are allowed; an attribution link
// ("Rates By Exchange Rate API") must be shown where the rates are used.
// https://www.exchangerate-api.com/docs/free

import { SUPPORTED_CURRENCIES } from './validation'

const RATES_URL = 'https://open.er-api.com/v6/latest/USD'
const CACHE_SECONDS = 6 * 60 * 60 // the source updates daily; we refresh at most every 6h
const CACHE_KEY = 'https://cache.flyalert.internal/rates?v=1'

export interface RatesBody {
  base: 'USD'
  rates: Record<string, number> // 1 USD = rates[code]
  updatedAt: string
  provider: 'exchangerate-api.com'
}

// Keeps only the currencies FlyAlert supports and rejects anything malformed.
export function pickRates(payload: unknown): Record<string, number> | null {
  if (!payload || typeof payload !== 'object') return null
  const { result, rates } = payload as { result?: unknown; rates?: unknown }
  if (result !== 'success' || !rates || typeof rates !== 'object') return null

  const picked: Record<string, number> = {}
  for (const code of SUPPORTED_CURRENCIES) {
    const value = (rates as Record<string, unknown>)[code]
    if (typeof value === 'number' && Number.isFinite(value) && value > 0) picked[code] = value
  }
  return picked.USD === 1 ? picked : null
}

export async function getRates(ctx: ExecutionContext): Promise<RatesBody | null> {
  const cache = caches.default
  const cacheKey = new Request(CACHE_KEY)
  const cached = await cache.match(cacheKey)
  if (cached) return cached.json()

  try {
    const response = await fetch(RATES_URL, { signal: AbortSignal.timeout(8000) })
    if (!response.ok) return null
    const payload = (await response.json()) as { time_last_update_utc?: string }
    const rates = pickRates(payload)
    if (!rates) return null

    const body: RatesBody = {
      base: 'USD',
      rates,
      updatedAt: payload.time_last_update_utc ?? new Date().toUTCString(),
      provider: 'exchangerate-api.com',
    }
    ctx.waitUntil(
      cache.put(
        cacheKey,
        new Response(JSON.stringify(body), {
          headers: { 'Content-Type': 'application/json', 'Cache-Control': `public, max-age=${CACHE_SECONDS}` },
        }),
      ),
    )
    return body
  } catch (error) {
    console.warn('Exchange rates unavailable', error)
    return null
  }
}
