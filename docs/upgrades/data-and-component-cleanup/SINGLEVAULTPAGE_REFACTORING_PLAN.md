# SingleVaultPage Route Refactoring Plan

## Overview

The SingleVaultPage route component (322 lines) exhibits the same architectural issues we just solved in the main components - mixed data transformation logic with UI rendering. This route serves as a data coordination hub with complex GraphQL queries, data processing, and UI orchestration that can be cleanly separated.

## Current Component Analysis

### 🔴 **Current Issues Identified**

**File:** `/src/routes/vaults/$chainId/$vaultAddress/index.tsx` (322 lines)

#### **Mixed Concerns:**

1. **GraphQL Query Management:** 4 separate useQuery hooks with complex variables
2. **Data Transformation Logic:** 2 large utility functions (82 + 50 lines)
3. **Loading State Coordination:** Complex conditional logic for multiple async states
4. **UI Layout & Routing:** Breadcrumb, layout, component orchestration

#### **Data Flow Complexity:**

```
Route Params → 4 GraphQL Queries → Data Processing → UI Hydration → Component Props
```

#### **Specific Problems:**

- `hydrateMainInfoPanelData` (82 lines) - Complex vault data transformation
- `processChartData` (50 lines) - Timeseries data processing with SMA calculations
- Multiple loading/error states scattered throughout component
- Direct data processing inline with UI logic

---

## Refactoring Strategy

### **Phase 1: Data Layer Extraction**

#### **Step 1.1: Create Data Hooks**

**New Hook: `useVaultPageData.ts`**

- **Purpose:** Coordinate all GraphQL queries and extract vault details
- **Responsibilities:**
  - Manage 4 GraphQL queries (vault details, APY, TVL, PPS)
  - Coordinate loading states
  - Handle error states
  - Extract clean vault data
- **Output:** `{ vaultDetails, isLoading, hasErrors }`

**New Hook: `useMainInfoPanelData.ts`**

- **Purpose:** Transform vault data for MainInfoPanel
- **Responsibilities:**
  - Extract `hydrateMainInfoPanelData` logic (82 lines)
  - Token asset resolution
  - Date formatting and currency formatting
  - Link generation (block explorer, Yearn vault)
- **Input:** `VaultExtended + TokenAsset[]`
- **Output:** `MainInfoPanelProps`

**New Hook: `useChartData.ts`**

- **Purpose:** Process timeseries data for charts
- **Responsibilities:**
  - Extract `processChartData` logic (50 lines)
  - SMA calculations and timeseries processing
  - Data gap filling and timestamp alignment
  - Chart data transformation
- **Input:** Raw timeseries data from GraphQL
- **Output:** `{ apyData, tvlData, ppsData }`

#### **Step 1.2: Create Utility Functions**

**New Utility: `vaultDataUtils.ts`**

- **Purpose:** Reusable vault data processing functions
- **Functions:**
  - `formatVaultMetrics()` - APY/fee percentage formatting
  - `generateVaultLinks()` - Block explorer and Yearn links
  - `resolveTokenIcon()` - Token asset icon resolution
  - `formatVaultDates()` - Date formatting utilities

---

### **Phase 2: Component Structure Enhancement**

#### **Step 2.1: Extract Layout Components**

**New Component: `VaultPageLayout.tsx`**

- **Purpose:** Handle page layout and loading states
- **Responsibilities:**
  - Breadcrumb navigation
  - Loading state display
  - Error state handling
  - Page-level layout structure
- **Props:** `vaultDetails`, `isLoading`, `hasErrors`, `children`

**New Component: `VaultPageBreadcrumb.tsx`**

- **Purpose:** Dedicated breadcrumb navigation
- **Responsibilities:**
  - Breadcrumb structure
  - Link generation
  - Vault name display
- **Props:** `vaultName`

#### **Step 2.2: Route Component Simplification**

**Simplified `SingleVaultPage` (target: ~80 lines)**

- **Purpose:** Route orchestration only
- **Responsibilities:**
  - Route parameter extraction
  - Data hooks integration
  - Component composition
  - Suspense boundary management

---

## Implementation Plan

### **Priority 1: Data Hook Extraction (Step 1.1)**

1. **Create `useVaultPageData.ts`** - Extract all GraphQL query logic
2. **Create `useMainInfoPanelData.ts`** - Extract main panel data transformation
3. **Create `useChartData.ts`** - Extract chart data processing logic
4. **Update route component** - Replace inline logic with hooks

### **Priority 2: Utility Function Creation (Step 1.2)**

1. **Create `vaultDataUtils.ts`** - Extract reusable formatting functions
2. **Update data hooks** - Use utility functions for consistency

### **Priority 3: Component Enhancement (Step 2.1-2.2)**

1. **Create layout components** - Extract UI structure
2. **Simplify route component** - Focus on orchestration only

---

## Expected Outcomes

### **Before → After Comparison**

| Aspect | Before | After | Improvement |
|--------|--------|--------|-------------|
| **Route Component** | 322 lines | ~80 lines | **-75% reduction** |
| **Data Logic** | Mixed with UI | Separate hooks | **Clean separation** |
| **Utility Functions** | Inline | Reusable utils | **Improved reusability** |
| **Loading States** | Scattered | Centralized | **Better UX** |

### **Architecture Benefits**

- ✅ **Data Layer Separation:** Clear separation of GraphQL queries and transformations
- ✅ **Reusable Logic:** Data transformation hooks can be used by other vault-related components
- ✅ **Better Testing:** Data logic can be unit tested independently
- ✅ **Improved Maintainability:** Smaller, focused files with single responsibilities
- ✅ **Performance:** Strategic memoization in data hooks

### **Files to Create**

**Data Hooks (3 files):**

- `src/hooks/useVaultPageData.ts` (~100 lines)
- `src/hooks/useMainInfoPanelData.ts` (~60 lines)  
- `src/hooks/useChartData.ts` (~80 lines)

**Utilities (1 file):**

- `src/utils/vaultDataUtils.ts` (~50 lines)

**Layout Components (2 files):**

- `src/components/vault-page/VaultPageLayout.tsx` (~60 lines)
- `src/components/vault-page/VaultPageBreadcrumb.tsx` (~25 lines)

### **Total Impact**

- **Route component reduced by 75%** (322 → 80 lines)
- **Data logic properly separated** into testable hooks
- **Reusable utilities** for other vault-related features
- **Better error handling** and loading state management
- **Established patterns** for other route components

---

## Implementation Steps

### **Step 1.1: Extract Data Hooks**

1. Create `useVaultPageData` with all GraphQL logic
2. Create `useMainInfoPanelData` with transformation logic
3. Create `useChartData` with timeseries processing
4. Update route to use new hooks

### **Step 1.2: Create Utilities**

1. Extract reusable formatting functions
2. Update hooks to use utilities

### **Step 2.1: Layout Components**

1. Create layout wrapper components
2. Extract breadcrumb component

### **Step 2.2: Route Simplification**

1. Simplify route to orchestration only
2. Apply performance optimizations

This approach follows the same proven patterns we established in the previous refactoring while addressing the specific challenges of route-level data coordination.
