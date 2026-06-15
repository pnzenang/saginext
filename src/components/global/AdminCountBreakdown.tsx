'use client'

import { useMemo, useState } from 'react'

import { ArrowUpDown, ChevronDown, ChevronUp } from 'lucide-react'

import AdminCountExcelButton from '@/components/global/AdminCountExcelButton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { cn } from '@/lib/utils'

export type AdminCountRow = {
  associationCode: string
  associationName: string
  vested: number
  pending: number
  awaitingPublication: number
  notInGoodStanding: number
  total: number
}

export type AdminCountTotals = {
  vested: number
  pending: number
  awaitingPublication: number
  notInGoodStanding: number
  total: number
}

type AdminCountBreakdownProps = {
  counts: AdminCountRow[]
  totals: AdminCountTotals
}

type SortKey = keyof AdminCountRow
type SortDirection = 'asc' | 'desc'

type SortState = {
  key: SortKey
  direction: SortDirection
}

const numberFormatter = new Intl.NumberFormat('en-US')
const formatNumber = (value: number) => numberFormatter.format(value)

const sortableColumns: Array<{
  key: SortKey
  label: string
  tableLabel?: string
  align?: 'left' | 'right'
}> = [
  { key: 'associationName', label: 'Association Name', tableLabel: 'Association' },
  { key: 'associationCode', label: 'Association Code', tableLabel: 'Code' },
  { key: 'vested', label: 'Vested', align: 'right' },
  { key: 'awaitingPublication', label: 'Awaiting', align: 'right' },
  { key: 'pending', label: 'Pending', align: 'right' },
  { key: 'notInGoodStanding', label: 'Delinquent', align: 'right' },
  { key: 'total', label: 'Total', align: 'right' }
]

const compareValues = (left: AdminCountRow, right: AdminCountRow, key: SortKey) => {
  const leftValue = left[key]
  const rightValue = right[key]

  if (typeof leftValue === 'number' && typeof rightValue === 'number') {
    return leftValue - rightValue
  }

  return String(leftValue).localeCompare(String(rightValue), undefined, {
    numeric: true,
    sensitivity: 'base'
  })
}

const getNextDirection = (sort: SortState, key: SortKey): SortDirection => {
  if (sort.key !== key) return 'asc'

  return sort.direction === 'asc' ? 'desc' : 'asc'
}

const SortIcon = ({ active, direction }: { active: boolean; direction: SortDirection }) => {
  if (!active) return <ArrowUpDown className='size-3.5 opacity-70 print:hidden' aria-hidden='true' />

  if (direction === 'asc') return <ChevronUp className='size-3.5 opacity-80 print:hidden' aria-hidden='true' />

  return <ChevronDown className='size-3.5 opacity-80 print:hidden' aria-hidden='true' />
}

const AdminCountBreakdown = ({ counts, totals }: AdminCountBreakdownProps) => {
  const [sort, setSort] = useState<SortState>({ key: 'associationCode', direction: 'asc' })

  const sortedCounts = useMemo(() => {
    const directionMultiplier = sort.direction === 'asc' ? 1 : -1

    return [...counts].sort((left, right) => {
      const primarySort = compareValues(left, right, sort.key) * directionMultiplier

      if (primarySort !== 0) return primarySort

      const nameSort = compareValues(left, right, 'associationName')

      if (nameSort !== 0) return nameSort

      return compareValues(left, right, 'associationCode')
    })
  }, [counts, sort])

  const handleSort = (key: SortKey) => {
    setSort(currentSort => ({
      key,
      direction: getNextDirection(currentSort, key)
    }))
  }

  return (
    <>
      <div className='mb-6 flex justify-end'>
        <AdminCountExcelButton counts={sortedCounts} totals={totals} />
      </div>

      <Card className='print:border-0 print:shadow-none'>
        <CardHeader>
          <CardTitle>Association Breakdown</CardTitle>
        </CardHeader>
        <CardContent className='px-2 sm:px-6'>
          <div className='lg:hidden print:hidden'>
            {sortedCounts.length > 0 ? (
              <div className='divide-border overflow-hidden rounded-md border'>
                {sortedCounts.map(item => (
                  <div key={item.associationCode} className='odd:bg-muted/35 even:bg-background space-y-4 p-5'>
                    <div className='min-w-0'>
                      <p className='line-clamp-2 text-sm font-semibold' title={item.associationName}>
                        {item.associationName}
                      </p>
                      <p className='text-muted-foreground text-xs'>{item.associationCode}</p>
                    </div>
                    <div className='grid grid-cols-2 gap-2 text-sm sm:grid-cols-5'>
                      <div>
                        <p className='text-muted-foreground text-xs'>Vested</p>
                        <p className='font-bold text-green-600 dark:text-green-400'>{formatNumber(item.vested)}</p>
                      </div>
                      <div>
                        <p className='text-muted-foreground text-xs'>Awaiting</p>
                        <p className='font-semibold text-blue-600 dark:text-blue-400'>
                          {formatNumber(item.awaitingPublication)}
                        </p>
                      </div>
                      <div>
                        <p className='text-muted-foreground text-xs'>Pending</p>
                        <p className='font-semibold text-amber-600 dark:text-amber-400'>{formatNumber(item.pending)}</p>
                      </div>
                      <div>
                        <p className='text-muted-foreground text-xs'>Delinquent</p>
                        <p className='text-destructive font-semibold'>{formatNumber(item.notInGoodStanding)}</p>
                      </div>
                      <div>
                        <p className='text-muted-foreground text-xs'>Total</p>
                        <p className='text-primary text-base font-black sm:text-lg'>{formatNumber(item.total)}</p>
                      </div>
                    </div>
                  </div>
                ))}
                <div className='bg-muted p-5 text-base font-black'>
                  <div className='mb-3 flex items-center justify-between gap-3'>
                    <span>Total</span>
                    <span className='text-primary text-lg'>{formatNumber(totals.total)}</span>
                  </div>
                  <div className='grid grid-cols-2 gap-2 text-sm'>
                    <span className='font-bold text-green-600 dark:text-green-400'>
                      Vested: {formatNumber(totals.vested)}
                    </span>
                    <span className='text-blue-600 dark:text-blue-400'>
                      Awaiting: {formatNumber(totals.awaitingPublication)}
                    </span>
                    <span className='text-amber-600 dark:text-amber-400'>Pending: {formatNumber(totals.pending)}</span>
                    <span className='text-destructive'>Delinquent: {formatNumber(totals.notInGoodStanding)}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className='text-muted-foreground rounded-md border p-4 text-center sm:p-8'>
                No member counts found.
              </div>
            )}
          </div>

          <div className='hidden lg:block print:block'>
            <Table className='min-w-0 table-fixed text-xs lg:text-sm'>
              <colgroup>
                <col className='w-[30%]' />
                <col className='w-[13%]' />
                <col className='w-[10.5%]' />
                <col className='w-[10.5%]' />
                <col className='w-[10.5%]' />
                <col className='w-[10.5%]' />
                <col className='w-[15%]' />
              </colgroup>
              <TableHeader>
                <TableRow className='bg-primary hover:bg-primary'>
                  {sortableColumns.map(column => {
                    const isActive = sort.key === column.key

                    return (
                      <TableHead
                        key={column.key}
                        aria-sort={isActive ? (sort.direction === 'asc' ? 'ascending' : 'descending') : 'none'}
                        className={cn(
                          'text-primary-foreground px-1 lg:px-2',
                          column.align === 'right' && 'text-right',
                          column.key === 'associationName' && 'pl-2 lg:pl-4',
                          column.key === 'total' && 'text-base font-extrabold'
                        )}
                      >
                        <button
                          type='button'
                          onClick={() => handleSort(column.key)}
                          title={`Sort by ${column.label}`}
                          className={cn(
                            'focus-visible:ring-primary-foreground/70 inline-flex w-full min-w-0 items-center gap-1 rounded-sm py-2 text-left font-medium transition-opacity outline-none hover:opacity-80 focus-visible:ring-2 lg:gap-1.5',
                            column.align === 'right' ? 'justify-end' : 'justify-start'
                          )}
                        >
                          <span className='min-w-0 truncate'>{column.tableLabel ?? column.label}</span>
                          <SortIcon active={isActive} direction={sort.direction} />
                        </button>
                      </TableHead>
                    )
                  })}
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedCounts.length > 0 ? (
                  sortedCounts.map(item => (
                    <TableRow key={item.associationCode} className='odd:bg-muted/35 even:bg-background h-16'>
                      <TableCell className='truncate px-1 py-4 font-medium lg:px-2' title={item.associationName}>
                        {item.associationName}
                      </TableCell>
                      <TableCell className='px-1 py-4 lg:px-2'>{item.associationCode}</TableCell>
                      <TableCell className='px-1 py-4 text-right font-bold text-green-600 lg:px-2 dark:text-green-400'>
                        {formatNumber(item.vested)}
                      </TableCell>
                      <TableCell className='px-1 py-4 text-right text-blue-600 lg:px-2 dark:text-blue-400'>
                        {formatNumber(item.awaitingPublication)}
                      </TableCell>
                      <TableCell className='px-1 py-4 text-right text-amber-600 lg:px-2 dark:text-amber-400'>
                        {formatNumber(item.pending)}
                      </TableCell>
                      <TableCell className='text-destructive px-1 py-4 text-right lg:px-2'>
                        {formatNumber(item.notInGoodStanding)}
                      </TableCell>
                      <TableCell className='bg-primary/10 text-primary px-2 py-4 text-right text-base font-black lg:px-3 lg:text-lg'>
                        {formatNumber(item.total)}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className='text-muted-foreground h-24 text-center'>
                      No member counts found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
              {sortedCounts.length > 0 && (
                <TableFooter>
                  <TableRow className='bg-primary/10 h-20 text-base font-black lg:text-lg'>
                    <TableCell colSpan={2} className='py-5'>
                      Total
                    </TableCell>
                    <TableCell className='px-1 py-5 text-right font-black text-green-600 lg:px-2 dark:text-green-400'>
                      {formatNumber(totals.vested)}
                    </TableCell>
                    <TableCell className='px-1 py-5 text-right font-black text-blue-600 lg:px-2 dark:text-blue-400'>
                      {formatNumber(totals.awaitingPublication)}
                    </TableCell>
                    <TableCell className='px-1 py-5 text-right font-black text-amber-600 lg:px-2 dark:text-amber-400'>
                      {formatNumber(totals.pending)}
                    </TableCell>
                    <TableCell className='text-destructive px-1 py-5 text-right font-black lg:px-2'>
                      {formatNumber(totals.notInGoodStanding)}
                    </TableCell>
                    <TableCell className='text-primary px-2 py-5 text-right text-lg font-black lg:px-3 lg:text-xl'>
                      {formatNumber(totals.total)}
                    </TableCell>
                  </TableRow>
                </TableFooter>
              )}
            </Table>
          </div>
        </CardContent>
      </Card>
    </>
  )
}

export default AdminCountBreakdown
