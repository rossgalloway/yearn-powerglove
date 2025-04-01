import { createContext, useContext } from 'react'

import { type VaultStrategiesQuery } from '@/graphql/queries/strategies'

interface VaultsContextProps {
  strategies: VaultStrategiesQuery[]
  loading: boolean
  error: Error | null
}

export const StrategiesContext = createContext<VaultsContextProps>({
  strategies: [],
  loading: false,
  error: null,
})

export const useQueryStrategies = () => useContext(StrategiesContext)
