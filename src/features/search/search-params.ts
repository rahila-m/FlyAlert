import type { MessageKey } from '../../i18n/translate'
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

// Errors are translation keys; the form turns them into text in the user's language.
export type SearchErrors = Partial<
  Record<'origin' | 'destination' | 'departureDate' | 'returnDate' | 'adults', MessageKey>
>

export function validateSearch(values: SearchFormValues, today: string): SearchErrors {
  const errors: SearchErrors = {}

  if (!values.origin) errors.origin = 'search.error.origin'
  if (!values.destination) {
    errors.destination = 'search.error.destination'
  } else if (values.origin?.iata === values.destination.iata) {
    errors.destination = 'search.error.sameAirport'
  }

  if (!values.departureDate) errors.departureDate = 'search.error.departureMissing'
  else if (!isIsoDate(values.departureDate)) errors.departureDate = 'search.error.invalidDate'
  else if (values.departureDate < today) errors.departureDate = 'search.error.pastDate'

  if (values.tripType === 'round-trip') {
    if (!values.returnDate) errors.returnDate = 'search.error.returnMissing'
    else if (!isIsoDate(values.returnDate)) errors.returnDate = 'search.error.invalidDate'
    else if (values.departureDate && values.returnDate < values.departureDate) {
      errors.returnDate = 'search.error.returnBeforeDeparture'
    }
  }

  if (!Number.isInteger(values.adults) || values.adults < 1 || values.adults > MAX_PASSENGERS) {
    errors.adults = 'search.error.passengers'
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
