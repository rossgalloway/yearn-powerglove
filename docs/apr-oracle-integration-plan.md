# APR Oracle Integration Plan

## Goals & Scope

- Replace the derived “1-day APY” shown on the vault detail page (`src/routes/vaults/$chainId/$vaultAddress/index.tsx`) with data returned by the APR Oracle contract for every v3 (“allocator” or “strategy”) vault.
- Surface the same oracle-derived yield inside the strategies table (`src/components/strategies-panel/StrategyTable.tsx`) by updating the `estimatedAPY` value returned by `useStrategiesData`.
- Defer to existing PPS-derived 1-day APY only for vault classes that do not have oracle coverage (factory + legacy vaults, or when RPC requests fail).
- Reuse the battle-tested request flow from `../yearn-oracle-watch` (see `packages/sdk/src/datasources/CoreDataSource.ts`) including delta-aware calls, fallback RPCs, caching, and error handling, without re-implementing the entire SDK stack.

## Reference Implementation Highlights (`../yearn-oracle-watch`)

1. `CoreDataSource.getAprOracleData` issues two `readContracts` batched calls against `aprOracleAbi` and `aprOracleAddress` (see `packages/contracts/src/abis/AprOracle.json` / `wagmi.ts`), requesting:
   - `getStrategyApr(vaultAddress, 0n)` to get the current APR baseline.
   - `getStrategyApr(vaultAddress, delta)` to simulate a deposit/withdrawal.
   - On failure, the same arguments are retried with `getExpectedApr`.
2. The hook `packages/app/src/hooks/useAprOracle.ts` wraps the SDK call with `@tanstack/react-query`, memoizes by `[vaultAddress, chainId, delta]`, and returns `{ currentApr, projectedApr, percentChange }`.
3. `calculateDelta` in `packages/sdk/src/utils/apr.ts` converts user-entered amounts (optionally USD) into a signed `bigint` that the oracle expects.
4. RPC connectivity lives in `packages/app/src/config/wagmi.ts` where each supported chain has its own environment-provided RPC URL; the ABI and addresses are typed with `viem`.

These pieces give us the contract ABI, fallback logic, react-query integration, and delta computation we need to mirror inside Powerglove.

## Current Powerglove Data Flow Summary

1. Vault summary card (`MainInfoPanel`) gets its data from `useMainInfoPanelData` and receives formatted APYs via `useVaultPageData` → `useChartData` (derived from PPS) before being overridden inside `src/routes/vaults/$chainId/$vaultAddress/index.tsx`.
2. The “Est. APY” column in `StrategyTable` is produced inside `useStrategiesData`, ultimately derived from `vaultDetails.debts[].netApy` (GraphQL).
3. Vault metadata already includes `vaultDetails.v3` and `vaultDetails.apiVersion`, allowing us to gate RPC usage to v3 vaults (allocator / strategy types).
4. The app owns a single `QueryClient` (see `src/main.tsx`) but does not yet reuse it for RPC data; wagmi is configured only for mainnet/sepolia in `src/wagmi.ts`.

## Workstream A – RPC Configuration & Contracts

1. **Chain Coverage**
   - Extend `src/wagmi.ts` to include every v3-supported chain (`ChainId` union in `src/constants/chains.ts`: 1, 10, 100, 137, 250, 8453, 42161, 747474, 80094).
   - Use `http(import.meta.env.VITE_RPC_URI_FOR_<chainId>)` per chain, following the pattern in the oracle watch repo. Update documentation to mention the required env vars alongside `VITE_PUBLIC_GRAPHQL_URL`.
2. **ABI & Address Source**
   - Add `src/constants/aprOracle.ts` exporting `aprOracleAbi` + `aprOracleAddress` (copy from `packages/contracts/src/wagmi.ts`). If importing `@yearn-oracle-watch/contracts` directly is preferred, document the dependency addition instead.
3. **Type Safety**
   - Reuse the existing `ChainId` type to index `aprOracleAddress`.
   - Export a helper `getAprOracleAddress(chainId: ChainId)` that throws or returns `undefined` when the chain is unsupported so the hook can gate early.

## Workstream B – Oracle Client & Utilities

1. **GraphQL-Independent Service**
   - Create `src/services/aprOracleClient.ts` (or `src/lib/aprOracle.ts`) that exposes:

     ```ts
     export async function fetchAprOracle({
       wagmiConfig,
       vaultAddress,
       chainId,
       delta,
     }): Promise<{ currentApr: string | null; projectedApr: string | null }>
     ```

   - Mirror the logic in `CoreDataSource.getAprOracleData`:
   - Build two `readContracts` calls for `getStrategyApr` (0n / delta).
     - Capture `status === 'failure'` responses and retry with `getExpectedApr`.
     - Format the returned `bigint` via `formatApr` (copy helper from `packages/sdk/src/utils/apr.ts` or adapt).
2. **Delta Utility**
   - Port `calculateDelta` into `src/utils/apr.ts` to convert USD-or-asset inputs to `bigint`.
   - Expose helpers for percent-change if we want to show projected vs current.
3. **Error Translation**
   - Throw custom errors (e.g., `AprOracleUnavailableError`) so UI layers can fall back cleanly to PPS-derived values without user-visible stack traces.

## Workstream C – React Query Hook

1. Build `src/hooks/useAprOracle.ts` that:
   - Accepts `{ vaultAddress, chainId, delta?: bigint }`.
   - Uses `useQuery` with `queryKey = ['apr-oracle', vaultAddress, chainId, Number(delta || 0n)]`.
   - Delegates to `fetchAprOracle`, uses the shared `QueryClient` from `src/main.tsx`, and opts any upstream context cache in (see caching notes below).
   - Enables queries only when `vault.v3 === true`, API version starts with `3`, and `aprOracleAddress[chainId]` exists.
   - Returns `{ currentApr, projectedApr, percentChange, status }`.
2. Provide a convenience wrapper (e.g., `useVaultAprOracle(vaultDetails)`) that automatically supplies `chainId`, `address`, and forces `delta = 0n` (baseline only per product guidance) for display-only scenarios on the vault page.

## Workstream D – Main Info Panel & Chart Integration

1. Inside `src/routes/vaults/$chainId/$vaultAddress/index.tsx`:
   - Call `useAprOracle` when `vaultDetails.v3` is true.
   - When the query succeeds, prefer `currentApr` (delta fixed at 0n) over `latestDerivedApy` for `oneDayAPY`. When it errors or is pending, continue showing the derived PPS value (current behavior).
   - Provide a UI affordance (tooltip or badge) clarifying “Est. APY sourced from APR Oracle” so users know the data origin.
2. Optionally, feed `projectedApr` (would require reintroducing a delta control later) into the charts panel to overlay future-state curves—captured here only as stretch scope.

## Workstream E – Strategies Panel Updates

1. **Data plumbing**
   - Extend `useStrategiesData` to call the oracle for **each** v3 strategy (`debt.strategy` is itself a v3 vault) using `getStrategyApr(strategyAddress, 0n)`.
   - Batch those calls per vault via `readContracts`, memoize by `[strategyAddress, chainId]`, and reuse cached responses when the same strategy appears across views.
2. **Fallbacks**
   - When oracle data for a strategy fails, fall back to `debt.netApy`.
   - Display loading/error indicators per row if we opt into per-strategy calls.
3. **Formatting**
   - Keep `estimatedAPY` as a formatted percentage string but add metadata on the strategy object (e.g., `estimatedApySource: 'oracle' | 'graph'`) for UI tooltips or tests, and expose the raw `bigint` for downstream consumers if needed.

## Workstream F – Non-v3 Vault Handling

1. Guard all oracle hooks with `vaultDetails.v3` and `vaultDetails.apiVersion?.startsWith('3')`.
2. For Factory or Legacy vaults, continue showing PPS-derived APY and note in UI copy that the oracle is unavailable.
3. If a v3 chain lacks an RPC env var, surface a warning in the console + telemetry but do not block the page load.

## Workstream G – Testing & Validation

1. **Unit Tests**
   - Add tests for `fetchAprOracle` covering: happy path, fallback path, unsupported chain, formatter edge cases.
   - Port `calculateDelta` tests from `packages/sdk/src/tests` (if available) or recreate cases (USD conversion, decimals, invalid input).
2. **Integration / Component Tests**
   - Mock `useAprOracle` inside `src/components/main-info-panel.test.tsx` (create/spec) to ensure the UI swaps values correctly.
   - Add a test suite for `useStrategiesData` verifying oracle pref > GraphQL.
3. **Manual QA Checklist**
   - Validate allocator + strategy vaults across multiple chains (Ethereum, Base, Arbitrum) using realistic RPC endpoints.
   - Confirm non-v3 vaults still render.
   - Capture screenshots for PR per repo guidelines.

## Confirmed Decisions & Follow-ups

1. **Per-strategy APR** – Every v3 strategy row must display its own oracle APR. Strategy addresses can be treated as v3 vault proxies, so `getStrategyApr(strategyAddress, 0n)` is the canonical call. Workstream E reflects this requirement.
2. **Delta UX** – Powerglove shows baseline APR only (delta `0n`). Interactive delta tooling remains exclusive to the APR-oracle site; add a contextual link later if desired.
3. **Caching** – Oracle responses should be cached at a shared context/React Query level to avoid duplicate RPCs when navigating. A TODO entry (see `docs/todo-list.md`) tracks the follow-up work to define TTL and refresh behavior.
4. **Error Telemetry** – Continue with existing logging setup (currently minimal). If centralized telemetry is absent, the TODO list now tracks adding structured RPC failure reporting.

These confirmations keep the implementation aligned with protocol expectations while documenting outstanding operational tasks separately.
