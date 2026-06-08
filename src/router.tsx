import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
} from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import { Landing } from './routes/Landing'
import { EventHub } from './routes/EventHub'
import { Builder } from './routes/Builder'
import { Gallery } from './routes/Gallery'

const rootRoute = createRootRoute({
  component: () => (
    <>
      <Outlet />
      {import.meta.env.DEV && <TanStackRouterDevtools position="bottom-right" />}
    </>
  ),
})

const landingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: Landing,
})

const eventHubRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/$code',
  component: EventHub,
})

const builderRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/$code/builder',
  component: Builder,
})

const galleryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/$code/gallery',
  component: Gallery,
})

const routeTree = rootRoute.addChildren([
  landingRoute,
  eventHubRoute,
  builderRoute,
  galleryRoute,
])

export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
