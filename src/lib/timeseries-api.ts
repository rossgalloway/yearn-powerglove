// src/lib/timeseries-api.ts

import { fetchKongJson, getKongTimeseriesUrl } from '@/lib/kong-rest'
import type { TimeseriesDataPoint } from '@/types/dataTypes'
import type { KongTimeseriesPoint } from '@/types/kong'

const toNullableNumber = (value: KongTimeseriesPoint['value']): number | null => {
  if (value === null || value === undefined) {
    return null
  }
  const numericValue = typeof value === 'string' ? Number(value) : value
  return Number.isFinite(numericValue) ? numericValue : null
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
  const data = await fetchKongJson<KongTimeseriesPoint[]>(url, { allow404: true })
  if (!data) {
    return []
  }

  // Transform to match TimeseriesDataPoint shape
  return data.map((point) => {
    return {
      time: String(point.time),
      value: toNullableNumber(point.value),
      component: point.component ?? undefined,
      label: segment,
      period: '1 day'
    }
  })
}
