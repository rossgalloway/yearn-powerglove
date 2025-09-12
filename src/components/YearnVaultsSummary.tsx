import React, { useState } from 'react'
import { Vault } from '../types/vaultTypes'
import { ChevronsUp, ChevronsDown } from 'lucide-react'

export function YearnVaultsSummary({
  selectedType,
  onTypeFilterChange,
}: {
  vaults: Vault[]
  selectedType: string
  onTypeFilterChange: (type: string) => void
}) {
  const [isOpen, setIsOpen] = useState(false) // State to control tray visibility

  const vaultTypes = {
    'V3 Allocator Vaults': 'V3 Allocator Vault',
    'V3 Strategy Vaults': 'V3 Strategy Vault',
    'V2 Factory Vaults': 'V2 Factory Vault',
    'V2 Legacy Vaults': 'V2 Legacy Vault',
  }

  return (
    <div className="border border-border bg-white p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Yearn Vaults Overview</h1>
        <p className="text-gray-600">Aggregate info on Yearn vaults</p>
      </div>

      {/* Collapsible Content */}
      <div
        className={`transition-all duration-300 ${isOpen ? 'max-h-screen' : 'max-h-0 overflow-hidden'}`}
      >
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {/* Vault Types Information (60% width) */}
          <div className="md:col-span-3 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(vaultTypes).map(([title, type]) => (
                <button
                  key={type}
                  className={`p-4 border border-gray-200 rounded text-left transition-colors ${
                    selectedType === type ? 'bg-gray-100' : 'hover:bg-gray-100'
                  }`}
                  onClick={() => onTypeFilterChange(type)}
                >
                  <h3 className="font-semibold mb-2">{title}</h3>
                  <p className="text-gray-600">
                    {type === 'V3 Allocator Vault'
                      ? 'ERC-4626 multi-strategy vaults. They are typically single asset vaults that allocate to lending and yield farming strategies.'
                      : type === 'V3 Strategy Vault'
                        ? 'ERC-4626 single-strategy vaults that serve as both stand-alone vaults and can also be composed together in Allocator Vaults.'
                        : type === 'V2 Factory Vault'
                          ? 'The classic V2 Yearn vaults for curve style liquidity pools. They can be created permissionlessly via factory contracts.'
                          : 'Legacy V2 Yearn vaults are a collection of single and multi-asset vaults from before the release of V3 and the Factory vaults.'}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* TVL Chart (40% width) */}
          <div className="md:col-span-2 p-4 border border-dashed border-gray-300 rounded">
            <h2 className="font-semibold mb-2">Total Value Locked (TVL)</h2>
            <div className="h-48 flex items-center justify-center text-gray-500">
              TVL Chart Placeholder
            </div>
          </div>
        </div>
      </div>

      {/* Toggle Button */}
      <div className="flex justify-start mt-1">
        <button
          className="rounded-full text-gray-600 hover:text-gray-400 transition-colors"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? (
            <span className="flex items-center gap-2 pt-2">
              Hide <ChevronsUp className="w-6 h-6 " />
            </span>
          ) : (
            <span className="flex items-center gap-2 ">
              Show More Info <ChevronsDown className="w-6 h-6 " />
            </span>
          )}
        </button>
      </div>
    </div>
  )
}
