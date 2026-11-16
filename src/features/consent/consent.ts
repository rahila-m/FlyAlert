// Cookie / tracking consent (KVKK, GDPR, ePrivacy).
//
// Today FlyAlert only uses storage that is strictly necessary (login session,
// language/currency, recent airports), which doesn't need consent.
// When ads or analytics are added, list them in OPTIONAL_CATEGORIES: the
// consent banner then appears automatically, "Reject" is as easy as "Accept",
// and nothing optional may load until `hasConsent(category)` is true.

import { useSyncExternalStore } from 'react'

export type ConsentCategory = 'ads' | 'analytics'

// Categories actually in use on the site. Empty = no banner needed.
export const OPTIONAL_CATEGORIES: ConsentCategory[] = []

const STORAGE_KEY = 'flyalert:consent'

// The footer's "Cookie settings" link opens the dialog through this event.
export const OPEN_COOKIE_SETTINGS_EVENT = 'flyalert:open-cookie-settings'

export function openCookieSettings() {
  window.dispatchEvent(new Event(OPEN_COOKIE_SETTINGS_EVENT))
}

export interface ConsentChoice {
  categories: Partial<Record<ConsentCategory, boolean>>
  decidedAt: string
}

let current: ConsentChoice | null = read()
const listeners = new Set<() => void>()

function read(): ConsentChoice | null {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null') as ConsentChoice | null
  } catch {
    return null
  }
}

export function saveConsent(categories: Partial<Record<ConsentCategory, boolean>>) {
  current = { categories, decidedAt: new Date().toISOString() }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(current))
  } catch {
    // Storage blocked: the choice still applies for this visit.
  }
  listeners.forEach((listener) => listener())
}

export function hasConsent(category: ConsentCategory): boolean {
  return current?.categories[category] === true
}

// True when an optional category is in use and the user hasn't decided on it yet.
export function needsDecision(choice: ConsentChoice | null): boolean {
  return OPTIONAL_CATEGORIES.some((category) => choice?.categories[category] === undefined)
}

export function useConsent(): ConsentChoice | null {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    () => current,
  )
}
