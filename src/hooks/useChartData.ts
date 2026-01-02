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

const averageLast = (
  series: Array<number | null>,
  endIndexInclusive: number,
  windowSize: number
): number | null => {
  const start = Math.max(0, endIndexInclusive - windowSize + 1)
  let sum = 0
  let count = 0
  for (let i = start; i <= endIndexInclusive; i++) {
    const value = series[i]
    if (value === null || value === undefined) continue
    sum += value
    count++
  }
  return count > 0 ? sum / count : null
}

const aprToApyWeekly = (apr: number): number => {
  const periodsPerYear = 52
  return Math.pow(1 + apr / periodsPerYear, periodsPerYear) - 1
}

interface UseChartDataProps {
  apyWeeklyData: TimeseriesQueryResult | undefined
  apyMonthlyData: TimeseriesQueryResult | undefined
  aprOracleAprData?: TimeseriesQueryResult | undefined
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
  aprOracleAprData,
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
    const oracleAprDataClean = aprOracleAprData?.timeseries || []

    // Get timestamp range for data alignment
    const { earliest, latest } = getEarliestAndLatestTimestamps(
      apy7DayDataClean,
      apy30DayDataClean,
      tvlDataClean,
      ppsDataClean,
      oracleAprDataClean
    )

    if (!Number.isFinite(earliest) || !Number.isFinite(latest) || earliest > latest) {
      return {
        transformedAprApyData: [],
        transformedTvlData: [],
        transformedPpsData: [],
      }
    }

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
    const oracleAprFilled = fillMissingDailyData(
      oracleAprDataClean,
      earliest,
      latest
    )

    // Calculate APR from PPS data
    const aprFilled = calculateAprFromPps(ppsFilled)
    const aprAsApyFilled = calculateApyFromApr(aprFilled)

    const oracleAprValues = oracleAprFilled.map(point => point.value ?? null)
    const oracleApr30dAvgValues = oracleAprValues.map((_, index) =>
      averageLast(oracleAprValues, index, 30)
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
        oracleApr:
          oracleAprFilled[index]?.value !== null
            ? oracleAprFilled[index]!.value! * 100
            : null,
        oracleApy30dAvg:
          oracleApr30dAvgValues[index] !== null
            ? aprToApyWeekly(oracleApr30dAvgValues[index]!) * 100
            : null,
      })
    )

    return {
      transformedAprApyData,
      transformedTvlData,
      transformedPpsData,
    }
  }, [
    apyWeeklyData,
    apyMonthlyData,
    aprOracleAprData,
    tvlData,
    ppsData,
    isLoading,
    hasErrors,
  ])
}
