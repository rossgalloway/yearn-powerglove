import { describe, it, expect } from 'vitest'
import { calculateAprFromPps, calculateApyFromApr } from '@/lib/utils'
import { TimeseriesDataPoint } from '@/types/dataTypes'

describe('calculateAprFromPps', () => {
  it('calculates APR for daily returns', () => {
    const series: TimeseriesDataPoint[] = [
      { time: '0', value: 100, label: '', period: '1 day' },
      { time: '86400', value: 101, label: '', period: '1 day' },
    ]
    const result = calculateAprFromPps(series)
    const expected = Math.pow(1 + (101 - 100) / 100, 365) - 1
    expect(result[1].value).toBeCloseTo(expected)
  })

  it('handles null values and irregular intervals', () => {
    const series: TimeseriesDataPoint[] = [
      { time: '0', value: 100, label: '', period: '1 day' },
      { time: String(86400 * 2), value: null, label: '', period: '1 day' },
      { time: String(86400 * 3), value: 102, label: '', period: '1 day' },
    ]
    const result = calculateAprFromPps(series)
    // second point should be null due to missing value
    expect(result[1].value).toBeNull()
    // third point should also be null because previous value is null
    expect(result[2].value).toBeNull()
  })

  it('calculates APR with irregular intervals', () => {
    const series: TimeseriesDataPoint[] = [
      { time: '0', value: 100, label: '', period: '1 day' },
      { time: String(86400 * 2), value: 102, label: '', period: '1 day' }, // 2 days later
    ]
    const result = calculateAprFromPps(series)
    const expected = Math.pow(1 + (102 - 100) / 100, 365 / 2) - 1
    expect(result[1].value).toBeCloseTo(expected)
  })

  it('applies smoothing window when provided', () => {
    const series: TimeseriesDataPoint[] = [
      { time: '0', value: 100, label: '', period: '1 day' },
      { time: String(86400), value: 110, label: '', period: '1 day' },
      { time: String(86400 * 2), value: 120, label: '', period: '1 day' },
    ]

    const result = calculateAprFromPps(series, 2)
    const prevSmoothed = (100 + 110) / 2
    const currentSmoothed = (110 + 120) / 2
    const expected = Math.pow(
      1 + (currentSmoothed - prevSmoothed) / prevSmoothed,
      365
    ) - 1

    expect(result[2].value).toBeCloseTo(expected)
  })
})

describe('calculateApyFromApr', () => {
  it('converts APR series to APY with default weekly compounding', () => {
    const aprSeries: TimeseriesDataPoint[] = [
      { time: '0', value: null, label: '', period: '1 day' },
      { time: '86400', value: 0.5, label: '', period: '1 day' },
    ]

    const result = calculateApyFromApr(aprSeries)
    const periodsPerYear = 365 / 7
    const expected = Math.pow(1 + 0.5 / periodsPerYear, periodsPerYear) - 1

    expect(result[0].value).toBeNull()
    expect(result[1].value).toBeCloseTo(expected)
  })

  it('handles custom compounding periods', () => {
    const aprSeries: TimeseriesDataPoint[] = [
      { time: '0', value: 0.2, label: '', period: '1 day' },
    ]

    const result = calculateApyFromApr(aprSeries, 1) // daily compounding
    const expected = Math.pow(1 + 0.2 / 365, 365) - 1

    expect(result[0].value).toBeCloseTo(expected)
  })
})
