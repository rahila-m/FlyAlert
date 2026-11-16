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
import { useT } from '../preferences/preferences-context'

function DataSourceNotice({ offers }: { offers: FlightOffer[] }) {
  const t = useT()
  if (offers.some((offer) => offer.source === 'demo')) {
    return (
      <div role="note" className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        <FlaskConical className="mt-0.5 size-5 shrink-0 text-amber-600" aria-hidden="true" />
        <p>
          <strong className="font-semibold">{t('results.demoTitle')}</strong> {t('results.demoText')}
        </p>
      </div>
    )
  }
  return (
    <div role="note" className="flex gap-3 rounded-xl border border-brand-100 bg-brand-50 p-4 text-sm text-brand-900">
      <Info className="mt-0.5 size-5 shrink-0 text-brand-600" aria-hidden="true" />
      <p>
        <strong className="font-semibold">{t('results.realTitle')}</strong> {t('results.realText')}
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
  const t = useT()
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
          {t('results.searching')}
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
          title={t('results.errorTitle')}
          description={state.message}
          action={{ label: t('common.tryAgain'), onClick: onRetry, icon: RefreshCw }}
        />
      </div>
    )
  }

  if (!bounds) {
    return (
      <div className="mx-auto max-w-3xl">
        <Message
          icon={SearchX}
          title={t('results.noneTitle')}
          description={t('results.noneText')}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <DataSourceNotice offers={offers} />

      <div className="grid gap-6 lg:grid-cols-[17rem_1fr] lg:items-start">
        {/* Filters: a sidebar on desktop, a collapsible panel on mobile */}
        <aside aria-label={t('filters.title')} className="lg:sticky lg:top-20">
          <div className="flex items-center justify-between gap-3 lg:mb-4">
            <button
              type="button"
              aria-expanded={showMobileFilters}
              aria-controls="filter-panel"
              onClick={() => setShowMobileFilters((open) => !open)}
              className={buttonStyles('secondary', 'sm', 'lg:hidden')}
            >
              <SlidersHorizontal className="size-4" aria-hidden="true" />
              {t('filters.title')}{activeFilterCount > 0 && ` (${activeFilterCount})`}
            </button>
            <h2 className="hidden font-semibold text-ink lg:block">{t('filters.title')}</h2>
            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={resetFilters}
                className="text-sm font-medium text-brand-600 hover:text-brand-700"
              >
                {t('filters.resetAll')}
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

        <section aria-label={t('results.label')} className="min-w-0 space-y-4">
          <SortTabs offers={filtered} value={sort} onChange={setSort} />
          <p className="text-sm text-ink-muted" role="status">
            {t('results.showing', { shown: visible.length, total: offers.length })}
          </p>

          {visible.length === 0 ? (
            <Message
              icon={SearchX}
              title={t('results.noMatchTitle')}
              description={t('results.noMatchText')}
              action={{ label: t('filters.reset'), onClick: resetFilters }}
            />
          ) : (
            <>
              <div className="space-y-3">
                <h2 className="font-semibold text-ink">
                  {t('results.yourDates')} <span className="font-normal text-ink-muted">({exact.length})</span>
                </h2>
                {exact.length > 0 ? (
                  <OfferList offers={exact} passengers={passengers} />
                ) : (
                  <p className="rounded-xl border border-dashed border-line bg-surface p-4 text-sm text-ink-muted">
                    {t('results.noExact')}
                  </p>
                )}
              </div>

              {nearby.length > 0 && (
                <div className="space-y-3 pt-4">
                  <h2 className="font-semibold text-ink">
                    {t('results.nearbyDates')} <span className="font-normal text-ink-muted">({nearby.length})</span>
                  </h2>
                  <p className="text-sm text-ink-muted">{t('results.nearbyHint')}</p>
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
