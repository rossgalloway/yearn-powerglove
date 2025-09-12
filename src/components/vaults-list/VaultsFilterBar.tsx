import React from 'react'
import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
  DrawerClose,
} from '@/components/ui/drawer'
import { ChainSelector } from './ChainSelector'
import { TypeSelector } from './TypeSelector'
import { VaultListData } from '@/components/vaults-list/VaultRow'

interface VaultsFilterBarProps {
  selectedChains: number[]
  selectedTypes: string[]
  searchTerm: string
  onChainToggle: (chainId: number) => void
  onSetSelectedChains?: (chainIds: number[]) => void
  onTypeToggle: (type: string) => void
  onSearchChange: (term: string) => void
  // Sorting controls
  sortColumn?: keyof VaultListData
  sortDirection?: 'asc' | 'desc'
  onSort?: (column: keyof VaultListData) => void
}

export const VaultsFilterBar: React.FC<VaultsFilterBarProps> = ({
  selectedChains,
  selectedTypes,
  searchTerm,
  onChainToggle,
  onSetSelectedChains,
  onTypeToggle,
  onSearchChange,
  sortColumn,
  sortDirection,
  onSort,
}) => {
  return (
    <div className="p-4 bg-white border-b">
      {/* Desktop layout */}
      <div className="hidden sm:flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <ChainSelector
            selectedChains={selectedChains}
            onChainToggle={onChainToggle}
            onSetSelectedChains={onSetSelectedChains}
          />
          <TypeSelector
            selectedTypes={selectedTypes}
            onTypeToggle={onTypeToggle}
          />
        </div>

        <div className="flex-1 flex justify-end">
          <input
            type="text"
            placeholder="Search vaults or tokens"
            value={searchTerm}
            onChange={e => onSearchChange(e.target.value)}
            className="w-full max-w-[20rem] border border-gray-300 rounded px-3 h-10 text-sm"
          />
        </div>
      </div>

      {/* Mobile layout */}
      <div className="sm:hidden">
        <Drawer>
          <DrawerTrigger asChild>
            <Button className="w-full min-h-[44px]" variant="outline">
              Filters, Sort & Search
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Filters, Sort & Search</DrawerTitle>
            </DrawerHeader>
            <div className="px-4 pb-4 space-y-4">
              <div className="space-y-2">
                <label className="text-sm text-gray-600">Search</label>
                <input
                  type="text"
                  placeholder="Search vaults or tokens"
                  value={searchTerm}
                  onChange={e => onSearchChange(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-3 text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-gray-600">Sort</label>
                <div className="flex gap-2">
                  <select
                    className="flex-1 border border-gray-300 rounded px-3 py-3 text-sm"
                    value={sortColumn as string | undefined}
                    onChange={e => onSort && onSort(e.target.value as keyof VaultListData)}
                  >
                    <option value="name">Vault</option>
                    <option value="chain">Chain</option>
                    <option value="token">Token</option>
                    <option value="type">Type</option>
                    <option value="APY">Est. APY</option>
                    <option value="tvl">TVL</option>
                  </select>
                  <Button
                    type="button"
                    variant="outline"
                    className="min-w-[96px]"
                    onClick={() => sortColumn && onSort && onSort(sortColumn)}
                    title="Toggle sort direction"
                  >
                    {sortDirection === 'desc' ? 'Desc' : 'Asc'}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-gray-600">Chains</label>
                <ChainSelector
                  selectedChains={selectedChains}
                  onChainToggle={onChainToggle}
                  onSetSelectedChains={onSetSelectedChains}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-gray-600">Vault Type</label>
                <TypeSelector
                  selectedTypes={selectedTypes}
                  onTypeToggle={onTypeToggle}
                />
              </div>
              <DrawerClose asChild>
                <Button className="w-full" variant="secondary">
                  Close
                </Button>
              </DrawerClose>
            </div>
            <DrawerFooter />
          </DrawerContent>
        </Drawer>
      </div>
    </div>
  )
}
