import { Section } from '@/components/section'
import { Container } from '@/components/ui/container'
import { Eyebrow } from '@/components/ui/eyebrow'
import { doors } from '../data'
import { Door } from './door'

export function Services() {
  return (
    <Section id="services" className="py-[120px]">
      <Container>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_1fr]">
          <div>
            <Eyebrow>{'// services.ts'}</Eyebrow>
            <h2 className="mt-6 font-sans text-[56px] font-medium leading-[1.05] tracking-[-0.025em] text-ink">
              Two doors.
              <br />
              Pick the one on fire.
            </h2>
          </div>
          <p className="self-end text-[16px] leading-[1.55] text-muted">
            We don't do retainers, sprints-as-a-service, or "audits" that end in
            a PDF. We do two things, and we do them at the level you can't hire
            full-time for.
          </p>
        </div>
        <div className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-2">
          {doors.map((door) => (
            <Door key={door.tag} door={door} />
          ))}
        </div>
      </Container>
    </Section>
  )
}
