import { useQuery, ApolloError } from '@apollo/client'
import { GET_VAULT_DETAILS } from '@/graphql/queries/vaults'
import { queryAPY, queryPPS, queryTVL } from '@/graphql/queries/timeseries'
import { VaultExtended } from '@/types/vaultTypes'
import { TimeseriesDataPoint } from '@/types/dataTypes'
import { useMemo } from 'react'
import { ChainId } from '@/constants/chains'
import { useYDaemonVault } from '@/hooks/useYDaemonVaults'

interface UseVaultPageDataProps {
  vaultAddress: string
  vaultChainId: ChainId
}

interface TimeseriesQueryResult {
  timeseries: TimeseriesDataPoint[]
}

interface UseVaultPageDataReturn {
  // Vault data
  vaultDetails: VaultExtended | null
  vaultLoading: boolean
  vaultError: ApolloError | undefined

  // Chart data (raw)
  apyWeeklyData: TimeseriesQueryResult | undefined
  apyMonthlyData: TimeseriesQueryResult | undefined
  tvlData: TimeseriesQueryResult | undefined
  ppsData: TimeseriesQueryResult | undefined

  // Chart loading states
  chartsLoading: boolean
  chartsError: boolean

  // Combined states
  isInitialLoading: boolean
  hasErrors: boolean
}

/**
 * Coordinates all GraphQL queries for the vault page and manages loading states
 */
export function useVaultPageData({
  vaultAddress,
  vaultChainId,
}: UseVaultPageDataProps): UseVaultPageDataReturn {
  // Fetch vault details
  const {
    data: vaultData,
    loading: vaultLoading,
    error: vaultError,
  } = useQuery<{ vault: VaultExtended }>(GET_VAULT_DETAILS, {
    variables: { address: vaultAddress, chainId: vaultChainId },
  })
  const { data: yDaemonVault, isLoading: yDaemonLoading } = useYDaemonVault(
    vaultChainId,
    vaultAddress
  )

  // Fetch weekly APY data
  const {
    data: apyWeeklyData,
    loading: apyWeeklyLoading,
    error: apyWeeklyError,
  } = useQuery(queryAPY, {
    variables: {
      chainId: vaultChainId,
      address: vaultAddress,
      label: 'apy-bwd-delta-pps',
      component: 'weeklyNet',
      limit: 1000,
    },
  })

  // Fetch weekly Monthly data
  const {
    data: apyMonthlyData,
    loading: apyMonthlyLoading,
    error: apyMonthlyError,
  } = useQuery(queryAPY, {
    variables: {
      chainId: vaultChainId,
      address: vaultAddress,
      label: 'apy-bwd-delta-pps',
      component: 'monthlyNet',
      limit: 1000,
    },
  })

  // Fetch TVL data
  const {
    data: tvlData,
    loading: tvlLoading,
    error: tvlError,
  } = useQuery(queryTVL, {
    variables: {
      chainId: vaultChainId,
      address: vaultAddress,
      label: 'tvl',
      limit: 1000,
    },
  })

  // Fetch PPS data
  const {
    data: ppsData,
    loading: ppsLoading,
    error: ppsError,
  } = useQuery(queryPPS, {
    variables: {
      address: vaultAddress,
      label: 'pps',
      component: 'humanized',
      limit: 1000,
    },
  })

  // Extract vault details with null safety
  const vaultDetails = useMemo(() => {
    if (!vaultData?.vault) return null
    const base = vaultData.vault
    if (!yDaemonVault) {
      return {
        ...base,
        forwardApyNet: base.forwardApyNet ?? null,
        strategyForwardAprs: base.strategyForwardAprs ?? {},
      }
    }
    const strategyAprs: Record<string, number | null> = {}
    yDaemonVault.strategies?.forEach(strategy => {
      if (!strategy?.address) return
      strategyAprs[strategy.address.toLowerCase()] = strategy.netAPR ?? null
    })
    return {
      ...base,
      forwardApyNet:
        yDaemonVault.apr?.forwardAPR?.netAPR ?? base.forwardApyNet ?? null,
      strategyForwardAprs: strategyAprs,
      kind: base.kind,
    }
  }, [vaultData, yDaemonVault])

  // Calculate combined loading states
  const chartsLoading = useMemo(() => {
    return apyWeeklyLoading || apyMonthlyLoading || tvlLoading || ppsLoading
  }, [apyWeeklyLoading, apyMonthlyLoading, tvlLoading, ppsLoading])

  // Calculate combined error states
  const chartsError = useMemo(() => {
    return !!apyWeeklyError || !!apyMonthlyError || !!tvlError || !!ppsError
  }, [apyWeeklyError, apyMonthlyError, tvlError, ppsError])

  // Initial loading only waits for vault data (charts can load separately)
  const isInitialLoading = vaultLoading || yDaemonLoading

  // Has errors if vault fails to load
  const hasErrors = !!vaultError

  return {
    // Vault data
    vaultDetails,
    vaultLoading,
    vaultError,

    // Chart data
    apyWeeklyData: apyWeeklyData,
    apyMonthlyData: apyMonthlyData,
    tvlData,
    ppsData,

    // Chart loading states
    chartsLoading,
    chartsError,

    // Combined states
    isInitialLoading,
    hasErrors,
  }
}
