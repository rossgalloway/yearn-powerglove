import { useMemo } from 'react'
import type { VaultListData } from '@/components/vaults-list/VaultRow'
import { CHAIN_ID_TO_ICON, CHAIN_ID_TO_NAME } from '@/constants/chains'
import { formatCurrency, formatPercentFromDecimal } from '@/lib/formatters'
import type { TokenAsset } from '@/types/tokenAsset'
import type { Vault } from '@/types/vaultTypes'
import { getVaultDisplayType, resolveTokenIcon } from '@/utils/vaultDataUtils'

export function useVaultListData(vaults: Vault[], tokenAssets: TokenAsset[]): VaultListData[] {
  // Memoize the data transformation to avoid recalculation on every render
  return useMemo((): VaultListData[] => {
    return vaults.map((vault) => ({
      id: vault.address, // Use the vault's address as a unique ID
      name: vault.name,
      chain: `${CHAIN_ID_TO_NAME[vault.chainId]}`,
      chainIconUri: CHAIN_ID_TO_ICON[vault.chainId],
      token: vault.asset.symbol,
      tokenUri: resolveTokenIcon(vault.asset.address, vault.asset.symbol, tokenAssets),
      type: getVaultDisplayType(vault),
      APY: formatPercentFromDecimal(vault.apy?.monthlyNet ?? vault.apy?.net ?? null, { fallback: '0.00%' }), // Prefer 30-day APY when available
      tvl: formatCurrency(vault.tvl?.close ?? 0)
    }))
  }, [vaults, tokenAssets])
}
