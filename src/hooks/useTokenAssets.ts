import { useEffect, useState } from 'react'
import type { TokenAsset } from '@/types/tokenAsset'

// Cache for token assets to avoid repeated fetches
let cachedAssets: TokenAsset[] | null = null
let cacheTimestamp: number | null = null
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes cache

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
        const res = await fetch('/tokenlists/yearn.tokenlist.json')
        if (!res.ok) throw new Error('Failed to fetch token assets')
        const data = await res.json()
        const rawAssetsData = data.tokens || []

        // Process and normalize token data
        const assetsData = rawAssetsData.map((token: TokenAsset) => ({
          ...token,
          address: token.address.toLowerCase(),
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
