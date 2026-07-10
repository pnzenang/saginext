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
import { cn } from '@/lib/utils'
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

const formatActionCount = (count: number) => (count > 99 ? '99+' : String(count))

const getActionCountLabel = (count: number) => `${count} action${count === 1 ? '' : 's'} required`

const SidebarActionBadge = ({
  className,
  count,
  showCollapsedDot = false
}: {
  className?: string
  count?: number
  showCollapsedDot?: boolean
}) => {
  if (!count || count <= 0) return null

  return (
    <>
      <span
        aria-label={getActionCountLabel(count)}
        className={cn(
          'ml-2 flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-amber-500 px-1.5 text-[10px] leading-none font-black text-amber-950 tabular-nums ring-1 ring-amber-200',
          'group-data-[collapsible=icon]:hidden',
          className
        )}
        title={getActionCountLabel(count)}
      >
        {formatActionCount(count)}
      </span>
      {showCollapsedDot ? (
        <span
          aria-hidden='true'
          className='ring-sidebar absolute top-1 right-1 hidden size-2 rounded-full bg-amber-500 ring-2 group-data-[collapsible=icon]:block'
        />
      ) : null}
    </>
  )
}

const getSidebarTooltip = (item: MenuItem) =>
  item.alertCount && item.alertCount > 0 ? `${item.label}: ${getActionCountLabel(item.alertCount)}` : item.label

const SidebarLinkItem = ({ item }: { item: MenuItem }) => (
  <SidebarMenuItem>
    <SidebarActiveMenuButton tooltip={getSidebarTooltip(item)} href={item.href} className={sidebarLinkClass}>
      <Link href={item.href}>
        <item.icon />
        <span className='min-w-0 flex-1 truncate capitalize'>{item.label}</span>
        <SidebarActionBadge count={item.alertCount} showCollapsedDot />
      </Link>
    </SidebarActiveMenuButton>
  </SidebarMenuItem>
)

const SidebarDropdownMenu = ({
  alertCount,
  icon: Icon,
  title,
  subtitle,
  items,
  formatLabel = label => label
}: {
  alertCount?: number
  icon: MenuItem['icon']
  title: string
  subtitle?: string
  items: MenuItem[]
  formatLabel?: (label: string) => string
}) => {
  const tooltipTitle = alertCount && alertCount > 0 ? `${title}: ${getActionCountLabel(alertCount)}` : title

  return (
    <Collapsible asChild>
      <SidebarMenuItem>
        <SidebarActiveDropdownButton title={tooltipTitle} className={sidebarDropdownClass}>
          <Icon />
          <span className='flex min-w-0 flex-1 flex-col'>
            <span className='truncate capitalize'>{title}</span>
            {subtitle ? (
              <span className='text-muted-foreground truncate text-xs font-normal normal-case group-data-[collapsible=icon]:hidden'>
                {subtitle}
              </span>
            ) : null}
          </span>
          <SidebarActionBadge count={alertCount} showCollapsedDot />
          <ChevronRight className='shrink-0 transition-transform duration-200' />
        </SidebarActiveDropdownButton>
        <CollapsibleContent>
          <SidebarMenuSub>
            {items.map(item => (
              <SidebarMenuSubItem key={item.href}>
                <SidebarActiveSubButton href={item.href} className={sidebarSubLinkClass}>
                  <Link href={item.href}>
                    <item.icon />
                    <span className='min-w-0 flex-1 truncate capitalize'>{formatLabel(item.label)}</span>
                    <SidebarActionBadge count={item.alertCount} />
                  </Link>
                </SidebarActiveSubButton>
              </SidebarMenuSubItem>
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  )
}

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
  const adminAlertCount = adminItems.reduce((total, item) => total + (item.alertCount ?? 0), 0)

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
                  alertCount={adminAlertCount}
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
