import { useEffect, useState } from 'react'
import { generateDemoOffers } from './demo/demo-offers'
import { FlightSearchError, searchFlights } from './flights-api'
import type { FlightOffer, FlightSearch } from './model'

// Where flight offers come from:
//   'api'  (default) → our Worker → Travelpayouts: real prices
//   'demo'           → locally generated DEMO data, clearly labelled in the UI
// Set VITE_FLIGHT_DATA_SOURCE=demo in .env.local to work without the Worker.
// Important: if the API fails we show an error. We never silently fall back to demo data.
const DATA_SOURCE = import.meta.env.VITE_FLIGHT_DATA_SOURCE === 'demo' ? 'demo' : 'api'

export type OffersState =
  | { status: 'loading' }
  | { status: 'success'; offers: FlightOffer[] }
  | { status: 'error'; message: string }

interface RequestKey {
  search: FlightSearch
  currency: string
  attempt: number
}

async function loadOffers(key: RequestKey, signal: AbortSignal): Promise<OffersState> {
  if (DATA_SOURCE === 'demo') {
    await new Promise((resolve) => setTimeout(resolve, 400))
    return { status: 'success', offers: generateDemoOffers(key.search) }
  }
  try {
    return { status: 'success', offers: await searchFlights(key.search, key.currency, signal) }
  } catch (error) {
    const message =
      error instanceof FlightSearchError ? error.message : 'Flight search failed. Please try again.'
    return { status: 'error', message }
  }
}

// `search` must be memoized by the caller, otherwise the request restarts on every render.
// `currency` is null while the user's preferred currency is still loading.
export function useFlightOffers(search: FlightSearch | null, currency: string | null) {
  const [attempt, setAttempt] = useState(0) // incremented by retry()
  const [result, setResult] = useState<{ key: RequestKey; state: OffersState } | null>(null)

  useEffect(() => {
    if (!search || !currency) return
    const controller = new AbortController()
    const key: RequestKey = { search, currency, attempt }
    loadOffers(key, controller.signal).then((state) => {
      if (!controller.signal.aborted) setResult({ key, state })
    })
    // Cancel the request if the search changes or the page closes.
    return () => controller.abort()
  }, [search, currency, attempt])

  // Only show a result if it belongs to the current search (not a previous one).
  const isCurrent =
    result?.key.search === search &&
    result?.key.currency === currency &&
    result?.key.attempt === attempt
  const state: OffersState = isCurrent && result ? result.state : { status: 'loading' }

  return { state, retry: () => setAttempt((n) => n + 1) }
}
