import { describe, expect, it } from 'vitest'
import { suggestTargetPrice, validateTargetPrice } from './target-price'

describe('validateTargetPrice', () => {
  it('accepts positive numbers', () => {
    expect(validateTargetPrice('350')).toBeUndefined()
    expect(validateTargetPrice('99.5')).toBeUndefined()
  })

  it('rejects empty, zero, negative and non-numeric values', () => {
    expect(validateTargetPrice('')).toBeDefined()
    expect(validateTargetPrice('0')).toBeDefined()
    expect(validateTargetPrice('-10')).toBeDefined()
    expect(validateTargetPrice('abc')).toBeDefined()
    expect(validateTargetPrice('1e12')).toBeDefined()
  })
})

describe('suggestTargetPrice', () => {
  it('suggests about 10% below the lowest fare, rounded down', () => {
    expect(suggestTargetPrice(3546)).toBe('3100') // 3191 -> step 100
    expect(suggestTargetPrice(151)).toBe('130') // 135.9 -> step 10
    expect(suggestTargetPrice(57)).toBe('51') // 51.3 -> step 1
  })

  it('returns an empty value when no fare is known', () => {
    expect(suggestTargetPrice(null)).toBe('')
  })
})
