import { useMemo } from 'react'
import type { ChainId } from '@/constants/chains'
import { useTokenAssetsContext } from '@/contexts/useTokenAssets'
import { useVaults } from '@/contexts/useVaults'
import type { Strategy } from '@/types/dataTypes'
import type { VaultDerivedStrategy, VaultExtended } from '@/types/vaultTypes'
import { isLegacyVaultType } from '@/utils/vaultDataUtils'

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
  error: Error | undefined
}

const toCurrency = (value: number): string => {
  return value.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD'
  })
}

const getFallbackStrategyDetails = (vaultDetails: VaultExtended): VaultDerivedStrategy[] => {
  if (Array.isArray(vaultDetails.strategyDetails) && vaultDetails.strategyDetails.length > 0) {
    return vaultDetails.strategyDetails
  }

  if (!Array.isArray(vaultDetails.debts)) {
    return []
  }

  return vaultDetails.debts.map((debt, index) => ({
    address: debt.strategy,
    name: `Strategy ${index + 1}`,
    status: debt.debtRatio > 0 ? 'active' : 'unallocated',
    debtRatio: debt.debtRatio,
    currentDebt: debt.currentDebt,
    currentDebtUsd: debt.currentDebtUsd,
    maxDebt: debt.maxDebt,
    maxDebtUsd: debt.maxDebtUsd,
    targetDebtRatio: debt.targetDebtRatio,
    maxDebtRatio: debt.maxDebtRatio,
    totalDebt: String(debt.totalDebt ?? 0),
    totalDebtUsd: debt.totalDebtUsd,
    totalGain: debt.totalGain,
    totalGainUsd: debt.totalGainUsd,
    totalLoss: debt.totalLoss,
    totalLossUsd: debt.totalLossUsd,
    performanceFee: vaultDetails.fees?.performanceFee ?? vaultDetails.performanceFee ?? 0,
    managementFee: vaultDetails.fees?.managementFee ?? vaultDetails.managementFee ?? 0,
    lastReport: 0,
    netApr: null,
    estimatedApy: null
  }))
}

export function useStrategiesData(
  vaultChainId: ChainId,
  _vaultAddress: string,
  vaultDetails: VaultExtended
): StrategiesData {
  const { assets: tokenAssets } = useTokenAssetsContext()
  const { vaults } = useVaults()
  const isLegacyVault = isLegacyVaultType(vaultDetails)

  const indexedVaults = useMemo(() => {
    const map = new Map<string, VaultExtended>()
    vaults.forEach((vault) => {
      const key = `${vault.chainId}-${vault.address.toLowerCase()}`
      map.set(key, vault as VaultExtended)
      map.set(vault.address.toLowerCase(), vault as VaultExtended)
    })
    return map
  }, [vaults])

  const sourceStrategies = useMemo(() => getFallbackStrategyDetails(vaultDetails), [vaultDetails])

  const strategies = useMemo((): Strategy[] => {
    const managementFee = vaultDetails.fees?.managementFee ?? vaultDetails.managementFee ?? 0

    return sourceStrategies.map((strategy, index) => {
      const keyedByAddress = indexedVaults.get(strategy.address.toLowerCase())
      const keyedByChain = indexedVaults.get(`${vaultChainId}-${strategy.address.toLowerCase()}`)
      const linkedVault = keyedByChain ?? keyedByAddress
      const tokenSymbol = linkedVault?.asset?.symbol || vaultDetails.asset.symbol || ''
      const strategyDisplayName =
        strategy.name && !strategy.name.startsWith('Strategy ') ? strategy.name : linkedVault?.name || strategy.name

      const strategyUsdValue = strategy.totalDebtUsd > 0 ? strategy.totalDebtUsd : strategy.currentDebtUsd
      const hasAllocation = strategy.status === 'active' && strategy.debtRatio > 0
      const allocationPercent = hasAllocation ? strategy.debtRatio / 100 : 0
      const displayApr = strategy.estimatedApy ?? strategy.netApr ?? 0
      const estimatedAPY = isLegacyVault || !hasAllocation ? ' - ' : `${(displayApr * 100).toFixed(2)}%`

      const tokenIconUri =
        tokenAssets.find((token) => token.address.toLowerCase() === linkedVault?.asset?.address?.toLowerCase())
          ?.logoURI ||
        tokenAssets.find((token) => token.symbol === tokenSymbol)?.logoURI ||
        ''

      return {
        id: index,
        name: strategyDisplayName || 'Unknown Strategy',
        allocationPercent,
        allocationAmount: strategyUsdValue > 0 ? toCurrency(strategyUsdValue) : '$0.00',
        estimatedAPY,
        tokenSymbol,
        tokenIconUri,
        estimatedApySource: 'graph',
        details: {
          chainId: linkedVault?.chainId ?? vaultChainId,
          vaultAddress: strategy.address,
          managementFee,
          performanceFee:
            strategy.performanceFee || vaultDetails.fees?.performanceFee || vaultDetails.performanceFee || 0,
          isVault: Boolean(linkedVault),
          isEndorsed: linkedVault?.yearn || false
        }
      }
    })
  }, [sourceStrategies, indexedVaults, vaultChainId, vaultDetails, tokenAssets, isLegacyVault])

  const chartStrategies = useMemo(() => {
    return strategies.filter((s) => s.allocationPercent > 0).sort((a, b) => b.allocationPercent - a.allocationPercent)
  }, [strategies])

  const apyContributions = useMemo(() => {
    const parseAPY = (apy: string) => Number.parseFloat(apy.replace(/[^0-9.]/g, ''))

    return chartStrategies.map((strategy) => {
      const apyValue = parseAPY(strategy.estimatedAPY)
      const contribution = (apyValue * strategy.allocationPercent) / 100
      return {
        id: strategy.id,
        name: strategy.name,
        apyValue,
        allocationPercent: strategy.allocationPercent,
        contribution,
        formattedContribution: contribution.toFixed(2)
      }
    })
  }, [chartStrategies])

  const totalAPYContribution = useMemo(() => {
    return apyContributions.reduce((sum, item) => sum + item.contribution, 0)
  }, [apyContributions])

  const allocationChartData = useMemo(() => {
    return chartStrategies.map((strategy) => ({
      id: strategy.id,
      name: strategy.name,
      value: strategy.allocationPercent,
      amount: strategy.allocationAmount
    }))
  }, [chartStrategies])

  const apyContributionChartData = useMemo(() => {
    return apyContributions.map((item) => ({
      id: item.id,
      name: item.name,
      value: item.contribution,
      formattedValue: item.formattedContribution,
      apyValue: item.apyValue,
      allocationPercent: item.allocationPercent
    }))
  }, [apyContributions])

  return {
    strategies,
    chartStrategies,
    apyContributions,
    totalAPYContribution,
    allocationChartData,
    apyContributionChartData,
    isLoading: false,
    error: undefined
  }
}
