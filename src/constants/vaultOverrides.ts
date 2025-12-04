import { ChainId } from '@/constants/chains'
import { VaultExtended } from '@/types/vaultTypes'

export type VaultOverrideValues = Partial<
  Omit<VaultExtended, 'meta' | 'tvl' | 'apy'>
> & {
  meta?: Partial<VaultExtended['meta']>
  tvl?: Partial<VaultExtended['tvl']>
  apy?: Partial<VaultExtended['apy']>
}

export type VaultOverrideConfig = {
  address: string
  chainId: ChainId
  blacklist?: boolean
  blacklistReason?: string
  overrideReason?: string
  overrides?: VaultOverrideValues
}

export const buildVaultOverrideKey = (chainId: ChainId, address: string) =>
  `${chainId}-${address.toLowerCase()}`

export const VAULT_OVERRIDE_ENTRIES: VaultOverrideConfig[] = [
  {
    address: '0x58900d761Ae3765B75DDFc235c1536B527F25d8F', // Curve yETH Factory yVault
    chainId: 1,
    blacklist: false,
    blacklistReason:
      'One of the underlying constituents of the pool (yETH) was exploited.',
    overrideReason:
      "One of the underlying constituents of the pool (yETH) was exploited. TVL has been set to 0 to reflect the LP's true value.",
    overrides: {
      tvl: {
        close: 0,
      },
    },
  },
]

export const VAULT_OVERRIDES: Record<string, VaultOverrideConfig> =
  VAULT_OVERRIDE_ENTRIES.reduce(
    (acc, entry) => {
      const key = buildVaultOverrideKey(entry.chainId, entry.address)
      acc[key] = {
        ...entry,
        address: entry.address.toLowerCase(),
      }
      return acc
    },
    {} as Record<string, VaultOverrideConfig>
  )
