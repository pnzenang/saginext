'use client'

import { useEffect, useState } from 'react'

import Link from 'next/link'

import { LogIn } from 'lucide-react'

import type { Navigation } from '@/components/blocks/header-navigation'
import { HeaderNavigation, HeaderNavigationSmallScreen } from '@/components/blocks/header-navigation'
import { ModeToggle } from '@/components/layout/mode-toggle'
import { PrimarySwipeButton } from '@/components/ui/swipe-button'

import { cn } from '@/lib/utils'

import Logo from '@/components/logo'
import LogoSmall from '../logoSmall'

type HeaderProps = {
  navigationData: Navigation[]
  className?: string
}

const Header = ({ navigationData, className }: HeaderProps) => {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 56)
    }

    window.addEventListener('scroll', handleScroll)
    handleScroll()

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return (
    <header
      className={cn(
        'sticky top-2 z-50 flex h-14 w-full items-end justify-center px-4 sm:h-20 sm:px-6 lg:px-8',
        className
      )}
    >
      <div
        className={cn(
          'border-background relative flex h-14 w-full max-w-7xl items-center justify-between gap-4 rounded-full border pr-4 transition-all duration-700 before:absolute before:inset-0 before:-z-1 before:rounded-full before:bg-linear-to-b before:from-white/50 before:to-white before:backdrop-blur-[6px] sm:h-20 dark:before:from-black/50 dark:before:to-black',
          { 'max-w-4xl': isScrolled, 'sm:pl-2 lg:pl-1': !isScrolled }
        )}
      >
        {/* Logo */}
        <div>
          <Link href='/#home '>
            <Logo className='hidden pt-2 sm:block' />
            <LogoSmall className='block pt-1 sm:hidden' />
          </Link>
        </div>

        {/* Navigation */}
        <HeaderNavigation navigationData={navigationData} className='max-lg:hidden' />

        {/* Actions */}
        <div className='flex items-center gap-3'>
          <ModeToggle />

          {/* Get started Button */}
          <PrimarySwipeButton className='rounded-full max-lg:hidden' asChild>
            <Link href='/sign-in'>Login</Link>
          </PrimarySwipeButton>

          {/* Navigation for small screens */}
          <div className='flex gap-3 lg:hidden'>
            <PrimarySwipeButton className=':hidden flex items-center rounded-full' asChild size='icon'>
              <Link href='/sign-in'>
                <LogIn />
              </Link>
            </PrimarySwipeButton>

            <HeaderNavigationSmallScreen navigationData={navigationData} />
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
