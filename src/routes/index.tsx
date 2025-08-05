import { createFileRoute } from '@tanstack/react-router'
import VaultsList from '../components/VaultsList'
import { useVaults } from '@/contexts/useVaults'
import { Vault } from '@/types/vaultTypes'
import YearnLoader from '@/components/YearnLoader'
import { useTokenAssetsContext } from '../contexts/useTokenAssets'

export default function AllVaultsPage() {
  const { vaults, loading, error } = useVaults()
  const {
    assets,
    loading: assetsLoading,
    error: assetsError,
  } = useTokenAssetsContext()

  // Ensure data is defined before accessing `data.vaults`
  const retrievedVaults: Vault[] = vaults || []

  if (loading || assetsLoading) {
    if (loading) {
      return (
        <main className="min-h-screen px-0 py-0 max-w-[1400px] mx-auto w-full">
          <YearnLoader loadingState="loading vaults" />
        </main>
      )
    }
    if (assetsLoading) {
      return (
        <main className="min-h-screen px-0 py-0 max-w-[1400px] mx-auto w-full">
          <YearnLoader loadingState="loading assets" />
        </main>
      )
    }
  }

  if (error || assetsError) {
    return (
      <main className="min-h-screen px-0 py-0 max-w-[1400px] mx-auto w-full">
        <div className="text-red-500">
          Error loading vaults:{' '}
          {error?.message || assetsError?.message || 'Unknown error'}
        </div>
      </main>
    )
  }

  return (
    <main className="flex-1 container pt-0 pb-0">
      <div className="space-y-0">
        <VaultsList vaults={retrievedVaults} tokenAssets={assets} />
      </div>
    </main>
  )
}

export const Route = createFileRoute('/')({
  component: AllVaultsPage,
})
