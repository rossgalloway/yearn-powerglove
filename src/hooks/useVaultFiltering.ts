import { useState, useMemo } from 'react'
import { getChainIdByName } from '@/constants/chains'
import { VaultListData } from '@/components/vaults-list/VaultRow'
import { SortDirection } from '@/utils/sortingUtils'

type VaultSortColumn = keyof VaultListData

export interface VaultFilteringState {
  sortColumn: VaultSortColumn
  sortDirection: SortDirection
  searchTerm: string
  selectedChains: number[]
  selectedTypes: string[]
  setSortColumn: (column: VaultSortColumn) => void
  setSortDirection: (direction: SortDirection) => void
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>
  setSelectedChains: React.Dispatch<React.SetStateAction<number[]>>
  setSelectedTypes: React.Dispatch<React.SetStateAction<string[]>>
  handleSort: (column: VaultSortColumn) => void
  handleToggleChain: (chainId: number) => void
  handleToggleType: (type: string) => void
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
  searchTerm: string,
  selectedChains: number[],
  selectedTypes: string[]
): VaultListData[] {
  const term = searchTerm.trim().toLowerCase()
  return vaultListData.filter(vault => {
    // Search across name and token
    const matchesSearch =
      !term ||
      vault.name.toLowerCase().includes(term) ||
      vault.token.toLowerCase().includes(term)

    // Chain filter (if any selected chains, only include those)
    const vaultChainId = getChainIdByName(vault.chain)
    const matchesChain =
      selectedChains.length === 0 ||
      (vaultChainId !== undefined && selectedChains.includes(vaultChainId))

    // Type filter
    const matchesType =
      selectedTypes.length === 0 || selectedTypes.includes(vault.type)

    return matchesSearch && matchesChain && matchesType
  })
}

export function useVaultFiltering(
  vaultListData: VaultListData[]
): VaultFilteringState {
  const [sortColumn, setSortColumn] = useState<VaultSortColumn>('tvl')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [selectedChains, setSelectedChains] = useState<number[]>([])
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])

  const handleSort = (column: VaultSortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
  }

  const handleToggleChain = (chainId: number) => {
    setSelectedChains(prev =>
      prev.includes(chainId)
        ? prev.filter(id => id !== chainId)
        : [...prev, chainId]
    )
  }

  const handleToggleType = (type: string) => {
    setSelectedTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    )
  }

  // Apply filtering and sorting
  const filteredAndSortedVaults = useMemo(() => {
    const filtered = filterVaults(
      vaultListData,
      searchTerm,
      selectedChains,
      selectedTypes
    )
    return sortVaults(filtered, sortColumn, sortDirection)
  }, [
    vaultListData,
    searchTerm,
    selectedChains,
    selectedTypes,
    sortColumn,
    sortDirection,
  ])

  return {
    sortColumn,
    sortDirection,
    searchTerm,
    selectedChains,
    selectedTypes,
    setSortColumn,
    setSortDirection,
    setSearchTerm,
    setSelectedChains,
    setSelectedTypes,
    handleSort,
    handleToggleChain,
    handleToggleType,
    filteredAndSortedVaults,
  }
}
