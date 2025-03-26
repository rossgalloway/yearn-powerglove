import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@apollo/client'
import { GET_VAULT_DETAILS } from '@/graphql/queries/vaults'
import { queryAPY, queryPPS, queryTVL } from '@/graphql/queries/timeseries'
import { MainInfoPanel } from '@/components/main-info-panel'
import { ChartsPanel } from '@/components/charts-panel'
import StrategiesPanel from '@/components/strategies-panel'
import { format } from 'date-fns'
import smolAssets from '@/data/smolAssets.json'
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

function SingleVaultPage() {
  const { chainId, vaultAddress } = Route.useParams()
  const vaultChainId = Number(chainId)

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

  // Handle loading states
  if (vaultLoading || apyLoading || tvlLoading || ppsLoading) {
    return <div>Loading Vault...</div>
  }

  // Handle errors
  if (vaultError || apyError || tvlError || ppsError) {
    return <div>Error fetching vault data</div>
  }

  // Extract data
  const vaultDetails: VaultExtended =
    vaultData?.vault ??
    (() => {
      throw new Error('Vault data is undefined')
    })() // Ensure vaultData?.vault is not undefined
  console.log('vaultDetails:', vaultDetails)
  const mainInfoPanelData = hydrateMainInfoPanelData(vaultDetails)
  const apyDataClean = apyData.timeseries || {}
  const tvlDataClean = tvlData.timeseries || {}
  const ppsDataClean = ppsData.timeseries || {}
  const { transformedApyData, transformedTvlData, transformedPpsData } =
    processChartData(apyDataClean, tvlDataClean, ppsDataClean)

  return (
    <main className="flex-1 container pt-0 pb-0">
      <div className="space-y-0">
        <MainInfoPanel {...mainInfoPanelData} />
        <ChartsPanel
          apyData={transformedApyData}
          tvlData={transformedTvlData}
          ppsData={transformedPpsData}
        />
        <StrategiesPanel props={{ vaultAddress, vaultChainId }} />
      </div>
    </main>
  )
}

export const Route = createFileRoute('/vaults/$chainId/$vaultAddress/')({
  component: SingleVaultPage,
})

function hydrateMainInfoPanelData(
  vaultData: VaultExtended
): MainInfoPanelProps {
  const deploymentDate = format(
    new Date(parseInt(vaultData.inceptTime) * 1000),
    'MMMM yyyy'
  )
  const vaultName = vaultData.name
  const description = `The ${vaultName} aims to optimize for risk-adjusted yield across established lending and yield-farming markets.`

  const vaultToken = {
    icon:
      smolAssets.tokens.find(token => token.symbol === vaultData.asset.symbol)
        ?.logoURI || '',
    name: vaultData.asset.symbol,
  }

  const totalSupply = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(vaultData.tvl.close)

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
