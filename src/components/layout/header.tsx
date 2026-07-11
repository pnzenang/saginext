'use client'

import { useEffect, useMemo, useState } from 'react'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

import { LogIn } from 'lucide-react'

import type { Navigation, NavigationItem } from '@/components/blocks/header-navigation'
import { HeaderNavigation, HeaderNavigationSmallScreen } from '@/components/blocks/header-navigation'
import { LanguageToggle } from '@/components/global/LanguageToggle'
import { ModeToggle } from '@/components/layout/mode-toggle'
import { PrimarySwipeButton } from '@/components/ui/swipe-button'

import {
  normalizeLanguage,
  siteHeaderText,
  translateSiteHeaderNavigationLabel,
  type AppLanguage
} from '@/lib/i18n'
import { cn } from '@/lib/utils'

import Logo from '@/components/logo'
import LogoSmall from '../logoSmall'

type HeaderProps = {
  navigationData: Navigation[]
  language?: AppLanguage
  className?: string
}

const Header = ({ navigationData, language = 'en', className }: HeaderProps) => {
  const [isScrolled, setIsScrolled] = useState(false)
  const searchParams = useSearchParams()
  const currentLanguage = normalizeLanguage(searchParams.get('lang') ?? language)
  const copy = siteHeaderText[currentLanguage]

  const translatedNavigationData = useMemo<Navigation[]>(() => {
    const translateLabel = (label: string) => translateSiteHeaderNavigationLabel(label, currentLanguage)

    const translateItem = (item: NavigationItem): NavigationItem => ({
      ...item,
      title: translateLabel(item.title),
      description: item.description ? translateLabel(item.description) : item.description
    })

    return navigationData.map(navItem => {
      const title = translateLabel(navItem.title)

      if ('href' in navItem && navItem.href) {
        const translatedNavItem = {
          ...navItem,
          title
        } as Navigation

        return translatedNavItem
      }

      if ('imageSection' in navItem && navItem.imageSection) {
        const translatedNavItem = {
          ...navItem,
          title,
          subtitle: translateLabel(navItem.subtitle),
          imgSubtitle: translateLabel(navItem.imgSubtitle),
          items: navItem.items?.map(translateItem),
          imageSection: {
            ...navItem.imageSection,
            title: translateLabel(navItem.imageSection.title),
            description: navItem.imageSection.description
              ? translateLabel(navItem.imageSection.description)
              : navItem.imageSection.description
          }
        } as Navigation

        return translatedNavItem
      }

      const translatedNavItem = {
        ...navItem,
        title,
        items: navItem.items?.map(translateItem)
      } as Navigation

      return translatedNavItem
    })
  }, [currentLanguage, navigationData])

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
          { 'xl:max-w-6xl': isScrolled, 'sm:pl-2 lg:pl-1': !isScrolled }
        )}
      >
        {/* Logo */}
        <div className='shrink-0'>
          <Link href='/#home'>
            <Logo className='hidden pt-2 sm:block' />
            <LogoSmall className='block pt-1 sm:hidden' />
          </Link>
        </div>

        {/* Navigation */}
        <HeaderNavigation navigationData={translatedNavigationData} className='max-lg:hidden' />

        {/* Actions */}
        <div className='flex shrink-0 items-center gap-3'>
          <LanguageToggle homeOnly initialLanguage={language} />

          <ModeToggle />

          {/* Get started Button */}
          <PrimarySwipeButton className='rounded-full max-lg:hidden' asChild>
            <Link href='/sign-in' prefetch={false}>
              {copy.login}
            </Link>
          </PrimarySwipeButton>

          {/* Navigation for small screens */}
          <div className='flex gap-3 lg:hidden'>
            <PrimarySwipeButton className=':hidden flex items-center rounded-full' asChild size='icon'>
              <Link href='/sign-in' aria-label={copy.login} prefetch={false}>
                <LogIn />
              </Link>
            </PrimarySwipeButton>

            <HeaderNavigationSmallScreen navigationData={translatedNavigationData} />
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
