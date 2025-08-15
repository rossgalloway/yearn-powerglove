import React from 'react'
import { Cell, Label, Pie, PieChart, Tooltip } from 'recharts'

interface AllocationChartData {
  id: number
  name: string
  value: number
  amount: string
}

interface APYContributionChartData {
  id: number
  name: string
  value: number
  formattedValue: string
  apyValue: number
  allocationPercent: number
}

interface StrategyAllocationChartProps {
  allocationData: AllocationChartData[]
  apyContributionData: APYContributionChartData[]
  totalAPYContribution: number
  colors?: string[]
}

// Generate colors for chart segments
const DEFAULT_COLORS = [
  '#000838', // Dark blue
  '#001070',
  '#0018A8',
  '#0020E0', // Lighter blue
]

// Custom tooltip component for the charts
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="bg-white p-2 shadow-lg border border-[#f5f5f5] min-w-[180px]">
        <p className="font-medium text-sm">{data.name}</p>
        {data.amount && (
          <div className="flex justify-between text-xs mt-1">
            <span className="text-[#808080]">Allocation:</span>
            <span>{data.value}%</span>
          </div>
        )}
        {data.amount && (
          <div className="flex justify-between text-xs">
            <span className="text-[#808080]">Amount:</span>
            <span>{data.amount}</span>
          </div>
        )}
        {data.apyValue && (
          <div className="flex justify-between text-xs mt-1">
            <span className="text-[#808080]">APY:</span>
            <span>{data.apyValue}%</span>
          </div>
        )}
        {data.formattedValue && (
          <div className="flex justify-between text-xs">
            <span className="text-[#808080]">Contribution:</span>
            <span>{data.formattedValue}%</span>
          </div>
        )}
      </div>
    )
  }
  return null
}

export const StrategyAllocationChart: React.FC<StrategyAllocationChartProps> =
  React.memo(
    ({
      allocationData,
      apyContributionData,
      totalAPYContribution,
      colors = DEFAULT_COLORS,
    }) => {
      return (
        <div className="lg:ml-6 lg:w-64 mt-6 lg:mt-0 flex lg:flex-col flex-row justify-around pt-3 pb-16">
          {/* Allocation Chart */}
          <div className="lg:w-full w-1/2 pr-2 lg:pr-0">
            <PieChart width={160} height={160}>
              <Pie
                data={allocationData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                startAngle={90}
                endAngle={-270}
              >
                {allocationData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={colors[index % colors.length]}
                  />
                ))}
                <Label
                  content={() => (
                    <text
                      x={80}
                      y={80}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="fill-foreground text-sm font-medium"
                    >
                      allocation %
                    </text>
                  )}
                />
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </div>

          {/* APY Contribution Chart */}
          <div className="lg:w-full w-1/2 pl-2 lg:pl-0 lg:mt-6">
            <PieChart width={160} height={160}>
              <Pie
                data={apyContributionData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                startAngle={90}
                endAngle={-270}
              >
                {apyContributionData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={colors[index % colors.length]}
                  />
                ))}
                <Label
                  content={() => (
                    <text
                      x={80}
                      y={80}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="fill-foreground text-sm font-medium"
                    >
                      {totalAPYContribution.toFixed(2)}%
                    </text>
                  )}
                />
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </div>
        </div>
      )
    }
  )
