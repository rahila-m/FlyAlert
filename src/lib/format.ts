// Display formatting helpers. They follow the user's language (see i18n/locale.ts).

import { getActiveLanguage, getLocaleTag } from '../i18n/locale'

// Currencies whose own sign is clear enough to show instead of the code
// (by default browsers write "AZN 304" instead of "₼304").
const NARROW_SYMBOL = new Set(['AZN', 'TRY'])

// 1234.5, "USD" -> "$1,235" (en) / "$1.235" (tr); 304, "AZN" -> "₼304"
export function formatPrice(amount: number, currency: string): string {
  return new Intl.NumberFormat(getLocaleTag(), {
    style: 'currency',
    currency,
    currencyDisplay: NARROW_SYMBOL.has(currency) ? 'narrowSymbol' : 'symbol',
    maximumFractionDigits: 0,
  }).format(amount)
}

// 445 -> "7h 25m" (en) / "7 sa 25 dk" (tr)
export function formatDuration(minutes: number): string {
  const tr = getActiveLanguage() === 'tr'
  const h = tr ? ' sa' : 'h'
  const m = tr ? ' dk' : 'm'
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  if (hours === 0) return `${rest}${m}`
  return rest === 0 ? `${hours}${h}` : `${hours}${h} ${rest}${m}`
}

// "2026-12-10T08:35" -> "08:35"
export function formatTime(localDateTime: string): string {
  return localDateTime.slice(11, 16)
}

// Calendar days between two local date-times: used for "+1" next-day arrivals.
export function dayDifference(fromDateTime: string, toDateTime: string): number {
  const toUtcDay = (value: string) => {
    const [year, month, day] = value.slice(0, 10).split('-').map(Number)
    return Date.UTC(year, month - 1, day)
  }
  return Math.round((toUtcDay(toDateTime) - toUtcDay(fromDateTime)) / 86_400_000)
}

// 0 -> "Direct" / "Aktarmasız", 1 -> "1 stop" / "1 aktarma"
export function formatStops(stops: number): string {
  if (getActiveLanguage() === 'tr') return stops === 0 ? 'Aktarmasız' : `${stops} aktarma`
  if (stops === 0) return 'Direct'
  return stops === 1 ? '1 stop' : `${stops} stops`
}
