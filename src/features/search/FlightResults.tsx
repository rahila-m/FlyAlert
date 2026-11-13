import { FlaskConical, SearchX, SlidersHorizontal } from 'lucide-react'
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

function EmptyState({
  title,
  description,
  onReset,
}: {
  title: string
  description: string
  onReset?: () => void
}) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-line bg-surface px-6 py-14 text-center">
      <SearchX className="size-8 text-ink-subtle" aria-hidden="true" />
      <h2 className="mt-4 font-semibold text-ink">{title}</h2>
      <p className="mt-1 text-sm text-ink-muted">{description}</p>
      {onReset && (
        <button type="button" onClick={onReset} className={buttonStyles('secondary', 'sm', 'mt-5')}>
          Reset filters
        </button>
      )}
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
  const [filters, setFilters] = useState<OfferFilters>(DEFAULT_FILTERS)
  const [sort, setSort] = useState<SortOption>('best')
  const [showMobileFilters, setShowMobileFilters] = useState(false)

  const bounds = useMemo(() => (offers.length > 0 ? getFilterBounds(offers) : null), [offers])
  const filtered = useMemo(() => applyFilters(offers, filters), [offers, filters])
  const visible = useMemo(() => sortOffers(filtered, sort), [filtered, sort])
  const activeFilterCount = countActiveFilters(filters)
  const resetFilters = () => setFilters(DEFAULT_FILTERS)

  if (isLoading) {
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

  if (!bounds) {
    return (
      <div className="mx-auto max-w-3xl">
        <EmptyState title="No flights found" description="Try different dates or airports." />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {offers.some((offer) => offer.source === 'demo') && <DemoDataNotice />}

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
            Showing <span className="font-semibold text-ink">{visible.length}</span> of{' '}
            {offers.length} flights
          </p>
          {visible.length === 0 ? (
            <EmptyState
              title="No flights match your filters"
              description="Try removing some filters to see more results."
              onReset={resetFilters}
            />
          ) : (
            <ul className="space-y-4">
              {visible.map((offer) => (
                <li key={offer.id}>
                  <FlightCard offer={offer} passengers={passengers} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}
