# Component Refactoring & Data Flow Audit Plan

## Overview

This document outlines the strategy for refactoring large components and cleaning up data flows in the Yearn Powerglove application. The focus is on separating concerns, improving modularity, and creating cleaner data transformations.

## Component Analysis Summary

### 🔴 Critical Refactoring Needed (>200 lines)

1. **strategies-panel.tsx** (834 lines) - Most complex component
2. **VaultsList.tsx** (331 lines) - Heavy data processing + UI
3. **charts-panel.tsx** (209 lines) - Mixed logic and UI

### 🟡 Moderate Refactoring (100-200 lines)

4. **APYChart.tsx/PPSChart.tsx/TVLChart.tsx** (173/139/138 lines) - Similar patterns
5. **main-info-panel.tsx** (125 lines) - Data transformation + UI
6. **Header.tsx** (117 lines) - Navigation + UI logic

## Data Flow Audit Results

### Current Data Flow Issues Identified

#### 1. **strategies-panel.tsx** - Most Complex Data Flow

```
Raw Data Sources:
- props.vaultDetails (VaultExtended) → selectedVaultDebts (VaultDebt[])
- allStrategies (from context) → Strategy filtering
- strategyData (GraphQL query) → v3StrategyData
- tokenAssets (from context) → icon resolution

Data Transformations:
- VaultDebt → EnrichedVaultDebt mapping (lines 63-120)
- Multiple data merging operations
- Complex filtering and sorting logic
- Pie chart data transformation
```

#### 2. **VaultsList.tsx** - Heavy Processing

```
Raw Data Sources:
- vaults (Vault[]) from props
- tokenAssets (TokenAsset[]) from props

Data Transformations:
- Vault → VaultListData mapping (lines 45-75)
- Complex sorting with NaN handling
- Multiple filter operations (search, range, type)
- Virtual scrolling calculations
```

#### 3. **Route Component** - Data Coordination Hub

```
Data Sources:
- GraphQL: GET_VAULT_DETAILS, queryAPY, queryPPS, queryTVL
- Context: tokenAssets

Data Transformations:
- Raw timeseries → chart data transformations
- Vault data → MainInfoPanelProps hydration
- Loading state coordination
```

## Refactoring Strategy

### Phase 1: Data Layer Separation

#### Step 1.1: Create Data Transformation Hooks

```
/src/hooks/
├── useVaultListData.ts          # VaultsList data transformations
├── useStrategiesData.ts         # Strategies panel data logic  
├── useChartData.ts              # Chart data transformations
├── useMainInfoPanelData.ts      # Main panel data hydration
└── useSortingAndFiltering.ts    # Generic sorting/filtering logic
```

#### Step 1.2: Create Data Processing Utilities

```
/src/utils/
├── vaultDataTransforms.ts       # Vault → UI data mappers
├── strategyDataTransforms.ts    # Strategy data processing
├── chartDataTransforms.ts       # Timeseries → chart data
└── sortingUtils.ts             # Generic sorting utilities
```

### Phase 2: Component Decomposition

#### Step 2.1: Strategies Panel Breakdown

```
/src/components/strategies/
├── StrategiesPanel.tsx          # Main container (50-75 lines)
├── StrategyAllocationChart.tsx  # Pie chart component
├── StrategyTable.tsx           # Table display logic
├── StrategyRow.tsx             # Individual strategy row
└── StrategyFilters.tsx         # Sorting/filtering controls
```

#### Step 2.2: Vaults List Breakdown  

```
/src/components/vaults/
├── VaultsList.tsx              # Main container (100-150 lines)
├── VaultsTable.tsx            # Virtual scroll table wrapper
├── VaultFilters.tsx           # Search and filter controls
├── VaultsSummary.tsx          # Stats summary component
└── VaultRow.tsx               # Individual vault row (exists)
```

#### Step 2.3: Charts Panel Breakdown

```
/src/components/charts/
├── ChartsPanel.tsx            # Main container (75-100 lines)  
├── ChartTabsNavigation.tsx    # Tab controls
├── ChartTimeframeSelector.tsx # Timeframe selection
├── ChartContainer.tsx         # Generic chart wrapper
└── [APY|TVL|PPS]Chart.tsx    # Individual chart components
```

**Performance Considerations**: Apply `React.memo()` to data-heavy components during decomposition and use `useMemo()` for expensive calculations in data transformation hooks.

## Data Flow Improvements

### Before: Scattered Data Processing

```
Component → Raw Data → Inline Transformations → UI
```

### After: Centralized Data Layer

```
GraphQL/Context → Custom Hooks → Transformed Data → Pure UI Components
                      ↓
                 Utility Functions
```

## Implementation Priority

### Step 1: Foundation

1. **strategies-panel.tsx** - Extract data logic to `useStrategiesData.ts`
2. **VaultsList.tsx** - Extract transformations to `useVaultListData.ts`
3. Create shared utility functions for data processing

### Step 2: Component Decomposition  

1. Break down strategies panel into smaller components
2. Decompose VaultsList into focused components
3. Refactor charts panel structure

**Performance Integration**: Add `React.memo()` and `useMemo()` during decomposition where data processing is expensive

## Testing Strategy

- Maintain existing test coverage during refactor
- Add tests for new data transformation hooks
- Test component isolation and prop interfaces
- Performance regression testing

## Success Metrics

- Reduce largest component from 834 → ~150 lines
- Improve data flow clarity with dedicated transformation layer
- Maintain/improve performance with better memoization
- Enable easier testing and maintenance
