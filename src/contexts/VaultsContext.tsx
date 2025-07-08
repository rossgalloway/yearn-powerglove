import { useQuery } from '@apollo/client' // ...existing code...
import { GET_VAULTS_SIMPLE } from '@/graphql/queries/vaults'
import * as filters from '@/graphql/filters/vaultFilters'
import { VaultsContext } from '@/contexts/useVaults'
import { StrategiesContext } from '@/contexts/useQueryStrategies'
import { GET_STRATEGIES } from '../graphql/queries/strategies'
import { TokenAssetsContext } from '@/contexts/useTokenAssets'
import { useTokenAssets } from '@/hooks/useTokenAssets'

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
  const loading = vaultsLoading || strategiesLoading || assetsLoading // include assets loading
  const error = apolloError || apolloError2 || assetsError || null // include assets error
  const vaults = vaultsData?.vaults || []
  const strategies = strategiesData?.strategies || []
  const filteredVaults = filters.filterYearnVaults(vaults)

  return (
    <TokenAssetsContext.Provider
      value={{ assets, loading: assetsLoading, error: assetsError }}
    >
      <VaultsContext.Provider
        value={{ vaults: filteredVaults, loading, error }}
      >
        <StrategiesContext.Provider value={{ strategies, loading, error }}>
          {children}
        </StrategiesContext.Provider>
      </VaultsContext.Provider>
    </TokenAssetsContext.Provider>
  )
}
