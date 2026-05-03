import { cn } from '@/lib/utils'
import React from 'react'

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  as?: 'section' | 'div' | 'main'
}

export function Section({ as: Tag = 'section', className, children, ...props }: SectionProps) {
  return (
    <Tag className={cn('mx-auto max-w-7xl px-6 py-24 md:py-32', className)} {...props}>
      {children}
    </Tag>
  )
}
