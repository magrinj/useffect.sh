import { Section } from '@/components/section'
import { Container } from '@/components/ui/container'
import { Eyebrow } from '@/components/ui/eyebrow'
import { HeroGrid } from './hero-grid.client'
import { PackageBlock } from './package-block'

export function Team() {
  return (
    <Section id="team" variant="dark" className="py-[120px]">
      <Container>
        <Eyebrow variant="dark">{'// package.json > dependencies'}</Eyebrow>
        <h2 className="mt-6 font-sans text-[56px] font-medium leading-[1.05] tracking-[-0.025em] text-bg">
          The <em className="not-italic text-accent">dependencies.</em>
        </h2>

        <p className="mt-8 max-w-[640px] text-[16px] leading-[1.55] text-dark-muted">
          Six senior engineers. Different specialties, different years shipping,
          same standard.{' '}
          <b className="text-bg">No juniors. No subcontractors. No bench.</b>{' '}
          The squad that lands on your project is the squad on this page.
        </p>

        <div className="mt-12">
          <PackageBlock />
        </div>

        <div className="mt-16">
          <HeroGrid />
        </div>
      </Container>
    </Section>
  )
}
