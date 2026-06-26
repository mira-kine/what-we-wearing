import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  redirect,
} from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import { Landing } from './routes/Landing'
import { EventHub } from './routes/EventHub'
import { Builder } from './routes/Builder'
import { Gallery } from './routes/Gallery'
import { getSession } from './lib/session'
import { loadEventByCode, EventNotFoundError } from './lib/events'
import { loadBuilderData } from './lib/builder'

const rootRoute = createRootRoute({
  component: () => (
    <>
      <Outlet />
      {import.meta.env.DEV && <TanStackRouterDevtools position="bottom-right" />}
    </>
  ),
})

/**
 * Bounce to `/` with `?join=<code>` if there's no session for this event.
 * Covers: no session at all, or session from a different event.
 */
function requireSession(params: { code: string }) {
  const session = getSession()
  if (!session || session.eventCode !== params.code) {
    throw redirect({ to: '/', search: { join: params.code } })
  }
}

const landingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: Landing,
  validateSearch: (search: Record<string, unknown>): { join?: string } => ({
    join: typeof search.join === 'string' ? search.join : undefined,
  }),
})

const eventHubRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/$code',
  beforeLoad: ({ params }) => requireSession(params),
  loader: async ({ params }) => {
    try {
      return await loadEventByCode(params.code)
    } catch (err) {
      // Bad code → bounce to landing prefilled
      if (err instanceof EventNotFoundError) {
        throw redirect({ to: '/', search: { join: params.code } })
      }
      throw err
    }
  },
  component: EventHub,
})

const builderRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/$code/builder',
  beforeLoad: ({ params }) => requireSession(params),
  loader: async ({ params }) => {
    const session = getSession()!  // beforeLoad guarantees this
    try {
      return await loadBuilderData(params.code, session.participantId)
    } catch (err) {
      if (err instanceof EventNotFoundError) {
        throw redirect({ to: '/', search: { join: params.code } })
      }
      throw err
    }
  },
  component: Builder,
})

const galleryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/$code/gallery',
  beforeLoad: ({ params }) => requireSession(params),
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
