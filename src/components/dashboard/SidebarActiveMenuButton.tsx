'use client'

import type { ReactNode } from 'react'

import { usePathname } from 'next/navigation'

import { SidebarMenuButton, SidebarMenuSubButton } from '@/components/ui/sidebar'

const isCurrentHref = (pathname: string, href: string) => pathname === href || pathname.startsWith(`${href}/`)

export const SidebarActiveMenuButton = ({
  children,
  className,
  href,
  tooltip
}: {
  children: ReactNode
  className?: string
  href: string
  tooltip: string
}) => {
  const pathname = usePathname()

  return (
    <SidebarMenuButton tooltip={tooltip} asChild isActive={isCurrentHref(pathname, href)} className={className}>
      {children}
    </SidebarMenuButton>
  )
}

export const SidebarActiveDropdownButton = ({
  children,
  className,
  itemHrefs,
  title
}: {
  children: ReactNode
  className?: string
  itemHrefs: string[]
  title: string
}) => {
  const pathname = usePathname()
  const isActive = itemHrefs.some(href => isCurrentHref(pathname, href))

  return (
    <SidebarMenuButton tooltip={title} isActive={isActive} className={className}>
      {children}
    </SidebarMenuButton>
  )
}

export const SidebarActiveSubButton = ({
  children,
  className,
  href
}: {
  children: ReactNode
  className?: string
  href: string
}) => {
  const pathname = usePathname()

  return (
    <SidebarMenuSubButton asChild isActive={isCurrentHref(pathname, href)} className={className}>
      {children}
    </SidebarMenuSubButton>
  )
}
