import { useQuery } from '@apollo/client' // Import Apollo's useQuery
import { GET_VAULTS_SIMPLE } from '@/graphql/queries/vaults' // Import the query

import * as filters from '@/graphql/filters/vaultFilters'
import { VaultsContext } from '@/contexts/useVaults'
import { StrategiesContext } from '@/contexts/useQueryStrategies'
import { GET_STRATEGIES } from '../graphql/queries/strategies'

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
  const loading = vaultsLoading || strategiesLoading
  const error = apolloError || apolloError2 || null
  const vaults = vaultsData?.vaults || []
  const strategies = strategiesData?.strategies || []
  const filteredVaults = filters.filterNotYearnV3Vaults(vaults)

  return (
    <VaultsContext.Provider value={{ vaults: filteredVaults, loading, error }}>
      <StrategiesContext.Provider value={{ strategies, loading, error }}>
        {children}
      </StrategiesContext.Provider>
    </VaultsContext.Provider>
  )
}
