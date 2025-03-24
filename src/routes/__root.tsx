import { createRootRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export const Route = createRootRoute({
  component: () => (
    <>
      <div className="flex min-h-screen flex-col bg-[#f5f5f5] ">
        <Header />
        <main className="min-h-screen px-0 py-0 max-w-[1400px] mx-auto w-full">
          <Outlet />
        </main>
        <Footer />
      </div>
      <TanStackRouterDevtools />
    </>
  ),
})
