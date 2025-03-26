// src/graphql/queries/strategies.ts
import { gql } from '@apollo/client'

export type VaultStrategiesQuery = {
  chainId: number
  address: string
  name: string
  erc4626: boolean
  v3: boolean
  yearn: boolean
}

export const GET_VAULT_STRATEGIES = gql`
  query VaultStrategies($chainId: Int, $vault: String) {
    vaultStrategies(chainId: $chainId, vault: $vault) {
      chainId
      address
      name
      erc4626
      v3
      yearn
    }
  }
`

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
  address: string
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
}

export const GET_STRATEGY_DETAILS = gql`
  query Vaults($addresses: [String]) {
    vaults(addresses: $addresses) {
      address
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
    }
  }
`
