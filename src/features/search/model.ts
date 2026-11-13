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
