import React from 'react'
import { Link } from '@tanstack/react-router'
import { getChainIdByName } from '@/constants/chains'
import { OptimizedImage } from '../ui/OptimizedImage'

export interface VaultListData {
  id: string
  name: string
  chain: string
  chainIconUri: string
  token: string
  tokenUri: string
  type: string
  APY: string
  tvl: string
}

interface VaultRowProps {
  vault: VaultListData
}

export const VaultRow: React.FC<VaultRowProps> = ({ vault }) => {
  return (
    <Link
      to="/vaults/$chainId/$vaultAddress"
      params={{
        chainId: (getChainIdByName(vault.chain) || 1).toString(),
        vaultAddress: vault.id,
      }}
      className="flex px-6 py-2 border-b hover:bg-muted/40 transition-colors cursor-pointer bg-white"
      style={{ height: '50px' }}
    >
      <div className="flex-[2] text-left flex items-center">{vault.name}</div>
      <div className="flex-1 flex justify-end items-center gap-2">
        {vault.chain}
        {vault.chainIconUri ? (
          <OptimizedImage
            src={vault.chainIconUri}
            alt={vault.chain}
            className="w-6 h-6"
            fallbackClassName="w-6 h-6"
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
          <OptimizedImage
            src={vault.tokenUri}
            alt={vault.token}
            className="w-6 h-6"
            fallbackClassName="w-6 h-6"
          />
        ) : (
          <div className="w-6 h-6 flex items-center justify-center bg-gray-300 rounded-full">
            ❓
          </div>
        )}
      </div>
      <div className="flex-1 text-right flex items-center justify-end">
        {vault.type}
      </div>
      <div className="flex-1 text-right flex items-center justify-end">
        {vault.APY}
      </div>
      <div className="flex-1 text-right flex items-center justify-end">
        {vault.tvl}
      </div>
    </Link>
  )
}
