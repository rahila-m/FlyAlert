// Converts raw Travelpayouts results into FlyAlert's offer format.
// Pure functions only (no network), so they are easy to unit test.

import airlineNames from './data/airlines.json'
import type { SearchRequest } from './validation'

// How many days before/after the requested dates still count as "nearby".
export const NEARBY_WINDOW_DAYS = 3

// Shape of one item in Travelpayouts' /aviasales/v3/prices_for_dates response.
export interface TravelpayoutsPrice {
  origin: string
  destination: string
  origin_airport?: string
  destination_airport?: string
  price: number
  airline: string
  flight_number?: string | number
  departure_at: string
  return_at?: string
  transfers?: number
  return_transfers?: number
  duration?: number
  duration_to?: number
  duration_back?: number
  link?: string
}

export interface ApiFlightLeg {
  origin: string
  destination: string
  departureAt: string // ISO 8601 with the airport's UTC offset
  durationMinutes: number | null
  stops: number
}

export interface ApiOffer {
  id: string
  airline: { code: string; name: string }
  flightNumber: string | null
  outbound: ApiFlightLeg
  inbound: ApiFlightLeg | null
  price: { perPerson: number; currency: string }
  bookingUrl: string | null
  dateMatch: 'exact' | 'nearby'
  departureDayOffset: number // days from the requested departure date
  returnDayOffset: number | null
}

const AIRLINES = airlineNames as Record<string, string>
const BOOKING_HOST = 'https://www.aviasales.com'

function dayDifference(fromIso: string, toIso: string): number {
  const from = Date.parse(`${fromIso}T00:00:00Z`)
  const to = Date.parse(`${toIso}T00:00:00Z`)
  return Math.round((to - from) / 86_400_000)
}

// The date part of "2026-12-10T09:00:00+03:00" is the local date at the airport.
const localDate = (dateTime: string) => dateTime.slice(0, 10)

function toBookingUrl(link: string | undefined): string | null {
  // Only accept relative paths, so the result can never point to another site.
  if (!link || !link.startsWith('/') || link.startsWith('//')) return null
  return `${BOOKING_HOST}${link}`
}

export function mapOffers(
  rows: TravelpayoutsPrice[],
  request: SearchRequest,
  currency: string,
  windowDays: number = NEARBY_WINDOW_DAYS,
): ApiOffer[] {
  const offers: ApiOffer[] = []
  const seen = new Set<string>()

  for (const row of rows) {
    if (typeof row.price !== 'number' || row.price <= 0 || !row.departure_at) continue
    if (request.returnDate && !row.return_at) continue // round-trip search needs a return flight

    const departureDayOffset = dayDifference(request.departureDate, localDate(row.departure_at))
    const returnDayOffset =
      request.returnDate && row.return_at
        ? dayDifference(request.returnDate, localDate(row.return_at))
        : null

    // Keep only flights within the nearby window around the requested dates.
    if (Math.abs(departureDayOffset) > windowDays) continue
    if (returnDayOffset !== null && Math.abs(returnDayOffset) > windowDays) continue

    const flightNumber = row.flight_number != null ? String(row.flight_number) : null
    const id = [row.airline, flightNumber, row.departure_at, row.return_at ?? ''].join('|')
    if (seen.has(id)) continue
    seen.add(id)

    offers.push({
      id,
      airline: { code: row.airline, name: AIRLINES[row.airline] ?? row.airline },
      flightNumber,
      outbound: {
        origin: row.origin_airport ?? row.origin,
        destination: row.destination_airport ?? row.destination,
        departureAt: row.departure_at,
        durationMinutes: row.duration_to ?? row.duration ?? null,
        stops: row.transfers ?? 0,
      },
      inbound: row.return_at
        ? {
            // The API doesn't say which airport the return uses, so we show city codes.
            origin: row.destination,
            destination: row.origin,
            departureAt: row.return_at,
            durationMinutes: row.duration_back ?? null,
            stops: row.return_transfers ?? 0,
          }
        : null,
      price: { perPerson: row.price, currency },
      bookingUrl: toBookingUrl(row.link),
      dateMatch: departureDayOffset === 0 && (returnDayOffset ?? 0) === 0 ? 'exact' : 'nearby',
      departureDayOffset,
      returnDayOffset,
    })
  }

  return offers.sort((a, b) => a.price.perPerson - b.price.perPerson)
}
