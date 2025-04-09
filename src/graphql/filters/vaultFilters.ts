// src/graphql/filters/vaultFilters.ts
import type { Vault } from '@/types/vaultTypes'

export const filterNoVaults = (vaults: Vault[]) => vaults

export const filterYearnVaults = (vaults: Vault[]) =>
  vaults.filter(vault => vault.yearn)

export const filter4626Vaults = (vaults: Vault[]) =>
  vaults.filter(vault => vault.erc4626)

export const filterV3Vaults = (vaults: Vault[]) =>
  vaults.filter(vault => vault.v3)

export const filterYearnV3Vaults = (vaults: Vault[]) =>
  vaults.filter(vault => vault.yearn && vault.v3)

export const filterNotYearnV3Vaults = (vaults: Vault[]) =>
  vaults.filter(vault => !vault.yearn && vault.v3)

export const filterYearnV3AllocatorVaults = (vaults: Vault[]) =>
  vaults.filter(
    vault => vault.yearn && vault.v3 && Number(vault.vaultType) === 1 // Ensure vaultType is a number before comparison
  )

export const filterByChain = (vaults: Vault[], chainId: number) =>
  vaults.filter(vault => vault.chainId === chainId)
