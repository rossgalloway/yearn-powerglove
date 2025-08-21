import { useMemo } from 'react'
import { Vault } from '@/types/vaultTypes'
import { TokenAsset } from '@/types/tokenAsset'
import { CHAIN_ID_TO_ICON, CHAIN_ID_TO_NAME } from '@/constants/chains'
import { VaultListData } from '@/components/vaults-list/VaultRow'

export function useVaultListData(
  vaults: Vault[],
  tokenAssets: TokenAsset[]
): VaultListData[] {
  const vaultTypes = useMemo(
    (): Record<number, string> => ({
      1: 'Allocator Vault',
      2: 'Strategy Vault',
      3: 'Factory Vault',
      4: 'Legacy Vault',
      5: 'External Vault',
    }),
    []
  )

  // Memoize the data transformation to avoid recalculation on every render
  return useMemo((): VaultListData[] => {
    return vaults.map(vault => ({
      id: vault.address, // Use the vault's address as a unique ID
      name: vault.name,
      chain: `${CHAIN_ID_TO_NAME[Number(vault.chainId)]}`, // Convert chainId to a string
      chainIconUri: CHAIN_ID_TO_ICON[vault.chainId],
      token: vault.asset.symbol,
      tokenUri:
        tokenAssets.find(
          token =>
            token.address.toLowerCase() === vault.asset.address.toLowerCase()
        )?.logoURI || '',
      // Modified vault type logic per user request
      type: vault.apiVersion?.startsWith('3')
        ? `${vaultTypes[Number(vault.vaultType)]}`
        : vault.apiVersion?.startsWith('0')
          ? vault.name.includes('Factory')
            ? `${vaultTypes[3]}` // V2 Factory Vault
            : `${vaultTypes[4]}` // V2 Legacy Vault
          : `${vaultTypes[5]}`,
      APY: `${((vault.apy?.net ?? 0) * 100).toFixed(2)}%`, // Added nullish coalescing to handle undefined 'vault.apy'
      tvl: `$${vault.tvl?.close?.toLocaleString(undefined, {
        // Added optional chaining to handle undefined 'vault.tvl'
        minimumFractionDigits: 2, // modified to display 2 decimals
        maximumFractionDigits: 2,
      })}`,
    }))
  }, [vaults, tokenAssets, vaultTypes])
}
