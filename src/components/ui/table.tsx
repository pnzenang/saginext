'use client'

import * as React from 'react'

import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

type TableProps = React.ComponentProps<'table'> & {
  mobileCards?: boolean
}

const getTooltipTitle = (title: React.HTMLAttributes<HTMLElement>['title']) =>
  typeof title === 'string' && title.trim() ? title : undefined

const truncatedTextSelector = '.truncate, .line-clamp-1, .line-clamp-2, .line-clamp-3'
const truncationClassNames = ['truncate', 'line-clamp-1', 'line-clamp-2', 'line-clamp-3']

const hasTruncationClass = (element: HTMLElement) =>
  truncationClassNames.some(className => element.classList.contains(className))

const getTruncatedTextCandidates = (element: HTMLElement) => {
  const candidates = new Set<HTMLElement>()

  if (hasTruncationClass(element)) candidates.add(element)

  element.querySelectorAll<HTMLElement>(truncatedTextSelector).forEach(candidate => candidates.add(candidate))

  return Array.from(candidates)
}

const hasVisibleOverflow = (element: HTMLElement) =>
  element.scrollWidth > element.clientWidth + 1 || element.scrollHeight > element.clientHeight + 1

const useTruncatedTooltip = <TElement extends HTMLElement>(tooltipTitle?: string) => {
  const elementRef = React.useRef<TElement>(null)
  const [isTruncated, setIsTruncated] = React.useState(false)

  React.useEffect(() => {
    if (!tooltipTitle) {
      setIsTruncated(false)

      return
    }

    const element = elementRef.current

    if (!element) return

    const checkTruncation = () => {
      setIsTruncated(getTruncatedTextCandidates(element).some(hasVisibleOverflow))
    }

    let frameId = window.requestAnimationFrame(checkTruncation)

    if (typeof ResizeObserver === 'undefined') {
      checkTruncation()

      return () => window.cancelAnimationFrame(frameId)
    }

    const scheduleCheck = () => {
      window.cancelAnimationFrame(frameId)
      frameId = window.requestAnimationFrame(checkTruncation)
    }

    const resizeObserver = new ResizeObserver(scheduleCheck)

    resizeObserver.observe(element)
    getTruncatedTextCandidates(element).forEach(candidate => resizeObserver.observe(candidate))

    return () => {
      window.cancelAnimationFrame(frameId)
      resizeObserver.disconnect()
    }
  }, [tooltipTitle])

  return { elementRef, isTruncated }
}

function Table({ className, mobileCards = false, ...props }: TableProps) {
  return (
    <div
      data-slot='table-container'
      className={cn('relative w-full max-w-full overflow-x-auto', mobileCards && 'max-sm:overflow-visible')}
    >
      <table
        data-slot='table'
        data-mobile-cards={mobileCards ? 'true' : undefined}
        className={cn('w-full caption-bottom text-sm', mobileCards ? 'sm:min-w-max' : 'min-w-max', className)}
        {...props}
      />
    </div>
  )
}

function TableHeader({ className, ...props }: React.ComponentProps<'thead'>) {
  return <thead data-slot='table-header' className={cn('[&_tr]:border-b', className)} {...props} />
}

function TableBody({ className, ...props }: React.ComponentProps<'tbody'>) {
  return <tbody data-slot='table-body' className={cn('[&_tr:last-child]:border-0', className)} {...props} />
}

function TableFooter({ className, ...props }: React.ComponentProps<'tfoot'>) {
  return (
    <tfoot
      data-slot='table-footer'
      className={cn('bg-muted/50 border-t font-medium [&>tr]:last:border-b-0', className)}
      {...props}
    />
  )
}

function TableRow({ className, ...props }: React.ComponentProps<'tr'>) {
  return (
    <tr
      data-slot='table-row'
      className={cn(
        'hover:bg-muted/50 has-aria-expanded:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors',
        className
      )}
      {...props}
    />
  )
}

function TableHead({ className, title, children, 'aria-label': ariaLabel, ...props }: React.ComponentProps<'th'>) {
  const tooltipTitle = getTooltipTitle(title)
  const { elementRef, isTruncated } = useTruncatedTooltip<HTMLTableCellElement>(tooltipTitle)

  const tableHead = (
    <th
      ref={elementRef}
      data-slot='table-head'
      scope='col'
      className={cn(
        'text-foreground h-10 px-2 text-left align-middle font-medium whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]',
        className
      )}
      aria-label={ariaLabel ?? tooltipTitle}
      {...props}
    >
      {children}
    </th>
  )

  if (!tooltipTitle) return tableHead

  return (
    <Tooltip>
      <TooltipTrigger asChild>{tableHead}</TooltipTrigger>
      {isTruncated ? (
        <TooltipContent side='top' sideOffset={4}>
          {tooltipTitle}
        </TooltipContent>
      ) : null}
    </Tooltip>
  )
}

function TableCell({ className, title, children, 'aria-label': ariaLabel, ...props }: React.ComponentProps<'td'>) {
  const tooltipTitle = getTooltipTitle(title)
  const { elementRef, isTruncated } = useTruncatedTooltip<HTMLTableCellElement>(tooltipTitle)

  const tableCell = (
    <td
      ref={elementRef}
      data-slot='table-cell'
      className={cn(
        'p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]',
        className
      )}
      aria-label={ariaLabel ?? tooltipTitle}
      {...props}
    >
      {children}
    </td>
  )

  if (!tooltipTitle) return tableCell

  return (
    <Tooltip>
      <TooltipTrigger asChild>{tableCell}</TooltipTrigger>
      {isTruncated ? (
        <TooltipContent side='top' sideOffset={4}>
          {tooltipTitle}
        </TooltipContent>
      ) : null}
    </Tooltip>
  )
}

function TableCaption({ className, ...props }: React.ComponentProps<'caption'>) {
  return (
    <caption data-slot='table-caption' className={cn('text-muted-foreground mt-4 text-sm', className)} {...props} />
  )
}

export { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption }
