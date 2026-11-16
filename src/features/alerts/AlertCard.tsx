import {
  ArrowRight,
  BellRing,
  ChartLine,
  ExternalLink,
  Pause,
  Pencil,
  Play,
  Search,
  Trash2,
  TrendingDown,
  TrendingUp,
} from 'lucide-react'
import { lazy, Suspense, useMemo, useState, type FormEvent } from 'react'
import { Link } from 'react-router'
import { buttonStyles } from '../../components/ui/button-styles'
import TextField from '../../components/ui/TextField'
import { formatDisplayDate } from '../../lib/dates'
import { conversionFactor, RATES_ATTRIBUTION, useExchangeRates } from '../../lib/exchange-rates'
import { getLocaleTag } from '../../i18n/locale'
import { formatPrice } from '../../lib/format'
import { usePreferences, useT } from '../preferences/preferences-context'
import { findAirport } from '../search/airports'
import { AlertError, deleteAlert, setAlertActive, updateTargetPrice, type FlightAlert } from './alerts-api'
import { summarizePriceChecks, type PriceCheck, type PriceSummary } from './price-history'
import { validateTargetPrice } from './target-price'

// The chart library is large, so it's only downloaded when a chart is opened
// ("code splitting"). The rest of the dashboard loads faster.
const PriceHistoryChart = lazy(() => import('./PriceHistoryChart'))

const formatCheckedAt = (iso: string) =>
  new Intl.DateTimeFormat(getLocaleTag(), { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(
    new Date(iso),
  )

function LatestFare({ summary, target, money }: { summary: PriceSummary; target: number; money: (value: number) => string }) {
  const t = useT()
  if (!summary.latest) {
    return (
      <p className="mt-0.5 text-sm text-ink-muted">
        {summary.lastCheckedAt
          ? t('alerts.noFaresYet', { count: summary.totalChecks })
          : t('alerts.waitingFirst')}
      </p>
    )
  }

  const { price } = summary.latest
  const difference = price - target
  const change = summary.changePercent
  return (
    <div>
      <div className="flex flex-wrap items-baseline gap-x-2">
        <p className="text-xl font-bold text-ink">{money(price)}</p>
        {change !== null && change !== 0 && (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-ink-muted">
            {change < 0 ? (
              <TrendingDown className="size-3.5 text-emerald-600" aria-hidden="true" />
            ) : (
              <TrendingUp className="size-3.5 text-rose-600" aria-hidden="true" />
            )}
            {t(change < 0 ? 'alerts.down' : 'alerts.up', { percent: Math.abs(change) })}
          </span>
        )}
      </div>
      {difference <= 0 ? (
        <p className="mt-0.5 inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
          <BellRing className="size-3.5" aria-hidden="true" />
          {t('alerts.atTarget')}
        </p>
      ) : (
        <p className="mt-0.5 text-xs text-ink-muted">{t('alerts.aboveTarget', { price: money(difference) })}</p>
      )}
    </div>
  )
}

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

export default function AlertCard({
  alert,
  checks,
  onChanged,
}: {
  alert: FlightAlert
  checks: PriceCheck[]
  onChanged: () => void
}) {
  const summary = useMemo(() => summarizePriceChecks(checks), [checks])
  const targetPrice = Number(alert.target_price) // numeric columns can arrive as strings

  // Show the alert in the currency the user picked (e.g. AZN), converted at
  // today's rate. The alert itself keeps being checked in its own currency,
  // so converted amounts are marked with "≈" and the original is named.
  const { t, currency: preferredCurrency } = usePreferences()
  const needsConversion = preferredCurrency !== alert.currency
  const rates = useExchangeRates(needsConversion)
  const factor = needsConversion ? conversionFactor(rates, alert.currency, preferredCurrency) : null
  const isConverted = factor !== null
  const rate = factor ?? 1
  const displayCurrency = isConverted ? preferredCurrency : alert.currency
  const money = (value: number) => `${isConverted ? '≈ ' : ''}${formatPrice(value * rate, displayCurrency)}`
  const displayHistory = useMemo(
    () => summary.history.map((point) => ({ ...point, price: point.price * rate })),
    [summary.history, rate],
  )
  // Typed targets are in the display currency; saved in the alert's own currency.
  const toDisplay = (value: number) => String(Math.round(value * rate * 100) / 100)
  const fromDisplay = (value: number) => Math.round((value / rate) * 100) / 100
  const [showHistory, setShowHistory] = useState(false)
  const [mode, setMode] = useState<'view' | 'edit' | 'confirm-delete'>('view')
  const [target, setTarget] = useState('')
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
      setError(t(caught instanceof AlertError ? caught.messageKey : 'common.genericError'))
    } finally {
      setIsBusy(false)
    }
  }

  function saveTarget(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const validationError = validateTargetPrice(target)
    setFieldError(validationError && t(validationError))
    if (!validationError) run(() => updateTargetPrice(alert.id, fromDisplay(Number(target))))
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
            <ArrowRight className="size-4 text-ink-subtle" aria-label={t('common.to')} />
            {placeName(alert.destination_iata)}
          </h3>
          <p className="mt-1 text-sm text-ink-muted">
            {alert.origin_iata} → {alert.destination_iata} · {dates}
            {alert.flexible_days > 0 && ` (± ${alert.flexible_days} ${t('flight.days')})`} ·{' '}
            {t(alert.adults === 1 ? 'common.passenger' : 'common.passengers', { count: alert.adults })}
          </p>
        </div>
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
            alert.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-surface-muted text-ink-muted'
          }`}
        >
          {t(alert.is_active ? 'alerts.active' : 'alerts.paused')}
        </span>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <p className="text-xs text-ink-subtle">{t('alerts.target')}</p>
          {mode === 'edit' ? (
            <form onSubmit={saveTarget} noValidate className="mt-1 flex items-start gap-2">
              <TextField
                label={t('alerts.newTarget', { currency: displayCurrency })}
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
                  {t('common.save')}
                </button>
                <button type="button" onClick={() => setMode('view')} className={buttonStyles('ghost', 'sm')}>
                  {t('common.cancel')}
                </button>
              </div>
            </form>
          ) : (
            <p className="mt-0.5 text-xl font-bold text-ink">{money(targetPrice)}</p>
          )}
        </div>
        <div>
          <p className="text-xs text-ink-subtle">{t('alerts.latest')}</p>
          <LatestFare summary={summary} target={targetPrice} money={money} />
        </div>
      </div>

      {isConverted && (
        <p className="mt-3 text-xs text-ink-subtle">
          {t('alerts.convertedNote', { currency: alert.currency })}{' '}
          <a href={RATES_ATTRIBUTION.href} target="_blank" rel="noopener noreferrer" className="underline hover:text-ink-muted">
            {RATES_ATTRIBUTION.label}
          </a>
        </p>
      )}

      {summary.totalChecks > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-muted">
          {summary.lowestPrice !== null && (
            <span>
              {t('alerts.lowest')} <strong className="font-semibold text-ink">{money(summary.lowestPrice)}</strong>
            </span>
          )}
          {summary.lastCheckedAt && <span>{t('alerts.lastChecked', { time: formatCheckedAt(summary.lastCheckedAt) })}</span>}
          <span>
            {t('alerts.checks', { count: summary.totalChecks })}
            {summary.checksWithoutFares > 0 && ` · ${t('alerts.withoutFares', { count: summary.checksWithoutFares })}`}
          </span>
          {summary.latest?.bookingUrl && (
            <a
              href={summary.latest.bookingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-medium text-brand-600 hover:text-brand-700"
            >
              {t('alerts.viewLatest')}
              <ExternalLink className="size-3.5" aria-hidden="true" />
              <span className="sr-only">{t('common.newTab')}</span>
            </a>
          )}
        </div>
      )}

      {summary.history.length > 0 && (
        <div className="mt-3">
          <button
            type="button"
            aria-expanded={showHistory}
            onClick={() => setShowHistory((open) => !open)}
            className={`${smallButton} -ml-2.5 text-ink-muted hover:bg-surface-muted hover:text-ink`}
          >
            <ChartLine className="size-4" aria-hidden="true" />
            {t(showHistory ? 'alerts.hideHistory' : 'alerts.showHistory')}
          </button>
          {showHistory && (
            <Suspense fallback={<p className="py-6 text-sm text-ink-muted">{t('common.loading')}</p>}>
              <PriceHistoryChart history={displayHistory} targetPrice={targetPrice * rate} currency={displayCurrency} />
            </Suspense>
          )}
        </div>
      )}

      {error && <p className="mt-3 text-sm text-red-600" role="alert">{error}</p>}

      <div className="mt-4 flex flex-wrap items-center gap-1 border-t border-line pt-3">
        {mode === 'confirm-delete' ? (
          <>
            <span className="mr-2 text-sm text-ink">{t('alerts.confirmDelete')}</span>
            <button
              type="button"
              disabled={isBusy}
              onClick={() => run(() => deleteAlert(alert.id))}
              className={`${smallButton} bg-red-600 text-white hover:bg-red-700`}
            >
              {t('common.delete')}
            </button>
            <button type="button" onClick={() => setMode('view')} className={`${smallButton} text-ink-muted hover:bg-surface-muted`}>
              {t('common.cancel')}
            </button>
          </>
        ) : (
          <>
            <Link to={searchUrl(alert)} className={`${smallButton} text-brand-600 hover:bg-brand-50`}>
              <Search className="size-4" aria-hidden="true" />
              {t('alerts.viewFares')}
            </Link>
            <button
              type="button"
              onClick={() => {
                setTarget(toDisplay(targetPrice))
                setFieldError(undefined)
                setMode('edit')
              }}
              className={`${smallButton} text-ink-muted hover:bg-surface-muted hover:text-ink`}
            >
              <Pencil className="size-4" aria-hidden="true" />
              {t('alerts.editTarget')}
            </button>
            <button
              type="button"
              disabled={isBusy}
              onClick={() => run(() => setAlertActive(alert.id, !alert.is_active))}
              className={`${smallButton} text-ink-muted hover:bg-surface-muted hover:text-ink`}
            >
              {alert.is_active ? <Pause className="size-4" aria-hidden="true" /> : <Play className="size-4" aria-hidden="true" />}
              {t(alert.is_active ? 'alerts.pause' : 'alerts.resume')}
            </button>
            <button
              type="button"
              onClick={() => setMode('confirm-delete')}
              className={`${smallButton} ml-auto text-red-600 hover:bg-red-50`}
            >
              <Trash2 className="size-4" aria-hidden="true" />
              {t('common.delete')}
            </button>
          </>
        )}
      </div>
    </article>
  )
}
