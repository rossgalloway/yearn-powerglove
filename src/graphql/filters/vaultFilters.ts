// src/graphql/filters/vaultFilters.ts
import type { Vault } from '@/types/vaultTypes'

export const filterYearnVaults = (vaults: Vault[]) =>
  vaults.filter(vault => vault.yearn)

export const filter4626Vaults = (vaults: Vault[]) =>
  vaults.filter(vault => vault.erc4626)

export const filterV3Vaults = (vaults: Vault[]) =>
  vaults.filter(vault => vault.v3)

export const filterYearnV3Vaults = (vaults: Vault[]) =>
  vaults.filter(vault => vault.yearn && vault.v3)

export const filterByChain = (vaults: Vault[], chainId: number) =>
  vaults.filter(vault => vault.chainId === chainId)
