// What the assistant may "see": a short plain-text summary of the REAL data on
// the current page (e.g. search results). Pages publish it, the assistant reads it.
// Demo offers are never included, so the assistant can't present them as real.

import { useSyncExternalStore } from 'react'
import type { FlightOffer, FlightSearch } from '../search/model'

let current: string | null = null
const listeners = new Set<() => void>()

export function setAssistantContext(value: string | null) {
  if (value === current) return
  current = value
  listeners.forEach((listener) => listener())
}

export function getAssistantContext(): string | null {
  return current
}

export function useAssistantContext(): string | null {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    () => current,
  )
}

const MAX_OFFERS = 8

// Turns a search and its real offers into a compact text the AI can read.
export function describeSearchResults(search: FlightSearch, offers: FlightOffer[]): string | null {
  const real = offers.filter((offer) => offer.source === 'api')
  // When only the code is known (e.g. a typed URL), send just the code.
  const place = (airport: FlightSearch['origin']) =>
    airport.city && airport.city !== airport.iata ? `${airport.city} (${airport.iata})` : `airport code ${airport.iata}`
  const header = [
    `Search: ${place(search.origin)} → ${place(search.destination)}`,
    `Trip: ${search.tripType}, depart ${search.departureDate}${search.returnDate ? `, return ${search.returnDate}` : ''}, ${search.adults} adult(s), economy`,
  ]
  if (real.length === 0) return [...header, 'Results: no real fares found for this search.'].join('\n')

  const cheapest = [...real].sort((a, b) => a.price.perPerson - b.price.perPerson).slice(0, MAX_OFFERS)
  const lines = cheapest.map((offer, index) => {
    const stops = offer.outbound.stops === 0 ? 'direct' : `${offer.outbound.stops} stop(s)`
    const duration = offer.outbound.durationMinutes ? `, ${Math.round(offer.outbound.durationMinutes / 6) / 10}h` : ''
    const dates = `${offer.outbound.departureAt.slice(0, 16).replace('T', ' ')}${offer.inbound ? ` / back ${offer.inbound.departureAt.slice(0, 10)}` : ''}`
    const match = offer.dateMatch === 'exact' ? 'requested date' : 'nearby date'
    return `${index + 1}. ${offer.airline.name} — ${offer.price.perPerson} ${offer.price.currency} per person, ${stops}${duration}, ${dates} (${match})`
  })
  return [
    ...header,
    `Results: ${real.length} real fares (cached in the last ~48h from Travelpayouts/Aviasales). Cheapest ${cheapest.length}:`,
    ...lines,
  ].join('\n')
}
