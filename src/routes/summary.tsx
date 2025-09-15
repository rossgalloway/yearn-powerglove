import { createFileRoute, Link } from '@tanstack/react-router'
import { useVaults } from '@/contexts/useVaults'
import { YearnVaultsSummary } from '@/components/YearnVaultsSummary'
import { useState } from 'react'

function SummaryPage() {
  const { vaults } = useVaults()
  const [selectedType, setSelectedType] = useState('')

  return (
    <div className="w-full max-w-[1400px] mx-auto px-0 sm:px-6">
      <div className="p-4 sm:p-6">
        <div className="mb-4 sm:mb-6">
          <Link to="/" className="text-[#0657f9] underline">
            ← Back to Vaults
          </Link>
        </div>
        <YearnVaultsSummary
          vaults={vaults}
          selectedType={selectedType}
          onTypeFilterChange={setSelectedType}
        />
      </div>
    </div>
  )
}

export const Route = createFileRoute('/summary')({
  component: SummaryPage,
})

