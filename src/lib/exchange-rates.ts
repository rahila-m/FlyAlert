// Daily exchange rates from our own API (/api/rates → ExchangeRate-API).
// Used only to *show* an amount in the user's chosen currency, e.g. a TRY
// alert as "≈ ₼530". Real fares are never replaced by converted numbers:
// the original currency is always shown next to a converted value.

import { useEffect, useState } from 'react'

export interface ExchangeRates {
  base: 'USD'
  rates: Record<string, number> // 1 USD = rates[code]
  updatedAt: string
}

// Attribution required by the rate provider's free terms.
export const RATES_ATTRIBUTION = { label: 'Rates By Exchange Rate API', href: 'https://www.exchangerate-api.com' }

// Returns how many `to` one `from` is worth, or null if a rate is missing.
export function conversionFactor(rates: ExchangeRates | null, from: string, to: string): number | null {
  if (from === to) return 1
  const fromRate = rates?.rates[from]
  const toRate = rates?.rates[to]
  if (!fromRate || !toRate) return null
  return toRate / fromRate
}

let request: Promise<ExchangeRates | null> | null = null

// One request per page load is enough (rates change once a day).
export function loadExchangeRates(): Promise<ExchangeRates | null> {
  request ??= fetch('/api/rates')
    .then((response) => (response.ok ? (response.json() as Promise<ExchangeRates>) : null))
    .catch(() => null)
    .then((rates) => {
      if (!rates) request = null // allow a retry later
      return rates
    })
  return request
}

// `null` while loading or when rates are unavailable — callers then simply
// show the original currency.
export function useExchangeRates(enabled = true): ExchangeRates | null {
  const [rates, setRates] = useState<ExchangeRates | null>(null)
  useEffect(() => {
    if (!enabled) return
    let active = true
    loadExchangeRates().then((value) => {
      if (active) setRates(value)
    })
    return () => {
      active = false
    }
  }, [enabled])
  return rates
}
