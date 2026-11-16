import { Check } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'
import Flag from '../../components/ui/Flag'
import { inputClass, labelClass } from '../../components/ui/form-styles'
import type { Language } from '../../i18n/locale'
import { CURRENCIES, getCurrencyName, LANGUAGES } from '../../lib/preferences'
import { useAuth } from '../auth/auth-context'
import { usePreferences } from './preferences-context'

// Compact "[flag] TR · TRY" button in the navbar that opens language & currency choices.
export default function PreferencesMenu() {
  const { language, currency, setLanguage, setCurrency, t } = usePreferences()
  const { user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const panelId = useId()
  const languageId = useId()
  const currencyId = useId()

  // Close when clicking outside or pressing Escape.
  useEffect(() => {
    if (!isOpen) return
    const onPointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setIsOpen(false)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [isOpen])

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        aria-controls={panelId}
        aria-label={`${t('prefs.button')}: ${language.toUpperCase()}, ${currency}`}
        className="flex h-9 items-center gap-1.5 rounded-lg px-2 text-sm font-medium text-ink-muted transition hover:bg-surface-muted hover:text-ink"
      >
        <Flag language={language} />
        <span>
          {language.toUpperCase()} · {currency}
        </span>
      </button>

      {isOpen && (
        <div
          id={panelId}
          className="absolute right-0 z-50 mt-2 w-64 rounded-2xl border border-line bg-surface p-4 shadow-xl"
        >
          <h2 className="text-sm font-semibold text-ink">{t('prefs.title')}</h2>
          <div className="mt-3 space-y-3">
            {/* Language: two buttons with flags (a <select> can't show pictures). */}
            <div role="radiogroup" aria-labelledby={languageId}>
              <p id={languageId} className={labelClass}>
                {t('prefs.language')}
              </p>
              <div className="mt-1 grid grid-cols-2 gap-2">
                {LANGUAGES.map((option) => {
                  const isSelected = option.code === language
                  return (
                    <button
                      key={option.code}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      onClick={() => setLanguage(option.code as Language)}
                      className={`flex items-center gap-2 rounded-xl border px-2.5 py-2 text-sm font-medium transition ${
                        isSelected
                          ? 'border-brand-500 bg-brand-50 text-brand-700 ring-1 ring-brand-500'
                          : 'border-line text-ink-muted hover:border-brand-200 hover:bg-surface-muted hover:text-ink'
                      }`}
                    >
                      <Flag language={option.code as Language} />
                      <span className="flex-1 text-left">{option.name}</span>
                      {isSelected && <Check className="size-4" aria-hidden="true" />}
                    </button>
                  )
                })}
              </div>
            </div>
            <div>
              <label htmlFor={currencyId} className={labelClass}>
                {t('prefs.currency')}
              </label>
              <select
                id={currencyId}
                value={currency}
                onChange={(event) => setCurrency(event.target.value)}
                className={inputClass}
              >
                {CURRENCIES.map((option) => (
                  <option key={option.code} value={option.code}>
                    {option.code} — {getCurrencyName(option.code)}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {user && <p className="mt-3 text-xs text-ink-subtle">{t('prefs.note')}</p>}
        </div>
      )}
    </div>
  )
}
