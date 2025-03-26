import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import { Vault } from '@/types/vaultTypes'
import {
  CHAIN_ID_TO_ICON,
  CHAIN_ID_TO_NAME,
  VAULT_TYPE_TO_NAME,
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
  estimatedAPY: string
  tvl: string
}

type SortColumn = keyof VaultListData
type SortDirection = 'asc' | 'desc'

export default function VaultsList({ vaults }: { vaults: Vault[] }) {
  const [sortColumn, setSortColumn] = useState<SortColumn>('tvl') // default sort column changed to TVL
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const navigate = useNavigate()

  // Map the Vault array to VaultListData format
  const vaultListData: VaultListData[] = vaults.map(vault => ({
    id: vault.address, // Use the vault's address as a unique ID
    name: vault.name,
    chain: vault.chainId.toString(), // Convert chainId to a string
    chainIconUri: CHAIN_ID_TO_ICON[vault.chainId],
    token: vault.asset.symbol,
    tokenUri:
      smolAssets.tokens.find(token => token.symbol === vault.asset.symbol)
        ?.logoURI || '',
    type: vault.vaultType,
    estimatedAPY: `${(vault.apy.net * 100).toFixed(2)}%`, // Format APY as a percentage
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
    { label: 'Est. APY', key: 'estimatedAPY' },
    { label: 'TVL', key: 'tvl' },
  ]

  return (
    <div className="border rounded text-sm overflow-hidden bg-white">
      {' '}
      {/* added bg-white */}
      {/* Header */}
      <div className="flex px-6 py-2 bg-white text-gray-900 font-medium border-b">
        {' '}
        {/* updated background and text color */}
        {headers.map(({ label, key }) => (
          <div
            key={key}
            className={`${
              key === 'name'
                ? 'flex-[2] cursor-pointer select-none flex items-center gap-1 justify-start' // vault name: left-aligned with more room
                : 'flex-1 cursor-pointer select-none flex items-center gap-1 justify-end' // other headers: right-aligned
            }`}
            onClick={() => handleSort(key)}
          >
            {label}
            {renderSortIcon(key)}
          </div>
        ))}
      </div>
      {/* Rows */}
      {sortedVaults.map(vault => (
        <div
          key={vault.id}
          className="flex px-6 py-2 border-b hover:bg-muted/40 transition-colors cursor-pointer bg-white" // added bg-white
          onClick={() => navigate({ to: `/vaults/${vault.chain}/${vault.id}` })}
        >
          <div className="flex-[2] text-left">{vault.name}</div>
          {/* vault name gets more space and left-aligned */}
          <div className="flex-1 flex justify-end items-center gap-2">
            {CHAIN_ID_TO_NAME[Number(vault.chain)]}
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
          <div className="flex-1 text-right">
            {VAULT_TYPE_TO_NAME[Number(vault.type)]}
          </div>
          <div className="flex-1 text-right">{vault.estimatedAPY}</div>
          <div className="flex-1 text-right">{vault.tvl}</div>
        </div>
      ))}
    </div>
  )
}
