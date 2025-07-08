import { createContext, useContext } from 'react'
import type { TokenAsset } from '@/types/tokenAsset'

interface TokenAssetsContextProps {
  assets: TokenAsset[]
  loading: boolean
  error: Error | null
}

export const TokenAssetsContext = createContext<TokenAssetsContextProps>({
  assets: [],
  loading: false,
  error: null,
})

export const useTokenAssetsContext = () => useContext(TokenAssetsContext)
