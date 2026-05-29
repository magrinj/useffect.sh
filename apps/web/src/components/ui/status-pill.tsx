import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

interface StatusPillProps {
  children: ReactNode
  className?: string
}

export function StatusPill({ children, className }: StatusPillProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 border border-line px-[10px] py-[6px] font-mono text-[12px] text-muted',
        className,
      )}
    >
      <span
        aria-hidden
        className="inline-block size-[6px] rounded-full bg-accent shadow-[0_0_0_3px_rgba(0,200,83,0.15)] animate-pulse-dot"
      />
      {children}
    </span>
  )
}
