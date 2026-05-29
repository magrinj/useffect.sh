import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

interface EyebrowProps {
  children: ReactNode
  dot?: boolean
  variant?: 'light' | 'dark'
  className?: string
}

export function Eyebrow({
  children,
  dot = true,
  variant = 'light',
  className,
}: EyebrowProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 font-mono text-[12px] tracking-[0.02em]',
        variant === 'dark' ? 'text-dark-muted' : 'text-muted',
        className,
      )}
    >
      {dot && (
        <span
          aria-hidden
          className="inline-block size-[6px] rounded-full bg-accent shadow-[0_0_0_3px_rgba(0,200,83,0.12)]"
        />
      )}
      {children}
    </span>
  )
}
