import { createRootRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { VaultsProvider } from '@/contexts/VaultsContext'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ScrollToTop from '@/components/utils/ScrollToTop'

export const Route = createRootRoute({
  component: function RootComponent() {
    return (
      <>
        <VaultsProvider>
          <ScrollToTop />
          <div className="flex min-h-screen flex-col bg-[#f5f5f5]">
            <Header />
            <main className="flex-1 max-w-[1400px] mx-auto w-full px-0 sm:px-6 pb-8 min-w-0">
              <Outlet />
            </main>
            <Footer />
          </div>
          <TanStackRouterDevtools />
        </VaultsProvider>
      </>
    )
  },
})
