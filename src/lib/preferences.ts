// Options for the user's profile preferences.
// Codes must match the database checks: currency = 3 uppercase letters (ISO 4217),
// language = one of the values allowed in profiles.preferred_language.

import { getLocaleTag } from '../i18n/locale'

export const CURRENCIES = [
  { code: 'USD', name: 'US Dollar' },
  { code: 'EUR', name: 'Euro' },
  { code: 'GBP', name: 'British Pound' },
  { code: 'TRY', name: 'Turkish Lira' },
  { code: 'AZN', name: 'Azerbaijani Manat' },
  { code: 'CHF', name: 'Swiss Franc' },
  { code: 'CAD', name: 'Canadian Dollar' },
  { code: 'AUD', name: 'Australian Dollar' },
  { code: 'JPY', name: 'Japanese Yen' },
  { code: 'AED', name: 'UAE Dirham' },
  { code: 'INR', name: 'Indian Rupee' },
] as const

export const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'tr', name: 'Türkçe' },
] as const

export type CurrencyCode = (typeof CURRENCIES)[number]['code']
export type LanguageCode = (typeof LANGUAGES)[number]['code']

// Currency names in the user's language, from the browser ("Azerbaycan Manatı").
export function getCurrencyName(code: string): string {
  try {
    return new Intl.DisplayNames([getLocaleTag()], { type: 'currency' }).of(code) ?? code
  } catch {
    return CURRENCIES.find((currency) => currency.code === code)?.name ?? code
  }
}

export function getLanguageName(code: string): string {
  return LANGUAGES.find((language) => language.code === code)?.name ?? code
}
