import { createFileRoute } from '@tanstack/react-router'
import { YearnVaultsSummary } from '../components/YearnVaultsSummary'
import VaultsList from '../components/VaultsList'
import { useVaults } from '@/contexts/useVaults'
import { Vault } from '@/types/vaultTypes'
import YearnLoader from '@/components/YearnLoader'

export default function AllVaultsPage() {
  const { vaults, loading, error } = useVaults()

  // Ensure data is defined before accessing `data.vaults`
  const retrievedVaults: Vault[] = vaults || []

  if (loading) {
    return (
      <main className="min-h-screen px-0 py-0 max-w-[1400px] mx-auto w-full">
        <YearnLoader />
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
        <YearnVaultsSummary vaults={retrievedVaults} />
        <VaultsList vaults={retrievedVaults} />
      </div>
    </main>
  )
}

export const Route = createFileRoute('/')({
  component: AllVaultsPage,
})
