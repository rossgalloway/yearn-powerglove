# TODO

See `docs/review-todo-workflow.md` for the capture → triage → spec workflow.

## Inbox

Add new items here as: `- (YYYY-MM-DD) <summary> (<where>)`

## Backlog

- (2026-01-01) techdebt: define APR oracle cache refresh policy (oracle integration)
  - Define how long APR-oracle query results may remain cached (React Query + any context-level memoization).
  - Document the invalidation triggers (route changes, manual refresh button, tab visibility events, etc.) and implement refresh logic once agreed upon.
- (2026-01-01) techdebt: add oracle error telemetry (oracle integration)
  - Audit the current logging/telemetry setup for RPC failures.
  - If no centralized reporting exists, add lightweight instrumentation (console grouping + future Sentry hook) so repeated oracle errors surface during QA and production monitoring.
- (2026-01-01) ux: show oracle fallback banner/toast (oracle integration)
  - When we fall back to direct APR-oracle data (due to yDaemon/APY failures), surface a toast or banner informing users that estimates may be less precise.
  - Hook this into the same telemetry/logging path so we can monitor how often the fallback is triggered.

## Bugs

## UX

## Tech Debt

## Docs

## Done

- (2026-01-01) ux: overlay Kong `apr-oracle` timeseries on APY charts (`src/hooks/useVaultPageData.ts`, `src/hooks/useChartData.ts`, `src/components/charts/APYChart.tsx`) spec: `docs/specs/kong-apr-oracle-timeseries-overlay.md` done (2026-01-02): added `oracleApy` overlay series + toggle and updated APY/oracle colors; verified with `bun run test` and `bun run build`
