import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

vi.mock('./use-hand-tracking', () => ({
  useHandTracking: () => ({ status: 'idle', error: null, result: null }),
}))

import Home from './page'

describe('Home', () => {
  it('renders the precog header and carousel counter', () => {
    render(<Home />)
    expect(screen.getByText('useffect.sh / precog')).toBeInTheDocument()
    expect(screen.getByText(/01 \/ 12/)).toBeInTheDocument()
  })
})
