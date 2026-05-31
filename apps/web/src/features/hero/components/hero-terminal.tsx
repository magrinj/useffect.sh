'use client'

import { useRef, useState } from 'react'
import { CodeBlock } from '@/components/ui/code-block'
import { Cursor } from '@/components/ui/cursor'

// Streamed "execution" output, revealed one line at a time when the user
// clicks the us.unfuck(yourCode) call. Easter egg: the snippet actually runs.
const OUTPUT: ReadonlyArray<{ mark: string; text: string }> = [
  { mark: '>', text: 'us.unfuck(yourCode)' },
  { mark: '✓', text: 'mounted elite squad · 5 engineers' },
  { mark: '✓', text: 'crash-free   94.2% → 99.7%' },
  { mark: '✓', text: 'cold start   4.1s → 1.2s' },
  { mark: '✓', text: 'bundle       8.4MB → 2.1MB' },
  { mark: '↳', text: 'ship.cleanly()  // no debt, full docs' },
]

export function HeroTerminal() {
  const [count, setCount] = useState(0)
  const timers = useRef<number[]>([])

  const run = () => {
    for (const id of timers.current) window.clearTimeout(id)
    timers.current = []
    setCount(0)

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) {
      setCount(OUTPUT.length)
      return
    }
    OUTPUT.forEach((_, i) => {
      timers.current.push(
        window.setTimeout(() => setCount(i + 1), 220 * (i + 1)),
      )
    })
  }

  const running = count > 0 && count !== OUTPUT.length

  return (
    <CodeBlock
      label="useEffect code block"
      title={
        <>
          ~/app/<b>src/effects/us.ts</b>
        </>
      }
      status={
        <span className="text-accent">● {running ? 'running…' : 'live'}</span>
      }
    >
      <span className="block">
        <span className="tok-c">
          {'// when your code mounts us, the effect runs.'}
        </span>
      </span>
      <span className="block">
        <span className="tok-k">import</span>{' '}
        <span className="tok-p">{'{'}</span> useEffect{' '}
        <span className="tok-p">{'}'}</span> <span className="tok-k">from</span>{' '}
        <span className="tok-s">"react"</span>
        <span className="tok-p">;</span>
      </span>
      <span className="block">
        <span className="tok-k">import</span>{' '}
        <span className="tok-p">{'{'}</span> <span className="tok-us">us</span>{' '}
        <span className="tok-p">{'}'}</span> <span className="tok-k">from</span>{' '}
        <span className="tok-s">"useffect.sh"</span>
        <span className="tok-p">;</span>
      </span>
      <span className="block">&nbsp;</span>
      <span className="block">
        <span className="tok-k">export function</span>{' '}
        <span className="tok-fn">App</span>
        <span className="tok-p">()</span> <span className="tok-p">{'{'}</span>
      </span>
      <span className="block pl-4">
        <span className="tok-fn">useEffect</span>
        <span className="tok-p">(()</span> <span className="tok-k">=&gt;</span>{' '}
        <span className="tok-p">{'{'}</span>
      </span>
      <span className="block pl-8">
        <span className="tok-c">{'// mounting elite squad…'}</span>
      </span>
      <span className="block pl-8">
        <span className="tok-k">const</span> ship{' '}
        <span className="tok-p">=</span>{' '}
        <button
          type="button"
          onClick={run}
          title="click to run"
          className="cursor-pointer rounded-[2px] underline decoration-muted-2 decoration-dotted underline-offset-4 transition-colors hover:bg-accent/10 hover:decoration-accent focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent"
        >
          <span className="tok-us">us</span>
          <span className="tok-p">.</span>
          <span className="tok-fn">unfuck</span>
          <span className="tok-p">(</span>yourCode
          <span className="tok-p">)</span>
        </button>
        <span className="tok-p">;</span>
      </span>
      <span className="block pl-8">
        <span className="tok-k">return</span> <span className="tok-p">()</span>{' '}
        <span className="tok-k">=&gt;</span> ship
        <span className="tok-p">.</span>
        <span className="tok-fn">cleanly</span>
        <span className="tok-p">();</span>{' '}
        <span className="tok-c">{'// no debt, full docs'}</span>
      </span>
      <span className="block pl-4">
        <span className="tok-p">{'},'}</span> <span className="tok-p">[</span>
        <span className="tok-us">us</span>
        <span className="tok-p">]);</span>
      </span>
      <span className="block">
        <span className="tok-p">{'}'}</span>
        {count === 0 && <Cursor />}
      </span>

      {count > 0 && (
        <>
          <span className="block">&nbsp;</span>
          {OUTPUT.slice(0, count).map((line, i) => (
            <span className="block" key={line.text}>
              <span className={line.mark === '✓' ? 'tok-us' : 'tok-p'}>
                {line.mark}
              </span>{' '}
              <span className={i === 0 ? 'tok-fn' : 'tok-c'}>{line.text}</span>
              {i === count - 1 && <Cursor />}
            </span>
          ))}
        </>
      )}
    </CodeBlock>
  )
}
