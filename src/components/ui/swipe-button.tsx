'use client'

import * as React from 'react'

import type { VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

import { Button, type buttonVariants } from '@/components/ui/button'

interface SwipeButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: VariantProps<typeof buttonVariants>['size']
  children: React.ReactNode
  className?: string
  asChild?: boolean
}

function PrimarySwipeButton({ children, size, asChild = false, className, ...props }: SwipeButtonProps) {
  return (
    <Button
      size={size}
      asChild={asChild}
      className={cn(
        'ring-primary/60 hover:bg-primary relative overflow-hidden rounded-full shadow-[inset_0_-3px_6px_0px_rgba(255,255,255,0.90)] ring-2 duration-500 text-shadow-xs hover:shadow-[inset_0_-3px_6px_-2px_rgba(255,255,255,0.90)] dark:shadow-[inset_0_-3px_6px_0px_rgba(0,0,0,0.60)] dark:hover:shadow-[inset_0_-3px_6px_-2px_rgba(0,0,0,0.60)]',

        size === 'lg' && 'text-base has-[>svg]:px-6',
        className
      )}
      {...props}
    >
      {children}
    </Button>
  )
}

function SecondarySwipeButton({ children, size, asChild = false, className, ...props }: SwipeButtonProps) {
  return (
    <Button
      size={size}
      asChild={asChild}
      className={cn(
        'ring-primary/60 hover:bg-primary/10 text-primary bg-primary/10 relative overflow-hidden rounded-full shadow-[inset_0_-3px_6px_0px_rgba(255,255,255,100)] ring-2 duration-500 hover:shadow-[inset_0_-3px_6px_-2px_rgba(255,255,255,100)]',
        size === 'lg' && 'text-base has-[>svg]:px-6',
        className
      )}
      {...props}
    >
      {children}
    </Button>
  )
}

export { PrimarySwipeButton, SecondarySwipeButton, type SwipeButtonProps }
