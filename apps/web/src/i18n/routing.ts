import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  locales: ['en', 'fr'],
  defaultLocale: 'en',
  // Always prefix URLs with the locale (`/en`, `/fr`) so each language has
  // a distinct, shareable URL with a clean hreflang story.
  localePrefix: 'always',
})

export type Locale = (typeof routing.locales)[number]
