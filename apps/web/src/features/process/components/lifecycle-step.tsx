import { getTranslations } from 'next-intl/server'
import type { LifecycleStep as StepData } from '../data'

interface Props {
  step: StepData
}

export async function LifecycleStep({ step }: Props) {
  const t = await getTranslations(`process.steps.${step.id}`)
  // Bullets are stored as a JSON array in messages; pull the raw array and
  // render each entry. `t.raw` returns the underlying value (not a string).
  const bullets = (t.raw('bullets') as string[]) ?? []
  return (
    <article className="flex flex-col gap-5 border-t border-line pt-8">
      <div className="flex items-center justify-between font-mono text-[12px]">
        <span className="text-muted">{step.phase}</span>
        <b className="text-ink">{t('week')}</b>
      </div>
      <h3 className="font-sans text-[48px] font-medium leading-none tracking-[-0.02em] text-ink">
        {t('title')}
        <span className="text-accent">.</span>
      </h3>
      <p className="text-[15px] leading-[1.55] text-ink">{t('body')}</p>
      <ul className="flex flex-col gap-2 font-mono text-[13px] text-muted">
        {bullets.map((b) => (
          <li key={b} className="flex gap-3">
            <span aria-hidden={true} className="text-accent">
              {'›'}
            </span>
            <span>{b}</span>
          </li>
        ))}
      </ul>
    </article>
  )
}
