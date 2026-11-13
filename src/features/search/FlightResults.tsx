import { CloudOff, FlaskConical, Info, RefreshCw, SearchX, SlidersHorizontal } from 'lucide-react'
import { useMemo, useState } from 'react'
import { buttonStyles } from '../../components/ui/button-styles'
import FilterPanel from './FilterPanel'
import FlightCard from './FlightCard'
import {
  applyFilters,
  countActiveFilters,
  DEFAULT_FILTERS,
  getFilterBounds,
  sortOffers,
  type OfferFilters,
  type SortOption,
} from './filters'
import type { FlightOffer } from './model'
import SortTabs from './SortTabs'
import type { OffersState } from './useFlightOffers'

function DataSourceNotice({ offers }: { offers: FlightOffer[] }) {
  if (offers.some((offer) => offer.source === 'demo')) {
    return (
      <div role="note" className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        <FlaskConical className="mt-0.5 size-5 shrink-0 text-amber-600" aria-hidden="true" />
        <p>
          <strong className="font-semibold">Demo data.</strong> These flights, airlines and prices
          are randomly generated to test the interface. They are not real offers and cannot be booked.
        </p>
      </div>
    )
  }
  return (
    <div role="note" className="flex gap-3 rounded-xl border border-brand-100 bg-brand-50 p-4 text-sm text-brand-900">
      <Info className="mt-0.5 size-5 shrink-0 text-brand-600" aria-hidden="true" />
      <p>
        <strong className="font-semibold">Real fares from Aviasales,</strong> found by travelers in the
        last 48 hours. Economy prices per adult. Fares change often, so the final price is confirmed on
        the booking site.
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

function Message({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: typeof SearchX
  title: string
  description: string
  action?: { label: string; onClick: () => void; icon?: typeof RefreshCw }
}) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-line bg-surface px-6 py-14 text-center">
      <Icon className="size-8 text-ink-subtle" aria-hidden="true" />
      <h2 className="mt-4 font-semibold text-ink">{title}</h2>
      <p className="mt-1 max-w-md text-sm text-ink-muted">{description}</p>
      {action && (
        <button type="button" onClick={action.onClick} className={buttonStyles('secondary', 'sm', 'mt-5')}>
          {action.icon && <action.icon className="size-4" aria-hidden="true" />}
          {action.label}
        </button>
      )}
    </div>
  )
}

function OfferList({ offers, passengers }: { offers: FlightOffer[]; passengers: number }) {
  return (
    <ul className="space-y-4">
      {offers.map((offer) => (
        <li key={offer.id}>
          <FlightCard offer={offer} passengers={passengers} />
        </li>
      ))}
    </ul>
  )
}

export default function FlightResults({
  state,
  onRetry,
  passengers,
}: {
  state: OffersState
  onRetry: () => void
  passengers: number
}) {
  const [filters, setFilters] = useState<OfferFilters>(DEFAULT_FILTERS)
  const [sort, setSort] = useState<SortOption>('best')
  const [showMobileFilters, setShowMobileFilters] = useState(false)

  const offers = useMemo(() => (state.status === 'success' ? state.offers : []), [state])
  const bounds = useMemo(() => (offers.length > 0 ? getFilterBounds(offers) : null), [offers])
  const filtered = useMemo(() => applyFilters(offers, filters), [offers, filters])
  const visible = useMemo(() => sortOffers(filtered, sort), [filtered, sort])
  const exact = visible.filter((offer) => offer.dateMatch === 'exact')
  const nearby = visible.filter((offer) => offer.dateMatch === 'nearby')
  const activeFilterCount = countActiveFilters(filters)
  const resetFilters = () => setFilters(DEFAULT_FILTERS)

  if (state.status === 'loading') {
    return (
      <div className="mx-auto max-w-3xl space-y-4" aria-busy="true">
        <p className="text-sm text-ink-muted" role="status">
          Searching flights…
        </p>
        {Array.from({ length: 3 }, (_, i) => (
          <ResultSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (state.status === 'error') {
    return (
      <div className="mx-auto max-w-3xl" role="alert">
        <Message
          icon={CloudOff}
          title="We couldn't load flights"
          description={state.message}
          action={{ label: 'Try again', onClick: onRetry, icon: RefreshCw }}
        />
      </div>
    )
  }

  if (!bounds) {
    return (
      <div className="mx-auto max-w-3xl">
        <Message
          icon={SearchX}
          title="No fares found for this route yet"
          description="Prices come from recent traveler searches, and none were found around your dates. Try other dates, a nearby airport, or the city code (for example LON instead of LHR)."
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <DataSourceNotice offers={offers} />

      <div className="grid gap-6 lg:grid-cols-[17rem_1fr] lg:items-start">
        {/* Filters: a sidebar on desktop, a collapsible panel on mobile */}
        <aside aria-label="Filters" className="lg:sticky lg:top-20">
          <div className="flex items-center justify-between gap-3 lg:mb-4">
            <button
              type="button"
              aria-expanded={showMobileFilters}
              aria-controls="filter-panel"
              onClick={() => setShowMobileFilters((open) => !open)}
              className={buttonStyles('secondary', 'sm', 'lg:hidden')}
            >
              <SlidersHorizontal className="size-4" aria-hidden="true" />
              Filters{activeFilterCount > 0 && ` (${activeFilterCount})`}
            </button>
            <h2 className="hidden font-semibold text-ink lg:block">Filters</h2>
            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={resetFilters}
                className="text-sm font-medium text-brand-600 hover:text-brand-700"
              >
                Reset all
              </button>
            )}
          </div>
          <div
            id="filter-panel"
            className={`${showMobileFilters ? 'mt-4 block' : 'hidden'} rounded-2xl border border-line bg-surface p-5 lg:mt-0 lg:block`}
          >
            <FilterPanel filters={filters} bounds={bounds} onChange={setFilters} />
          </div>
        </aside>

        <section aria-label="Flight results" className="min-w-0 space-y-4">
          <SortTabs offers={filtered} value={sort} onChange={setSort} />
          <p className="text-sm text-ink-muted" role="status">
            Showing <span className="font-semibold text-ink">{visible.length}</span> of {offers.length}{' '}
            fares
          </p>

          {visible.length === 0 ? (
            <Message
              icon={SearchX}
              title="No fares match your filters"
              description="Try removing some filters to see more results."
              action={{ label: 'Reset filters', onClick: resetFilters }}
            />
          ) : (
            <>
              <div className="space-y-3">
                <h2 className="font-semibold text-ink">
                  Your dates <span className="font-normal text-ink-muted">({exact.length})</span>
                </h2>
                {exact.length > 0 ? (
                  <OfferList offers={exact} passengers={passengers} />
                ) : (
                  <p className="rounded-xl border border-dashed border-line bg-surface p-4 text-sm text-ink-muted">
                    No fares found for your exact dates. See nearby dates below.
                  </p>
                )}
              </div>

              {nearby.length > 0 && (
                <div className="space-y-3 pt-4">
                  <h2 className="font-semibold text-ink">
                    Nearby dates <span className="font-normal text-ink-muted">({nearby.length})</span>
                  </h2>
                  <p className="text-sm text-ink-muted">Flights up to 3 days before or after your dates.</p>
                  <OfferList offers={nearby} passengers={passengers} />
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  )
}
