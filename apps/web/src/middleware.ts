import createMiddleware from 'next-intl/middleware'
import { routing } from '@/i18n/routing'

export default createMiddleware(routing)

export const config = {
  // Match all routes except static assets, API, and Next internals.
  matcher: ['/((?!_next|_vercel|.*\\..*).*)'],
}
