import React from 'react'
import { Link } from '@tanstack/react-router'
import { getChainIdByName } from '@/constants/chains'
import { OptimizedImage } from '../ui/OptimizedImage'
import { formatCompactUSD, parseNumeric } from '@/utils/numberFormat'

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
      className="sm:px-6 border-b hover:bg-muted/40 transition-colors cursor-pointer bg-white sm:min-w-[720px]"
      style={{ height: '100%' }}
    >
      {/* Mobile: two-row layout */}
      <div className="block sm:hidden px-[10px] py-1 border-b-[1px]">
        <div className="flex items-start justify-between gap-3">
          <div className="font-medium truncate pr-3 leading-tight">
            {vault.name}
          </div>
          <div className="text-right whitespace-nowrap font-medium">
            {vault.APY} APY
          </div>
        </div>
        <div className="mt-2 flex items-center justify-between text-xs text-gray-700">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex items-center gap-1 min-w-0">
              {vault.tokenUri ? (
                <OptimizedImage
                  src={vault.tokenUri}
                  alt={vault.token}
                  className="w-4 h-4"
                  fallbackClassName="w-4 h-4"
                />
              ) : (
                <div className="w-4 h-4 flex items-center justify-center bg-gray-300 rounded-full">
                  ❓
                </div>
              )}
              <span className="truncate">{vault.token}</span>
            </div>
            <div className="flex items-center gap-1 min-w-0">
              {vault.chainIconUri ? (
                <OptimizedImage
                  src={vault.chainIconUri}
                  alt={vault.chain}
                  className="w-4 h-4"
                  fallbackClassName="w-4 h-4"
                />
              ) : (
                <div className="w-4 h-4 flex items-center justify-center bg-gray-300 rounded-full text-white">
                  ?
                </div>
              )}
              <span className="truncate">{vault.chain}</span>
            </div>
          </div>
          <div className="text-right whitespace-nowrap font-medium text-gray-800">
            {formatCompactUSD(parseNumeric(vault.tvl))} TVL
          </div>
        </div>
      </div>

      {/* Desktop: original columns */}
      <div className="hidden sm:flex" style={{ height: '50px' }}>
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
      </div>
    </Link>
  )
}
