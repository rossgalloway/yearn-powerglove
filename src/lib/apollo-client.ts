// src/lib/apollo-client.ts
import { ApolloClient, InMemoryCache } from '@apollo/client'

console.log('Apollo URI:', import.meta.env.VITE_PUBLIC_GRAPHQL_URL)

export const apolloClient = new ApolloClient({
  uri: import.meta.env.VITE_PUBLIC_GRAPHQL_URL,
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
      nextFetchPolicy: 'cache-first',
    },
  },
})
