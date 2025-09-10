# Deriving APR from Price Per Share (PPS)

## Overview
Yearn Powerglove currently pulls APY, PPS, and TVL timeseries from the KONG datasource.  While APY is provided directly, we can approximate the vaults' annual percentage rate (APR) by differentiating the PPS curve. The slope of the PPS line reflects the rate of change in share value; converting this rate to an annualized percentage yields an APR estimate.

## Data Requirements
- Historical PPS timeseries for each vault
- Timestamps at regular daily intervals (fill gaps before calculation)
- Corresponding APY and TVL data can remain for context but are not required for APR derivation

## Methodology
1. **Order and Clean Data**
   - Ensure PPS values are sorted by timestamp.
   - Fill missing days with `null` values and handle them during processing.
2. **Compute Daily Return**
   - For consecutive data points `(t_i, p_i)` and `(t_{i-1}, p_{i-1})`, compute:
     - `dailyReturn = (p_i - p_{i-1}) / p_{i-1}`
     - Alternative: `logReturn = ln(p_i / p_{i-1})` for numerical stability.
3. **Annualize**
   - Convert the daily change to APR using:
     - `apr = (1 + dailyReturn)^{365} - 1`
     - or `apr = exp(logReturn * 365) - 1` when using log returns.
4. **Smoothing (Optional)**
   - Apply a moving average to PPS before differentiation or smooth the resulting APR series to reduce noise.

## Pseudocode
```ts
function deriveAprFromPps(ppsSeries: TimeseriesPoint[]): TimeseriesPoint[] {
  const result = []
  for (let i = 1; i < ppsSeries.length; i++) {
    const prev = ppsSeries[i - 1].value
    const curr = ppsSeries[i].value
    if (prev === null || curr === null) {
      result.push({ time: ppsSeries[i].time, value: null })
      continue
    }
    const dailyReturn = (curr - prev) / prev
    const apr = Math.pow(1 + dailyReturn, 365) - 1
    result.push({ time: ppsSeries[i].time, value: apr })
  }
  return result
}
```

## Considerations
- **Irregular Intervals:** If data spacing differs from one day, scale by `deltaT` days rather than 1 in the annualization step.
- **Outliers & Noise:** Large price jumps can produce extreme APR values; apply smoothing or cap extremes if needed.
- **Validation:** Compare derived APR against reported APY to ensure the magnitude is reasonable.

## Limitations
- APR derived from discrete PPS points is an approximation and can diverge from true yield when compounding or fees vary.
- Smoothing choices can materially impact the resulting APR curve.

## Conclusion
Differentiating PPS provides a data-driven way to estimate vault APR without relying on external yield reports. The method requires clean, regularly spaced PPS data and careful handling of edge cases but can enhance insight into vault performance.
