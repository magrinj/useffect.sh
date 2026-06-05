import { getTranslations } from 'next-intl/server'
import { Section } from '@/components/section'
import { Container } from '@/components/ui/container'
import { Eyebrow } from '@/components/ui/eyebrow'
import { steps } from '../data'
import { LifecycleStep } from './lifecycle-step'

export async function Process() {
  const t = await getTranslations('process')
  return (
    <Section id="process" className="py-[120px]">
      <Container>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_1fr]">
          <div>
            <Eyebrow>{'// lifecycle.ts'}</Eyebrow>
            <h2 className="mt-6 font-sans text-[56px] font-medium leading-[1.05] tracking-[-0.025em] text-ink whitespace-pre-line">
              {t('title')}
            </h2>
          </div>
          <p className="self-end text-[16px] leading-[1.55] text-muted">
            {t('subtitle')}
          </p>
        </div>
        <div className="mt-16 grid grid-cols-1 gap-12 lg:grid-cols-3">
          {steps.map((s) => (
            <LifecycleStep key={s.id} step={s} />
          ))}
        </div>
      </Container>
    </Section>
  )
}
