// src/lib/timeseries-api.ts
import { TimeseriesDataPoint } from '@/types/dataTypes'

const API_BASE = `${import.meta.env.VITE_PUBLIC_REST_URL}/timeseries`

type RestTimeseriesPoint = {
  time: number
  component: string
  value: number
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
  const url = new URL(`${API_BASE}/${segment}/${chainId}/${address}`)

  if (components?.length) {
    components.forEach(c => url.searchParams.append('components', c))
  }

  const response = await fetch(url.toString())

  if (!response.ok) {
    if (response.status === 404) {
      return []
    }
    throw new Error(`Failed to fetch timeseries: ${response.status}`)
  }

  const data: RestTimeseriesPoint[] = await response.json()

  // Transform to match TimeseriesDataPoint shape
  return data.map(point => ({
    time: String(point.time),
    value: point.value,
    component: point.component,
    label: segment,
    period: '1 day',
  }))
}
