'use client'

import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

interface SectionProps {
  children: ReactNode
  className?: string
}

export function Section({ children, className }: SectionProps) {
  return (
    <section
      className={cn(
        'flex w-full flex-col items-center py-8',
        'md:max-w-screen-sm lg:max-w-screen-md xl:max-w-screen-lg 2xl:max-w-screen-xl',
        className,
      )}
    >
      {children}
    </section>
  )
}
