'use client'

import type { ReactNode } from 'react'

import { usePathname } from 'next/navigation'

import { CollapsibleTrigger } from '@/components/ui/collapsible'
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
  title
}: {
  children: ReactNode
  className?: string
  title: string
}) => {
  return (
    <CollapsibleTrigger asChild>
      <SidebarMenuButton tooltip={title} className={className}>
        {children}
      </SidebarMenuButton>
    </CollapsibleTrigger>
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
