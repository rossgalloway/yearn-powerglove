import React from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FixedHeightChartContainer } from '@/components/chart-container'

const ChartSkeleton: React.FC = () => {
  // Define timeframe options to match the real component
  const timeframes = [
    { label: '30 Days', value: '30d' },
    { label: '90 Days', value: '90d' },
    { label: '1 Year', value: '1y' },
    { label: 'All Time', value: 'all' },
  ]

  return (
    <div className="border-x border-border bg-white">
      <Tabs defaultValue="historical-apy" className="w-full">
        <div className="border-b border-border">
          <div className="px-0 pt-4">
            <TabsList className="grid w-fit grid-cols-3 bg-transparent p-0">
              <TabsTrigger
                value="historical-apy"
                className="rounded-none border-b-2 border-transparent px-4 py-2 data-[state=active]:border-[#0657f9] data-[state=active]:bg-transparent data-[state=active]:shadow-none"
              >
                Historical APY
              </TabsTrigger>
              <TabsTrigger
                value="historical-pps"
                className="rounded-none border-b-2 border-transparent px-4 py-2 data-[state=active]:border-[#0657f9] data-[state=active]:bg-transparent data-[state=active]:shadow-none"
              >
                Historical PPS
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
              {/* Skeleton title and description */}
              <div className="h-4 bg-gray-200 rounded w-64 mb-2 animate-pulse"></div>
              <div className="h-3 bg-gray-200 rounded w-80 animate-pulse"></div>
            </div>
            <div className="flex flex-wrap gap-2">
              {/* Skeleton timeframe buttons */}
              {timeframes.map(tf => (
                <div
                  key={tf.value}
                  className="h-7 w-16 bg-gray-200 rounded animate-pulse"
                ></div>
              ))}
            </div>
          </div>

          <TabsContent value="historical-apy" className="mt-0">
            <FixedHeightChartContainer>
              <SkeletonChart />
            </FixedHeightChartContainer>
          </TabsContent>

          <TabsContent value="historical-pps" className="mt-0">
            <FixedHeightChartContainer>
              <SkeletonChart />
            </FixedHeightChartContainer>
          </TabsContent>

          <TabsContent value="historical-tvl" className="mt-0">
            <FixedHeightChartContainer>
              <SkeletonChart />
            </FixedHeightChartContainer>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}

// Individual skeleton chart component
const SkeletonChart: React.FC = () => {
  return (
    <div className="w-full h-full flex flex-col min-h-[400px]">
      {/* Y-axis labels skeleton */}
      <div className="flex flex-1">
        <div className="w-12 flex flex-col justify-between py-4 pl-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-2 bg-gray-200 rounded animate-pulse"
            ></div>
          ))}
        </div>

        {/* Chart area skeleton */}
        <div className="flex-1 relative min-h-[300px]"></div>
      </div>

      {/* X-axis labels skeleton */}
      <div className="flex justify-around pl-4 mt-2 ml-12 flex-shrink-0">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-2 bg-gray-200 rounded w-8 animate-pulse"
          ></div>
        ))}
      </div>
    </div>
  )
}

export default ChartSkeleton
