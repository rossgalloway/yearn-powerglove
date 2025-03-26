export type VaultSimple = {
  address: string
  symbol: string
  name: string
  chainId: number
  inceptTime: string
  asset: {
    name: string
    symbol: string
    decimals: number
    address: string
  }
  apiVersion: string
  pricePerShare: number
  apy: {
    grossApr: number
    net: number
    inceptionNet: number
  }
  tvl: {
    close: number
  }
  vaultType: string
  yearn: boolean
  v3: boolean
  erc4626: boolean
  fees: {
    managementFee: number
    performanceFee: number
  }
}

export type Vault = VaultSimple &
  Partial<{
    tvl: {
      blockTime: string
      close: number
      component: string
      label: string
    }
    strategies: string[]
    debts: {
      strategy: string
      currentDebt: string
      currentDebtUsd: number
    }
  }>

export type VaultExtended = VaultSimple &
  Vault &
  Partial<{
    decimals: number
    governance: string
    guardian: string
    management: string
    allocator: string
    meta: {
      description: string
      displayName: string
      displaySymbol: string
      protocols: string[]
      token: {
        category: string
        description: string
        displayName: string
        displaySymbol: string
        icon: string
        type: string
      }
    }
  }>

export type VaultDebt = {
  strategy: string
  currentDebt: string
  currentDebtUsd: number
  maxDebt: string
  maxDebtUsd: number
  targetDebtRatio: string
  maxDebtRatio: string
  address?: string
  name?: string
  erc4626?: boolean
  yearn?: boolean
  v3?: boolean
  managementFee?: number
  performanceFee?: number
  grossApr?: number
  netApy?: number
  inceptionNetApy?: number
}

export type VaultStrategy = {
  chainId: number
  address: string
  name: string
  erc4626?: boolean
  v3?: boolean
  yearn?: boolean
  currentDebt: string
  currentDebtUsd?: number
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
