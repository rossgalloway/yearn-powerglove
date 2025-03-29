import { useQuery } from '@apollo/client' // Import Apollo's useQuery
import { GET_VAULTS_SIMPLE } from '@/graphql/queries/vaults' // Import the query

import * as filters from '@/graphql/filters/vaultFilters'
import { VaultsContext } from '@/contexts/useVaults'

export function VaultsProvider({ children }: { children: React.ReactNode }) {
  const { data, loading, error: apolloError } = useQuery(GET_VAULTS_SIMPLE)
  const error = apolloError || null
  const vaults = data?.vaults || []
  const filteredVaults = filters.filterYearnVaults(vaults)

  return (
    <VaultsContext.Provider value={{ vaults: filteredVaults, loading, error }}>
      {children}
    </VaultsContext.Provider>
  )
}
