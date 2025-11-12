import { useQuery } from '@tanstack/react-query'
import type { Address } from 'viem'
import type { ChainId } from '@/constants/chains'
import { getAprOracleAddress } from '@/constants/aprOracle'
import { fetchAprOracle } from '@/lib/apr-oracle'

export interface UseAprOracleParams {
  address?: Address
  chainId?: ChainId
  delta?: bigint
  enabled?: boolean
}

export const useAprOracle = ({
  address,
  chainId,
  delta = 0n,
  enabled = true,
}: UseAprOracleParams) => {
  const queryEnabled =
    !!enabled &&
    !!address &&
    chainId !== undefined &&
    !!getAprOracleAddress(chainId)

  const normalizedAddress = address?.toLowerCase()
  const deltaKey = delta?.toString() ?? '0'

  return useQuery({
    queryKey: ['apr-oracle', chainId, normalizedAddress, deltaKey],
    queryFn: () =>
      fetchAprOracle({
        vaultAddress: address as Address,
        chainId: chainId as ChainId,
        delta,
      }),
    staleTime: 60_000,
    enabled: queryEnabled,
  })
}
