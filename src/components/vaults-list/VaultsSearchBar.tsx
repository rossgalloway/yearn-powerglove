import React from 'react'
import { VaultListData } from '@/components/VaultRow'
import { CHAIN_ID_TO_NAME } from '@/constants/chains'

interface VaultsSearchBarProps {
  searchTerms: Record<string, string>
  rangeFilters: {
    APY: { min: string; max: string }
    tvl: { min: string; max: string }
  }
  onSearchTermsChange: React.Dispatch<
    React.SetStateAction<Record<string, string>>
  >
  onRangeFiltersChange: React.Dispatch<
    React.SetStateAction<{
      APY: { min: string; max: string }
      tvl: { min: string; max: string }
    }>
  >
  onTypeFilterChange: (type: string) => void
}

const headers: { label: string; key: keyof VaultListData }[] = [
  { label: 'Vault', key: 'name' },
  { label: 'Chain', key: 'chain' },
  { label: 'Token', key: 'token' },
  { label: 'Type', key: 'type' },
  { label: 'Est. APY', key: 'APY' },
  { label: 'TVL', key: 'tvl' },
]

const vaultTypes: Record<string, string> = {
  1: 'V3 Allocator Vault',
  2: 'V3 Strategy Vault',
  3: 'V2 Factory Vault',
  4: 'V2 Legacy Vault',
  5: 'External Vault',
}

const chainOptions = Object.values(CHAIN_ID_TO_NAME)

export const VaultsSearchBar: React.FC<VaultsSearchBarProps> = React.memo(
  ({
    searchTerms,
    rangeFilters,
    onSearchTermsChange,
    onRangeFiltersChange,
    onTypeFilterChange,
  }) => {
    const renderSearchInput = (key: keyof VaultListData) => {
      if (key === 'APY' || key === 'tvl') {
        // APY and TVL: Range filter with "greater than" and "less than" inputs
        return (
          <div className="flex items-center">
            <input
              type="text"
              placeholder={key === 'APY' ? 'Min %' : 'Min $'}
              value={
                rangeFilters[key].min
                  ? key === 'APY'
                    ? `${rangeFilters[key].min}%`
                    : `$${rangeFilters[key].min}`
                  : ''
              }
              onChange={e => {
                const rawValue = e.target.value.replace(/[$%]/g, '')
                if (!isNaN(Number(rawValue))) {
                  onRangeFiltersChange(prev => ({
                    ...prev,
                    [key]: { ...prev[key], min: rawValue },
                  }))
                }
              }}
              className="w-1/2 border border-gray-300 rounded px-2 py-1 text-sm text-right appearance-none text-gray-500"
            />
            <input
              type="text"
              placeholder={key === 'APY' ? 'Max %' : 'Max $'}
              value={
                rangeFilters[key].max
                  ? key === 'APY'
                    ? `${rangeFilters[key].max}%`
                    : `$${rangeFilters[key].max}`
                  : ''
              }
              onChange={e => {
                const rawValue = e.target.value.replace(/[$%]/g, '')
                if (!isNaN(Number(rawValue))) {
                  onRangeFiltersChange(prev => ({
                    ...prev,
                    [key]: { ...prev[key], max: rawValue },
                  }))
                }
              }}
              className="w-1/2 border border-gray-300 rounded px-2 py-1 text-sm text-right appearance-none text-gray-500"
            />
          </div>
        )
      }

      if (key === 'type') {
        return (
          <select
            value={searchTerms[key] || ''}
            onChange={e => {
              const selectedValue = e.target.value
              onSearchTermsChange(prev => ({ ...prev, [key]: selectedValue }))
              onTypeFilterChange(selectedValue)
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
        )
      }

      if (key === 'chain') {
        return (
          <select
            value={searchTerms[key] || ''}
            onChange={e =>
              onSearchTermsChange(prev => ({ ...prev, [key]: e.target.value }))
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
        )
      }

      // Default search input for other columns
      return (
        <input
          type="text"
          placeholder={`Search ${key}`}
          value={searchTerms[key] || ''}
          onChange={e =>
            onSearchTermsChange(prev => ({ ...prev, [key]: e.target.value }))
          }
          className={`w-full border border-gray-300 rounded px-2 py-1 text-sm text-gray-500 ${
            key === 'name' ? 'text-left' : 'text-right'
          }`}
        />
      )
    }

    return (
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
            {renderSearchInput(key)}
          </div>
        ))}
      </div>
    )
  }
)
