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

type SeriesKey = 'derivedApy' | 'sevenDayApy' | 'thirtyDayApy'

const SERIES_BASE_CONFIG: Record<
  SeriesKey,
  { chartLabel: string; legendLabel: string; color: string }
> = {
  derivedApy: {
    chartLabel: '1-day APY %',
    legendLabel: '1-day APY',
    color: 'var(--chart-4)',
  },
  sevenDayApy: {
    chartLabel: '7-day APY %',
    legendLabel: '7-day APY',
    color: 'var(--chart-3)',
  },
  thirtyDayApy: {
    chartLabel: '30-day APY %',
    legendLabel: '30-day APY',
    color: 'var(--chart-2)',
  },
}

const SERIES_ORDER: SeriesKey[] = ['derivedApy', 'sevenDayApy', 'thirtyDayApy']

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
    })

    const seriesConfig = SERIES_BASE_CONFIG
    const seriesOrder = SERIES_ORDER

    const filteredData = useMemo(
      () => chartData.slice(-getTimeframeLimit(timeframe)),
      [chartData, timeframe]
    )

    const chartConfig = useMemo<ChartConfig>(() => {
      return Object.entries(SERIES_BASE_CONFIG).reduce((acc, [key, meta]) => {
        acc[key] = {
          label: meta.chartLabel,
          color: hideAxes ? 'black' : meta.color,
        }
        return acc
      }, {} as ChartConfig)
    }, [hideAxes])

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
                  formatter={(value: number, name: string) => {
                    const label = getSeriesLabel(name)
                    return [`${value.toFixed(2)}%`, label]
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
                  strokeWidth={hideAxes ? 1 : 1.5}
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
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
        {!hideAxes && (
          <div className="absolute inset-x-0 bottom-[-1rem] flex justify-center">
            <div className="flex flex-wrap items-center justify-center gap-4 rounded-md bg-white/80 px-4 py-2 text-xs">
              {seriesOrder.map(seriesKey => (
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
                      style={{ backgroundColor: seriesConfig[seriesKey].color }}
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
