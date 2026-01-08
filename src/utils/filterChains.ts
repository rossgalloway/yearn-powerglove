// src/utils/filterChains.ts

import type { ChainId } from '@/constants/chains'
import type { Vault } from '@/types/vaultTypes'

export const getAvailableChains = (vaults: Vault[]): ChainId[] => {
  const chainIds = vaults.map((vault) => vault.chainId)
  return Array.from(new Set(chainIds)) as ChainId[]
}
