import { useQuery, ApolloError } from '@apollo/client'
import { GET_VAULT_DETAILS } from '@/graphql/queries/vaults'
import { queryAPY, queryPPS, queryTVL } from '@/graphql/queries/timeseries'
import { VaultExtended } from '@/types/vaultTypes'
import { TimeseriesDataPoint } from '@/types/dataTypes'
import { useMemo } from 'react'

interface UseVaultPageDataProps {
  vaultAddress: string
  vaultChainId: number
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
  apyData: TimeseriesQueryResult | undefined
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

  // Fetch APY data
  const {
    data: apyData,
    loading: apyLoading,
    error: apyError,
  } = useQuery(queryAPY, {
    variables: {
      chainId: vaultChainId,
      address: vaultAddress,
      label: 'apy-bwd-delta-pps',
      component: 'net',
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
    return vaultData?.vault || null
  }, [vaultData])

  // Calculate combined loading states
  const chartsLoading = useMemo(() => {
    return apyLoading || tvlLoading || ppsLoading
  }, [apyLoading, tvlLoading, ppsLoading])

  // Calculate combined error states
  const chartsError = useMemo(() => {
    return !!apyError || !!tvlError || !!ppsError
  }, [apyError, tvlError, ppsError])

  // Initial loading only waits for vault data (charts can load separately)
  const isInitialLoading = vaultLoading

  // Has errors if vault fails to load
  const hasErrors = !!vaultError

  return {
    // Vault data
    vaultDetails,
    vaultLoading,
    vaultError,

    // Chart data (raw)
    apyData,
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
