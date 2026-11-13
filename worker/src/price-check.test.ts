import { describe, expect, it } from 'vitest'
import { mapOffers, type TravelpayoutsPrice } from './offers'
import { alertToSearchRequest, buildErrorCheck, buildPriceCheck, type AlertToCheck } from './price-check'

const alert: AlertToCheck = {
  id: 'alert-1',
  origin_iata: 'IST',
  destination_iata: 'LON',
  departure_date: '2026-12-10',
  return_date: null,
  adults: 1,
  currency: 'TRY',
  flexible_days: 0,
}

const row = (overrides: Partial<TravelpayoutsPrice>): TravelpayoutsPrice => ({
  origin: 'IST',
  destination: 'LON',
  origin_airport: 'SAW',
  destination_airport: 'STN',
  price: 3000,
  airline: 'PC',
  flight_number: 271,
  departure_at: '2026-12-10T11:40:00+03:00',
  transfers: 1,
  duration_to: 295,
  link: '/search/IST1012LON1?t=x',
  ...overrides,
})

const check = (rows: TravelpayoutsPrice[], a: AlertToCheck = alert) =>
  buildPriceCheck(a, mapOffers(rows, alertToSearchRequest(a), a.currency, a.flexible_days))

describe('buildPriceCheck', () => {
  it('stores the cheapest fare on the exact date', () => {
    const result = check([row({ price: 3500, flight_number: 1 }), row({ price: 2900, flight_number: 2 })])
    expect(result).toMatchObject({
      alert_id: 'alert-1',
      status: 'success',
      data_source: 'api',
      price: 2900,
      currency: 'TRY',
      airline: 'Pegasus Airlines',
      stops: 1,
      outbound_departure_at: '2026-12-10T11:40:00',
      return_departure_at: null,
      booking_url: 'https://www.aviasales.com/search/IST1012LON1?t=x',
      offer_count: 2,
    })
  })

  it('ignores cheaper fares on other days when the alert is for exact dates', () => {
    const result = check([row({ price: 1000, departure_at: '2026-12-11T08:00:00+03:00' })])
    expect(result.status).toBe('no_results')
  })

  it('includes nearby days when the alert is flexible', () => {
    const flexible = { ...alert, flexible_days: 2 }
    const result = check(
      [row({ price: 3000 }), row({ price: 1000, flight_number: 9, departure_at: '2026-12-12T08:00:00+03:00' })],
      flexible,
    )
    expect(result).toMatchObject({ status: 'success', price: 1000, outbound_departure_at: '2026-12-12T08:00:00' })
  })

  it('records "no results" without a price', () => {
    const result = check([])
    expect(result).toEqual({ alert_id: 'alert-1', status: 'no_results', data_source: 'api', provider: 'travelpayouts', offer_count: 0 })
    expect('price' in result).toBe(false)
  })

  it('stores the return departure for round-trips', () => {
    const roundTrip = { ...alert, return_date: '2026-12-20' }
    const result = check([row({ return_at: '2026-12-20T19:25:00Z', return_transfers: 2 })], roundTrip)
    expect(result).toMatchObject({ status: 'success', return_departure_at: '2026-12-20T19:25:00', stops: 2 })
  })
})

describe('buildErrorCheck', () => {
  it('never contains a price', () => {
    const result = buildErrorCheck(alert, 'timeout')
    expect(result).toEqual({ alert_id: 'alert-1', status: 'error', data_source: 'api', provider: 'travelpayouts', error_code: 'timeout' })
  })
})
