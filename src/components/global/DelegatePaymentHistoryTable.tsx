'use client'

import type { ReactNode } from 'react'
import { useMemo, useState } from 'react'

import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  CalendarDays,
  ChevronLeftIcon,
  ChevronRightIcon,
  SearchIcon
} from 'lucide-react'

import PrintButton from '@/components/global/PrintButton'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem } from '@/components/ui/pagination'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { usePagination } from '@/hooks/use-pagination'
import { cn } from '@/lib/utils'

const currencyFormatter = new Intl.NumberFormat('en-US', {
  currency: 'USD',
  style: 'currency'
})

export type DelegatePaymentHistoryRow = {
  amountSentOrAdjusted: number
  amountVerified: number
  balance: number
  entryCount: number
  id: string
  month: string
  monthLabel: string
  paymentType: string
  paymentTypeKey: string
}

export type DelegatePaymentHistoryTotals = {
  amountSentOrAdjusted: number
  amountVerified: number
  balance: number
  monthCount: number
  transactionCount: number
}

type SortKey = keyof DelegatePaymentHistoryRow
type SortDirection = 'asc' | 'desc'
type PaymentTypeFilter = 'all' | 'contribution' | 'registration'

type DelegatePaymentHistoryColumn = {
  align?: 'left' | 'right'
  key: SortKey
  label: string
}

const columns: DelegatePaymentHistoryColumn[] = [
  { key: 'month', label: 'Month' },
  { key: 'paymentType', label: 'Payment Type' },
  { align: 'right', key: 'amountSentOrAdjusted', label: 'Amount Sent / Adjustments' },
  { align: 'right', key: 'amountVerified', label: 'Amount Verified' },
  { align: 'right', key: 'balance', label: 'Balance' }
]

const columnWidths: Partial<Record<SortKey, number>> = {
  amountSentOrAdjusted: 24,
  amountVerified: 20,
  balance: 20,
  month: 20,
  paymentType: 16
}

const pageSizeOptions = [10, 25, 50, 100]

const paymentTypeFilterLabels: Record<PaymentTypeFilter, string> = {
  all: 'All payment types',
  contribution: 'Contribution',
  registration: 'Registration'
}

const getColumnStyle = (columnKey: SortKey) => ({ width: `${columnWidths[columnKey] ?? 10}%` })

const roundCurrencyAmount = (amount: number) => Number(amount.toFixed(2))

const getSortIcon = (isActive: boolean, direction: SortDirection) => {
  if (!isActive) return <ArrowUpDown className='size-3.5' aria-hidden='true' />

  return direction === 'asc' ? (
    <ArrowUp className='size-3.5' aria-hidden='true' />
  ) : (
    <ArrowDown className='size-3.5' aria-hidden='true' />
  )
}

const compareValues = (
  firstValue: DelegatePaymentHistoryRow[SortKey],
  secondValue: DelegatePaymentHistoryRow[SortKey]
) => {
  if (typeof firstValue === 'number' && typeof secondValue === 'number') return firstValue - secondValue

  return String(firstValue ?? '').localeCompare(String(secondValue ?? ''), undefined, {
    numeric: true,
    sensitivity: 'base'
  })
}

const getHistoryTotals = (rows: DelegatePaymentHistoryRow[]): DelegatePaymentHistoryTotals => {
  const amountSentOrAdjusted = roundCurrencyAmount(rows.reduce((total, row) => total + row.amountSentOrAdjusted, 0))
  const amountVerified = roundCurrencyAmount(rows.reduce((total, row) => total + row.amountVerified, 0))
  const months = new Set(rows.map(row => row.month))

  return {
    amountSentOrAdjusted,
    amountVerified,
    balance: roundCurrencyAmount(amountSentOrAdjusted - amountVerified),
    monthCount: months.size,
    transactionCount: rows.reduce((total, row) => total + row.entryCount, 0)
  }
}

const getRowSearchText = (row: DelegatePaymentHistoryRow) => [row.monthLabel, row.paymentType].join(' ').toLowerCase()

const getPaymentBadgeClassName = (paymentType: string) =>
  ({
    contribution: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
    registration: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-700 dark:text-cyan-300'
  })[paymentType] ?? 'border-border bg-muted text-foreground'

const getAmountClassName = (amount: number) =>
  cn(
    'font-extrabold tabular-nums',
    amount < 0 && 'text-red-700 dark:text-red-300',
    amount > 0 && 'text-green-700 dark:text-green-300',
    amount === 0 && 'text-muted-foreground'
  )

const getVerifiedAmountClassName = (amount: number) =>
  cn(
    'font-extrabold tabular-nums',
    amount > 0 && 'text-blue-700 dark:text-blue-300',
    amount === 0 && 'text-muted-foreground'
  )

const getBalanceClassName = (balance: number) =>
  cn(
    'font-extrabold tabular-nums',
    balance < 0 && 'text-red-700 dark:text-red-300',
    balance > 0 && 'text-green-700 dark:text-green-300',
    balance === 0 && 'text-foreground'
  )

const SummaryStat = ({ label, value }: { label: string; value: number | string }) => (
  <Card className='rounded-md'>
    <CardContent className='p-4'>
      <div className='text-muted-foreground text-xs font-semibold uppercase'>{label}</div>
      <div className='mt-2 text-2xl font-extrabold tracking-normal break-words tabular-nums'>{value}</div>
    </CardContent>
  </Card>
)

const MobileValue = ({
  label,
  value,
  valueClassName
}: {
  label: string
  value: ReactNode
  valueClassName?: string
}) => (
  <div className='grid grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] items-start gap-2'>
    <span className='text-muted-foreground min-w-0 text-xs leading-snug font-semibold uppercase'>{label}</span>
    <span
      className={cn(
        'min-w-0 justify-self-end text-right text-sm leading-snug font-extrabold break-words tabular-nums',
        valueClassName
      )}
    >
      {value}
    </span>
  </div>
)

const DelegatePaymentHistoryTable = ({
  rows,
  totals
}: {
  rows: DelegatePaymentHistoryRow[]
  totals: DelegatePaymentHistoryTotals
}) => {
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)
  const [paymentTypeFilter, setPaymentTypeFilter] = useState<PaymentTypeFilter>('all')
  const [search, setSearch] = useState('')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  const [sortKey, setSortKey] = useState<SortKey>('month')

  const normalizedSearch = search.trim().toLowerCase()

  const filteredRows = useMemo(() => {
    return rows.filter(row => {
      const matchesSearch = normalizedSearch ? getRowSearchText(row).includes(normalizedSearch) : true
      const matchesPaymentType = paymentTypeFilter === 'all' || row.paymentTypeKey === paymentTypeFilter

      return matchesSearch && matchesPaymentType
    })
  }, [normalizedSearch, paymentTypeFilter, rows])

  const sortedRows = useMemo(() => {
    return [...filteredRows].sort((firstRow, secondRow) => {
      const comparison = compareValues(firstRow[sortKey], secondRow[sortKey])

      return sortDirection === 'asc' ? comparison : -comparison
    })
  }, [filteredRows, sortDirection, sortKey])

  const visibleTotals = useMemo(() => {
    if (!normalizedSearch && paymentTypeFilter === 'all') return totals

    return getHistoryTotals(filteredRows)
  }, [filteredRows, normalizedSearch, paymentTypeFilter, totals])

  const totalPages = Math.max(1, Math.ceil(sortedRows.length / pageSize))
  const effectiveCurrentPage = Math.min(currentPage, totalPages)
  const pageStartIndex = (effectiveCurrentPage - 1) * pageSize
  const pageEndIndex = Math.min(pageStartIndex + pageSize, sortedRows.length)
  const paginatedRows = sortedRows.slice(pageStartIndex, pageEndIndex)
  const showingStart = sortedRows.length > 0 ? pageStartIndex + 1 : 0

  const { pages, showLeftEllipsis, showRightEllipsis } = usePagination({
    currentPage: effectiveCurrentPage,
    paginationItemsToDisplay: 3,
    totalPages
  })

  const handleSort = (nextSortKey: SortKey) => {
    if (nextSortKey === sortKey) {
      setSortDirection(currentDirection => (currentDirection === 'asc' ? 'desc' : 'asc'))
      setCurrentPage(1)

      return
    }

    setSortKey(nextSortKey)
    setSortDirection(nextSortKey === 'month' ? 'asc' : 'desc')
    setCurrentPage(1)
  }

  const handleSearchChange = (nextSearch: string) => {
    setSearch(nextSearch)
    setCurrentPage(1)
  }

  const handlePaymentTypeFilterChange = (nextPaymentType: string) => {
    setPaymentTypeFilter(nextPaymentType as PaymentTypeFilter)
    setCurrentPage(1)
  }

  const handlePageSizeChange = (nextPageSize: string) => {
    setPageSize(Number(nextPageSize))
    setCurrentPage(1)
  }

  const handlePageChange = (nextPage: number) => {
    setCurrentPage(Math.min(Math.max(nextPage, 1), totalPages))
  }

  return (
    <div className='max-w-full min-w-0 space-y-4'>
      <div className='grid gap-3 sm:grid-cols-2 xl:grid-cols-5'>
        <SummaryStat label='Months' value={visibleTotals.monthCount.toLocaleString('en-US')} />
        <SummaryStat label='Transactions' value={visibleTotals.transactionCount.toLocaleString('en-US')} />
        <SummaryStat label='Sent / Adjustments' value={currencyFormatter.format(visibleTotals.amountSentOrAdjusted)} />
        <SummaryStat label='Verified' value={currencyFormatter.format(visibleTotals.amountVerified)} />
        <SummaryStat label='Balance' value={currencyFormatter.format(visibleTotals.balance)} />
      </div>

      <div className='flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between'>
        <form role='search' onSubmit={event => event.preventDefault()} className='min-w-0 flex-1'>
          <label htmlFor='delegate-payment-history-search' className='sr-only'>
            Search transaction history
          </label>
          <div className='relative'>
            <SearchIcon className='text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2' />
            <Input
              id='delegate-payment-history-search'
              value={search}
              onChange={event => handleSearchChange(event.target.value)}
              placeholder='Search month or payment type'
              className='bg-background h-10 w-full pl-9 text-sm font-semibold'
            />
          </div>
        </form>

        <div className='grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto] xl:w-auto xl:min-w-[22rem]'>
          <Select value={paymentTypeFilter} onValueChange={handlePaymentTypeFilterChange}>
            <SelectTrigger className='bg-background h-10 w-full'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(paymentTypeFilterLabels) as PaymentTypeFilter[]).map(option => (
                <SelectItem key={option} value={option}>
                  {paymentTypeFilterLabels[option]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <PrintButton label='Print PDF' size='sm' className='h-10 whitespace-nowrap' />
        </div>
      </div>

      <div className='border-border max-w-full min-w-0 overflow-hidden rounded-lg border'>
        <div className='hidden overflow-x-auto xl:block'>
          <Table className='table-fixed [&_td]:whitespace-nowrap [&_th]:whitespace-normal'>
            <colgroup>
              {columns.map(column => (
                <col key={column.key} style={getColumnStyle(column.key)} />
              ))}
            </colgroup>
            <TableHeader>
              <TableRow className='bg-primary hover:bg-primary h-16'>
                {columns.map(column => {
                  const isActive = sortKey === column.key

                  return (
                    <TableHead
                      key={column.key}
                      title={column.label}
                      className='text-primary-foreground h-16'
                      style={getColumnStyle(column.key)}
                      aria-sort={isActive ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
                    >
                      <button
                        type='button'
                        className={cn(
                          'flex min-h-12 w-full items-center gap-1.5 font-semibold',
                          column.align === 'right'
                            ? 'justify-end text-right [&>span]:text-right'
                            : 'justify-start text-left'
                        )}
                        onClick={() => handleSort(column.key)}
                      >
                        <span>{column.label}</span>
                        {getSortIcon(isActive, sortDirection)}
                      </button>
                    </TableHead>
                  )
                })}
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className='text-muted-foreground h-24 text-center'>
                    {rows.length === 0
                      ? 'No transaction history has been recorded yet.'
                      : 'No transaction history matches the current filters.'}
                  </TableCell>
                </TableRow>
              ) : (
                paginatedRows.map(row => (
                  <TableRow key={row.id} className='odd:bg-muted/30 even:bg-background'>
                    <TableCell
                      title={row.monthLabel}
                      className='truncate text-sm font-extrabold'
                      style={getColumnStyle('month')}
                    >
                      {row.monthLabel}
                    </TableCell>
                    <TableCell
                      title={row.paymentType}
                      className='truncate text-sm font-semibold'
                      style={getColumnStyle('paymentType')}
                    >
                      <Badge
                        variant='outline'
                        className={cn(
                          'w-full max-w-full justify-start truncate rounded-md capitalize',
                          getPaymentBadgeClassName(row.paymentTypeKey)
                        )}
                      >
                        {row.paymentType}
                      </Badge>
                    </TableCell>
                    <TableCell className='text-right' style={getColumnStyle('amountSentOrAdjusted')}>
                      <span className={getAmountClassName(row.amountSentOrAdjusted)}>
                        {currencyFormatter.format(row.amountSentOrAdjusted)}
                      </span>
                    </TableCell>
                    <TableCell className='text-right' style={getColumnStyle('amountVerified')}>
                      <span className={getVerifiedAmountClassName(row.amountVerified)}>
                        {currencyFormatter.format(row.amountVerified)}
                      </span>
                    </TableCell>
                    <TableCell className='text-right' style={getColumnStyle('balance')}>
                      <span className={getBalanceClassName(row.balance)}>{currencyFormatter.format(row.balance)}</span>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
            {sortedRows.length > 0 ? (
              <TableFooter className='bg-white text-black dark:bg-white dark:text-black'>
                <TableRow className='bg-white text-base text-black hover:bg-white dark:bg-white dark:text-black dark:hover:bg-white'>
                  <TableCell className='font-extrabold' style={getColumnStyle('month')}>
                    Total
                  </TableCell>
                  <TableCell className='font-semibold' style={getColumnStyle('paymentType')}>
                    {visibleTotals.transactionCount} transaction(s)
                  </TableCell>
                  <TableCell
                    className='text-right font-extrabold tabular-nums'
                    style={getColumnStyle('amountSentOrAdjusted')}
                  >
                    {currencyFormatter.format(visibleTotals.amountSentOrAdjusted)}
                  </TableCell>
                  <TableCell
                    className='text-right font-extrabold tabular-nums'
                    style={getColumnStyle('amountVerified')}
                  >
                    {currencyFormatter.format(visibleTotals.amountVerified)}
                  </TableCell>
                  <TableCell className='text-right font-extrabold tabular-nums' style={getColumnStyle('balance')}>
                    {currencyFormatter.format(visibleTotals.balance)}
                  </TableCell>
                </TableRow>
              </TableFooter>
            ) : null}
          </Table>
        </div>

        <div className='grid gap-3 p-2 sm:p-3 xl:hidden'>
          {sortedRows.length === 0 ? (
            <div className='text-muted-foreground rounded-md border px-3 py-8 text-center text-sm sm:px-4 sm:py-10'>
              {rows.length === 0
                ? 'No transaction history has been recorded yet.'
                : 'No transaction history matches the current filters.'}
            </div>
          ) : (
            paginatedRows.map(row => (
              <article key={row.id} className='bg-background overflow-hidden rounded-md border shadow-sm'>
                <div className='flex flex-col gap-2 border-b px-3 py-3 sm:flex-row sm:items-start sm:justify-between sm:px-4'>
                  <div className='min-w-0'>
                    <div className='flex min-w-0 items-center gap-2'>
                      <CalendarDays className='text-primary size-4 shrink-0' aria-hidden='true' />
                      <div className='truncate text-lg font-extrabold'>{row.monthLabel}</div>
                    </div>
                    <Badge
                      variant='outline'
                      className={cn('mt-2 w-fit rounded-md capitalize', getPaymentBadgeClassName(row.paymentTypeKey))}
                    >
                      {row.paymentType}
                    </Badge>
                  </div>
                  <div className='text-muted-foreground text-xs font-semibold'>
                    {row.entryCount} transaction{row.entryCount === 1 ? '' : 's'}
                  </div>
                </div>
                <div className='grid gap-2 px-3 py-3 text-sm sm:px-4'>
                  <MobileValue
                    label='Sent / Adjustments'
                    value={currencyFormatter.format(row.amountSentOrAdjusted)}
                    valueClassName={getAmountClassName(row.amountSentOrAdjusted)}
                  />
                  <MobileValue
                    label='Verified'
                    value={currencyFormatter.format(row.amountVerified)}
                    valueClassName={getVerifiedAmountClassName(row.amountVerified)}
                  />
                  <MobileValue
                    label='Balance'
                    value={currencyFormatter.format(row.balance)}
                    valueClassName={getBalanceClassName(row.balance)}
                  />
                </div>
              </article>
            ))
          )}
        </div>

        {sortedRows.length > 0 ? (
          <div className='bg-background flex flex-col gap-3 border-t px-3 py-3 lg:flex-row lg:items-center lg:justify-between'>
            <p className='text-muted-foreground text-sm font-semibold'>
              Showing {showingStart}-{pageEndIndex} of {sortedRows.length} month(s)
            </p>
            <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end'>
              <div className='flex items-center gap-2'>
                <span className='text-muted-foreground text-sm font-semibold whitespace-nowrap'>Rows per page</span>
                <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
                  <SelectTrigger className='bg-background h-9 w-24'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {pageSizeOptions.map(option => (
                      <SelectItem key={option} value={option.toString()}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Pagination className='mx-0 w-auto justify-start sm:justify-end'>
                <PaginationContent className='w-max flex-nowrap'>
                  <PaginationItem>
                    <Button
                      type='button'
                      variant='ghost'
                      onClick={() => handlePageChange(effectiveCurrentPage - 1)}
                      disabled={effectiveCurrentPage === 1}
                      className='disabled:pointer-events-none disabled:opacity-50'
                      aria-label='Go to previous page'
                    >
                      <ChevronLeftIcon className='size-4' />
                      <span className='hidden sm:inline'>Previous</span>
                    </Button>
                  </PaginationItem>

                  {showLeftEllipsis ? (
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                  ) : null}

                  {pages.map(page => {
                    const isActive = page === effectiveCurrentPage

                    return (
                      <PaginationItem key={page}>
                        <Button
                          type='button'
                          size='icon'
                          variant={isActive ? 'default' : 'outline'}
                          onClick={() => handlePageChange(page)}
                          aria-current={isActive ? 'page' : undefined}
                          aria-label={`Go to page ${page}`}
                        >
                          {page}
                        </Button>
                      </PaginationItem>
                    )
                  })}

                  {showRightEllipsis ? (
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                  ) : null}

                  <PaginationItem>
                    <Button
                      type='button'
                      variant='ghost'
                      onClick={() => handlePageChange(effectiveCurrentPage + 1)}
                      disabled={effectiveCurrentPage === totalPages}
                      className='disabled:pointer-events-none disabled:opacity-50'
                      aria-label='Go to next page'
                    >
                      <span className='hidden sm:inline'>Next</span>
                      <ChevronRightIcon className='size-4' />
                    </Button>
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}

export default DelegatePaymentHistoryTable
