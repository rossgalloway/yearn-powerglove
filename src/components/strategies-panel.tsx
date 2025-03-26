import { useState, useMemo } from 'react'
import { useNavigate } from '@tanstack/react-router'
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
  GET_VAULT_DEBTS,
  GET_VAULT_STRATEGIES,
  VaultDebtsQuery,
  VaultStrategiesQuery,
} from '../graphql/queries/strategies'
import { VaultDebt } from '@/types/vaultTypes'
import { Strategy } from '../types/dataTypes'
import smolAssets from '@/constants/smolAssets.json'

// import smolAssets from '@/data/smolAssets.json'

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
  props: { vaultChainId: number; vaultAddress: string }
}) {
  const navigate = useNavigate()
  // Destructure chainId and address from props
  const { vaultChainId, vaultAddress } = props
  console.log('welcome to the strategies panel')

  // Fetches the component strategies of the current vault
  const {
    data: strategyData,
    loading: strategyLoading,
    error: strategyError,
  } = useQuery<{ vaultStrategies: VaultStrategiesQuery[] }>(
    GET_VAULT_STRATEGIES,
    {
      variables: { vault: vaultAddress, chainId: vaultChainId },
    }
  )
  // Add the current vault address to the array and
  // Extract the "address" value from each strategy in the fetched array
  console.log('vaultAddress:', vaultAddress)
  const strategyAddresses = [
    vaultAddress,
    ...(strategyData?.vaultStrategies.map(strategy => strategy.address) || []),
  ]
  console.log('strategyAddresses:', strategyAddresses)

  // Fetch debts data for the current vault
  const {
    data: debtsData,
    loading: debtsLoading,
    error: debtsError,
  } = useQuery<{ vaults: VaultDebtsQuery[] }>(GET_VAULT_DEBTS, {
    variables: { addresses: strategyAddresses, chainId: vaultChainId },
  })
  let enrichedVaultDebts: VaultDebt[] = [] // Declare enrichedVaultDebts outside the block
  if (debtsData) {
    const preppedDebtsData = debtsData.vaults
    console.log('debtsData:', preppedDebtsData)
    // Find the vault that matches the current vaultAddress
    const selectedVault: VaultDebtsQuery | undefined = preppedDebtsData.find(
      vault => vault.address === vaultAddress
    )

    if (!selectedVault) {
      throw new Error(`Vault with address ${vaultAddress} not found.`) // Handle undefined case
    }

    // Extract the debts array from the selected vault
    const selectedVaultDebts: VaultDebt[] = selectedVault?.debts || []
    console.log('vaultDebts:', selectedVaultDebts)

    // Remove the selected vault from the remaining strategies
    const remainingStrategies =
      preppedDebtsData?.filter(vault => vault.address !== vaultAddress) || []
    console.log('remainingStrategies:', remainingStrategies)

    // Iterate through the vaultDebts array and enrich it with additional fields
    enrichedVaultDebts = selectedVaultDebts.map(debt => {
      // Find the matching strategy in the remaining strategies array
      const matchingStrategy = remainingStrategies.find(
        strategy => strategy.address === debt.strategy
      )

      return {
        ...debt,
        address: debt.strategy, // Rename `strategy` to `address`
        name: matchingStrategy?.name || '',
        erc4626: matchingStrategy?.erc4626 || undefined,
        yearn: matchingStrategy?.yearn || undefined,
        v3: matchingStrategy?.v3 || undefined,
        managementFee: matchingStrategy?.fees?.managementFee || 0,
        performanceFee: matchingStrategy?.fees?.performanceFee || 0,
        grossApr: matchingStrategy?.apy?.grossApr,
        netApy: matchingStrategy?.apy?.net,
        inceptionNetApy: matchingStrategy?.apy?.inceptionNet,
        assetSymbol: matchingStrategy?.asset?.symbol,
      }
    })
  }
  console.log('enrichedVaultDebts:', enrichedVaultDebts)
  // Sort the enriched debts by currentDebt (convert strings to numbers)
  const sortedVaultDebts = enrichedVaultDebts.sort(
    (a, b) => Number(b.currentDebt) - Number(a.currentDebt)
  )
  console.log('sortedDebts:', sortedVaultDebts)

  // Sum currentDebtUsd values to get totalDebt
  const totalVaultDebt = sortedVaultDebts.reduce(
    (sum: number, debt: VaultDebt) => sum + Number(debt.currentDebtUsd),
    0
  )
  console.log('totalDebt:', totalVaultDebt)

  // Map enrichedVaultDebts to Strategy objects
  const strategies: Strategy[] = enrichedVaultDebts.map((debt, index) => ({
    id: index, // Use the index as the ID (or replace with a unique identifier if available)
    name: debt.name || 'Unknown Strategy', // Use the name from enrichedVaultDebts or a default value
    allocationPercent: totalVaultDebt
      ? (Number(debt.currentDebtUsd) / totalVaultDebt) * 100
      : 0,
    allocationAmount: debt.currentDebtUsd
      ? debt.currentDebtUsd.toLocaleString('en-US', {
          style: 'currency',
          currency: 'USD',
        })
      : '$0.00', // Format currentDebtUsd as a currency string
    estimatedAPY: debt.netApy
      ? `${(Number(debt.netApy) * 100).toFixed(2)}%`
      : '0.00%', // Format maxDebtRatio as a percentage string
    tokenSymbol: debt.assetSymbol || '', // Use the asset symbol from enrichedVaultDebts or a default value
    tokenIconUri:
      smolAssets.tokens.find(token => token.symbol === debt.assetSymbol)
        ?.logoURI || '',
    details: {
      chainId: vaultChainId, // Use the chainId from props
      vaultAddress: debt.address ? debt.address : '', // Use the vaultAddress from props
      managementFee: debt.managementFee || 0, // Use managementFee or a default value
      performanceFee: debt.performanceFee || 0, // Use performanceFee or a default value
      isVault: true, // Assume it's a vault (adjust if needed)
      isEndorsed: debt.yearn || false, // Use the yearn field to determine endorsement
    },
  }))

  console.log('strategies:', strategies)

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
        if (debtsLoading || strategyLoading) {
          return (
            <div className="flex justify-center items-center h-full">
              <p>Loading...</p>
            </div>
          )
        }

        // Add error state handling
        if (debtsError || strategyError) {
          return (
            <div className="flex justify-center items-center h-full">
              <p className="text-red-500">
                {debtsError?.message ||
                  strategyError?.message ||
                  'An error occurred.'}
              </p>
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
                            <button
                              onClick={() =>
                                navigate({
                                  to: `/vaults/${strategy.details.chainId}/${strategy.details.vaultAddress}`,
                                })
                              }
                              className="px-3 py-1 bg-[#f5f5f5] text-sm flex items-center gap-1 hover:bg-[#e5e5e5] transition-colors"
                            >
                              Data
                              <ExternalLink className="w-3 h-3 text-[#4f4f4f]" />
                            </button>
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
                                  <button
                                    onClick={() =>
                                      navigate({
                                        to: `/vaults/${strategy.details.chainId}/${strategy.details.vaultAddress}`,
                                      })
                                    }
                                    className="px-3 py-1 bg-[#f5f5f5] text-sm flex items-center gap-1 hover:bg-[#e5e5e5] transition-colors"
                                  >
                                    Data
                                    <ExternalLink className="w-3 h-3 text-[#4f4f4f]" />
                                  </button>
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
        </div>

        {/* Tab Content */}
        {renderTabContent()}
      </div>
    </div>
  )
}
