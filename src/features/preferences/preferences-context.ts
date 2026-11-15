import { createContext, useContext } from 'react'
import type { Language } from '../../i18n/locale'
import type { MessageKey, TranslateVars } from '../../i18n/translate'

export interface PreferencesState {
  language: Language
  currency: string
  setLanguage: (language: Language) => void
  setCurrency: (currency: string) => void
  // Translate a text key into the current language.
  t: (key: MessageKey, vars?: TranslateVars) => string
}

export const PreferencesContext = createContext<PreferencesState | null>(null)

export function usePreferences(): PreferencesState {
  const context = useContext(PreferencesContext)
  if (!context) throw new Error('usePreferences must be used inside <PreferencesProvider>')
  return context
}

// Shortcut for components that only need translations.
export function useT() {
  return usePreferences().t
}
