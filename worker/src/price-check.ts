// Turns a price alert + the fares we found into one `price_checks` row.
// Pure functions only (no network), so they are easy to unit test.

import type { ApiOffer } from './offers'
import type { UpstreamErrorKind } from './travelpayouts'
import type { SearchRequest } from './validation'

// The columns of `flight_alerts` the scheduler needs.
export interface AlertToCheck {
  id: string
  user_id: string
  target_price: number | string // Postgres numeric may arrive as a string
  origin_iata: string
  destination_iata: string
  departure_date: string
  return_date: string | null
  adults: number
  currency: string
  flexible_days: number
}

// A row for the `price_checks` table. The database enforces that only
// `success` rows have a price, so errors can never look like real prices.
export type PriceCheckRow =
  | {
      alert_id: string
      status: 'success'
      data_source: 'api'
      provider: string
      price: number
      currency: string
      airline: string
      stops: number
      outbound_departure_at: string
      return_departure_at: string | null
      booking_url: string | null
      offer_count: number
    }
  | { alert_id: string; status: 'no_results'; data_source: 'api'; provider: string; offer_count: 0 }
  | { alert_id: string; status: 'error'; data_source: 'api'; provider: string; error_code: string }

const PROVIDER = 'travelpayouts'

export function alertToSearchRequest(alert: AlertToCheck): SearchRequest {
  return {
    origin: alert.origin_iata,
    destination: alert.destination_iata,
    departureDate: alert.departure_date,
    returnDate: alert.return_date,
    adults: alert.adults,
    currency: alert.currency,
  }
}

// "2026-12-10T09:00:00+03:00" -> "2026-12-10T09:00:00" (local airport time, as stored).
const toLocalTimestamp = (dateTime: string) => dateTime.slice(0, 19)

// `offers` must already be limited to the alert's date window (see mapOffers).
export function buildPriceCheck(alert: AlertToCheck, offers: ApiOffer[]): PriceCheckRow {
  if (offers.length === 0) {
    return { alert_id: alert.id, status: 'no_results', data_source: 'api', provider: PROVIDER, offer_count: 0 }
  }

  const cheapest = offers.reduce((best, offer) =>
    offer.price.perPerson < best.price.perPerson ? offer : best,
  )
  return {
    alert_id: alert.id,
    status: 'success',
    data_source: 'api',
    provider: PROVIDER,
    price: cheapest.price.perPerson,
    currency: cheapest.price.currency,
    airline: cheapest.airline.name,
    stops: Math.max(cheapest.outbound.stops, cheapest.inbound?.stops ?? 0),
    outbound_departure_at: toLocalTimestamp(cheapest.outbound.departureAt),
    return_departure_at: cheapest.inbound ? toLocalTimestamp(cheapest.inbound.departureAt) : null,
    booking_url: cheapest.bookingUrl,
    offer_count: offers.length,
  }
}

// Notification rule: notify when the fare is at or below the target AND lower than
// any price we already notified about. So the user hears about the first drop and
// every new low, but never twice for the same (or a higher) price.
export function shouldNotify(
  price: number,
  targetPrice: number,
  lowestNotifiedPrice: number | null,
): boolean {
  if (!(price > 0) || !(targetPrice > 0)) return false
  if (price > targetPrice) return false
  return lowestNotifiedPrice === null || price < lowestNotifiedPrice
}

export function buildErrorCheck(alert: AlertToCheck, kind: UpstreamErrorKind | 'internal'): PriceCheckRow {
  return { alert_id: alert.id, status: 'error', data_source: 'api', provider: PROVIDER, error_code: kind }
}
