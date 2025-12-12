import { useQuery } from '@apollo/client' // ...existing code...
import { GET_VAULTS_SIMPLE } from '@/graphql/queries/vaults'
import * as filters from '@/graphql/filters/vaultFilters'
import { VaultsContext } from '@/contexts/useVaults'
import { StrategiesContext } from '@/contexts/useQueryStrategies'
import { GET_STRATEGIES } from '../graphql/queries/strategies'
import { TokenAssetsContext } from '@/contexts/useTokenAssets'
import { useTokenAssets } from '@/hooks/useTokenAssets'
import { useMemo } from 'react'
import { useYDaemonVaults } from '@/hooks/useYDaemonVaults'
import type { Vault } from '@/types/vaultTypes'
import { applyVaultOverrides } from '@/utils/vaultOverrides'

export function VaultsProvider({ children }: { children: React.ReactNode }) {
  const {
    data: vaultsData,
    loading: vaultsLoading,
    error: apolloError,
  } = useQuery<{ vaults: Vault[] }>(GET_VAULTS_SIMPLE)
  const {
    data: strategiesData,
    loading: strategiesLoading,
    error: apolloError2,
  } = useQuery(GET_STRATEGIES)
  const {
    assets,
    loading: assetsLoading,
    error: assetsError,
  } = useTokenAssets() // fetch token assets
  const {
    data: yDaemonVaults,
    isLoading: yDaemonLoading,
    error: yDaemonError,
  } = useYDaemonVaults()

  // Improved loading state coordination
  const loadingState = useMemo(() => {
    const isVaultsLoading = vaultsLoading
    const isStrategiesLoading = strategiesLoading
    const isAssetsLoading = assetsLoading
    const isYDaemonLoading = yDaemonLoading

    // All queries are loading
    const isInitialLoading =
      isVaultsLoading &&
      isStrategiesLoading &&
      isAssetsLoading &&
      isYDaemonLoading

    // Any query is still loading
    const isPartialLoading =
      isVaultsLoading ||
      isStrategiesLoading ||
      isAssetsLoading ||
      isYDaemonLoading

    // All critical data has loaded (vaults is most important)
    const isDataReady = !isVaultsLoading && Boolean(vaultsData?.vaults)

    return {
      isInitialLoading,
      isPartialLoading,
      isDataReady,
      vaultsReady: !isVaultsLoading && !!vaultsData?.vaults,
      strategiesReady: !isStrategiesLoading && !!strategiesData?.strategies,
      assetsReady: !isAssetsLoading && !!assets?.length,
      yDaemonReady: !isYDaemonLoading && !!yDaemonVaults?.length,
    }
  }, [
    vaultsLoading,
    strategiesLoading,
    assetsLoading,
    yDaemonLoading,
    vaultsData,
    strategiesData,
    assets,
    yDaemonVaults,
  ])

  const globalError =
    apolloError || apolloError2 || assetsError || yDaemonError || null
  // Memoize vaults to prevent dependency changes in downstream useMemo hooks
  const vaults = useMemo(() => vaultsData?.vaults || [], [vaultsData?.vaults])
  const strategies = strategiesData?.strategies || []
  const yDaemonMap = useMemo(() => {
    if (!yDaemonVaults) {
      return new Map<string, { forwardApy?: number | null; strategyAprs: Record<string, number | null> }>()
    }
    const map = new Map<
      string,
      { forwardApy?: number | null; strategyAprs: Record<string, number | null> }
    >()
    yDaemonVaults.forEach(vault => {
      if (!vault?.address || !vault?.chainID) return
      const key = `${vault.chainID}-${vault.address.toLowerCase()}`
      const strategyAprs: Record<string, number | null> = {}
      vault.strategies?.forEach(strategy => {
        if (!strategy?.address) return
        strategyAprs[strategy.address.toLowerCase()] =
          strategy.netAPR ?? null
      })
      map.set(key, {
        forwardApy: vault.apr?.forwardAPR?.netAPR ?? null,
        strategyAprs,
      })
    })
    return map
  }, [yDaemonVaults])

  const enrichedVaults = useMemo(() => {
    if (!vaults.length) return vaults
    return vaults.map(vault => {
      if (!vault?.address) return vault
      const key = `${vault.chainId}-${vault.address.toLowerCase()}`
      const yDaemonEntry = yDaemonMap.get(key)
      if (!yDaemonEntry) {
        return vault
      }
      return {
        ...vault,
        forwardApyNet: yDaemonEntry.forwardApy ?? null,
        strategyForwardAprs: yDaemonEntry.strategyAprs,
      }
    })
  }, [vaults, yDaemonMap])

  const normalizedVaults = useMemo(
    () => applyVaultOverrides(enrichedVaults),
    [enrichedVaults]
  )

  const filteredVaults = filters.filterYearnVaults(normalizedVaults)

  return (
    <TokenAssetsContext.Provider
      value={{ assets, loading: assetsLoading, error: assetsError }}
    >
      <VaultsContext.Provider
        value={{
          vaults: filteredVaults,
          loading: loadingState.isPartialLoading,
          error: globalError,
          loadingState, // Added enhanced loading state
        }}
      >
        <StrategiesContext.Provider
          value={{
            strategies,
            loading: loadingState.isPartialLoading,
            error: globalError,
          }}
        >
          {children}
        </StrategiesContext.Provider>
      </VaultsContext.Provider>
    </TokenAssetsContext.Provider>
  )
}
