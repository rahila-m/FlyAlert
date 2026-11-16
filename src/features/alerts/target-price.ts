// Pure helpers for target prices (no database access, easy to unit test).

import type { MessageKey } from '../../i18n/translate'

// Checks a target price typed by the user. Returns an error text key or undefined.
export function validateTargetPrice(value: string): MessageKey | undefined {
  if (!value.trim()) return 'alerts.error.targetEmpty'
  const number = Number(value)
  if (!Number.isFinite(number) || number <= 0) return 'alerts.error.targetPositive'
  if (number > 99_999_999) return 'alerts.error.targetTooHigh'
  return undefined
}

// A suggested target: about 10% below the current lowest fare, rounded down.
export function suggestTargetPrice(lowestPrice: number | null): string {
  if (!lowestPrice) return ''
  const target = lowestPrice * 0.9
  const step = target >= 1000 ? 100 : target >= 100 ? 10 : 1
  return String(Math.max(step, Math.floor(target / step) * step))
}
