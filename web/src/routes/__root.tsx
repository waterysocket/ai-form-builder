import { type QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'
import { Analytics } from '@vercel/analytics/react'
import '../styles.css'

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  component: RootComponent,
  notFoundComponent: () => (
    <div className="min-h-screen grid place-items-center bg-surface-base text-text-primary">
      <div className="text-center">
        <h1 className="text-6xl font-bold">404</h1>
        <p className="mt-2 text-text-secondary">Page not found</p>
        <a href="/" className="mt-6 inline-block px-5 py-2.5 rounded-lg bg-brand text-white">
          Go home
        </a>
      </div>
    </div>
  ),
})

function RootComponent() {
  const { queryClient } = Route.useRouteContext()
  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
      <Analytics />
    </QueryClientProvider>
  )
}
