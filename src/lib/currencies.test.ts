import { describe, it, expect } from 'vitest'
import { getCurrency, searchCurrencies, CURRENCIES } from './currencies'

describe('getCurrency', () => {
  it('returns currency info for a valid code', () => {
    const usd = getCurrency('USD')
    expect(usd).toEqual({ code: 'USD', name: 'United States Dollar', symbol: '$' })
  })

  it('returns undefined for unknown code', () => {
    expect(getCurrency('FAKE')).toBeUndefined()
  })
})

describe('searchCurrencies', () => {
  it('returns all currencies when query is empty', () => {
    expect(searchCurrencies('')).toEqual(CURRENCIES)
  })

  it('filters by currency code', () => {
    const results = searchCurrencies('ILS')
    expect(results).toHaveLength(1)
    expect(results[0].code).toBe('ILS')
  })

  it('filters by currency name (case insensitive)', () => {
    const results = searchCurrencies('euro')
    expect(results.some((c) => c.code === 'EUR')).toBe(true)
  })

  it('filters by symbol', () => {
    const results = searchCurrencies('₪')
    expect(results.some((c) => c.code === 'ILS')).toBe(true)
  })

  it('returns empty for no match', () => {
    expect(searchCurrencies('zzznonexistent')).toHaveLength(0)
  })
})
