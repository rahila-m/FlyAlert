// Filtering and sorting of flight offers.
// These are "pure functions": they only use their inputs and never change them,
// which makes them easy to unit test (see filters.test.ts).

import type { FlightLeg, FlightOffer } from './model'

export type SortOption = 'best' | 'cheapest' | 'fastest'

export const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'best', label: 'Best' },
  { value: 'cheapest', label: 'Cheapest' },
  { value: 'fastest', label: 'Fastest' },
]

export type StopsFilter = 'any' | 'direct' | 'connecting'

export const TIME_SLOTS = [
  { value: 'night', label: 'Night', range: '00–06', startHour: 0, endHour: 6 },
  { value: 'morning', label: 'Morning', range: '06–12', startHour: 6, endHour: 12 },
  { value: 'afternoon', label: 'Afternoon', range: '12–18', startHour: 12, endHour: 18 },
  { value: 'evening', label: 'Evening', range: '18–24', startHour: 18, endHour: 24 },
] as const

export type TimeSlot = (typeof TIME_SLOTS)[number]['value']

export interface OfferFilters {
  stops: StopsFilter
  minPrice: number | null // per person
  maxPrice: number | null // per person
  departureTimes: TimeSlot[] // outbound departure; empty = any time
  maxDurationMinutes: number | null // applies to each leg; null = any duration
  excludedAirlines: string[] // empty = all airlines
}

export const DEFAULT_FILTERS: OfferFilters = {
  stops: 'any',
  minPrice: null,
  maxPrice: null,
  departureTimes: [],
  maxDurationMinutes: null,
  excludedAirlines: [],
}

const legs = (offer: FlightOffer): FlightLeg[] =>
  offer.inbound ? [offer.outbound, offer.inbound] : [offer.outbound]

// Most stops on any leg: a round-trip is "direct" only if both legs are direct.
export function getMaxStops(offer: FlightOffer): number {
  return Math.max(...legs(offer).map((leg) => leg.stops))
}

// Total travel time, or null if any leg's duration is unknown.
export function getTotalDuration(offer: FlightOffer): number | null {
  const durations = legs(offer).map((leg) => leg.durationMinutes)
  return durations.some((d) => d === null) ? null : (durations as number[]).reduce((a, b) => a + b, 0)
}

export function getLongestLegDuration(offer: FlightOffer): number | null {
  const durations = legs(offer).map((leg) => leg.durationMinutes)
  return durations.some((d) => d === null) ? null : Math.max(...(durations as number[]))
}

export function getTimeSlot(localDateTime: string): TimeSlot {
  const hour = Number(localDateTime.slice(11, 13))
  const slot = TIME_SLOTS.find((s) => hour >= s.startHour && hour < s.endHour)
  return slot?.value ?? 'night'
}

export function applyFilters(offers: FlightOffer[], filters: OfferFilters): FlightOffer[] {
  return offers.filter((offer) => {
    const stops = getMaxStops(offer)
    const price = offer.price.perPerson
    if (filters.stops === 'direct' && stops > 0) return false
    if (filters.stops === 'connecting' && stops === 0) return false
    if (filters.minPrice !== null && price < filters.minPrice) return false
    if (filters.maxPrice !== null && price > filters.maxPrice) return false
    if (
      filters.departureTimes.length > 0 &&
      !filters.departureTimes.includes(getTimeSlot(offer.outbound.departureAt))
    ) {
      return false
    }
    if (filters.maxDurationMinutes !== null) {
      const longest = getLongestLegDuration(offer)
      // Offers with an unknown duration can't be checked, so they are hidden by this filter.
      if (longest === null || longest > filters.maxDurationMinutes) return false
    }
    if (filters.excludedAirlines.includes(offer.airline.name)) return false
    return true
  })
}

export function countActiveFilters(filters: OfferFilters): number {
  return [
    filters.stops !== 'any',
    filters.minPrice !== null || filters.maxPrice !== null,
    filters.departureTimes.length > 0,
    filters.maxDurationMinutes !== null,
    filters.excludedAirlines.length > 0,
  ].filter(Boolean).length
}

// "Best" is a simple, transparent score (lower is better):
// 60% price + 40% total travel time, each scaled 0–1 within the current results,
// plus a small penalty for every stop. It is a heuristic, not a prediction.
// Unknown durations count as the slowest option.
function createBestScorer(offers: FlightOffer[]) {
  const prices = offers.map((offer) => offer.price.perPerson)
  const durations = offers.map(getTotalDuration).filter((d): d is number => d !== null)
  const minPrice = Math.min(...prices)
  const maxPrice = Math.max(...prices)
  const minDuration = durations.length ? Math.min(...durations) : 0
  const maxDuration = durations.length ? Math.max(...durations) : 0
  const scale = (value: number, min: number, max: number) =>
    max === min ? 0 : (value - min) / (max - min)

  return (offer: FlightOffer) => {
    const duration = getTotalDuration(offer)
    return (
      0.6 * scale(offer.price.perPerson, minPrice, maxPrice) +
      0.4 * (duration === null ? 1 : scale(duration, minDuration, maxDuration)) +
      0.05 * getMaxStops(offer)
    )
  }
}

export function sortOffers(offers: FlightOffer[], sort: SortOption): FlightOffer[] {
  const sorted = [...offers] // never mutate the original array
  const byPrice = (a: FlightOffer, b: FlightOffer) => a.price.perPerson - b.price.perPerson
  const byDuration = (a: FlightOffer, b: FlightOffer) =>
    (getTotalDuration(a) ?? Infinity) - (getTotalDuration(b) ?? Infinity) || 0

  if (sort === 'cheapest') return sorted.sort((a, b) => byPrice(a, b) || byDuration(a, b))
  if (sort === 'fastest') return sorted.sort((a, b) => byDuration(a, b) || byPrice(a, b))

  const score = createBestScorer(offers)
  return sorted.sort((a, b) => score(a) - score(b) || byPrice(a, b))
}

// Ranges and options for the filter panel, based on the current results.
export function getFilterBounds(offers: FlightOffer[]) {
  const prices = offers.map((offer) => offer.price.perPerson)
  const legDurations = offers.map(getLongestLegDuration).filter((d): d is number => d !== null)

  const airlineCounts = new Map<string, number>()
  for (const offer of offers) {
    airlineCounts.set(offer.airline.name, (airlineCounts.get(offer.airline.name) ?? 0) + 1)
  }

  return {
    currency: offers[0]?.price.currency ?? 'USD',
    minPrice: Math.min(...prices),
    maxPrice: Math.max(...prices),
    // Rounded to whole hours so the slider has clean steps (0 when no durations are known).
    minDuration: legDurations.length ? Math.floor(Math.min(...legDurations) / 60) * 60 : 0,
    maxDuration: legDurations.length ? Math.ceil(Math.max(...legDurations) / 60) * 60 : 0,
    airlines: [...airlineCounts.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => a.name.localeCompare(b.name)),
  }
}

export type FilterBounds = ReturnType<typeof getFilterBounds>
