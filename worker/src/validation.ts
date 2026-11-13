// Validates the search request. Everything coming from the browser is
// untrusted, so each value is checked before it is used.

export const SUPPORTED_CURRENCIES = ['USD', 'EUR', 'GBP', 'TRY', 'CHF', 'CAD', 'AUD', 'JPY', 'AED', 'INR']

export interface SearchRequest {
  origin: string // IATA city or airport code
  destination: string
  departureDate: string // YYYY-MM-DD
  returnDate: string | null
  adults: number
  currency: string
}

export type ValidationResult =
  | { ok: true; value: SearchRequest }
  | { ok: false; errors: Record<string, string> }

const IATA = /^[A-Z]{3}$/

export function isIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const date = new Date(`${value}T00:00:00Z`)
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
}

export function addDays(isoDate: string, days: number): string {
  const date = new Date(`${isoDate}T00:00:00Z`)
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

export function parseSearchRequest(params: URLSearchParams, todayUtc: string): ValidationResult {
  const errors: Record<string, string> = {}
  const origin = (params.get('from') ?? '').toUpperCase()
  const destination = (params.get('to') ?? '').toUpperCase()
  const departureDate = params.get('depart') ?? ''
  const returnDate = params.get('return') || null
  const adults = Number(params.get('adults') ?? '1')
  const currency = (params.get('currency') ?? 'USD').toUpperCase()

  if (!IATA.test(origin)) errors.from = 'Must be a 3-letter IATA code.'
  if (!IATA.test(destination)) errors.to = 'Must be a 3-letter IATA code.'
  if (origin && origin === destination) errors.to = 'Must differ from origin.'

  // One day of tolerance: "today" in the user's time zone can be yesterday in UTC.
  if (!isIsoDate(departureDate)) errors.depart = 'Must be a date (YYYY-MM-DD).'
  else if (departureDate < addDays(todayUtc, -1)) errors.depart = 'Must not be in the past.'

  if (returnDate !== null) {
    if (!isIsoDate(returnDate)) errors.return = 'Must be a date (YYYY-MM-DD).'
    else if (isIsoDate(departureDate) && returnDate < departureDate) {
      errors.return = 'Must be on or after the departure date.'
    }
  }

  if (!Number.isInteger(adults) || adults < 1 || adults > 9) errors.adults = 'Must be between 1 and 9.'
  if (!SUPPORTED_CURRENCIES.includes(currency)) errors.currency = 'Unsupported currency.'

  if (Object.keys(errors).length > 0) return { ok: false, errors }
  return { ok: true, value: { origin, destination, departureDate, returnDate, adults, currency } }
}
