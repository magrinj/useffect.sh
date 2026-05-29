import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

interface SectionProps {
  id?: string
  children: ReactNode
  variant?: 'light' | 'dark'
  className?: string
  as?: 'section' | 'header' | 'footer' | 'aside'
}

export function Section({
  id,
  children,
  variant = 'light',
  className,
  as: As = 'section',
}: SectionProps) {
  return (
    <As
      id={id}
      className={cn(
        'relative border-t',
        variant === 'dark' ? 'bg-dark text-bg border-dark-line' : 'border-line',
        className,
      )}
    >
      {children}
    </As>
  )
}
