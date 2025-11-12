const TIMEFRAME_LIMITS: Record<string, number> = {
  '7d': 7,
  '30d': 30,
  '90d': 90,
  '180d': 180,
  '1y': 365,
}

export function getTimeframeLimit(timeframe: string): number {
  return TIMEFRAME_LIMITS[timeframe] ?? 1000
}
