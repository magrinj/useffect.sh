import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

interface ContainerProps {
  children: ReactNode
  className?: string
}

export function Container({ children, className }: ContainerProps) {
  return (
    <div
      className={cn(
        'mx-auto w-full max-w-[1280px] px-[clamp(20px,4vw,56px)]',
        className,
      )}
    >
      {children}
    </div>
  )
}
