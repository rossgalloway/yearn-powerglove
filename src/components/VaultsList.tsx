import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import { Vault } from '@/types/vaultTypes'
import {
  CHAIN_ID_TO_ICON,
  CHAIN_ID_TO_NAME,
  VAULT_TYPE_TO_NAME,
  getChainIdByName,
} from '@/constants/chains'
import smolAssets from '@/constants/smolAssets.json'

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

export default function VaultsList({ vaults }: { vaults: Vault[] }) {
  const [sortColumn, setSortColumn] = useState<SortColumn>('tvl') // default sort column changed to TVL
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
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

  // Map the Vault array to VaultListData format
  const vaultListData: VaultListData[] = vaults.map(vault => ({
    id: vault.address, // Use the vault's address as a unique ID
    name: vault.name,
    chain: `${CHAIN_ID_TO_NAME[Number(vault.chainId)]}`, // Convert chainId to a string
    chainIconUri: CHAIN_ID_TO_ICON[vault.chainId],
    token: vault.asset.symbol,
    tokenUri:
      smolAssets.tokens.find(token => token.symbol === vault.asset.symbol)
        ?.logoURI || '',
    type: vault.apiVersion.startsWith('3')
      ? `V3 ${VAULT_TYPE_TO_NAME[Number(vault.vaultType)]}` // Check if apiVersion starts with 3
      : vault.name.includes('Factory')
        ? 'V2 - Factory Vault' // Check if name includes "Factory"
        : 'V2 - Legacy Vault', // Default to "V2 - Legacy Vault"
    APY: `${(vault.apy.net * 100).toFixed(2)}%`, // Renamed to match the VaultListData interface
    tvl: `$${vault.tvl.close.toLocaleString(undefined, {
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

  const sortedVaults = [...vaultListData].sort((a, b) => {
    const compare = (valA: string | number, valB: string | number) => {
      if (sortColumn === 'tvl') {
        // Remove $ and commas, then convert to number for proper numeric sort
        const numA = parseFloat(String(valA).replace(/[$,]/g, ''))
        const numB = parseFloat(String(valB).replace(/[$,]/g, ''))
        return numA - numB
      }
      if (sortColumn === 'APY') {
        // fixed to match the correct key in VaultListData
        // Remove $ and commas, then convert to number for proper numeric sort
        const numA = parseFloat(String(valA).replace(/[%]/g, ''))
        const numB = parseFloat(String(valB).replace(/[%]/g, ''))
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

  return (
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
      <div className="flex px-.05 py-.05 gap-0.5 bg-gray-100 text-gray-900 border-b">
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
                  className="w-1/2 border border-gray-300 rounded px-2 py-1 text-sm text-right appearance-none"
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
                  className="w-1/2 border border-gray-300 rounded px-2 py-1 text-sm text-right appearance-none"
                />
              </div>
            ) : (
              // Default search input for other columns
              <input
                type="text"
                placeholder={`Search ${key}`}
                value={searchTerms[key] || ''}
                onChange={e =>
                  setSearchTerms(prev => ({ ...prev, [key]: e.target.value }))
                }
                className={`w-full border border-gray-300 rounded px-2 py-1 text-sm ${
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
          key={vault.id}
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
              <img
                src={vault.chainIconUri}
                alt={vault.chain}
                className="w-6 h-6"
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
              <img src={vault.tokenUri} alt={vault.token} className="w-6 h-6" />
            ) : (
              <div className="w-6 h-6 flex items-center justify-center bg-gray-300 rounded-full text-white">
                ?
              </div>
            )}
          </div>
          <div className="flex-1 text-right">{vault.type}</div>
          <div className="flex-1 text-right">{vault.APY}</div>
          <div className="flex-1 text-right">{vault.tvl}</div>
        </div>
      ))}
    </div>
  )
}
