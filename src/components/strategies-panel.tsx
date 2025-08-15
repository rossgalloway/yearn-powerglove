import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import {
  ChevronDown,
  ChevronRight,
  ChevronUp,
  ExternalLink,
} from 'lucide-react'
import { Cell, Label, Pie, PieChart, Tooltip } from 'recharts'
import { cn } from '@/lib/utils'
import {
  CHAIN_ID_TO_NAME,
  CHAIN_ID_TO_BLOCK_EXPLORER,
} from '@/constants/chains'
import { VaultExtended } from '@/types/vaultTypes'
import StrategiesSkeleton from '@/components/StrategiesSkeleton'
import { useStrategiesData } from '@/hooks/useStrategiesData'
import {
  useSortingAndFiltering,
  StrategySortColumn,
} from '@/hooks/useSortingAndFiltering'

export default function StrategiesPanel({
  props,
}: {
  props: {
    vaultChainId: number
    vaultAddress: string
    vaultDetails: VaultExtended
  }
}) {
  const { vaultChainId, vaultAddress, vaultDetails } = props

  // Extract data logic to custom hooks
  const strategiesData = useStrategiesData(
    vaultChainId,
    vaultAddress,
    vaultDetails
  )
  const sortingState = useSortingAndFiltering(strategiesData.strategies)

  // UI state
  const [expandedRow, setExpandedRow] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState<string>('Strategies')
  const [showUnallocated, setShowUnallocated] = useState<boolean>(false)

  const toggleRow = (index: number) => {
    setExpandedRow(expandedRow === index ? null : index)
  }

  // Generate colors for chart segments
  const COLORS = [
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

  const renderSortIcon = (column: StrategySortColumn) => {
    if (sortingState.sortColumn !== column) {
      return <ChevronDown className="w-4 h-4 ml-1 inline-block" />
    }
    return sortingState.sortDirection === 'asc' ? (
      <ChevronUp className="w-4 h-4 ml-1 inline-block text-[#0657f9]" />
    ) : (
      <ChevronDown className="w-4 h-4 ml-1 inline-block text-[#0657f9]" />
    )
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Strategies': {
        if (strategiesData.isLoading) {
          return <StrategiesSkeleton />
        }

        // Add error state handling
        if (strategiesData.error) {
          return (
            <div className="flex justify-center items-center h-full">
              <p className="text-red-500">{strategiesData.error?.message}</p>
            </div>
          )
        }

        // Check if strategies is empty or null
        if (
          !sortingState.sortedStrategies ||
          sortingState.sortedStrategies.length === 0
        ) {
          return (
            <div className="flex justify-center items-center h-full p-20">
              <p className="text-gray-500 text-center">
                This vault contains no strategies, and most likely is a strategy
                for an allocator vault.
              </p>
            </div>
          )
        }

        return (
          <div className="pb-4 lg:flex lg:flex-row flex-col">
            {/* Table Section */}
            <div className="lg:flex-1">
              <div className="border border-[#f5f5f5]">
                {/* Table Header */}
                <div className="flex items-center p-3 text-sm text-[#4f4f4f]">
                  <div className="w-1/2 flex items-center">
                    <span className="ml-8 whitespace-nowrap">Vault</span>
                  </div>
                  <div
                    className="w-1/6 text-right whitespace-nowrap cursor-pointer"
                    onClick={() => sortingState.handleSort('allocationPercent')}
                  >
                    <span>Allocation %</span>
                    {renderSortIcon('allocationPercent')}
                  </div>
                  <div
                    className="w-1/6 text-right whitespace-nowrap cursor-pointer"
                    onClick={() => sortingState.handleSort('allocationAmount')}
                  >
                    <span>Allocation $</span>
                    {renderSortIcon('allocationAmount')}
                  </div>
                  <div
                    className="w-1/6 text-right whitespace-nowrap cursor-pointer"
                    onClick={() => sortingState.handleSort('estimatedAPY')}
                  >
                    <span>Est. APY</span>
                    {renderSortIcon('estimatedAPY')}
                  </div>
                </div>

                {/* Allocated Strategies Table Rows */}
                {sortingState.allocatedStrategies.map(strategy => (
                  <div
                    key={strategy.id}
                    className={cn(
                      'border-t border-[#f5f5f5]',
                      strategy.allocationPercent === 0 && 'opacity-50'
                    )}
                  >
                    {/* Main Row */}
                    <div
                      className={cn(
                        'flex items-center p-3 hover:bg-[#f5f5f5]/50 cursor-pointer',
                        expandedRow === strategy.id && 'bg-[#f5f5f5]/30'
                      )}
                      onClick={() => toggleRow(strategy.id)}
                    >
                      <div className="w-8 flex justify-center">
                        {expandedRow === strategy.id ? (
                          <ChevronDown className="w-4 h-4 text-[#4f4f4f]" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-[#4f4f4f]" />
                        )}
                      </div>
                      <div className="w-[calc(50%-2rem)] flex items-center gap-2">
                        <div className="flex items-center">
                          {strategy.tokenIconUri ? (
                            <img
                              src={strategy.tokenIconUri}
                              alt={strategy.tokenSymbol}
                              className="w-6 h-6"
                            />
                          ) : (
                            <div className="w-6 h-6 flex items-center justify-center bg-gray-300 rounded-full text-white">
                              ?
                            </div>
                          )}
                        </div>
                        <span className="font-medium">{strategy.name}</span>
                      </div>
                      <div className="w-1/6 text-right">
                        {strategy.allocationPercent.toFixed(1)}%
                      </div>
                      <div className="w-1/6 text-right">
                        {strategy.allocationAmount}
                      </div>
                      <div className="w-1/6 text-right">
                        {strategy.estimatedAPY} APY
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {expandedRow === strategy.id && (
                      <div className="bg-[#f5f5f5]/30 px-12 py-4 border-t border-[#f5f5f5]">
                        <div className="flex gap-4 mb-4">
                          {strategy.details.isVault && (
                            <Link
                              to="/vaults/$chainId/$vaultAddress"
                              params={{
                                chainId: strategy.details.chainId.toString(),
                                vaultAddress: strategy.details.vaultAddress,
                              }}
                              className="px-3 py-1 bg-[#f5f5f5] text-sm flex items-center gap-1 hover:bg-[#e5e5e5] transition-colors"
                            >
                              Data
                            </Link>
                          )}
                          {strategy.details.isEndorsed &&
                            strategy.details.isVault && (
                              <a
                                href={`https://yearn.fi/v3/${strategy.details.chainId}/${strategy.details.vaultAddress}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-1 bg-[#f5f5f5] text-sm flex items-center gap-1 hover:bg-[#e5e5e5] transition-colors"
                              >
                                Vault
                                <ExternalLink className="w-3 h-3 text-[#4f4f4f]" />
                              </a>
                            )}
                          <a
                            href={`${CHAIN_ID_TO_BLOCK_EXPLORER[Number(strategy.details.chainId)]}/address/${strategy.details.vaultAddress}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1 bg-[#f5f5f5] text-sm flex items-center gap-1 hover:bg-[#e5e5e5] transition-colors"
                          >
                            {strategy.details.vaultAddress}
                            <ExternalLink className="w-3 h-3 text-[#4f4f4f]" />
                          </a>
                        </div>
                        <div className="space-y-1 text-sm">
                          <div>
                            Chain:{' '}
                            {CHAIN_ID_TO_NAME[Number(strategy.details.chainId)]}
                          </div>
                          <div>
                            Management Fee:{' '}
                            {strategy.details.managementFee
                              ? `${(Number(strategy.details.managementFee) / 100).toFixed(0)}%`
                              : '0%'}
                          </div>
                          <div>
                            Performance Fee:{' '}
                            {strategy.details.performanceFee
                              ? `${(Number(strategy.details.performanceFee) / 100).toFixed(0)}%`
                              : '0%'}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {/* Accordion for Unallocated Strategies */}
                {sortingState.unallocatedStrategies.length > 0 && (
                  <div className="border-t border-[#f5f5f5]">
                    <div
                      className="flex items-center p-3 hover:bg-[#f5f5f5]/50 cursor-pointer"
                      onClick={() => setShowUnallocated(!showUnallocated)}
                    >
                      <div className="w-8 flex justify-center">
                        {showUnallocated ? (
                          <ChevronDown className="w-4 h-4 text-[#4f4f4f]" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-[#4f4f4f]" />
                        )}
                      </div>
                      <div className="flex-1 ml-2 text-sm font-medium">
                        View unallocated strategies
                      </div>
                    </div>
                    {showUnallocated &&
                      sortingState.unallocatedStrategies.map(strategy => (
                        <div
                          key={strategy.id}
                          className={cn(
                            'border-t border-[#f5f5f5]',
                            'opacity-50'
                          )}
                        >
                          {/* Main Row for unallocated strategies */}
                          <div
                            className={cn(
                              'flex items-center p-3 hover:bg-[#f5f5f5]/50 cursor-pointer',
                              expandedRow === strategy.id && 'bg-[#f5f5f5]/30'
                            )}
                            onClick={() => toggleRow(strategy.id)}
                          >
                            <div className="w-8 flex justify-center">
                              {expandedRow === strategy.id ? (
                                <ChevronDown className="w-4 h-4 text-[#4f4f4f]" />
                              ) : (
                                <ChevronRight className="w-4 h-4 text-[#4f4f4f]" />
                              )}
                            </div>
                            <div className="w-[calc(50%-2rem)] flex items-center gap-2">
                              <div className="flex items-center">
                                {strategy.tokenIconUri ? (
                                  <img
                                    src={strategy.tokenIconUri}
                                    alt={strategy.tokenSymbol}
                                    className="w-6 h-6"
                                  />
                                ) : (
                                  <div className="w-6 h-6 flex items-center justify-center bg-gray-300 rounded-full text-white">
                                    ?
                                  </div>
                                )}
                              </div>
                              <span className="font-medium">
                                {strategy.name}
                              </span>
                            </div>
                            <div className="w-1/6 text-right">
                              {strategy.allocationPercent.toFixed(1)}%
                            </div>
                            <div className="w-1/6 text-right">
                              {strategy.allocationAmount}
                            </div>
                            <div className="w-1/6 text-right">
                              {strategy.estimatedAPY} APY
                            </div>
                          </div>

                          {/* Expanded Details for unallocated strategy */}
                          {expandedRow === strategy.id && (
                            <div className="bg-[#f5f5f5]/30 px-12 py-4 border-t border-[#f5f5f5]">
                              <div className="flex gap-4 mb-4">
                                {strategy.details.isVault && (
                                  <Link
                                    to="/vaults/$chainId/$vaultAddress"
                                    params={{
                                      chainId:
                                        strategy.details.chainId.toString(),
                                      vaultAddress:
                                        strategy.details.vaultAddress,
                                    }}
                                    className="px-3 py-1 bg-[#f5f5f5] text-sm flex items-center gap-1 hover:bg-[#e5e5e5] transition-colors"
                                  >
                                    Data
                                  </Link>
                                )}
                                {strategy.details.isEndorsed &&
                                  strategy.details.isVault && (
                                    <a
                                      href={`https://yearn.fi/v3/${strategy.details.chainId}/${strategy.details.vaultAddress}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="px-3 py-1 bg-[#f5f5f5] text-sm flex items-center gap-1 hover:bg-[#e5e5e5] transition-colors"
                                    >
                                      Vault
                                      <ExternalLink className="w-3 h-3 text-[#4f4f4f]" />
                                    </a>
                                  )}
                                <a
                                  href={`${
                                    CHAIN_ID_TO_BLOCK_EXPLORER[
                                      Number(strategy.details.chainId)
                                    ]
                                  }/address/${strategy.details.vaultAddress}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-3 py-1 bg-[#f5f5f5] text-sm flex items-center gap-1 hover:bg-[#e5e5e5] transition-colors"
                                >
                                  {strategy.details.vaultAddress}
                                  <ExternalLink className="w-3 h-3 text-[#4f4f4f]" />
                                </a>
                              </div>
                              <div className="space-y-1 text-sm">
                                <div>
                                  Chain:{' '}
                                  {
                                    CHAIN_ID_TO_NAME[
                                      Number(strategy.details.chainId)
                                    ]
                                  }
                                </div>
                                <div>
                                  Management Fee:{' '}
                                  {strategy.details.managementFee}
                                </div>
                                <div>
                                  Performance Fee:{' '}
                                  {strategy.details.performanceFee}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>

            {/* Charts Section */}
            <div className="lg:ml-6 lg:w-64 mt-6 lg:mt-0 flex lg:flex-col flex-row justify-around pt-3 pb-16">
              {/* Allocation Chart */}
              <div className="lg:w-full w-1/2 pr-2 lg:pr-0">
                <PieChart width={160} height={160}>
                  <Pie
                    data={strategiesData.allocationChartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    startAngle={90}
                    endAngle={-270}
                  >
                    {strategiesData.allocationChartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
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
                    data={strategiesData.apyContributionChartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    startAngle={90}
                    endAngle={-270}
                  >
                    {strategiesData.apyContributionChartData.map(
                      (entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      )
                    )}
                    <Label
                      content={() => (
                        <text
                          x={80}
                          y={80}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          className="fill-foreground text-sm font-medium"
                        >
                          {strategiesData.totalAPYContribution.toFixed(2)}%
                        </text>
                      )}
                    />
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </div>
            </div>
          </div>
        )
      }
      // case 'Info':
      //   return (
      //     <div className="p-8">
      //       <h2 className="text-xl font-semibold mb-4">Info</h2>
      //       <p className="text-[#4f4f4f]">
      //         Additional information and details about the investment strategy.
      //       </p>
      //     </div>
      //   )
      // case 'Risk':
      //   return (
      //     <div className="p-8">
      //       <h2 className="text-xl font-semibold mb-4">Risk</h2>
      //       <p className="text-[#4f4f4f]">
      //         Risk assessment and considerations for this investment strategy.
      //       </p>
      //     </div>
      //   )
      default:
        return null
    }
  }

  return (
    <div className="w-full">
      <div className="w-full mx-auto bg-white border-x border-b border-border">
        {/* Tab Navigation */}
        <div className="flex items-center border-b border-border">
          {/*{['Strategies', 'Info', 'Risk'].map(tab => (*/}
          {['Strategies'].map(tab => (
            <div
              key={tab}
              className={cn(
                'px-6 py-3 cursor-pointer',
                activeTab === tab
                  ? 'text-black font-medium border-b-2 border-[#0657f9]'
                  : 'text-[#808080]'
              )}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </div>
          ))}
        </div>

        {/* Tab Content */}
        {renderTabContent()}
      </div>
    </div>
  )
}
