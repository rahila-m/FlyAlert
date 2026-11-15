// Live airport and city suggestions from Travelpayouts' public autocomplete service.
// It needs no token and allows browser requests, so it is called directly.
// Note: what the user types is sent to Travelpayouts to get suggestions.

import type { Airport } from './model'

const AUTOCOMPLETE_URL = 'https://autocomplete.travelpayouts.com/places2'
const MAX_RESULTS = 8

interface Place {
  type?: string
  code?: string
  name?: string
  city_name?: string
  country_name?: string
}

export async function searchPlaces(term: string, signal: AbortSignal): Promise<Airport[]> {
  const params = new URLSearchParams({ term, locale: 'en' })
  params.append('types[]', 'city')
  params.append('types[]', 'airport')

  const response = await fetch(`${AUTOCOMPLETE_URL}?${params}`, { signal })
  if (!response.ok) throw new Error(`Autocomplete responded with ${response.status}`)
  const data: unknown = await response.json()
  if (!Array.isArray(data)) throw new Error('Unexpected autocomplete response')

  return (data as Place[])
    .filter((place) => /^[A-Z]{3}$/.test(place.code ?? '') && place.name)
    .slice(0, MAX_RESULTS)
    .map((place): Airport =>
      place.type === 'city'
        ? {
            iata: place.code!,
            name: place.name!, // shown as "All airports in …" (translated) in the UI
            city: place.name!,
            country: place.country_name ?? '',
            kind: 'city',
          }
        : {
            iata: place.code!,
            name: place.name!,
            city: place.city_name || place.name!,
            country: place.country_name ?? '',
            kind: 'airport',
          },
    )
}
