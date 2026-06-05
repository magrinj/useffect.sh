'use client'

import { useTranslations } from 'next-intl'
import { type KeyboardEvent, type MouseEvent, useEffect, useRef } from 'react'

const LINK_KEYS = ['work', 'services', 'team', 'writing', 'contact'] as const
const LINK_HREFS: Record<(typeof LINK_KEYS)[number], string> = {
  work: '#work',
  services: '#services',
  team: '#team',
  writing: '#writing',
  contact: '#contact',
}

export function MobileMenu() {
  const ref = useRef<HTMLDialogElement>(null)
  const t = useTranslations('nav')

  const open = () => ref.current?.showModal()
  const close = () => ref.current?.close()

  // Lock body scroll while open.
  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    const onToggle = () => {
      document.body.style.overflow = dialog.open ? 'hidden' : ''
    }
    dialog.addEventListener('toggle', onToggle)
    return () => {
      dialog.removeEventListener('toggle', onToggle)
      document.body.style.overflow = ''
    }
  }, [])

  const onAnchorClick = (e: MouseEvent<HTMLAnchorElement>) => {
    void e
    close()
  }

  const onKeyDown = (e: KeyboardEvent<HTMLDialogElement>) => {
    if (e.key === 'Escape') close()
  }

  return (
    <>
      <button
        type="button"
        onClick={open}
        aria-label={t('mobile.openMenu')}
        className="inline-flex flex-col items-end justify-center gap-1.5 p-2 md:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        <span aria-hidden={true} className="block h-px w-6 bg-ink" />
        <span aria-hidden={true} className="block h-px w-4 bg-ink" />
      </button>

      <dialog
        ref={ref}
        onKeyDown={onKeyDown}
        className="m-0 size-full max-h-none max-w-none bg-bg p-0 text-ink backdrop:bg-ink/40 open:flex open:flex-col"
        aria-label={t('mobile.menuLabel')}
      >
        <div className="flex items-center justify-end px-6 py-5">
          <button
            type="button"
            onClick={close}
            aria-label={t('mobile.closeMenu')}
            className="font-mono text-[14px] text-muted hover:text-ink"
          >
            {t('mobile.close')}
          </button>
        </div>
        <nav className="flex flex-1 flex-col gap-6 px-6 pb-12 font-mono text-[20px]">
          {LINK_KEYS.map((key) => (
            <a
              key={key}
              href={LINK_HREFS[key]}
              onClick={onAnchorClick}
              className="text-ink hover:text-accent"
            >
              {t(`links.${key}`)}
            </a>
          ))}
        </nav>
      </dialog>
    </>
  )
}
