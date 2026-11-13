import { ArrowLeftRight, CalendarDays, PlaneLanding, PlaneTakeoff, Search } from 'lucide-react'
import { useId, useRef, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router'
import { buttonStyles } from '../../components/ui/button-styles'
import {
  errorTextClass,
  inputWithIconClass,
  labelClass,
  leadingIconClass,
  selectClass,
} from '../../components/ui/form-styles'
import { getLocalDateString } from '../../lib/dates'
import AirportCombobox from './AirportCombobox'
import {
  EMPTY_SEARCH,
  MAX_PASSENGERS,
  TRAVEL_CLASSES,
  type SearchFormValues,
  type TravelClass,
} from './model'
import { hasErrors, toFlightSearch, toSearchParams, validateSearch } from './search-params'

function DateField({
  label,
  value,
  min,
  disabled,
  error,
  onChange,
}: {
  label: string
  value: string
  min: string
  disabled?: boolean
  error?: string
  onChange: (value: string) => void
}) {
  const id = useId()
  const errorId = `${id}-error`
  return (
    <div>
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      <div className="relative">
        <CalendarDays className={leadingIconClass} aria-hidden="true" />
        <input
          id={id}
          type="date"
          value={value}
          min={min}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          onChange={(event) => onChange(event.target.value)}
          className={inputWithIconClass}
        />
      </div>
      {error && (
        <p id={errorId} className={errorTextClass}>
          {error}
        </p>
      )}
    </div>
  )
}

interface FlightSearchFormProps {
  initialValues?: SearchFormValues
  // Show validation errors immediately (used when a search comes from the URL).
  validateOnMount?: boolean
}

export default function FlightSearchForm({
  initialValues = EMPTY_SEARCH,
  validateOnMount = false,
}: FlightSearchFormProps) {
  const navigate = useNavigate()
  const formRef = useRef<HTMLFormElement>(null)
  const [values, setValues] = useState(initialValues)
  const [showErrors, setShowErrors] = useState(validateOnMount)
  const [today] = useState(getLocalDateString)

  // Errors are recalculated on every change once the user has tried to submit.
  const errors = showErrors ? validateSearch(values, today) : {}

  function update<K extends keyof SearchFormValues>(key: K, value: SearchFormValues[K]) {
    setValues((previous) => ({ ...previous, [key]: value }))
  }

  function swapAirports() {
    setValues((previous) => ({
      ...previous,
      origin: previous.destination,
      destination: previous.origin,
    }))
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const search = toFlightSearch(values)
    if (hasErrors(validateSearch(values, today)) || !search) {
      setShowErrors(true)
      // Move focus to the first invalid field once React has rendered the errors.
      requestAnimationFrame(() => {
        formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus()
      })
      return
    }
    navigate(`/search?${toSearchParams(search)}`)
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      noValidate
      aria-label="Flight search"
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
              aria-checked={values.tripType === type}
              onClick={() => update('tripType', type)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
                values.tripType === type
                  ? 'bg-surface text-ink shadow-sm'
                  : 'text-ink-muted hover:text-ink'
              }`}
            >
              {type === 'round-trip' ? 'Round-trip' : 'One-way'}
            </button>
          ))}
        </div>

        <select
          aria-label="Passengers"
          value={values.adults}
          onChange={(event) => update('adults', Number(event.target.value))}
          className={selectClass}
        >
          {Array.from({ length: MAX_PASSENGERS }, (_, i) => i + 1).map((count) => (
            <option key={count} value={count}>
              {count} {count === 1 ? 'passenger' : 'passengers'}
            </option>
          ))}
        </select>

        <select
          aria-label="Travel class"
          value={values.travelClass}
          onChange={(event) => update('travelClass', event.target.value as TravelClass)}
          className={selectClass}
        >
          {TRAVEL_CLASSES.map((travelClass) => (
            <option key={travelClass.value} value={travelClass.value}>
              {travelClass.label}
            </option>
          ))}
        </select>
      </div>

      {/* Route and dates */}
      <div className="mt-4 grid gap-3 lg:grid-cols-12 lg:items-start">
        <div className="relative grid gap-3 sm:grid-cols-2 lg:col-span-6">
          <AirportCombobox
            label="From"
            icon={PlaneTakeoff}
            value={values.origin}
            onChange={(airport) => update('origin', airport)}
            error={errors.origin}
          />
          <AirportCombobox
            label="To"
            icon={PlaneLanding}
            value={values.destination}
            onChange={(airport) => update('destination', airport)}
            error={errors.destination}
          />
          <button
            type="button"
            onClick={swapAirports}
            aria-label="Swap origin and destination"
            className="absolute top-7.5 left-1/2 z-10 hidden size-8 -translate-x-1/2 items-center justify-center rounded-full border border-line bg-surface text-ink-muted shadow-sm transition hover:rotate-180 hover:text-brand-600 sm:flex"
          >
            <ArrowLeftRight className="size-4" aria-hidden="true" />
          </button>
        </div>

        <div className="lg:col-span-2">
          <DateField
            label="Departure"
            value={values.departureDate}
            min={today}
            error={errors.departureDate}
            onChange={(date) => update('departureDate', date)}
          />
        </div>
        <div className="lg:col-span-2">
          <DateField
            label="Return"
            value={values.tripType === 'round-trip' ? values.returnDate : ''}
            min={values.departureDate || today}
            disabled={values.tripType === 'one-way'}
            error={errors.returnDate}
            onChange={(date) => update('returnDate', date)}
          />
        </div>

        <button type="submit" className={buttonStyles('primary', 'lg', 'lg:col-span-2 lg:mt-5.5')}>
          <Search className="size-4.5" aria-hidden="true" />
          Search
        </button>
      </div>

      {errors.adults && <p className={errorTextClass}>{errors.adults}</p>}
    </form>
  )
}
