import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import Home from './page'

describe('Home', () => {
  it('renders the main landmark', () => {
    render(<Home />)
    expect(screen.getByRole('main')).toBeInTheDocument()
  })

  it('renders the hero headline', () => {
    render(<Home />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      /UNFUCK/,
    )
  })

  it('renders every section heading', () => {
    render(<Home />)
    // h2s for each section
    expect(
      screen.getByRole('heading', { name: /Pick the one on fire/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: /^The us effect\.$/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: /Recent renders\./i }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: /dependencies\./i }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: /Mount\.\s*Ship\.\s*Unmount\./i }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: /Your app, with the us effect\./i }),
    ).toBeInTheDocument()
  })

  it('renders the footer with the copyright', () => {
    render(<Home />)
    expect(screen.getByText(/© 2026 useffect collective/)).toBeInTheDocument()
  })
})
