# Yearn Powerglove

Yearn vault explorer built with React, TypeScript, Vite, TanStack Router, Apollo, and Wagmi.

## Prerequisites

- Node 18+ (Bun recommended for scripts)
- Copy `.env.example` to `.env` and set values such as `VITE_PUBLIC_GRAPHQL_URL`.

## Install

```bash
bun install
```

## Run

- Dev server: `bun run dev`
- Type-check & build: `bun run build`
- Preview latest build: `bun run preview`
- Tests: `bun run test` (or `bun run test:watch`)
- Lint: `bun run lint`
- Format: `bun run format`

## Editing

- App code lives in `src/`:
  - `components/` (Radix + Tailwind UI)
  - `routes/` (TanStack Router)
  - `contexts/`, `hooks/`, `utils/`
  - GraphQL queries in `src/graphql/`
- Router file `src/routeTree.gen.ts` is generated; do not edit by hand.

## Vault overrides & blacklist

Manual overrides and blacklist entries are defined in `src/constants/vaultOverrides.ts`.

- Each entry is a `VaultOverrideConfig` with:
  - `chainId`, `address`
  - Optional `overrides` (partial fields on the vault), e.g. `name`, `symbol`, `meta.description`, `tvl.close`, `apy.monthlyNet`, `forwardApyNet`.
  - Optional `overrideReason` (shown in the banner).
  - Optional `blacklist` + `blacklistReason`.
- The array `VAULT_OVERRIDE_ENTRIES` is reduced into an internal map automatically; just add a new object to the array.
- Blacklisted vaults are hidden from lists/search, but direct vault pages still render with warnings and a disabled overlay.

Example entry:

```ts
{
  chainId: 1,
  address: '0x1234...',
  overrideReason: 'Upstream metadata incorrect. TVL set manually.',
  overrides: {
    name: 'My Vault',
    tvl: { close: 0 },
    apy: { monthlyNet: 0 },
  },
  blacklist: true,
  blacklistReason: 'Disabled until investigation completes.',
}
```

## Testing notes

- Vitest runs in jsdom with Testing Library; shared mocks live in `setupTests.ts`.
- Prefer mocking Apollo/HTTP rather than hitting live services.
