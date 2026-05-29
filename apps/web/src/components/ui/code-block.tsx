import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

interface CodeBlockProps {
  title: ReactNode
  /** Right-side status, e.g. "● live" */
  status?: ReactNode
  children: ReactNode
  variant?: 'light' | 'dark'
  className?: string
  /** aria-label for the wrapper */
  label?: string
}

export function CodeBlock({
  title,
  status,
  children,
  variant = 'light',
  className,
  label,
}: CodeBlockProps) {
  const isDark = variant === 'dark'
  return (
    <div
      {...(label ? { role: 'region', 'aria-label': label } : {})}
      data-variant={variant}
      className={cn(
        'overflow-hidden border',
        isDark ? 'bg-dark-2 text-bg border-dark-line' : 'bg-bg-2 border-line',
        className,
      )}
    >
      <header
        className={cn(
          'flex items-center justify-between gap-3 border-b px-3 py-2 font-mono text-[12px]',
          isDark
            ? 'border-dark-line text-dark-muted'
            : 'border-line text-muted',
        )}
      >
        <div className="flex items-center gap-[14px]">
          <div className="flex items-center gap-[6px]" aria-hidden>
            <span className="inline-block size-[10px] rounded-full bg-[#FF5F57]" />
            <span className="inline-block size-[10px] rounded-full bg-[#FEBC2E]" />
            <span className="inline-block size-[10px] rounded-full bg-[#28C840]" />
          </div>
          <span>{title}</span>
        </div>
        {status && <span>{status}</span>}
      </header>
      <pre
        className={cn(
          'overflow-x-auto px-4 py-3 font-mono text-[13px] leading-[1.7]',
          isDark ? 'text-bg' : 'text-ink',
        )}
      >
        <code>{children}</code>
      </pre>
    </div>
  )
}
