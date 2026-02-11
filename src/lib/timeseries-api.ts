// src/lib/timeseries-api.ts

import { getKongTimeseriesUrl } from '@/lib/kong-rest'
import type { TimeseriesDataPoint } from '@/types/dataTypes'

type RestTimeseriesPoint = {
  time: number
  component: string
  value: number | string
}

/**
 * Fetches timeseries data from the REST API and transforms it to match
 * the GraphQL TimeseriesDataPoint shape expected by useChartData
 */
export async function fetchTimeseries(
  segment: string,
  chainId: number,
  address: string,
  components?: string[]
): Promise<TimeseriesDataPoint[]> {
  const url = getKongTimeseriesUrl(segment, chainId, address, components)
  const response = await fetch(url)

  if (!response.ok) {
    if (response.status === 404) {
      return []
    }
    throw new Error(`Failed to fetch timeseries: ${response.status}`)
  }

  const data: RestTimeseriesPoint[] = await response.json()

  // Transform to match TimeseriesDataPoint shape
  return data.map((point) => {
    const numericValue = typeof point.value === 'string' ? Number(point.value) : point.value
    return {
      time: String(point.time),
      value: Number.isNaN(numericValue) ? null : numericValue,
      component: point.component,
      label: segment,
      period: '1 day'
    }
  })
}
