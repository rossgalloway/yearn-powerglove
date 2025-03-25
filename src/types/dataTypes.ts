export type MainInfoPanelProps = {
  vaultId: string
  deploymentDate: string
  vaultName: string
  vaultAddress: string
  description: string
  vaultToken: {
    icon: string
    name: string
  }
  totalSupply: string
  network: {
    icon: string
    name: string
  }
  estimatedAPY: string
  historicalAPY: string
  managementFee: string
  performanceFee: string
  apiVersion: string
  blockExplorerLink?: string
  yearnVaultLink?: string
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

export interface Timeseries {
  address: string
  chainId: number
  apy: TimeseriesDataPoint[]
  tvl: TimeseriesDataPoint[]
  pps: TimeseriesDataPoint[]
}

export type apyChartData = {
  date: string
  APY: number | null
  SMA15: number | null
  SMA30: number | null
}[]
export type tvlChartData = {
  date: string
  TVL: number | null
}[]
export type ppsChartData = {
  date: string
  PPS: number | null
}[]

type StrategyDetails = {
  chainId: number
  vaultAddress: string
  managementFee: string
  performanceFee: string
  isVault: boolean
  isEndorsed?: boolean
}

// Define the type for strategy data
export type Strategy = {
  id: number
  name: string
  allocationPercent: number
  allocationAmount: string
  estimatedAPY: string
  details: StrategyDetails
}

export type VaultDebtData = {
  address: string
  currentDebt: string
  currentDebtUsd: number
  chainId?: number
  name?: string
  erc4626?: boolean
  v3?: boolean
  yearn?: boolean
  apy?: {
    net: number
    InceptionNet: number
    grossApr: number
  }
  fees?: {
    managementFee: number
    performanceFee: number
  }
  assetIcon?: string
}
