import { Address } from 'viem'

export const aprOracleAbi = [
  {
    type: 'function',
    inputs: [{ name: '_vault', internalType: 'address', type: 'address' }],
    name: 'getCurrentApr',
    outputs: [{ name: 'apr', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '_vault', internalType: 'address', type: 'address' },
      { name: '_delta', internalType: 'int256', type: 'int256' },
    ],
    name: 'getExpectedApr',
    outputs: [{ name: 'apr', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '_strategy', internalType: 'address', type: 'address' },
      { name: '_debtChange', internalType: 'int256', type: 'int256' },
    ],
    name: 'getStrategyApr',
    outputs: [{ name: 'apr', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '_vault', internalType: 'address', type: 'address' },
      { name: '_delta', internalType: 'int256', type: 'int256' },
    ],
    name: 'getWeightedAverageApr',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'governance',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'address', type: 'address' }],
    name: 'oracles',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '_strategy', internalType: 'address', type: 'address' },
      { name: '_oracle', internalType: 'address', type: 'address' },
    ],
    name: 'setOracle',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '_newGovernance', internalType: 'address', type: 'address' },
    ],
    name: 'transferGovernance',
    outputs: [],
    stateMutability: 'nonpayable',
  },
] as const

export const aprOracleAddress = {
  1: '0x1981AD9F44F2EA9aDd2dC4AD7D075c102C70aF92' as Address,
  10: '0x1981AD9F44F2EA9aDd2dC4AD7D075c102C70aF92' as Address,
  100: '0x1981AD9F44F2EA9aDd2dC4AD7D075c102C70aF92' as Address,
  137: '0x1981AD9F44F2EA9aDd2dC4AD7D075c102C70aF92' as Address,
  146: '0x1981AD9F44F2EA9aDd2dC4AD7D075c102C70aF92' as Address,
  250: '0x1981AD9F44F2EA9aDd2dC4AD7D075c102C70aF92' as Address,
  8453: '0x1981AD9F44F2EA9aDd2dC4AD7D075c102C70aF92' as Address,
  42161: '0x1981AD9F44F2EA9aDd2dC4AD7D075c102C70aF92' as Address,
  747474: '0x1981AD9F44F2EA9aDd2dC4AD7D075c102C70aF92' as Address,
} as const

export type SupportedAprOracleChainId = keyof typeof aprOracleAddress

export const getAprOracleAddress = (chainId?: number): Address | undefined => {
  if (chainId === undefined || chainId === null) {
    return undefined
  }
  return aprOracleAddress[chainId as SupportedAprOracleChainId]
}
