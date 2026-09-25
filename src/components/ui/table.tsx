'use client'

import * as React from 'react'

import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { getExplicitTooltipText, useOverflowTooltip } from '@/hooks/use-overflow-tooltip'
import { cn } from '@/lib/utils'

type TableProps = React.ComponentProps<'table'> & {
  mobileCards?: boolean
}

type TableHeadProps = React.ComponentProps<'th'> & {
  showTitleTooltip?: boolean
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

function TableHead({
  className,
  title,
  children,
  'aria-label': ariaLabel,
  showTitleTooltip = false,
  ...props
}: TableHeadProps) {
  const explicitTooltipText = getExplicitTooltipText(title)
  const { elementRef, isOverflowing, tooltipText } = useOverflowTooltip<HTMLTableCellElement>(explicitTooltipText)
  const tooltipContent = showTitleTooltip ? explicitTooltipText : tooltipText

  const tableHead = (
    <th
      ref={elementRef}
      data-slot='table-head'
      data-overflow-tooltip-owner='true'
      scope='col'
      className={cn(
        'text-foreground h-10 px-2 text-left align-middle font-medium whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]',
        className
      )}
      aria-label={ariaLabel ?? explicitTooltipText}
      {...props}
    >
      {children}
    </th>
  )

  if (!tooltipContent) return tableHead

  return (
    <Tooltip>
      <TooltipTrigger asChild>{tableHead}</TooltipTrigger>
      {showTitleTooltip || isOverflowing ? (
        <TooltipContent side='top' sideOffset={4}>
          {tooltipContent}
        </TooltipContent>
      ) : null}
    </Tooltip>
  )
}

function TableCell({ className, title, children, 'aria-label': ariaLabel, ...props }: React.ComponentProps<'td'>) {
  const explicitTooltipText = getExplicitTooltipText(title)
  const { elementRef, isOverflowing, tooltipText } = useOverflowTooltip<HTMLTableCellElement>(explicitTooltipText)

  const tableCell = (
    <td
      ref={elementRef}
      data-slot='table-cell'
      data-overflow-tooltip-owner='true'
      className={cn(
        'p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]',
        className
      )}
      aria-label={ariaLabel ?? explicitTooltipText}
      {...props}
    >
      {children}
    </td>
  )

  if (!tooltipText) return tableCell

  return (
    <Tooltip>
      <TooltipTrigger asChild>{tableCell}</TooltipTrigger>
      {isOverflowing ? (
        <TooltipContent side='top' sideOffset={4}>
          {tooltipText}
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
