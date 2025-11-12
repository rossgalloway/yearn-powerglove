import { readContracts } from '@wagmi/core'
import { Address } from 'viem'
import type { ChainId } from '@/constants/chains'
import { aprOracleAbi, getAprOracleAddress } from '@/constants/aprOracle'
import { formatPercentNullable } from '@/lib/formatters'
import { config } from '@/wagmi'

const APR_PERCENT_SCALE = 1e16

type OracleFunctionName = 'getStrategyApr' | 'getExpectedApr'

type WagmiChainId = (typeof config)['chains'][number]['id']

type OracleContractCall = {
  address: Address
  chainId: WagmiChainId
  abi: typeof aprOracleAbi
  args: readonly [Address, bigint]
  functionName: OracleFunctionName
}

type ContractResult = {
  result?: unknown
  status: 'success' | 'failure'
  error?: Error
}

export type AprValue = {
  raw: bigint | null
  percent: number | null
  formatted: string | null
}

export interface AprOracleResponse {
  current: AprValue
  projected: AprValue
  percentChange: string | null
  delta: bigint
}

export interface FetchAprOracleParams {
  vaultAddress: Address
  chainId: ChainId
  delta?: bigint
}

export interface StrategyAprRequest {
  address: Address
  chainId: ChainId
}

export type StrategyAprMap = Record<string, AprValue>

const formatAprValue = (raw: bigint | null): AprValue => {
  if (raw === null || raw === undefined) {
    return {
      raw: null,
      percent: null,
      formatted: null,
    }
  }

  const percent = Number(raw) / APR_PERCENT_SCALE
  return {
    raw,
    percent,
    formatted: formatPercentNullable(percent),
  }
}

const calculatePercentChange = (current: AprValue, projected: AprValue): string | null => {
  if (
    current.percent === null ||
    projected.percent === null ||
    current.percent === 0
  ) {
    return null
  }

  const change = ((projected.percent - current.percent) / current.percent) * 100
  const sign = change > 0 ? '+' : ''
  return `${sign}${change.toFixed(2)}%`
}

const executeWithFallback = async (
  contracts: OracleContractCall[]
): Promise<ContractResult[]> => {
  if (!contracts.length) {
    return []
  }

  const initialResults = (await readContracts(config, {
    contracts,
  })) as ContractResult[]

  const failed = initialResults
    .map((result, index) => ({ result, index }))
    .filter(({ result }) => result.status === 'failure')

  if (!failed.length) {
    return initialResults
  }

  const fallbackContracts: OracleContractCall[] = failed.map(({ index }) => ({
    ...contracts[index],
    functionName: 'getExpectedApr',
  }))

  const fallbackResults = (await readContracts(config, {
    contracts: fallbackContracts,
  })) as ContractResult[]

  failed.forEach(({ index }, fallbackIndex) => {
    if (fallbackResults[fallbackIndex]?.status === 'success') {
      initialResults[index] = fallbackResults[fallbackIndex]
    }
  })

  return initialResults
}

export const fetchAprOracle = async ({
  vaultAddress,
  chainId,
  delta = 0n,
}: FetchAprOracleParams): Promise<AprOracleResponse> => {
  const oracleAddress = getAprOracleAddress(chainId)
  if (!oracleAddress) {
    throw new Error(`APR oracle not available on chain ${chainId}`)
  }

  const contracts: OracleContractCall[] = [
    {
      address: oracleAddress,
      abi: aprOracleAbi,
      functionName: 'getStrategyApr',
      args: [vaultAddress, 0n],
      chainId: chainId as WagmiChainId,
    },
    {
      address: oracleAddress,
      abi: aprOracleAbi,
      functionName: 'getStrategyApr',
      args: [vaultAddress, delta],
      chainId: chainId as WagmiChainId,
    },
  ]

  const [currentResult, projectedResult] = await executeWithFallback(contracts)

  const current =
    currentResult?.status === 'success'
      ? formatAprValue(currentResult.result as bigint)
      : formatAprValue(null)
  const projected =
    projectedResult?.status === 'success'
      ? formatAprValue(projectedResult.result as bigint)
      : formatAprValue(null)

  return {
    current,
    projected,
    percentChange: calculatePercentChange(current, projected),
    delta,
  }
}

type PreparedStrategyApr = {
  request: StrategyAprRequest
  contract: OracleContractCall
}

export const fetchStrategyAprs = async (
  requests: StrategyAprRequest[]
): Promise<StrategyAprMap> => {
  if (!requests.length) {
    return {}
  }

  const prepared: PreparedStrategyApr[] = []

  for (const request of requests) {
    const oracleAddress = getAprOracleAddress(request.chainId)
    if (!oracleAddress) {
      continue
    }
    prepared.push({
      request,
      contract: {
        address: oracleAddress,
        abi: aprOracleAbi,
        functionName: 'getStrategyApr',
        args: [request.address, 0n],
        chainId: request.chainId as WagmiChainId,
      },
    })
  }

  if (!prepared.length) {
    return {}
  }

  const results = await executeWithFallback(
    prepared.map(entry => entry.contract)
  )

  return prepared.reduce<StrategyAprMap>((acc, entry, index) => {
    const contractResult = results[index]
    const formatted =
      contractResult?.status === 'success'
        ? formatAprValue(contractResult.result as bigint)
        : formatAprValue(null)
    acc[entry.request.address.toLowerCase()] = formatted
    return acc
  }, {})
}
