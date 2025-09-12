export function formatCompactUSD(value: number): string {
  const formatted = new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value)
  return `$${formatted}`
}

export function parseNumeric(input: string | number | null | undefined): number {
  if (typeof input === 'number') return input
  if (!input) return 0
  const cleaned = String(input).replace(/[^0-9.-]+/g, '')
  const num = Number(cleaned)
  return Number.isFinite(num) ? num : 0
}

