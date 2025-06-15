import React from 'react'
import { cn } from '@/lib/utils'

interface SpinnerProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export const Spinner: React.FC<SpinnerProps> = ({ className, size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  }

  return (
    <div
      className={cn(
        'animate-spin rounded-full border-2 border-muted border-t-foreground',
        sizeClasses[size],
        className
      )}
    />
  )
} 