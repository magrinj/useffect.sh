import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { members } from '../data'
import { PackageBlock } from './package-block'

describe('<PackageBlock />', () => {
  it('renders every member as a dep row with its scope, version, and lead specialty as a comment', () => {
    render(<PackageBlock />)
    for (const m of members) {
      expect(screen.getByText(m.scope)).toBeInTheDocument()
      expect(screen.getByText(m.version)).toBeInTheDocument()
      expect(
        screen.getByText(`// ${m.specialties.join(' · ')}`),
      ).toBeInTheDocument()
    }
  })

  it('renders dep rows in alphabetical order by scope', () => {
    const { container } = render(<PackageBlock />)
    const rows = container.querySelectorAll('[data-member-id]')
    const scopes = Array.from(rows).map(
      (row) => row.querySelector('.tok-k')?.textContent ?? '',
    )
    const sorted = [...scopes].sort()
    expect(scopes).toEqual(sorted)
  })

  it('shows the deps-count + 0-vulns status string', () => {
    render(<PackageBlock />)
    expect(screen.getByText(/6 deps · 0 vulnerabilities/)).toBeInTheDocument()
  })

  it('exposes a screen-reader summary listing members alphabetically by scope', () => {
    render(<PackageBlock />)
    // scopes sorted alphabetically: david, gabriel, jeremy, ludwig, matthys, pablo
    // so shortNames in order: David, Gabriel, Jérémy, Ludwig, Matthys, Pablo
    const summary = screen.getByText(
      /Six dependencies: David, Gabriel, Jérémy, Ludwig, Matthys, Pablo\./i,
    )
    expect(summary).toBeInTheDocument()
    expect(summary.className).toMatch(/sr-only/)
  })
})
