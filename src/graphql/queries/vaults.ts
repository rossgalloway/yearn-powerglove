// src/graphql/queries/vaults.ts
import { gql } from '@apollo/client'

export const GET_VAULTS_SIMPLE = gql`
  query GeVaultData {
    vaults {
      address
      symbol
      name
      chainId
      inceptTime
      asset {
        name
        symbol
        decimals
        address
      }
      apiVersion
      pricePerShare
      apy {
        grossApr
        net
        inceptionNet
      }
      tvl {
        close
      }
      vaultType
      yearn
      v3
      erc4626
      fees {
        managementFee
        performanceFee
      }
    }
  }
`

export const GET_VAULTS = gql`
  query GetVaultData {
    vaults {
      address
      symbol
      name
      chainId
      inceptTime
      asset {
        name
        symbol
        decimals
        address
      }
      apiVersion
      pricePerShare
      apy {
        grossApr
        net
        inceptionNet
      }
      tvl {
        blockTime
        close
        component
        label
      }
      vaultType
      yearn
      v3
      erc4626
      strategies
      debts {
        strategy
        currentDebt
        currentDebtUsd
      }
    }
  }
`

export const GET_VAULT_DETAILS = gql`
  query GetVaultData($address: String, $chainId: Int) {
    vault(address: $address, chainId: $chainId) {
      address
      name
      symbol
      chainId
      asset {
        name
        symbol
        decimals
        address
      }
      inceptTime
      pricePerShare
      tvl {
        close
      }
      apy {
        grossApr
        net
        inceptionNet
      }
      strategies
      debts {
        strategy
        currentDebt
        currentDebtUsd
      }
      apiVersion
      decimals
      erc4626
      fees {
        managementFee
        performanceFee
      }
      governance
      guardian
      management
      yearn
      v3
      vaultType
      allocator
      meta {
        description
        displayName
        displaySymbol
        protocols
        token {
          category
          description
          displayName
          displaySymbol
          icon
          type
        }
      }
    }
  }
`
