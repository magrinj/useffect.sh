import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

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

afterEach(() => {
  cleanup()
})
