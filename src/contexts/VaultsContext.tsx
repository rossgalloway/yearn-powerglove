import { useQuery } from '@apollo/client' // ...existing code...
import { GET_VAULTS_SIMPLE } from '@/graphql/queries/vaults'
import * as filters from '@/graphql/filters/vaultFilters'
import { VaultsContext } from '@/contexts/useVaults'
import { StrategiesContext } from '@/contexts/useQueryStrategies'
import { GET_STRATEGIES } from '../graphql/queries/strategies'
import { TokenAssetsContext } from '@/contexts/useTokenAssets'
import { useTokenAssets } from '@/hooks/useTokenAssets'
import { useMemo } from 'react'

export function VaultsProvider({ children }: { children: React.ReactNode }) {
  const {
    data: vaultsData,
    loading: vaultsLoading,
    error: apolloError,
  } = useQuery(GET_VAULTS_SIMPLE)
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

  // Improved loading state coordination
  const loadingState = useMemo(() => {
    const isVaultsLoading = vaultsLoading
    const isStrategiesLoading = strategiesLoading
    const isAssetsLoading = assetsLoading

    // All queries are loading
    const isInitialLoading =
      isVaultsLoading && isStrategiesLoading && isAssetsLoading

    // Any query is still loading
    const isPartialLoading =
      isVaultsLoading || isStrategiesLoading || isAssetsLoading

    // All critical data has loaded (vaults is most important)
    const isDataReady = !isVaultsLoading && vaultsData?.vaults

    return {
      isInitialLoading,
      isPartialLoading,
      isDataReady,
      vaultsReady: !isVaultsLoading && !!vaultsData?.vaults,
      strategiesReady: !isStrategiesLoading && !!strategiesData?.strategies,
      assetsReady: !isAssetsLoading && !!assets?.length,
    }
  }, [
    vaultsLoading,
    strategiesLoading,
    assetsLoading,
    vaultsData,
    strategiesData,
    assets,
  ])

  const globalError = apolloError || apolloError2 || assetsError || null
  const vaults = vaultsData?.vaults || []
  const strategies = strategiesData?.strategies || []
  const filteredVaults = filters.filterYearnVaults(vaults)

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
