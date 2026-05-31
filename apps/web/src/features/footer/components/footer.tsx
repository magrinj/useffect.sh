import { Container } from '@/components/ui/container'
import { Logo } from '@/components/ui/logo'
import { columns } from '../data'
import { FooterColumn } from './footer-column'

export function Footer() {
  return (
    <footer className="border-t border-line bg-bg pt-12 pb-10">
      <Container>
        <div className="mt-10 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-5">
          <div className="flex flex-col gap-4 lg:col-span-1">
            <a href="/" className="self-start">
              <Logo />
            </a>
            <p className="font-mono text-[13px] text-muted leading-[1.55]">
              A senior React Native collective. We mount, we ship, we unmount
              cleanly. The us effect is the trace we leave behind.
            </p>
          </div>
          {columns.map((c) => (
            <FooterColumn key={c.heading} column={c} />
          ))}
        </div>

        <div className="mt-12 flex flex-wrap justify-between gap-4 border-t border-line pt-6 font-mono text-[12px] text-muted">
          <span>
            © 2026 useffect collective · Berlin · Paris · Lisbon · São Paulo
          </span>
          <span>
            v4.2.0 · last deploy 3 days ago ·{' '}
            <span className="text-accent">●</span> all systems operational
          </span>
        </div>
      </Container>
    </footer>
  )
}
