// Display formatting helpers.

// 1234.5, "USD" -> "$1,235"
export function formatPrice(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount)
}

// 445 -> "7h 25m"
export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  if (hours === 0) return `${rest}m`
  return rest === 0 ? `${hours}h` : `${hours}h ${rest}m`
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

// 0 -> "Direct", 1 -> "1 stop", 2 -> "2 stops"
export function formatStops(stops: number): string {
  if (stops === 0) return 'Direct'
  return stops === 1 ? '1 stop' : `${stops} stops`
}
