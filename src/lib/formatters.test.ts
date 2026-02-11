import { describe, expect, it } from 'vitest'
import {
  formatAllocationPercent,
  formatApyDisplay,
  formatTvlDisplay,
  parseCompactDisplayNumber
} from '@/lib/formatters'

describe('formatApyDisplay', () => {
  it('formats APY with three significant digits', () => {
    expect(formatApyDisplay(0.1234, { locales: ['en-US'] })).toBe('12.3%')
    expect(formatApyDisplay(0.04567, { locales: ['en-US'] })).toBe('4.57%')
  })

  it('caps very large APY display', () => {
    expect(formatApyDisplay(5.01, { locales: ['en-US'] })).toBe('≥ 500%')
  })
})

describe('formatTvlDisplay', () => {
  it('formats regular values with significant digits', () => {
    expect(formatTvlDisplay(987.65, { locales: ['en-US'] })).toBe('$988')
    expect(formatTvlDisplay(12.34, { locales: ['en-US'] })).toBe('$12.34')
  })

  it('formats large values using compact notation', () => {
    const compact = formatTvlDisplay(123456, { locales: ['en-US'] })
    expect(compact.startsWith('$')).toBe(true)
    expect(/K|M|B|T/.test(compact)).toBe(true)
  })
})

describe('formatAllocationPercent', () => {
  it('uses 3 significant digits for percentages', () => {
    expect(formatAllocationPercent(12.345, { locales: ['en-US'] })).toBe('12.3%')
    expect(formatAllocationPercent(0.1234, { locales: ['en-US'] })).toBe('0.12%')
  })
})

describe('parseCompactDisplayNumber', () => {
  it('parses compact and infinite values', () => {
    expect(parseCompactDisplayNumber('$12.3K')).toBe(12300)
    expect(parseCompactDisplayNumber('$4.56M')).toBe(4560000)
    expect(parseCompactDisplayNumber('$∞')).toBe(Number.POSITIVE_INFINITY)
  })

  it('returns NaN for unparsable values', () => {
    expect(Number.isNaN(parseCompactDisplayNumber(' - '))).toBe(true)
  })
})
