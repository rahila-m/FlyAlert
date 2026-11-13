import { ExternalLink } from 'lucide-react'
import { buttonStyles } from '../../components/ui/button-styles'
import { dayDifference, formatDuration, formatPrice, formatStops, formatTime } from '../../lib/format'
import type { FlightLeg, FlightOffer } from './model'

const AVATAR_COLORS = [
  'bg-sky-600',
  'bg-indigo-600',
  'bg-emerald-600',
  'bg-amber-600',
  'bg-rose-600',
  'bg-violet-600',
]

function AirlineAvatar({ name }: { name: string }) {
  const initials = name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .slice(0, 2)
  const color = AVATAR_COLORS[name.length % AVATAR_COLORS.length]
  return (
    <span
      aria-hidden="true"
      className={`flex size-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white ${color}`}
    >
      {initials}
    </span>
  )
}

function LegRow({ leg, label }: { leg: FlightLeg; label: string }) {
  const extraDays = dayDifference(leg.departureTime, leg.arrivalTime)
  return (
    <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3 sm:gap-5">
      <div>
        <span className="sr-only">{label}: </span>
        <p className="text-lg font-semibold text-ink">{formatTime(leg.departureTime)}</p>
        <p className="text-xs font-medium text-ink-subtle">{leg.origin}</p>
      </div>

      <div className="text-center">
        <p className="text-xs text-ink-muted">{formatDuration(leg.durationMinutes)}</p>
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
          {leg.stops > 0 && <span className="text-ink-subtle"> · {leg.stopAirports.join(', ')}</span>}
        </p>
      </div>

      <div className="text-right">
        <p className="text-lg font-semibold text-ink">
          {formatTime(leg.arrivalTime)}
          {extraDays > 0 && (
            <sup className="ml-0.5 text-xs font-medium text-amber-600" title={`Arrives ${extraDays} day(s) later`}>
              +{extraDays}
            </sup>
          )}
        </p>
        <p className="text-xs font-medium text-ink-subtle">{leg.destination}</p>
      </div>
    </div>
  )
}

export default function FlightCard({ offer, passengers }: { offer: FlightOffer; passengers: number }) {
  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-sm transition hover:border-brand-200 hover:shadow-md md:flex-row">
      <div className="flex-1 space-y-5 p-5">
        <div className="flex items-center gap-3">
          <AirlineAvatar name={offer.airline.name} />
          <h3 className="font-medium text-ink">{offer.airline.name}</h3>
          {offer.source === 'demo' && (
            <span className="ml-auto rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 ring-1 ring-amber-200">
              Demo
            </span>
          )}
        </div>
        <LegRow leg={offer.outbound} label="Outbound" />
        {offer.inbound && <LegRow leg={offer.inbound} label="Return" />}
      </div>

      <div className="flex items-center justify-between gap-4 border-t border-line bg-surface-muted p-5 md:w-56 md:flex-col md:items-stretch md:justify-center md:border-t-0 md:border-l">
        <div className="md:text-center">
          <p className="text-2xl font-bold text-ink">
            {formatPrice(offer.price.total, offer.price.currency)}
          </p>
          <p className="text-xs text-ink-subtle">
            {passengers === 1 ? 'total' : `total · ${passengers} passengers`}
          </p>
          <p className="mt-1 text-xs text-ink-muted">via {offer.provider}</p>
        </div>

        {offer.bookingUrl ? (
          <a
            href={offer.bookingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonStyles('primary', 'md')}
          >
            View deal
            <ExternalLink className="size-4" aria-hidden="true" />
          </a>
        ) : (
          <button
            type="button"
            disabled
            title="Demo offers cannot be booked"
            className={buttonStyles('secondary', 'md')}
          >
            Not bookable
          </button>
        )}
      </div>
    </article>
  )
}
