'use client'

import type { MouseEvent, PointerEvent } from 'react'

import { useRouter } from 'next/navigation'

import { cn } from '@/lib/utils'

const formatActionCount = (count: number) => (count > 99 ? '99+' : String(count))

const getActionCountLabel = (count: number) => `${count} action${count === 1 ? '' : 's'} required`

const stopDropdownToggle = (event: MouseEvent<HTMLSpanElement> | PointerEvent<HTMLSpanElement>) => {
  event.preventDefault()
  event.stopPropagation()
}

const SidebarAlertNavigationBadge = ({
  className,
  count,
  href,
  showCollapsedDot = false
}: {
  className?: string
  count?: number
  href?: string
  showCollapsedDot?: boolean
}) => {
  const router = useRouter()

  if (!count || count <= 0) return null

  const label = getActionCountLabel(count)

  const handleClick = (event: MouseEvent<HTMLSpanElement>) => {
    stopDropdownToggle(event)

    if (href) {
      router.push(href)
    }
  }

  return (
    <>
      <span
        aria-label={href ? `${label}. Open alert page.` : label}
        className={cn(
          'ml-2 flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-amber-500 px-1.5 text-[10px] leading-none font-black text-amber-950 tabular-nums ring-1 ring-amber-200',
          'group-data-[collapsible=icon]:hidden',
          href && 'cursor-pointer hover:bg-amber-400',
          className
        )}
        onClick={handleClick}
        onPointerDown={stopDropdownToggle}
        title={href ? `${label}. Open alert page.` : label}
      >
        {formatActionCount(count)}
      </span>
      {showCollapsedDot ? (
        <span
          aria-hidden='true'
          className={cn(
            'ring-sidebar absolute top-1 right-1 hidden size-2 rounded-full bg-amber-500 ring-2 group-data-[collapsible=icon]:block',
            href && 'cursor-pointer hover:bg-amber-400'
          )}
          onClick={handleClick}
          onPointerDown={stopDropdownToggle}
        />
      ) : null}
    </>
  )
}

export default SidebarAlertNavigationBadge
