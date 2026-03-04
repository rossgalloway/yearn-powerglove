import { fetchKongJson, getKongVaultListUrl, getKongVaultSnapshotUrl } from '@/lib/kong-rest'
import { mapKongListItemToVault, mapKongSnapshotToVaultExtended } from '@/lib/kong-vault-derivation'
import type { KongVaultListItem, KongVaultSnapshot } from '@/types/kong'
import type { Vault, VaultExtended } from '@/types/vaultTypes'

export async function fetchKongVaultListRaw(): Promise<KongVaultListItem[]> {
  const url = getKongVaultListUrl()
  const payload = await fetchKongJson<unknown>(url)

  if (!Array.isArray(payload)) {
    return []
  }

  return payload as KongVaultListItem[]
}

export async function fetchKongVaultList(): Promise<Vault[]> {
  const list = await fetchKongVaultListRaw()
  return list.map(mapKongListItemToVault)
}

export async function fetchKongVaultSnapshotRaw(chainId: number, address: string): Promise<KongVaultSnapshot | null> {
  const url = getKongVaultSnapshotUrl(chainId, address)
  const payload = await fetchKongJson<KongVaultSnapshot>(url, { allow404: true })
  return payload ?? null
}

export async function fetchKongVaultSnapshot(
  chainId: number,
  address: string,
  baseVault?: VaultExtended | null
): Promise<VaultExtended | null> {
  const snapshot = await fetchKongVaultSnapshotRaw(chainId, address)
  if (!snapshot) {
    return baseVault ? { ...baseVault } : null
  }

  return mapKongSnapshotToVaultExtended(snapshot, baseVault)
}
