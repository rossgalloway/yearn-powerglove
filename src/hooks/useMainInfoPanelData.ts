import { useMemo } from 'react'
import { format } from 'date-fns'
import { VaultExtended } from '@/types/vaultTypes'
import { TokenAsset } from '@/types/tokenAsset'
import { MainInfoPanelProps } from '@/types/dataTypes'
import {
  CHAIN_ID_TO_ICON,
  CHAIN_ID_TO_NAME,
  CHAIN_ID_TO_BLOCK_EXPLORER,
} from '@/constants/chains'

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
    const deploymentDate = format(
      new Date(parseInt(vaultDetails.inceptTime) * 1000),
      'MMMM yyyy'
    )

    const vaultName = vaultDetails.name
    const description = vaultDetails.meta?.description || ''
    const chainId = vaultDetails.chainId

    // Token icon resolution
    const vaultToken = {
      icon:
        tokenAssets.find(token => {
          const isMatch =
            token.address.toLowerCase() ===
            vaultDetails.asset.address.toLowerCase()
          return isMatch
        })?.logoURI || '',
      name: vaultDetails.asset.symbol,
    }

    // Currency formatting
    const totalSupply = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 2,
    }).format(vaultDetails.tvl?.close ?? 0)

    // Network information
    const network = {
      icon: CHAIN_ID_TO_ICON[chainId],
      name: CHAIN_ID_TO_NAME[chainId],
    }

    // APY formatting
    const estimatedAPY = vaultDetails?.apy?.net
      ? `${(vaultDetails.apy.net * 100).toFixed(2)}%`
      : '0%'

    const historicalAPY = vaultDetails?.apy?.inceptionNet
      ? `${(vaultDetails.apy.inceptionNet * 100).toFixed(2)}%`
      : '0%'

    // Fee formatting
    const managementFee = vaultDetails?.fees?.managementFee
      ? `${(vaultDetails.fees.managementFee / 100).toFixed(0)}%`
      : '0%'

    const performanceFee = vaultDetails?.fees?.performanceFee
      ? `${(vaultDetails.fees.performanceFee / 100).toFixed(0)}%`
      : vaultDetails?.performanceFee
        ? `${(vaultDetails.performanceFee / 100).toFixed(0)}%`
        : '0%'

    // Version and link generation
    const apiVersion = vaultDetails?.apiVersion || 'N/A'

    const blockExplorerLink =
      vaultDetails?.chainId && vaultDetails?.address
        ? // Cast chainId to ChainId type to fix index signature error
          `${CHAIN_ID_TO_BLOCK_EXPLORER[chainId]}/address/${vaultDetails.address}`
        : '#'

    const yearnVaultLink = vaultDetails?.apiVersion?.startsWith('3')
      ? `https://yearn.fi/v3/${chainId}/${vaultDetails.address}`
      : vaultDetails?.chainId && vaultDetails?.address
        ? `https://yearn.fi/vaults/${chainId}/${vaultDetails.address}`
        : '#'

    return {
      vaultId: vaultDetails.symbol,
      deploymentDate,
      vaultName,
      description,
      vaultToken,
      totalSupply,
      network,
      estimatedAPY,
      historicalAPY,
      managementFee,
      performanceFee,
      apiVersion,
      vaultAddress: vaultDetails.address,
      blockExplorerLink,
      yearnVaultLink,
    }
  }, [vaultDetails, tokenAssets])
}
