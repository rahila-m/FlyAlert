import { describe, expect, it } from 'vitest'
import { conversionFactor, type ExchangeRates } from './exchange-rates'

const rates: ExchangeRates = { base: 'USD', rates: { USD: 1, TRY: 50, AZN: 1.7 }, updatedAt: '' }

describe('conversionFactor', () => {
  it('converts through the USD base', () => {
    // 1 TRY = 1.7 / 50 AZN
    expect(conversionFactor(rates, 'TRY', 'AZN')).toBeCloseTo(0.034)
    expect(9000 * conversionFactor(rates, 'TRY', 'AZN')!).toBeCloseTo(306)
  })

  it('is 1 for the same currency, even without rates', () => {
    expect(conversionFactor(null, 'AZN', 'AZN')).toBe(1)
  })

  it('returns null when a rate is missing', () => {
    expect(conversionFactor(rates, 'TRY', 'GBP')).toBeNull()
    expect(conversionFactor(null, 'TRY', 'AZN')).toBeNull()
  })
})
