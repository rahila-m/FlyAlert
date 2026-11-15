import { Building2, Plane, type LucideIcon } from 'lucide-react'
import { useEffect, useId, useMemo, useState, type KeyboardEvent } from 'react'
import {
  errorTextClass,
  inputWithIconClass,
  labelClass,
  leadingIconClass,
} from '../../components/ui/form-styles'
import { useT } from '../preferences/preferences-context'
import { rememberPlace, searchAirports } from './airports'
import { formatAirport, type Airport } from './model'
import { searchPlaces } from './places-api'

const SUGGESTION_DELAY_MS = 250 // wait until the user pauses typing

interface AirportComboboxProps {
  label: string
  icon: LucideIcon
  value: Airport | null
  onChange: (airport: Airport | null) => void
  error?: string
}

// Text input with an airport suggestion list.
// Follows the WAI-ARIA "combobox" pattern so it works with keyboard and screen readers:
// ArrowUp/ArrowDown move through suggestions, Enter selects, Escape closes.
export default function AirportCombobox({
  label,
  icon: Icon,
  value,
  onChange,
  error,
}: AirportComboboxProps) {
  const id = useId()
  const listId = `${id}-list`
  const errorId = `${id}-error`
  const t = useT()

  // `draft` is the text while the user is typing; null means "show the selected airport".
  const [draft, setDraft] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)

  const term = draft?.trim() ?? ''
  // Instant results from our built-in list…
  const localResults = useMemo(() => searchAirports(term), [term])
  // …replaced by live results (every airport and city worldwide) when they arrive.
  const [live, setLive] = useState<{ term: string; places: Airport[] } | null>(null)

  useEffect(() => {
    if (term.length < 2) return
    const controller = new AbortController()
    // "Debounce": only ask the server once the user stops typing for a moment.
    const timer = setTimeout(() => {
      searchPlaces(term, controller.signal)
        .then((places) => setLive({ term, places }))
        .catch(() => {
          // Service unavailable: keep showing the built-in results.
        })
    }, SUGGESTION_DELAY_MS)
    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [term])

  const results = live?.term === term && live.places.length > 0 ? live.places : localResults
  const showList = isOpen && draft !== null && term.length > 0
  const inputValue = draft ?? (value ? formatAirport(value, t('search.allAirportsShort')) : '')

  function select(airport: Airport) {
    rememberPlace(airport)
    onChange(airport)
    setDraft(null)
    setIsOpen(false)
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (!showList || results.length === 0) return
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActiveIndex((index) => (index + 1) % results.length)
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIndex((index) => (index - 1 + results.length) % results.length)
    } else if (event.key === 'Enter') {
      event.preventDefault() // don't submit the form while choosing
      select(results[activeIndex])
    } else if (event.key === 'Escape') {
      setIsOpen(false)
    }
  }

  function handleBlur() {
    setIsOpen(false)
    // Typing an exact code ("ist") or something with a single match selects it automatically.
    if (draft && results.length > 0) {
      const exact = results.find((airport) => airport.iata === draft.trim().toUpperCase())
      if (exact) select(exact)
      else if (results.length === 1) select(results[0])
    }
  }

  return (
    <div className="relative">
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      <div className="relative">
        <Icon className={leadingIconClass} aria-hidden="true" />
        <input
          id={id}
          type="text"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={showList}
          aria-controls={listId}
          aria-activedescendant={
            showList && results.length > 0 ? `${listId}-${activeIndex}` : undefined
          }
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          value={inputValue}
          placeholder={t('search.placeholder')}
          autoComplete="off"
          spellCheck={false}
          className={inputWithIconClass}
          onFocus={(event) => event.target.select()}
          onChange={(event) => {
            setDraft(event.target.value)
            setIsOpen(true)
            setActiveIndex(0)
            if (value) onChange(null)
          }}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
        />
      </div>

      {showList && (
        <ul
          id={listId}
          role="listbox"
          aria-label={t('search.suggestions', { label })}
          className="absolute z-30 mt-1 max-h-72 w-full min-w-72 overflow-auto rounded-xl border border-line bg-surface p-1 shadow-lg"
        >
          {results.length === 0 ? (
            <li className="px-3 py-2.5 text-sm text-ink-subtle">{t('search.noAirports')}</li>
          ) : (
            results.map((airport, index) => (
              <li
                key={airport.iata}
                id={`${listId}-${index}`}
                role="option"
                aria-selected={index === activeIndex}
                // preventDefault keeps focus in the input so blur doesn't close the list first
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => select(airport)}
                onMouseEnter={() => setActiveIndex(index)}
                className={`flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 ${
                  index === activeIndex ? 'bg-brand-50' : ''
                }`}
              >
                {airport.kind === 'city' ? (
                  <Building2 className="size-4 shrink-0 text-ink-subtle" aria-hidden="true" />
                ) : (
                  <Plane className="size-4 shrink-0 text-ink-subtle" aria-hidden="true" />
                )}
                <span className="w-11 shrink-0 rounded-md bg-surface-muted py-1 text-center text-xs font-semibold text-ink">
                  {airport.iata}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-ink">
                    {airport.city}
                    {airport.country && `, ${airport.country}`}
                  </span>
                  <span className="block truncate text-xs text-ink-subtle">
                    {airport.kind === 'city' ? t('search.allAirports', { city: airport.city }) : airport.name}
                  </span>
                </span>
              </li>
            ))
          )}
        </ul>
      )}

      {error && (
        <p id={errorId} className={errorTextClass}>
          {error}
        </p>
      )}
    </div>
  )
}
