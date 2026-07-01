'use client'

import { Suspense, useEffect, useMemo, useRef, useState, useTransition } from 'react'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import {
  languageCookieName,
  languageOptions,
  normalizeLanguage,
  type AppLanguage
} from '@/lib/i18n'
import { cn } from '@/lib/utils'

type LanguageToggleContentProps = {
  currentLanguage?: AppLanguage
  isPending?: boolean
  onSelectLanguage?: (language: AppLanguage) => void
}

const setLanguageCookie = (language: AppLanguage) => {
  document.cookie = `${languageCookieName}=${language}; Max-Age=31536000; Path=/; SameSite=Lax`
}

const getLanguageRedirectPath = (language: AppLanguage) => {
  const url = new URL(window.location.href)

  if (url.pathname === '/') {
    if (language === 'fr') {
      url.searchParams.set('lang', language)
    } else {
      url.searchParams.delete('lang')
    }
  } else {
    url.searchParams.delete('lang')
  }

  return `${url.pathname}${url.search}${url.hash}`
}

const LanguageToggleContent = ({ currentLanguage, isPending, onSelectLanguage }: LanguageToggleContentProps) => (
  <div
    className='ring-primary/60 bg-primary/10 text-primary flex h-9 items-center gap-1 rounded-full p-1 text-xs font-semibold shadow-[inset_0_-3px_6px_0px_rgba(255,255,255,100)] ring-2 backdrop-blur duration-500'
    aria-label='Choose site language'
  >
    {Object.entries(languageOptions).map(([language, option]) => {
      const typedLanguage = language as AppLanguage
      const isActive = typedLanguage === currentLanguage

      const className = cn(
        'flex h-7 items-center rounded-full px-2.5 transition',
        isActive ? 'bg-primary text-primary-foreground shadow-sm' : 'hover:bg-accent hover:text-foreground'
      )

      if (!onSelectLanguage) {
        return (
          <span key={language} className={className}>
            {option.shortLabel}
          </span>
        )
      }

      return (
        <button
          key={language}
          type='button'
          aria-label={option.ariaLabel}
          aria-current={isActive ? 'page' : undefined}
          disabled={isActive || isPending}
          className={className}
          onClick={() => onSelectLanguage(typedLanguage)}
        >
          {option.shortLabel}
        </button>
      )
    })}
  </div>
)

const LanguageToggleInner = ({
  homeOnly,
  initialLanguage
}: {
  homeOnly?: boolean
  initialLanguage: AppLanguage
}) => {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [selectedLanguage, setSelectedLanguage] = useState(initialLanguage)
  const scrollPositionRef = useRef<number | null>(null)
  const queryLanguage = searchParams.get('lang')
  const currentLanguage = normalizeLanguage(queryLanguage ?? selectedLanguage)
  const search = searchParams.toString()
  const currentPath = useMemo(() => `${pathname}${search ? `?${search}` : ''}`, [pathname, search])

  useEffect(() => {
    setSelectedLanguage(initialLanguage)
  }, [initialLanguage])

  useEffect(() => {
    if (scrollPositionRef.current === null) return

    const scrollPosition = scrollPositionRef.current
    let frame = 0
    let animationFrame = 0

    scrollPositionRef.current = null

    const restoreScrollPosition = () => {
      window.scrollTo({ top: scrollPosition, behavior: 'instant' })

      frame += 1

      if (frame < 3) {
        animationFrame = requestAnimationFrame(restoreScrollPosition)
      }
    }

    animationFrame = requestAnimationFrame(restoreScrollPosition)

    return () => {
      cancelAnimationFrame(animationFrame)
    }
  }, [currentPath])

  if (homeOnly && pathname !== '/') return null

  const handleSelectLanguage = (language: AppLanguage) => {
    if (language === currentLanguage) return

    setSelectedLanguage(language)
    setLanguageCookie(language)
    scrollPositionRef.current = window.scrollY

    const redirectPath = getLanguageRedirectPath(language)

    startTransition(() => {
      router.replace(redirectPath, { scroll: false })
    })
  }

  return (
    <LanguageToggleContent
      currentLanguage={currentLanguage}
      isPending={isPending}
      onSelectLanguage={handleSelectLanguage}
    />
  )
}

const LanguageToggle = ({
  homeOnly,
  initialLanguage = 'en'
}: {
  homeOnly?: boolean
  initialLanguage?: AppLanguage
}) => (
  <Suspense fallback={<LanguageToggleContent currentLanguage={initialLanguage} />}>
    <LanguageToggleInner homeOnly={homeOnly} initialLanguage={initialLanguage} />
  </Suspense>
)

export { LanguageToggle }
