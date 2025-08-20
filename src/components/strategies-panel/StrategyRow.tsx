import React from 'react'
import { Link } from '@tanstack/react-router'
import { ChevronDown, ChevronRight, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  CHAIN_ID_TO_NAME,
  CHAIN_ID_TO_BLOCK_EXPLORER,
} from '@/constants/chains'
import { Strategy } from '@/types/dataTypes'

interface StrategyRowProps {
  strategy: Strategy
  isExpanded: boolean
  onToggle: () => void
  isUnallocated?: boolean
}

export const StrategyRow: React.FC<StrategyRowProps> = React.memo(
  ({ strategy, isExpanded, onToggle, isUnallocated = false }) => {
    return (
      <div
        className={cn(
          'border-t border-[#f5f5f5]',
          (strategy.allocationPercent === 0 || isUnallocated) && 'opacity-50'
        )}
      >
        {/* Main Row */}
        <div
          className={cn(
            'flex items-center p-3 hover:bg-[#f5f5f5]/50 cursor-pointer',
            isExpanded && 'bg-[#f5f5f5]/30'
          )}
          onClick={onToggle}
        >
          <div className="w-8 flex justify-center">
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-[#4f4f4f]" />
            ) : (
              <ChevronRight className="w-4 h-4 text-[#4f4f4f]" />
            )}
          </div>
          <div className="w-[calc(50%-2rem)] flex items-center gap-2">
            <div className="flex items-center">
              {strategy.tokenIconUri ? (
                <img
                  src={strategy.tokenIconUri}
                  alt={strategy.tokenSymbol}
                  className="w-6 h-6"
                />
              ) : (
                <div className="w-6 h-6 flex items-center justify-center bg-gray-300 rounded-full text-white">
                  ?
                </div>
              )}
            </div>
            <span className="font-medium">{strategy.name}</span>
          </div>
          <div className="w-1/6 text-right">
            {strategy.allocationPercent.toFixed(1)}%
          </div>
          <div className="w-1/6 text-right">{strategy.allocationAmount}</div>
          <div className="w-1/6 text-right">{strategy.estimatedAPY} APY</div>
        </div>

        {/* Expanded Details */}
        {isExpanded && (
          <div className="bg-[#f5f5f5]/30 px-12 py-4 border-t border-[#f5f5f5]">
            <div className="flex gap-4 mb-4">
              {strategy.details.isVault && (
                <Link
                  to="/vaults/$chainId/$vaultAddress"
                  params={{
                    chainId: strategy.details.chainId.toString(),
                    vaultAddress: strategy.details.vaultAddress,
                  }}
                  className="px-3 py-1 bg-[#f5f5f5] text-sm flex items-center gap-1 hover:bg-[#e5e5e5] transition-colors"
                >
                  Data
                </Link>
              )}
              {strategy.details.isEndorsed && strategy.details.isVault && (
                <a
                  href={`https://yearn.fi/v3/${strategy.details.chainId}/${strategy.details.vaultAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1 bg-[#f5f5f5] text-sm flex items-center gap-1 hover:bg-[#e5e5e5] transition-colors"
                >
                  Vault
                  <ExternalLink className="w-3 h-3 text-[#4f4f4f]" />
                </a>
              )}
              <a
                href={`${CHAIN_ID_TO_BLOCK_EXPLORER[Number(strategy.details.chainId)]}/address/${strategy.details.vaultAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1 bg-[#f5f5f5] text-sm flex items-center gap-1 hover:bg-[#e5e5e5] transition-colors"
              >
                {strategy.details.vaultAddress}
                <ExternalLink className="w-3 h-3 text-[#4f4f4f]" />
              </a>
            </div>
            <div className="space-y-1 text-sm">
              <div>
                Chain: {CHAIN_ID_TO_NAME[Number(strategy.details.chainId)]}
              </div>
              <div>
                Management Fee:{' '}
                {strategy.details.managementFee
                  ? `${(Number(strategy.details.managementFee) / 100).toFixed(0)}%`
                  : '0%'}
              </div>
              <div>
                Performance Fee:{' '}
                {strategy.details.performanceFee
                  ? `${(Number(strategy.details.performanceFee) / 100).toFixed(0)}%`
                  : '0%'}
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }
)
