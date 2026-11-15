import { describe, expect, it } from 'vitest'
import { en, type MessageKey } from './messages/en'
import { tr } from './messages/tr'
import { translate } from './translate'

const keys = Object.keys(en) as MessageKey[]
const placeholders = (text: string) => (text.match(/\{\w+\}/g) ?? []).sort()

describe('translations', () => {
  it('has a non-empty Turkish text for every key', () => {
    for (const key of keys) expect(tr[key]?.trim(), key).toBeTruthy()
  })

  it('uses the same placeholders in both languages', () => {
    for (const key of keys) expect(placeholders(tr[key]), key).toEqual(placeholders(en[key]))
  })

  it('fills in placeholders', () => {
    expect(translate('en', 'search.passengerCountPlural', { count: 3 })).toBe('3 passengers')
    expect(translate('tr', 'search.passengerCountPlural', { count: 3 })).toBe('3 yolcu')
    expect(translate('en', 'footer.rights', { year: 2026 })).toContain('2026')
  })

  it('leaves unknown placeholders visible instead of breaking', () => {
    expect(translate('en', 'search.suggestions')).toBe('{label} suggestions')
  })
})
