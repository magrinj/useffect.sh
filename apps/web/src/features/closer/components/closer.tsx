import { Section } from '@/components/section'
import { Button } from '@/components/ui/button'
import { Container } from '@/components/ui/container'
import { Eyebrow } from '@/components/ui/eyebrow'

export function Closer() {
  return (
    <Section id="contact" className="py-[160px] text-center">
      <Container>
        <div className="flex flex-col items-center gap-8">
          <Eyebrow>{'// return ()'}</Eyebrow>
          <h2 className="font-sans text-[clamp(48px,7vw,96px)] font-medium leading-[1.05] tracking-[-0.025em] text-ink">
            Your app, with the <em className="not-italic text-accent">us</em>{' '}
            effect.
          </h2>
          <p className="max-w-[640px] text-[16px] leading-[1.55] text-muted">
            Two slots open for Q3. If your app is on fire — or you're staring at
            an empty repo and a board deadline — talk to us this week.
          </p>
          <div className="flex flex-col items-center gap-4">
            <Button href="mailto:hello@useffect.sh" size="xl">
              Trigger the effect
            </Button>
            <span className="font-mono text-[12px] text-muted">
              hello@useffect.sh · avg. response &lt; 6h
            </span>
          </div>
        </div>
      </Container>
    </Section>
  )
}
