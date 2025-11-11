import { http, createConfig } from 'wagmi'
import {
  arbitrum,
  base,
  fantom,
  gnosis,
  mainnet,
  optimism,
  polygon,
  sepolia,
  katana,
  berachain,
} from 'wagmi/chains'

const chains = [
  mainnet,
  optimism,
  gnosis,
  polygon,
  fantom,
  base,
  arbitrum,
  sepolia,
  katana,
  berachain,
] as const

const getRpcUrl = (chainId: number): string | undefined => {
  const env = import.meta.env as Record<string, string | undefined>
  const value = env[`VITE_RPC_URI_FOR_${chainId}`]
  return value && value.trim().length > 0 ? value : undefined
}

const transports = chains.reduce(
  (acc, chain) => {
    const rpcUrl = getRpcUrl(chain.id)
    acc[chain.id] = rpcUrl ? http(rpcUrl) : http()
    return acc
  },
  {} as Record<(typeof chains)[number]['id'], ReturnType<typeof http>>
)

export const config = createConfig({
  chains,
  connectors: [],
  transports,
})

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}
