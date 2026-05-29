'use client'

import { useState } from 'react'
import { Section } from '@/components/section'
import { Container } from '@/components/ui/container'
import { Eyebrow } from '@/components/ui/eyebrow'
import { cn } from '@/lib/cn'
import { metrics } from '../data'
import { EffectToggle } from './effect-toggle.client'

type State = 'before' | 'after'

export function Effect() {
  const [state, setState] = useState<State>('after')
  const isAfter = state === 'after'

  return (
    <Section id="effect" className="py-[120px]">
      <Container>
        <div className="flex flex-wrap items-start justify-between gap-8">
          <div className="max-w-[640px]">
            <Eyebrow>{'// before vs. after'}</Eyebrow>
            <h2 className="mt-6 font-sans text-[56px] font-medium leading-[1.05] tracking-[-0.025em] text-ink">
              The <span className="text-accent">us</span> effect.
            </h2>
            <p className="mt-[18px] max-w-[520px] text-[16px] leading-[1.5] text-muted">
              Every engagement leaves a measurable trace. Same app, same users,
              same metrics — before we mount, and after we unmount. Median
              across the last 8 rescues.
            </p>
          </div>
          <EffectToggle onChange={setState} />
        </div>

        <div
          id="effect-panel"
          role="tabpanel"
          aria-labelledby={`effect-tab-${state}`}
          className="mt-16 border-t border-line"
        >
          <div className="grid grid-cols-[1.4fr_1fr_1fr_1fr] gap-4 border-b border-line py-3 font-mono text-[12px] text-muted">
            <span>{'// metric'}</span>
            <span>before</span>
            <span>after</span>
            <span className="text-right">delta</span>
          </div>
          {metrics.map((m) => (
            <div
              key={m.name}
              className="grid grid-cols-[1.4fr_1fr_1fr_1fr] items-baseline gap-4 border-b border-line py-5"
            >
              <div className="flex flex-col">
                <span className="text-[15px] text-ink">{m.name}</span>
                <small className="font-mono text-[12px] text-muted">
                  {m.small}
                </small>
              </div>
              <div
                className={cn(
                  'font-sans text-[28px] transition-colors',
                  isAfter ? 'text-muted-2' : 'text-ink',
                )}
              >
                {m.before.value}
                <span className="ml-1 text-[14px]">{m.before.unit}</span>
              </div>
              <div
                className={cn(
                  'font-sans text-[28px] transition-colors',
                  isAfter ? 'text-ink' : 'text-muted-2',
                )}
              >
                {m.after.value}
                <span className="ml-1 text-[14px]">{m.after.unit}</span>
              </div>
              <div className="text-right font-mono text-[14px] text-accent">
                {m.delta}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap justify-between gap-4 font-mono text-[12px] text-muted">
          <span>
            {
              '// numbers are real, app names redacted under NDA. detailed reports on request.'
            }
          </span>
          <span className="inline-flex items-center gap-2">
            <span aria-hidden className="inline-block size-2 bg-accent" />
            after = post-unmount, ≥30 days in production
          </span>
        </div>
      </Container>
    </Section>
  )
}
