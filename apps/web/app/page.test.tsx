import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import Home from './page'

describe('Home', () => {
  it('renders the brand name', () => {
    render(<Home />)
    expect(screen.getByText('useffect.sh')).toBeInTheDocument()
  })

  it('renders the mounting and soon markers', () => {
    render(<Home />)
    expect(screen.getByText('// mounting...')).toBeInTheDocument()
    expect(screen.getByText('// soon')).toBeInTheDocument()
  })
})
