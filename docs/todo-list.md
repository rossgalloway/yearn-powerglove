# Oracle Integration TODOs

1. **Cache Refresh Policy**
   - Define how long APR-oracle query results may remain cached (React Query + any context-level memoization).
   - Document the invalidation triggers (route changes, manual refresh button, tab visibility events, etc.) and implement refresh logic once agreed upon.

2. **Error Telemetry**
   - Audit the current logging/telemetry setup for RPC failures.
   - If no centralized reporting exists, add lightweight instrumentation (console grouping + future Sentry hook) so repeated oracle errors surface during QA and production monitoring.
