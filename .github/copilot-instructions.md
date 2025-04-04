<!-- markdownlint-disable-file -->

## General instructions

When writing javascript or typescript, always use modern syntax.

When modifying existing code, leave inline comments where code has been modified.

When in chat mode, if editing existing code, do not output the full updated code if it is more than 100 lines long, unless specifically asked to. Focus on the areas where the code has been changed.

## Website Specifications

### Project Overview
This project, **yearn-powerglove**, is a web application built with React and TypeScript. It uses Vite for development and build tasks, along with ESLint and Prettier for linting and formatting. It is a metrics dashboard that visualizes up to date performance data for Yearn Finance vaults. It displays key metrics including APY (Annual Percentage Yield), TVL (Total Value Locked), historical performance charts, and strategy insights for each vault.

### Technologies & Frameworks
- **React**: Core library for building user interfaces.  
- **TypeScript**: Strongly typed JavaScript.  
- **Vite**: Fast build tool and development server.  
- **ESLint** & **Prettier**: Ensures consistent code style and quality checks.

### Notable Dependencies
- **@apollo/client**: GraphQL client for fetching data.  
- **@tanstack/react-query**: Data fetching and caching.  
- **router** packages (React Router, React Router DevTools): Managing application routes.  
- **Radix UI**: Collection of accessible, unstyled components.  
- **Tailwind CSS** & **PostCSS**: Utility-first CSS framework and tooling.  
- **TypeScript**: Development dependency for type checking and transpilation.

### Scripts
- `dev`: Starts the Vite dev server.  
- `build`: Runs the TypeScript compiler and then builds using Vite.  
- `lint`: Lints the codebase using ESLint.  
- `format`: Formats files with Prettier.  
- `preview`: Previews the production build locally.

### Intended Use
1. **UI**: Offers a robust and accessible component set provided by Radix UI.  
2. **GraphQL Integration**: Uses Apollo Client for efficient data fetching and state management.  
3. **Performance**: Vite ensures a speedy development workflow and optimized production builds.  
4. **Styling**: Tailwind CSS is used for rapid UI development and consistent styling.

### Future Notes
- Additional functionality may integrate with other React libraries or custom hooks.  
- Testing should be performed regularly to maintain stability.  
- Code quality is enforced with linting and formatting rules.

## File tree

built by running `tree -I "node_modules"` project directory
```
.
├── README.md
├── components.json
├── eslint.config.js
├── index.html
├── package-lock.json
├── package.json
├── postcss.config.js
├── public
│   ├── YFILogoGradient.jpg
│   ├── favicon.ico
│   ├── fonts
│   │   ├── //fonts removed from tree diagram to save space
│   │   └── fonts.css
│   ├── github-icon.svg
│   ├── logo.svg
│   ├── twitter-x.svg
│   └── yearn-link-icon.svg
├── src
│   ├── components
│   │   ├── Footer.tsx
│   │   ├── Header.tsx
│   │   ├── ScrollToTop.tsx
│   │   ├── VaultsList.tsx
│   │   ├── YearnVaultsSummary.tsx
│   │   ├── chart-container.tsx
│   │   ├── charts
│   │   │   ├── APYChart.tsx
│   │   │   ├── PPSChart.tsx
│   │   │   └── TVLChart.tsx
│   │   ├── charts-panel.tsx
│   │   ├── main-info-panel.tsx
│   │   ├── strategies-panel.tsx
│   │   └── ui
│   │       ├── accordion.tsx
│   │       ├── alert-dialog.tsx
│   │       ├── alert.tsx
│   │       ├── aspect-ratio.tsx
│   │       ├── avatar.tsx
│   │       ├── badge.tsx
│   │       ├── breadcrumb.tsx
│   │       ├── button.tsx
│   │       ├── calendar.tsx
│   │       ├── card.tsx
│   │       ├── carousel.tsx
│   │       ├── chart.tsx
│   │       ├── checkbox.tsx
│   │       ├── collapsible.tsx
│   │       ├── command.tsx
│   │       ├── context-menu.tsx
│   │       ├── dialog.tsx
│   │       ├── drawer.tsx
│   │       ├── dropdown-menu.tsx
│   │       ├── form.tsx
│   │       ├── hover-card.tsx
│   │       ├── input-otp.tsx
│   │       ├── input.tsx
│   │       ├── label.tsx
│   │       ├── menubar.tsx
│   │       ├── navigation-menu.tsx
│   │       ├── pagination.tsx
│   │       ├── popover.tsx
│   │       ├── progress.tsx
│   │       ├── radio-group.tsx
│   │       ├── resizable.tsx
│   │       ├── scroll-area.tsx
│   │       ├── select.tsx
│   │       ├── separator.tsx
│   │       ├── sheet.tsx
│   │       ├── sidebar.tsx
│   │       ├── skeleton.tsx
│   │       ├── slider.tsx
│   │       ├── sonner.tsx
│   │       ├── switch.tsx
│   │       ├── table.tsx
│   │       ├── tabs.tsx
│   │       ├── textarea.tsx
│   │       ├── toast.tsx
│   │       ├── toaster.tsx
│   │       ├── toggle-group.tsx
│   │       ├── toggle.tsx
│   │       ├── tooltip.tsx
│   │       ├── use-mobile.tsx
│   │       └── use-toast.ts
│   ├── config
│   ├── constants
│   │   ├── chains.ts
│   │   └── smolAssets.json
│   ├── graphql
│   │   ├── filters
│   │   │   └── vaultFilters.ts
│   │   ├── queries
│   │   │   ├── strategies.ts
│   │   │   ├── timeseries.ts
│   │   │   └── vaults.ts
│   │   └── schema.graphql
│   ├── hooks
│   ├── lib
│   │   ├── apollo-client.ts
│   │   ├── queries.ts
│   │   └── utils.ts
│   ├── main.tsx
│   ├── routeTree.gen.ts
│   ├── routes
│   │   ├── __root.tsx
│   │   ├── index.tsx
│   │   └── vaults
│   │       └── $chainId
│   │           └── $vaultAddress
│   │               └── index.tsx
│   ├── styles
│   │   └── globals.css
│   ├── types
│   │   ├── dataTypes.ts
│   │   └── vaultTypes.ts
│   ├── utils
│   │   ├── filterChains.ts
│   │   └── format-date.ts
│   ├── vite-env.d.ts
│   └── wagmi.ts
├── tailwind.config.js
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
```