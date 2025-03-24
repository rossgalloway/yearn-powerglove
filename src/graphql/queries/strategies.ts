// src/graphql/queries/strategies.ts
import { gql } from '@apollo/client'

export const GET_VAULT_STRATEGIES = gql`
  query Query($chainId: Int, $vault: String) {
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

export const GET_VAULT_DEBTS = gql`
  query Query($chainId: Int, $addresses: [String]) {
    vaults(chainId: $chainId, addresses: $addresses) {
      chainId
      address
      name
      debts {
        strategy
        currentDebt
        maxDebt
        maxDebtUsd
        targetDebtRatio
        maxDebtRatio
      }
    }
  }
`
