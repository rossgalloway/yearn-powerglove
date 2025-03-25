import React from 'react'

export function YearnVaultsSummary() {
  return (
    <div className="border border-border bg-white p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Yearn Vaults Overview</h1>
        <p className="text-gray-600">Aggregate info on all Yearn vaults</p>
      </div>

      {/* TVL Chart Placeholder */}
      <div className="mb-6 p-4 border border-dashed border-gray-300 rounded">
        <h2 className="font-semibold mb-2">Total Value Locked (TVL)</h2>
        {/* Placeholder for TVL Chart */}
        <div className="h-48 flex items-center justify-center text-gray-500">
          TVL Chart Placeholder
        </div>
      </div>

      {/* Vault Types Information */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="p-4 border border-gray-200 rounded">
          <h3 className="font-semibold mb-2">Vault Type A</h3>
          <p className="text-gray-600">
            Placeholder information for Vault Type A.
          </p>
        </div>
        <div className="p-4 border border-gray-200 rounded">
          <h3 className="font-semibold mb-2">Vault Type B</h3>
          <p className="text-gray-600">
            Placeholder information for Vault Type B.
          </p>
        </div>
        {/* You can add more vault type sections as needed */}
      </div>
    </div>
  )
}
