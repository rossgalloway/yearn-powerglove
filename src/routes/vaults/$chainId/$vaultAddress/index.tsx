import { createFileRoute } from '@tanstack/react-router'
import { MainInfoPanel } from '@/components/main-info-panel'
import React, { Suspense, lazy } from 'react'
// Lazy load ChartsPanel for code splitting (reduces initial bundle size)
const ChartsPanel = lazy(() =>
  import('@/components/charts/charts-panel').then(m => ({
    default: m.ChartsPanel,
  }))
)
import { StrategiesPanel } from '@/components/strategies-panel/index'
import { useTokenAssetsContext } from '@/contexts/useTokenAssets'

// Import our new data hooks and layout components
import { useVaultPageData } from '@/hooks/useVaultPageData'
import { useMainInfoPanelData } from '@/hooks/useMainInfoPanelData'
import { useChartData } from '@/hooks/useChartData'
import { VaultPageLayout, VaultPageBreadcrumb } from '@/components/vault-page'

function SingleVaultPage() {
  const { chainId, vaultAddress } = Route.useParams()
  const vaultChainId = Number(chainId)
  const { assets: tokenAssets } = useTokenAssetsContext()

  // Use our new data hooks
  const {
    vaultDetails,
    apyData,
    tvlData,
    ppsData,
    isInitialLoading,
    hasErrors,
    chartsLoading,
    chartsError,
  } = useVaultPageData({ vaultAddress, vaultChainId })

  // Transform main info panel data
  const mainInfoPanelData = useMainInfoPanelData({
    vaultDetails,
    tokenAssets,
  })

  // Process chart data
  const { transformedApyData, transformedTvlData, transformedAprData } =
    useChartData({
      apyData,
      tvlData,
      ppsData,
      isLoading: chartsLoading,
      hasErrors: chartsError,
    })

  // Ensure we have vault details and main info panel data
  if (!vaultDetails || !mainInfoPanelData) {
    return (
      <VaultPageLayout isLoading={true} hasErrors={false}>
        {null}
      </VaultPageLayout>
    )
  }

  return (
    <VaultPageLayout isLoading={isInitialLoading} hasErrors={hasErrors}>
      <VaultPageBreadcrumb vaultName={vaultDetails.name} />
      <div className="space-y-0">
        <MainInfoPanel {...mainInfoPanelData} />
        <Suspense fallback={null}>
          <ChartsPanel
            apyData={transformedApyData}
            tvlData={transformedTvlData}
            aprData={transformedAprData}
            isLoading={chartsLoading}
            hasErrors={chartsError}
          />
        </Suspense>
        <StrategiesPanel
          vaultAddress={vaultAddress}
          vaultChainId={vaultChainId}
          vaultDetails={vaultDetails}
        />
      </div>
    </VaultPageLayout>
  )
}

export const Route = createFileRoute('/vaults/$chainId/$vaultAddress/')({
  component: SingleVaultPage,
})
