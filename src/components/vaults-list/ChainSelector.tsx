import React, { useState, useMemo, useEffect, useRef } from 'react'
import { Filter, X } from 'lucide-react'
import { CHAIN_ID_TO_ICON, CHAIN_ID_TO_NAME } from '@/constants/chains'

// --- I've added a constants object for better maintainability ---
const CONSTANTS = {
  ICON_WIDTH_EXPANDED: 32, // px spacing between icons when expanded
  ICON_WIDTH_COLLAPSED: 16, // px spacing between icons when collapsed
  ICON_BUTTON_WIDTH: 48, // Width of the icon button itself
  BUTTON_PADDING_X: 12, // px-3
  FILTER_ICON_WIDTH: 16, // w-4
  FILTER_ICON_MARGIN_RIGHT: 8, // mr-2
}

interface ChainSelectorProps {
  selectedChains: number[]
  onChainToggle: (chainId: number) => void
  onSetSelectedChains?: (chainIds: number[]) => void
}

interface IconData {
  chainId: number
  name: string
  icon: string
  targetX: number
  isSelected: boolean
}

// --- I've extracted the icon position calculation into a custom hook ---
const useIconPositions = (
  chains: { id: number; name: string; icon: string }[],
  selectedChains: number[],
  isExpanded: boolean
): IconData[] => {
  const ICON_WIDTH = isExpanded
    ? CONSTANTS.ICON_WIDTH_EXPANDED
    : CONSTANTS.ICON_WIDTH_COLLAPSED

  return useMemo(() => {
    const findNearestSelected = (unselectedIndex: number): number => {
      if (selectedChains.length === 0) return 0
      let minDistance = Infinity
      let nearestIndex = 0
      selectedChains.forEach(selectedId => {
        const selectedIndex = chains.findIndex(c => c.id === selectedId)
        if (selectedIndex !== -1) {
          const distance = Math.abs(selectedIndex - unselectedIndex)
          if (distance < minDistance) {
            minDistance = distance
            nearestIndex = selectedIndex
          }
        }
      })
      return nearestIndex
    }

    if (isExpanded) {
      return chains.map((chain, index) => ({
        chainId: chain.id,
        name: chain.name,
        icon: chain.icon,
        targetX: index * ICON_WIDTH,
        isSelected: selectedChains.includes(chain.id),
      }))
    }

    const selectedChainObjects = chains.filter(chain =>
      selectedChains.includes(chain.id)
    )
    return chains.map((chain, index) => {
      const isSelected = selectedChains.includes(chain.id)
      if (isSelected) {
        const selectedIndex = selectedChainObjects.findIndex(
          sc => sc.id === chain.id
        )
        return {
          chainId: chain.id,
          name: chain.name,
          icon: chain.icon,
          targetX: selectedIndex * ICON_WIDTH,
          isSelected: true,
        }
      } else {
        const nearestSelectedIndex = findNearestSelected(index)
        const nearestSelectedId = chains[nearestSelectedIndex]?.id
        const packedIndex = selectedChainObjects.findIndex(
          sc => sc.id === nearestSelectedId
        )
        return {
          chainId: chain.id,
          name: chain.name,
          icon: chain.icon,
          targetX: Math.max(0, packedIndex) * ICON_WIDTH,
          isSelected: false,
        }
      }
    })
  }, [chains, selectedChains, isExpanded, ICON_WIDTH])
}

// --- I've extracted the width calculation into a custom hook ---
const useComponentWidth = (
  buttonText: string,
  isExpanded: boolean,
  hasSelectedChains: boolean,
  chainCount: number,
  selectedChainCount: number
) => {
  const textRef = useRef<HTMLSpanElement>(null)
  const [textWidth, setTextWidth] = useState(0)

  useEffect(() => {
    if (textRef.current) {
      setTextWidth(textRef.current.offsetWidth)
    }
  }, [buttonText])

  const containerWidth = useMemo(() => {
    const baseWidth =
      textWidth +
      CONSTANTS.BUTTON_PADDING_X * 2 +
      CONSTANTS.FILTER_ICON_WIDTH +
      CONSTANTS.FILTER_ICON_MARGIN_RIGHT

    if (isExpanded) {
      const iconsWidth =
        (chainCount - 1) * CONSTANTS.ICON_WIDTH_EXPANDED +
        CONSTANTS.ICON_BUTTON_WIDTH
      return baseWidth + iconsWidth
    }
    if (hasSelectedChains) {
      const iconsWidth =
        (selectedChainCount - 1) * CONSTANTS.ICON_WIDTH_COLLAPSED +
        CONSTANTS.ICON_BUTTON_WIDTH
      return baseWidth + iconsWidth
    }
    return baseWidth
  }, [textWidth, isExpanded, hasSelectedChains, chainCount, selectedChainCount])

  return { textRef, containerWidth }
}

export const ChainSelector: React.FC<ChainSelectorProps> = ({
  selectedChains,
  onChainToggle,
  onSetSelectedChains,
}) => {
  // --- Component state ---
  const [isHovered, setIsHovered] = useState(false)
  const [buttonText, setButtonText] = useState('Filter Chains')
  const isExpanded = isHovered

  // --- Derived data and constants ---
  const chains = useMemo(
    () =>
      Object.entries(CHAIN_ID_TO_NAME).map(([id, name]) => ({
        id: Number(id),
        name,
        icon: CHAIN_ID_TO_ICON[Number(id)],
      })),
    []
  )
  const allSelected =
    selectedChains.length === 0 || selectedChains.length === chains.length
  const hasSelectedChains = selectedChains.length > 0 && !allSelected

  // --- Custom hooks for complex logic ---
  const iconPositions = useIconPositions(chains, selectedChains, isExpanded)
  const { textRef, containerWidth } = useComponentWidth(
    buttonText,
    isExpanded,
    hasSelectedChains,
    chains.length,
    selectedChains.length
  )

  // --- Effect for managing button text and selection reset ---
  useEffect(() => {
    if (!isExpanded) {
      if (onSetSelectedChains && selectedChains.length === chains.length) {
        onSetSelectedChains([])
        return
      }
      setButtonText(hasSelectedChains ? 'Selected Chains' : 'Filter Chains')
    }
  }, [
    isExpanded,
    hasSelectedChains,
    onSetSelectedChains,
    selectedChains.length,
    chains.length,
  ])

  // --- Event handlers ---
  const handleClearSelection = () => {
    if (onSetSelectedChains) {
      onSetSelectedChains([])
    }
  }

  const handleIconClick = (chainId: number) => {
    if (isExpanded && allSelected && onSetSelectedChains) {
      onSetSelectedChains([chainId])
      return
    }
    onChainToggle(chainId)
  }

  // --- Render logic ---
  return (
    <div
      className={`relative flex h-10 items-center border rounded-md transition-all duration-200 ${
        isHovered ? 'border-gray-400 shadow-sm' : 'border-gray-300'
      } bg-white`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ width: containerWidth }}
    >
      {/* Button content */}
      <div className="flex items-center px-3 py-2">
        {isExpanded && hasSelectedChains ? (
          <button
            onClick={handleClearSelection}
            className="mr-2 p-0 border-none bg-transparent cursor-pointer hover:text-gray-800"
            title="Clear selection"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        ) : (
          <Filter className="w-4 h-4 text-gray-500 mr-2" />
        )}
        <span
          ref={textRef}
          className="text-sm font-medium text-gray-700 whitespace-nowrap"
        >
          {buttonText}
        </span>
      </div>

      {/* Icon container */}
      {(isExpanded || hasSelectedChains) && (
        <div className="relative h-10 flex-1">
          {iconPositions.map(iconData => (
            <button
              key={iconData.chainId}
              className={`absolute flex items-center justify-center rounded-full transition-all duration-300 ease-in-out focus:outline-none ${
                iconData.isSelected
                  ? `z-10 w-8 h-8 ${isExpanded ? 'border border-blue-500' : ''}`
                  : `z-5 ${isExpanded ? 'w-8 h-8 ' : 'w-6 h-6'}`
              }`}
              style={{
                transform: `translateX(${iconData.targetX}px)`,
                top: iconData.isSelected || isExpanded ? '4px' : '8px',
              }}
              onClick={() => handleIconClick(iconData.chainId)}
              title={iconData.name}
            >
              <div
                className={`absolute w-6 h-6 bg-white rounded-full ${iconData.isSelected ? '' : 'opacity-50'}`}
                style={{
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                }}
              />
              <img
                src={iconData.icon}
                alt={iconData.name}
                className={`relative z-10 ${
                  iconData.isSelected || isExpanded ? 'w-6 h-6' : 'w-4 h-4'
                } ${iconData.isSelected ? '' : 'filter grayscale'}`}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
