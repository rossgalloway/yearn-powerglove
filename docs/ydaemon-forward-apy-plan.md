# yDaemon Forward APY Integration Plan

## Overview

- Goal: source the “Estimated APY” displayed across Powerglove (vault summary + strategies table) from yDaemon’s canonical feed rather than from PPS-derived metrics or direct APR-oracle calls.
- yDaemon already folds the APR oracle output into `apr.forwardAPR.netAPR` for v3 vaults and provides alternative heuristics for non-v3 vaults, giving us a single field we can trust across all vault types.
- APR-oracle RPC reads remain useful as a fallback when the REST call fails or when yDaemon’s payload is missing `forwardAPR` data.
- The existing KONG GraphQL queries stay in place; the plan is to enrich those results with yDaemon fields (matched by chain + address) without changing the broader data flow.

## Reference: yearn.fi Implementation

- `apps/lib/hooks/useFetchYearnVaults.ts` fetches `/vaults` and `/vaults/retired` from yDaemon, requesting strategy details and caching for 1h.
- `apps/lib/utils/schemas/yDaemonVaultsSchemas.ts` defines a zod schema for the payload, including `apr.forwardAPR.netAPR`, per-strategy `netAPR`, and forward APR metadata (type/composite boosts).
- The UI consumes the parsed result everywhere an APY is shown (`apps/vaults/components/table/VaultForwardAPY.tsx`, `apps/vaults-v2/hooks/useSortVaults.ts`, etc.), so no direct APR-oracle wiring is needed in the frontend.

## Powerglove Changes

### 1. API Client + Config

- Reuse the existing `VITE_PUBLIC_YDAEMON_URL` env (already present in this repo) and document that the client reads from it directly.
- Create `src/lib/ydaemon-client.ts` responsible for:
  - Building endpoints like `/vaults?orderBy=featuringScore&strategiesDetails=withDetails` and `/vaults/{address}?chainId=` with query params aligning to existing GraphQL filters.
  - Parsing responses via lightweight zod schemas (can trim down the yearn.fi schema to the fields Powerglove needs).
  - Surfacing typed helpers such as `fetchVaultsList()`, `fetchVaultDetails(chainId, address)`, and `fetchVaultReports(chainId, address)` if needed for detail pages.

### 2. React Query Hooks & Context

- Add `useYDaemonVaults` (list) and `useYDaemonVault` (single) hooks that wrap the client in `@tanstack/react-query`, sharing the global `QueryClient`.
- Extend `VaultsProvider` so that after the KONG query resolves we fetch the yDaemon list and merge only the needed fields (forward APR + strategy APRs) back into the existing vault objects keyed by `(chainId,address)`.
- Keep GraphQL/KONG as the source for structural data, filters, and timeseries; the merged object is what downstream hooks/components consume.

### 3. UI Consumers

- **Vault summary (`MainInfoPanel`)**
  - Use `mergedVault.forwardAPR.netAPR` (formatted %) for the “1-day / Est. APY” row.
  - When `forwardAPR.netAPR` is missing, trigger the existing APR-oracle hook as a fallback (no additional badges or tooltips required right now).
- **Strategies panel**
  - Prefer yDaemon’s per-strategy `netAPR` for each row’s “Est. APY”.
  - When `strategy.netAPR` is `0` or undefined, call `fetchAprOracle` for that strategy address, reusing the batching logic implemented earlier.
  - Keep tracking the data source internally for troubleshooting, but no UI indicator change is needed at this stage.
- **Charts / analytics**
  - No changes; continue using the existing PPS-derived data for the chart components.

### 4. Error Handling & Fallback Strategy

- Wrap yDaemon fetches with sensible `retry` + `staleTime` defaults (client-side caching is sufficient; no server/proxy cache needed).
- If a request errors or `forwardAPR.netAPR` is `null`, call `fetchAprOracle` (vault-level) and cache that response for the same key.
- Log failures via the same mechanism as other data fetches; if we later add telemetry (see `docs/todo-list.md`), plug yDaemon errors into that stream too.

### 5. Testing Plan

- Unit-test the new client utilities with mocked fetch responses (happy path, missing fields, HTTP errors).
- Add React Query hook tests using `@tanstack/react-query/testing` to ensure cache keys and fallback logic behave as expected.
- Component tests:
  - `MainInfoPanel` renders yDaemon APY when provided, falls back to oracle when not.
  - `StrategiesPanel` rows prefer yDaemon `netAPR` values.
- Manual QA:
  - Compare APYs in Powerglove vs. yearn.fi for a sample of v3, legacy, and factory vaults.
  - Simulate yDaemon outages (e.g., mock failing fetch) and confirm oracle fallback appears.

### 6. Migration / Cleanup

- GraphQL/KONG queries remain intact; we simply enrich their results with forward APR data.
- Keep the APR-oracle utilities and env vars; they now serve as resilience rather than the main pipeline.

## Confirmed Answers

1. **List ordering** – stay with the existing KONG ordering; do not change to yDaemon featuring scores.
2. **Caching** – client-side React Query caching is sufficient; no additional proxy layer is required.
3. **Fallback cues** – immediate UI work is deferred; add a TODO (see `docs/todo-list.md`) to surface a toast when the oracle fallback activates so users understand degraded precision.
