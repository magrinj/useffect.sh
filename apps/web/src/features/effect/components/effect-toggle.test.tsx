import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { EffectToggle } from './effect-toggle.client'

describe('EffectToggle', () => {
  it("defaults to 'after'", () => {
    render(<EffectToggle />)
    expect(screen.getByRole('tab', { name: 'after' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    expect(screen.getByRole('tab', { name: 'before' })).toHaveAttribute(
      'aria-selected',
      'false',
    )
  })

  it("flips to 'before' on click", () => {
    render(<EffectToggle />)
    fireEvent.click(screen.getByRole('tab', { name: 'before' }))
    expect(screen.getByRole('tab', { name: 'before' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    expect(screen.getByRole('tab', { name: 'after' })).toHaveAttribute(
      'aria-selected',
      'false',
    )
  })

  it('navigates with arrow keys', () => {
    render(<EffectToggle />)
    const before = screen.getByRole('tab', { name: 'before' })
    const after = screen.getByRole('tab', { name: 'after' })

    after.focus()
    fireEvent.keyDown(after, { key: 'ArrowLeft' })
    expect(before).toHaveAttribute('aria-selected', 'true')

    fireEvent.keyDown(before, { key: 'ArrowRight' })
    expect(after).toHaveAttribute('aria-selected', 'true')
  })
})
