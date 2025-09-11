import { useMemo } from 'react'
import {
  TimeseriesDataPoint,
  apyChartData,
  tvlChartData,
  ppsChartData,
  aprChartData,
} from '@/types/dataTypes'
import {
  calculateSMA,
  fillMissingDailyData,
  formatUnixTimestamp,
  getEarliestAndLatestTimestamps,
  calculateAprFromPps,
} from '@/lib/utils'

interface TimeseriesQueryResult {
  timeseries: TimeseriesDataPoint[]
}

interface UseChartDataProps {
  apyData: TimeseriesQueryResult | undefined
  tvlData: TimeseriesQueryResult | undefined
  ppsData: TimeseriesQueryResult | undefined
  isLoading: boolean
  hasErrors: boolean
}

interface UseChartDataReturn {
  transformedApyData: apyChartData | null
  transformedTvlData: tvlChartData | null
  transformedPpsData: ppsChartData | null
  transformedAprData: aprChartData | null
}

/**
 * Processes raw timeseries data into chart-ready format
 * Extracted from the original processChartData function
 */
export function useChartData({
  apyData,
  tvlData,
  ppsData,
  isLoading,
  hasErrors,
}: UseChartDataProps): UseChartDataReturn {
  return useMemo(() => {
    // Only process data if all queries are complete and successful
    if (isLoading || hasErrors || !apyData || !tvlData || !ppsData) {
      return {
        transformedApyData: null,
        transformedTvlData: null,
        transformedPpsData: null,
        transformedAprData: null,
      }
    }

    // Extract clean data arrays
    const apy30DayDataClean = apyData.timeseries || []
    const tvlDataClean = tvlData.timeseries || []
    const ppsDataClean = ppsData.timeseries || []

    // Get timestamp range for data alignment
    const { earliest, latest } = getEarliestAndLatestTimestamps(
      apy30DayDataClean,
      tvlDataClean,
      ppsDataClean
    )

    // Fill missing data points
    const apy30DayFilled = fillMissingDailyData(
      apy30DayDataClean,
      earliest,
      latest
    )
    const tvlFilled = fillMissingDailyData(tvlDataClean, earliest, latest)
    const ppsFilled = fillMissingDailyData(ppsDataClean, earliest, latest)

    // Calculate APR from PPS data
    const aprFilled = calculateAprFromPps(ppsFilled)

    // Calculate Simple Moving Averages for APR data
    const rawValues = apy30DayFilled.map(p => p.value ?? 0)
    const smoothedValues = calculateSMA(rawValues, 5)

    // Transform APY data with SMA calculations
    const transformedApyData: apyChartData = apy30DayFilled.map(
      (dataPoint, i) => ({
        date: formatUnixTimestamp(dataPoint.time),
        APY: dataPoint.value ? dataPoint.value * 100 : null,
        smoothedAPY:
          smoothedValues[i] !== null ? smoothedValues[i]! * 100 : null,
        APR: aprFilled[i]?.value !== null ? aprFilled[i]!.value! * 100 : null,
      })
    )

    // Transform TVL data
    const transformedTvlData: tvlChartData = tvlFilled.map(dataPoint => ({
      date: formatUnixTimestamp(dataPoint.time),
      TVL: dataPoint.value ?? null,
    }))

    // Transform PPS data
    const transformedPpsData: ppsChartData = ppsFilled.map(dataPoint => ({
      date: formatUnixTimestamp(dataPoint.time),
      PPS: dataPoint.value ?? null,
    }))

    const transformedAprData: aprChartData = aprFilled.map(dataPoint => ({
      date: formatUnixTimestamp(dataPoint.time),
      APR: dataPoint.value !== null ? dataPoint.value * 100 : null,
    }))

    return {
      transformedApyData,
      transformedTvlData,
      transformedPpsData,
      transformedAprData,
    }
  }, [apyData, tvlData, ppsData, isLoading, hasErrors])
}
