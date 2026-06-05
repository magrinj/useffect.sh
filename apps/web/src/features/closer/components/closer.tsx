import { getTranslations } from 'next-intl/server'
import { Section } from '@/components/section'
import { Button } from '@/components/ui/button'
import { Container } from '@/components/ui/container'
import { Eyebrow } from '@/components/ui/eyebrow'

export async function Closer() {
  const t = await getTranslations('closer')
  return (
    <Section id="contact" className="py-[160px] text-center">
      <Container>
        <div className="flex flex-col items-center gap-8">
          <Eyebrow>{'// return ()'}</Eyebrow>
          <h2 className="font-sans text-[clamp(48px,7vw,96px)] font-medium leading-[1.05] tracking-[-0.025em] text-ink">
            {t.rich('title', {
              accent: (chunks) => (
                <em className="not-italic text-accent">{chunks}</em>
              ),
            })}
          </h2>
          <p className="max-w-[640px] text-[16px] leading-[1.55] text-muted">
            {t('body')}
          </p>
          <div className="flex flex-col items-center gap-4">
            <Button href="mailto:hello@useffect.sh" size="xl">
              {t('cta')}
            </Button>
            <span className="font-mono text-[12px] text-muted">
              hello@useffect.sh {t('emailLineSuffix')}
            </span>
          </div>
        </div>
      </Container>
    </Section>
  )
}
