import {
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts'
import { ChartContainer, ChartTooltip } from '@/components/ui/chart'
import { Checkbox } from '@/components/ui/checkbox'
import { ChartDataPoint } from '@/types/dataTypes'
import React, { useMemo, useState } from 'react'

interface APYChartProps {
  chartData: ChartDataPoint[]
  timeframe: string
  hideAxes?: boolean
  hideTooltip?: boolean
}

export const APYChart: React.FC<APYChartProps> = React.memo(
  ({ chartData, timeframe, hideAxes, hideTooltip }) => {
    const [showDerivedApy, setShowDerivedApy] = useState(true)

    const filteredData = useMemo(
      () => chartData.slice(-getTimeframeLimit(timeframe)),
      [chartData, timeframe]
    )

    const seriesLabels: Record<string, string> = {
      thirtyDayApy: '30-day APY',
      derivedApy: '1-day APY',
    }

    return (
      <div className="relative h-full">
        <ChartContainer
          config={{
            thirtyDayApy: {
              label: '30-day APY %',
              color: hideAxes ? 'black' : 'var(--chart-2)',
            },
            derivedApy: {
              label: 'Derived APY %',
              color: hideAxes ? 'black' : 'var(--chart-4)',
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
                    const label =
                      seriesLabels[name] ||
                      seriesLabels[name.toLowerCase()] ||
                      name
                    return [`${value.toFixed(2)}%`, label]
                  }}
                />
              )}
              <Line
                type="monotone"
                dataKey="thirtyDayApy"
                stroke="var(--color-thirtyDayApy)"
                strokeWidth={hideAxes ? 1 : 1.5}
                dot={false}
                isAnimationActive={false}
              />
              {showDerivedApy && (
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
          <div className="absolute bottom-2 right-2 flex items-center gap-2 text-xs">
            <Checkbox
              id="toggle-derived-apy"
              checked={showDerivedApy}
              onCheckedChange={checked => setShowDerivedApy(!!checked)}
            />
            <label htmlFor="toggle-derived-apy">show derived APY lines</label>
          </div>
        )}
      </div>
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
