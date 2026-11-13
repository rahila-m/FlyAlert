import { ExternalLink } from 'lucide-react'
import { buttonStyles } from '../../components/ui/button-styles'
import { formatDisplayDate } from '../../lib/dates'
import { formatDuration, formatPrice, formatStops, formatTime } from '../../lib/format'
import type { FlightLeg, FlightOffer } from './model'

const AVATAR_COLORS = [
  'bg-sky-600',
  'bg-indigo-600',
  'bg-emerald-600',
  'bg-amber-600',
  'bg-rose-600',
  'bg-violet-600',
]

function AirlineAvatar({ name, code }: { name: string; code: string | null }) {
  const label =
    code ??
    name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .slice(0, 2)
  const hash = [...name].reduce((sum, char) => sum + char.charCodeAt(0), 0)
  return (
    <span
      aria-hidden="true"
      className={`flex size-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white ${AVATAR_COLORS[hash % AVATAR_COLORS.length]}`}
    >
      {label}
    </span>
  )
}

function DayOffsetBadge({ days }: { days: number | null }) {
  if (!days) return null
  return (
    <span className="ml-1.5 rounded bg-amber-50 px-1.5 py-0.5 text-[11px] font-medium text-amber-700 ring-1 ring-amber-200">
      {days > 0 ? `+${days}` : days} {Math.abs(days) === 1 ? 'day' : 'days'}
    </span>
  )
}

function LegRow({ leg, label, dayOffset }: { leg: FlightLeg; label: string; dayOffset: number | null }) {
  return (
    <div className="grid grid-cols-[5.5rem_1fr] items-center gap-4 sm:grid-cols-[7rem_1fr]">
      <div>
        <p className="text-xs font-medium text-ink-subtle">{label}</p>
        <p className="text-lg font-semibold text-ink">{formatTime(leg.departureAt)}</p>
        <p className="flex flex-wrap items-center text-xs text-ink-muted">
          {formatDisplayDate(leg.departureAt.slice(0, 10))}
          <DayOffsetBadge days={dayOffset} />
        </p>
      </div>

      <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3">
        <span className="text-sm font-semibold text-ink">{leg.origin}</span>
        <div className="text-center">
          <p className="text-xs text-ink-muted">
            {leg.durationMinutes !== null ? formatDuration(leg.durationMinutes) : 'Duration n/a'}
          </p>
          <div className="relative my-1 h-px bg-line" aria-hidden="true">
            {leg.stopAirports.map((stop, index) => (
              <span
                key={stop}
                className="absolute top-1/2 size-2 -translate-1/2 rounded-full border-2 border-surface bg-ink-subtle"
                style={{ left: `${((index + 1) / (leg.stops + 1)) * 100}%` }}
              />
            ))}
          </div>
          <p className={`text-xs ${leg.stops === 0 ? 'font-medium text-emerald-600' : 'text-ink-muted'}`}>
            {formatStops(leg.stops)}
            {leg.stopAirports.length > 0 && (
              <span className="text-ink-subtle"> · {leg.stopAirports.join(', ')}</span>
            )}
          </p>
        </div>
        <span className="text-sm font-semibold text-ink">{leg.destination}</span>
      </div>
    </div>
  )
}

export default function FlightCard({ offer, passengers }: { offer: FlightOffer; passengers: number }) {
  const { perPerson, currency } = offer.price
  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-sm transition hover:border-brand-200 hover:shadow-md md:flex-row">
      <div className="flex-1 space-y-5 p-5">
        <div className="flex items-center gap-3">
          <AirlineAvatar name={offer.airline.name} code={offer.airline.code} />
          <div className="min-w-0">
            <h3 className="truncate font-medium text-ink">{offer.airline.name}</h3>
            {offer.flightNumber && offer.airline.code && (
              <p className="text-xs text-ink-subtle">
                Flight {offer.airline.code} {offer.flightNumber}
              </p>
            )}
          </div>
          {offer.source === 'demo' && (
            <span className="ml-auto rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 ring-1 ring-amber-200">
              Demo
            </span>
          )}
        </div>
        <LegRow leg={offer.outbound} label="Outbound" dayOffset={offer.departureDayOffset} />
        {offer.inbound && <LegRow leg={offer.inbound} label="Return" dayOffset={offer.returnDayOffset} />}
      </div>

      <div className="flex items-center justify-between gap-4 border-t border-line bg-surface-muted p-5 md:w-60 md:flex-col md:items-stretch md:justify-center md:border-t-0 md:border-l">
        <div className="md:text-center">
          <p className="text-2xl font-bold text-ink">{formatPrice(perPerson, currency)}</p>
          <p className="text-xs text-ink-subtle">per person · Economy</p>
          {passengers > 1 && (
            <p className="mt-1 text-xs text-ink-muted">
              ≈ {formatPrice(perPerson * passengers, currency)} for {passengers} passengers
            </p>
          )}
        </div>

        {offer.bookingUrl ? (
          <a
            href={offer.bookingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonStyles('primary', 'md')}
          >
            View on {offer.provider}
            <ExternalLink className="size-4" aria-hidden="true" />
            <span className="sr-only">(opens in a new tab)</span>
          </a>
        ) : (
          <button
            type="button"
            disabled
            title={offer.source === 'demo' ? 'Demo offers cannot be booked' : 'No booking link available'}
            className={buttonStyles('secondary', 'md')}
          >
            Not bookable
          </button>
        )}
      </div>
    </article>
  )
}
