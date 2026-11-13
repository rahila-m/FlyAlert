// Core types and constants for flight search.

export type TripType = 'round-trip' | 'one-way'

// Values match the travel class codes used by flight APIs such as Amadeus.
export const TRAVEL_CLASSES = [
  { value: 'ECONOMY', label: 'Economy' },
  { value: 'PREMIUM_ECONOMY', label: 'Premium Economy' },
  { value: 'BUSINESS', label: 'Business' },
  { value: 'FIRST', label: 'First' },
] as const

export type TravelClass = (typeof TRAVEL_CLASSES)[number]['value']

export const MAX_PASSENGERS = 9

export interface Airport {
  iata: string // 3-letter airport or city code, e.g. "IST" or "LON"
  name: string
  city: string
  country: string
  // 'city' means all airports of a city (e.g. LON = Heathrow, Gatwick, Stansted…).
  kind?: 'airport' | 'city'
}

// What the search form holds while the user is editing (may be incomplete).
export interface SearchFormValues {
  tripType: TripType
  origin: Airport | null
  destination: Airport | null
  departureDate: string // "YYYY-MM-DD" or ""
  returnDate: string // "YYYY-MM-DD" or ""
  adults: number // children and infants will be added later
  travelClass: TravelClass
}

// A complete, validated search.
export interface FlightSearch {
  tripType: TripType
  origin: Airport
  destination: Airport
  departureDate: string
  returnDate: string | null
  adults: number
  travelClass: TravelClass
}

// One direction of a trip (outbound or return).
export interface FlightLeg {
  origin: string // IATA code
  destination: string // IATA code
  // Local departure time at the airport, "YYYY-MM-DDTHH:mm" (API values may add ":ss+03:00").
  // Arrival times aren't provided by our data source, so we show the duration instead.
  departureAt: string
  durationMinutes: number | null // null when unknown
  stops: number
  stopAirports: string[] // IATA codes of connection airports (may be empty if unknown)
}

export interface FlightOffer {
  id: string
  // Where the offer came from. "demo" offers are generated locally and are NOT real.
  source: 'demo' | 'api'
  airline: { name: string; code: string | null }
  flightNumber: string | null
  outbound: FlightLeg
  inbound: FlightLeg | null // null for one-way trips
  price: { perPerson: number; currency: string } // economy fare for one adult
  provider: string
  bookingUrl: string | null // null when the offer cannot be booked (e.g. demo data)
  // Whether the flight is on the requested dates, or a few days before/after.
  dateMatch: 'exact' | 'nearby'
  departureDayOffset: number
  returnDayOffset: number | null
}

export const EMPTY_SEARCH: SearchFormValues = {
  tripType: 'round-trip',
  origin: null,
  destination: null,
  departureDate: '',
  returnDate: '',
  adults: 1,
  travelClass: 'ECONOMY',
}

export function getTravelClassLabel(value: TravelClass): string {
  return TRAVEL_CLASSES.find((travelClass) => travelClass.value === value)?.label ?? value
}

export function formatAirport(airport: Airport): string {
  // Code-only places (no known name) are shown as just the code.
  if (airport.city === airport.iata) return airport.iata
  return airport.kind === 'city'
    ? `${airport.city} (${airport.iata}, all airports)`
    : `${airport.city} (${airport.iata})`
}
