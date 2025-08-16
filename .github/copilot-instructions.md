<!-- markdownlint-disable-file -->

## Project Overview

**Yearn Powerglove** is a React/TypeScript dashboard for visualizing Yearn Finance vault metrics (APY, TVL, strategies). Built with TanStack Router, Apollo GraphQL, and Tailwind CSS.

## Development Workflow

```bash
npm run dev          # Start dev server with HMR
npm run build        # TypeScript compile + Vite build
npm run test         # Run Vitest tests
npm run test:watch   # Watch mode testing
npm run lint         # ESLint check
npm run format       # Prettier formatting
```

## Architecture Patterns

### Data Flow

1. **Context Providers**: `VaultsContext` wraps the app, manages global vault/strategy state via Apollo
2. **GraphQL Queries**: Centralized in `/src/graphql/queries/` (vaults.ts, strategies.ts, timeseries.ts)
3. **Type System**: Strong typing with `/src/types/vaultTypes.ts` and `/src/types/dataTypes.ts`
4. **Filtering**: Vault filters in `/src/graphql/filters/vaultFilters.ts` (e.g., `filterYearnVaults()`)

### Component Structure

- **Route-based**: TanStack Router with file-based routing in `/src/routes/`
- **Lazy Loading**: Charts use `React.lazy()` for code splitting (see vault detail page)
- **Context Pattern**: Multiple contexts (`VaultsContext`, `StrategiesContext`, `TokenAssetsContext`)
- **UI Components**: Radix UI primitives in `/src/components/ui/` with Tailwind styling

### Critical Files to Understand

- `/src/main.tsx`: App entry with Apollo/Query providers setup
- `/src/routes/__root.tsx`: Root layout with `VaultsProvider` wrapper
- `/src/contexts/VaultsContext.tsx`: Global state management with loading coordination
- `/src/routes/vaults/$chainId/$vaultAddress/index.tsx`: Dynamic routing example

### Development Conventions

- **Path Alias**: `@/` maps to `/src/` (configured in vite.config.ts)
- **Memo Usage**: Performance-critical components use `React.memo()` (see APYChart)
- **Environment**: `VITE_PUBLIC_GRAPHQL_URL` for GraphQL endpoint
- **Testing**: Vitest with jsdom, mock `getBoundingClientRect` for Recharts
- **TypeScript**: Strict typing, avoid `any`, use proper interfaces from `/src/types/`

## Coding Guidelines

- **Functional Components**: Use functional components with hooks, avoid class components
- **TypeScript**: Strict typing required, avoid `any`, use interfaces from `/src/types/`
- **Modern Syntax**: ES6+ features, destructuring, async/await over promises
- **Performance**: Use `React.memo()` for expensive components, lazy load charts/heavy components
- **Comments**: Add inline comments when modifying existing code to explain changes
- **File Organization**: Follow existing patterns - components in `/components/`, types in `/types/`, etc.

## Common Tasks

### Adding New Vault Metrics

1. Define types in `/src/types/vaultTypes.ts` or `/src/types/dataTypes.ts`
2. Add GraphQL query fragments in `/src/graphql/queries/`
3. Update context providers if global state needed
4. Create chart components following `/src/components/charts/APYChart.tsx` pattern

### Testing Chart Components

- Mock `getBoundingClientRect` for Recharts components
- Use jsdom environment (configured in vitest.config.ts)
- Test rendering without crashes, not complex interactions

### Adding New Routes

- Use TanStack Router file-based routing in `/src/routes/`
- Dynamic routes use `$paramName` syntax (see vault detail route)
- Wrap route components in appropriate context providers

## General Tips and Guidelines

- If it helps you, please feel free to ask me questions about my experiences with the software that we are building, or as a tester.
- I can run my own dev environments, so assume that I am running the latest version of the code. Don't run a dev build yourself
- When writing code, please follow best practices for the relevant language and framework.
- When writing typescript, please ensure that types are used effectively to minimize the use of `any`.
- When writing react code, please use functional components and hooks. Please ensure that components are modular and reusable where possible.
- Don't fix markdown lint errors. I can do that myself.
- When writing javascript or typescript, always use modern syntax.
- When modifying existing code, leave inline comments where code has been modified.
- When in chat mode, if editing existing code, do not output the full updated code if it is more than 100 lines long, unless specifically asked to. Focus on the areas where the code has been changed.
