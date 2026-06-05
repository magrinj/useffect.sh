import { Section } from '@/components/section'
import { Container } from '@/components/ui/container'
import { Eyebrow } from '@/components/ui/eyebrow'
import { missions } from '../data'
import { MissionCard } from './mission-card'

export function Missions() {
  return (
    <Section id="work" className="py-[120px]">
      <Container>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_1fr]">
          <div>
            <Eyebrow>{'// renders.log'}</Eyebrow>
            <h2 className="mt-6 font-sans text-[56px] font-medium leading-[1.05] tracking-[-0.025em] text-ink">
              Recent renders.
            </h2>
          </div>
          <p className="self-end text-[16px] leading-[1.55] text-muted">
            Six real engagements from the last four years. Clients you'll
            recognise, problems we owned, results worth showing.
          </p>
        </div>
        <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2">
          {missions.map((m) => (
            <MissionCard key={m.code} mission={m} />
          ))}
        </div>
      </Container>
    </Section>
  )
}
