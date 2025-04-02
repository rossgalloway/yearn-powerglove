// src/graphql/queries/strategies.ts
import { gql } from '@apollo/client'

export type VaultStrategiesQuery = {
  chainId: number
  address: string
  name: string
  performanceFee: number
  symbol: string
  erc4626: boolean
  v3: boolean
  yearn: boolean
  apiVersion: string
  lastReport: number
  lastReportDetail: {
    apr: {
      net: number
      gross: number
    }
    profit: number
    loss: number
    lossUsd: number
    profitUsd: number
  }
}

// this query will get all the strategies for a vault
export const GET_VAULT_STRATEGIES = gql`
  query VaultStrategies($chainId: Int, $vault: String) {
    vaultStrategies(chainId: $chainId, vault: $vault) {
      chainId
      address
      name
      symbol
      performanceFee
      erc4626
      v3
      yearn
      apiVersion
      lastReport
      lastReportDetail {
        apr {
          net
          gross
        }
        profit
        loss
        lossUsd
        profitUsd
      }
    }
  }
`
// This gets all strategies that are registered
export const GET_STRATEGIES = gql`
  query Query {
    strategies {
      chainId
      address
      name
      symbol
      performanceFee
      erc4626
      v3
      yearn
    }
  }
`
/**
 * v3 vaults use the first 7 fields in the debts section
 * v2 vaults use the last 7 fields in the debts section
 */
export type VaultDebtsQuery = {
  chainId: number
  address: string
  name: string
  asset: {
    symbol: string
  }
  debts: {
    strategy: string
    currentDebt: string
    currentDebtUsd: number
    maxDebt: string
    maxDebtUsd: number
    targetDebtRatio: string
    maxDebtRatio: string
    DebtRatio: number
    totalDebt: number
    totalDebtUsd: number
    totalGain: number
    totalGainUsd: number
    totalLoss: number
    totalLossUsd: number
  }[]
  apy: {
    grossApr: number
    net: number
    inceptionNet: number
  }
  fees: {
    managementFee: number
    performanceFee: number
  }
  apiVersion: string
  erc4626: boolean
  v3: boolean
  yearn: boolean
}

export const GET_VAULT_DEBTS = gql`
  query VaultDebts($chainId: Int, $addresses: [String]) {
    vaults(chainId: $chainId, addresses: $addresses) {
      chainId
      address
      name
      asset {
        symbol
      }
      debts {
        strategy
        currentDebt
        currentDebtUsd
        maxDebt
        maxDebtUsd
        targetDebtRatio
        maxDebtRatio
        debtRatio
        totalDebt
        totalDebtUsd
        totalGain
        totalGainUsd
        totalLoss
        totalLossUsd
      }
      apy {
        grossApr
        net
        inceptionNet
      }
      fees {
        managementFee
        performanceFee
      }
      apiVersion
      erc4626
      v3
      yearn
    }
  }
`

export type StrategyDetailsQuery = {
  chainId: number
  address: string
  name: string
  asset: {
    symbol: string
  }
  apy: {
    grossApr: number
    net: number
    inceptionNet: number
  }
  fees: {
    managementFee: number
    performanceFee: number
  }
  apiVersion: string
  erc4626: boolean
  v3: boolean
  yearn: boolean
}

export const GET_STRATEGY_DETAILS = gql`
  query Vaults($addresses: [String]) {
    vaults(addresses: $addresses) {
      chainId
      address
      name
      asset {
        symbol
      }
      apy {
        grossApr
        net
        inceptionNet
      }
      fees {
        managementFee
        performanceFee
      }
      apiVersion
      erc4626
      v3
      yearn
    }
  }
`
