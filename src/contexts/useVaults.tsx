import { createContext, useContext } from 'react'
import { Vault } from '@/types/vaultTypes'

interface LoadingState {
  isInitialLoading: boolean
  isPartialLoading: boolean
  isDataReady: boolean
  vaultsReady: boolean
  strategiesReady: boolean
  assetsReady: boolean
   yDaemonReady: boolean
}

interface VaultsContextProps {
  vaults: Vault[]
  loading: boolean
  error: Error | null
  loadingState?: LoadingState // Added optional enhanced loading state
}

export const VaultsContext = createContext<VaultsContextProps>({
  vaults: [],
  loading: false,
  error: null,
})

export const useVaults = () => useContext(VaultsContext)
