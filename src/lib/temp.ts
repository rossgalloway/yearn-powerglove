import { Strategy } from '@/types/dataTypes'
import usdc1VaultData from '@/data/usdc1VaultData.json'
import usdc1StrategyData from '@/data/usdc1StrategyData.json'
import allVaultsData from '@/data/allVaultsData.json'

// Hydrate strategies data for the Strategies Panel
export function hydrateStrategiesPanelData(): Strategy[] {
  // const vaultDebts = strategyData.debts || []
  // const enrichedDebts = vaultDebts.map((debt: any) => {

  const vaultDebts = usdc1VaultData.data.vault.debts || []
  // Enrich each debt with matching strategy info from usdc1StrategyData.json
  const enrichedDebts = vaultDebts.map((debt: any) => {
    // Match by comparing the 'strategy' field
    const matchingStrategy = usdc1StrategyData.find(
      (item: any) =>
        item.address.toLowerCase() === (debt.strategy || '').toLowerCase()
    )
    let extendedDebt = { ...debt }
    if (matchingStrategy) {
      extendedDebt = {
        ...extendedDebt,
        chainId: matchingStrategy.chainId,
        name: matchingStrategy.name,
        erc4626: matchingStrategy.erc4626,
        v3: matchingStrategy.v3,
        yearn: matchingStrategy.yearn,
      }
    }
    // For entries where erc4626 == true, enrich with apy and fees from allVaultsData.json
    if (extendedDebt.erc4626) {
      const matchingVault = allVaultsData.data.vaults.find(
        (v: any) =>
          v.address.toLowerCase() === (debt.strategy || '').toLowerCase()
      )
      if (matchingVault) {
        extendedDebt = {
          ...extendedDebt,
          apy: matchingVault.apy,
          fees: matchingVault.fees,
        }
      }
    }
    return extendedDebt
  })

  // Sort the enriched debts by currentDebt (convert strings to numbers)
  const sortedDebts = enrichedDebts.sort(
    (a, b) => Number(a.currentDebt) - Number(b.currentDebt)
  )

  // Sum currentDebtUsd values to get totalDebt
  const totalDebt = sortedDebts.reduce(
    (sum: number, debt: any) => sum + Number(debt.currentDebtUsd),
    0
  )

  // Map each debt into the Strategy type
  const strategies = sortedDebts.map((debt: any, index: number): Strategy => {
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
        chainId: debt.chainId, // using chainId from enriched data
        vaultAddress: debt.strategy || '', // rename vaultAddress to strategyAddress
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
  })

  return strategies
}
