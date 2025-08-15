import { useState, useMemo } from 'react'
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
import { useQuery } from '@apollo/client'
import {
  GET_STRATEGY_DETAILS,
  StrategyDetailsQuery,
} from '@/graphql/queries/strategies'
import { EnrichedVaultDebt, VaultDebt, VaultExtended } from '@/types/vaultTypes'
import { Strategy } from '@/types/dataTypes'
import { useQueryStrategies } from '@/contexts/useQueryStrategies'
import { useTokenAssetsContext } from '@/contexts/useTokenAssets'

// Define sort column types
type SortColumn =
  | 'name'
  | 'allocationPercent'
  | 'allocationAmount'
  | 'estimatedAPY'
type SortDirection = 'asc' | 'desc'

export default function StrategiesPanel({
  props,
}: {
  props: {
    vaultChainId: number
    vaultAddress: string
    vaultDetails: VaultExtended
  }
}) {
  const { assets: tokenAssets } = useTokenAssetsContext()
  if (import.meta.env.MODE === 'development') {
    console.log('props:', props)
  }
  const { vaultChainId } = props
  const selectedVaultDetails = props.vaultDetails
  const vaultStrategyAddresses = props.vaultDetails.strategies
  const allStrategies = useQueryStrategies()

  // Fetches data about the component strategies of the current vault
  // if the strategies are vaults (v3) then this gets me chainId, address, name, erc4626, v3, yearn
  // all strategies that the current vault uses.
  // if not vaults then it returns undefined
  const shouldFetch = vaultStrategyAddresses != null
  const {
    data: strategyData,
    loading,
    error,
  } = useQuery<{ vaults: StrategyDetailsQuery[] }>(GET_STRATEGY_DETAILS, {
    variables: { addresses: vaultStrategyAddresses },
    skip: !shouldFetch,
  })
  const v3StrategyData = shouldFetch ? strategyData?.vaults : undefined
  console.log('strategyData:', v3StrategyData)

  // Get the array of strategy debts from the passed in vault data object (V2 and V3)
  const selectedVaultDebts: VaultDebt[] = Array.isArray(
    props.vaultDetails?.debts
  )
    ? (props.vaultDetails.debts as VaultDebt[])
    : [] // Ensure debts is treated as an array
  console.log('selectedVaultDebts:', selectedVaultDebts)

  const vaultStrategyData = selectedVaultDebts.map(debt => {
    // Map the debts object to the VaultDebt type structure
    const mappedDebt: EnrichedVaultDebt = {
      strategy: debt.strategy,
      v3Debt: {
        currentDebt: debt.currentDebt,
        currentDebtUsd: debt.currentDebtUsd,
        maxDebt: debt.maxDebt,
        maxDebtUsd: debt.maxDebtUsd,
        targetDebtRatio: debt.targetDebtRatio,
        maxDebtRatio: debt.maxDebtRatio,
      },
      v2Debt: {
        debtRatio: debt.debtRatio,
        totalDebt: debt.totalDebt,
        totalDebtUsd: debt.totalDebtUsd,
        totalGain: debt.totalGain,
        totalGainUsd: debt.totalGainUsd,
        totalLoss: debt.totalLoss,
        totalLossUsd: debt.totalLossUsd,
      },
      // Optional fields populated based on matching strategy data
      address: debt.strategy, // Rename `strategy` to `address`
      name: selectedVaultDetails.v3
        ? v3StrategyData?.find(strategy => strategy.address === debt.strategy)
            ?.name || ''
        : allStrategies.strategies.find(
            strategy => strategy.address === debt.strategy
          )?.name || '',
      erc4626: selectedVaultDetails.v3
        ? v3StrategyData?.find(strategy => strategy.address === debt.strategy)
            ?.erc4626 || false
        : allStrategies.strategies.find(
            strategy => strategy.address === debt.strategy
          )?.erc4626 || false,
      yearn: selectedVaultDetails.v3
        ? v3StrategyData?.find(strategy => strategy.address === debt.strategy)
            ?.yearn || false
        : allStrategies.strategies.find(
            strategy => strategy.address === debt.strategy
          )?.yearn || false,
      v3: selectedVaultDetails.v3 || false,
      managementFee: selectedVaultDetails.v3
        ? v3StrategyData?.find(strategy => strategy.address === debt.strategy)
            ?.fees?.managementFee || 0
        : 0, // Default to 0 for non-v3 strategies
      performanceFee: selectedVaultDetails.v3
        ? v3StrategyData?.find(strategy => strategy.address === debt.strategy)
            ?.fees?.performanceFee || 0
        : allStrategies.strategies.find(
            strategy => strategy.address === debt.strategy
          )?.performanceFee || 0,
      grossApr: selectedVaultDetails.v3
        ? v3StrategyData?.find(strategy => strategy.address === debt.strategy)
            ?.apy?.grossApr
        : allStrategies.strategies.find(
            strategy => strategy.address === debt.strategy
          )?.lastReportDetail?.apr.gross,
      netApy: selectedVaultDetails.v3
        ? v3StrategyData?.find(strategy => strategy.address === debt.strategy)
            ?.apy?.net
        : allStrategies.strategies.find(
            strategy => strategy.address === debt.strategy
          )?.lastReportDetail?.apr.net,
      inceptionNetApy: selectedVaultDetails.v3
        ? (v3StrategyData?.find(strategy => strategy.address === debt.strategy)
            ?.apy?.inceptionNet ?? undefined) // Convert null to undefined
        : undefined, // Default to undefined for non-v3 strategies
      assetSymbol: selectedVaultDetails.v3
        ? v3StrategyData?.find(strategy => strategy.address === debt.strategy)
            ?.asset?.symbol
        : selectedVaultDetails?.asset.symbol,
    }

    return mappedDebt // Return the mapped debt object
  })

  // Sort the enriched debts based on the vault type (V3 or V2)
  const sortedVaultDebts = vaultStrategyData.sort((a, b) => {
    if (selectedVaultDetails.v3) {
      // Sort by v3Debt.currentDebt for V3 vaults
      return Number(b.v3Debt.currentDebt) - Number(a.v3Debt.currentDebt)
    } else {
      // Sort by v2Debt.debtRatio for V2 vaults
      return Number(b.v2Debt.debtRatio) - Number(a.v2Debt.debtRatio)
    }
  })
  console.log('sortedDebts:', sortedVaultDebts)

  // Calculate total vault debt based on the vault type (V3 or V2)
  const totalVaultDebt = sortedVaultDebts.reduce(
    (sum: number, debt: EnrichedVaultDebt) => {
      if (selectedVaultDetails.v3) {
        // Use v3Debt.currentDebtUsd for V3 vaults
        return sum + Number(debt.v3Debt.currentDebtUsd)
      } else {
        // Use v2Debt.totalDebtUsd for V2 vaults
        return sum + Number(debt.v2Debt.totalDebtUsd)
      }
    },
    0
  )
  console.log('totalDebt:', totalVaultDebt)

  // Map enrichedVaultDebts to Strategy objects
  const strategies: Strategy[] = vaultStrategyData.map((debt, index) => ({
    id: index, // Use the index as the ID (or replace with a unique identifier if available)
    name: debt.name || 'Unknown Strategy', // Use the name from enrichedVaultDebts or a default value
    allocationPercent: totalVaultDebt
      ? selectedVaultDetails.v3
        ? (Number(debt.v3Debt.currentDebtUsd) / totalVaultDebt) * 100 // Use v3Debt.currentDebtUsd for V3 vaults
        : (Number(debt.v2Debt.totalDebtUsd) / totalVaultDebt) * 100 // Use v2Debt.totalDebtUsd for V2 vaults
      : 0,
    allocationAmount: selectedVaultDetails.v3
      ? debt.v3Debt.currentDebtUsd
        ? debt.v3Debt.currentDebtUsd.toLocaleString('en-US', {
            style: 'currency',
            currency: 'USD',
          })
        : '$0.00' // Default for V3 vaults
      : debt.v2Debt.totalDebtUsd
        ? debt.v2Debt.totalDebtUsd.toLocaleString('en-US', {
            style: 'currency',
            currency: 'USD',
          })
        : '$0.00', // Default for V2 vaults
    estimatedAPY: debt.netApy
      ? `${(Number(debt.netApy) * 100).toFixed(2)}%`
      : '0.00%', // Format maxDebtRatio as a percentage string
    tokenSymbol: debt.assetSymbol || '', // Use the asset symbol from enrichedVaultDebts or a default value
    tokenIconUri:
      tokenAssets.find(token => token.symbol === debt.assetSymbol)?.logoURI ||
      '',
    details: {
      chainId: vaultChainId, // Use the chainId from props
      vaultAddress: debt.address ? debt.address : '', // Use the vaultAddress from props
      managementFee: debt.managementFee || 0, // Use managementFee or a default value
      performanceFee: debt.performanceFee || 0, // Use performanceFee or a default value
      isVault: debt.v3 || false, // Assume it's a vault (adjust if needed)
      isEndorsed: debt.yearn || false, // Use the yearn field to determine endorsement
    },
  }))

  console.log('strategies:', strategies)

  const [expandedRow, setExpandedRow] = useState<number | null>(null)
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
        if (loading) {
          return (
            <div className="flex justify-center items-center h-full">
              <p>Loading...</p>
            </div>
          )
        }

        // Add error state handling
        if (error) {
          return (
            <div className="flex justify-center items-center h-full">
              <p className="text-red-500">{error?.message}</p>
            </div>
          )
        }

        // Check if sortedStrategies is empty or null
        if (!sortedStrategies || sortedStrategies.length === 0) {
          return (
            <div className="flex justify-center items-center h-full p-20">
              <p className="text-gray-500 text-center">
                This vault contains no strategies, and most likely is a strategy
                for an allocator vault.
              </p>
            </div>
          )
        }

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
                          <div className="px-3 py-1 bg-[#f5f5f5] text-sm flex items-center">
                            {CHAIN_ID_TO_NAME[Number(strategy.details.chainId)]}
                          </div>
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
                              <ExternalLink className="w-3 h-3 text-[#4f4f4f]" />
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
                                <div className="px-3 py-1 bg-[#f5f5f5] text-sm flex items-center">
                                  {
                                    CHAIN_ID_TO_NAME[
                                      Number(strategy.details.chainId)
                                    ]
                                  }
                                </div>
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
                                    <ExternalLink className="w-3 h-3 text-[#4f4f4f]" />
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
            <div className="lg:ml-6 lg:w-64 mt-6 lg:mt-0 flex lg:flex-col flex-row justify-around pt-3">
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
