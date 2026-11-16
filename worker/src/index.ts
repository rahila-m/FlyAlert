// FlyAlert API (Cloudflare Worker)
//
// GET /api/health
// GET /api/flights/search?from=IST&to=LON&depart=2026-12-10&return=2026-12-17&adults=1&currency=USD
// GET /api/rates      (daily exchange rates, to show alerts in another currency)
// POST /api/assistant (AI assistant, Workers AI)
// GET /api/push/key   (public key browsers need to turn on notifications)
// POST /api/push/test  (signed-in user: send a test notification to own devices)
// POST /api/account/delete (signed-in user: permanently delete own account)
// Cron: scheduled price checks for active alerts (src/scheduled.ts)
//
// The Travelpayouts token stays on the server; the browser never sees it.

import { errorResponse, getCorsHeaders, json } from './http'
import { mapOffers, NEARBY_WINDOW_DAYS, withAffiliateMarker } from './offers'
import { isQuotaError, parseAssistantRequest, runAssistant } from './assistant'
import { getVapidKeys, notifyDevices, testMessage } from './push-notify'
import { getRates } from './rates'
import { handleScheduled } from './scheduled'
import { deleteAuthUser, getUserIdFromToken } from './supabase'
import { fetchPricesWithDirect, UpstreamError } from './travelpayouts'
import { parseSearchRequest } from './validation'

const CACHE_SECONDS = 600 // identical searches within 10 minutes are served from cache
const CACHE_VERSION = '3' // 2 = cheapest direct flight per day; 3 = affiliate marker on booking links

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
  // Bump CACHE_VERSION whenever the way results are built changes,
  // so old cached answers are not served anymore.
  const search = parsed.value
  const cacheKey = new Request(
    `https://cache.flyalert.internal/search?${new URLSearchParams({
      v: CACHE_VERSION,
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
    const rows = await fetchPricesWithDirect(search, env.TRAVELPAYOUTS_TOKEN)
    const body = {
      source: 'api',
      provider: 'travelpayouts',
      fetchedAt: new Date().toISOString(),
      currency: search.currency,
      nearbyWindowDays: NEARBY_WINDOW_DAYS,
      offers: mapOffers(rows, search, search.currency).map((offer) => ({
        ...offer,
        bookingUrl: withAffiliateMarker(offer.bookingUrl, env.TRAVELPAYOUTS_MARKER),
      })),
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

const MAX_ASSISTANT_BODY_BYTES = 12_000

// POST /api/account/delete — Authorization: Bearer <the user's Supabase login token>
// A user can only ever delete their OWN account: the id comes from the verified token.
async function handleAccountDelete(request: Request, env: Env, cors: Record<string, string>): Promise<Response> {
  if (request.method !== 'POST') return errorResponse(405, 'method_not_allowed', 'Use POST.', cors)
  if (!env.SUPABASE_SECRET_KEY) return errorResponse(500, 'not_configured', 'Not configured.', cors)

  // Same-site requests only (blocks other websites from triggering this).
  const origin = request.headers.get('Origin')
  if (origin && origin !== new URL(request.url).origin && !cors['Access-Control-Allow-Origin']) {
    return errorResponse(403, 'forbidden', 'Not allowed.', cors)
  }

  const visitor = request.headers.get('CF-Connecting-IP') ?? 'local'
  const { success } = await env.ACCOUNT_LIMITER.limit({ key: visitor })
  if (!success) return errorResponse(429, 'rate_limited', 'Please wait a minute and try again.', cors)

  const token = request.headers.get('Authorization')?.match(/^Bearer (.+)$/)?.[1]
  const config = { url: env.SUPABASE_URL, secretKey: env.SUPABASE_SECRET_KEY }
  const userId = token ? await getUserIdFromToken(config, token) : null
  if (!userId) return errorResponse(401, 'unauthorized', 'Please log in again.', cors)

  try {
    await deleteAuthUser(config, userId)
    return json({ deleted: true }, 200, cors)
  } catch (error) {
    console.error('Account deletion failed', error)
    return errorResponse(502, 'delete_failed', 'Your account could not be deleted. Please try again.', cors)
  }
}

// POST /api/push/test — Authorization: Bearer <the user's Supabase login token>
async function handlePushTest(request: Request, env: Env, cors: Record<string, string>): Promise<Response> {
  if (request.method !== 'POST') return errorResponse(405, 'method_not_allowed', 'Use POST.', cors)
  const keys = getVapidKeys(env)
  if (!keys || !env.SUPABASE_SECRET_KEY) return errorResponse(500, 'not_configured', 'Notifications are not configured.', cors)

  const visitor = request.headers.get('CF-Connecting-IP') ?? 'local'
  const { success } = await env.PUSH_TEST_LIMITER.limit({ key: visitor })
  if (!success) return errorResponse(429, 'rate_limited', 'Please wait a minute before sending another test.', cors)

  // Only signed-in users, and only to their own devices.
  const token = request.headers.get('Authorization')?.match(/^Bearer (.+)$/)?.[1]
  const config = { url: env.SUPABASE_URL, secretKey: env.SUPABASE_SECRET_KEY }
  const userId = token ? await getUserIdFromToken(config, token) : null
  if (!userId) return errorResponse(401, 'unauthorized', 'Please log in again.', cors)

  const { delivered } = await notifyDevices(config, keys, userId, testMessage)
  return json({ delivered }, 200, cors)
}

// POST /api/assistant  { messages, language, context }  →  { reply }
async function handleAssistant(request: Request, env: Env, cors: Record<string, string>): Promise<Response> {
  if (request.method !== 'POST') return errorResponse(405, 'method_not_allowed', 'Use POST.', cors)

  // Only our own website may use the assistant (blocks other sites from spending our free quota).
  const origin = request.headers.get('Origin')
  if (origin && origin !== new URL(request.url).origin && !cors['Access-Control-Allow-Origin']) {
    return errorResponse(403, 'forbidden', 'Not allowed.', cors)
  }

  // A few messages per minute per visitor is plenty for a real person.
  const visitor = request.headers.get('CF-Connecting-IP') ?? 'local'
  const { success } = await env.ASSISTANT_LIMITER.limit({ key: visitor })
  if (!success) return errorResponse(429, 'rate_limited', 'Too many messages. Please wait a minute.', cors)

  const text = await request.text()
  if (text.length > MAX_ASSISTANT_BODY_BYTES) return errorResponse(413, 'too_large', 'Message is too long.', cors)
  let body: unknown
  try {
    body = JSON.parse(text)
  } catch {
    return errorResponse(400, 'invalid_request', 'Invalid JSON.', cors)
  }
  const parsed = parseAssistantRequest(body)
  if (!parsed.ok) return errorResponse(400, 'invalid_request', parsed.error, cors)

  try {
    const reply = await runAssistant(env.AI, parsed.value)
    if (!reply) return errorResponse(502, 'empty_reply', 'The assistant had no answer. Please try again.', cors)
    return json({ reply }, 200, cors)
  } catch (error) {
    if (isQuotaError(error)) {
      console.warn('Workers AI quota reached', error)
      return errorResponse(503, 'quota_exceeded', 'The assistant has reached its free daily limit.', cors)
    }
    console.error('Assistant error', error)
    return errorResponse(502, 'assistant_error', 'The assistant is unavailable right now.', cors)
  }
}

export default {
  async fetch(request, env, ctx): Promise<Response> {
    const url = new URL(request.url)
    const cors = getCorsHeaders(request, env.ALLOWED_ORIGINS)

    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors })
    if (url.pathname === '/api/assistant') return handleAssistant(request, env, cors)
    if (url.pathname === '/api/push/test') return handlePushTest(request, env, cors)
    if (url.pathname === '/api/account/delete') return handleAccountDelete(request, env, cors)
    if (request.method !== 'GET') return errorResponse(405, 'method_not_allowed', 'Only GET is supported.', cors)

    if (url.pathname === '/api/health') return json({ status: 'ok' }, 200, cors)
    if (url.pathname === '/api/flights/search') return handleSearch(request, env, ctx, cors)
    if (url.pathname === '/api/push/key') {
      return env.VAPID_PUBLIC_KEY
        ? json({ publicKey: env.VAPID_PUBLIC_KEY }, 200, { ...cors, 'Cache-Control': 'public, max-age=3600' })
        : errorResponse(503, 'not_configured', 'Notifications are not configured.', cors)
    }
    if (url.pathname === '/api/rates') {
      const rates = await getRates(ctx)
      return rates
        ? json(rates, 200, { ...cors, 'Cache-Control': 'public, max-age=3600' })
        : errorResponse(503, 'unavailable', 'Exchange rates are unavailable right now.', cors)
    }

    return errorResponse(404, 'not_found', 'Not found.', cors)
  },

  // Runs on the Cron Trigger schedule (see wrangler.jsonc).
  async scheduled(_controller, env, ctx): Promise<void> {
    ctx.waitUntil(handleScheduled(env))
  },
} satisfies ExportedHandler<Env>
