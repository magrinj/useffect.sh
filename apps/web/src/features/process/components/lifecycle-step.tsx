import type { LifecycleStep as StepData } from '../data'

interface Props {
  step: StepData
}

export function LifecycleStep({ step }: Props) {
  return (
    <article className="flex flex-col gap-5 border-t border-line pt-8">
      <div className="flex items-center justify-between font-mono text-[12px]">
        <span className="text-muted">{step.phase}</span>
        <b className="text-ink">{step.week}</b>
      </div>
      <h3 className="font-sans text-[48px] font-medium leading-none tracking-[-0.02em] text-ink">
        {step.title}
        <span className="text-accent">.</span>
      </h3>
      <p className="text-[15px] leading-[1.55] text-ink">{step.body}</p>
      <ul className="flex flex-col gap-2 font-mono text-[13px] text-muted">
        {step.bullets.map((b) => (
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
