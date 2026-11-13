import { useEffect, useId, useState, type FormEvent } from 'react'
import { buttonStyles } from '../../components/ui/button-styles'
import FormAlert from '../../components/ui/FormAlert'
import { inputClass, labelClass } from '../../components/ui/form-styles'
import { CURRENCIES, LANGUAGES } from '../../lib/preferences'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../auth/auth-context'

interface Preferences {
  preferred_currency: string
  preferred_language: string
}

export default function PreferencesForm() {
  const { user } = useAuth()
  const currencyId = useId()
  const languageId = useId()
  const [saved, setSaved] = useState<Preferences | null>(null) // last values stored in the database
  const [form, setForm] = useState<Preferences | null>(null) // values being edited
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [loadError, setLoadError] = useState(false)

  useEffect(() => {
    let isCancelled = false
    supabase
      .from('profiles')
      .select('preferred_currency, preferred_language')
      .single()
      .then(({ data, error }) => {
        if (isCancelled) return
        if (error || !data) {
          setLoadError(true)
          return
        }
        setSaved(data)
        setForm(data)
      })
    return () => {
      isCancelled = true
    }
  }, [])

  const hasChanges =
    form !== null &&
    saved !== null &&
    (form.preferred_currency !== saved.preferred_currency ||
      form.preferred_language !== saved.preferred_language)

  function update(key: keyof Preferences, value: string) {
    setForm((previous) => (previous ? { ...previous, [key]: value } : previous))
    setStatus('idle')
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!form || !user) return

    setStatus('saving')
    // Only these two columns may be updated by users (enforced by database grants).
    const { error } = await supabase
      .from('profiles')
      .update({
        preferred_currency: form.preferred_currency,
        preferred_language: form.preferred_language,
      })
      .eq('id', user.id)

    if (error) {
      setStatus('error')
      return
    }
    setSaved(form)
    setStatus('saved')
  }

  if (loadError) {
    return <FormAlert variant="error">We could not load your preferences. Please refresh the page.</FormAlert>
  }
  if (!form) {
    return <p className="text-sm text-ink-muted">Loading…</p>
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {status === 'saved' && <FormAlert variant="success">Your preferences have been saved.</FormAlert>}
      {status === 'error' && (
        <FormAlert variant="error">Your preferences could not be saved. Please try again.</FormAlert>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor={currencyId} className={`${labelClass} text-sm`}>
            Preferred currency
          </label>
          <select
            id={currencyId}
            value={form.preferred_currency}
            onChange={(event) => update('preferred_currency', event.target.value)}
            className={inputClass}
          >
            {CURRENCIES.map((currency) => (
              <option key={currency.code} value={currency.code}>
                {currency.code} — {currency.name}
              </option>
            ))}
          </select>
          <p className="mt-1.5 text-xs text-ink-subtle">Used for prices and new alerts.</p>
        </div>

        <div>
          <label htmlFor={languageId} className={`${labelClass} text-sm`}>
            Language
          </label>
          <select
            id={languageId}
            value={form.preferred_language}
            onChange={(event) => update('preferred_language', event.target.value)}
            className={inputClass}
          >
            {LANGUAGES.map((language) => (
              <option key={language.code} value={language.code}>
                {language.name}
              </option>
            ))}
          </select>
          <p className="mt-1.5 text-xs text-ink-subtle">
            The app is in English for now. Your choice is saved for when more languages arrive.
          </p>
        </div>
      </div>

      <button
        type="submit"
        disabled={!hasChanges || status === 'saving'}
        className={buttonStyles('primary', 'md')}
      >
        {status === 'saving' ? 'Saving…' : 'Save preferences'}
      </button>
    </form>
  )
}
