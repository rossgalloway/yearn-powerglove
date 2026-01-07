import { createRootRoute, Outlet } from '@tanstack/react-router'
import { Suspense, lazy } from 'react'
import { VaultsProvider } from '@/contexts/VaultsContext'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ScrollToTop from '@/components/utils/ScrollToTop'

const RouterDevtools = import.meta.env.DEV
  ? lazy(async () => {
      const mod = await import('@tanstack/react-router-devtools')
      return { default: mod.TanStackRouterDevtools }
    })
  : null

export const Route = createRootRoute({
  component: function RootComponent() {
    return (
      <>
        <VaultsProvider>
          <ScrollToTop />
          <div className="flex h-screen flex-col bg-[#f5f5f5]">
            <Header />
            <main className="flex-1 px-0 py-0 max-w-[1400px] mx-auto w-full overflow-hidden pb-8">
              <Outlet />
            </main>
            <Footer />
          </div>
          {RouterDevtools ? (
            <Suspense fallback={null}>
              <RouterDevtools />
            </Suspense>
          ) : null}
        </VaultsProvider>
      </>
    )
  },
})
