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
  debts: VaultDebt[]
}

type VaultDebt = {
  strategy: string
  currentDebt: string
  currentDebtUsd: number
  maxDebt: string
  maxDebtUsd: number
  targetDebtRatio: string
  maxDebtRatio: string
}

export const GET_VAULT_DEBTS = gql`
  query VaultDebts($chainId: Int, $addresses: [String]) {
    vaults(chainId: $chainId, addresses: $addresses) {
      chainId
      address
      name
      debts {
        strategy
        currentDebt
        currentDebtUsd
        maxDebt
        maxDebtUsd
        targetDebtRatio
        maxDebtRatio
      }
    }
  }
`
