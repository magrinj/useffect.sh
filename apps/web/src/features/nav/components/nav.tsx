'use client'

import { Button } from '@/components/ui/button'
import { Container } from '@/components/ui/container'
import { Logo } from '@/components/ui/logo'
import { StatusPill } from '@/components/ui/status-pill'
import { useNavScrollState } from '../hooks/use-nav-scroll-state.client'
import { MobileMenu } from './mobile-menu.client'

export function Nav() {
  const scrolled = useNavScrollState()
  return (
    <header
      id="nav"
      data-scrolled={scrolled || undefined}
      className="sticky top-0 z-50 bg-bg/80 backdrop-blur-md backdrop-saturate-150 border-b border-transparent data-[scrolled]:border-line transition-colors duration-200"
    >
      <Container>
        <div className="flex h-16 items-center justify-between gap-4">
          <a href="/" className="shrink-0">
            <Logo />
          </a>
          <nav className="hidden items-center gap-7 font-mono text-[13px] md:flex">
            <a
              href="#work"
              className="text-muted hover:text-ink transition-colors"
            >
              Work
            </a>
            <a
              href="#services"
              className="text-muted hover:text-ink transition-colors"
            >
              Services
            </a>
            <a
              href="#team"
              className="text-muted hover:text-ink transition-colors"
            >
              Team
            </a>
            <a
              href="#writing"
              className="text-muted hover:text-ink transition-colors"
            >
              Writing
            </a>
          </nav>
          <div className="flex items-center gap-[18px]">
            <div className="hidden items-center gap-[18px] sm:flex">
              <StatusPill>2 slots · Q3</StatusPill>
              <Button href="#contact">Trigger the effect</Button>
            </div>
            <MobileMenu />
          </div>
        </div>
      </Container>
    </header>
  )
}
