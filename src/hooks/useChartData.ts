import { useMemo } from 'react'
import {
  TimeseriesDataPoint,
  apyChartData,
  tvlChartData,
  ppsChartData,
} from '@/types/dataTypes'
import {
  calculateSMA,
  fillMissingDailyData,
  formatUnixTimestamp,
  getEarliestAndLatestTimestamps,
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
      }
    }

    // Extract clean data arrays
    const apyDataClean = apyData.timeseries || []
    const tvlDataClean = tvlData.timeseries || []
    const ppsDataClean = ppsData.timeseries || []

    // Get timestamp range for data alignment
    const { earliest, latest } = getEarliestAndLatestTimestamps(
      apyDataClean,
      tvlDataClean,
      ppsDataClean
    )

    // Fill missing data points
    const apyFilled = fillMissingDailyData(apyDataClean, earliest, latest)
    const tvlFilled = fillMissingDailyData(tvlDataClean, earliest, latest)
    const ppsFilled = fillMissingDailyData(ppsDataClean, earliest, latest)

    // Calculate Simple Moving Averages for APY data
    const rawValues = apyFilled.map(p => p.value ?? 0)
    const sma15Values = calculateSMA(rawValues, 15)
    const sma30Values = calculateSMA(rawValues, 30)

    // Transform APY data with SMA calculations
    const transformedApyData: apyChartData = apyFilled.map((dataPoint, i) => ({
      date: formatUnixTimestamp(dataPoint.time),
      APY: dataPoint.value ? dataPoint.value * 100 : null,
      SMA15: sma15Values[i] !== null ? sma15Values[i]! * 100 : null,
      SMA30: sma30Values[i] !== null ? sma30Values[i]! * 100 : null,
    }))

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

    return {
      transformedApyData,
      transformedTvlData,
      transformedPpsData,
    }
  }, [apyData, tvlData, ppsData, isLoading, hasErrors])
}
