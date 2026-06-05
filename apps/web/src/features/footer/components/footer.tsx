import { getTranslations } from 'next-intl/server'
import { Container } from '@/components/ui/container'
import { Logo } from '@/components/ui/logo'
import { columns } from '../data'
import { FooterColumn } from './footer-column'

export async function Footer() {
  const t = await getTranslations('footer')
  return (
    <footer className="border-t border-line bg-bg pt-12 pb-10">
      <Container>
        <div className="mt-10 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-5">
          <div className="flex flex-col gap-4 lg:col-span-1">
            <a href="/" className="self-start">
              <Logo />
            </a>
            <p className="font-mono text-[13px] text-muted leading-[1.55]">
              {t('tagline')}
            </p>
          </div>
          {columns.map((c) => (
            <FooterColumn key={c.id} column={c} />
          ))}
        </div>

        <div className="mt-12 flex flex-wrap justify-between gap-4 border-t border-line pt-6 font-mono text-[12px] text-muted">
          <span>{t('copyright')}</span>
          <span>
            {t('status')} <span className="text-accent">●</span>
          </span>
        </div>
      </Container>
    </footer>
  )
}
