// Date helpers. Dates are stored as "YYYY-MM-DD" strings (the format used by
// <input type="date"> and flight APIs). Such strings can be compared with < and >.

// Today's date in the user's local time zone.
// (toISOString() uses UTC and can return yesterday or tomorrow.)
export function getLocalDateString(date: Date = new Date()): string {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

function toLocalDate(isoDate: string): Date {
  const [year, month, day] = isoDate.split('-').map(Number)
  return new Date(year, month - 1, day)
}

// True for real calendar dates like "2026-12-31" (rejects "2026-02-30").
export function isIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const [year, month, day] = value.split('-').map(Number)
  const date = toLocalDate(value)
  return (
    date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day
  )
}

// "2026-12-10" -> "Thu, Dec 10"
export function formatDisplayDate(isoDate: string): string {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(toLocalDate(isoDate))
}
