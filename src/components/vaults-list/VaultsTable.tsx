import React from 'react'
import { VirtualScrollTable } from '@/components/ui/VirtualScrollTable'
import { VaultRow, VaultListData } from '@/components/vaults-list/VaultRow'
import useIsMobile from '@/hooks/useIsMobile'

interface VaultsTableProps {
  vaults: VaultListData[]
  availableHeight: number
}

export const VaultsTable: React.FC<VaultsTableProps> = React.memo(
  ({ vaults, availableHeight }) => {
    const isMobile = useIsMobile()
    // Show fallback message when no vaults match the filters
    if (vaults.length === 0) {
      return (
        <div
          className="flex items-center justify-center text-gray-500 text-center p-8"
          style={{ height: availableHeight }}
        >
          <div>
            <p className="text-lg font-medium mb-2">
              No vaults found with those filters.
            </p>
            <p className="text-sm">Please adjust your filters.</p>
          </div>
        </div>
      )
    }

    return (
      <VirtualScrollTable
        data={vaults}
        itemHeight={isMobile ? 65 : 50} // Taller on mobile to accommodate two-row layout
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
