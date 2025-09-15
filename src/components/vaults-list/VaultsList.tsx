import React, { useState } from 'react'
import { Vault } from '@/types/vaultTypes'
import { TokenAsset } from '@/types/tokenAsset'
import { YearnVaultsSummary } from '@/components/YearnVaultsSummary'
import { useViewportHeight } from '@/hooks/useResponsiveHeight'
import { useVaultListData } from '@/hooks/useVaultListData'
import { useVaultFiltering } from '@/hooks/useVaultFiltering'
import { VaultsTableHeader } from './VaultsTableHeader'
import { VaultsFilterBar } from './VaultsFilterBar'
import { VaultsTable } from './VaultsTable'
import { Button } from '@/components/ui/button'
import { Link } from '@tanstack/react-router'

interface VaultsListProps {
  vaults: Vault[]
  tokenAssets: TokenAsset[]
}

export const VaultsList: React.FC<VaultsListProps> = React.memo(
  ({ vaults, tokenAssets }) => {
    const [hasSearched, setHasSearched] = useState(false)
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
        {/* Desktop/tablet view */}
        <div className="hidden sm:block">
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
            sortColumn={sortColumn}
            sortDirection={sortDirection}
            onSort={handleSort}
          />

          {/* Vaults List */}
          <div className="mx-0 overflow-x-auto">
            <div className="min-w-[720px] border rounded text-sm overflow-hidden bg-white">
              {/* Headers Row (desktop only) */}
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
        </div>

        {/* Mobile view */}
        <div className="sm:hidden px-4 py-4">
          {!hasSearched && (
            <div className="max-w-md mx-auto w-full space-y-3">
              <div className="text-center">
                <Link
                  to="/summary"
                  className="inline-block text-[#0657f9] underline text-sm"
                >
                  View Vaults Overview
                </Link>
              </div>
              <input
                type="text"
                placeholder="Search vaults or tokens"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-3 text-sm"
              />
              {/* Filters drawer trigger button */}
              <VaultsFilterBar
                selectedChains={selectedChains}
                selectedTypes={selectedTypes}
                searchTerm={searchTerm}
                onChainToggle={handleToggleChain}
                onSetSelectedChains={setSelectedChains}
                onTypeToggle={handleToggleType}
                onSearchChange={setSearchTerm}
                sortColumn={sortColumn}
                sortDirection={sortDirection}
                onSort={handleSort}
              />
              <Button className="w-full min-h-[44px]" onClick={() => setHasSearched(true)}>
                Search Vaults
              </Button>
            </div>
          )}

          {hasSearched && (
            <div className="space-y-3">
              <div className="sticky top-[48px] z-10 bg-[#f5f5f5] pt-1">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Search vaults or tokens"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="flex-1 border border-gray-300 rounded px-3 py-3 text-sm"
                  />
                  {/* Mobile-only filters drawer trigger */}
                  <div className="min-w-[120px]">
                    <VaultsFilterBar
                      selectedChains={selectedChains}
                      selectedTypes={selectedTypes}
                      searchTerm={searchTerm}
                      onChainToggle={handleToggleChain}
                      onSetSelectedChains={setSelectedChains}
                      onTypeToggle={handleToggleType}
                      onSearchChange={setSearchTerm}
                      sortColumn={sortColumn}
                      sortDirection={sortDirection}
                      onSort={handleSort}
                    />
                  </div>
                </div>
              </div>

              {/* Vault cards list */}
              <div className="bg-white border rounded">
                <VaultsTable
                  vaults={filteredAndSortedVaults}
                  availableHeight={availableHeight}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }
)
