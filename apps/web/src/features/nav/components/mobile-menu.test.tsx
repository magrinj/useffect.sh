import { fireEvent, render, screen } from '@testing-library/react'
import { beforeAll, describe, expect, it } from 'vitest'
import { MobileMenu } from './mobile-menu.client'

// jsdom does not implement HTMLDialogElement; stub the methods we use.
beforeAll(() => {
  if (typeof HTMLDialogElement === 'undefined') return
  if (!HTMLDialogElement.prototype.showModal) {
    HTMLDialogElement.prototype.showModal = function () {
      this.setAttribute('open', '')
    }
  }
  if (!HTMLDialogElement.prototype.close) {
    HTMLDialogElement.prototype.close = function () {
      this.removeAttribute('open')
    }
  }
})

describe('MobileMenu', () => {
  it('opens when the hamburger is clicked', () => {
    render(<MobileMenu />)
    const dialog = screen.getByRole('dialog', { hidden: true })
    expect(dialog).not.toHaveAttribute('open')
    fireEvent.click(screen.getByRole('button', { name: /open menu/i }))
    expect(dialog).toHaveAttribute('open')
  })

  it('closes when Escape is pressed', () => {
    render(<MobileMenu />)
    fireEvent.click(screen.getByRole('button', { name: /open menu/i }))
    const dialog = screen.getByRole('dialog', { hidden: true })
    expect(dialog).toHaveAttribute('open')
    fireEvent.keyDown(dialog, { key: 'Escape' })
    expect(dialog).not.toHaveAttribute('open')
  })

  it('closes when an anchor inside is clicked', () => {
    render(<MobileMenu />)
    fireEvent.click(screen.getByRole('button', { name: /open menu/i }))
    const dialog = screen.getByRole('dialog', { hidden: true })
    expect(dialog).toHaveAttribute('open')
    fireEvent.click(screen.getByRole('link', { name: 'Work' }))
    expect(dialog).not.toHaveAttribute('open')
  })
})
