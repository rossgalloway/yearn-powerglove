import { useEffect, useState } from 'react'
import type { TokenAsset } from '@/types/tokenAsset'

// Cache for token assets to avoid repeated fetches
let cachedAssets: TokenAsset[] | null = null
let cacheTimestamp: number | null = null
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes cache

/**
 * Transform logoURI to use direct GitHub URLs instead of API endpoints
 */
function transformLogoURI(
  logoURI: string | undefined,
  chainId: number,
  address: string
): string {
  // Return empty string if logoURI is undefined or null
  if (!logoURI) {
    return ''
  }

  // Normalize the entire URI to lowercase for consistency
  const normalizedLogoURI = logoURI.toLowerCase()
  const normalizedAddress = address.toLowerCase()

  // Transform assets.smold.app API URLs to direct GitHub URLs
  if (normalizedLogoURI.startsWith('https://assets.smold.app/api/token/')) {
    return `https://raw.githubusercontent.com/yearn/tokenassets/main/tokens/${chainId}/${normalizedAddress}/logo-128.png`
  }

  // Transform token-assets-one.vercel.app API URLs to direct GitHub URLs
  if (
    normalizedLogoURI.startsWith(
      'https://token-assets-one.vercel.app/api/token/'
    )
  ) {
    return `https://raw.githubusercontent.com/yearn/tokenassets/main/tokens/${chainId}/${normalizedAddress}/logo-128.png`
  }

  // Return the normalized (lowercased) URL if no transformation needed
  return normalizedLogoURI
}

export function useTokenAssets() {
  const [assets, setAssets] = useState<TokenAsset[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function fetchAssets() {
      // Check if we have valid cached data
      const now = Date.now()
      if (
        cachedAssets &&
        cacheTimestamp &&
        now - cacheTimestamp < CACHE_DURATION
      ) {
        setAssets(cachedAssets)
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)
      try {
        // Modified to fetch from local public directory for development
        const res = await fetch('/tokenlists/yearn.tokenlist.json')
        if (!res.ok) throw new Error('Failed to fetch token assets')
        const data = await res.json()
        const rawAssetsData = data.tokens || []

        // Process and normalize token data
        const assetsData = rawAssetsData.map((token: TokenAsset) => ({
          ...token,
          // Normalize address to lowercase
          address: token.address.toLowerCase(),
          // Transform logoURI to use direct GitHub URLs
          logoURI: transformLogoURI(
            token.logoURI,
            token.chainId,
            token.address
          ),
        }))

        // Update cache
        cachedAssets = assetsData
        cacheTimestamp = now

        setAssets(assetsData)
      } catch (e) {
        setError(e instanceof Error ? e : new Error('Unknown error'))
        // If we have cached data, use it as fallback
        if (cachedAssets) {
          setAssets(cachedAssets)
        }
      } finally {
        setLoading(false)
      }
    }
    fetchAssets()
  }, [])

  return { assets, loading, error }
}
