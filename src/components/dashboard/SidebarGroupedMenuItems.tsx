import Link from 'next/link'

import { ChevronRight, UserCog } from 'lucide-react'

import { auth } from '@clerk/nextjs/server'

import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible'
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem
} from '../ui/sidebar'
import type { MenuItem } from '@/utils/types'
import { SidebarActiveDropdownButton, SidebarActiveMenuButton, SidebarActiveSubButton } from './SidebarActiveMenuButton'

const primarySidebarStateClass =
  'hover:bg-primary hover:text-primary-foreground active:bg-primary active:text-primary-foreground focus:bg-primary focus:text-primary-foreground data-[active=true]:bg-primary data-[active=true]:text-primary-foreground [&>svg]:text-current'

const primarySidebarInteractiveClass =
  'hover:bg-primary hover:text-primary-foreground active:bg-primary active:text-primary-foreground focus:bg-primary focus:text-primary-foreground [&>svg]:text-current'

const sidebarLinkClass = `my-1 min-h-11 py-2 text-base transition-colors duration-200 md:min-h-8 md:py-1 md:text-sm md:hover:ml-3 ${primarySidebarStateClass}`

const sidebarDropdownClass = `my-1 h-auto min-h-12 py-2 text-base transition-colors duration-200 md:min-h-10 md:text-sm md:hover:ml-3 [&[data-state=open]>svg:last-child]:rotate-90 ${primarySidebarInteractiveClass}`

const sidebarSubLinkClass =
  'hover:bg-primary hover:text-primary-foreground active:bg-primary active:text-primary-foreground focus:bg-primary focus:text-primary-foreground data-[active=true]:bg-primary data-[active=true]:text-primary-foreground [&>svg]:text-current'

const isAdminItem = (item: MenuItem) =>
  item.href.startsWith('/admin-') || item.label.trim().toLowerCase().startsWith('admin')

const getAdminLabel = (label: string) => {
  const trimmedLabel = label.trim()

  if (trimmedLabel.toLowerCase() === 'admin count') return trimmedLabel

  return trimmedLabel.replace(/^admin\s+/i, '')
}

const SidebarLinkItem = ({ item }: { item: MenuItem }) => (
  <SidebarMenuItem>
    <SidebarActiveMenuButton tooltip={item.label} href={item.href} className={sidebarLinkClass}>
      <Link href={item.href}>
        <item.icon />
        <span className='truncate capitalize'>{item.label}</span>
      </Link>
    </SidebarActiveMenuButton>
  </SidebarMenuItem>
)

const SidebarDropdownMenu = ({
  icon: Icon,
  title,
  subtitle,
  items,
  formatLabel = label => label
}: {
  icon: MenuItem['icon']
  title: string
  subtitle?: string
  items: MenuItem[]
  formatLabel?: (label: string) => string
}) => (
  <Collapsible asChild>
    <SidebarMenuItem>
      <SidebarActiveDropdownButton title={title} className={sidebarDropdownClass}>
        <Icon />
        <span className='flex min-w-0 flex-col'>
          <span className='truncate capitalize'>{title}</span>
          {subtitle ? (
            <span className='text-muted-foreground truncate text-xs font-normal normal-case group-data-[collapsible=icon]:hidden'>
              {subtitle}
            </span>
          ) : null}
        </span>
        <ChevronRight className='ml-auto transition-transform duration-200' />
      </SidebarActiveDropdownButton>
      <CollapsibleContent>
        <SidebarMenuSub>
          {items.map(item => (
            <SidebarMenuSubItem key={item.href}>
              <SidebarActiveSubButton href={item.href} className={sidebarSubLinkClass}>
                <Link href={item.href}>
                  <item.icon />
                  <span className='truncate capitalize'>{formatLabel(item.label)}</span>
                </Link>
              </SidebarActiveSubButton>
            </SidebarMenuSubItem>
          ))}
        </SidebarMenuSub>
      </CollapsibleContent>
    </SidebarMenuItem>
  </Collapsible>
)

const SidebarGroupedMenuItems = async ({
  data,
  adminLabel = 'Admin',
  groupLabel
}: {
  data: MenuItem[]
  adminLabel?: string
  groupLabel?: string
}) => {
  const { userId } = await auth()
  const isAdminUser = userId === process.env.ADMIN_USER_ID
  const adminItems = isAdminUser ? data.filter(isAdminItem) : []
  const firstAdminItemIndex = data.findIndex(isAdminItem)

  return (
    <SidebarGroup className='justify-center pt-3 md:pt-16'>
      {groupLabel && <SidebarGroupLabel>{groupLabel}</SidebarGroupLabel>}
      <SidebarGroupContent>
        <SidebarMenu>
          {data.map((item, index) => {
            if (isAdminItem(item)) {
              if (!isAdminUser || index !== firstAdminItemIndex) return null

              return (
                <SidebarDropdownMenu
                  key='admin-menu'
                  icon={UserCog}
                  title={adminLabel}
                  items={adminItems}
                  formatLabel={getAdminLabel}
                />
              )
            }

            return <SidebarLinkItem key={item.label} item={item} />
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

export default SidebarGroupedMenuItems
