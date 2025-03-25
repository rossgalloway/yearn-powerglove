import { createFileRoute } from '@tanstack/react-router'
import { YearnVaultsSummary } from '../components/YearnVaultsSummary'
import VaultsList from '../components/VaultsList'
import { useQuery } from '@apollo/client'
import { GET_VAULTS_SIMPLE } from '@/graphql/queries/vaults'
import { Skeleton } from '@/components/ui/skeleton'
import * as filters from '@/graphql/filters/vaultFilters'
import { Vault } from '@/types/vaultTypes'

export default function AllVaultsPage() {
  const { data, loading, error } = useQuery(GET_VAULTS_SIMPLE)

  // Ensure data is defined before accessing `data.vaults`
  const vaults: Vault[] = data?.vaults || []

  if (loading) {
    return (
      <main className="min-h-screen px-0 py-0 max-w-[1400px] mx-auto w-full">
        <Skeleton className="h-10 w-full" />
        Loading vaults...
      </main>
    )
  }

  if (error) {
    return (
      <main className="min-h-screen px-0 py-0 max-w-[1400px] mx-auto w-full">
        <div className="text-red-500">
          Error loading vaults: {error.message}
        </div>
      </main>
    )
  }

  const filteredVaults = filters.filterYearnV3AllocatorVaults(vaults)

  return (
    <main className="flex-1 container pt-0 pb-0">
      <div className="space-y-0">
        <YearnVaultsSummary />
        <VaultsList vaults={filteredVaults} />
      </div>
    </main>
  )
}

export const Route = createFileRoute('/')({
  component: AllVaultsPage,
})
