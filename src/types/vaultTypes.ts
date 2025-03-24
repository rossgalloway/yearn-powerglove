export type ChainId = number

export type Vault = {
  yearn: boolean
  v3: boolean
  name: string
  chainId: ChainId
  address: string
  asset: {
    name: string
    symbol: string
    decimals: Number
    address: string
  }
  apiVersion: string
  tvl: {
    blockTime: string
    close: number
    component: string
    label: string
  }
  pricePerShare: number
  meta: {
    displayName: string
    displaySymbol: string
    description: string
    protocols: string
    token: {
      category: string
      description: string
      displayName: string
      displaySymbol: string
      icon: string
      type: string
    }
  }
  vaultType: string
  apy: {
    weeklyNet: number
  }
  debts: {
    strategy: string
    currentDebt: string
    maxDebt: string
    maxDebtUsd: number
    debtRatio: number
    targetDebtRatio: number
    maxDebtRatio: number
  }
}

export type VaultDebt = {
  strategy: string
  currentDebt: string
  maxDebt: string
  maxDebtUsd?: string
  targetDebtRatio?: string
  maxDebtRatio?: string
}

export type VaultStrategy = {
  chainId: ChainId
  address: string
  name: string
  erc4626?: string
  v3?: string
  yearn?: string
  currentDebt: string
  maxDebt: string
  maxDebtUsd?: string
  targetDebtRatio?: string
  maxDebtRatio?: string
}

export type DebtResult = {
  vaults: Vault[]
}

export interface TimeseriesDataPoint {
  address?: string
  chainId?: number
  label: string
  component?: string // Optional, as it's not present in TVL data points
  period: string
  time: string
  value: number | null
}

export interface strategy {
  address: string
  name?: string | null
  apr?: number | null
}

export interface Timeseries {
  address: string
  chainId: number
  apy: TimeseriesDataPoint[]
  tvl: TimeseriesDataPoint[]
  pps: TimeseriesDataPoint[]
}

export type TimePeriod = '7d' | '30d' | '90d' | '180d' | '1y' | 'all'
