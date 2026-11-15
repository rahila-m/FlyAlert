import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { setActiveLanguage, type Language } from '../../i18n/locale'
import { translate, type MessageKey, type TranslateVars } from '../../i18n/translate'
import { CURRENCIES } from '../../lib/preferences'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../auth/auth-context'
import { PreferencesContext } from './preferences-context'

const STORAGE_KEY = 'flyalert:preferences'
const SUPPORTED_CURRENCIES: string[] = CURRENCIES.map((currency) => currency.code)

interface Stored {
  language: Language
  currency: string
}

function isLanguage(value: unknown): value is Language {
  return value === 'en' || value === 'tr'
}

// First visit: guess from the browser language (Turkish browser -> Turkish + TRY).
function detectDefaults(): Stored {
  const isTurkish = typeof navigator !== 'undefined' && navigator.language.toLowerCase().startsWith('tr')
  return isTurkish ? { language: 'tr', currency: 'TRY' } : { language: 'en', currency: 'USD' }
}

function loadStored(): Stored {
  const defaults = detectDefaults()
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null') as Partial<Stored> | null
    return {
      language: isLanguage(parsed?.language) ? parsed.language : defaults.language,
      currency:
        parsed?.currency && SUPPORTED_CURRENCIES.includes(parsed.currency) ? parsed.currency : defaults.currency,
    }
  } catch {
    return defaults // storage unavailable (private mode etc.)
  }
}

function saveStored(value: Stored) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
  } catch {
    // Not critical: preferences then last for this visit only.
  }
}

// Language and currency for the whole app.
//  • Visitors: kept in this browser (localStorage).
//  • Logged-in users: loaded from and saved to their profile in the database,
//    so the choice follows them to other devices.
export default function PreferencesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [prefs, setPrefs] = useState<Stored>(loadStored)

  // After login, the profile's saved preferences win.
  useEffect(() => {
    if (!user) return
    let isCancelled = false
    supabase
      .from('profiles')
      .select('preferred_language, preferred_currency')
      .single()
      .then(({ data }) => {
        if (isCancelled || !data) return
        const fromProfile = {
          language: isLanguage(data.preferred_language) ? data.preferred_language : 'en',
          currency: data.preferred_currency,
        } satisfies Stored
        setPrefs(fromProfile)
        saveStored(fromProfile)
      })
    return () => {
      isCancelled = true
    }
  }, [user])

  const update = useCallback(
    (changes: Partial<Stored>) => {
      setPrefs((previous) => {
        const next = { ...previous, ...changes }
        saveStored(next)
        return next
      })
      if (user) {
        const columns: Record<string, string> = {}
        if (changes.language) columns.preferred_language = changes.language
        if (changes.currency) columns.preferred_currency = changes.currency
        // Fire and forget: the UI already shows the new choice.
        supabase
          .from('profiles')
          .update(columns)
          .eq('id', user.id)
          .then(({ error }) => {
            if (error) console.error('Could not save preferences', error.message)
          })
      }
    },
    [user],
  )

  // Formatting helpers read the active language, so set it before children render.
  setActiveLanguage(prefs.language)

  useEffect(() => {
    document.documentElement.lang = prefs.language
  }, [prefs.language])

  const value = useMemo(
    () => ({
      language: prefs.language,
      currency: prefs.currency,
      setLanguage: (language: Language) => update({ language }),
      setCurrency: (currency: string) => update({ currency }),
      t: (key: MessageKey, vars?: TranslateVars) => translate(prefs.language, key, vars),
    }),
    [prefs, update],
  )

  return <PreferencesContext value={value}>{children}</PreferencesContext>
}
