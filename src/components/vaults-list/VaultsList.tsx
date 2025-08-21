import React from 'react'
import { Vault } from '@/types/vaultTypes'
import { TokenAsset } from '@/types/tokenAsset'
import { YearnVaultsSummary } from '@/components/YearnVaultsSummary'
import { useViewportHeight } from '@/hooks/useResponsiveHeight'
import { useVaultListData } from '@/hooks/useVaultListData'
import { useVaultFiltering } from '@/hooks/useVaultFiltering'
import { VaultsTableHeader } from './VaultsTableHeader'
import { VaultsFilterBar } from './VaultsFilterBar'
import { VaultsTable } from './VaultsTable'

interface VaultsListProps {
  vaults: Vault[]
  tokenAssets: TokenAsset[]
}

export const VaultsList: React.FC<VaultsListProps> = React.memo(
  ({ vaults, tokenAssets }) => {
    // Calculate available height for virtual scrolling container
    const availableHeight = useViewportHeight({
      headerHeight: 53, // Header height
      footerHeight: 53, // Fixed footer height
      extraOffset: 200, // Summary, table headers, search bar, margins
    })

    // Use our custom hooks for data transformation and filtering
    const vaultListData = useVaultListData(vaults, tokenAssets)
    const {
      sortColumn,
      sortDirection,
      searchTerm,
      selectedChains,
      selectedTypes,
      setSearchTerm,
      setSelectedChains,
      setSelectedTypes,
      handleSort,
      handleToggleChain,
      handleToggleType,
      filteredAndSortedVaults,
    } = useVaultFiltering(vaultListData)

    return (
      <div>
        <YearnVaultsSummary
          vaults={vaults}
          selectedType={selectedTypes[0] || ''}
          onTypeFilterChange={(type: string) => setSelectedTypes([type])}
        />
        {/* Filters Bar */}
        <VaultsFilterBar
          selectedChains={selectedChains}
          selectedTypes={selectedTypes}
          searchTerm={searchTerm}
          onChainToggle={handleToggleChain}
          onSetSelectedChains={setSelectedChains}
          onTypeToggle={handleToggleType}
          onSearchChange={setSearchTerm}
        />

        {/* Vaults List */}
        <div className="border rounded text-sm overflow-hidden bg-white">
          {/* Headers Row */}
          <VaultsTableHeader
            sortColumn={sortColumn}
            sortDirection={sortDirection}
            onSort={handleSort}
          />

          {/* Virtual Scrolled Rows */}
          <VaultsTable
            vaults={filteredAndSortedVaults}
            availableHeight={availableHeight}
          />
        </div>
      </div>
    )
  }
)
