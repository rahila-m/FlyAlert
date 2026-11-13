import {
  ArrowLeftRight,
  CalendarDays,
  PlaneLanding,
  PlaneTakeoff,
  Search,
  type LucideIcon,
} from 'lucide-react'
import { useId, useState, type FormEvent, type ReactNode } from 'react'
import { buttonStyles } from '../../components/ui/button-styles'

type TripType = 'round-trip' | 'one-way'

const TRAVEL_CLASSES = ['Economy', 'Premium Economy', 'Business', 'First'] as const
const MAX_PASSENGERS = 9

// Returns today's date as YYYY-MM-DD in the user's local time zone
// (toISOString() would use UTC and can return yesterday or tomorrow).
function getLocalDateString() {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${now.getFullYear()}-${month}-${day}`
}

const inputClass =
  'h-12 w-full rounded-lg border border-line bg-surface pl-10 pr-3 text-sm text-ink ' +
  'placeholder:text-ink-subtle transition hover:border-ink-subtle/50 ' +
  'focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15 focus:outline-none ' +
  'disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-ink-subtle'

const selectClass =
  'h-9 rounded-lg border border-line bg-surface px-2.5 text-sm text-ink transition ' +
  'hover:border-ink-subtle/50 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15 focus:outline-none'

function Field({
  label,
  icon: Icon,
  className = '',
  children,
}: {
  label: string
  icon: LucideIcon
  className?: string
  children: (id: string) => ReactNode
}) {
  const id = useId()
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-xs font-medium text-ink-muted">
        {label}
      </label>
      <div className="relative">
        <Icon
          className="pointer-events-none absolute top-1/2 left-3 size-4.5 -translate-y-1/2 text-ink-subtle"
          aria-hidden="true"
        />
        {children(id)}
      </div>
    </div>
  )
}

// Visual search form for the landing page.
// Real search (airport lookup, results) is built in Phase 2.
export default function HeroSearchForm() {
  const [tripType, setTripType] = useState<TripType>('round-trip')
  const [origin, setOrigin] = useState('')
  const [destination, setDestination] = useState('')
  const [notice, setNotice] = useState('')

  // Earliest selectable date, computed once when the form mounts.
  const [today] = useState(getLocalDateString)

  function swapAirports() {
    setOrigin(destination)
    setDestination(origin)
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setNotice('Flight search is under construction and will be available soon.')
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-line bg-surface p-4 shadow-xl shadow-slate-900/5 sm:p-6"
    >
      {/* Trip options */}
      <div className="flex flex-wrap items-center gap-3">
        <div
          role="radiogroup"
          aria-label="Trip type"
          className="inline-flex rounded-lg bg-surface-muted p-1"
        >
          {(['round-trip', 'one-way'] as const).map((type) => (
            <button
              key={type}
              type="button"
              role="radio"
              aria-checked={tripType === type}
              onClick={() => setTripType(type)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
                tripType === type
                  ? 'bg-surface text-ink shadow-sm'
                  : 'text-ink-muted hover:text-ink'
              }`}
            >
              {type === 'round-trip' ? 'Round-trip' : 'One-way'}
            </button>
          ))}
        </div>

        <select aria-label="Passengers" defaultValue="1" className={selectClass}>
          {Array.from({ length: MAX_PASSENGERS }, (_, i) => i + 1).map((n) => (
            <option key={n} value={n}>
              {n} {n === 1 ? 'passenger' : 'passengers'}
            </option>
          ))}
        </select>

        <select aria-label="Travel class" defaultValue="Economy" className={selectClass}>
          {TRAVEL_CLASSES.map((travelClass) => (
            <option key={travelClass}>{travelClass}</option>
          ))}
        </select>
      </div>

      {/* Route and dates */}
      <div className="mt-4 grid gap-3 lg:grid-cols-12 lg:items-end">
        <div className="relative grid gap-3 sm:grid-cols-2 lg:col-span-6">
          <Field label="From" icon={PlaneTakeoff}>
            {(id) => (
              <input
                id={id}
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                placeholder="City or airport"
                autoComplete="off"
                className={inputClass}
              />
            )}
          </Field>
          <Field label="To" icon={PlaneLanding}>
            {(id) => (
              <input
                id={id}
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="City or airport"
                autoComplete="off"
                className={inputClass}
              />
            )}
          </Field>
          <button
            type="button"
            onClick={swapAirports}
            aria-label="Swap origin and destination"
            className="absolute top-[2.15rem] left-1/2 hidden size-8 -translate-x-1/2 items-center justify-center rounded-full border border-line bg-surface text-ink-muted shadow-sm transition hover:rotate-180 hover:text-brand-600 sm:flex"
          >
            <ArrowLeftRight className="size-4" aria-hidden="true" />
          </button>
        </div>

        <Field label="Departure" icon={CalendarDays} className="lg:col-span-2">
          {(id) => <input id={id} type="date" min={today} className={inputClass} />}
        </Field>
        <Field label="Return" icon={CalendarDays} className="lg:col-span-2">
          {(id) => (
            <input
              id={id}
              type="date"
              min={today}
              disabled={tripType === 'one-way'}
              className={inputClass}
            />
          )}
        </Field>

        <button type="submit" className={buttonStyles('primary', 'lg', 'lg:col-span-2')}>
          <Search className="size-4.5" aria-hidden="true" />
          Search
        </button>
      </div>

      <p aria-live="polite" className="mt-3 text-sm text-brand-700 empty:hidden">
        {notice}
      </p>
    </form>
  )
}
