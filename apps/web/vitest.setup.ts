import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'
import enMessages from './src/messages/en.json'

// jsdom implements neither observer; the team carousel instantiates both on
// mount, so stub them with no-ops to let client components render in tests.
class MockObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return []
  }
}

vi.stubGlobal('ResizeObserver', MockObserver)
vi.stubGlobal('IntersectionObserver', MockObserver)

// next-intl server APIs aren't usable in the jsdom test environment — stub
// them so components that call `setRequestLocale` (Server Components) and
// `useLocale` / `useTranslations` (Client Components) render without
// requiring a real request context. Translation lookups resolve against the
// real EN catalog so test assertions can match displayed text directly.
function lookup(path: string): unknown {
  let value: unknown = enMessages
  for (const part of path.split('.')) {
    if (value && typeof value === 'object') {
      value = (value as Record<string, unknown>)[part]
    } else {
      return undefined
    }
  }
  return value
}

function makeT(namespace?: string) {
  const t = (key: string, params?: Record<string, string | number>) => {
    const fullKey = namespace ? `${namespace}.${key}` : key
    const value = lookup(fullKey)
    if (typeof value !== 'string') return fullKey
    if (params) {
      return value.replace(/\{(\w+)\}/g, (_, k) =>
        String(params[k] ?? `{${k}}`),
      )
    }
    return value
  }
  t.raw = (key: string) => {
    const fullKey = namespace ? `${namespace}.${key}` : key
    return lookup(fullKey)
  }
  t.rich = (
    key: string,
    tags?: Record<string, (chunks: unknown) => unknown>,
  ) => {
    const fullKey = namespace ? `${namespace}.${key}` : key
    const value = lookup(fullKey)
    if (typeof value !== 'string') return fullKey
    if (!tags) return value
    // Naive rich tag substitution — replaces `<tag>text</tag>` with the
    // result of tags.tag(text). Good enough for test rendering.
    return value.replace(
      /<(\w+)>([\s\S]*?)<\/\1>/g,
      (_match, tag: string, inner: string) => {
        const fn = tags[tag]
        return fn ? String(fn(inner)) : inner
      },
    )
  }
  return t
}

vi.mock('next-intl/server', async () => {
  const actual =
    await vi.importActual<typeof import('next-intl/server')>('next-intl/server')
  return {
    ...actual,
    setRequestLocale: () => {},
    getTranslations: async (namespace?: string) => makeT(namespace),
    getLocale: async () => 'en',
    getMessages: async () => enMessages,
  }
})

vi.mock('next-intl', async () => {
  const actual = await vi.importActual<typeof import('next-intl')>('next-intl')
  return {
    ...actual,
    useLocale: () => 'en',
    useTranslations: (namespace?: string) => makeT(namespace),
    useMessages: () => enMessages,
    NextIntlClientProvider: ({ children }: { children: React.ReactNode }) =>
      children,
  }
})

// next-intl/navigation pulls next/navigation through a deep ESM chain that
// vitest's resolver can't follow inside the .pnpm-style nested node_modules
// Bun produces. Stub the project-level wrapper so client components that
// use Link/usePathname render with the bare-minimum surface they need.
vi.mock('@/i18n/navigation', () => ({
  Link: ({
    children,
    href,
  }: {
    children: React.ReactNode
    href: string
    locale?: string
  }) => `<a href="${href}">${children}</a>`,
  usePathname: () => '/',
  useRouter: () => ({ push: () => {}, replace: () => {} }),
  redirect: () => {},
  getPathname: () => '/',
}))

afterEach(() => {
  cleanup()
})
