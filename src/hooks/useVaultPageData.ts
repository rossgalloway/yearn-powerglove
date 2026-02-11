import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import type { ChainId } from '@/constants/chains'
import type { VaultOverrideConfig } from '@/constants/vaultOverrides'
import { useVaults } from '@/contexts/useVaults'
import { useRestTimeseries } from '@/hooks/useRestTimeseries'
import { fetchKongVaultSnapshotRaw } from '@/lib/kong-vault-client'
import { mapKongSnapshotToVaultExtended } from '@/lib/kong-vault-derivation'
import type { TimeseriesDataPoint } from '@/types/dataTypes'
import type { KongVaultSnapshot } from '@/types/kong'
import type { VaultExtended } from '@/types/vaultTypes'
import {
  applyVaultOverride,
  getVaultBlacklistReason,
  getVaultOverride,
  isVaultBlacklisted
} from '@/utils/vaultOverrides'

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
  vaultError: Error | undefined

  // Chart data (raw)
  apyWeeklyData: TimeseriesQueryResult | undefined
  apyMonthlyData: TimeseriesQueryResult | undefined
  aprOracleAprData: TimeseriesQueryResult | undefined
  tvlData: TimeseriesQueryResult | undefined
  ppsData: TimeseriesQueryResult | undefined

  // Chart loading states
  chartsLoading: boolean
  chartsError: boolean

  // Combined states
  isInitialLoading: boolean
  hasErrors: boolean
  isBlacklisted: boolean
  blacklistReason?: string
  overrideConfig?: VaultOverrideConfig
}

/**
 * Coordinates data fetching for the vault page and manages loading states
 * Uses Kong REST for vault details and timeseries data
 */
export function useVaultPageData({ vaultAddress, vaultChainId }: UseVaultPageDataProps): UseVaultPageDataReturn {
  const isBlacklisted = isVaultBlacklisted(vaultChainId, vaultAddress)
  const blacklistReason = getVaultBlacklistReason(vaultChainId, vaultAddress)
  const overrideConfig = getVaultOverride(vaultChainId, vaultAddress)
  const { vaults } = useVaults()
  const normalizedAddress = vaultAddress.toLowerCase()

  const baseVault = useMemo(
    () =>
      vaults.find((vault) => vault.chainId === vaultChainId && vault.address.toLowerCase() === normalizedAddress) ??
      null,
    [vaults, vaultChainId, normalizedAddress]
  )

  const {
    data: snapshotData,
    isLoading: vaultLoading,
    error: snapshotError
  } = useQuery<KongVaultSnapshot | null>({
    queryKey: ['kong', 'vault', 'snapshot', vaultChainId, normalizedAddress],
    queryFn: () => fetchKongVaultSnapshotRaw(vaultChainId, vaultAddress),
    staleTime: 30 * 1000,
    enabled: Boolean(vaultAddress)
  })

  const vaultDetails = useMemo(() => {
    if (!snapshotData && !baseVault) return null
    if (!snapshotData && baseVault) {
      return applyVaultOverride({
        ...(baseVault as VaultExtended),
        forwardApyNet: baseVault.forwardApyNet ?? null,
        strategyForwardAprs: baseVault.strategyForwardAprs ?? {},
        strategyDetails: (baseVault as VaultExtended).strategyDetails ?? []
      })
    }
    return applyVaultOverride(
      mapKongSnapshotToVaultExtended(snapshotData as KongVaultSnapshot, baseVault as VaultExtended | null)
    )
  }, [snapshotData, baseVault])

  const isV3Vault = Boolean(
    vaultDetails?.v3 || snapshotData?.apiVersion?.startsWith('3') || snapshotData?.apiVersion?.startsWith('~3')
  )

  // Fetch weekly APY data from REST API
  const {
    data: apyWeeklyData,
    isLoading: apyWeeklyLoading,
    error: apyWeeklyError
  } = useRestTimeseries({
    segment: 'apy-historical',
    chainId: vaultChainId,
    address: vaultAddress,
    components: ['weeklyNet']
  })

  // Fetch monthly APY data from REST API
  const {
    data: apyMonthlyData,
    isLoading: apyMonthlyLoading,
    error: apyMonthlyError
  } = useRestTimeseries({
    segment: 'apy-historical',
    chainId: vaultChainId,
    address: vaultAddress,
    components: ['monthlyNet']
  })

  // Fetch APR-oracle APR timeseries from REST API (v3 only)
  const { data: aprOracleAprData } = useRestTimeseries({
    segment: 'apr-oracle',
    chainId: vaultChainId,
    address: vaultAddress,
    components: ['apr'],
    enabled: isV3Vault
  })

  // Fetch TVL data from REST API
  const {
    data: tvlData,
    isLoading: tvlLoading,
    error: tvlError
  } = useRestTimeseries({
    segment: 'tvl',
    chainId: vaultChainId,
    address: vaultAddress
  })

  // Fetch PPS data from REST API
  const {
    data: ppsData,
    isLoading: ppsLoading,
    error: ppsError
  } = useRestTimeseries({
    segment: 'pps',
    chainId: vaultChainId,
    address: vaultAddress,
    components: ['humanized']
  })

  // Calculate combined loading states
  const chartsLoading = useMemo(() => {
    // `aprOracleApyLoading` is intentionally excluded since it's optional overlay data.
    return apyWeeklyLoading || apyMonthlyLoading || tvlLoading || ppsLoading
  }, [apyWeeklyLoading, apyMonthlyLoading, tvlLoading, ppsLoading])

  // Calculate combined error states
  const chartsError = useMemo(() => {
    // `aprOracleApyError` is intentionally excluded since it's optional overlay data.
    return !!apyWeeklyError || !!apyMonthlyError || !!tvlError || !!ppsError
  }, [apyWeeklyError, apyMonthlyError, tvlError, ppsError])

  // Initial loading only waits for vault data (charts can load separately)
  const isInitialLoading = vaultLoading

  // Has errors if vault fails to load
  const hasErrors = !!snapshotError

  return {
    // Vault data
    vaultDetails,
    vaultLoading,
    vaultError: snapshotError as Error | undefined,

    // Chart data
    apyWeeklyData: apyWeeklyData,
    apyMonthlyData: apyMonthlyData,
    aprOracleAprData,
    tvlData,
    ppsData,

    // Chart loading states
    chartsLoading,
    chartsError,

    // Combined states
    isInitialLoading,
    hasErrors,
    isBlacklisted,
    blacklistReason,
    overrideConfig
  }
}
