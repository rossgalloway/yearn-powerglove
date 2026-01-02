import {
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  type ChartConfig,
} from '@/components/ui/chart'
import { Checkbox } from '@/components/ui/checkbox'
import { ChartDataPoint } from '@/types/dataTypes'
import React, { useMemo, useState } from 'react'
import { getTimeframeLimit } from '@/components/charts/chart-utils'

type SeriesKey =
  | 'derivedApy'
  | 'sevenDayApy'
  | 'thirtyDayApy'
  | 'oracleApr'
  | 'oracleApy30dAvg'

const TOOLTIP_ORDER: Record<SeriesKey, number> = {
  derivedApy: 0,
  sevenDayApy: 1,
  thirtyDayApy: 2,
  oracleApr: 3,
  oracleApy30dAvg: 4,
}

const isDashedSeries = (seriesKey: SeriesKey) =>
  seriesKey === 'thirtyDayApy' || seriesKey === 'oracleApy30dAvg'

const SERIES_BASE_CONFIG: Record<
  SeriesKey,
  { chartLabel: string; legendLabel: string; color: string }
> = {
  derivedApy: {
    chartLabel: '1-day APY %',
    legendLabel: '1-day APY',
    color: 'var(--chart-3)',
  },
  sevenDayApy: {
    chartLabel: '7-day APY %',
    legendLabel: '7-day APY',
    color: 'var(--chart-2)',
  },
  thirtyDayApy: {
    chartLabel: '30-day APY %',
    legendLabel: '30-day APY',
    color: 'var(--chart-1)',
  },
  oracleApr: {
    chartLabel: 'Oracle APR %',
    legendLabel: 'Oracle APR',
    color: 'var(--chart-4)',
  },
  oracleApy30dAvg: {
    chartLabel: 'Oracle APY (30d avg) %',
    legendLabel: 'Oracle APY (30d avg)',
    color: 'var(--chart-4)',
  },
}

const SERIES_ORDER: SeriesKey[] = [
  'derivedApy',
  'sevenDayApy',
  'thirtyDayApy',
  'oracleApr',
  'oracleApy30dAvg',
]

interface APYChartProps {
  chartData: ChartDataPoint[]
  timeframe: string
  hideAxes?: boolean
  hideTooltip?: boolean
  defaultVisibleSeries?: Partial<Record<SeriesKey, boolean>>
}

export const APYChart: React.FC<APYChartProps> = React.memo(
  ({ chartData, timeframe, hideAxes, hideTooltip, defaultVisibleSeries }) => {
    const [visibleSeries, setVisibleSeries] = useState<
      Record<SeriesKey, boolean>
    >({
      derivedApy: defaultVisibleSeries?.derivedApy ?? true,
      sevenDayApy: defaultVisibleSeries?.sevenDayApy ?? true,
      thirtyDayApy: defaultVisibleSeries?.thirtyDayApy ?? true,
      oracleApr: defaultVisibleSeries?.oracleApr ?? false,
      oracleApy30dAvg: defaultVisibleSeries?.oracleApy30dAvg ?? false,
    })

    const seriesConfig = SERIES_BASE_CONFIG
    const seriesOrder = SERIES_ORDER

    const filteredData = useMemo(
      () => chartData.slice(-getTimeframeLimit(timeframe)),
      [chartData, timeframe]
    )

    const hasOracleApr = useMemo(() => {
      return filteredData.some(point => typeof point.oracleApr === 'number')
    }, [filteredData])

    const hasOracleApy30dAvg = useMemo(() => {
      return filteredData.some(
        point => typeof point.oracleApy30dAvg === 'number'
      )
    }, [filteredData])

    const chartConfig = useMemo<ChartConfig>(() => {
      return Object.entries(SERIES_BASE_CONFIG).reduce((acc, [key, meta]) => {
        if (key === 'oracleApr' && !hasOracleApr) {
          return acc
        }
        if (key === 'oracleApy30dAvg' && !hasOracleApy30dAvg) {
          return acc
        }
        acc[key] = {
          label: meta.chartLabel,
          color: hideAxes ? 'black' : meta.color,
        }
        return acc
      }, {} as ChartConfig)
    }, [hideAxes, hasOracleApr, hasOracleApy30dAvg])

    const getSeriesLabel = (name: string) =>
      seriesConfig[name as SeriesKey]?.legendLabel || name

    return (
      <div className="relative h-full">
        <ChartContainer config={chartConfig} style={{ height: 'inherit' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={filteredData}
              margin={{
                top: 20,
                right: 30,
                left: 10,
                bottom: 20,
              }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tick={
                  hideAxes
                    ? false
                    : {
                        fill: 'hsl(var(--muted-foreground))',
                      }
                }
                axisLine={
                  hideAxes ? false : { stroke: 'hsl(var(--muted-foreground))' }
                }
                tickLine={
                  hideAxes ? false : { stroke: 'hsl(var(--muted-foreground))' }
                }
              />
              <YAxis
                domain={[0, 'auto']}
                tickFormatter={value => `${value}%`}
                label={
                  hideAxes
                    ? undefined
                    : {
                        value: 'Annualized %',
                        angle: -90,
                        position: 'insideLeft',
                        offset: 10,
                        style: {
                          textAnchor: 'middle',
                          fill: hideAxes
                            ? 'transparent'
                            : 'hsl(var(--muted-foreground))',
                        },
                      }
                }
                tick={
                  hideAxes
                    ? false
                    : {
                        fill: 'hsl(var(--muted-foreground))',
                      }
                }
                axisLine={
                  hideAxes ? false : { stroke: 'hsl(var(--muted-foreground))' }
                }
                tickLine={
                  hideAxes ? false : { stroke: 'hsl(var(--muted-foreground))' }
                }
              />
              {!hideTooltip && (
                <ChartTooltip
                  content={({ active, label, payload }) => {
                    if (!active || !payload?.length) return null

                    const sorted = [...payload].sort((a, b) => {
                      const aKey = a.dataKey as SeriesKey
                      const bKey = b.dataKey as SeriesKey
                      return (
                        (TOOLTIP_ORDER[aKey] ?? 999) -
                        (TOOLTIP_ORDER[bKey] ?? 999)
                      )
                    })

                    return (
                      <div className="grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl">
                        <div className="font-medium">{label}</div>
                        <div className="grid gap-1.5">
                          {sorted.map(item => {
                            const seriesKey = item.dataKey as SeriesKey
                            const raw = item.value
                            const value =
                              typeof raw === 'number'
                                ? `${raw.toFixed(2)}%`
                                : raw

                            const color =
                              (item.color as string | undefined) ||
                              (item.stroke as string | undefined) ||
                              'currentColor'

                            return (
                              <div
                                key={`${item.dataKey}`}
                                className="flex items-center justify-between gap-3"
                              >
                                <div className="flex items-center gap-2">
                                  <svg
                                    aria-hidden="true"
                                    width={18}
                                    height={6}
                                    viewBox="0 0 18 6"
                                    className="shrink-0"
                                  >
                                    <line
                                      x1="0"
                                      y1="3"
                                      x2="18"
                                      y2="3"
                                      stroke={color}
                                      strokeWidth="2"
                                      strokeDasharray={
                                        isDashedSeries(seriesKey) ? '6 6' : undefined
                                      }
                                      strokeLinecap="butt"
                                    />
                                  </svg>
                                  <span>{getSeriesLabel(String(item.dataKey))}</span>
                                </div>
                                <span className="tabular-nums">{value}</span>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )
                  }}
                />
              )}
              {visibleSeries.sevenDayApy && (
                <Line
                  type="monotone"
                  dataKey="sevenDayApy"
                  stroke="var(--color-sevenDayApy)"
                  strokeWidth={hideAxes ? 1 : 1.5}
                  dot={false}
                  isAnimationActive={false}
                />
              )}
              {visibleSeries.thirtyDayApy && (
                <Line
                  type="monotone"
                  dataKey="thirtyDayApy"
                  stroke="var(--color-thirtyDayApy)"
                  strokeDasharray="12 4"
                  strokeWidth={hideAxes ? 1 : 2.5}
                  dot={false}
                  isAnimationActive={false}
                />
              )}
              {visibleSeries.derivedApy && (
                <Line
                  type="monotone"
                  dataKey="derivedApy"
                  stroke="var(--color-derivedApy)"
                  strokeWidth={hideAxes ? 1 : 1}
                  dot={false}
                  isAnimationActive={false}
                />
              )}
              {hasOracleApr && visibleSeries.oracleApr && (
                <Line
                  type="monotone"
                  dataKey="oracleApr"
                  stroke="var(--color-oracleApr)"
                  strokeWidth={hideAxes ? 1 : 2}
                  dot={false}
                  isAnimationActive={false}
                />
              )}
              {hasOracleApy30dAvg && visibleSeries.oracleApy30dAvg && (
                <Line
                  type="monotone"
                  dataKey="oracleApy30dAvg"
                  stroke="var(--color-oracleApy30dAvg)"
                  strokeDasharray="12 4"
                  strokeWidth={hideAxes ? 1 : 2.75}
                  dot={false}
                  isAnimationActive={false}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
        {!hideAxes && (
          <div className="absolute inset-x-0 bottom-[-1rem] flex justify-center">
            <div className="flex flex-wrap items-center justify-center gap-4 rounded-md bg-white/80 px-4 py-2 text-xs">
              {seriesOrder
                .filter(seriesKey => {
                  if (seriesKey === 'oracleApr') return hasOracleApr
                  if (seriesKey === 'oracleApy30dAvg') return hasOracleApy30dAvg
                  return true
                })
                .map(seriesKey => (
                  <div key={seriesKey} className="flex items-center gap-2">
                    <Checkbox
                      id={`toggle-${seriesKey}`}
                      checked={visibleSeries[seriesKey]}
                      className="h-4 w-4 rounded-[4px] border border-gray-400 bg-white text-gray-700 data-[state=checked]:border-gray-700 data-[state=checked]:bg-white data-[state=checked]:text-gray-800"
                      onCheckedChange={checked =>
                        setVisibleSeries(prev => ({
                          ...prev,
                          [seriesKey]: !!checked,
                        }))
                      }
                    />
                    <label
                      htmlFor={`toggle-${seriesKey}`}
                      className="flex items-center gap-1"
                    >
                      <span
                        aria-hidden="true"
                        className="inline-block h-3.5 w-3.5 rounded-sm border border-gray-200"
                        style={{
                          backgroundColor: seriesConfig[seriesKey].color,
                        }}
                      />
                      {seriesConfig[seriesKey].legendLabel}
                    </label>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    )
  }
)

export default APYChart
