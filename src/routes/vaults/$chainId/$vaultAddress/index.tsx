import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@apollo/client'
import { GET_VAULT_DETAILS } from '@/graphql/queries/vaults'
import { queryAPY, queryPPS, queryTVL } from '@/graphql/queries/timeseries'
import { MainInfoPanel } from '@/components/main-info-panel'
import React, { Suspense, lazy } from 'react'
// Lazy load ChartsPanel for code splitting (reduces initial bundle size)
const ChartsPanel = lazy(() =>
  import('@/components/charts-panel').then(m => ({ default: m.ChartsPanel }))
)
import { StrategiesPanel } from '@/components/strategies-panel/index'
import { format } from 'date-fns'
import {
  CHAIN_ID_TO_ICON,
  CHAIN_ID_TO_NAME,
  CHAIN_ID_TO_BLOCK_EXPLORER,
} from '@/constants/chains'
import { VaultExtended } from '@/types/vaultTypes'
import {
  MainInfoPanelProps,
  TimeseriesDataPoint,
  apyChartData,
  tvlChartData,
  ppsChartData,
} from '@/types/dataTypes'
import {
  calculateSMA,
  fillMissingDailyData,
  formatUnixTimestamp,
  getEarliestAndLatestTimestamps,
} from '@/lib/utils'
import YearnLoader from '@/components/YearnLoader'
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb'
import { useTokenAssetsContext } from '@/contexts/useTokenAssets'
import { TokenAsset } from '@/types/tokenAsset'

function SingleVaultPage() {
  const { chainId, vaultAddress } = Route.useParams()
  const vaultChainId = Number(chainId)
  const { assets: tokenAssets } = useTokenAssetsContext()
  // Fetch vault details
  const {
    data: vaultData,
    loading: vaultLoading,
    error: vaultError,
  } = useQuery<{ vault: VaultExtended }>(GET_VAULT_DETAILS, {
    variables: { address: vaultAddress, chainId: vaultChainId },
  })

  // Fetch APY data
  const {
    data: apyData,
    loading: apyLoading,
    error: apyError,
  } = useQuery(queryAPY, {
    variables: {
      chainId: vaultChainId,
      address: vaultAddress,
      label: 'apy-bwd-delta-pps',
      component: 'net',
      limit: 1000,
    },
  })

  // Fetch TVL data
  const {
    data: tvlData,
    loading: tvlLoading,
    error: tvlError,
  } = useQuery(queryTVL, {
    variables: {
      chainId: vaultChainId,
      address: vaultAddress,
      label: 'tvl',
      limit: 1000,
    },
  })

  // Fetch PPS data
  const {
    data: ppsData,
    loading: ppsLoading,
    error: ppsError,
  } = useQuery(queryPPS, {
    variables: {
      address: vaultAddress,
      label: 'pps',
      component: 'humanized',
      limit: 1000,
    },
  })

  // Handle loading states - only wait for vault data
  if (vaultLoading) {
    return (
      <div className="min-h-screen px-0 py-0 max-w-[1400px] mx-auto w-full">
        <YearnLoader loadingState="loading selected vault" />
      </div>
    )
  }

  // Handle vault error
  if (vaultError) {
    return <div>Error fetching vault data</div>
  }

  // Extract vault data
  const vaultDetails: VaultExtended =
    vaultData?.vault ??
    (() => {
      throw new Error('Vault data is undefined')
    })() // Ensure vaultData?.vault is not undefined
  const mainInfoPanelData = hydrateMainInfoPanelData(vaultDetails, tokenAssets)

  // Process chart data only if all chart data is loaded
  let transformedApyData: apyChartData | null = null
  let transformedTvlData: tvlChartData | null = null
  let transformedPpsData: ppsChartData | null = null

  if (
    !apyLoading &&
    !tvlLoading &&
    !ppsLoading &&
    !apyError &&
    !tvlError &&
    !ppsError
  ) {
    const apyDataClean = apyData.timeseries || {}
    const tvlDataClean = tvlData.timeseries || {}
    const ppsDataClean = ppsData.timeseries || {}
    const chartData = processChartData(apyDataClean, tvlDataClean, ppsDataClean)
    transformedApyData = chartData.transformedApyData
    transformedTvlData = chartData.transformedTvlData
    transformedPpsData = chartData.transformedPpsData
  }

  return (
    <main className="flex-1 container pt-0 pb-0 h-full overflow-y-auto">
      <div className="px-6 pt-2 border border-border bg-white border-b-0 border-t-0">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/">Vaults</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{vaultDetails.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <div className="space-y-0">
        <MainInfoPanel {...mainInfoPanelData} />
        <Suspense fallback={null}>
          <ChartsPanel
            apyData={transformedApyData}
            tvlData={transformedTvlData}
            ppsData={transformedPpsData}
            isLoading={apyLoading || tvlLoading || ppsLoading}
            hasErrors={!!apyError || !!tvlError || !!ppsError}
          />
        </Suspense>
        <StrategiesPanel
          vaultAddress={vaultAddress}
          vaultChainId={vaultChainId}
          vaultDetails={vaultDetails}
        />
      </div>
    </main>
  )
}

export const Route = createFileRoute('/vaults/$chainId/$vaultAddress/')({
  component: SingleVaultPage,
})

function hydrateMainInfoPanelData(
  vaultData: VaultExtended,
  tokenAssets: TokenAsset[]
): MainInfoPanelProps {
  const deploymentDate = format(
    new Date(parseInt(vaultData.inceptTime) * 1000),
    'MMMM yyyy'
  )
  const vaultName = vaultData.name
  const description = vaultData.meta?.description || ''

  const vaultToken = {
    icon:
      tokenAssets.find(token => {
        const isMatch =
          token.address.toLowerCase() === vaultData.asset.address.toLowerCase()
        // Only log when there's a match
        if (isMatch) {
          console.log('✅ Token match found:', {
            tokenSymbol: token.symbol,
            vaultAssetSymbol: vaultData.asset.symbol,
            logoURI: token.logoURI,
          })
        }
        return isMatch
      })?.logoURI || '',
    name: vaultData.asset.symbol,
  }

  const totalSupply = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(vaultData.tvl?.close ?? 0) // Added nullish coalescing operator to handle undefined 'tvl'

  const network = {
    icon: CHAIN_ID_TO_ICON[vaultData.chainId],
    name: CHAIN_ID_TO_NAME[vaultData.chainId],
  }

  const estimatedAPY = vaultData?.apy?.net
    ? `${(vaultData.apy.net * 100).toFixed(2)}%`
    : '0%' // Default to 'N/A' if undefined

  const historicalAPY = vaultData?.apy?.inceptionNet
    ? `${(vaultData.apy.inceptionNet * 100).toFixed(2)}%`
    : '0%' // Default to 'N/A' if undefined

  const managementFee = vaultData?.fees?.managementFee
    ? `${(vaultData.fees.managementFee / 100).toFixed(0)}%`
    : '0%' // Default to '0%' if undefined

  const performanceFee = vaultData?.fees?.performanceFee
    ? `${(vaultData.fees.performanceFee / 100).toFixed(0)}%`
    : vaultData?.performanceFee
      ? `${(vaultData.performanceFee / 100).toFixed(0)}%`
      : '0%' // Default to '0%' if undefined

  const apiVersion = vaultData?.apiVersion || 'N/A' // Default to 'N/A' if undefined

  const blockExplorerLink =
    vaultData?.chainId && vaultData?.address
      ? `${CHAIN_ID_TO_BLOCK_EXPLORER[vaultData.chainId]}/address/${vaultData.address}`
      : '#' // Default to '#' if chainId or address is undefined

  const yearnVaultLink = vaultData?.apiVersion?.startsWith('3')
    ? `https://yearn.fi/v3/${vaultData.chainId}/${vaultData.address}`
    : vaultData?.chainId && vaultData?.address
      ? `https://yearn.fi/vaults/${vaultData.chainId}/${vaultData.address}`
      : '#' // Default to '#' if chainId or address is undefined
  return {
    vaultId: vaultData.symbol,
    deploymentDate,
    vaultName,
    description,
    vaultToken,
    totalSupply,
    network,
    estimatedAPY,
    historicalAPY,
    managementFee,
    performanceFee,
    apiVersion,
    vaultAddress: vaultData.address,
    blockExplorerLink,
    yearnVaultLink,
  }
}

function processChartData(
  apyData: TimeseriesDataPoint[],
  tvlData: TimeseriesDataPoint[],
  ppsData: TimeseriesDataPoint[]
) {
  const { earliest, latest } = getEarliestAndLatestTimestamps(
    apyData,
    tvlData,
    ppsData
  )

  // Fill missing data
  const apyFilled = fillMissingDailyData(apyData, earliest, latest)
  const tvlFilled = fillMissingDailyData(tvlData, earliest, latest)
  const ppsFilled = fillMissingDailyData(ppsData, earliest, latest)

  // Apply transformations
  const rawValues = apyFilled.map(p => p.value ?? 0)
  const sma15Values = calculateSMA(rawValues, 15)
  const sma30Values = calculateSMA(rawValues, 30)

  // Transform APY data
  const transformedApyData: apyChartData = apyFilled.map((dataPoint, i) => ({
    date: formatUnixTimestamp(dataPoint.time),
    APY: dataPoint.value ? dataPoint.value * 100 : null,
    SMA15: sma15Values[i] !== null ? sma15Values[i]! * 100 : null,
    SMA30: sma30Values[i] !== null ? sma30Values[i]! * 100 : null,
  }))

  const transformedTvlData: tvlChartData = tvlFilled.map(dataPoint => ({
    date: formatUnixTimestamp(dataPoint.time),
    TVL: dataPoint.value ?? null,
  }))

  const transformedPpsData: ppsChartData = ppsFilled.map(dataPoint => ({
    date: formatUnixTimestamp(dataPoint.time),
    PPS: dataPoint.value ?? null,
  }))

  return {
    transformedApyData,
    transformedTvlData,
    transformedPpsData,
  }
}
