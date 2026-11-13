// Client for the Travelpayouts (Aviasales) Data API.
// Prices come from a cache of searches made by Aviasales users in the last ~48 hours.

import type { TravelpayoutsPrice } from './offers'
import type { SearchRequest } from './validation'

const API_URL = 'https://api.travelpayouts.com/aviasales/v3/prices_for_dates'
const TIMEOUT_MS = 8000

export type UpstreamErrorKind = 'rate_limited' | 'timeout' | 'unavailable' | 'bad_response'

// Thrown for any problem with the external API. The message never contains the token.
export class UpstreamError extends Error {
  readonly kind: UpstreamErrorKind
  constructor(kind: UpstreamErrorKind, message: string) {
    super(message)
    this.kind = kind
  }
}

export async function fetchPrices(request: SearchRequest, token: string): Promise<TravelpayoutsPrice[]> {
  const params = new URLSearchParams({
    origin: request.origin,
    destination: request.destination,
    // Whole months are requested: exact-date queries are usually empty,
    // so we filter to the requested dates (± a few days) afterwards.
    departure_at: request.departureDate.slice(0, 7),
    currency: request.currency.toLowerCase(),
    one_way: request.returnDate ? 'false' : 'true',
    sorting: 'price',
    limit: '1000',
  })
  if (request.returnDate) params.set('return_at', request.returnDate.slice(0, 7))

  let response: Response
  try {
    response = await fetch(`${API_URL}?${params}`, {
      // Sent as a header (not in the URL) so it doesn't end up in logs.
      headers: { 'X-Access-Token': token, 'Accept-Encoding': 'gzip, deflate' },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    })
  } catch (error) {
    const isTimeout = error instanceof Error && (error.name === 'TimeoutError' || error.name === 'AbortError')
    throw new UpstreamError(isTimeout ? 'timeout' : 'unavailable', 'Flight data request failed')
  }

  if (response.status === 429) throw new UpstreamError('rate_limited', 'Flight data rate limit reached')
  if (!response.ok) throw new UpstreamError('unavailable', `Flight data responded with ${response.status}`)

  let body: unknown
  try {
    body = await response.json()
  } catch {
    throw new UpstreamError('bad_response', 'Flight data response was not valid JSON')
  }

  const result = body as { success?: boolean; data?: unknown }
  if (!result.success || !Array.isArray(result.data)) {
    throw new UpstreamError('bad_response', 'Flight data response had an unexpected format')
  }
  return result.data as TravelpayoutsPrice[]
}
