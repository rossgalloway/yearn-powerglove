import { useEffect, useState } from 'react'
import type { TokenAsset } from '@/types/tokenAsset'

export function useTokenAssets() {
  const [assets, setAssets] = useState<TokenAsset[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function fetchAssets() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(
          'https://raw.githubusercontent.com/yearn/tokenLists/main/lists/smolAssets.json'
        )
        if (!res.ok) throw new Error('Failed to fetch token assets')
        const data = await res.json()
        setAssets(data.tokens || [])
      } catch (e) {
        setError(e instanceof Error ? e : new Error('Unknown error'))
      } finally {
        setLoading(false)
      }
    }
    fetchAssets()
  }, [])

  return { assets, loading, error }
}
