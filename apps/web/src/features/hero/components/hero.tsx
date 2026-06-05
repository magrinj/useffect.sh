import { getTranslations } from 'next-intl/server'
import { Button } from '@/components/ui/button'
import { Comment } from '@/components/ui/comment'
import { Container } from '@/components/ui/container'
import { Eyebrow } from '@/components/ui/eyebrow'
import { HeroBelt } from './hero-belt'
import { HeroHeadline } from './hero-headline'
import { HeroTerminal } from './hero-terminal'

export async function Hero() {
  const t = await getTranslations('hero')
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
                <b className="text-ink">6</b> engineers
              </span>
              <span>
                <b className="text-ink">1.3M+</b> Docker pulls on Twenty (YC
                S23)
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
                {t.rich('tagline', {
                  bold: (chunks) => <b>{chunks}</b>,
                })}
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <Button href="#contact" size="lg">
                  {t('ctaPrimary')}
                </Button>
                <Button href="#work" size="lg" variant="ghost">
                  {t('ctaSecondary')}
                </Button>
                <Comment>{'// avg. response < 6h, Mon–Fri'}</Comment>
              </div>
            </div>

            <div className="flex flex-col gap-[14px]">
              <HeroTerminal />
              <div className="flex items-start justify-between gap-4">
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
