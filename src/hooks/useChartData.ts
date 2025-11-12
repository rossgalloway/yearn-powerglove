import { useMemo } from 'react'
import {
  TimeseriesDataPoint,
  tvlChartData,
  ppsChartData,
  aprApyChartData,
} from '@/types/dataTypes'
import {
  fillMissingDailyData,
  formatUnixTimestamp,
  getEarliestAndLatestTimestamps,
  calculateAprFromPps,
  calculateApyFromApr,
} from '@/lib/utils'

interface TimeseriesQueryResult {
  timeseries: TimeseriesDataPoint[]
}

interface UseChartDataProps {
  apyWeeklyData: TimeseriesQueryResult | undefined
  apyMonthlyData: TimeseriesQueryResult | undefined
  tvlData: TimeseriesQueryResult | undefined
  ppsData: TimeseriesQueryResult | undefined
  isLoading: boolean
  hasErrors: boolean
}

interface UseChartDataReturn {
  transformedAprApyData: aprApyChartData | null
  transformedTvlData: tvlChartData | null
  transformedPpsData: ppsChartData | null
}

/**
 * Processes raw timeseries data into chart-ready format
 * Extracted from the original processChartData function
 */
export function useChartData({
  apyWeeklyData,
  apyMonthlyData,
  tvlData,
  ppsData,
  isLoading,
  hasErrors,
}: UseChartDataProps): UseChartDataReturn {
  return useMemo(() => {
    // Only process data if all queries are complete and successful
    if (
      isLoading ||
      hasErrors ||
      !apyWeeklyData ||
      !apyMonthlyData ||
      !tvlData ||
      !ppsData
    ) {
      return {
        transformedAprApyData: null,
        transformedTvlData: null,
        transformedPpsData: null,
      }
    }

    // Extract clean data arrays
    const apy7DayDataClean = apyWeeklyData.timeseries || []
    const apy30DayDataClean = apyMonthlyData.timeseries || []
    const tvlDataClean = tvlData.timeseries || []
    const ppsDataClean = ppsData.timeseries || []

    // Get timestamp range for data alignment
    const { earliest, latest } = getEarliestAndLatestTimestamps(
      apy7DayDataClean,
      apy30DayDataClean,
      tvlDataClean,
      ppsDataClean
    )

    // Fill missing data points
    const apy7DayFilled = fillMissingDailyData(
      apy7DayDataClean,
      earliest,
      latest
    )
    const apy30DayFilled = fillMissingDailyData(
      apy30DayDataClean,
      earliest,
      latest
    )
    const tvlFilled = fillMissingDailyData(tvlDataClean, earliest, latest)
    const ppsFilled = fillMissingDailyData(ppsDataClean, earliest, latest)

    // Calculate APR from PPS data
    const aprFilled = calculateAprFromPps(ppsFilled)
    const aprAsApyFilled = calculateApyFromApr(aprFilled)

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

    const transformedAprApyData: aprApyChartData = aprFilled.map(
      (aprDataPoint, index) => ({
        date: formatUnixTimestamp(aprDataPoint.time),
        sevenDayApy:
          apy7DayFilled[index]?.value !== null
            ? apy7DayFilled[index]!.value! * 100
            : null,
        thirtyDayApy:
          apy30DayFilled[index]?.value !== null
            ? apy30DayFilled[index]!.value! * 100
            : null,
        derivedApr:
          aprDataPoint.value !== null ? aprDataPoint.value * 100 : null,
        derivedApy:
          aprAsApyFilled[index]?.value !== null
            ? aprAsApyFilled[index]!.value! * 100
            : null,
      })
    )

    return {
      transformedAprApyData,
      transformedTvlData,
      transformedPpsData,
    }
  }, [apyWeeklyData, apyMonthlyData, tvlData, ppsData, isLoading, hasErrors])
}
