import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import APYChart from '@/components/charts/APYChart'
import TVLChart from '@/components/charts/TVLChart'
import PPSChart from '@/components/charts/PPSChart'
import { FixedHeightChartContainer } from '@/components/charts/chart-container'
import { ChartErrorBoundary } from '@/components/utils/ErrorBoundary'
import { tvlChartData, ppsChartData, aprApyChartData } from '@/types/dataTypes'
import ChartSkeleton from '@/components/charts/ChartSkeleton'
import ChartsLoader from '@/components/charts/ChartsLoader'

type ChartData = {
  aprApyData: aprApyChartData | null
  tvlData: tvlChartData | null
  ppsData: ppsChartData | null
  isLoading?: boolean
  hasErrors?: boolean
}

export function ChartsPanel(data: ChartData) {
  const [activeTab, setActiveTab] = useState('historical-apy')
  const {
    aprApyData,
    tvlData,
    ppsData,
    isLoading = false,
    hasErrors = false,
  } = data

  // Define timeframe options with values that match the chart component expectations
  const timeframes = [
    { label: '30 Days', value: '30d' },
    { label: '90 Days', value: '90d' },
    { label: '1 Year', value: '1y' },
    { label: 'All Time', value: 'all' },
  ]

  const [timeframe, setTimeframe] = useState(timeframes[3]) // Default to All Time

  // Show error state if there are errors
  if (hasErrors) {
    return (
      <div className="border-x border-border bg-white">
        <div className="h-96 flex items-center justify-center">
          <div className="text-red-500">Error loading chart data</div>
        </div>
      </div>
    )
  }

  // Show skeleton with loader overlay when loading or no data yet
  if (isLoading || !aprApyData || !tvlData || !ppsData) {
    return (
      <div className="relative">
        <ChartSkeleton />
        <ChartsLoader
          loadingState={isLoading ? 'loading charts' : 'preparing charts'}
        />
      </div>
    )
  }

  // Define chart titles and descriptions based on active tab
  const chartInfo = {
    'historical-apy': {
      title: 'Vault Performance (TVL shown ghosted)',
      description: `1-Day and 30-Day APYs over ${timeframe.label}.`,
    },
    'historical-pps': {
      title: 'Vault Share Growth (1-Day APY shown ghosted)',
      description: `Price Per Share values over ${timeframe.label}.`,
    },
    'historical-tvl': {
      title: 'Total Value Deposited (APY shown ghosted)',
      description: `Value Deposited in Vault over ${timeframe.label}.`,
    },
  }

  return (
    <div className="border-x border-border bg-white">
      <Tabs
        defaultValue="historical-apy"
        className="w-full"
        onValueChange={value => setActiveTab(value)}
      >
        <div className="border-b border-border">
          <div className="px-0 pt-4">
            <TabsList className="grid w-fit grid-cols-3 bg-transparent p-0">
              <TabsTrigger
                value="historical-apy"
                className="rounded-none border-b-2 border-transparent px-4 py-2 data-[state=active]:border-[#0657f9] data-[state=active]:bg-transparent data-[state=active]:shadow-none"
              >
                Historical Performance
              </TabsTrigger>
              <TabsTrigger
                value="historical-pps"
                className="rounded-none border-b-2 border-transparent px-4 py-2 data-[state=active]:border-[#0657f9] data-[state=active]:bg-transparent data-[state=active]:shadow-none"
              >
                Historical Share Growth
              </TabsTrigger>
              <TabsTrigger
                value="historical-tvl"
                className="rounded-none border-b-2 border-transparent px-4 py-2 data-[state=active]:border-[#0657f9] data-[state=active]:bg-transparent data-[state=active]:shadow-none"
              >
                Historical TVL
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <div className="text-sm font-medium">
                {chartInfo[activeTab as keyof typeof chartInfo].title}
              </div>
              <div className="text-xs text-gray-500">
                {chartInfo[activeTab as keyof typeof chartInfo].description}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {timeframes.map(tf => (
                <button
                  key={tf.value}
                  onClick={() => setTimeframe(tf)}
                  className={`px-3 py-1 text-sm ${
                    timeframe.value === tf.value
                      ? 'bg-gray-200 text-gray-800'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  {tf.label}
                </button>
              ))}
            </div>
          </div>

          <TabsContent value="historical-apy" className="mt-0">
            <FixedHeightChartContainer>
              <ChartErrorBoundary>
                <APYChart chartData={aprApyData} timeframe={timeframe.value} />
              </ChartErrorBoundary>
              <div className="absolute inset-0 opacity-10 pointer-events-none">
                {/* Ghosted TVL chart */}
                <ChartErrorBoundary>
                  <TVLChart
                    chartData={tvlData}
                    timeframe={timeframe.value}
                    hideAxes={true}
                    hideTooltip={true}
                  />
                </ChartErrorBoundary>
              </div>
            </FixedHeightChartContainer>
          </TabsContent>

          <TabsContent value="historical-pps" className="mt-0">
            <FixedHeightChartContainer>
              <ChartErrorBoundary>
                <PPSChart chartData={ppsData} timeframe={timeframe.value} />
              </ChartErrorBoundary>
              <div className="absolute inset-0 opacity-10 pointer-events-none">
                {/* Ghosted APR chart */}
                <ChartErrorBoundary>
                  <PPSChart
                    chartData={aprApyData}
                    timeframe={timeframe.value}
                    hideAxes={true}
                    hideTooltip={true}
                    dataKey="derivedApr"
                  />
                </ChartErrorBoundary>
              </div>
            </FixedHeightChartContainer>
          </TabsContent>

          <TabsContent value="historical-tvl" className="mt-0">
            <FixedHeightChartContainer>
              <ChartErrorBoundary>
                <TVLChart chartData={tvlData} timeframe={timeframe.value} />
              </ChartErrorBoundary>
              <div className="absolute inset-0 opacity-20 pointer-events-none">
                {/* Ghosted APY chart */}
                <ChartErrorBoundary>
                  <APYChart
                    chartData={aprApyData}
                    timeframe={timeframe.value}
                    hideAxes={true}
                    hideTooltip={true}
                  />
                </ChartErrorBoundary>
              </div>
            </FixedHeightChartContainer>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
