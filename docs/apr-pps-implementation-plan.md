# APR from PPS Implementation Plan

## Goals
- Estimate vault APR by differentiating Price Per Share data.
- Surface the derived APR alongside existing APY, PPS, and TVL metrics.

## Step-by-Step Plan
1. **Utility Function**
   - File: `src/lib/utils.ts`
   - Add `calculateAprFromPps(pps: TimeseriesDataPoint[]): TimeseriesDataPoint[]`.
   - Logic: compute daily returns between adjacent points, annualize with `(1 + dailyReturn)^{365} - 1`, return timeseries of APR values.
2. **Types**
   - File: `src/types/dataTypes.ts`
   - Define `aprChartData` type `{ date: string; APR: number | null }`.
   - Export the type for use in hooks and components.
3. **Hook Integration**
   - File: `src/hooks/useChartData.ts`
   - After `ppsFilled`, call `calculateAprFromPps`.
   - Map output to `aprChartData` using `formatUnixTimestamp`.
   - Extend hook return type to include `transformedAprData`.
4. **Chart Component**
   - Add `APRChart.tsx` in `src/components/` modeled on existing APY/PPS charts.
   - Display APR over time and allow timeframe slicing.
5. **UI Wiring**
   - Where charts are rendered (e.g., vault detail view), import and render `APRChart` with data from `useChartData`.
6. **Testing**
   - File: `src/lib/utils.test.ts` (create if absent).
   - Add unit tests verifying `calculateAprFromPps` on sample PPS series and edge cases (null values, irregular intervals).
   - Run `npm test` to validate.
7. **Documentation**
   - Update `README.md` or docs to describe the APR derivation method and any limitations.

## Future Enhancements
- Apply smoothing (e.g., SMA of PPS or APR) to reduce volatility.
- Investigate continuous compounding using log returns.
- Surface confidence metrics when data gaps are large.
