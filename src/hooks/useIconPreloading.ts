import { useEffect } from 'react'
import { CHAIN_ID_TO_ICON, ChainId } from '@/constants/chains'

// Preload critical chain icons immediately
export const useIconPreloading = () => {
  useEffect(() => {
    // Get all chain icons (these are critical and limited in number)
    const chainIcons = Object.values(CHAIN_ID_TO_ICON)

    // Preload chain icons immediately with high priority
    chainIcons.forEach(iconUrl => {
      if (iconUrl) {
        const img = new Image()
        img.src = iconUrl
        // Store in browser cache - no need to track state
      }
    })

    // Also preload some common token icons if we have a known set
    // This could be expanded to preload top N most common tokens
  }, [])
}

// Hook to determine if an icon should be high priority
export const useIconPriority = (
  iconUrl?: string,
  tokenSymbol?: string,
  chainId?: ChainId
): 'high' | 'normal' | 'low' => {
  // Chain icons are always high priority (small set, frequently used)
  if (chainId && CHAIN_ID_TO_ICON[chainId] === iconUrl) {
    return 'high'
  }

  // Common tokens get normal priority
  const commonTokens = ['ETH', 'USDC', 'USDT', 'DAI', 'WETH', 'BTC', 'WBTC']
  if (tokenSymbol && commonTokens.includes(tokenSymbol.toUpperCase())) {
    return 'normal'
  }

  // Everything else is low priority
  return 'low'
}
