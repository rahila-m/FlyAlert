// FlyAlert API (Cloudflare Worker)
//
// GET /api/health
// GET /api/flights/search?from=IST&to=LON&depart=2026-12-10&return=2026-12-17&adults=1&currency=USD
//
// The Travelpayouts token stays on the server; the browser never sees it.

import { errorResponse, getCorsHeaders, json } from './http'
import { mapOffers, NEARBY_WINDOW_DAYS } from './offers'
import { fetchPrices, UpstreamError } from './travelpayouts'
import { parseSearchRequest } from './validation'

const CACHE_SECONDS = 600 // identical searches within 10 minutes are served from cache

const UPSTREAM_ERRORS: Record<UpstreamError['kind'], { status: number; message: string }> = {
  rate_limited: { status: 503, message: 'Too many searches right now. Please try again in a minute.' },
  timeout: { status: 504, message: 'The flight data provider took too long to respond. Please try again.' },
  unavailable: { status: 502, message: 'The flight data provider is unavailable. Please try again later.' },
  bad_response: { status: 502, message: 'We received unexpected data from the flight provider.' },
}

async function handleSearch(request: Request, env: Env, ctx: ExecutionContext, cors: Record<string, string>) {
  const url = new URL(request.url)
  const today = new Date().toISOString().slice(0, 10)
  const parsed = parseSearchRequest(url.searchParams, today)
  if (!parsed.ok) {
    return errorResponse(400, 'invalid_request', 'Some search parameters are invalid.', cors, parsed.errors)
  }
  if (!env.TRAVELPAYOUTS_TOKEN) {
    console.error('TRAVELPAYOUTS_TOKEN is not configured')
    return errorResponse(500, 'not_configured', 'Flight search is not configured.', cors)
  }

  // Cache key: the normalized search (same search -> same key).
  const search = parsed.value
  const cacheKey = new Request(
    `https://cache.flyalert.internal/search?${new URLSearchParams({
      from: search.origin,
      to: search.destination,
      depart: search.departureDate,
      return: search.returnDate ?? '',
      currency: search.currency,
    })}`,
  )
  const cache = caches.default
  const cached = await cache.match(cacheKey)
  if (cached) {
    const body = await cached.json()
    return json(body, 200, { ...cors, 'X-Cache': 'HIT' })
  }

  try {
    const rows = await fetchPrices(search, env.TRAVELPAYOUTS_TOKEN)
    const body = {
      source: 'api',
      provider: 'travelpayouts',
      fetchedAt: new Date().toISOString(),
      currency: search.currency,
      nearbyWindowDays: NEARBY_WINDOW_DAYS,
      offers: mapOffers(rows, search, search.currency),
    }
    ctx.waitUntil(
      cache.put(cacheKey, json(body, 200, { 'Cache-Control': `public, max-age=${CACHE_SECONDS}` })),
    )
    return json(body, 200, { ...cors, 'X-Cache': 'MISS' })
  } catch (error) {
    if (error instanceof UpstreamError) {
      console.warn(`Upstream error: ${error.kind} — ${error.message}`)
      const { status, message } = UPSTREAM_ERRORS[error.kind]
      return errorResponse(status, error.kind, message, cors)
    }
    console.error('Unexpected error in search', error)
    return errorResponse(500, 'internal_error', 'Something went wrong. Please try again.', cors)
  }
}

export default {
  async fetch(request, env, ctx): Promise<Response> {
    const url = new URL(request.url)
    const cors = getCorsHeaders(request, env.ALLOWED_ORIGINS)

    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors })
    if (request.method !== 'GET') return errorResponse(405, 'method_not_allowed', 'Only GET is supported.', cors)

    if (url.pathname === '/api/health') return json({ status: 'ok' }, 200, cors)
    if (url.pathname === '/api/flights/search') return handleSearch(request, env, ctx, cors)

    return errorResponse(404, 'not_found', 'Not found.', cors)
  },
} satisfies ExportedHandler<Env>
