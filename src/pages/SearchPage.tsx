import { ArrowRight } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { describeSearchResults, setAssistantContext } from '../features/assistant/assistant-context'
import { useSearchParams } from 'react-router'
import Container from '../components/ui/Container'
import { usePreferences, useT } from '../features/preferences/preferences-context'
import TrackPriceButton from '../features/alerts/TrackPriceButton'
import FlightResults from '../features/search/FlightResults'
import FlightSearchForm from '../features/search/FlightSearchForm'
import { useFlightOffers } from '../features/search/useFlightOffers'
import type { FlightSearch } from '../features/search/model'
import { hasErrors, parseSearchParams, toFlightSearch } from '../features/search/search-params'
import { formatDisplayDate, getLocalDateString } from '../lib/dates'

function SearchSummary({ search }: { search: FlightSearch }) {
  const t = useT()
  const dates = search.returnDate
    ? `${formatDisplayDate(search.departureDate)} – ${formatDisplayDate(search.returnDate)}`
    : formatDisplayDate(search.departureDate)

  return (
    <div>
      <h1 className="flex flex-wrap items-center gap-x-3 gap-y-1 text-2xl font-bold tracking-tight text-ink sm:text-3xl">
        {search.origin.city}
        <ArrowRight className="size-6 text-ink-subtle" aria-label={t('common.to')} />
        {search.destination.city}
      </h1>
      <p className="mt-2 text-sm text-ink-muted">
        {search.origin.iata} → {search.destination.iata} · {dates} ·{' '}
        {t(search.tripType === 'round-trip' ? 'search.roundTrip' : 'search.oneWay')} ·{' '}
        {t(search.adults === 1 ? 'common.passenger' : 'common.passengers', { count: search.adults })} ·{' '}
        {t('search.economyShort')}
      </p>
    </div>
  )
}

export default function SearchPage() {
  const [searchParams] = useSearchParams()
  const [today] = useState(getLocalDateString)
  // Recomputed only when the URL changes, so `search` keeps the same identity
  // between renders and the offers aren't reloaded unnecessarily.
  const { values, isEmpty, search } = useMemo(() => {
    const parsed = parseSearchParams(searchParams, today)
    return { ...parsed, search: hasErrors(parsed.errors) ? null : toFlightSearch(parsed.values) }
  }, [searchParams, today])
  const { currency, t } = usePreferences()
  const { state, retry } = useFlightOffers(search, currency)
  const lowestPrice =
    state.status === 'success' && state.offers.length > 0
      ? Math.min(...state.offers.map((offer) => offer.price.perPerson))
      : null

  // Let the AI assistant "see" the real fares on this page (cleared when leaving).
  useEffect(() => {
    setAssistantContext(search && state.status === 'success' ? describeSearchResults(search, state.offers) : null)
  }, [search, state])
  useEffect(() => () => setAssistantContext(null), [])

  return (
    <div className="bg-surface-muted pb-20">
      <section className="border-b border-line bg-surface">
        <Container className="py-8">
          {search ? (
            <div className="flex flex-wrap items-end justify-between gap-4">
              <SearchSummary search={search} />
              <TrackPriceButton search={search} currency={currency} lowestPrice={lowestPrice} />
            </div>
          ) : (
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
                {t('dashboard.search')}
              </h1>
              <p className="mt-2 text-sm text-ink-muted">
                {isEmpty
                  ? t('searchPage.empty')
                  : t('searchPage.invalid')}
              </p>
            </div>
          )}
          <div className="mt-6">
            {/* `key` resets the form when the URL changes (e.g. browser back button). */}
            <FlightSearchForm
              key={searchParams.toString()}
              initialValues={values}
              validateOnMount={!isEmpty}
            />
          </div>
        </Container>
      </section>

      {search && (
        <Container className="pt-8">
          {/* `key` clears filters and sorting when a new search starts. */}
          <FlightResults
            key={searchParams.toString()}
            state={state}
            onRetry={retry}
            passengers={search.adults}
          />
        </Container>
      )}
    </div>
  )
}
