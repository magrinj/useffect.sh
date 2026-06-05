import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { Member } from '../data'
import { HeroCard } from './hero-card'

const SAMPLE: Member = {
  id: '001',
  name: 'David Leuliette',
  shortName: 'David',
  role: 'Senior Mobile Engineer',
  image: '/david.png',
  scope: '@useffect/david',
  version: '^10.2.0',
  specialties: ['React Native', 'Expo', 'iOS'],
  notableCompanies: ['Sunday', 'Red Bull', 'AXA', 'NACON'],
  linkedin: 'https://www.linkedin.com/in/david-leuliette/',
}

describe('<HeroCard />', () => {
  it('renders as a link to the member LinkedIn profile in a new tab', () => {
    render(<HeroCard member={SAMPLE} isHovered={false} priority={false} />)
    const link = screen.getByRole('link', {
      name: /David Leuliette.*LinkedIn/i,
    })
    expect(link).toHaveAttribute('href', SAMPLE.linkedin)
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', expect.stringContaining('noopener'))
  })

  it('exposes SR-only structured info: name, role, specialties, notable companies, scope, version', () => {
    render(<HeroCard member={SAMPLE} isHovered={false} priority={false} />)
    // Each piece is in the sr-only block so screen readers + Google read it
    expect(screen.getByText(/David Leuliette/)).toBeInTheDocument()
    expect(screen.getByText(/Senior Mobile Engineer/)).toBeInTheDocument()
    expect(screen.getByText(/React Native, Expo, iOS/)).toBeInTheDocument()
    expect(screen.getByText(/Sunday, Red Bull, AXA, NACON/)).toBeInTheDocument()
    expect(screen.getByText(/@useffect\/david/)).toBeInTheDocument()
    expect(screen.getByText(/\^10\.2\.0/)).toBeInTheDocument()
  })

  it('applies the hovered highlight class only when isHovered is true', () => {
    const { rerender, container } = render(
      <HeroCard member={SAMPLE} isHovered={false} priority={false} />,
    )
    const card = container.firstElementChild
    expect(card?.className).not.toMatch(/border-accent/)
    rerender(<HeroCard member={SAMPLE} isHovered={true} priority={false} />)
    expect(card?.className).toMatch(/border-accent/)
  })

  it('applies the grabbed highlight (stronger glow) when isGrabbed is true', () => {
    const { container } = render(
      <HeroCard
        member={SAMPLE}
        isHovered={false}
        priority={false}
        isGrabbed={true}
        grabScale={1.4}
      />,
    )
    const card = container.firstElementChild
    expect(card?.className).toMatch(/border-accent/)
    expect(card?.className).toMatch(/shadow-\[0_0_56px/)
  })
})
