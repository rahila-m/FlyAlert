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
  iata: string // 3-letter airport code, e.g. "IST"
  name: string
  city: string
  country: string
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
  departureTime: string // local airport time, "YYYY-MM-DDTHH:mm"
  arrivalTime: string // local airport time, "YYYY-MM-DDTHH:mm"
  durationMinutes: number
  stops: number
  stopAirports: string[] // IATA codes of connection airports
}

export interface FlightOffer {
  id: string
  // Where the offer came from. "demo" offers are generated locally and are NOT real.
  source: 'demo' | 'api'
  airline: { name: string }
  outbound: FlightLeg
  inbound: FlightLeg | null // null for one-way trips
  price: { total: number; currency: string } // total for all passengers
  provider: string
  bookingUrl: string | null // null when the offer cannot be booked (e.g. demo data)
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
  return `${airport.city} (${airport.iata})`
}
