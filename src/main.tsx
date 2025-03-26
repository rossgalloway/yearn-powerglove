import { Buffer } from 'buffer'
import React from 'react'
import ReactDOM from 'react-dom/client'
import './styles/globals.css'
import { RouterProvider, createRouter } from '@tanstack/react-router'
// import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ApolloProvider } from '@apollo/client'

// import { config } from './wagmi'
import { routeTree } from './routeTree.gen'
import { apolloClient } from './lib/apollo-client'

;(globalThis as any).Buffer = Buffer // type assertion added to fix TS7017 error

const queryClient = new QueryClient()
const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* <WagmiProvider config={config}> */}
    <QueryClientProvider client={queryClient}>
      <ApolloProvider client={apolloClient}>
        <RouterProvider router={router} />
      </ApolloProvider>
    </QueryClientProvider>
    {/* </WagmiProvider> */}
  </React.StrictMode>
)
