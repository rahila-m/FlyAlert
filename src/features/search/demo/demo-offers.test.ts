import { describe, expect, it } from 'vitest'
import { findAirport } from '../airports'
import type { FlightSearch } from '../model'
import { generateDemoOffers } from './demo-offers'

const search: FlightSearch = {
  tripType: 'round-trip',
  origin: findAirport('IST')!,
  destination: findAirport('JFK')!,
  departureDate: '2026-12-10',
  returnDate: '2026-12-17',
  adults: 1,
  travelClass: 'ECONOMY',
}

describe('generateDemoOffers', () => {
  it('returns the same offers for the same search', () => {
    expect(generateDemoOffers(search)).toEqual(generateDemoOffers(search))
  })

  it('marks every offer as demo data that cannot be booked', () => {
    for (const offer of generateDemoOffers(search)) {
      expect(offer.source).toBe('demo')
      expect(offer.bookingUrl).toBeNull()
    }
  })

  it('creates a return leg only for round-trips', () => {
    expect(generateDemoOffers(search).every((offer) => offer.inbound !== null)).toBe(true)
    const oneWay = generateDemoOffers({ ...search, tripType: 'one-way', returnDate: null })
    expect(oneWay.every((offer) => offer.inbound === null)).toBe(true)
  })

  it('scales the total price with the number of passengers', () => {
    const single = generateDemoOffers(search)
    const double = generateDemoOffers({ ...search, adults: 2 })
    expect(double.map((offer) => offer.price.total)).toEqual(
      single.map((offer) => offer.price.total * 2),
    )
  })

  it('never arrives before it departs', () => {
    for (const offer of generateDemoOffers(search)) {
      expect(offer.outbound.arrivalTime > offer.outbound.departureTime).toBe(true)
    }
  })
})
