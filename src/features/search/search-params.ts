import { isIsoDate } from '../../lib/dates'
import { findAirport } from './airports'
import {
  EMPTY_SEARCH,
  MAX_PASSENGERS,
  TRAVEL_CLASSES,
  type FlightSearch,
  type SearchFormValues,
  type TravelClass,
} from './model'

// The search lives in the URL, e.g.
// /search?trip=round-trip&from=IST&to=JFK&depart=2026-12-10&return=2026-12-17&adults=1&class=ECONOMY
// This makes results shareable, bookmarkable and safe to refresh.

export type SearchErrors = Partial<
  Record<'origin' | 'destination' | 'departureDate' | 'returnDate' | 'adults', string>
>

export function validateSearch(values: SearchFormValues, today: string): SearchErrors {
  const errors: SearchErrors = {}

  if (!values.origin) errors.origin = 'Choose a departure airport from the list.'
  if (!values.destination) {
    errors.destination = 'Choose a destination airport from the list.'
  } else if (values.origin?.iata === values.destination.iata) {
    errors.destination = 'Destination must be different from departure.'
  }

  if (!values.departureDate) errors.departureDate = 'Choose a departure date.'
  else if (!isIsoDate(values.departureDate)) errors.departureDate = 'Enter a valid date.'
  else if (values.departureDate < today) errors.departureDate = 'Date cannot be in the past.'

  if (values.tripType === 'round-trip') {
    if (!values.returnDate) errors.returnDate = 'Choose a return date.'
    else if (!isIsoDate(values.returnDate)) errors.returnDate = 'Enter a valid date.'
    else if (values.departureDate && values.returnDate < values.departureDate) {
      errors.returnDate = 'Return must be on or after departure.'
    }
  }

  if (!Number.isInteger(values.adults) || values.adults < 1 || values.adults > MAX_PASSENGERS) {
    errors.adults = `Choose between 1 and ${MAX_PASSENGERS} passengers.`
  }

  return errors
}

export function hasErrors(errors: SearchErrors): boolean {
  return Object.keys(errors).length > 0
}

// Converts form values to a complete search. Call only after validation passes.
export function toFlightSearch(values: SearchFormValues): FlightSearch | null {
  if (!values.origin || !values.destination) return null
  return {
    tripType: values.tripType,
    origin: values.origin,
    destination: values.destination,
    departureDate: values.departureDate,
    returnDate: values.tripType === 'round-trip' ? values.returnDate : null,
    adults: values.adults,
    travelClass: values.travelClass,
  }
}

export function toSearchParams(search: FlightSearch): URLSearchParams {
  const params = new URLSearchParams({
    trip: search.tripType,
    from: search.origin.iata,
    to: search.destination.iata,
    depart: search.departureDate,
  })
  if (search.returnDate) params.set('return', search.returnDate)
  params.set('adults', String(search.adults))
  params.set('class', search.travelClass)
  return params
}

function isTravelClass(value: string | null): value is TravelClass {
  return TRAVEL_CLASSES.some((travelClass) => travelClass.value === value)
}

// Reads a search from the URL. Unknown or broken values are dropped,
// and `errors` tells the page what still needs fixing.
export function parseSearchParams(
  params: URLSearchParams,
  today: string,
): { values: SearchFormValues; errors: SearchErrors; isEmpty: boolean } {
  const tripType = params.get('trip') === 'one-way' ? 'one-way' : 'round-trip'
  const classParam = params.get('class')

  const values: SearchFormValues = {
    ...EMPTY_SEARCH,
    tripType,
    origin: findAirport(params.get('from') ?? '') ?? null,
    destination: findAirport(params.get('to') ?? '') ?? null,
    departureDate: params.get('depart') ?? '',
    returnDate: tripType === 'round-trip' ? (params.get('return') ?? '') : '',
    adults: params.has('adults') ? Number(params.get('adults')) : EMPTY_SEARCH.adults,
    travelClass: isTravelClass(classParam) ? classParam : EMPTY_SEARCH.travelClass,
  }

  return {
    values,
    errors: validateSearch(values, today),
    isEmpty: !params.has('from') && !params.has('to') && !params.has('depart'),
  }
}
