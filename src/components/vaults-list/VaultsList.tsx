import React from 'react'
import { Vault } from '@/types/vaultTypes'
import { TokenAsset } from '@/types/tokenAsset'
import { YearnVaultsSummary } from '@/components/YearnVaultsSummary'
import { useViewportHeight } from '@/hooks/useResponsiveHeight'
import { useVaultListData } from '@/hooks/useVaultListData'
import { useVaultFiltering } from '@/hooks/useVaultFiltering'
import { VaultsTableHeader } from './VaultsTableHeader'
import { VaultsSearchBar } from './VaultsSearchBar'
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
      searchTerms,
      rangeFilters,
      selectedType,
      setSearchTerms,
      setRangeFilters,
      handleSort,
      handleTypeFilterChange,
      filteredAndSortedVaults,
    } = useVaultFiltering(vaultListData)

    return (
      <div>
        <YearnVaultsSummary
          vaults={vaults}
          selectedType={selectedType}
          onTypeFilterChange={handleTypeFilterChange}
        />

        {/* Vaults List */}
        <div className="border rounded text-sm overflow-hidden bg-white">
          {/* Headers Row */}
          <VaultsTableHeader
            sortColumn={sortColumn}
            sortDirection={sortDirection}
            onSort={handleSort}
          />

          {/* Search Bar Row */}
          <VaultsSearchBar
            searchTerms={searchTerms}
            rangeFilters={rangeFilters}
            onSearchTermsChange={setSearchTerms}
            onRangeFiltersChange={setRangeFilters}
            onTypeFilterChange={handleTypeFilterChange}
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
