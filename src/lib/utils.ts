// src/lib/utils.ts
import { format, fromUnixTime } from 'date-fns'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { TimeseriesDataPoint } from '../types/vaultTypes'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Add this new function
export const formatUnixTimestamp = (timestamp: number | string): string => {
  try {
    const date = fromUnixTime(Number(timestamp))
    return format(date, 'MMM d, yyyy')
  } catch (error) {
    console.error(`Error formatting unix timestamp: ${error}`)
    return 'Invalid date'
  }
}

// Helper function for SMA calculation
export const calculateSMA = (
  data: number[],
  windowSize: number = 15
): (number | null)[] => {
  const sma: (number | null)[] = []

  for (let i = 0; i < data.length; i++) {
    const start = Math.max(0, i - windowSize + 1)
    const windowData = data.slice(start, i + 1)
    const average =
      windowData.reduce((sum, value) => sum + value, 0) / windowData.length
    sma.push(average)
  }
  return sma
}

// Derive APR values from a PPS time series using optional smoothing
export function calculateAprFromPps(
  pps: TimeseriesDataPoint[],
  smoothingWindowDays: number = 1
): TimeseriesDataPoint[] {
  if (pps.length === 0) return []

  const aprSeries: TimeseriesDataPoint[] = []
  const window = Math.max(1, Math.floor(smoothingWindowDays))

  const smoothedValues: (number | null)[] = pps.map((point, index) => {
    const windowStart = Math.max(0, index - window + 1)
    let sum = 0
    let count = 0

    for (let i = windowStart; i <= index; i++) {
      const value = pps[i].value
      if (value !== null) {
        sum += value
        count++
      }
    }

    return count > 0 ? sum / count : null
  })

  for (let i = 0; i < pps.length; i++) {
    const current = pps[i]
    const currentSmoothed = smoothedValues[i]

    if (i === 0) {
      aprSeries.push({ ...current, value: null })
      continue
    }

    const prev = pps[i - 1]
    const prevSmoothed = smoothedValues[i - 1]

    if (
      current.value === null ||
      prev.value === null ||
      currentSmoothed === null ||
      prevSmoothed === null
    ) {
      aprSeries.push({ ...current, value: null })
      continue
    }

    const prevTime = Number(prev.time)
    const currTime = Number(current.time)
    const deltaDays = (currTime - prevTime) / 86400
    if (deltaDays <= 0) {
      aprSeries.push({ ...current, value: null })
      continue
    }

    const periodReturn = (currentSmoothed - prevSmoothed) / prevSmoothed
    const apr = periodReturn * (365 / deltaDays)
    aprSeries.push({ ...current, value: apr })
  }

  return aprSeries
}

// Convert APR timeseries values to APY with configurable compounding
export function calculateApyFromApr(
  aprSeries: TimeseriesDataPoint[],
  compoundingPeriodDays: number = 7
): TimeseriesDataPoint[] {
  if (aprSeries.length === 0) return []

  const periodDays = Math.max(1, compoundingPeriodDays)
  const periodsPerYear = 365 / periodDays

  return aprSeries.map(point => {
    if (point.value === null) {
      return { ...point, value: null }
    }

    const apr = point.value
    const apy = Math.pow(1 + apr / periodsPerYear, periodsPerYear) - 1

    return { ...point, value: apy }
  })
}

/**
 * Gets the earliest and latest timestamps from three arrays of timeseries data points.
 *
 * @param apy1 - Array of timeseries data points for APY.
 * @param tvl - Array of timeseries data points for TVL.
 * @param pps - Array of timeseries data points for PPS.
 * @returns An object containing the earliest and latest timestamps.
 */
export function getEarliestAndLatestTimestamps(
  apy1: TimeseriesDataPoint[],
  apy2: TimeseriesDataPoint[],
  tvl: TimeseriesDataPoint[],
  pps: TimeseriesDataPoint[],
  oracle?: TimeseriesDataPoint[]
) {
  // Convert string times to numbers for ease of comparison
  const apy1Times = apy1.map(d => Number(d.time))
  const apy2Times = apy2.map(d => Number(d.time))
  const tvlTimes = tvl.map(d => Number(d.time))
  const ppsTimes = pps.map(d => Number(d.time))
  const oracleTimes = oracle?.map(d => Number(d.time)) ?? []

  const earliest = Math.min(
    ...apy1Times,
    ...apy2Times,
    ...tvlTimes,
    ...ppsTimes,
    ...oracleTimes
  )
  const latest = Math.max(
    ...apy1Times,
    ...apy2Times,
    ...tvlTimes,
    ...ppsTimes,
    ...oracleTimes
  )
  return { earliest, latest }
}

// Helper to fill missing daily data
/**
 * Fills in missing daily data points in a time series.
 *
 * @param data - An array of `TimeseriesDataPoint` objects representing the existing data points.
 * @param earliest - The earliest timestamp (in Unix time) to start filling data from.
 * @param latest - The latest timestamp (in Unix time) to fill data up to.
 * @returns An array of `TimeseriesDataPoint` objects with missing days filled in.
 *
 * Each missing day will be filled with a `TimeseriesDataPoint` object containing:
 * - `time`: The timestamp of the missing day.
 * - `value`: `null` to indicate missing data.
 * - `label`: The label from the first data point in the input array, or an empty string if the input array is empty.
 * - `component`: The component from the first data point in the input array, or an empty string if the input array is empty.
 * - `period`: The period from the first data point in the input array, or '1 day' if the input array is empty.
 */
export function fillMissingDailyData(
  data: TimeseriesDataPoint[],
  earliest: number,
  latest: number
): TimeseriesDataPoint[] {
  // Index existing data by day (converted from Unix so day boundaries match)
  const dailyMap: Record<string, TimeseriesDataPoint> = {}
  data.forEach(point => {
    dailyMap[point.time] = point
  })

  const filled: TimeseriesDataPoint[] = []
  // Step through each day from earliest to latest
  for (let t = earliest; t <= latest; t += 86400) {
    const tStr = String(t)
    // If data is missing, fill in with null or 0
    if (!dailyMap[tStr]) {
      filled.push({
        time: tStr,
        value: null,
        label: data[0]?.label || '',
        component: data[0]?.component || '',
        period: data[0]?.period || '1 day',
      })
    } else {
      filled.push(dailyMap[tStr])
    }
  }
  return filled
}
