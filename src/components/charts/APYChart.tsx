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
import React, { useMemo } from 'react'

interface APYChartProps {
  chartData: ChartDataPoint[]
  timeframe: string
  hideAxes?: boolean
  hideTooltip?: boolean
}

export const APYChart: React.FC<APYChartProps> = React.memo(
  ({ chartData, timeframe, hideAxes, hideTooltip }) => {
    const filteredData = useMemo(
      () => chartData.slice(-getTimeframeLimit(timeframe)),
      [chartData, timeframe]
    )

    return (
      <ChartContainer
        config={{
          apy: { label: 'APY %', color: hideAxes ? 'black' : 'var(--chart-2)' },
          sma15: {
            label: '15-day SMA',
            color: hideAxes ? 'black' : 'var(--chart-1)',
          },
          sma30: {
            label: '30-day SMA',
            color: hideAxes ? 'black' : 'var(--chart-3)',
          },
        }}
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
              domain={[0, 'auto']}
              tickFormatter={value => `${value}%`}
              label={
                hideAxes
                  ? undefined
                  : {
                      value: 'APY %',
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
                  const label =
                    name === 'APY'
                      ? 'APY'
                      : name === 'SMA15'
                        ? '15-day SMA'
                        : '30-day SMA'
                  return [`${value.toFixed(2)}%`, label]
                }}
              />
            )}
            <Line
              type="monotone"
              dataKey="APY"
              stroke="var(--color-apy)"
              strokeWidth={hideAxes ? 1 : 1.5}
              strokeDasharray="5 5"
              dot={false}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="SMA15"
              stroke="var(--color-sma15)"
              strokeWidth={hideAxes ? 1 : 1.5}
              dot={false}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="SMA30"
              stroke="var(--color-sma30)"
              strokeWidth={hideAxes ? 1 : 1.5}
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

export default APYChart
