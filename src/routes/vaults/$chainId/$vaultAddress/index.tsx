import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@apollo/client'
import { GET_VAULT_DETAILS } from '@/graphql/queries/vaults'
import { MainInfoPanel } from '@/components/main-info-panel'
import { ChartsPanel } from '@/components/charts-panel'
import StrategiesPanel from '@/components/strategies-panel'

function SingleVaultPage() {
  const { chainId, vaultAddress } = Route.useParams()
  const vaultChainId = Number(chainId)
  const { data, loading, error } = useQuery(GET_VAULT_DETAILS, {
    variables: { address: vaultAddress, chainId: vaultChainId },
  })
  console.log('data', data)

  if (loading) return <div>Loading Vault...</div>
  if (error) return <div>Error fetching vault data</div>
  return (
    <main className="flex-1 container pt-0 pb-0">
      <div className="space-y-0">
        <MainInfoPanel />
        <ChartsPanel />
        <StrategiesPanel />
      </div>
    </main>
  )
}

export const Route = createFileRoute('/vaults/$chainId/$vaultAddress/')({
  component: SingleVaultPage,
})
