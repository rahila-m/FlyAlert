import { ArrowRight, Pause, Pencil, Play, Search, Trash2 } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link } from 'react-router'
import { buttonStyles } from '../../components/ui/button-styles'
import TextField from '../../components/ui/TextField'
import { formatDisplayDate } from '../../lib/dates'
import { formatPrice } from '../../lib/format'
import { findAirport } from '../search/airports'
import { AlertError, deleteAlert, setAlertActive, updateTargetPrice, type FlightAlert } from './alerts-api'
import { validateTargetPrice } from './target-price'

function placeName(code: string): string {
  const place = findAirport(code)
  return place && place.city !== code ? place.city : code
}

function searchUrl(alert: FlightAlert): string {
  const params = new URLSearchParams({
    trip: alert.trip_type,
    from: alert.origin_iata,
    to: alert.destination_iata,
    depart: alert.departure_date,
  })
  if (alert.return_date) params.set('return', alert.return_date)
  params.set('adults', String(alert.adults))
  params.set('class', 'ECONOMY')
  return `/search?${params}`
}

const smallButton = 'inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium transition'

export default function AlertCard({ alert, onChanged }: { alert: FlightAlert; onChanged: () => void }) {
  const [mode, setMode] = useState<'view' | 'edit' | 'confirm-delete'>('view')
  const [target, setTarget] = useState(String(alert.target_price))
  const [fieldError, setFieldError] = useState<string>()
  const [error, setError] = useState<string | null>(null)
  const [isBusy, setIsBusy] = useState(false)

  async function run(action: () => Promise<void>) {
    setIsBusy(true)
    setError(null)
    try {
      await action()
      setMode('view')
      onChanged()
    } catch (caught) {
      setError(caught instanceof AlertError ? caught.message : 'Something went wrong. Please try again.')
    } finally {
      setIsBusy(false)
    }
  }

  function saveTarget(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const validationError = validateTargetPrice(target)
    setFieldError(validationError)
    if (!validationError) run(() => updateTargetPrice(alert.id, Number(target)))
  }

  const dates = alert.return_date
    ? `${formatDisplayDate(alert.departure_date)} – ${formatDisplayDate(alert.return_date)}`
    : formatDisplayDate(alert.departure_date)

  return (
    <article
      className={`rounded-2xl border bg-surface p-5 shadow-sm transition ${alert.is_active ? 'border-line' : 'border-dashed border-line opacity-80'}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="flex flex-wrap items-center gap-x-2 font-semibold text-ink">
            {placeName(alert.origin_iata)}
            <ArrowRight className="size-4 text-ink-subtle" aria-label="to" />
            {placeName(alert.destination_iata)}
          </h3>
          <p className="mt-1 text-sm text-ink-muted">
            {alert.origin_iata} → {alert.destination_iata} · {dates}
            {alert.flexible_days > 0 && ` (± ${alert.flexible_days} days)`} · {alert.adults}{' '}
            {alert.adults === 1 ? 'passenger' : 'passengers'}
          </p>
        </div>
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
            alert.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-surface-muted text-ink-muted'
          }`}
        >
          {alert.is_active ? 'Active' : 'Paused'}
        </span>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <p className="text-xs text-ink-subtle">Target price (per person)</p>
          {mode === 'edit' ? (
            <form onSubmit={saveTarget} noValidate className="mt-1 flex items-start gap-2">
              <TextField
                label={`New target (${alert.currency})`}
                type="number"
                inputMode="decimal"
                value={target}
                onChange={(event) => setTarget(event.target.value)}
                error={fieldError}
                className="w-40"
                autoFocus
              />
              <div className="mt-7 flex gap-1">
                <button type="submit" disabled={isBusy} className={buttonStyles('primary', 'sm')}>
                  Save
                </button>
                <button type="button" onClick={() => setMode('view')} className={buttonStyles('ghost', 'sm')}>
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <p className="mt-0.5 text-xl font-bold text-ink">{formatPrice(alert.target_price, alert.currency)}</p>
          )}
        </div>
        <div>
          <p className="text-xs text-ink-subtle">Latest fare</p>
          <p className="mt-0.5 text-sm text-ink-muted">
            {alert.last_checked_at ? 'Price history coming soon' : 'Waiting for the first price check'}
          </p>
        </div>
      </div>

      {error && <p className="mt-3 text-sm text-red-600" role="alert">{error}</p>}

      <div className="mt-4 flex flex-wrap items-center gap-1 border-t border-line pt-3">
        {mode === 'confirm-delete' ? (
          <>
            <span className="mr-2 text-sm text-ink">Delete this alert and its price history?</span>
            <button
              type="button"
              disabled={isBusy}
              onClick={() => run(() => deleteAlert(alert.id))}
              className={`${smallButton} bg-red-600 text-white hover:bg-red-700`}
            >
              Delete
            </button>
            <button type="button" onClick={() => setMode('view')} className={`${smallButton} text-ink-muted hover:bg-surface-muted`}>
              Cancel
            </button>
          </>
        ) : (
          <>
            <Link to={searchUrl(alert)} className={`${smallButton} text-brand-600 hover:bg-brand-50`}>
              <Search className="size-4" aria-hidden="true" />
              View fares
            </Link>
            <button
              type="button"
              onClick={() => {
                setTarget(String(alert.target_price))
                setFieldError(undefined)
                setMode('edit')
              }}
              className={`${smallButton} text-ink-muted hover:bg-surface-muted hover:text-ink`}
            >
              <Pencil className="size-4" aria-hidden="true" />
              Edit target
            </button>
            <button
              type="button"
              disabled={isBusy}
              onClick={() => run(() => setAlertActive(alert.id, !alert.is_active))}
              className={`${smallButton} text-ink-muted hover:bg-surface-muted hover:text-ink`}
            >
              {alert.is_active ? <Pause className="size-4" aria-hidden="true" /> : <Play className="size-4" aria-hidden="true" />}
              {alert.is_active ? 'Pause' : 'Resume'}
            </button>
            <button
              type="button"
              onClick={() => setMode('confirm-delete')}
              className={`${smallButton} ml-auto text-red-600 hover:bg-red-50`}
            >
              <Trash2 className="size-4" aria-hidden="true" />
              Delete
            </button>
          </>
        )}
      </div>
    </article>
  )
}
