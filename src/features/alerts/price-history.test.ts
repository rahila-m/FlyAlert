import { describe, expect, it } from 'vitest'
import { groupByAlert, summarizePriceChecks, type PriceCheck } from './price-history'

const check = (checkedAt: string, overrides: Partial<PriceCheck> = {}): PriceCheck => ({
  alert_id: 'a1',
  checked_at: checkedAt,
  status: 'success',
  price: 100,
  currency: 'USD',
  airline: 'Test Air',
  booking_url: 'https://www.aviasales.com/search/x',
  ...overrides,
})

describe('summarizePriceChecks', () => {
  it('handles an alert that was never checked', () => {
    expect(summarizePriceChecks([])).toMatchObject({
      history: [],
      latest: null,
      changePercent: null,
      lowestPrice: null,
      totalChecks: 0,
      lastCheckedAt: null,
    })
  })

  it('computes latest price, change and lowest from successful checks only', () => {
    const summary = summarizePriceChecks([
      check('2026-11-13T12:00:00Z', { price: 200 }),
      check('2026-11-13T18:00:00Z', { status: 'error', price: null }),
      check('2026-11-13T06:00:00Z', { price: 150 }),
      check('2026-11-14T00:00:00Z', { price: 180 }),
      check('2026-11-14T06:00:00Z', { status: 'no_results', price: null }),
    ])
    expect(summary.history.map((point) => point.price)).toEqual([150, 200, 180]) // sorted by time
    expect(summary.latest?.price).toBe(180)
    expect(summary.previousPrice).toBe(200)
    expect(summary.changePercent).toBe(-10)
    expect(summary.lowestPrice).toBe(150)
    expect(summary.totalChecks).toBe(5)
    expect(summary.checksWithoutFares).toBe(2)
    expect(summary.lastCheckedAt).toBe('2026-11-14T06:00:00Z') // includes failed checks
  })

  it('never turns a failed check into a price, even if it has one by mistake', () => {
    const summary = summarizePriceChecks([check('2026-11-13T12:00:00Z', { status: 'error', price: 1 })])
    expect(summary.history).toEqual([])
    expect(summary.lowestPrice).toBeNull()
  })

  it('has no change percentage with a single price', () => {
    expect(summarizePriceChecks([check('2026-11-13T12:00:00Z')]).changePercent).toBeNull()
  })

  it('accepts prices that arrive as strings from the database (numeric columns)', () => {
    const summary = summarizePriceChecks([check('2026-11-13T12:00:00Z', { price: '7833.00' as unknown as number })])
    expect(summary.latest?.price).toBe(7833)
  })
})

describe('groupByAlert', () => {
  it('groups checks per alert', () => {
    const groups = groupByAlert([check('t1'), check('t2', { alert_id: 'a2' }), check('t3')])
    expect(groups.get('a1')).toHaveLength(2)
    expect(groups.get('a2')).toHaveLength(1)
  })
})
