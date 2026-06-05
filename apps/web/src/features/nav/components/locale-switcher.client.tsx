'use client'

import { useLocale } from 'next-intl'
import { Link, usePathname } from '@/i18n/navigation'
import { routing } from '@/i18n/routing'
import { cn } from '@/lib/cn'

export function LocaleSwitcher() {
  const active = useLocale()
  // next-intl's usePathname returns the path WITHOUT the locale prefix, so we
  // can hand it straight to <Link locale={…}> and let the router re-prepend
  // the right one.
  const pathname = usePathname()

  return (
    <nav
      aria-label="language"
      className="flex items-center gap-1 font-mono text-[13px]"
    >
      {routing.locales.map((locale, i) => (
        <span key={locale} className="flex items-center">
          {i > 0 && (
            <span aria-hidden className="px-1 text-muted-2">
              |
            </span>
          )}
          <Link
            href={pathname}
            locale={locale}
            aria-current={active === locale ? 'page' : undefined}
            className={cn(
              'uppercase transition-colors',
              active === locale
                ? 'text-accent font-semibold'
                : 'text-muted hover:text-ink',
            )}
          >
            {locale}
          </Link>
        </span>
      ))}
    </nav>
  )
}
