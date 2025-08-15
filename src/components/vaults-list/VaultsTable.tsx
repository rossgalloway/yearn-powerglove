import React from 'react'
import { VirtualScrollTable } from '@/components/ui/VirtualScrollTable'
import { VaultRow, VaultListData } from '@/components/VaultRow'

interface VaultsTableProps {
  vaults: VaultListData[]
  availableHeight: number
}

export const VaultsTable: React.FC<VaultsTableProps> = React.memo(
  ({ vaults, availableHeight }) => {
    return (
      <VirtualScrollTable
        data={vaults}
        itemHeight={50} // Fixed height per row - matches VaultRow height
        containerHeight={availableHeight} // Use full available viewport height
        renderItem={(vault: VaultListData) => (
          <VaultRow key={`${vault.chain}-${vault.id}`} vault={vault} />
        )}
        className="border-0"
        overscan={3} // Render 3 extra items outside viewport
      />
    )
  }
)
