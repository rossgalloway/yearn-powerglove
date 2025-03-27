import { createContext, useContext } from 'react'
import { Vault } from '@/types/vaultTypes'

interface VaultsContextProps {
  vaults: Vault[]
  loading: boolean
  error: Error | null
}

export const VaultsContext = createContext<VaultsContextProps>({
  vaults: [],
  loading: false,
  error: null,
})

export const useVaults = () => useContext(VaultsContext)
