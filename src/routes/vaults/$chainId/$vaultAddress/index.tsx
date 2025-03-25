import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@apollo/client'
import { GET_VAULT_DETAILS } from '@/graphql/queries/vaults'
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
import { Vault } from '@/types/vaultTypes'
import { MainInfoPanelProps } from '@/types/dataTypes'

function SingleVaultPage() {
  const { chainId, vaultAddress } = Route.useParams()
  const vaultChainId = Number(chainId)
  const { data, loading, error } = useQuery(GET_VAULT_DETAILS, {
    variables: { address: vaultAddress, chainId: vaultChainId },
  })
  const vaultData = data?.vault || []

  if (loading) return <div>Loading Vault...</div>
  if (error) return <div>Error fetching vault data</div>

  const mainInfoPanelData = hydrateMainInfoPanelData(vaultData)
  console.log('VaultDetails', mainInfoPanelData)
  return (
    <main className="flex-1 container pt-0 pb-0">
      <div className="space-y-0">
        <MainInfoPanel {...mainInfoPanelData} />
        <ChartsPanel />
        <StrategiesPanel />
      </div>
    </main>
  )
}

export const Route = createFileRoute('/vaults/$chainId/$vaultAddress/')({
  component: SingleVaultPage,
})

function hydrateMainInfoPanelData(vaultData: Vault): MainInfoPanelProps {
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

  const estimatedAPY = `${(vaultData.apy.net * 100).toFixed(2)}%`
  const historicalAPY = `${(vaultData.apy.inceptionNet * 100).toFixed(2)}%`
  const managementFee = `${(vaultData.fees.managementFee / 100).toFixed(0)}%`
  const performanceFee = `${(vaultData.fees.performanceFee / 100).toFixed(0)}%`
  const apiVersion = vaultData.apiVersion
  const blockExplorerLink = `${CHAIN_ID_TO_BLOCK_EXPLORER[vaultData.chainId]}/address/${vaultData.address}`
  const yearnVaultLink = vaultData.apiVersion.startsWith('3')
    ? `https://yearn.fi/v3/${vaultData.chainId}/${vaultData.address}`
    : `https://yearn.fi/vaults/${vaultData.chainId}/${vaultData.address}`

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
