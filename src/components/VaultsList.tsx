import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import { Vault } from '../types/vaultTypes'

interface VaultListData {
  id: string // Updated to match the Vault type's ID
  name: string
  chain: string
  token: string
  type: string
  estimatedAPY: string
  tvl: string
}

type SortColumn = 'name' | 'chain' | 'token' | 'type' | 'estimatedAPY' | 'tvl'
type SortDirection = 'asc' | 'desc'

export default function VaultsList({ vaults }: { vaults: Vault[] }) {
  const [sortColumn, setSortColumn] = useState<SortColumn>('name')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  const navigate = useNavigate()

  // Map the Vault array to VaultListData format
  const vaultListData: VaultListData[] = vaults.map(vault => ({
    id: vault.address, // Use the vault's address as a unique ID
    name: vault.name,
    chain: vault.chainId.toString(), // Convert chainId to a string
    token: vault.asset.symbol,
    type: vault.vaultType,
    estimatedAPY: `${(vault.apy.net * 100).toFixed(2)}%`, // Format APY as a percentage
    tvl: `$${vault.tvl.close.toLocaleString()}`, // Format TVL with commas
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
      if (valA < valB) return -1
      if (valA > valB) return 1
      return 0
    }

    const valueA = a[sortColumn as keyof VaultListData]
    const valueB = b[sortColumn as keyof VaultListData]

    return sortDirection === 'asc'
      ? compare(valueA, valueB)
      : compare(valueB, valueA)
  })

  const renderSortIcon = (column: SortColumn) => {
    if (sortColumn !== column) {
      return <ChevronDown className="w-4 h-4 ml-1 inline-block" />
    }
    return sortDirection === 'asc' ? (
      <ChevronUp className="w-4 h-4 ml-1 inline-block text-[#0657f9]" />
    ) : (
      <ChevronDown className="w-4 h-4 ml-1 inline-block text-[#0657f9]" />
    )
  }

  return (
    <div className="border border-[#f5f5f5]">
      {/* Table Header */}
      <div className="flex items-center p-3 text-sm text-[#4f4f4f]">
        <div
          className="w-1/6 cursor-pointer"
          onClick={() => handleSort('name')}
        >
          <span>Name</span>
          {renderSortIcon('name')}
        </div>
        <div
          className="w-1/6 cursor-pointer"
          onClick={() => handleSort('chain')}
        >
          <span>Chain</span>
          {renderSortIcon('chain')}
        </div>
        <div
          className="w-1/6 cursor-pointer"
          onClick={() => handleSort('token')}
        >
          <span>Token</span>
          {renderSortIcon('token')}
        </div>
        <div
          className="w-1/6 cursor-pointer"
          onClick={() => handleSort('type')}
        >
          <span>Type</span>
          {renderSortIcon('type')}
        </div>
        <div
          className="w-1/6 cursor-pointer"
          onClick={() => handleSort('estimatedAPY')}
        >
          <span>Est. APY</span>
          {renderSortIcon('estimatedAPY')}
        </div>
        <div className="w-1/6 cursor-pointer" onClick={() => handleSort('tvl')}>
          <span>TVL</span>
          {renderSortIcon('tvl')}
        </div>
      </div>

      {/* Table Rows */}
      {sortedVaults.map(vault => (
        <div
          key={vault.id}
          className="flex items-center p-3 border-t border-[#f5f5f5] hover:bg-[#f5f5f5]/50 cursor-pointer"
          onClick={() => navigate({ to: `/vaults/${vault.chain}/${vault.id}` })}
        >
          <div className="w-1/6">{vault.name}</div>
          <div className="w-1/6">{vault.chain}</div>
          <div className="w-1/6">{vault.token}</div>
          <div className="w-1/6">{vault.type}</div>
          <div className="w-1/6">{vault.estimatedAPY}</div>
          <div className="w-1/6">{vault.tvl}</div>
        </div>
      ))}
    </div>
  )
}
