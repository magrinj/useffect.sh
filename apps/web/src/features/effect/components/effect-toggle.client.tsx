'use client'

import { type KeyboardEvent, useRef, useState } from 'react'
import { cn } from '@/lib/cn'

type State = 'before' | 'after'

interface EffectToggleProps {
  /** Called when the state changes — lets a parent reflect it elsewhere. */
  onChange?: (state: State) => void
}

const STATES: readonly State[] = ['before', 'after'] as const

export function EffectToggle({ onChange }: EffectToggleProps) {
  const [state, setState] = useState<State>('after')
  const tabsRef = useRef<Record<State, HTMLButtonElement | null>>({
    before: null,
    after: null,
  })

  const setAndNotify = (next: State) => {
    setState(next)
    onChange?.(next)
  }

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return
    e.preventDefault()
    const idx = STATES.indexOf(state)
    const nextIdx =
      e.key === 'ArrowRight'
        ? (idx + 1) % STATES.length
        : (idx - 1 + STATES.length) % STATES.length
    const next = STATES[nextIdx] as State
    setAndNotify(next)
    tabsRef.current[next]?.focus()
  }

  return (
    <div
      className="inline-flex border border-line font-mono text-[12px]"
      role="tablist"
      aria-label="before vs after"
    >
      {STATES.map((s) => {
        const selected = state === s
        return (
          <button
            key={s}
            ref={(el) => {
              tabsRef.current[s] = el
            }}
            id={`effect-tab-${s}`}
            type="button"
            role="tab"
            aria-selected={selected}
            aria-controls="effect-panel"
            tabIndex={selected ? 0 : -1}
            onClick={() => setAndNotify(s)}
            onKeyDown={onKeyDown}
            className={cn(
              'px-4 py-2 transition-colors',
              selected ? 'bg-ink text-bg' : 'text-muted hover:text-ink',
            )}
          >
            {s}
          </button>
        )
      })}
    </div>
  )
}
