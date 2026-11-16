import { BellPlus, BellRing, X } from 'lucide-react'
import { useId, useRef, useState, type FormEvent } from 'react'
import { Link, useLocation } from 'react-router'
import { buttonStyles } from '../../components/ui/button-styles'
import FormAlert from '../../components/ui/FormAlert'
import { inputClass, labelClass } from '../../components/ui/form-styles'
import TextField from '../../components/ui/TextField'
import { formatPrice } from '../../lib/format'
import type { MessageKey } from '../../i18n/translate'
import { useAuth } from '../auth/auth-context'
import { useT } from '../preferences/preferences-context'
import type { FlightSearch } from '../search/model'
import { AlertError, createAlert, findExistingAlert } from './alerts-api'
import { suggestTargetPrice, validateTargetPrice } from './target-price'

const FLEXIBLE_OPTIONS: { value: number; labelKey: MessageKey }[] = [
  { value: 3, labelKey: 'track.flex3' },
  { value: 2, labelKey: 'track.flex2' },
  { value: 1, labelKey: 'track.flex1' },
  { value: 0, labelKey: 'track.flex0' },
]

type Status = 'idle' | 'checking' | 'exists' | 'saving' | 'saved'

export default function TrackPriceButton({
  search,
  currency,
  lowestPrice,
}: {
  search: FlightSearch
  currency: string | null
  lowestPrice: number | null // per person, from the current results
}) {
  const t = useT()
  const { user } = useAuth()
  const location = useLocation()
  const dialogRef = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  const flexibleId = useId()
  const [targetPrice, setTargetPrice] = useState('')
  const [flexibleDays, setFlexibleDays] = useState(3)
  const [fieldError, setFieldError] = useState<string>()
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<Status>('idle')

  // Visitors are asked to log in first and are brought back to this search.
  if (!user) {
    const redirect = encodeURIComponent(location.pathname + location.search)
    return (
      <Link to={`/login?redirect=${redirect}`} className={buttonStyles('secondary', 'md')}>
        <BellPlus className="size-4" aria-hidden="true" />
        {t('track.login')}
      </Link>
    )
  }

  async function open() {
    setTargetPrice(suggestTargetPrice(lowestPrice))
    setFieldError(undefined)
    setError(null)
    setStatus('checking')
    dialogRef.current?.showModal()
    try {
      setStatus((await findExistingAlert(search)) ? 'exists' : 'idle')
    } catch {
      setStatus('idle') // not critical: the user can still create the alert
    }
  }

  function close() {
    dialogRef.current?.close()
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const validationError = validateTargetPrice(targetPrice)
    setFieldError(validationError && t(validationError))
    if (validationError || !currency) return

    setStatus('saving')
    setError(null)
    try {
      await createAlert({ search, targetPrice: Number(targetPrice), currency, flexibleDays })
      setStatus('saved')
    } catch (caught) {
      setStatus('idle')
      setError(t(caught instanceof AlertError ? caught.messageKey : 'common.genericError'))
    }
  }

  return (
    <>
      <button type="button" onClick={open} disabled={!currency} className={buttonStyles('accent', 'md')}>
        <BellPlus className="size-4" aria-hidden="true" />
        {t('track.button')}
      </button>

      {/* Native <dialog>: handles focus, Escape key and screen readers for us. */}
      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        onClick={(event) => {
          if (event.target === dialogRef.current) close() // click on the dark backdrop
        }}
        className="m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl border border-line bg-surface p-0 text-ink shadow-2xl backdrop:bg-slate-900/50"
      >
        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 id={titleId} className="text-lg font-semibold">
                {t('track.title')}
              </h2>
              <p className="mt-1 text-sm text-ink-muted">
                {search.origin.iata} → {search.destination.iata} · {search.departureDate}
                {search.returnDate && ` – ${search.returnDate}`} ·{' '}
                {t(search.adults === 1 ? 'common.passenger' : 'common.passengers', { count: search.adults })}
              </p>
            </div>
            <button
              type="button"
              onClick={close}
              aria-label={t('common.close')}
              className="rounded-md p-1 text-ink-subtle hover:bg-surface-muted hover:text-ink"
            >
              <X className="size-5" aria-hidden="true" />
            </button>
          </div>

          <div className="mt-5">
            {status === 'checking' && <p className="text-sm text-ink-muted">{t('track.checking')}</p>}

            {status === 'exists' && (
              <div className="space-y-4">
                <FormAlert variant="success">{t('track.exists')}</FormAlert>
                <Link to="/dashboard" className={buttonStyles('primary', 'md', 'w-full')}>
                  {t('track.goToAlerts')}
                </Link>
              </div>
            )}

            {status === 'saved' && (
              <div className="space-y-4 text-center">
                <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                  <BellRing className="size-6" aria-hidden="true" />
                </span>
                <p className="text-sm text-ink-muted">
                  {t('track.created', { price: formatPrice(Number(targetPrice), currency ?? 'USD') })}
                </p>
                <Link to="/dashboard" className={buttonStyles('primary', 'md', 'w-full')}>
                  {t('common.viewMyAlerts')}
                </Link>
              </div>
            )}

            {(status === 'idle' || status === 'saving') && (
              <form onSubmit={handleSubmit} noValidate className="space-y-4">
                {error && <FormAlert variant="error">{error}</FormAlert>}
                <TextField
                  label={t('track.targetLabel', { currency: currency ?? '' })}
                  type="number"
                  inputMode="decimal"
                  min={1}
                  step="any"
                  value={targetPrice}
                  onChange={(event) => setTargetPrice(event.target.value)}
                  error={fieldError}
                  hint={
                    lowestPrice
                      ? t('track.lowestNow', { price: formatPrice(lowestPrice, currency ?? 'USD') })
                      : undefined
                  }
                />
                <div>
                  <label htmlFor={flexibleId} className={`${labelClass} text-sm`}>
                    {t('track.dates')}
                  </label>
                  <select
                    id={flexibleId}
                    value={flexibleDays}
                    onChange={(event) => setFlexibleDays(Number(event.target.value))}
                    className={inputClass}
                  >
                    {FLEXIBLE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {t(option.labelKey)}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="submit"
                  disabled={status === 'saving'}
                  className={buttonStyles('primary', 'md', 'w-full')}
                >
                  {t(status === 'saving' ? 'track.creating' : 'track.create')}
                </button>
              </form>
            )}
          </div>
        </div>
      </dialog>
    </>
  )
}
