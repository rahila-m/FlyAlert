// Summarizes an alert's recorded price checks for display.
// Only real, successful checks are used for prices; failed checks and
// "no fares found" checks are counted but never turned into a price.

export interface PriceCheck {
  alert_id: string
  checked_at: string
  status: 'success' | 'no_results' | 'error'
  price: number | null
  currency: string | null
  airline: string | null
  booking_url: string | null
}

export interface PricePoint {
  checkedAt: string
  price: number
}

export interface PriceSummary {
  history: PricePoint[] // successful checks, oldest first
  latest: (PricePoint & { airline: string | null; bookingUrl: string | null }) | null
  previousPrice: number | null
  changePercent: number | null // latest vs previous successful check
  lowestPrice: number | null
  totalChecks: number
  checksWithoutFares: number // no_results + errors
  lastCheckedAt: string | null
}

export function summarizePriceChecks(checks: PriceCheck[]): PriceSummary {
  const sorted = [...checks].sort((a, b) => a.checked_at.localeCompare(b.checked_at))
  // Postgres `numeric` values may arrive as numbers or as strings like "7833.00".
  const successful = sorted.filter(
    (check): check is PriceCheck & { price: number } =>
      check.status === 'success' && check.price !== null && Number.isFinite(Number(check.price)),
  )
  const history = successful.map((check) => ({ checkedAt: check.checked_at, price: Number(check.price) }))

  const last = successful.at(-1)
  const previous = successful.at(-2)
  const latestPrice = last ? Number(last.price) : null
  const previousPrice = previous ? Number(previous.price) : null

  return {
    history,
    latest: last
      ? { checkedAt: last.checked_at, price: Number(last.price), airline: last.airline, bookingUrl: last.booking_url }
      : null,
    previousPrice,
    changePercent:
      latestPrice !== null && previousPrice !== null && previousPrice > 0
        ? Math.round(((latestPrice - previousPrice) / previousPrice) * 1000) / 10
        : null,
    lowestPrice: history.length ? Math.min(...history.map((point) => point.price)) : null,
    totalChecks: sorted.length,
    checksWithoutFares: sorted.length - successful.length,
    lastCheckedAt: sorted.at(-1)?.checked_at ?? null,
  }
}

// Groups checks by alert so each card gets its own list.
export function groupByAlert(checks: PriceCheck[]): Map<string, PriceCheck[]> {
  const groups = new Map<string, PriceCheck[]>()
  for (const check of checks) {
    const list = groups.get(check.alert_id) ?? []
    list.push(check)
    groups.set(check.alert_id, list)
  }
  return groups
}
