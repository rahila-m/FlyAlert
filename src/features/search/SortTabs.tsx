import { formatDuration, formatPrice } from '../../lib/format'
import { getTotalDuration, SORT_OPTIONS, sortOffers, type SortOption } from './filters'
import type { FlightOffer } from './model'

// Sort selector that also previews the top result of each option (price · travel time).
export default function SortTabs({
  offers,
  value,
  onChange,
}: {
  offers: FlightOffer[]
  value: SortOption
  onChange: (sort: SortOption) => void
}) {
  return (
    <div
      role="radiogroup"
      aria-label="Sort results"
      className="grid grid-cols-3 overflow-hidden rounded-xl border border-line bg-surface"
    >
      {SORT_OPTIONS.map((option) => {
        const top = sortOffers(offers, option.value)[0]
        const isActive = value === option.value
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={isActive}
            onClick={() => onChange(option.value)}
            className={`border-b-2 px-3 py-3 text-left transition not-last:border-r not-last:border-r-line sm:px-4 ${
              isActive
                ? 'border-b-brand-600 bg-brand-50/60'
                : 'border-b-transparent hover:bg-surface-muted'
            }`}
          >
            <span
              className={`block text-sm font-semibold ${isActive ? 'text-brand-700' : 'text-ink'}`}
            >
              {option.label}
            </span>
            {top && (
              <span className="mt-0.5 block text-xs text-ink-muted">
                {formatPrice(top.price.total, top.price.currency)}
                <span className="hidden sm:inline"> · {formatDuration(getTotalDuration(top))}</span>
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
