import { useEffect, useState } from 'react'
import { generateDemoOffers } from './demo/demo-offers'
import type { FlightOffer, FlightSearch } from './model'

// Loads flight offers for a search.
// For now it returns DEMO data after a short delay that imitates a network request,
// so the loading state can be designed and tested. In Phase 4 this hook will call
// our backend instead, and the components using it won't need to change.
// `search` must be memoized by the caller, otherwise the request restarts on every render.
export function useFlightOffers(search: FlightSearch | null) {
  const [result, setResult] = useState<{ search: FlightSearch; offers: FlightOffer[] } | null>(
    null,
  )

  useEffect(() => {
    if (!search) return
    const timer = setTimeout(() => {
      setResult({ search, offers: generateDemoOffers(search) })
    }, 600)
    // Cancel if the search changes before the "request" finishes.
    return () => clearTimeout(timer)
  }, [search])

  const isLoading = search !== null && result?.search !== search
  return { isLoading, offers: isLoading || !result ? [] : result.offers }
}
