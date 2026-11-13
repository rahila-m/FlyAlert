import type { ReactNode } from 'react'
import { formatDuration, formatPrice } from '../../lib/format'
import {
  TIME_SLOTS,
  type FilterBounds,
  type OfferFilters,
  type StopsFilter,
  type TimeSlot,
} from './filters'

const STOP_OPTIONS: { value: StopsFilter; label: string }[] = [
  { value: 'any', label: 'Any number of stops' },
  { value: 'direct', label: 'Direct only' },
  { value: 'connecting', label: 'Connecting only' },
]

const priceInputClass =
  'h-10 w-full rounded-lg border border-line bg-surface px-3 text-sm text-ink placeholder:text-ink-subtle ' +
  'focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15 focus:outline-none'

function FilterSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="border-b border-line py-5 first:pt-0 last:border-b-0 last:pb-0">
      <legend className="mb-3 text-sm font-semibold text-ink">{title}</legend>
      {children}
    </fieldset>
  )
}

// Empty input means "no limit".
function parsePrice(value: string): number | null {
  if (value.trim() === '') return null
  const number = Number(value)
  return Number.isFinite(number) && number >= 0 ? number : null
}

export default function FilterPanel({
  filters,
  bounds,
  onChange,
}: {
  filters: OfferFilters
  bounds: FilterBounds
  onChange: (filters: OfferFilters) => void
}) {
  function update<K extends keyof OfferFilters>(key: K, value: OfferFilters[K]) {
    onChange({ ...filters, [key]: value })
  }

  function toggleTimeSlot(slot: TimeSlot) {
    const selected = filters.departureTimes
    update(
      'departureTimes',
      selected.includes(slot) ? selected.filter((s) => s !== slot) : [...selected, slot],
    )
  }

  function toggleAirline(name: string) {
    const excluded = filters.excludedAirlines
    update(
      'excludedAirlines',
      excluded.includes(name) ? excluded.filter((a) => a !== name) : [...excluded, name],
    )
  }

  const durationValue = filters.maxDurationMinutes ?? bounds.maxDuration
  const hasDurationRange = bounds.maxDuration > bounds.minDuration

  return (
    <div>
      <FilterSection title="Stops">
        <div className="space-y-2">
          {STOP_OPTIONS.map((option) => (
            <label key={option.value} className="flex cursor-pointer items-center gap-2.5 text-sm text-ink-muted">
              <input
                type="radio"
                name="stops"
                checked={filters.stops === option.value}
                onChange={() => update('stops', option.value)}
                className="size-4 accent-brand-600"
              />
              {option.label}
            </label>
          ))}
        </div>
      </FilterSection>

      <FilterSection title={`Price per person (${bounds.currency})`}>
        <div className="grid grid-cols-2 gap-2">
          <label className="text-xs text-ink-subtle">
            Min
            <input
              type="number"
              inputMode="numeric"
              min={0}
              placeholder={String(bounds.minPrice)}
              value={filters.minPrice ?? ''}
              onChange={(event) => update('minPrice', parsePrice(event.target.value))}
              className={`mt-1 ${priceInputClass}`}
            />
          </label>
          <label className="text-xs text-ink-subtle">
            Max
            <input
              type="number"
              inputMode="numeric"
              min={0}
              placeholder={String(bounds.maxPrice)}
              value={filters.maxPrice ?? ''}
              onChange={(event) => update('maxPrice', parsePrice(event.target.value))}
              className={`mt-1 ${priceInputClass}`}
            />
          </label>
        </div>
        <p className="mt-2 text-xs text-ink-subtle">
          Results range from {formatPrice(bounds.minPrice, bounds.currency)} to{' '}
          {formatPrice(bounds.maxPrice, bounds.currency)}
        </p>
      </FilterSection>

      <FilterSection title="Departure time">
        <div className="grid grid-cols-2 gap-2">
          {TIME_SLOTS.map((slot) => {
            const isSelected = filters.departureTimes.includes(slot.value)
            return (
              <button
                key={slot.value}
                type="button"
                aria-pressed={isSelected}
                onClick={() => toggleTimeSlot(slot.value)}
                className={`rounded-lg border px-2 py-2 text-left text-sm transition ${
                  isSelected
                    ? 'border-brand-500 bg-brand-50 text-brand-700'
                    : 'border-line text-ink-muted hover:border-ink-subtle/50'
                }`}
              >
                <span className="block font-medium">{slot.label}</span>
                <span className="text-xs opacity-75">{slot.range}</span>
              </button>
            )
          })}
        </div>
        <p className="mt-2 text-xs text-ink-subtle">Outbound flight. None selected = any time.</p>
      </FilterSection>

      {hasDurationRange && (
        <FilterSection title="Flight duration">
          <label className="block text-sm text-ink-muted">
            <span className="flex justify-between">
              <span>Max per flight</span>
              <span className="font-medium text-ink">
                {filters.maxDurationMinutes === null ? 'Any' : formatDuration(durationValue)}
              </span>
            </span>
            <input
              type="range"
              min={bounds.minDuration}
              max={bounds.maxDuration}
              step={30}
              value={durationValue}
              onChange={(event) => {
                const value = Number(event.target.value)
                update('maxDurationMinutes', value >= bounds.maxDuration ? null : value)
              }}
              className="mt-3 w-full accent-brand-600"
            />
          </label>
        </FilterSection>
      )}

      <FilterSection title="Airlines">
        <div className="space-y-2">
          {bounds.airlines.map((airline) => (
            <label
              key={airline.name}
              className="flex cursor-pointer items-center gap-2.5 text-sm text-ink-muted"
            >
              <input
                type="checkbox"
                checked={!filters.excludedAirlines.includes(airline.name)}
                onChange={() => toggleAirline(airline.name)}
                className="size-4 rounded accent-brand-600"
              />
              <span className="flex-1">{airline.name}</span>
              <span className="text-xs text-ink-subtle">{airline.count}</span>
            </label>
          ))}
        </div>
      </FilterSection>
    </div>
  )
}
