import { createFileRoute } from '@tanstack/react-router'
import { YearnVaultsSummary } from '../components/YearnVaultsSummary'
import VaultsList from '../components/VaultsList'
import { useQuery } from '@apollo/client'
import { GET_VAULTS } from '@/graphql/queries/vaults'
import { Skeleton } from '@/components/ui/skeleton'

export default function AllVaultsPage() {
  const { data, loading, error } = useQuery(GET_VAULTS)
  console.log('data', data)
  //process data

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
  return (
    <main className="flex-1 container pt-0 pb-0">
      <div className="space-y-0">
        <YearnVaultsSummary />
        <VaultsList />
      </div>
    </main>
  )
}

export const Route = createFileRoute('/')({
  component: AllVaultsPage,
})
