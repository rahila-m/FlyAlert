import { describe, expect, it } from 'vitest'
import { mapOffers, type TravelpayoutsPrice } from './offers'
import { parseSearchRequest, type SearchRequest } from './validation'

const TODAY = '2026-11-13'

describe('parseSearchRequest', () => {
  const parse = (query: string) => parseSearchRequest(new URLSearchParams(query), TODAY)

  it('accepts a valid round-trip search and normalizes case', () => {
    const result = parse('from=ist&to=lon&depart=2026-12-10&return=2026-12-17&adults=2&currency=try')
    expect(result).toEqual({
      ok: true,
      value: {
        origin: 'IST',
        destination: 'LON',
        departureDate: '2026-12-10',
        returnDate: '2026-12-17',
        adults: 2,
        currency: 'TRY',
      },
    })
  })

  it('accepts a one-way search with defaults', () => {
    const result = parse('from=IST&to=JFK&depart=2026-12-10')
    expect(result.ok && result.value).toMatchObject({ returnDate: null, adults: 1, currency: 'USD' })
  })

  it('rejects invalid and malicious input', () => {
    const result = parse('from=IS&to=IST%27%3B--&depart=2026-02-30&adults=50&currency=BTC')
    expect(result.ok).toBe(false)
    if (!result.ok) expect(Object.keys(result.errors).sort()).toEqual(['adults', 'currency', 'depart', 'from', 'to'])
  })

  it('rejects past dates but allows one day of time zone tolerance', () => {
    expect(parse('from=IST&to=JFK&depart=2026-11-11').ok).toBe(false)
    expect(parse('from=IST&to=JFK&depart=2026-11-12').ok).toBe(true)
  })

  it('rejects a return before departure and same origin/destination', () => {
    expect(parse('from=IST&to=JFK&depart=2026-12-10&return=2026-12-01').ok).toBe(false)
    expect(parse('from=IST&to=IST&depart=2026-12-10').ok).toBe(false)
  })
})

describe('mapOffers', () => {
  const roundTrip: SearchRequest = {
    origin: 'IST',
    destination: 'LON',
    departureDate: '2026-12-10',
    returnDate: '2026-12-17',
    adults: 1,
    currency: 'USD',
  }

  const row = (overrides: Partial<TravelpayoutsPrice>): TravelpayoutsPrice => ({
    origin: 'IST',
    destination: 'LON',
    origin_airport: 'SAW',
    destination_airport: 'STN',
    price: 150,
    airline: 'PC',
    flight_number: 1169,
    departure_at: '2026-12-10T08:50:00+03:00',
    return_at: '2026-12-17T19:25:00Z',
    transfers: 0,
    return_transfers: 0,
    duration_to: 240,
    duration_back: 225,
    link: '/search/IST1012LON17121?t=abc',
    ...overrides,
  })

  it('maps fields, airline names and booking links', () => {
    const [offer] = mapOffers([row({})], roundTrip, 'USD')
    expect(offer).toMatchObject({
      airline: { code: 'PC', name: 'Pegasus Airlines' },
      flightNumber: '1169',
      outbound: { origin: 'SAW', destination: 'STN', durationMinutes: 240, stops: 0 },
      inbound: { origin: 'LON', destination: 'IST', durationMinutes: 225 },
      price: { perPerson: 150, currency: 'USD' },
      bookingUrl: 'https://www.aviasales.com/search/IST1012LON17121?t=abc',
      dateMatch: 'exact',
      departureDayOffset: 0,
      returnDayOffset: 0,
    })
  })

  it('marks flights on nearby dates and drops flights outside the window', () => {
    const offers = mapOffers(
      [
        row({ departure_at: '2026-12-12T08:50:00+03:00' }), // +2 days -> nearby
        row({ departure_at: '2026-12-20T08:50:00+03:00' }), // +10 days -> dropped
        row({ return_at: '2026-12-30T19:25:00Z' }), // return +13 days -> dropped
      ],
      roundTrip,
      'USD',
    )
    expect(offers).toHaveLength(1)
    expect(offers[0]).toMatchObject({ dateMatch: 'nearby', departureDayOffset: 2 })
  })

  it('never builds booking links to other websites', () => {
    const offers = mapOffers(
      [
        row({ link: 'https://evil.example/phish' }),
        row({ link: '//evil.example', flight_number: 2 }),
        row({ link: undefined, flight_number: 3 }),
      ],
      roundTrip,
      'USD',
    )
    expect(offers.map((offer) => offer.bookingUrl)).toEqual([null, null, null])
  })

  it('skips invalid rows and duplicates, and sorts by price', () => {
    const offers = mapOffers(
      [
        row({ price: 300, flight_number: 1 }),
        row({ price: 0, flight_number: 2 }),
        row({ price: 120, flight_number: 3 }),
        row({ price: 120, flight_number: 3 }), // duplicate
        row({ return_at: undefined, flight_number: 4 }), // missing return for round-trip
      ],
      roundTrip,
      'USD',
    )
    expect(offers.map((offer) => offer.price.perPerson)).toEqual([120, 300])
  })

  it('falls back to the airline code when the name is unknown', () => {
    // '#1' can't be in the list (codes are letters/digits only).
    const [offer] = mapOffers([row({ airline: '#1' })], roundTrip, 'USD')
    expect(offer.airline.name).toBe('#1')
  })
})
