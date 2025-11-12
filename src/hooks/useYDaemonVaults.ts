import { useQuery } from '@tanstack/react-query'
import type { ChainId } from '@/constants/chains'
import {
  fetchYDaemonVault,
  fetchYDaemonVaults,
} from '@/lib/ydaemon-client'

export const useYDaemonVaults = (chainIds?: number[]) => {
  return useQuery({
    queryKey: ['ydaemon', 'vaults', chainIds?.join(',') ?? 'all'],
    queryFn: () => fetchYDaemonVaults(chainIds),
    staleTime: 60_000,
  })
}

export const useYDaemonVault = (chainId?: ChainId, address?: string) => {
  return useQuery({
    queryKey: ['ydaemon', 'vault', chainId, address?.toLowerCase()],
    queryFn: () => fetchYDaemonVault(chainId!, address!),
    staleTime: 60_000,
    enabled: Boolean(chainId && address),
  })
}
