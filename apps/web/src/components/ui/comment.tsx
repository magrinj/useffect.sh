import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

interface CommentProps {
  children: ReactNode
  variant?: 'light' | 'dark'
  className?: string
}

export function Comment({
  children,
  variant = 'light',
  className,
}: CommentProps) {
  return (
    <span
      className={cn(
        'font-mono text-[13px]',
        variant === 'dark' ? 'text-dark-muted' : 'text-muted',
        className,
      )}
    >
      {children}
    </span>
  )
}
