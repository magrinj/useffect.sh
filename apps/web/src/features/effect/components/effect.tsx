'use client'

import { useTranslations } from 'next-intl'
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
  const t = useTranslations('effect')

  return (
    <Section id="effect" className="py-[120px]">
      <Container>
        <div className="flex flex-wrap items-start justify-between gap-8">
          <div className="max-w-[640px]">
            <Eyebrow>{'// before vs. after'}</Eyebrow>
            <h2 className="mt-6 font-sans text-[56px] font-medium leading-[1.05] tracking-[-0.025em] text-ink">
              {t.rich('title', {
                accent: (chunks) => (
                  <span className="text-accent">{chunks}</span>
                ),
              })}
            </h2>
            <p className="mt-[18px] max-w-[520px] text-[16px] leading-[1.5] text-muted">
              {t('subtitle')}
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
            <span>{t('table.metric')}</span>
            <span>{t('table.before')}</span>
            <span>{t('table.after')}</span>
            <span className="text-right">{t('table.delta')}</span>
          </div>
          {metrics.map((m) => (
            <div
              key={m.id}
              className="grid grid-cols-[1.4fr_1fr_1fr_1fr] items-baseline gap-4 border-b border-line py-5"
            >
              <div className="flex flex-col">
                <span className="text-[15px] text-ink">
                  {t(`metrics.${m.id}.name`)}
                </span>
                <small className="font-mono text-[12px] text-muted">
                  {t(`metrics.${m.id}.small`)}
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
          <span>{t('footnote.numbers')}</span>
          <span className="inline-flex items-center gap-2">
            <span aria-hidden className="inline-block size-2 bg-accent" />
            {t('footnote.afterDef')}
          </span>
        </div>
      </Container>
    </Section>
  )
}
