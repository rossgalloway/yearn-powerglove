import { useState } from 'react'
import React from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import { Vault } from '@/types/vaultTypes'
import { TokenAsset } from '@/types/tokenAsset'
import {
  CHAIN_ID_TO_ICON,
  CHAIN_ID_TO_NAME,
  getChainIdByName,
} from '@/constants/chains'
import { YearnVaultsSummary } from './YearnVaultsSummary'
import { OptimizedImage } from './ui/OptimizedImage'

interface VaultListData {
  id: string
  name: string
  chain: string
  chainIconUri: string
  token: string
  tokenUri: string
  type: string
  APY: string
  tvl: string
}

type SortColumn = keyof VaultListData
type SortDirection = 'asc' | 'desc'

const VaultsList: React.FC<{
  vaults: Vault[]
  tokenAssets: TokenAsset[]
}> = React.memo(({ vaults, tokenAssets }) => {
  const [sortColumn, setSortColumn] = useState<SortColumn>('tvl') // default sort column changed to TVL
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [selectedType, setSelectedType] = useState<string>('') // Track the selected type
  const [searchTerms, setSearchTerms] = useState<Record<string, string>>({
    name: '',
    chain: '',
    token: '',
    type: '',
    APY: '',
    tvl: '',
  })
  const [rangeFilters, setRangeFilters] = useState({
    APY: { min: '', max: '' },
    tvl: { min: '', max: '' },
  })

  const navigate = useNavigate()

  const vaultTypes: Record<string, string> = {
    1: 'V3 Allocator Vault',
    2: 'V3 Strategy Vault',
    3: 'V2 Factory Vault',
    4: 'V2 Legacy Vault',
    5: 'External Vault',
  }
  const chainOptions = Object.values(CHAIN_ID_TO_NAME)

  // Map the Vault array to VaultListData format
  const vaultListData: VaultListData[] = vaults.map(vault => ({
    id: vault.address, // Use the vault's address as a unique ID
    name: vault.name,
    chain: `${CHAIN_ID_TO_NAME[Number(vault.chainId)]}`, // Convert chainId to a string
    chainIconUri: CHAIN_ID_TO_ICON[vault.chainId],
    token: vault.asset.symbol,
    tokenUri:
      tokenAssets.find(
        token =>
          token.address.toLowerCase() === vault.asset.address.toLowerCase()
      )?.logoURI || '',
    // Modified vault type logic per user request
    type: vault.apiVersion?.startsWith('3')
      ? `${vaultTypes[Number(vault.vaultType)]}`
      : vault.apiVersion?.startsWith('0')
        ? vault.name.includes('Factory')
          ? `${vaultTypes[3]}` // V2 Factory Vault
          : `${vaultTypes[4]}` // V2 Legacy Vault
        : `${vaultTypes[5]}`,
    APY: `${((vault.apy?.net ?? 0) * 100).toFixed(2)}%`, // Added nullish coalescing to handle undefined 'vault.apy'
    tvl: `$${vault.tvl?.close?.toLocaleString(undefined, {
      // Added optional chaining to handle undefined 'vault.tvl'
      minimumFractionDigits: 2, // modified to display 2 decimals
      maximumFractionDigits: 2,
    })}`,
  }))

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
  }

  // Improved sorting logic to handle NaN values
  const sortedVaults = [...vaultListData].sort((a, b) => {
    const compare = (valA: string | number, valB: string | number) => {
      if (sortColumn === 'tvl') {
        const numA = parseFloat(String(valA).replace(/[$,]/g, ''))
        const numB = parseFloat(String(valB).replace(/[$,]/g, ''))
        // Handle NaN values so they sort to the end
        if (isNaN(numA) && isNaN(numB)) return 0
        if (isNaN(numA)) return 1
        if (isNaN(numB)) return -1
        return numA - numB
      }
      if (sortColumn === 'APY') {
        const numA = parseFloat(String(valA).replace(/[%]/g, ''))
        const numB = parseFloat(String(valB).replace(/[%]/g, ''))
        // Handle NaN values so they sort to the end
        if (isNaN(numA) && isNaN(numB)) return 0
        if (isNaN(numA)) return 1
        if (isNaN(numB)) return -1
        return numA - numB
      }
      // Default string/number comparison for other columns
      if (valA < valB) return -1
      if (valA > valB) return 1
      return 0
    }

    const valueA = a[sortColumn]
    const valueB = b[sortColumn]

    return sortDirection === 'asc'
      ? compare(valueA, valueB)
      : compare(valueB, valueA)
  })

  const filteredVaults = sortedVaults.filter(vault => {
    // Filter based on search terms
    const matchesSearchTerms = Object.entries(searchTerms).every(
      ([key, term]) => {
        if (!term) return true // Skip filtering if no search term
        const value = vault[key as keyof VaultListData]
          ?.toString()
          .toLowerCase()
        return value.includes(term.toLowerCase())
      }
    )

    // Filter based on APY range
    const apyValue = parseFloat(vault.APY.replace('%', '')) // Convert APY to a number
    const apyMin = parseFloat(rangeFilters.APY.min) || -Infinity
    const apyMax = parseFloat(rangeFilters.APY.max) || Infinity
    const matchesAPY = apyValue >= apyMin && apyValue <= apyMax

    // Filter based on TVL range
    const tvlValue = parseFloat(vault.tvl.replace(/[$,]/g, '')) // Convert TVL to a number
    const tvlMin = parseFloat(rangeFilters.tvl.min) || -Infinity
    const tvlMax = parseFloat(rangeFilters.tvl.max) || Infinity
    const matchesTVL = tvlValue >= tvlMin && tvlValue <= tvlMax

    return matchesSearchTerms && matchesAPY && matchesTVL
  })

  const renderSortIcon = (column: SortColumn) => {
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

  // Function to update the "Type" filter
  const handleTypeFilterChange = (type: string) => {
    setSelectedType(type) // Update the selected type
    setSearchTerms(prev => ({ ...prev, type })) // Update the search terms
  }

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

        {/* Rows */}
        {filteredVaults.map(vault => (
          <div
            key={`${vault.chain}-${vault.id}`}
            className="flex px-6 py-2 border-b hover:bg-muted/40 transition-colors cursor-pointer bg-white"
            onClick={() =>
              navigate({
                to: `/vaults/${getChainIdByName(vault.chain)}/${vault.id}`,
              })
            }
          >
            <div className="flex-[2] text-left">{vault.name}</div>
            <div className="flex-1 flex justify-end items-center gap-2">
              {vault.chain}
              {vault.chainIconUri ? (
                <OptimizedImage
                  src={vault.chainIconUri}
                  alt={vault.chain}
                  className="w-6 h-6"
                  fallbackClassName="w-6 h-6"
                />
              ) : (
                <div className="w-6 h-6 flex items-center justify-center bg-gray-300 rounded-full text-white">
                  ?
                </div>
              )}
            </div>
            <div className="flex-1 flex justify-end items-center gap-2">
              {vault.token}
              {vault.tokenUri ? (
                <OptimizedImage
                  src={vault.tokenUri}
                  alt={vault.token}
                  className="w-6 h-6"
                  fallbackClassName="w-6 h-6"
                />
              ) : (
                <div className="w-6 h-6 flex items-center justify-center bg-gray-300 rounded-full">
                  ❓
                </div>
              )}
            </div>
            <div className="flex-1 text-right">{vault.type}</div>
            <div className="flex-1 text-right">{vault.APY}</div>
            <div className="flex-1 text-right">{vault.tvl}</div>
          </div>
        ))}
      </div>
    </div>
  )
})

VaultsList.displayName = 'VaultsList'

export default VaultsList
