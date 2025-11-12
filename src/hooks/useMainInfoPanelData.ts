import { useMemo } from 'react'
import { VaultExtended } from '@/types/vaultTypes'
import { TokenAsset } from '@/types/tokenAsset'
import { MainInfoPanelProps } from '@/types/dataTypes'
import {
  isLegacyVaultType,
  formatVaultDate,
  resolveTokenIcon,
  formatVaultTVL,
  formatVaultMetrics,
  generateVaultLinks,
  getVaultNetworkInfo,
} from '@/utils/vaultDataUtils'
import { formatPercentFromDecimal } from '@/lib/formatters'

interface UseMainInfoPanelDataProps {
  vaultDetails: VaultExtended | null
  tokenAssets: TokenAsset[]
}

/**
 * Transforms vault data into the format required by MainInfoPanel component
 * Extracted from the original hydrateMainInfoPanelData function
 */
export function useMainInfoPanelData({
  vaultDetails,
  tokenAssets,
}: UseMainInfoPanelDataProps): MainInfoPanelProps | null {
  return useMemo(() => {
    if (!vaultDetails) return null

    // Date formatting
    const deploymentDate = formatVaultDate(vaultDetails.inceptTime)

    const vaultName = vaultDetails.name
    const description = vaultDetails.meta?.description || ''
    const chainId = vaultDetails.chainId

    // Token icon resolution
    const vaultToken = {
      icon: resolveTokenIcon(
        vaultDetails.asset.address,
        vaultDetails.asset.symbol,
        tokenAssets
      ),
      name: vaultDetails.asset.symbol,
    }

    // Currency formatting
    const totalSupply = formatVaultTVL(vaultDetails.tvl?.close ?? 0)

    // Network information
    const network = getVaultNetworkInfo(chainId)

    // APY formatting
    const isLegacyVault = isLegacyVaultType(vaultDetails)
    const forwardApyNet = isLegacyVault
      ? null
      : vaultDetails?.forwardApyNet ?? vaultDetails?.apy?.net ?? null
    const oneDayAPY = isLegacyVault
      ? ' - '
      : formatPercentFromDecimal(forwardApyNet)
    const thirtyDayAPY = formatPercentFromDecimal(
      vaultDetails?.apy?.monthlyNet ?? vaultDetails?.apy?.inceptionNet
    )

    // Fee formatting
    const { managementFee, performanceFee } = formatVaultMetrics(vaultDetails)

    // Version and link generation
    const apiVersion = vaultDetails?.apiVersion || 'N/A'

    const { blockExplorerLink, yearnVaultLink } = generateVaultLinks(
      vaultDetails
    )

    return {
      vaultId: vaultDetails.symbol,
      deploymentDate,
      vaultName,
      description,
      vaultToken,
      totalSupply,
      network,
      oneDayAPY,
      thirtyDayAPY,
      managementFee,
      performanceFee,
      apiVersion,
      vaultAddress: vaultDetails.address,
      blockExplorerLink,
      yearnVaultLink,
    }
  }, [vaultDetails, tokenAssets])
}
