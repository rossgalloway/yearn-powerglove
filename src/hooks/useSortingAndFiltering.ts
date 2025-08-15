import { useState, useMemo } from 'react'
import { Strategy } from '@/types/dataTypes'
import { SortDirection } from '@/utils/sortingUtils'

export type StrategySortColumn =
  | 'name'
  | 'allocationPercent'
  | 'allocationAmount'
  | 'estimatedAPY'

export interface SortingAndFilteringState {
  sortColumn: StrategySortColumn
  sortDirection: SortDirection
  setSortColumn: (column: StrategySortColumn) => void
  setSortDirection: (direction: SortDirection) => void
  handleSort: (column: StrategySortColumn) => void
  sortedStrategies: Strategy[]
  allocatedStrategies: Strategy[]
  unallocatedStrategies: Strategy[]
}

function parseFormattedAmount(amount: string): number {
  if (amount === '0') return 0
  const num = Number.parseFloat(amount.replace(/[^0-9.]/g, ''))
  if (amount.includes('K')) return num * 1000
  if (amount.includes('M')) return num * 1000000
  return num
}

function parseFormattedPercentage(percentage: string): number {
  return Number.parseFloat(percentage.replace(/[^0-9.]/g, ''))
}

export function useSortingAndFiltering(
  strategies: Strategy[]
): SortingAndFilteringState {
  const [sortColumn, setSortColumn] =
    useState<StrategySortColumn>('allocationPercent')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  const handleSort = (column: StrategySortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
  }

  const sortedStrategies = useMemo(() => {
    return [...strategies].sort((a, b) => {
      switch (sortColumn) {
        case 'name':
          return sortDirection === 'asc'
            ? a.name.localeCompare(b.name)
            : b.name.localeCompare(a.name)
        case 'allocationPercent':
          return sortDirection === 'asc'
            ? a.allocationPercent - b.allocationPercent
            : b.allocationPercent - a.allocationPercent
        case 'allocationAmount': {
          const aVal = parseFormattedAmount(a.allocationAmount)
          const bVal = parseFormattedAmount(b.allocationAmount)
          return sortDirection === 'asc' ? aVal - bVal : bVal - aVal
        }
        case 'estimatedAPY': {
          const aVal = parseFormattedPercentage(a.estimatedAPY)
          const bVal = parseFormattedPercentage(b.estimatedAPY)
          return sortDirection === 'asc' ? aVal - bVal : bVal - aVal
        }
        default:
          return 0
      }
    })
  }, [strategies, sortColumn, sortDirection])

  const allocatedStrategies = useMemo(() => {
    return sortedStrategies.filter(strategy => strategy.allocationPercent > 0)
  }, [sortedStrategies])

  const unallocatedStrategies = useMemo(() => {
    return sortedStrategies.filter(strategy => strategy.allocationPercent === 0)
  }, [sortedStrategies])

  return {
    sortColumn,
    sortDirection,
    setSortColumn,
    setSortDirection,
    handleSort,
    sortedStrategies,
    allocatedStrategies,
    unallocatedStrategies,
  }
}
