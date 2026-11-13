import { ArrowRight, Info } from 'lucide-react'
import { useState } from 'react'
import { useSearchParams } from 'react-router'
import Container from '../components/ui/Container'
import FlightSearchForm from '../features/search/FlightSearchForm'
import { getTravelClassLabel, type FlightSearch } from '../features/search/model'
import { hasErrors, parseSearchParams, toFlightSearch } from '../features/search/search-params'
import { formatDisplayDate, getLocalDateString } from '../lib/dates'

function SearchSummary({ search }: { search: FlightSearch }) {
  const dates = search.returnDate
    ? `${formatDisplayDate(search.departureDate)} – ${formatDisplayDate(search.returnDate)}`
    : formatDisplayDate(search.departureDate)

  return (
    <div>
      <h1 className="flex flex-wrap items-center gap-x-3 gap-y-1 text-2xl font-bold tracking-tight text-ink sm:text-3xl">
        {search.origin.city}
        <ArrowRight className="size-6 text-ink-subtle" aria-label="to" />
        {search.destination.city}
      </h1>
      <p className="mt-2 text-sm text-ink-muted">
        {search.origin.iata} → {search.destination.iata} · {dates} ·{' '}
        {search.tripType === 'round-trip' ? 'Round-trip' : 'One-way'} · {search.adults}{' '}
        {search.adults === 1 ? 'passenger' : 'passengers'} ·{' '}
        {getTravelClassLabel(search.travelClass)}
      </p>
    </div>
  )
}

export default function SearchPage() {
  const [searchParams] = useSearchParams()
  const [today] = useState(getLocalDateString)
  const { values, errors, isEmpty } = parseSearchParams(searchParams, today)
  const search = hasErrors(errors) ? null : toFlightSearch(values)

  return (
    <div className="bg-surface-muted pb-20">
      <section className="border-b border-line bg-surface">
        <Container className="py-8">
          {search ? (
            <SearchSummary search={search} />
          ) : (
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
                Search flights
              </h1>
              <p className="mt-2 text-sm text-ink-muted">
                {isEmpty
                  ? 'Choose your route and dates to get started.'
                  : 'Some search details are missing or invalid. Please check the highlighted fields.'}
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
          <div className="flex items-start gap-3 rounded-2xl border border-dashed border-line bg-surface p-6 text-sm text-ink-muted">
            <Info className="mt-0.5 size-5 shrink-0 text-brand-600" aria-hidden="true" />
            <p>
              Flight results are coming in the next step. Your search was read correctly from
              the URL. Try refreshing the page or using the back button.
            </p>
          </div>
        </Container>
      )}
    </div>
  )
}
