import { useNavigate } from '@tanstack/react-router'
import { useQuery } from '@apollo/client'
import { useQueryStrategies } from '@/contexts/useQueryStrategies'
import {
  GET_STRATEGY_DETAILS,
  GET_VAULT_STRATEGIES,
  StrategyDetailsQuery,
  VaultStrategiesQuery,
} from '@/graphql/queries/strategies'
import { VaultDebt, VaultExtended } from '@/types/vaultTypes'

export default function StrategiesPanel({
  props,
}: {
  props: {
    vaultChainId: number
    vaultAddress: string
    vaultDetails: VaultExtended
  } // Added the missing closing curly brace
}) {
  console.log('welcome to the strategies panel')
  const navigate = useNavigate()
  // Destructure chainId and address from props
  const { vaultChainId, vaultAddress } = props
  const selectedVaultDetails = props.vaultDetails
  console.log('vault Details:', selectedVaultDetails)
  const vaultStrategyAddresses = props.vaultDetails.strategies
  console.log('vaultStrategyAddresses:', vaultStrategyAddresses)
  const allStrategies = useQueryStrategies()

  // Fetches data bout the component strategies of the current vault
  // if the strategies are vaults (v3) then this gets me chainId, address, name, erc4626, v3, yearn
  // all strategies that the current vault uses.
  // if not vaults then it returns undefined
  const {
    data: strategyData,
    loading: strategyLoading,
    error: strategyError,
  } = useQuery<{ vaults: StrategyDetailsQuery[] }>(GET_STRATEGY_DETAILS, {
    variables: { addresses: vaultStrategyAddresses },
  })
  const v3StrategyData = strategyData?.vaults
  console.log('strategyData:', v3StrategyData)

  // Get the array of strategy debts from the passed in vault data object (V2 and V3)
  const selectedVaultDebts: VaultDebt[] = Array.isArray(
    props.vaultDetails?.debts
  )
    ? (props.vaultDetails.debts as VaultDebt[])
    : [] // Ensure debts is treated as an array
  console.log('selectedVaultDebts:', selectedVaultDebts)

  const vaultStrategyData = selectedVaultDebts.map(debt => {
    // use v3StrategyData to find the matching strategy
    if (selectedVaultDetails.v3) {
      // Find the matching strategy in the remaining strategies array
      const matchingStrategy: StrategyDetailsQuery =
        (v3StrategyData ?? []).find(
          strategy => strategy.address === debt.strategy
        ) || ({} as StrategyDetailsQuery)
      console.log('matchingStrategy:', matchingStrategy)
      return {
        ...debt,
        address: debt.strategy, // Rename `strategy` to `address`
        name: matchingStrategy?.name || '',
        erc4626: matchingStrategy?.erc4626 || false,
        yearn: matchingStrategy?.yearn || false,
        v3: matchingStrategy?.v3 || false,
        managementFee: matchingStrategy?.fees?.managementFee || 0,
        performanceFee: matchingStrategy?.fees?.performanceFee || 0,
        grossApr: matchingStrategy?.apy?.grossApr,
        netApy: matchingStrategy?.apy?.net,
        inceptionNetApy: matchingStrategy?.apy?.inceptionNet,
        assetSymbol: matchingStrategy?.asset?.symbol,
      }
    } else {
      // Find the matching strategy in the remaining strategies array
      const matchingStrategy: VaultStrategiesQuery =
        allStrategies.strategies.find(
          strategy => strategy.address === debt.strategy
        ) || ({} as VaultStrategiesQuery) // Provide a fallback empty object
      console.log('matchingStrategy:', matchingStrategy)
      return {
        ...debt,
        address: debt.strategy, // Rename `strategy` to `address`
        name: matchingStrategy?.name || '',
        erc4626: matchingStrategy?.erc4626 || false,
        yearn: matchingStrategy?.yearn || false,
        v3: matchingStrategy?.v3 || false,
        managementFee: 0,
        performanceFee: matchingStrategy?.performanceFee || 0,
        grossApr: matchingStrategy?.lastReportDetail?.apr.gross,
        netApy: matchingStrategy?.lastReportDetail?.apr.net,
        inceptionNetApy: null,
        assetSymbol: selectedVaultDetails?.asset.symbol,
      }
    }
  })

  console.log('enrichedVaultDebts:', vaultStrategyData)
  // Sort the enriched debts by currentDebt (convert strings to numbers)
  // const sortedVaultDebts = vaultStrategyData.sort(
  //   (a, b) => Number(b.v3Debt.currentDebt) - Number(a.v3Debt.currentDebt)
  // )
  // console.log('sortedDebts:', sortedVaultDebts)

  // // Sum currentDebtUsd values to get totalDebt
  // const totalVaultDebt = sortedVaultDebts.reduce(
  //   (sum: number, debt: VaultDebt) => sum + Number(debt.v3Debt.currentDebtUsd),
  //   0
  // )
  // console.log('totalDebt:', totalVaultDebt)

  // // Map enrichedVaultDebts to Strategy objects
  // const strategies: Strategy[] = vaultStrategyData.map((debt, index) => ({
  //   id: index, // Use the index as the ID (or replace with a unique identifier if available)
  //   name: debt.name || 'Unknown Strategy', // Use the name from enrichedVaultDebts or a default value
  //   allocationPercent: totalVaultDebt
  //     ? (Number(debt.v3Debt.currentDebtUsd) / totalVaultDebt) * 100
  //     : 0,
  //   allocationAmount: debt.v3Debt.currentDebtUsd
  //     ? debt.v3Debt.currentDebtUsd.toLocaleString('en-US', {
  //         style: 'currency',
  //         currency: 'USD',
  //       })
  //     : '$0.00', // Format currentDebtUsd as a currency string
  //   estimatedAPY: debt.netApy
  //     ? `${(Number(debt.netApy) * 100).toFixed(2)}%`
  //     : '0.00%', // Format maxDebtRatio as a percentage string
  //   tokenSymbol: debt.assetSymbol || '', // Use the asset symbol from enrichedVaultDebts or a default value
  //   tokenIconUri:
  //     smolAssets.tokens.find(token => token.symbol === debt.assetSymbol)
  //       ?.logoURI || '',
  //   details: {
  //     chainId: vaultChainId, // Use the chainId from props
  //     vaultAddress: debt.address ? debt.address : '', // Use the vaultAddress from props
  //     managementFee: debt.managementFee || 0, // Use managementFee or a default value
  //     performanceFee: debt.performanceFee || 0, // Use performanceFee or a default value
  //     isVault: true, // Assume it's a vault (adjust if needed)
  //     isEndorsed: debt.yearn || false, // Use the yearn field to determine endorsement
  //   },
  // }))

  // console.log('strategies:', strategies)

  return (
    <div className="w-full">
      <div className="w-full mx-auto bg-white border-x border-b-0 border-border"></div>
    </div>
  )
}
