import { useState, useMemo } from 'react'
import {
  ChevronDown,
  ChevronRight,
  ChevronUp,
  ExternalLink,
  Shield,
  Share2,
} from 'lucide-react'
import { Cell, Label, Pie, PieChart, Tooltip } from 'recharts'
import { cn } from '@/lib/utils'
import usdc1VaultData from '@/data/usdc1VaultData.json'
import usdc1StrategyData from '@/data/usdc1StrategyData.json'
import allVaultsData from '@/data/allVaultsData.json'
import {
  CHAIN_ID_TO_ICON,
  CHAIN_ID_TO_NAME,
  CHAIN_ID_TO_BLOCK_EXPLORER,
} from '@/constants/chains'
// import smolAssets from '@/data/smolAssets.json'

// Define the type for strategy details
interface StrategyDetails {
  chainId: string
  vaultAddress: string
  managementFee: string
  performanceFee: string
  isVault: boolean
  isEndorsed?: boolean
}

// Define the type for strategy data
export interface Strategy {
  id: number
  name: string
  allocationPercent: number
  allocationAmount: string
  estimatedAPY: string
  details: StrategyDetails
}

interface VaultDebt {
  address: string
  currentDebt: string
  currentDebtUsd: string
  chainId?: number
  name?: string
  erc4626?: boolean
  v3?: boolean
  yearn?: boolean
  apy?: {
    net: number
    InceptionNet: number
    grossApr: number
  }
  fees?: {
    managementFee: number
    performanceFee: number
  }
  assetIcon?: string
}

// Define sort column types
type SortColumn =
  | 'name'
  | 'allocationPercent'
  | 'allocationAmount'
  | 'estimatedAPY'
type SortDirection = 'asc' | 'desc'

// Hydrate strategies data for the Strategies Panel
function hydrateStrategiesPanelData(): Strategy[] {
  // Extract the vaultDebts array from usdc1VaultData.json
  const vaultDebts = usdc1VaultData.data.vault.debts || []
  // Enrich each debt with matching strategy info from usdc1StrategyData.json
  const enrichedDebts = vaultDebts.map((debt: any) => {
    // Match by comparing the 'strategy' field
    const matchingStrategy = usdc1StrategyData.find(
      (item: any) =>
        item.address.toLowerCase() === (debt.strategy || '').toLowerCase()
    )
    let extendedDebt = { ...debt }
    if (matchingStrategy) {
      extendedDebt = {
        ...extendedDebt,
        chainId: matchingStrategy.chainId,
        name: matchingStrategy.name,
        erc4626: matchingStrategy.erc4626,
        v3: matchingStrategy.v3,
        yearn: matchingStrategy.yearn,
      }
    }
    // For entries where erc4626 == true, enrich with apy and fees from allVaultsData.json
    if (extendedDebt.erc4626) {
      const matchingVault = allVaultsData.data.vaults.find(
        (v: any) =>
          v.address.toLowerCase() === (debt.strategy || '').toLowerCase()
      )
      if (matchingVault) {
        extendedDebt = {
          ...extendedDebt,
          apy: matchingVault.apy,
          fees: matchingVault.fees,
        }
      }
    }
    return extendedDebt
  })

  // Sort the enriched debts by currentDebt (convert strings to numbers)
  const sortedDebts = enrichedDebts.sort(
    (a, b) => Number(a.currentDebt) - Number(b.currentDebt)
  )

  // Sum currentDebtUsd values to get totalDebt
  const totalDebt = sortedDebts.reduce(
    (sum: number, debt: any) => sum + Number(debt.currentDebtUsd),
    0
  )

  // Map each debt into the Strategy type
  const strategies = sortedDebts.map((debt: any, index: number): Strategy => {
    const allocationPercent = totalDebt
      ? (Number(debt.currentDebtUsd) / totalDebt) * 100
      : 0

    return {
      id: index,
      name: debt.name || '',
      allocationPercent,
      allocationAmount: String(debt.currentDebtUsd),
      estimatedAPY: debt.apy
        ? `${(Number(debt.apy.net) * 100).toFixed(2)}%`
        : '0%',
      details: {
        chainId: debt.chainId, // using chainId from enriched data
        vaultAddress: debt.strategy || '', // rename vaultAddress to strategyAddress
        managementFee: debt.fees
          ? `${(Number(debt.fees.managementFee) / 100).toFixed(0)}%`
          : '0%',
        performanceFee: debt.fees
          ? `${(Number(debt.fees.performanceFee) / 100).toFixed(0)}%`
          : '0%',
        isVault: !!debt.erc4626,
        isEndorsed: debt.yearn || false,
      },
    }
  })

  return strategies
}

export default function StrategiesPanel() {
  const [expandedRow, setExpandedRow] = useState<number | null>(1)
  const [activeTab, setActiveTab] = useState<string>('Strategies')
  const [sortColumn, setSortColumn] = useState<SortColumn>('allocationPercent')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [showUnallocated, setShowUnallocated] = useState<boolean>(false)

  const toggleRow = (index: number) => {
    setExpandedRow(expandedRow === index ? null : index)
  }

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
  }

  // Use the hydrated strategies data instead of the static array
  const strategies: Strategy[] = hydrateStrategiesPanelData()

  // Sort strategies based on current sort column and direction
  const sortedStrategies = [...strategies].sort((a, b) => {
    if (sortColumn === 'name') {
      return sortDirection === 'asc'
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name)
    } else if (sortColumn === 'allocationPercent') {
      return sortDirection === 'asc'
        ? a.allocationPercent - b.allocationPercent
        : b.allocationPercent - a.allocationPercent
    } else if (sortColumn === 'allocationAmount') {
      // Convert K and M to actual numbers for sorting
      const parseAmount = (amount: string) => {
        if (amount === '0') return 0
        const num = Number.parseFloat(amount.replace(/[^0-9.]/g, ''))
        if (amount.includes('K')) return num * 1000
        if (amount.includes('M')) return num * 1000000
        return num
      }
      return sortDirection === 'asc'
        ? parseAmount(a.allocationAmount) - parseAmount(b.allocationAmount)
        : parseAmount(b.allocationAmount) - parseAmount(a.allocationAmount)
    } else if (sortColumn === 'estimatedAPY') {
      // Remove % and APY for sorting
      const parseAPY = (apy: string) =>
        Number.parseFloat(apy.replace(/[^0-9.]/g, ''))
      return sortDirection === 'asc'
        ? parseAPY(a.estimatedAPY) - parseAPY(b.estimatedAPY)
        : parseAPY(b.estimatedAPY) - parseAPY(a.estimatedAPY)
    }
    return 0
  })

  // Filter out strategies with 0% allocation for the chart
  const chartStrategies = strategies
    .filter(s => s.allocationPercent > 0)
    // Sort by allocation percent descending for the chart
    .sort((a, b) => b.allocationPercent - a.allocationPercent)

  // Helper function to parse APY value
  const parseAPY = (apy: string) => {
    return Number.parseFloat(apy.replace(/[^0-9.]/g, ''))
  }

  // Calculate APY contribution for each strategy
  const apyContributions = useMemo(() => {
    return chartStrategies.map(strategy => {
      const apyValue = parseAPY(strategy.estimatedAPY)
      const contribution = (apyValue * strategy.allocationPercent) / 100
      return {
        id: strategy.id,
        name: strategy.name,
        apyValue,
        allocationPercent: strategy.allocationPercent,
        contribution,
        // Format to 2 decimal places
        formattedContribution: contribution.toFixed(2),
      }
    })
  }, [chartStrategies])

  // Calculate total APY contribution
  const totalAPYContribution = useMemo(() => {
    return apyContributions.reduce((sum, item) => sum + item.contribution, 0)
  }, [apyContributions])

  // Prepare data for the allocation pie chart
  const allocationChartData = chartStrategies.map(strategy => ({
    id: strategy.id,
    name: strategy.name,
    value: strategy.allocationPercent,
    amount: strategy.allocationAmount,
  }))

  // Prepare data for the APY contribution pie chart
  const apyContributionChartData = apyContributions.map(item => ({
    id: item.id,
    name: item.name,
    value: item.contribution,
    formattedValue: item.formattedContribution,
    apyValue: item.apyValue,
    allocationPercent: item.allocationPercent,
  }))

  // Generate colors for chart segments
  const COLORS = [
    '#000838', // Dark blue
    '#001070',
    '#0018A8',
    '#0020E0', // Lighter blue
  ]

  // Custom tooltip component for the charts
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

  const renderSortIcon = (column: SortColumn) => {
    if (sortColumn !== column) {
      return <ChevronDown className="w-4 h-4 ml-1 inline-block" />
    }
    return sortDirection === 'asc' ? (
      <ChevronUp className="w-4 h-4 ml-1 inline-block text-[#0657f9]" />
    ) : (
      <ChevronDown className="w-4 h-4 ml-1 inline-block text-[#0657f9]" />
    )
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Strategies': {
        const allocatedStrategies = sortedStrategies.filter(
          strategy => strategy.allocationPercent > 0
        )
        const unallocatedStrategies = sortedStrategies.filter(
          strategy => strategy.allocationPercent === 0
        )

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
                    onClick={() => handleSort('allocationPercent')}
                  >
                    <span>Allocation %</span>
                    {renderSortIcon('allocationPercent')}
                  </div>
                  <div
                    className="w-1/6 text-right whitespace-nowrap cursor-pointer"
                    onClick={() => handleSort('allocationAmount')}
                  >
                    <span>Allocation $</span>
                    {renderSortIcon('allocationAmount')}
                  </div>
                  <div
                    className="w-1/6 text-right whitespace-nowrap cursor-pointer"
                    onClick={() => handleSort('estimatedAPY')}
                  >
                    <span>Est. APY</span>
                    {renderSortIcon('estimatedAPY')}
                  </div>
                </div>

                {/* Allocated Strategies Table Rows */}
                {allocatedStrategies.map(strategy => (
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
                      <div className="w-[calc(50%-2rem)] flex items-center">
                        <div className="w-6 h-6 rounded-full bg-[#f5f5f5] flex items-center justify-center mr-2 text-yellow-500">
                          <span className="text-xs">$</span>
                        </div>
                        <span className="font-medium">{strategy.name}</span>
                      </div>
                      <div className="w-1/6 text-right">
                        {strategy.allocationPercent.toFixed(1)}%
                      </div>
                      <div className="w-1/6 text-right">
                        {Number(strategy.allocationAmount).toLocaleString(
                          'en-US',
                          {
                            style: 'currency',
                            currency: 'USD',
                          }
                        )}
                      </div>
                      <div className="w-1/6 text-right">
                        {strategy.estimatedAPY} APY
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {expandedRow === strategy.id && (
                      <div className="bg-[#f5f5f5]/30 px-12 py-4 border-t border-[#f5f5f5]">
                        <div className="flex gap-4 mb-4">
                          <div className="px-3 py-1 bg-[#f5f5f5] text-sm flex items-center">
                            {CHAIN_ID_TO_NAME[Number(strategy.details.chainId)]}
                          </div>
                          {strategy.details.isVault && (
                            <a
                              href={`/vault/${strategy.details.vaultAddress}`}
                              target="_blank"
                              className="px-3 py-1 bg-[#f5f5f5] text-sm flex items-center gap-1 hover:bg-[#e5e5e5] transition-colors"
                            >
                              Data
                              <ExternalLink className="w-3 h-3 text-[#4f4f4f]" />
                            </a>
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
                            Management Fee: {strategy.details.managementFee}
                          </div>
                          <div>
                            Performance Fee: {strategy.details.performanceFee}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {/* Accordion for Unallocated Strategies */}
                {unallocatedStrategies.length > 0 && (
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
                      unallocatedStrategies.map(strategy => (
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
                            <div className="w-[calc(50%-2rem)] flex items-center">
                              <div className="w-6 h-6 rounded-full bg-[#f5f5f5] flex items-center justify-center mr-2 text-yellow-500">
                                <span className="text-xs">$</span>
                              </div>
                              <span className="font-medium">
                                {strategy.name}
                              </span>
                            </div>
                            <div className="w-1/6 text-right">
                              {strategy.allocationPercent.toFixed(1)}%
                            </div>
                            <div className="w-1/6 text-right">
                              {Number(strategy.allocationAmount).toLocaleString(
                                'en-US',
                                {
                                  style: 'currency',
                                  currency: 'USD',
                                }
                              )}
                            </div>
                            <div className="w-1/6 text-right">
                              {strategy.estimatedAPY} APY
                            </div>
                          </div>

                          {/* Expanded Details for unallocated strategy */}
                          {expandedRow === strategy.id && (
                            <div className="bg-[#f5f5f5]/30 px-12 py-4 border-t border-[#f5f5f5]">
                              <div className="flex gap-4 mb-4">
                                <div className="px-3 py-1 bg-[#f5f5f5] text-sm flex items-center">
                                  {
                                    CHAIN_ID_TO_NAME[
                                      Number(strategy.details.chainId)
                                    ]
                                  }
                                </div>
                                {strategy.details.isVault && (
                                  <a
                                    href={`/vault/${strategy.details.vaultAddress}`}
                                    target="_blank"
                                    className="px-3 py-1 bg-[#f5f5f5] text-sm flex items-center gap-1 hover:bg-[#e5e5e5] transition-colors"
                                  >
                                    Data
                                    <ExternalLink className="w-3 h-3 text-[#4f4f4f]" />
                                  </a>
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
            <div className="lg:ml-6 lg:w-64 mt-6 lg:mt-0 flex lg:flex-col flex-row justify-around">
              {/* Allocation Chart */}
              <div className="lg:w-full w-1/2 pr-2 lg:pr-0">
                <PieChart width={160} height={160}>
                  <Pie
                    data={allocationChartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    startAngle={90}
                    endAngle={-270}
                  >
                    {allocationChartData.map((entry, index) => (
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
                    data={apyContributionChartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    startAngle={90}
                    endAngle={-270}
                  >
                    {apyContributionChartData.map((entry, index) => (
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
                          {totalAPYContribution.toFixed(2)}%
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
      case 'Info':
        return (
          <div className="p-8">
            <h2 className="text-xl font-semibold mb-4">Info</h2>
            <p className="text-[#4f4f4f]">
              Additional information and details about the investment strategy.
            </p>
          </div>
        )
      case 'Risk':
        return (
          <div className="p-8">
            <h2 className="text-xl font-semibold mb-4">Risk</h2>
            <p className="text-[#4f4f4f]">
              Risk assessment and considerations for this investment strategy.
            </p>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="w-full">
      <div className="w-full mx-auto bg-white border-x border-b-0 border-border">
        {/* Tab Navigation */}
        <div className="flex items-center border-b border-border">
          {['Strategies', 'Info', 'Risk'].map(tab => (
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
          <div className="ml-auto flex gap-4 pr-4">
            <button className="text-[#4f4f4f]">
              <Shield className="w-5 h-5" />
            </button>
            <button className="text-[#4f4f4f]">
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {renderTabContent()}
      </div>
    </div>
  )
}
