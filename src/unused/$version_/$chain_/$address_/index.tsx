import { MainInfoPanel } from '@/components/main-info-panel'
import { ChartsPanel } from '@/components/charts-panel'
import StrategiesPanel from '@/components/strategies-panel'

export default function VaultDashboard() {
  return (
    <main className="flex-1 container pt-0 pb-0">
      <div className="space-y-0">
        <MainInfoPanel
          vaultId="yvUSDC-1"
          deploymentDate="Deployment Date: May 2024"
          vaultName="Yearn USDC Prime"
          description="The USDC Prime vault aims to optimize for risk-adjusted yield across large market cap and high liquidity collateral markets."
          vaultToken={{
            icon: 'USDC',
            name: 'USDC',
          }}
          totalSupply="$82.7M"
          network={{
            icon: 'Ethereum',
            name: 'Ethereum',
          }}
          estimatedAPY="7.92%"
          historicalAPY="6.52%"
          managementFee="0%"
          performanceFee="10%"
          vaultAddress="0x8e...d458"
        />
        <ChartsPanel />
        <StrategiesPanel />
      </div>
    </main>
  )
}
