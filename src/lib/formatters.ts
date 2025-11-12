const usdFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

type PercentFormatOptions = {
  decimals?: number
  fallback?: string
}

const isNumeric = (value: number | null | undefined): value is number =>
  value !== null && value !== undefined && Number.isFinite(value)

export const formatPercent = (
  value?: number | null,
  options: PercentFormatOptions = {}
): string => {
  const { decimals = 2, fallback = ' - ' } = options
  if (!isNumeric(value)) {
    return fallback
  }
  return `${value.toFixed(decimals)}%`
}

export const formatPercentNullable = (
  value?: number | null,
  options: PercentFormatOptions = {}
): string | null => {
  const { decimals = 2 } = options
  if (!isNumeric(value)) {
    return null
  }
  return `${value.toFixed(decimals)}%`
}

export const formatPercentFromDecimal = (
  value?: number | null,
  options: PercentFormatOptions = {}
): string => {
  if (!isNumeric(value)) {
    return options.fallback ?? ' - '
  }
  return formatPercent(value * 100, options)
}

export const formatCurrency = (value?: number | null): string =>
  usdFormatter.format(value ?? 0)
