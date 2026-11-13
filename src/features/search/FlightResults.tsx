import { FlaskConical, SearchX } from 'lucide-react'
import FlightCard from './FlightCard'
import type { FlightOffer } from './model'

function DemoDataNotice() {
  return (
    <div
      role="note"
      className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"
    >
      <FlaskConical className="mt-0.5 size-5 shrink-0 text-amber-600" aria-hidden="true" />
      <p>
        <strong className="font-semibold">Demo data.</strong> These flights, airlines and prices
        are randomly generated to test the interface. They are not real offers and cannot be
        booked. Real flight data will be connected in a later phase.
      </p>
    </div>
  )
}

function ResultSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-line bg-surface p-5" aria-hidden="true">
      <div className="flex items-center gap-3">
        <div className="size-9 rounded-lg bg-line" />
        <div className="h-4 w-32 rounded bg-line" />
      </div>
      <div className="mt-6 h-10 rounded bg-line/70" />
      <div className="mt-4 h-10 rounded bg-line/70" />
    </div>
  )
}

export default function FlightResults({
  isLoading,
  offers,
  passengers,
}: {
  isLoading: boolean
  offers: FlightOffer[]
  passengers: number
}) {
  const hasDemoOffers = offers.some((offer) => offer.source === 'demo')

  if (isLoading) {
    return (
      <div className="space-y-4" aria-busy="true">
        <p className="text-sm text-ink-muted" role="status">
          Searching flights…
        </p>
        {Array.from({ length: 3 }, (_, i) => (
          <ResultSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (offers.length === 0) {
    return (
      <div className="flex flex-col items-center rounded-2xl border border-line bg-surface px-6 py-14 text-center">
        <SearchX className="size-8 text-ink-subtle" aria-hidden="true" />
        <h2 className="mt-4 font-semibold text-ink">No flights found</h2>
        <p className="mt-1 text-sm text-ink-muted">Try different dates or airports.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {hasDemoOffers && <DemoDataNotice />}
      <p className="text-sm text-ink-muted" role="status">
        <span className="font-semibold text-ink">{offers.length}</span> flights found
      </p>
      <ul className="space-y-4">
        {offers.map((offer) => (
          <li key={offer.id}>
            <FlightCard offer={offer} passengers={passengers} />
          </li>
        ))}
      </ul>
    </div>
  )
}
