import { BellPlus, BellRing, X } from 'lucide-react'
import { useId, useRef, useState, type FormEvent } from 'react'
import { Link, useLocation } from 'react-router'
import { buttonStyles } from '../../components/ui/button-styles'
import FormAlert from '../../components/ui/FormAlert'
import { inputClass, labelClass } from '../../components/ui/form-styles'
import TextField from '../../components/ui/TextField'
import { formatPrice } from '../../lib/format'
import { useAuth } from '../auth/auth-context'
import type { FlightSearch } from '../search/model'
import { AlertError, createAlert, findExistingAlert } from './alerts-api'
import { suggestTargetPrice, validateTargetPrice } from './target-price'

const FLEXIBLE_OPTIONS = [
  { value: 3, label: '± 3 days (recommended: more fares found)' },
  { value: 2, label: '± 2 days' },
  { value: 1, label: '± 1 day' },
  { value: 0, label: 'Exact dates only' },
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
        Log in to track price
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
    setFieldError(validationError)
    if (validationError || !currency) return

    setStatus('saving')
    setError(null)
    try {
      await createAlert({ search, targetPrice: Number(targetPrice), currency, flexibleDays })
      setStatus('saved')
    } catch (caught) {
      setStatus('idle')
      setError(caught instanceof AlertError ? caught.message : 'Something went wrong. Please try again.')
    }
  }

  return (
    <>
      <button type="button" onClick={open} disabled={!currency} className={buttonStyles('accent', 'md')}>
        <BellPlus className="size-4" aria-hidden="true" />
        Track price
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
                Track this trip
              </h2>
              <p className="mt-1 text-sm text-ink-muted">
                {search.origin.iata} → {search.destination.iata} · {search.departureDate}
                {search.returnDate && ` – ${search.returnDate}`} · {search.adults}{' '}
                {search.adults === 1 ? 'passenger' : 'passengers'}
              </p>
            </div>
            <button
              type="button"
              onClick={close}
              aria-label="Close"
              className="rounded-md p-1 text-ink-subtle hover:bg-surface-muted hover:text-ink"
            >
              <X className="size-5" aria-hidden="true" />
            </button>
          </div>

          <div className="mt-5">
            {status === 'checking' && <p className="text-sm text-ink-muted">Checking your alerts…</p>}

            {status === 'exists' && (
              <div className="space-y-4">
                <FormAlert variant="success">You are already tracking this trip.</FormAlert>
                <Link to="/dashboard" className={buttonStyles('primary', 'md', 'w-full')}>
                  Go to my alerts
                </Link>
              </div>
            )}

            {status === 'saved' && (
              <div className="space-y-4 text-center">
                <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                  <BellRing className="size-6" aria-hidden="true" />
                </span>
                <p className="text-sm text-ink-muted">
                  Alert created. We will check this trip regularly and notify you when the fare drops to{' '}
                  <strong className="text-ink">{formatPrice(Number(targetPrice), currency ?? 'USD')}</strong>{' '}
                  or less.
                </p>
                <Link to="/dashboard" className={buttonStyles('primary', 'md', 'w-full')}>
                  View my alerts
                </Link>
              </div>
            )}

            {(status === 'idle' || status === 'saving') && (
              <form onSubmit={handleSubmit} noValidate className="space-y-4">
                {error && <FormAlert variant="error">{error}</FormAlert>}
                <TextField
                  label={`Target price per person (${currency})`}
                  type="number"
                  inputMode="decimal"
                  min={1}
                  step="any"
                  value={targetPrice}
                  onChange={(event) => setTargetPrice(event.target.value)}
                  error={fieldError}
                  hint={
                    lowestPrice
                      ? `Lowest fare found right now: ${formatPrice(lowestPrice, currency ?? 'USD')}`
                      : undefined
                  }
                />
                <div>
                  <label htmlFor={flexibleId} className={`${labelClass} text-sm`}>
                    Dates
                  </label>
                  <select
                    id={flexibleId}
                    value={flexibleDays}
                    onChange={(event) => setFlexibleDays(Number(event.target.value))}
                    className={inputClass}
                  >
                    {FLEXIBLE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="submit"
                  disabled={status === 'saving'}
                  className={buttonStyles('primary', 'md', 'w-full')}
                >
                  {status === 'saving' ? 'Creating alert…' : 'Create price alert'}
                </button>
              </form>
            )}
          </div>
        </div>
      </dialog>
    </>
  )
}
