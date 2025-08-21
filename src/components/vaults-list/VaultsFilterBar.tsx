import React from 'react'
import { ChainSelector } from './ChainSelector'
import { TypeSelector } from './TypeSelector'

interface VaultsFilterBarProps {
  selectedChains: number[]
  selectedTypes: string[]
  searchTerm: string
  onChainToggle: (chainId: number) => void
  onSetSelectedChains?: (chainIds: number[]) => void
  onTypeToggle: (type: string) => void
  onSearchChange: (term: string) => void
}

export const VaultsFilterBar: React.FC<VaultsFilterBarProps> = ({
  selectedChains,
  selectedTypes,
  searchTerm,
  onChainToggle,
  onSetSelectedChains,
  onTypeToggle,
  onSearchChange,
}) => {
  return (
    <div className="flex items-center justify-between gap-4 p-4 bg-white border-b">
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
  )
}
