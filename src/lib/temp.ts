import { Strategy, VaultDebtData } from '@/types/dataTypes'
import {
  DebtResult,
  VaultDebt,
  VaultExtended,
  VaultStrategy,
} from '@/types/vaultTypes'
import { VaultStrategiesQuery } from '../graphql/queries/strategies'

const prepareData = (
  strategyData:
    | {
        vaultStrategies: VaultStrategiesQuery[]
      }
    | undefined,
  debtsData: DebtResult | undefined
) => {
  const strategyDataClean = strategyData?.vaultStrategies
  console.log('strategyDataClean:', strategyDataClean)

  // Extract the "address" value from each element in the array
  const strategyAddresses =
    strategyData?.vaultStrategies.map(strategy => strategy.address) || []
  console.log('strategyAddresses:', strategyAddresses)

  const vaultDebts = extractDebts(debtsData)
  console.log('vaultDebts:', vaultDebts)
  const mergedStrategyInfo = mergeStrategiesAndDebts(
    strategyDataClean,
    vaultDebts
  )
  console.log('MergedStrategyDebts:', mergedStrategyInfo)
}

// Helper to extract the debts array from the debts query response.
const extractDebts = (data?: DebtResult): VaultDebt[] => {
  // If there are any vaults and the first vault has a debts array, return it.
  return Array.isArray(data?.vaults?.[0]?.debts)
    ? (data!.vaults![0].debts as VaultDebt[])
    : []
}

const mergeStrategiesAndDebts = (
  strategies: VaultStrategiesQuery[] | undefined,
  debts: VaultDebt[]
): VaultStrategy[] => {
  if (!strategies?.length) return []
  return strategies.map(strategy => {
    const debt = debts.find(d => d.strategy === strategy.address) // Matching strategy by address.
    return {
      ...strategy,
      currentDebt: debt?.currentDebt || '0', // Inline defaults if debt is not found.
      currentDebtUsd: debt?.currentDebtUsd || 0,
      maxDebt: debt?.maxDebt || '0',
      maxDebtUsd: debt?.maxDebtUsd || '0',
      targetDebtRatio: debt?.targetDebtRatio || '0',
      maxDebtRatio: debt?.maxDebtRatio || '0',
    }
  })
}

export function hydrateStrategiesPanelData(
  strategyData: VaultStrategy[],
  vaultDetails: VaultExtended
): Strategy[] {
  // Convert VaultStrategy to VaultDebtData using vaultDetails
  const enrichedDebts = strategyData.map((strategy: VaultStrategy) => {
    // Create the VaultDebtData object
    const extendedDebt: VaultDebtData = {
      address: strategy.address,
      name: strategy.name || '',
      chainId: strategy.chainId,
      currentDebt: strategy.currentDebt,
      currentDebtUsd: strategy.currentDebtUsd || 0,
      erc4626: strategy.erc4626 || false,
      yearn: strategy.yearn || false,
      apy: {
        ...vaultDetails.apy,
        InceptionNet: vaultDetails.apy.inceptionNet, // Map inceptionNet to InceptionNet
      }, // Use APY from vaultDetails
      fees: vaultDetails.fees, // Use fees from vaultDetails
    }

    return extendedDebt
  })
  console.log('enriched Debts:', enrichedDebts)

  // Sort the enriched debts by currentDebt (convert strings to numbers)
  const sortedDebts = enrichedDebts.sort(
    (a, b) => Number(b.currentDebt) - Number(a.currentDebt)
  )
  console.log('sortedDebts:', sortedDebts)

  // Sum currentDebtUsd values to get totalDebt
  const totalDebt = sortedDebts.reduce(
    (sum: number, debt: VaultDebtData) => sum + Number(debt.currentDebtUsd),
    0
  )
  console.log('totalDebt:', totalDebt)

  // Map each debt into the Strategy type
  const strategies = sortedDebts.map(
    (debt: VaultDebtData, index: number): Strategy => {
      const allocationPercent = totalDebt
        ? (Number(debt.currentDebtUsd) / totalDebt) * 100
        : 0

      return {
        id: index,
        name: debt.name || '',
        allocationPercent,
        allocationAmount: String(debt.currentDebtUsd),
        estimatedAPY: debt.apy
          ? `${(Number(debt.apy.net) * 100).toFixed(2)}%`
          : '0%',
        details: {
          chainId: debt.chainId || 0,
          vaultAddress: debt.address || '',
          managementFee: debt.fees
            ? `${(Number(debt.fees.managementFee) / 100).toFixed(0)}%`
            : '0%',
          performanceFee: debt.fees
            ? `${(Number(debt.fees.performanceFee) / 100).toFixed(0)}%`
            : '0%',
          isVault: !!debt.erc4626,
          isEndorsed: debt.yearn || false,
        },
      }
    }
  )

  return strategies
}
