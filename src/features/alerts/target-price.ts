// Pure helpers for target prices (no database access, easy to unit test).

// Checks a target price typed by the user. Returns an error message or undefined.
export function validateTargetPrice(value: string): string | undefined {
  if (!value.trim()) return 'Enter a target price.'
  const number = Number(value)
  if (!Number.isFinite(number) || number <= 0) return 'Enter a price above 0.'
  if (number > 99_999_999) return 'That price is too high.'
  return undefined
}

// A suggested target: about 10% below the current lowest fare, rounded down.
export function suggestTargetPrice(lowestPrice: number | null): string {
  if (!lowestPrice) return ''
  const target = lowestPrice * 0.9
  const step = target >= 1000 ? 100 : target >= 100 ? 10 : 1
  return String(Math.max(step, Math.floor(target / step) * step))
}
