import React, { useMemo } from 'react'
import {
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts'
import { ChartContainer, ChartTooltip } from '@/components/ui/chart'
import { ChartDataPoint } from '@/types/dataTypes'

type PercentSeriesKey = 'derivedApr'

interface PPSChartProps {
  chartData: ChartDataPoint[]
  timeframe: string
  hideAxes?: boolean
  hideTooltip?: boolean
  dataKey?: 'PPS' | PercentSeriesKey
}

export const PPSChart: React.FC<PPSChartProps> = React.memo(
  ({ chartData, timeframe, hideAxes, hideTooltip, dataKey = 'PPS' }) => {
    const filteredData = useMemo(
      () => chartData.slice(-getTimeframeLimit(timeframe)),
      [chartData, timeframe]
    )

    const isPercentSeries = dataKey !== 'PPS'
    const percentSeriesMeta: Record<PercentSeriesKey, { label: string; color: string }> = {
      derivedApr: {
        label: 'Derived APR %',
        color: 'var(--chart-4)',
      },
    }
    const activePercentMeta =
      dataKey !== 'PPS'
        ? percentSeriesMeta[dataKey as PercentSeriesKey]
        : undefined

    return (
      <ChartContainer
        config={
          isPercentSeries && activePercentMeta
            ? {
                [dataKey]: {
                  label: activePercentMeta.label,
                  color: hideAxes ? 'black' : activePercentMeta.color,
                },
              }
            : {
                pps: {
                  label: 'Price Per Share',
                  color: hideAxes ? 'black' : 'var(--chart-1)',
                },
              }
        }
        style={{ height: 'inherit' }}
      >
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
              domain={isPercentSeries ? [0, 'auto'] : ['auto', 'auto']}
              tickFormatter={value =>
                isPercentSeries ? `${value}%` : Number(value).toFixed(3)
              }
              label={
                hideAxes
                  ? undefined
                  : {
                      value:
                        isPercentSeries && activePercentMeta
                          ? activePercentMeta.label
                          : 'Price Per Share',
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
                formatter={(value: number) =>
                  isPercentSeries && activePercentMeta
                    ? [`${value.toFixed(2)}%`, activePercentMeta.label]
                    : [value.toFixed(3), 'PPS']
                }
              />
            )}

            <Line
              type="monotone"
              dataKey={dataKey}
              stroke={
                isPercentSeries ? `var(--color-${dataKey})` : 'var(--color-pps)'
              }
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartContainer>
    )
  }
)

function getTimeframeLimit(timeframe: string): number {
  switch (timeframe) {
    case '7d':
      return 7
    case '30d':
      return 30
    case '90d':
      return 90
    case '180d':
      return 180
    case '1y':
      return 365
    case 'all':
    default:
      return 1000
  }
}

export default PPSChart
