// Calls our own backend (Cloudflare Worker) for flight offers.
// The browser never talks to the flight data provider directly, so the
// provider's secret token stays on the server.

import type { FlightOffer, FlightSearch } from './model'

// Shape of the Worker's response (see worker/src/offers.ts).
interface ApiLeg {
  origin: string
  destination: string
  departureAt: string
  durationMinutes: number | null
  stops: number
}
interface ApiOffer {
  id: string
  airline: { code: string; name: string }
  flightNumber: string | null
  outbound: ApiLeg
  inbound: ApiLeg | null
  price: { perPerson: number; currency: string }
  bookingUrl: string | null
  dateMatch: 'exact' | 'nearby'
  departureDayOffset: number
  returnDayOffset: number | null
}
interface ApiSearchResponse {
  source: 'api'
  provider: string
  fetchedAt: string
  offers: ApiOffer[]
}

export class FlightSearchError extends Error {}

const toLeg = (leg: ApiLeg) => ({ ...leg, stopAirports: [] })

export async function searchFlights(
  search: FlightSearch,
  currency: string,
  signal: AbortSignal,
): Promise<FlightOffer[]> {
  const params = new URLSearchParams({
    from: search.origin.iata,
    to: search.destination.iata,
    depart: search.departureDate,
    adults: String(search.adults),
    currency,
  })
  if (search.returnDate) params.set('return', search.returnDate)

  let response: Response
  try {
    response = await fetch(`/api/flights/search?${params}`, { signal })
  } catch (error) {
    if (signal.aborted) throw error
    throw new FlightSearchError(
      'Could not reach the FlyAlert server. Check your connection and try again.',
    )
  }

  const body = (await response.json().catch(() => null)) as
    | ApiSearchResponse
    | { error?: { message?: string } }
    | null

  // No JSON at all means our server didn't answer (e.g. it's down or restarting).
  if (!body) {
    throw new FlightSearchError(
      'Could not reach the FlyAlert server. Please try again in a moment.',
    )
  }
  if (!response.ok || !('offers' in body) || !Array.isArray(body.offers)) {
    // Our Worker only returns safe, user-facing messages.
    const message = body && 'error' in body ? body.error?.message : undefined
    throw new FlightSearchError(message ?? 'Flight search failed. Please try again.')
  }

  return body.offers.map(
    (offer): FlightOffer => ({
      id: offer.id,
      source: 'api',
      airline: { name: offer.airline.name, code: offer.airline.code },
      flightNumber: offer.flightNumber,
      outbound: toLeg(offer.outbound),
      inbound: offer.inbound ? toLeg(offer.inbound) : null,
      price: offer.price,
      provider: 'Aviasales',
      bookingUrl: offer.bookingUrl,
      dateMatch: offer.dateMatch,
      departureDayOffset: offer.departureDayOffset,
      returnDayOffset: offer.returnDayOffset,
    }),
  )
}
