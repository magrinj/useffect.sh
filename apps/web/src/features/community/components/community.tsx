import { Section } from '@/components/section'
import { Container } from '@/components/ui/container'
import { Eyebrow } from '@/components/ui/eyebrow'
import { community } from '../data'

export function Community() {
  return (
    <Section id="community" className="py-[96px]">
      <Container>
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_2fr] lg:items-start">
          <div>
            <Eyebrow>{'// community.log'}</Eyebrow>
            <h2 className="mt-6 font-sans text-[44px] font-medium leading-[1.05] tracking-[-0.025em] text-ink">
              Trace upstream.
            </h2>
            <p className="mt-5 max-w-[420px] text-[15px] leading-[1.55] text-muted">
              Open source we maintain, bootcamps we run, meetups we organize.
              The work that isn't a SOW.
            </p>
          </div>

          <ul className="divide-y divide-line border-t border-line">
            {community.map((c) => (
              <li
                key={`${c.person}-${c.title}`}
                className="flex flex-col gap-2 py-5"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <div className="font-mono text-[14px] text-ink">
                    <span className="text-muted">{c.person}</span>
                    {' · '}
                    {c.href ? (
                      <a
                        href={c.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-ink underline decoration-muted-2 decoration-dotted underline-offset-4 transition-colors hover:text-accent hover:decoration-accent"
                      >
                        {c.title}
                      </a>
                    ) : (
                      <span>{c.title}</span>
                    )}
                  </div>
                  {c.stats && (
                    <span className="font-mono text-[12px] text-accent">
                      {c.stats}
                    </span>
                  )}
                </div>
                <p className="text-[14px] leading-[1.55] text-muted">
                  {c.detail}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </Section>
  )
}
