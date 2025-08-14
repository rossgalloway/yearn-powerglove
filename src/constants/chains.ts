export type ChainId = 1 | 10 | 100 | 137 | 250 | 8453 | 42161 | 747474

export const CHAIN_ID_TO_NAME: Record<number, string> = {
  1: 'Ethereum',
  10: 'Optimism',
  100: 'GnosisChain',
  137: 'Polygon',
  250: 'Fantom',
  8453: 'Base',
  42161: 'Arbitrum',
  747474: 'Katana',
  80094: 'Berachain',
}

export function getChainIdByName(name: string): number | undefined {
  const entry = Object.entries(CHAIN_ID_TO_NAME).find(
    ([, chainName]) => chainName === name
  )
  return entry ? Number(entry[0]) : undefined
}

export const CHAIN_ID_TO_ICON: Record<number, string> = {
  1: 'https://raw.githubusercontent.com/yearn/tokenAssets/main/chains/1/logo-32.png',
  10: 'https://raw.githubusercontent.com/yearn/tokenAssets/main/chains/10/logo-32.png',
  100: 'https://raw.githubusercontent.com/yearn/tokenAssets/main/chains/100/logo-32.png',
  137: 'https://raw.githubusercontent.com/yearn/tokenAssets/main/chains/137/logo-32.png',
  250: 'https://raw.githubusercontent.com/yearn/tokenAssets/main/chains/250/logo-32.png',
  8453: 'https://raw.githubusercontent.com/yearn/tokenAssets/main/chains/8453/logo-32.png',
  42161:
    'https://raw.githubusercontent.com/yearn/tokenAssets/main/chains/42161/logo-32.png',
  747474:
    'https://raw.githubusercontent.com/yearn/tokenAssets/main/chains/747474/logo-32.png',
  80094:
    'https://raw.githubusercontent.com/yearn/tokenAssets/main/chains/80094/logo-32.png',
}

export const CHAIN_ID_TO_BLOCK_EXPLORER: Record<number, string> = {
  1: 'https://etherscan.io',
  10: 'https://optimistic.etherscan.io',
  100: 'https://gnosisscan.io/',
  137: 'https://polygonscan.com',
  250: 'https://ftmscan.com',
  8453: 'https://basescan.org/',
  42161: 'https://arbiscan.io',
  747474: 'https://explorer.katanarpc.com/',
  80094: 'https://berascan.com',
}

export const VAULT_TYPE_TO_NAME: Record<string, string> = {
  1: 'Allocator Vault',
  2: 'Strategy Vault',
}
