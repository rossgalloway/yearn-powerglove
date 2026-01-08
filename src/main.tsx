import { Buffer } from 'buffer'
import React from 'react'
import ReactDOM from 'react-dom/client'
import './styles/globals.css'
import { ApolloProvider } from '@apollo/client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createRouter, RouterProvider } from '@tanstack/react-router'
import { apolloClient } from './lib/apollo-client'
import { routeTree } from './routeTree.gen'

// Polyfill Buffer for browser environment
if (typeof globalThis.Buffer === 'undefined') {
  globalThis.Buffer = Buffer
}

const queryClient = new QueryClient()
const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ApolloProvider client={apolloClient}>
        <RouterProvider router={router} />
      </ApolloProvider>
    </QueryClientProvider>
  </React.StrictMode>
)
