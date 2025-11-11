import { useMemo } from 'react'
import { useQuery as useApolloQuery, ApolloError } from '@apollo/client'
import { useQuery as useReactQuery } from '@tanstack/react-query'
import { Address } from 'viem'
import {
  GET_STRATEGY_DETAILS,
  StrategyDetailsQuery,
} from '@/graphql/queries/strategies'
import { EnrichedVaultDebt, VaultDebt, VaultExtended } from '@/types/vaultTypes'
import { Strategy } from '@/types/dataTypes'
import { useQueryStrategies } from '@/contexts/useQueryStrategies'
import { useTokenAssetsContext } from '@/contexts/useTokenAssets'
import { ChainId } from '../constants/chains'
import {
  fetchStrategyAprs,
  StrategyAprRequest,
  StrategyAprMap,
} from '@/lib/apr-oracle'

export interface StrategiesData {
  strategies: Strategy[]
  chartStrategies: Strategy[]
  apyContributions: Array<{
    id: number
    name: string
    apyValue: number
    allocationPercent: number
    contribution: number
    formattedContribution: string
  }>
  totalAPYContribution: number
  allocationChartData: Array<{
    id: number
    name: string
    value: number
    amount: string
  }>
  apyContributionChartData: Array<{
    id: number
    name: string
    value: number
    formattedValue: string
    apyValue: number
    allocationPercent: number
  }>
  isLoading: boolean
  error: ApolloError | undefined
}

export function useStrategiesData(
  vaultChainId: ChainId,
  vaultAddress: string,
  vaultDetails: VaultExtended
): StrategiesData {
  const { assets: tokenAssets } = useTokenAssetsContext()
  const allStrategies = useQueryStrategies()

  const vaultStrategyAddresses = vaultDetails.strategies
  const shouldFetch = vaultStrategyAddresses != null

  // Fetch strategy details for V3 vaults
  const {
    data: strategyData,
    loading,
    error,
  } = useApolloQuery<{ vaults: StrategyDetailsQuery[] }>(GET_STRATEGY_DETAILS, {
    variables: { addresses: vaultStrategyAddresses },
    skip: !shouldFetch,
  })

  const v3StrategyData = shouldFetch ? strategyData?.vaults : undefined

  // Transform vault debts to enriched data
  const enrichedVaultDebts = useMemo((): EnrichedVaultDebt[] => {
    const selectedVaultDebts: VaultDebt[] = Array.isArray(vaultDetails?.debts)
      ? (vaultDetails.debts as VaultDebt[])
      : []

    return selectedVaultDebts.map(debt => {
      const v3Strategy = v3StrategyData?.find(
        strategy => strategy.address === debt.strategy
      )
      const v2Strategy = allStrategies.strategies.find(
        strategy => strategy.address === debt.strategy
      )

      return {
        strategy: debt.strategy,
        chainId: vaultChainId,
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
        address: debt.strategy,
        name: vaultDetails.v3 ? v3Strategy?.name || '' : v2Strategy?.name || '',
        erc4626: vaultDetails.v3
          ? v3Strategy?.erc4626 || false
          : v2Strategy?.erc4626 || false,
        yearn: vaultDetails.v3
          ? v3Strategy?.yearn || false
          : v2Strategy?.yearn || false,
        v3: vaultDetails.v3 || false,
        managementFee: vaultDetails.v3
          ? v3Strategy?.fees?.managementFee || 0
          : 0,
        performanceFee: vaultDetails.v3
          ? v3Strategy?.fees?.performanceFee || 0
          : v2Strategy?.performanceFee || 0,
        grossApr: vaultDetails.v3
          ? v3Strategy?.apy?.grossApr
          : v2Strategy?.lastReportDetail?.apr.gross,
        netApy: vaultDetails.v3
          ? v3Strategy?.apy?.net
          : v2Strategy?.lastReportDetail?.apr.net,
        inceptionNetApy: vaultDetails.v3
          ? (v3Strategy?.apy?.inceptionNet ?? undefined)
          : undefined,
        assetSymbol: vaultDetails.v3
          ? v3Strategy?.asset?.symbol
          : vaultDetails?.asset.symbol,
      }
    })
  }, [vaultDetails, v3StrategyData, allStrategies.strategies, vaultChainId])

  const strategyAprRequests = useMemo<StrategyAprRequest[]>(() => {
    if (!vaultDetails?.v3) {
      return []
    }
    return enrichedVaultDebts
      .filter(debt => !!debt.address)
      .map(debt => ({
        address: debt.address as Address,
        chainId: (debt.chainId ?? vaultChainId) as ChainId,
      }))
  }, [enrichedVaultDebts, vaultDetails?.v3, vaultChainId])

  const strategyAprKey = useMemo(() => {
    if (!strategyAprRequests.length) {
      return ''
    }
    return strategyAprRequests
      .map(request => `${request.chainId}:${request.address.toLowerCase()}`)
      .sort()
      .join('|')
  }, [strategyAprRequests])

  const { data: strategyAprMap } = useReactQuery<StrategyAprMap>({
    queryKey: ['strategy-apr-oracle', strategyAprKey],
    queryFn: () => fetchStrategyAprs(strategyAprRequests),
    staleTime: 60_000,
    enabled: Boolean(vaultDetails?.v3 && strategyAprRequests.length > 0),
  })

  // Sort enriched debts by allocation
  const sortedVaultDebts = useMemo(() => {
    return [...enrichedVaultDebts].sort((a, b) => {
      if (vaultDetails.v3) {
        return Number(b.v3Debt.currentDebt) - Number(a.v3Debt.currentDebt)
      } else {
        return Number(b.v2Debt.debtRatio) - Number(a.v2Debt.debtRatio)
      }
    })
  }, [enrichedVaultDebts, vaultDetails.v3])

  // Calculate total vault debt
  const totalVaultDebt = useMemo(() => {
    return sortedVaultDebts.reduce((sum: number, debt: EnrichedVaultDebt) => {
      if (vaultDetails.v3) {
        return sum + Number(debt.v3Debt.currentDebtUsd)
      } else {
        return sum + Number(debt.v2Debt.totalDebtUsd)
      }
    }, 0)
  }, [sortedVaultDebts, vaultDetails.v3])

  // Transform to Strategy objects
  const strategies = useMemo((): Strategy[] => {
    return enrichedVaultDebts.map((debt, index) => ({
      id: index,
      name: debt.name || 'Unknown Strategy',
      allocationPercent: totalVaultDebt
        ? vaultDetails.v3
          ? (Number(debt.v3Debt.currentDebtUsd) / totalVaultDebt) * 100
          : (Number(debt.v2Debt.totalDebtUsd) / totalVaultDebt) * 100
        : 0,
      allocationAmount: vaultDetails.v3
        ? debt.v3Debt.currentDebtUsd
          ? debt.v3Debt.currentDebtUsd.toLocaleString('en-US', {
              style: 'currency',
              currency: 'USD',
            })
          : '$0.00'
        : debt.v2Debt.totalDebtUsd
          ? debt.v2Debt.totalDebtUsd.toLocaleString('en-US', {
              style: 'currency',
              currency: 'USD',
            })
          : '$0.00',
      estimatedAPY: debt.netApy
        ? `${(Number(debt.netApy) * 100).toFixed(2)}%`
        : '0.00%',
      tokenSymbol: debt.assetSymbol || '',
      tokenIconUri:
        tokenAssets.find(token => token.symbol === debt.assetSymbol)?.logoURI ||
        '',
      estimatedApySource: 'graph' as const,
      details: {
        chainId: vaultChainId,
        vaultAddress: debt.address || '',
        managementFee: debt.managementFee || 0,
        performanceFee: debt.performanceFee || 0,
        isVault: debt.v3 || false,
        isEndorsed: debt.yearn || false,
      },
    }))
  }, [
    enrichedVaultDebts,
    totalVaultDebt,
    vaultDetails.v3,
    vaultChainId,
    tokenAssets,
  ])

  const oracleAwareStrategies = useMemo((): Strategy[] => {
    if (!vaultDetails?.v3 || !strategyAprMap) {
      return strategies
    }
    return strategies.map(strategy => {
      const key = strategy.details.vaultAddress?.toLowerCase()
      if (!key) {
        return strategy
      }
      const oracleEntry = strategyAprMap[key]
      if (!oracleEntry?.formatted) {
        return strategy
      }
      return {
        ...strategy,
        estimatedAPY: oracleEntry.formatted,
        estimatedApySource: 'oracle' as const,
      }
    })
  }, [strategies, strategyAprMap, vaultDetails?.v3])

  // Filter strategies with positive allocation for charts
  const chartStrategies = useMemo(() => {
    return oracleAwareStrategies
      .filter(s => s.allocationPercent > 0)
      .sort((a, b) => b.allocationPercent - a.allocationPercent)
  }, [oracleAwareStrategies])

  // Calculate APY contributions
  const apyContributions = useMemo(() => {
    const parseAPY = (apy: string) =>
      Number.parseFloat(apy.replace(/[^0-9.]/g, ''))

    return chartStrategies.map(strategy => {
      const apyValue = parseAPY(strategy.estimatedAPY)
      const contribution = (apyValue * strategy.allocationPercent) / 100
      return {
        id: strategy.id,
        name: strategy.name,
        apyValue,
        allocationPercent: strategy.allocationPercent,
        contribution,
        formattedContribution: contribution.toFixed(2),
      }
    })
  }, [chartStrategies])

  // Calculate total APY contribution
  const totalAPYContribution = useMemo(() => {
    return apyContributions.reduce((sum, item) => sum + item.contribution, 0)
  }, [apyContributions])

  // Prepare chart data
  const allocationChartData = useMemo(() => {
    return chartStrategies.map(strategy => ({
      id: strategy.id,
      name: strategy.name,
      value: strategy.allocationPercent,
      amount: strategy.allocationAmount,
    }))
  }, [chartStrategies])

  const apyContributionChartData = useMemo(() => {
    return apyContributions.map(item => ({
      id: item.id,
      name: item.name,
      value: item.contribution,
      formattedValue: item.formattedContribution,
      apyValue: item.apyValue,
      allocationPercent: item.allocationPercent,
    }))
  }, [apyContributions])

  return {
    strategies: oracleAwareStrategies,
    chartStrategies,
    apyContributions,
    totalAPYContribution,
    allocationChartData,
    apyContributionChartData,
    isLoading: loading,
    error,
  }
}
