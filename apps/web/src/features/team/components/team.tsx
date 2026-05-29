import { Section } from '@/components/section'
import { Container } from '@/components/ui/container'
import { Eyebrow } from '@/components/ui/eyebrow'
import { PackageBlock } from './package-block'
import { TeamCarousel } from './team-carousel.client'

export function Team() {
  return (
    <Section id="team" variant="dark" className="py-[120px]">
      <Container>
        <Eyebrow variant="dark">{'// package.json > dependencies'}</Eyebrow>
        <h2 className="mt-6 font-sans text-[56px] font-medium leading-[1.05] tracking-[-0.025em] text-bg">
          The <em className="not-italic text-accent">dependencies.</em>
        </h2>

        <div className="mt-12 grid grid-cols-1 gap-12 lg:grid-cols-[1fr_1fr]">
          <p className="text-[16px] leading-[1.55] text-dark-muted">
            Six senior engineers who mount as one. Every member ships native
            modules to npm, speaks at conferences, and has shipped React Native
            at scale.{' '}
            <b className="text-bg">No juniors. No subcontractors. No bench.</b>{' '}
            The squad that lands on your project is the squad on this page.
          </p>
          <PackageBlock />
        </div>

        <div className="mt-16">
          <TeamCarousel />
        </div>
      </Container>
    </Section>
  )
}
