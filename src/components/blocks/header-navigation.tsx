'use client'

import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'

import { usePathname } from 'next/navigation'
import Link from 'next/link'

import { useMedia } from 'react-use'
import { ChevronRightIcon, CircleSmallIcon, MenuIcon } from 'lucide-react'

import { useActiveSection } from '@/hooks/use-active-section'

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle
} from '@/components/ui/navigation-menu'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from '@/components/ui/sheet'
import { PrimarySwipeButton } from '@/components/ui/swipe-button'

import { cn } from '@/lib/utils'

import Logo from '@/components/logo'
import LogoSmall from '../logoSmall'

type NavigationItem = {
  title: string
  href: string
  icon?: ReactNode
  description?: string
}

type ImageSection = {
  img: string
  href: string
  title: string
  description?: string
}

type Navigation = {
  title: string
  contentClassName?: string
} & (
  | {
      href: string
      items?: never
      subtitle?: never
      imgSubtitle?: never
      imageSection?: never
    }
  | {
      href?: never
      subtitle?: never
      imgSubtitle?: never
      items?: NavigationItem[]
      imageSection?: never
    }
  | {
      href?: never
      subtitle: string
      imgSubtitle: string
      items?: NavigationItem[]
      imageSection: ImageSection
    }
)

// Helper component to render navigation items with icons/descriptions
const RichNavigationItem = ({
  item,
  activeSection,
  pathname
}: {
  item: NavigationItem
  activeSection?: string
  pathname?: string
}) => {
  // Extract section id from href (e.g., '#hero' -> 'hero')
  const sectionId = item.href.startsWith('/#')
    ? item.href.slice(2)
    : item.href.startsWith('#')
      ? item.href.slice(1)
      : ''

  // Check if it's a hash-based link or route-based link
  const isActive = sectionId ? activeSection === sectionId : pathname?.startsWith(item.href)

  return (
    <NavigationMenuLink href={item.href} data-active={isActive} className='flex gap-2 p-2' asChild>
      <Link href={item.href}>
        <div className='flex items-start gap-2'>
          {item.icon && (
            <div className='bg-background [&_svg]:text-foreground! flex size-7.5 items-center justify-center rounded-sm border [&_svg]:size-4.5'>
              {item.icon}
            </div>
          )}
          <div className='flex-1 space-y-1'>
            <div className='text-popover-foreground text-base font-medium'>{item.title}</div>
            {item.description && <p className='text-muted-foreground line-clamp-2 text-sm'>{item.description}</p>}
          </div>
        </div>
      </Link>
    </NavigationMenuLink>
  )
}

// Helper component to render simple navigation items
const SimpleNavigationItem = ({
  item,
  activeSection,
  pathname
}: {
  item: NavigationItem
  activeSection?: string
  pathname?: string
}) => {
  // Extract section id from href (e.g., '#hero' -> 'hero')
  const sectionId = item.href.startsWith('/#')
    ? item.href.slice(2)
    : item.href.startsWith('#')
      ? item.href.slice(1)
      : ''

  // Check if it's a hash-based link or route-based link
  const isActive = sectionId ? activeSection === sectionId : pathname?.startsWith(item.href)

  return (
    <NavigationMenuLink href={item.href} data-active={isActive} className='block rounded-md p-2' asChild>
      <Link href={item.href}>{item.title}</Link>
    </NavigationMenuLink>
  )
}

// Helper component to render the image section
const ImageSectionContent = ({ imageSection }: { imageSection: ImageSection }) => (
  <Link href={imageSection.href} className='relative block h-full overflow-hidden rounded-md'>
    <img src={imageSection.img} alt={imageSection.title} className='h-full w-full rounded-md object-cover' />
    <span className='absolute bottom-0 h-1/2 w-full bg-linear-to-t from-black to-transparent' />
    <span className='absolute bottom-0 p-4 text-white'>
      <h3 className='font-semibold'>{imageSection.title}</h3>
      {imageSection.description && <p className='text-sm'>{imageSection.description}</p>}
    </span>
  </Link>
)

const HeaderNavigation = ({ navigationData, className }: { navigationData: Navigation[]; className?: string }) => {
  const hasRichContent = (items?: NavigationItem[]) => items?.some(item => item.description || item.icon)

  const pathname = usePathname()

  // Extract all section IDs from navigation data
  const sectionIds = navigationData.flatMap(navItem => {
    if (navItem.href) {
      const id = navItem.href.startsWith('/#')
        ? navItem.href.slice(2)
        : navItem.href.startsWith('#')
          ? navItem.href.slice(1)
          : ''

      return id ? [id] : []
    }

    if (navItem.items) {
      return navItem.items
        .map(item => {
          const id = item.href.startsWith('/#')
            ? item.href.slice(2)
            : item.href.startsWith('#')
              ? item.href.slice(1)
              : ''

          return id
        })
        .filter(Boolean)
    }

    return []
  })

  const activeSection = useActiveSection(sectionIds)

  return (
    <div className={cn('flex items-center', className)}>
      <NavigationMenu viewport={false}>
        <NavigationMenuList className='flex-wrap gap-0'>
          {navigationData.map(navItem => {
            // Simple link (no dropdown)
            if (navItem.href) {
              const sectionId = navItem.href.startsWith('/#')
                ? navItem.href.slice(2)
                : navItem.href.startsWith('#')
                  ? navItem.href.slice(1)
                  : ''

              // Check if it's a hash-based link or route-based link
              const isActive = sectionId ? activeSection === sectionId : pathname.startsWith(navItem.href)

              return (
                <NavigationMenuItem key={navItem.title}>
                  <NavigationMenuLink
                    href={navItem.href}
                    data-active={isActive}
                    className={cn(
                      navigationMenuTriggerStyle(),
                      'text-muted-foreground data-[active=true]:text-primary bg-transparent px-3! py-1.5! text-base! font-medium! shadow-none hover:bg-transparent focus:bg-transparent focus-visible:bg-transparent data-[active=true]:bg-transparent hover:data-[active=true]:bg-transparent focus:data-[active=true]:bg-transparent active:data-[active=true]:bg-transparent'
                    )}
                    asChild
                  >
                    <Link href={navItem.href}>{navItem.title}</Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              )
            }

            // Dropdown with items
            const ItemComponent = hasRichContent(navItem.items) ? RichNavigationItem : SimpleNavigationItem
            const spacing = hasRichContent(navItem.items) ? 'space-y-2' : 'space-y-0.5'

            // Check if any child item is active
            let hasActiveChild = false

            if (navItem.items) {
              hasActiveChild = navItem.items.some(item => {
                const id = item.href.startsWith('/#')
                  ? item.href.slice(2)
                  : item.href.startsWith('#')
                    ? item.href.slice(1)
                    : ''

                return id && activeSection === id
              })
            }

            return (
              <NavigationMenuItem key={navItem.title}>
                <NavigationMenuTrigger
                  data-active={hasActiveChild}
                  className='text-muted-foreground data-[active=true]:text-primary! focus:text-muted-foreground bg-transparent px-3! py-1.5! text-base! font-medium! shadow-none hover:bg-transparent focus:bg-transparent focus-visible:bg-transparent data-[state=open]:bg-transparent hover:data-[state=open]:bg-transparent focus:data-[state=open]:bg-transparent [&_svg]:size-4'
                >
                  {navItem.title}
                </NavigationMenuTrigger>
                <NavigationMenuContent
                  className={cn(
                    navItem.contentClassName,
                    'left-1/2 -translate-x-1/2 bg-white/35! shadow-lg! backdrop-blur-sm! dark:bg-black/35!'
                  )}
                >
                  {navItem.imageSection ? (
                    <div className='grid grid-cols-2 gap-2'>
                      <ul className='bg-background space-y-2 rounded-md border p-2'>
                        <li className='text-muted-foreground px-2 text-sm'>{navItem.subtitle}</li>
                        {navItem.items?.map(item => (
                          <li key={item.title}>
                            <RichNavigationItem item={item} activeSection={activeSection} />
                          </li>
                        ))}
                      </ul>
                      <div className='relative flex h-full flex-col overflow-hidden'>
                        <h3 className='text-muted-foreground mb-2 px-2 text-sm'>{navItem.imgSubtitle}</h3>
                        <div className='flex-1'>
                          <ImageSectionContent imageSection={navItem.imageSection} />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <ul className={cn('bg-background rounded-md border p-2', spacing)}>
                      {navItem.items?.map(item => (
                        <li key={item.title}>
                          <ItemComponent item={item} activeSection={activeSection} pathname={pathname} />
                        </li>
                      ))}
                    </ul>
                  )}
                </NavigationMenuContent>
              </NavigationMenuItem>
            )
          })}
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  )
}

const HeaderNavigationSmallScreen = ({
  navigationData,
  triggerClassName,
  screenSize = 1023
}: {
  navigationData: Navigation[]
  triggerClassName?: string
  screenSize?: number
}) => {
  const [open, setOpen] = useState(false)
  const isMobile = useMedia(`(max-width: ${screenSize}px)`, false)

  const pathname = usePathname()

  // Extract all section IDs from navigation data
  const sectionIds = navigationData.flatMap(navItem => {
    if (navItem.href) {
      const id = navItem.href.startsWith('/#')
        ? navItem.href.slice(2)
        : navItem.href.startsWith('#')
          ? navItem.href.slice(1)
          : ''

      return id ? [id] : []
    }

    if (navItem.items) {
      return navItem.items
        .map(item => {
          const id = item.href.startsWith('/#')
            ? item.href.slice(2)
            : item.href.startsWith('#')
              ? item.href.slice(1)
              : ''

          return id
        })
        .filter(Boolean)
    }

    return []
  })

  const activeSection = useActiveSection(sectionIds)

  const handleLinkClick = () => {
    setOpen(false)
  }

  useEffect(() => {
    if (!isMobile) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setOpen(false)
    }
  }, [isMobile])

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <PrimarySwipeButton size='icon' className={cn('inline-flex lg:hidden', triggerClassName)}>
          <MenuIcon />
          <span className='sr-only'>Menu</span>
        </PrimarySwipeButton>
      </SheetTrigger>
      <SheetContent side='left' className='w-75 gap-0 p-0'>
        <SheetHeader className='p-4'>
          <SheetTitle hidden />
          <SheetDescription hidden />
          <Link href='#' onClick={handleLinkClick}>
            <LogoSmall />
          </Link>
        </SheetHeader>
        <div className='space-y-0.5 overflow-y-auto p-2'>
          {navigationData.map((navItem, index) => {
            if (navItem.href) {
              const sectionId = navItem.href.startsWith('/#')
                ? navItem.href.slice(2)
                : navItem.href.startsWith('#')
                  ? navItem.href.slice(1)
                  : ''

              // Check if it's a hash-based link or route-based link
              const isActive = sectionId ? activeSection === sectionId : pathname.startsWith(navItem.href)

              return (
                <Link
                  key={navItem.title}
                  href={navItem.href}
                  data-active={isActive}
                  className='hover:bg-accent data-[active=true]:bg-accent flex items-center gap-2 rounded-sm px-3 py-2 text-sm data-[active=true]:font-medium'
                  onClick={handleLinkClick}
                >
                  {navItem.title}
                </Link>
              )
            }

            // Check if any child item is active
            let hasActiveChild = false

            if (navItem.items) {
              hasActiveChild = navItem.items.some(item => {
                const id = item.href.startsWith('/#')
                  ? item.href.slice(2)
                  : item.href.startsWith('#')
                    ? item.href.slice(1)
                    : ''

                return id && activeSection === id
              })
            }

            return (
              <Collapsible key={index} className='w-full'>
                <CollapsibleTrigger
                  data-active={hasActiveChild}
                  className='hover:bg-accent data-[active=true]:bg-accent group flex w-full items-center justify-between rounded-sm px-3 py-2 text-sm data-[active=true]:font-medium'
                >
                  <div className='flex items-center gap-2'>{navItem.title}</div>
                  <ChevronRightIcon className='size-4 shrink-0 transition-transform duration-300 group-data-[state=open]:rotate-90' />
                </CollapsibleTrigger>
                <CollapsibleContent className='data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down overflow-hidden transition-all duration-300'>
                  {navItem.items?.map(item => {
                    const sectionId = item.href.startsWith('/#')
                      ? item.href.slice(2)
                      : item.href.startsWith('#')
                        ? item.href.slice(1)
                        : ''

                    const isActive = sectionId && activeSection === sectionId

                    return (
                      <Link
                        key={item.title}
                        href={item.href}
                        data-active={isActive}
                        className='hover:bg-accent data-[active=true]:text-primary ml-3 flex items-center gap-2 rounded-sm px-3 py-2 text-sm data-[active=true]:font-medium'
                        onClick={handleLinkClick}
                      >
                        {item.icon ? item.icon : <CircleSmallIcon className='size-4' />}
                        {item.title}
                      </Link>
                    )
                  })}
                </CollapsibleContent>
              </Collapsible>
            )
          })}

        </div>
      </SheetContent>
    </Sheet>
  )
}

export { HeaderNavigation, HeaderNavigationSmallScreen, type Navigation, type NavigationItem, type ImageSection }
