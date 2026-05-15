'use client'

import { MoonStarIcon, SunIcon } from 'lucide-react'
import { useTheme } from 'next-themes'

import { SecondarySwipeButton } from '@/components/ui/swipe-button'

const ModeToggle = () => {
  const { resolvedTheme, setTheme } = useTheme()

  return (
    <SecondarySwipeButton
      size='icon'
      className='relative'
      onClick={() => setTheme(resolvedTheme === 'light' ? 'dark' : 'light')}
    >
      <MoonStarIcon className='scale-100 dark:scale-0' />
      <SunIcon className='absolute scale-0 dark:scale-100' />
      <span className='sr-only'>Toggle theme</span>
    </SecondarySwipeButton>
  )
}

export { ModeToggle }
