import { useState, useMemo } from 'react'
import { VaultListData } from '@/components/vaults-list/VaultRow'
import { SortDirection } from '@/utils/sortingUtils'

type VaultSortColumn = keyof VaultListData

export interface VaultFilteringState {
  sortColumn: VaultSortColumn
  sortDirection: SortDirection
  searchTerms: Record<string, string>
  rangeFilters: {
    APY: { min: string; max: string }
    tvl: { min: string; max: string }
  }
  selectedType: string
  setSortColumn: (column: VaultSortColumn) => void
  setSortDirection: (direction: SortDirection) => void
  setSearchTerms: React.Dispatch<React.SetStateAction<Record<string, string>>>
  setRangeFilters: React.Dispatch<
    React.SetStateAction<{
      APY: { min: string; max: string }
      tvl: { min: string; max: string }
    }>
  >
  setSelectedType: (type: string) => void
  handleSort: (column: VaultSortColumn) => void
  handleTypeFilterChange: (type: string) => void
  filteredAndSortedVaults: VaultListData[]
}

function sortVaults(
  vaultListData: VaultListData[],
  sortColumn: VaultSortColumn,
  sortDirection: SortDirection
): VaultListData[] {
  return [...vaultListData].sort((a, b) => {
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
}

function filterVaults(
  vaultListData: VaultListData[],
  searchTerms: Record<string, string>,
  rangeFilters: {
    APY: { min: string; max: string }
    tvl: { min: string; max: string }
  }
): VaultListData[] {
  return vaultListData.filter(vault => {
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
}

export function useVaultFiltering(
  vaultListData: VaultListData[]
): VaultFilteringState {
  const [sortColumn, setSortColumn] = useState<VaultSortColumn>('tvl') // default sort column changed to TVL
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

  const handleSort = (column: VaultSortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
  }

  // Function to update the "Type" filter
  const handleTypeFilterChange = (type: string) => {
    setSelectedType(type) // Update the selected type
    setSearchTerms(prev => ({ ...prev, type })) // Update the search terms
  }

  // Apply filtering and sorting
  const filteredAndSortedVaults = useMemo(() => {
    const filtered = filterVaults(vaultListData, searchTerms, rangeFilters)
    return sortVaults(filtered, sortColumn, sortDirection)
  }, [vaultListData, searchTerms, rangeFilters, sortColumn, sortDirection])

  return {
    sortColumn,
    sortDirection,
    searchTerms,
    rangeFilters,
    selectedType,
    setSortColumn,
    setSortDirection,
    setSearchTerms,
    setRangeFilters,
    setSelectedType,
    handleSort,
    handleTypeFilterChange,
    filteredAndSortedVaults,
  }
}
