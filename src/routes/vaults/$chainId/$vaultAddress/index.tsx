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
  const {
    transformedAprApyData,
    transformedTvlData,
    transformedPpsData,
  } = useChartData({
    apyData,
    tvlData,
    ppsData,
    isLoading: chartsLoading,
    hasErrors: chartsError,
  })

  const latestDerivedApy = React.useMemo(() => {
    if (!transformedAprApyData) return null
    for (let i = transformedAprApyData.length - 1; i >= 0; i--) {
      const point = transformedAprApyData[i]
      if (point?.derivedApy !== null && point?.derivedApy !== undefined) {
        return point.derivedApy
      }
    }
    return null
  }, [transformedAprApyData])

  const latestThirtyDayApy = React.useMemo(() => {
    if (!transformedAprApyData) return null
    for (let i = transformedAprApyData.length - 1; i >= 0; i--) {
      const point = transformedAprApyData[i]
      if (point?.thirtyDayApy !== null && point?.thirtyDayApy !== undefined) {
        return point.thirtyDayApy
      }
    }
    return null
  }, [transformedAprApyData])

  const formatPercent = React.useCallback((value: number | null) => {
    if (value === null || value === undefined) {
      return ' - '
    }
    return `${value.toFixed(2)}%`
  }, [])

  const mainInfoPanelProps = React.useMemo(() => {
    if (!mainInfoPanelData) return null
    const derivedApyFormatted = formatPercent(latestDerivedApy)
    const thirtyDayFormatted =
      formatPercent(latestThirtyDayApy) ?? mainInfoPanelData.thirtyDayAPY

    return {
      ...mainInfoPanelData,
      oneDayAPY: derivedApyFormatted,
      thirtyDayAPY: thirtyDayFormatted,
    }
  }, [
    mainInfoPanelData,
    formatPercent,
    latestDerivedApy,
    latestThirtyDayApy,
  ])

  // Ensure we have vault details and main info panel data
  if (!vaultDetails || !mainInfoPanelProps) {
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
        <MainInfoPanel {...mainInfoPanelProps} />
        <Suspense fallback={null}>
          <ChartsPanel
            aprApyData={transformedAprApyData}
            tvlData={transformedTvlData}
            ppsData={transformedPpsData}
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
