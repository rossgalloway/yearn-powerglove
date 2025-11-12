import { format } from 'date-fns'
import { Vault, VaultExtended } from '@/types/vaultTypes'
import { TokenAsset } from '@/types/tokenAsset'
import {
  CHAIN_ID_TO_ICON,
  CHAIN_ID_TO_NAME,
  CHAIN_ID_TO_BLOCK_EXPLORER,
  ChainId,
} from '@/constants/chains'
import { formatCurrency } from '@/lib/formatters'

/**
 * Formats vault APY and fee percentages
 */
export function formatVaultMetrics(vaultData: VaultExtended) {
  const estimatedAPY = vaultData?.apy?.net
    ? `${(vaultData.apy.net * 100).toFixed(2)}%`
    : '0%'

  const historicalAPY = vaultData?.apy?.inceptionNet
    ? `${(vaultData.apy.inceptionNet * 100).toFixed(2)}%`
    : '0%'

  const managementFee = vaultData?.fees?.managementFee
    ? `${(vaultData.fees.managementFee / 100).toFixed(0)}%`
    : '0%'

  const performanceFee = vaultData?.fees?.performanceFee
    ? `${(vaultData.fees.performanceFee / 100).toFixed(0)}%`
    : vaultData?.performanceFee
      ? `${(vaultData.performanceFee / 100).toFixed(0)}%`
      : '0%'

  return {
    estimatedAPY,
    historicalAPY,
    managementFee,
    performanceFee,
  }
}

/**
 * Generates block explorer and Yearn vault links
 */
export function generateVaultLinks(vaultData: VaultExtended) {
  const blockExplorerLink =
    vaultData?.chainId && vaultData?.address
      ? `${CHAIN_ID_TO_BLOCK_EXPLORER[vaultData.chainId]}/address/${vaultData.address}`
      : '#'

  const yearnVaultLink = vaultData?.apiVersion?.startsWith('3')
    ? `https://yearn.fi/v3/${vaultData.chainId}/${vaultData.address}`
    : vaultData?.chainId && vaultData?.address
      ? `https://yearn.fi/vaults/${vaultData.chainId}/${vaultData.address}`
      : '#'

  return {
    blockExplorerLink,
    yearnVaultLink,
  }
}

/**
 * Resolves token icon from token assets array
 */
export function resolveTokenIcon(
  vaultAssetAddress: string,
  vaultAssetSymbol: string,
  tokenAssets: TokenAsset[]
): string {
  const tokenAsset = tokenAssets.find(
    token => token.address.toLowerCase() === vaultAssetAddress.toLowerCase()
  )

  if (tokenAsset) {
    return tokenAsset.logoURI
  }

  return ''
}

/**
 * Formats vault deployment date
 */
export function formatVaultDate(inceptTime: string): string {
  return format(new Date(parseInt(inceptTime) * 1000), 'MMMM yyyy')
}

/**
 * Formats vault TVL as currency
 */
export function formatVaultTVL(tvlValue?: number): string {
  return formatCurrency(tvlValue ?? 0)
}

/**
 * Gets network information for vault
 */
export function getVaultNetworkInfo(chainId: ChainId) {
  return {
    icon: CHAIN_ID_TO_ICON[chainId],
    name: CHAIN_ID_TO_NAME[chainId],
  }
}

export function isLegacyVaultType(vault: {
  apiVersion?: string
  name?: string
}): boolean {
  const version = vault.apiVersion?.toLowerCase?.() ?? ''
  if (!version.startsWith('0')) {
    return false
  }
  const name = vault.name?.toLowerCase?.() ?? ''
  return !name.includes('factory')
}

export function getVaultDisplayType(
  vault: Pick<Vault, 'apiVersion' | 'name' | 'vaultType'>
): string {
  const apiVersion = vault.apiVersion ?? ''
  if (apiVersion.startsWith('3')) {
    const typeId = Number(vault.vaultType)
    if (typeId === 1) return 'V3 Allocator Vault'
    if (typeId === 2) return 'V3 Strategy Vault'
    return 'V3 Vault'
  }
  if (apiVersion.startsWith('0')) {
    const name = vault.name?.toLowerCase() ?? ''
    return name.includes('factory')
      ? 'V2 Factory Vault'
      : 'V2 Legacy Vault'
  }
  return 'External Vault'
}
