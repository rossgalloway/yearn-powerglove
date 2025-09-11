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

interface PPSChartProps {
  chartData: ChartDataPoint[]
  timeframe: string
  hideAxes?: boolean
  hideTooltip?: boolean
  dataKey?: 'PPS' | 'APR'
}

export const PPSChart: React.FC<PPSChartProps> = React.memo(
  ({ chartData, timeframe, hideAxes, hideTooltip, dataKey = 'PPS' }) => {
    const filteredData = useMemo(
      () => chartData.slice(-getTimeframeLimit(timeframe)),
      [chartData, timeframe]
    )

    const isApr = dataKey === 'APR'

    return (
      <ChartContainer
        config={
          isApr
            ? {
                apr: {
                  label: 'APR %',
                  color: hideAxes ? 'black' : 'var(--chart-4)',
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
              domain={isApr ? [0, 'auto'] : ['auto', 'auto']}
              tickFormatter={value =>
                isApr ? `${value}%` : Number(value).toFixed(3)
              }
              label={
                hideAxes
                  ? undefined
                  : {
                      value: isApr ? 'APR %' : 'Price Per Share',
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
                  isApr
                    ? [`${value.toFixed(2)}%`, 'APR']
                    : [value.toFixed(3), 'PPS']
                }
              />
            )}

            <Line
              type="monotone"
              dataKey={dataKey}
              stroke={isApr ? 'var(--color-apr)' : 'var(--color-pps)'}
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

