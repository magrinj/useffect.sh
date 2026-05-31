import { Button } from '@/components/ui/button'
import { Comment } from '@/components/ui/comment'
import { Container } from '@/components/ui/container'
import { Eyebrow } from '@/components/ui/eyebrow'
import { HeroBelt } from './hero-belt'
import { HeroHeadline } from './hero-headline'
import { HeroTerminal } from './hero-terminal'

export function Hero() {
  return (
    <section className="border-b border-line py-[88px] pb-[120px]">
      <Container>
        <div className="grid grid-cols-1 gap-[56px]">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Eyebrow>React Native Expert on Demand</Eyebrow>
              <Comment>{'// v4.2.0 · stable'}</Comment>
            </div>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-1 font-mono text-[13px] text-muted">
              <span>
                <b className="text-ink">5</b> engineers
              </span>
              <span>
                <b className="text-ink">11.4M</b> downloads / mo on shipped OSS
              </span>
              <span>
                <b className="text-ink">Series A/B</b> only
              </span>
            </div>
          </div>

          <HeroHeadline />

          <div className="mt-4 grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-start">
            <div className="flex flex-col gap-8">
              <p className="text-[18px] leading-[1.5] text-ink">
                <b>The React Native team you wish you had.</b> A senior
                collective parachuted into apps that are on fire, or apps that
                need to be built right the first time. Series&nbsp;A/B startups
                only.
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <Button href="#contact" size="lg">
                  Trigger the effect
                </Button>
                <Button href="#work" size="lg" variant="ghost">
                  See renders
                </Button>
                <Comment>{'// avg. response < 6h, Mon–Fri'}</Comment>
              </div>
            </div>

            <div className="flex flex-col gap-[14px]">
              <HeroTerminal />
              <div className="flex items-center justify-between gap-4">
                <Comment>{"// We assemble when your code doesn't."}</Comment>
                <Comment className="whitespace-nowrap">
                  [ deps: <span className="text-accent font-semibold">us</span>{' '}
                  ]
                </Comment>
              </div>
            </div>
          </div>

          <HeroBelt />
        </div>
      </Container>
    </section>
  )
}
