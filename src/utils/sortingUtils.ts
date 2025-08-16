export type SortDirection = 'asc' | 'desc'

export interface SortableItem {
  [key: string]: string | number
}

export function sortByString<T extends SortableItem>(
  items: T[],
  key: keyof T,
  direction: SortDirection
): T[] {
  return [...items].sort((a, b) => {
    const aVal = String(a[key])
    const bVal = String(b[key])
    return direction === 'asc'
      ? aVal.localeCompare(bVal)
      : bVal.localeCompare(aVal)
  })
}

export function sortByNumber<T extends SortableItem>(
  items: T[],
  key: keyof T,
  direction: SortDirection
): T[] {
  return [...items].sort((a, b) => {
    const aVal = Number(a[key])
    const bVal = Number(b[key])
    return direction === 'asc' ? aVal - bVal : bVal - aVal
  })
}

export function parseFormattedAmount(amount: string): number {
  if (amount === '0') return 0
  const num = Number.parseFloat(amount.replace(/[^0-9.]/g, ''))
  if (amount.includes('K')) return num * 1000
  if (amount.includes('M')) return num * 1000000
  return num
}

export function parseFormattedPercentage(percentage: string): number {
  return Number.parseFloat(percentage.replace(/[^0-9.]/g, ''))
}

export function sortByFormattedAmount<T extends { [K in keyof T]: string }>(
  items: T[],
  key: keyof T,
  direction: SortDirection
): T[] {
  return [...items].sort((a, b) => {
    const aVal = parseFormattedAmount(String(a[key]))
    const bVal = parseFormattedAmount(String(b[key]))
    return direction === 'asc' ? aVal - bVal : bVal - aVal
  })
}

export function sortByFormattedPercentage<T extends { [K in keyof T]: string }>(
  items: T[],
  key: keyof T,
  direction: SortDirection
): T[] {
  return [...items].sort((a, b) => {
    const aVal = parseFormattedPercentage(String(a[key]))
    const bVal = parseFormattedPercentage(String(b[key]))
    return direction === 'asc' ? aVal - bVal : bVal - aVal
  })
}
