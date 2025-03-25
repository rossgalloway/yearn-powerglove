/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file was automatically generated by TanStack Router.
// You should NOT make any changes in this file as it will be overwritten.
// Additionally, you should also exclude this file from your linter and/or formatter to prevent it from being checked or modified.

// Import Routes

import { Route as rootRoute } from './routes/__root'
import { Route as IndexImport } from './routes/index'
import { Route as VaultsChainIdVaultAddressIndexImport } from './routes/vaults/$chainId/$vaultAddress/index'

// Create/Update Routes

const IndexRoute = IndexImport.update({
  id: '/',
  path: '/',
  getParentRoute: () => rootRoute,
} as any)

const VaultsChainIdVaultAddressIndexRoute =
  VaultsChainIdVaultAddressIndexImport.update({
    id: '/vaults/$chainId/$vaultAddress/',
    path: '/vaults/$chainId/$vaultAddress/',
    getParentRoute: () => rootRoute,
  } as any)

// Populate the FileRoutesByPath interface

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/': {
      id: '/'
      path: '/'
      fullPath: '/'
      preLoaderRoute: typeof IndexImport
      parentRoute: typeof rootRoute
    }
    '/vaults/$chainId/$vaultAddress/': {
      id: '/vaults/$chainId/$vaultAddress/'
      path: '/vaults/$chainId/$vaultAddress'
      fullPath: '/vaults/$chainId/$vaultAddress'
      preLoaderRoute: typeof VaultsChainIdVaultAddressIndexImport
      parentRoute: typeof rootRoute
    }
  }
}

// Create and export the route tree

export interface FileRoutesByFullPath {
  '/': typeof IndexRoute
  '/vaults/$chainId/$vaultAddress': typeof VaultsChainIdVaultAddressIndexRoute
}

export interface FileRoutesByTo {
  '/': typeof IndexRoute
  '/vaults/$chainId/$vaultAddress': typeof VaultsChainIdVaultAddressIndexRoute
}

export interface FileRoutesById {
  __root__: typeof rootRoute
  '/': typeof IndexRoute
  '/vaults/$chainId/$vaultAddress/': typeof VaultsChainIdVaultAddressIndexRoute
}

export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath
  fullPaths: '/' | '/vaults/$chainId/$vaultAddress'
  fileRoutesByTo: FileRoutesByTo
  to: '/' | '/vaults/$chainId/$vaultAddress'
  id: '__root__' | '/' | '/vaults/$chainId/$vaultAddress/'
  fileRoutesById: FileRoutesById
}

export interface RootRouteChildren {
  IndexRoute: typeof IndexRoute
  VaultsChainIdVaultAddressIndexRoute: typeof VaultsChainIdVaultAddressIndexRoute
}

const rootRouteChildren: RootRouteChildren = {
  IndexRoute: IndexRoute,
  VaultsChainIdVaultAddressIndexRoute: VaultsChainIdVaultAddressIndexRoute,
}

export const routeTree = rootRoute
  ._addFileChildren(rootRouteChildren)
  ._addFileTypes<FileRouteTypes>()

/* ROUTE_MANIFEST_START
{
  "routes": {
    "__root__": {
      "filePath": "__root.tsx",
      "children": [
        "/",
        "/vaults/$chainId/$vaultAddress/"
      ]
    },
    "/": {
      "filePath": "index.tsx"
    },
    "/vaults/$chainId/$vaultAddress/": {
      "filePath": "vaults/$chainId/$vaultAddress/index.tsx"
    }
  }
}
ROUTE_MANIFEST_END */
