import { describe, expect, it } from 'vitest'
import {
  applyFilters,
  countActiveFilters,
  DEFAULT_FILTERS,
  getFilterBounds,
  getTimeSlot,
  sortOffers,
} from './filters'
import type { FlightLeg, FlightOffer } from './model'

// Small helper to build test offers with only the fields a test cares about.
function makeOffer(
  id: string,
  options: {
    price: number
    duration: number
    stops?: number
    departure?: string
    airline?: string
    inbound?: Partial<FlightLeg>
  },
): FlightOffer {
  const leg = (overrides: Partial<FlightLeg> = {}): FlightLeg => ({
    origin: 'IST',
    destination: 'JFK',
    departureTime: options.departure ?? '2026-12-10T09:00',
    arrivalTime: '2026-12-10T18:00',
    durationMinutes: options.duration,
    stops: options.stops ?? 0,
    stopAirports: [],
    ...overrides,
  })
  return {
    id,
    source: 'demo',
    airline: { name: options.airline ?? 'Skyline Air' },
    outbound: leg(),
    inbound: options.inbound ? leg(options.inbound) : null,
    price: { total: options.price, currency: 'USD' },
    provider: 'Demo provider',
    bookingUrl: null,
  }
}

const cheapSlow = makeOffer('cheap-slow', { price: 300, duration: 900, stops: 2, airline: 'Bluejet' })
const midDirect = makeOffer('mid-direct', { price: 500, duration: 600, departure: '2026-12-10T19:30' })
const expensiveFast = makeOffer('expensive-fast', { price: 900, duration: 540, airline: 'Aurora Airlines' })
const offers = [midDirect, expensiveFast, cheapSlow]

const ids = (list: FlightOffer[]) => list.map((offer) => offer.id)

describe('applyFilters', () => {
  it('returns every offer with default filters', () => {
    expect(applyFilters(offers, DEFAULT_FILTERS)).toHaveLength(3)
  })

  it('keeps only direct flights', () => {
    const result = applyFilters(offers, { ...DEFAULT_FILTERS, stops: 'direct' })
    expect(ids(result)).toEqual(['mid-direct', 'expensive-fast'])
  })

  it('keeps only connecting flights', () => {
    const result = applyFilters(offers, { ...DEFAULT_FILTERS, stops: 'connecting' })
    expect(ids(result)).toEqual(['cheap-slow'])
  })

  it('treats a round-trip as connecting if either leg has a stop', () => {
    const roundTrip = makeOffer('rt', { price: 400, duration: 600, inbound: { stops: 1 } })
    expect(applyFilters([roundTrip], { ...DEFAULT_FILTERS, stops: 'direct' })).toEqual([])
  })

  it('filters by price range (inclusive)', () => {
    const result = applyFilters(offers, { ...DEFAULT_FILTERS, minPrice: 300, maxPrice: 500 })
    expect(ids(result)).toEqual(['mid-direct', 'cheap-slow'])
  })

  it('filters by departure time of day', () => {
    const result = applyFilters(offers, { ...DEFAULT_FILTERS, departureTimes: ['evening'] })
    expect(ids(result)).toEqual(['mid-direct'])
  })

  it('filters by maximum duration of the longest leg', () => {
    const result = applyFilters(offers, { ...DEFAULT_FILTERS, maxDurationMinutes: 600 })
    expect(ids(result)).toEqual(['mid-direct', 'expensive-fast'])
  })

  it('hides excluded airlines', () => {
    const result = applyFilters(offers, { ...DEFAULT_FILTERS, excludedAirlines: ['Bluejet'] })
    expect(ids(result)).not.toContain('cheap-slow')
  })
})

describe('sortOffers', () => {
  it('sorts by price for "cheapest"', () => {
    expect(ids(sortOffers(offers, 'cheapest'))).toEqual(['cheap-slow', 'mid-direct', 'expensive-fast'])
  })

  it('sorts by total duration for "fastest"', () => {
    expect(ids(sortOffers(offers, 'fastest'))).toEqual(['expensive-fast', 'mid-direct', 'cheap-slow'])
  })

  it('balances price and duration for "best"', () => {
    // mid-direct is neither the cheapest nor the fastest, but the best compromise.
    expect(sortOffers(offers, 'best')[0].id).toBe('mid-direct')
  })

  it('does not change the original array', () => {
    const before = ids(offers)
    sortOffers(offers, 'cheapest')
    expect(ids(offers)).toEqual(before)
  })

  it('handles an empty list', () => {
    expect(sortOffers([], 'best')).toEqual([])
  })
})

describe('helpers', () => {
  it('maps departure hours to time slots', () => {
    expect(getTimeSlot('2026-12-10T00:00')).toBe('night')
    expect(getTimeSlot('2026-12-10T05:59')).toBe('night')
    expect(getTimeSlot('2026-12-10T06:00')).toBe('morning')
    expect(getTimeSlot('2026-12-10T12:00')).toBe('afternoon')
    expect(getTimeSlot('2026-12-10T23:55')).toBe('evening')
  })

  it('counts active filters', () => {
    expect(countActiveFilters(DEFAULT_FILTERS)).toBe(0)
    expect(
      countActiveFilters({ ...DEFAULT_FILTERS, stops: 'direct', minPrice: 100, maxPrice: 200 }),
    ).toBe(2)
  })

  it('computes filter bounds from offers', () => {
    const bounds = getFilterBounds(offers)
    expect(bounds.minPrice).toBe(300)
    expect(bounds.maxPrice).toBe(900)
    expect(bounds.minDuration).toBe(540)
    expect(bounds.maxDuration).toBe(900)
    expect(bounds.airlines.map((airline) => airline.name)).toEqual([
      'Aurora Airlines',
      'Bluejet',
      'Skyline Air',
    ])
  })
})
