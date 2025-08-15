import React from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { Vault } from '@/types/vaultTypes'
import { TokenAsset } from '@/types/tokenAsset'
import { CHAIN_ID_TO_NAME } from '@/constants/chains'
import { YearnVaultsSummary } from './YearnVaultsSummary'
import { VirtualScrollTable } from './ui/VirtualScrollTable'
import { VaultRow, VaultListData } from './VaultRow'
import { useViewportHeight } from '@/hooks/useResponsiveHeight'
import { useVaultListData } from '@/hooks/useVaultListData'
import { useVaultFiltering } from '@/hooks/useVaultFiltering'

const VaultsList: React.FC<{
  vaults: Vault[]
  tokenAssets: TokenAsset[]
}> = React.memo(({ vaults, tokenAssets }) => {
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

  // Removed navigate since we're using Link components now

  const vaultTypes: Record<string, string> = {
    1: 'V3 Allocator Vault',
    2: 'V3 Strategy Vault',
    3: 'V2 Factory Vault',
    4: 'V2 Legacy Vault',
    5: 'External Vault',
  }
  const chainOptions = Object.values(CHAIN_ID_TO_NAME)

  const renderSortIcon = (column: keyof VaultListData) => {
    if (sortColumn !== column) {
      return <ChevronDown className="w-4 h-4 inline-block" />
    }
    return sortDirection === 'asc' ? (
      <ChevronUp className="w-4 h-4 inline-block text-[#0657f9]" />
    ) : (
      <ChevronDown className="w-4 h-4 inline-block text-[#0657f9]" />
    )
  }

  const headers: { label: string; key: keyof VaultListData }[] = [
    { label: 'Vault', key: 'name' },
    { label: 'Chain', key: 'chain' },
    { label: 'Token', key: 'token' },
    { label: 'Type', key: 'type' },
    { label: 'Est. APY', key: 'APY' },
    { label: 'TVL', key: 'tvl' },
  ]

  return (
    <div>
      <YearnVaultsSummary
        vaults={vaults}
        selectedType={selectedType} // Pass the selected type
        onTypeFilterChange={handleTypeFilterChange}
      />

      {/* Vaults List */}
      <div className="border rounded text-sm overflow-hidden bg-white">
        {/* Headers Row */}
        <div className="flex px-6 py-2 bg-white text-gray-900 font-medium border-b">
          {headers.map(({ label, key }) => (
            <div
              key={key}
              className={`${
                key === 'name'
                  ? 'flex-[2] cursor-pointer select-none flex items-center gap-1 justify-start'
                  : 'flex-1 cursor-pointer select-none flex items-center gap-1 justify-end'
              }`}
              onClick={() => handleSort(key)}
            >
              {label}
              {renderSortIcon(key)}
            </div>
          ))}
        </div>

        {/* Search Bar Row */}
        <div className="flex px-.05 py-.05 gap-0.5 bg-white text-gray-900 border-b">
          {headers.map(({ key }) => (
            <div
              key={key}
              className={`${
                key === 'name'
                  ? 'flex-[2] flex items-center gap-1 justify-start'
                  : 'flex-1 flex items-center gap-1 justify-end'
              }`}
            >
              {key === 'APY' || key === 'tvl' ? (
                // APY and TVL: Range filter with "greater than" and "less than" inputs
                <div className="flex items-center">
                  <input
                    type="text"
                    placeholder={key === 'APY' ? 'Min %' : 'Min $'} // Dynamic placeholder
                    value={
                      rangeFilters[key].min
                        ? key === 'APY'
                          ? `${rangeFilters[key].min}%` // Append % for APY
                          : `$${rangeFilters[key].min}` // Prepend $ for TVL
                        : '' // Empty if no value
                    }
                    onChange={e => {
                      const rawValue = e.target.value.replace(/[$%]/g, '') // Remove $ or % from input
                      if (!isNaN(Number(rawValue))) {
                        setRangeFilters(prev => ({
                          ...prev,
                          [key]: { ...prev[key], min: rawValue }, // Update state with raw numeric value
                        }))
                      }
                    }}
                    className="w-1/2 border border-gray-300 rounded px-2 py-1 text-sm text-right appearance-none text-gray-500"
                  />
                  <input
                    type="text"
                    placeholder={key === 'APY' ? 'Max %' : 'Max $'} // Dynamic placeholder
                    value={
                      rangeFilters[key].max
                        ? key === 'APY'
                          ? `${rangeFilters[key].max}%` // Append % for APY
                          : `$${rangeFilters[key].max}` // Prepend $ for TVL
                        : '' // Empty if no value
                    }
                    onChange={e => {
                      const rawValue = e.target.value.replace(/[$%]/g, '') // Remove $ or % from input
                      if (!isNaN(Number(rawValue))) {
                        setRangeFilters(prev => ({
                          ...prev,
                          [key]: { ...prev[key], max: rawValue }, // Update state with raw numeric value
                        }))
                      }
                    }}
                    className="w-1/2 border border-gray-300 rounded px-2 py-1 text-sm text-right appearance-none text-gray-500"
                  />
                </div>
              ) : key === 'type' ? (
                <select
                  value={searchTerms[key] || ''}
                  onChange={e => {
                    const selectedValue = e.target.value
                    setSearchTerms(prev => ({ ...prev, [key]: selectedValue }))
                    handleTypeFilterChange(selectedValue) // Update the selected type state
                  }}
                  className="w-full h-full bg-white border border-gray-300 rounded px-2 py-1 text-sm text-right text-gray-500"
                >
                  <option value="">All Types</option>
                  {Object.values(vaultTypes).map(option => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              ) : key === 'chain' ? (
                <select
                  value={searchTerms[key] || ''}
                  onChange={e =>
                    setSearchTerms(prev => ({ ...prev, [key]: e.target.value }))
                  }
                  className="w-full h-full bg-white border border-gray-300 rounded px-2 py-1 text-sm text-right text-gray-500"
                >
                  <option value="">All Chains</option>
                  {chainOptions.map(option => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              ) : (
                // Default search input for other columns
                <input
                  type="text"
                  placeholder={`Search ${key}`}
                  value={searchTerms[key] || ''}
                  onChange={e =>
                    setSearchTerms(prev => ({ ...prev, [key]: e.target.value }))
                  }
                  className={`w-full border border-gray-300 rounded px-2 py-1 text-sm text-gray-500 ${
                    key === 'name' ? 'text-left' : 'text-right'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Virtual Scrolled Rows */}
        <VirtualScrollTable
          data={filteredAndSortedVaults}
          itemHeight={50} // Fixed height per row - matches VaultRow height
          containerHeight={availableHeight} // Use full available viewport height
          renderItem={(vault: VaultListData) => (
            <VaultRow key={`${vault.chain}-${vault.id}`} vault={vault} />
          )}
          className="border-0"
          overscan={3} // Render 3 extra items outside viewport
        />
      </div>
    </div>
  )
})

VaultsList.displayName = 'VaultsList'

export default VaultsList
