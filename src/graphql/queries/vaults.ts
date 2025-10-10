// src/graphql/queries/vaults.ts
import { gql } from '@apollo/client'

export const GET_VAULTS_SIMPLE = gql`
  query GetSimpleVaultData {
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
        weeklyNet
        monthlyNet
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
        weeklyNet
        monthlyNet
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
        weeklyNet
        monthlyNet
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
      managementFee
      performanceFee
      strategies
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
      decimals
      governance
      guardian
      management
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
