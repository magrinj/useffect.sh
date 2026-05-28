import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import Home from './page'

describe('Home', () => {
  it('renders the brand name', () => {
    render(<Home />)
    expect(screen.getByText('useffect.sh')).toBeInTheDocument()
  })

  it('renders the headline and tagline', () => {
    render(<Home />)
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'React Native Expert on Demand',
      }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /we unfuck the fuck code/,
      }),
    ).toBeInTheDocument()
  })
})
