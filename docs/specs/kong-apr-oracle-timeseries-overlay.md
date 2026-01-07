# Spec: Overlay Kong `apr-oracle` Timeseries On APY Charts

## Context

The vault detail page (`/vaults/$chainId/$vaultAddress`) currently renders APY charts from Kong REST timeseries:

- `apy-historical` (label `apy-bwd-delta-pps`, components like `weeklyNet`, `monthlyNet`)
- `pps` (component `humanized`)
- `tvl` (label `tvl-c`, component `tvl`)

Kong also produces an `apr-oracle` timeseries output (components: `apr`, `apy`) for Yearn v3 vaults. We want to visualize that oracle series overlaid with the existing APY chart lines.

## Goals

- Fetch `apr-oracle` timeseries from Kong REST for v3 vaults.
- Add an “Oracle APY” line to the Historical Performance chart, overlaid with existing APY lines.
- Keep behavior graceful when the oracle timeseries is missing (404/empty): no crashes; chart still renders.

## Non-goals

- Changing how the current APR-oracle **spot** value is fetched (current on-chain `useAprOracle` usage stays as-is).
- Backfilling or generating oracle timeseries data (handled by Kong).
- Redesigning the chart UI beyond adding a new series toggle/legend entry.

## Dependencies / Assumptions

- Kong REST exposes an `apr-oracle` segment via `/api/rest/timeseries/<segment>/<chainId>/<address>`.
  - Today, Kong’s REST `labels.ts` includes `pps`, `apy-historical`, and `tvl` segments; `apr-oracle` may require a Kong change to add:
    - `label: 'apr-oracle'`
    - `segment: 'apr-oracle'`
    - `defaultComponent: 'apy'` (or similar)

## Proposed Implementation

### Data fetching

- Extend `src/hooks/useVaultPageData.ts` to fetch oracle timeseries via `useRestTimeseries`:
  - `segment: 'apr-oracle'`
  - `components: ['apy']` (optionally also fetch `apr` if we decide to expose it later)
  - `enabled: Boolean(vaultDetails?.v3)` (or based on `vaultChainId` + vault kind if that’s more accurate)
- Keep using the existing `fetchTimeseries()` behavior (404 → `[]`).

### Chart data transform

- Extend `src/hooks/useChartData.ts` to accept `aprOracleData` and merge it into the output `aprApyChartData` as a new key:
  - `oracleApy: number | null` (in percent)
- Align/normalize timestamps the same way as existing series (fill missing days across the combined time range).

### Chart rendering

- Update `src/components/charts/APYChart.tsx`:
  - Add a new `SeriesKey` (e.g. `oracleApy`)
  - Add a config entry + legend toggle (“Oracle APY”)
  - Render an additional `<Line dataKey="oracleApy" ... />`
  - Consider styling differences (e.g. dashed line) so the oracle overlay is visually distinct.

### Types and tests

- Extend `src/types/dataTypes.ts` `aprApyChartData` to include `oracleApy` (optional or required once wired).
- Update `src/__tests__/charts.test.tsx` to cover toggling/rendering of the new series key.

## Acceptance Criteria

- On a v3 vault with available `apr-oracle` REST data, the Historical Performance chart shows an additional “Oracle APY” line.
- The Oracle APY line can be toggled on/off via the chart legend control.
- If the `apr-oracle` REST endpoint returns 404/empty, the page still renders and charts behave as before.
- `bun run test` passes.

## Manual QA Steps

1. Run `bun run dev`.
2. Visit a v3 vault page on a supported chain.
3. Confirm the APY chart includes “Oracle APY” and overlays correctly with existing lines.
4. Toggle “Oracle APY” off/on and confirm the line disappears/returns.
5. Temporarily point `segment: 'apr-oracle'` to an invalid segment (or simulate 404) and confirm charts still render without errors.

