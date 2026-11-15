// The active language for number/date formatting helpers (lib/format.ts, lib/dates.ts).
// PreferencesProvider updates it before the app renders, so every component
// formats prices and dates in the user's language.

export type Language = 'en' | 'tr'

const LOCALE_TAGS: Record<Language, string> = { en: 'en-US', tr: 'tr-TR' }

let activeLanguage: Language = 'en'

export function setActiveLanguage(language: Language) {
  activeLanguage = language
}

export function getActiveLanguage(): Language {
  return activeLanguage
}

// e.g. "tr-TR", used by Intl.NumberFormat / Intl.DateTimeFormat
export function getLocaleTag(): string {
  return LOCALE_TAGS[activeLanguage]
}
