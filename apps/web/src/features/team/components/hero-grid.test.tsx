import type { HandLandmarkerResult } from '@mediapipe/tasks-vision'
import { fireEvent, render, screen } from '@testing-library/react'
import { act } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { HeroGrid } from './hero-grid.client'

vi.mock('../hooks/use-hand-tracking.client', () => ({
  useHandTracking: vi.fn(),
}))

import { useHandTracking } from '../hooks/use-hand-tracking.client'

describe('<HeroGrid />', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.mocked(useHandTracking).mockReturnValue({ status: 'idle', error: null })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders all six team members as cards with role=list semantics', () => {
    render(<HeroGrid />)
    const list = screen.getByRole('list', { name: /team/i })
    const items = list.querySelectorAll('[role="listitem"]')
    expect(items.length).toBe(6)
  })

  it('pointer-enter sets the highlight; pointer-leave clears it', () => {
    render(<HeroGrid />)
    const card = screen.getByLabelText(/David Leuliette/i)
    expect(card.className).not.toMatch(/border-accent/)
    fireEvent.pointerEnter(card)
    expect(card.className).toMatch(/border-accent/)
    fireEvent.pointerLeave(card)
    expect(card.className).not.toMatch(/border-accent/)
  })

  it('touch-start sets the highlight; touch-end clears it', () => {
    render(<HeroGrid />)
    const card = screen.getByLabelText(/David Leuliette/i)
    fireEvent.touchStart(card)
    expect(card.className).toMatch(/border-accent/)
    fireEvent.touchEnd(card)
    expect(card.className).not.toMatch(/border-accent/)
  })

  it('touch-start auto-releases after 600ms idle', () => {
    render(<HeroGrid />)
    const card = screen.getByLabelText(/David Leuliette/i)
    fireEvent.touchStart(card)
    expect(card.className).toMatch(/border-accent/)
    act(() => {
      vi.advanceTimersByTime(600)
    })
    expect(card.className).not.toMatch(/border-accent/)
  })
})

describe('<HeroGrid /> camera', () => {
  beforeEach(() => {
    vi.mocked(useHandTracking).mockReturnValue({ status: 'idle', error: null })
  })

  it('camera toggle starts as "Enable camera"', () => {
    render(<HeroGrid />)
    expect(
      screen.getByRole('button', { name: /enable camera/i }),
    ).toBeInTheDocument()
  })

  it('clicking the toggle calls useHandTracking with active=true', () => {
    render(<HeroGrid />)
    fireEvent.click(screen.getByRole('button', { name: /enable camera/i }))
    const calls = vi.mocked(useHandTracking).mock.calls
    const last = calls[calls.length - 1]
    expect(last?.[2]).toBe(true)
  })

  it('shows "Initializing…" while status is loading', () => {
    vi.mocked(useHandTracking).mockReturnValue({
      status: 'loading',
      error: null,
    })
    render(<HeroGrid />)
    fireEvent.click(screen.getByRole('button', { name: /enable camera/i }))
    expect(screen.getByText(/initializing/i)).toBeInTheDocument()
  })

  it('clears the highlight when the most recent handResult has no landmarks', () => {
    let onResult: ((r: HandLandmarkerResult) => void) | undefined
    vi.mocked(useHandTracking).mockImplementation((_videoRef, cb) => {
      onResult = cb
      return { status: 'ready', error: null }
    })
    render(<HeroGrid />)
    fireEvent.click(screen.getByRole('button', { name: /enable camera/i }))
    expect(onResult).toBeDefined()
    act(() => {
      onResult?.({
        landmarks: [],
        handedness: [],
        handednesses: [],
        worldLandmarks: [],
      })
    })
    const card = screen.getByLabelText(/David Leuliette/i)
    expect(card.className).not.toMatch(/border-accent/)
  })
})
