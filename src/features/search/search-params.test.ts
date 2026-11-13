import { describe, expect, it } from 'vitest'
import { findAirport } from './airports'
import { EMPTY_SEARCH, type SearchFormValues } from './model'
import { parseSearchParams, toFlightSearch, toSearchParams, validateSearch } from './search-params'

const TODAY = '2026-11-13'

const validValues: SearchFormValues = {
  ...EMPTY_SEARCH,
  origin: findAirport('IST')!,
  destination: findAirport('JFK')!,
  departureDate: '2026-12-10',
  returnDate: '2026-12-17',
}

describe('validateSearch', () => {
  it('accepts a complete round-trip search', () => {
    expect(validateSearch(validValues, TODAY)).toEqual({})
  })

  it('requires airports and dates', () => {
    const errors = validateSearch(EMPTY_SEARCH, TODAY)
    expect(Object.keys(errors).sort()).toEqual(['departureDate', 'destination', 'origin', 'returnDate'])
  })

  it('rejects the same origin and destination', () => {
    const errors = validateSearch({ ...validValues, destination: validValues.origin }, TODAY)
    expect(errors.destination).toBeDefined()
  })

  it('rejects past dates and impossible dates', () => {
    expect(validateSearch({ ...validValues, departureDate: '2026-11-12' }, TODAY).departureDate).toBeDefined()
    expect(validateSearch({ ...validValues, departureDate: '2027-02-30' }, TODAY).departureDate).toBeDefined()
  })

  it('accepts a departure today', () => {
    expect(validateSearch({ ...validValues, departureDate: TODAY }, TODAY).departureDate).toBeUndefined()
  })

  it('rejects a return before departure', () => {
    expect(validateSearch({ ...validValues, returnDate: '2026-12-01' }, TODAY).returnDate).toBeDefined()
  })

  it('ignores the return date for one-way trips', () => {
    expect(validateSearch({ ...validValues, tripType: 'one-way', returnDate: '' }, TODAY)).toEqual({})
  })
})

describe('URL round trip', () => {
  it('writes a search to the URL and reads it back unchanged', () => {
    const search = toFlightSearch(validValues)!
    const params = toSearchParams(search)
    const parsed = parseSearchParams(params, TODAY)
    expect(parsed.errors).toEqual({})
    expect(toFlightSearch(parsed.values)).toEqual(search)
  })

  it('drops invalid values from a tampered URL', () => {
    const parsed = parseSearchParams(
      new URLSearchParams('from=X%3Cscript%3E&to=LHR&depart=2026-12-10&class=HACK&adults=42'),
      TODAY,
    )
    expect(parsed.values.origin).toBeNull()
    expect(parsed.values.travelClass).toBe('ECONOMY')
    expect(parsed.errors.origin).toBeDefined()
    expect(parsed.errors.adults).toBeDefined()
  })

  it('accepts any valid 3-letter code, even without a known name (e.g. shared links)', () => {
    const parsed = parseSearchParams(new URLSearchParams('from=LON&to=BEG&depart=2026-12-10&trip=one-way'), TODAY)
    expect(parsed.errors).toEqual({})
    expect(parsed.values.origin?.iata).toBe('LON')
    expect(parsed.values.destination?.iata).toBe('BEG')
  })

  it('detects an empty URL', () => {
    expect(parseSearchParams(new URLSearchParams(), TODAY).isEmpty).toBe(true)
  })
})
