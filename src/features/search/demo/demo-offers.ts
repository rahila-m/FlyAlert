// ⚠️ DEMO DATA GENERATOR — NOT REAL FLIGHTS OR PRICES.
//
// Creates fake flight offers so we can build and test the results UI before
// connecting a real flight API (Phase 4). Airline names are fictional on purpose
// so demo offers can never be mistaken for real ones. Every offer is marked
// with source: 'demo' and has no booking link.
//
// The generator is deterministic: the same search always returns the same
// offers, so results don't change when the page is refreshed.

import type { FlightLeg, FlightOffer, FlightSearch, TravelClass } from '../model'

const DEMO_AIRLINES = [
  'Skyline Air',
  'Northwind Airways',
  'Aurora Airlines',
  'Meridian Air',
  'Bluejet',
  'Atlas Wings',
]

// Connection airports used for demo stopovers.
const DEMO_HUBS = ['IST', 'DXB', 'DOH', 'FRA', 'AMS', 'CDG', 'LHR', 'ORD', 'ATL', 'SIN']

const CLASS_MULTIPLIER: Record<TravelClass, number> = {
  ECONOMY: 1,
  PREMIUM_ECONOMY: 1.6,
  BUSINESS: 3.2,
  FIRST: 5,
}

// Turns text into a number (FNV-1a hash), used as a random seed.
function hashString(text: string): number {
  let hash = 2166136261
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

// Small seeded random number generator (mulberry32): same seed -> same numbers.
function createRandom(seed: number) {
  let state = seed
  return () => {
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function addMinutes(localDateTime: string, minutes: number): string {
  const [date, time] = localDateTime.split('T')
  const [year, month, day] = date.split('-').map(Number)
  const [hour, minute] = time.split(':').map(Number)
  const result = new Date(Date.UTC(year, month - 1, day, hour, minute + minutes))
  const pad = (n: number) => String(n).padStart(2, '0')
  return (
    `${result.getUTCFullYear()}-${pad(result.getUTCMonth() + 1)}-${pad(result.getUTCDate())}` +
    `T${pad(result.getUTCHours())}:${pad(result.getUTCMinutes())}`
  )
}

function pickStops(random: () => number): number {
  const value = random()
  if (value < 0.35) return 0
  if (value < 0.8) return 1
  return 2
}

function createLeg(
  random: () => number,
  origin: string,
  destination: string,
  date: string,
  baseDuration: number,
  stops: number,
): FlightLeg {
  const hubs = DEMO_HUBS.filter((hub) => hub !== origin && hub !== destination)
  const firstHub = Math.floor(random() * hubs.length)
  const stopAirports = Array.from({ length: stops }, (_, i) => hubs[(firstHub + i) % hubs.length])
  const layoverMinutes = stops * (60 + Math.floor(random() * 180))
  // Round to 5 minutes so times look realistic.
  const durationMinutes = Math.round((baseDuration + layoverMinutes + random() * 30) / 5) * 5

  const hour = 5 + Math.floor(random() * 18)
  const minute = Math.floor(random() * 12) * 5
  const departureTime = `${date}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`

  return {
    origin,
    destination,
    departureTime,
    // Simplification: demo arrival times ignore time zone differences.
    arrivalTime: addMinutes(departureTime, durationMinutes),
    durationMinutes,
    stops,
    stopAirports,
  }
}

export function generateDemoOffers(search: FlightSearch): FlightOffer[] {
  const from = search.origin.iata
  const to = search.destination.iata

  // Route-based values stay the same for a route regardless of dates.
  const routeRandom = createRandom(hashString([from, to].sort().join('-')))
  const baseDuration = 90 + Math.floor(routeRandom() * 720) // 1.5h – 13.5h flight time
  const baseFare = (60 + baseDuration * 0.75) * (0.8 + routeRandom() * 0.5)

  const random = createRandom(
    hashString([from, to, search.departureDate, search.returnDate ?? '', search.travelClass].join('|')),
  )
  const count = 10 + Math.floor(random() * 7)

  return Array.from({ length: count }, (_, index): FlightOffer => {
    const airline = DEMO_AIRLINES[Math.floor(random() * DEMO_AIRLINES.length)]
    const stops = pickStops(random)
    const outbound = createLeg(random, from, to, search.departureDate, baseDuration, stops)
    const inbound = search.returnDate
      ? createLeg(random, to, from, search.returnDate, baseDuration, pickStops(random))
      : null

    // Direct flights cost more; random variation makes each offer different.
    const stopsDiscount = 1 - 0.12 * stops
    const variation = 0.85 + random() * 0.5
    const tripFactor = inbound ? 1.8 : 1
    const perPassenger =
      baseFare * CLASS_MULTIPLIER[search.travelClass] * stopsDiscount * variation * tripFactor

    return {
      id: `demo-${index}`,
      source: 'demo',
      airline: { name: airline },
      outbound,
      inbound,
      price: { total: Math.round(perPassenger) * search.adults, currency: 'USD' },
      provider: 'Demo provider',
      bookingUrl: null,
    }
  }).sort((a, b) => a.price.total - b.price.total)
}
