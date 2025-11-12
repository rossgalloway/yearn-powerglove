import React from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { VaultListData } from '@/components/vaults-list/VaultRow'
import { SortDirection } from '@/utils/sortingUtils'

interface VaultsTableHeaderProps {
  sortColumn: keyof VaultListData
  sortDirection: SortDirection
  onSort: (column: keyof VaultListData) => void
}

const headers: { label: string; key: keyof VaultListData }[] = [
  { label: 'Vault', key: 'name' },
  { label: 'Chain', key: 'chain' },
  { label: 'Token', key: 'token' },
  { label: 'Type', key: 'type' },
  { label: '30D APY', key: 'APY' },
  { label: 'TVL', key: 'tvl' },
]

export const VaultsTableHeader: React.FC<VaultsTableHeaderProps> = React.memo(
  ({ sortColumn, sortDirection, onSort }) => {
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

    return (
      <div className="flex px-6 py-2 bg-white text-gray-900 font-medium border-b">
        {headers.map(({ label, key }) => (
          <div
            key={key}
            className={`${
              key === 'name'
                ? 'flex-[2] cursor-pointer select-none flex items-center gap-1 justify-start'
                : 'flex-1 cursor-pointer select-none flex items-center gap-1 justify-end'
            }`}
            onClick={() => onSort(key)}
          >
            {label}
            {renderSortIcon(key)}
          </div>
        ))}
      </div>
    )
  }
)
