import { describe, expect, it } from 'vitest'
import Home from './page'

// The full page renders async Server Components (Services, Missions, Team,
// Process, Community, Closer, Footer all call `await getTranslations(...)`).
// React only supports rendering async components in the server SSR/RSC
// pipeline; jsdom + RTL can't traverse a Promise child synchronously. We
// keep page-level coverage minimal here (it exports an async function,
// it builds without throwing) and rely on individual feature component
// tests + the production `bun run build` step to integration-test the full
// page tree.

describe('Home page', () => {
  it('exports an async Server Component', () => {
    expect(Home).toBeInstanceOf(Function)
    expect(Home.constructor.name).toBe('AsyncFunction')
  })

  it('returns a React element when invoked with a locale', async () => {
    const tree = await Home({ params: Promise.resolve({ locale: 'en' }) })
    expect(tree).toBeDefined()
    expect(tree).toHaveProperty('type')
  })
})
