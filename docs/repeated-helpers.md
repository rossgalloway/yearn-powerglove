# Repeated Helper Cleanup

This document catalogs the helper logic that is duplicated across the repo and outlines how to consolidate it into shared utilities. Each section lists where the current implementation lives and proposes a single source of truth (with example code) to simplify future maintenance.

---

## 1. Percentage Formatting (`formatPercent`)

**Current copies**

- `src/lib/apr-oracle.ts:53-64`
- `src/hooks/useMainInfoPanelData.ts:29-33`
- `src/routes/vaults/$chainId/$vaultAddress/index.tsx:84-92`

All three versions do the same input checks (`null`, `undefined`, `NaN`) and render the value with two decimals plus a `%` suffix.

**Consolidation**

Create a shared helper (either in `src/lib/utils.ts` or a new `src/lib/formatters.ts`) and import it everywhere:

```ts
// src/lib/formatters.ts
export const formatPercent = (value?: number | null): string => {
  if (value === null || value === undefined) return ' - '
  if (!Number.isFinite(value)) return ' - '
  return `${value.toFixed(2)}%`
}

export const formatPercentNullable = (value: number | null): string | null => {
  if (value === null || !Number.isFinite(value)) return null
  return `${value.toFixed(2)}%`
}
```

`formatPercentNullable` preserves the `null` return that APR oracle consumers rely on, while `formatPercent` can stay UI-friendly (returning `' - '`).

---

## 2. Vault presentation helpers

**Current situation**

- `src/hooks/useMainInfoPanelData.ts` re-implements:
  - deployment date formatting (`format` + `inceptTime`)
  - token icon lookup via `tokenAssets.find`
  - `Intl.NumberFormat` TVL formatting
  - block explorer + Yearn links
  - fee percentage strings
- `src/utils/vaultDataUtils.ts` already exports `formatVaultDate`, `formatVaultTVL`, `resolveTokenIcon`, `generateVaultLinks`, `formatVaultMetrics`, etc., but most of them go unused elsewhere.

**Consolidation**

Refactor the hook to consume the shared helpers:

```ts
import {
  formatVaultDate,
  formatVaultTVL,
  resolveTokenIcon,
  formatVaultMetrics,
  generateVaultLinks,
  getVaultNetworkInfo,
} from '@/utils/vaultDataUtils'

const { managementFee, performanceFee } = formatVaultMetrics(vaultDetails)
const { blockExplorerLink, yearnVaultLink } = generateVaultLinks(vaultDetails)
const vaultToken = {
  icon: resolveTokenIcon(vaultDetails.asset.address, vaultDetails.asset.symbol, tokenAssets),
  name: vaultDetails.asset.symbol,
}

return {
  deploymentDate: formatVaultDate(vaultDetails.inceptTime),
  totalSupply: formatVaultTVL(vaultDetails.tvl?.close),
  network: getVaultNetworkInfo(vaultDetails.chainId),
  managementFee,
  performanceFee,
  blockExplorerLink,
  yearnVaultLink,
  // ...rest
}
```

This leaves `useMainInfoPanelData` responsible only for combining the pieces instead of reproducing the formatting logic.

---

## 3. Chart timeframe limits

**Current copies**

`getTimeframeLimit` is defined separately in:

- `src/components/charts/APYChart.tsx:223-242`
- `src/components/charts/PPSChart.tsx:153-172`
- `src/components/charts/TVLChart.tsx:120-139`

**Consolidation**

Create `src/components/charts/chart-utils.ts` (or add to `chart-container.tsx`) with a shared helper:

```ts
const TIMEFRAME_LIMITS: Record<string, number> = {
  '7d': 7,
  '30d': 30,
  '90d': 90,
  '180d': 180,
  '1y': 365,
}

export const getTimeframeLimit = (timeframe: string): number =>
  TIMEFRAME_LIMITS[timeframe] ?? 1000
```

Then import it in every chart component. One function means adding a new preset only requires a single edit.

---

## 4. Vault type labels & token icon lookup

**Current copies**

- `src/hooks/useVaultListData.ts:12-45` defines an inline `vaultTypes` map and performs a lowercase token asset lookup.
- The label data already exists in `src/constants/chains.ts` (`VAULT_TYPE_TO_NAME`) and the lookup logic exists in `resolveTokenIcon`.

**Consolidation**

```ts
import { VAULT_TYPE_TO_NAME } from '@/constants/chains'
import { resolveTokenIcon } from '@/utils/vaultDataUtils'

const vaultTypes = useMemo(() => VAULT_TYPE_TO_NAME, [])
const tokenUri = resolveTokenIcon(vault.asset.address, vault.asset.symbol, tokenAssets)
```

`useVaultListData` currently handles important nuance (e.g., distinguishing V3 Allocator vs. V2 Factory vs. Legacy Vaults by combining `apiVersion`, `vaultType`, and `name`). Preserve that logic by extracting it into a shared helper:

```ts
export function getVaultDisplayType(vault: Vault): string {
  if (vault.apiVersion?.startsWith('3')) return 'V3 Allocator Vault'
  if (vault.apiVersion?.startsWith('0')) {
    return vault.name.includes('Factory') ? 'V2 Factory Vault' : 'V2 Legacy Vault'
  }
  return 'External Vault'
}
```

Once that helper lives in `vaultDataUtils.ts` (or a new `vaultDisplay.ts`), every consumer can filter/sort with the same granular categories while still leaning on `VAULT_TYPE_TO_NAME` for the simple cases.

---

## 5. Currency formatting

**Current copies**

- `Intl.NumberFormat` in `src/hooks/useMainInfoPanelData.ts:57-63`
- `value.toLocaleString` with ad-hoc options in `src/hooks/useVaultListData.ts:46-52`
- `formatVaultTVL` in `src/utils/vaultDataUtils.ts:91-96`

**Consolidation**

Define a shared formatter:

```ts
const usdFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export const formatCurrency = (value?: number | null): string =>
  usdFormatter.format(value ?? 0)
```

Expose it from `formatters.ts` and have both the main info panel and vault list call `formatCurrency(vault.tvl?.close)` instead of duplicating options each time. This also makes it straightforward to honor locale settings later.

---

## Implementation Checklist

1. **Create shared helpers** (`formatters.ts`, `chart-utils.ts`) and re-export from `src/lib/utils.ts` if desired.
2. **Update consumers** to import from the new modules, deleting inline copies.
3. **Run `bun run lint && bun run test`** to ensure type references update cleanly.
4. **Remove unused code** from `src/utils/vaultDataUtils.ts` once the new imports replace them (or conversely, move the hook logic there so the file stays the canonical home).

Consolidating these helpers reduces discrepancies between screens, makes future renames (e.g., new timeframes) safer, and improves the odds that new code paths automatically benefit from formatting fixes.***
