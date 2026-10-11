'use client'

import type { ReactNode } from 'react'
import { useMemo, useState } from 'react'

import { CalendarDays, ChevronLeftIcon, ChevronRightIcon, SearchIcon } from 'lucide-react'

import PrintButton from '@/components/global/PrintButton'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem } from '@/components/ui/pagination'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
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

type PaymentTypeFilter = 'all' | 'contribution' | 'registration'

type DelegatePaymentMonthGroup = {
  amountSentOrAdjusted: number
  amountVerified: number
  balance: number
  entryCount: number
  id: string
  month: string
  monthLabel: string
  rows: DelegatePaymentHistoryRow[]
}

const pageSizeOptions = [10, 25, 50, 100]

const paymentTypeFilterLabels: Record<PaymentTypeFilter, string> = {
  all: 'All payment types',
  contribution: 'Contribution',
  registration: 'Registration'
}

const roundCurrencyAmount = (amount: number) => Number(amount.toFixed(2))

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

const getMonthGroups = (rows: DelegatePaymentHistoryRow[]): DelegatePaymentMonthGroup[] => {
  const groupsByMonth = rows.reduce((groups, row) => {
    const group = groups.get(row.month) ?? {
      amountSentOrAdjusted: 0,
      amountVerified: 0,
      balance: 0,
      entryCount: 0,
      id: row.month,
      month: row.month,
      monthLabel: row.monthLabel,
      rows: []
    }

    group.rows.push(row)
    group.amountSentOrAdjusted = roundCurrencyAmount(group.amountSentOrAdjusted + row.amountSentOrAdjusted)
    group.amountVerified = roundCurrencyAmount(group.amountVerified + row.amountVerified)
    group.balance = roundCurrencyAmount(group.amountSentOrAdjusted - group.amountVerified)
    group.entryCount += row.entryCount
    groups.set(row.month, group)

    return groups
  }, new Map<string, DelegatePaymentMonthGroup>())

  return Array.from(groupsByMonth.values())
    .map(group => ({
      ...group,
      rows: [...group.rows].sort((firstRow, secondRow) =>
        firstRow.paymentType.localeCompare(secondRow.paymentType, undefined, {
          numeric: true,
          sensitivity: 'base'
        })
      )
    }))
    .sort((firstGroup, secondGroup) => secondGroup.month.localeCompare(firstGroup.month))
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

  const normalizedSearch = search.trim().toLowerCase()

  const filteredRows = useMemo(() => {
    return rows.filter(row => {
      const matchesSearch = normalizedSearch ? getRowSearchText(row).includes(normalizedSearch) : true
      const matchesPaymentType = paymentTypeFilter === 'all' || row.paymentTypeKey === paymentTypeFilter

      return matchesSearch && matchesPaymentType
    })
  }, [normalizedSearch, paymentTypeFilter, rows])

  const monthGroups = useMemo(() => getMonthGroups(filteredRows), [filteredRows])

  const visibleTotals = useMemo(() => {
    if (!normalizedSearch && paymentTypeFilter === 'all') return totals

    return getHistoryTotals(filteredRows)
  }, [filteredRows, normalizedSearch, paymentTypeFilter, totals])

  const totalPages = Math.max(1, Math.ceil(monthGroups.length / pageSize))
  const effectiveCurrentPage = Math.min(currentPage, totalPages)
  const pageStartIndex = (effectiveCurrentPage - 1) * pageSize
  const pageEndIndex = Math.min(pageStartIndex + pageSize, monthGroups.length)
  const paginatedMonthGroups = monthGroups.slice(pageStartIndex, pageEndIndex)
  const showingStart = monthGroups.length > 0 ? pageStartIndex + 1 : 0

  const { pages, showLeftEllipsis, showRightEllipsis } = usePagination({
    currentPage: effectiveCurrentPage,
    paginationItemsToDisplay: 3,
    totalPages
  })

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

      <div className='max-w-full min-w-0 space-y-3'>
        {monthGroups.length === 0 ? (
          <div className='text-muted-foreground rounded-lg border px-3 py-8 text-center text-sm sm:px-4 sm:py-10'>
            {rows.length === 0
              ? 'No transaction history has been recorded yet.'
              : 'No transaction history matches the current filters.'}
          </div>
        ) : (
          <div className='grid gap-4'>
            {paginatedMonthGroups.map(group => (
              <article key={group.id} className='bg-background overflow-hidden rounded-lg border shadow-sm'>
                <div className='border-b px-3 py-3 sm:px-4'>
                  <div className='flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between'>
                    <div className='flex min-w-0 items-center gap-2'>
                      <CalendarDays className='text-primary size-5 shrink-0' aria-hidden='true' />
                      <h2 className='truncate text-xl font-extrabold tracking-normal sm:text-2xl'>
                        {group.monthLabel}
                      </h2>
                    </div>
                    <div className='text-muted-foreground text-xs font-semibold sm:text-right'>
                      {group.entryCount} transaction{group.entryCount === 1 ? '' : 's'}
                    </div>
                  </div>

                  <div className='mt-3 grid gap-2 sm:grid-cols-3'>
                    <MobileValue
                      label='Month Sent / Adjustments'
                      value={currencyFormatter.format(group.amountSentOrAdjusted)}
                      valueClassName={getAmountClassName(group.amountSentOrAdjusted)}
                    />
                    <MobileValue
                      label='Month Verified'
                      value={currencyFormatter.format(group.amountVerified)}
                      valueClassName={getVerifiedAmountClassName(group.amountVerified)}
                    />
                    <MobileValue
                      label='Month Net'
                      value={currencyFormatter.format(group.balance)}
                      valueClassName={getBalanceClassName(group.balance)}
                    />
                  </div>
                </div>

                <div className='divide-y'>
                  {group.rows.map(row => (
                    <div
                      key={row.id}
                      className='grid gap-3 px-3 py-3 sm:px-4 lg:grid-cols-[minmax(10rem,0.8fr)_minmax(0,2.2fr)] lg:items-start'
                    >
                      <div className='min-w-0'>
                        <Badge
                          variant='outline'
                          className={cn('w-fit rounded-md capitalize', getPaymentBadgeClassName(row.paymentTypeKey))}
                        >
                          {row.paymentType}
                        </Badge>
                      </div>
                      <div className='grid gap-2 sm:grid-cols-3'>
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
                          label='Running Balance'
                          value={currencyFormatter.format(row.balance)}
                          valueClassName={getBalanceClassName(row.balance)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        )}

        {monthGroups.length > 0 ? (
          <div className='bg-background flex flex-col gap-3 rounded-lg border px-3 py-3 lg:flex-row lg:items-center lg:justify-between'>
            <p className='text-muted-foreground text-sm font-semibold'>
              Showing {showingStart}-{pageEndIndex} of {monthGroups.length} month card(s)
            </p>
            <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end'>
              <div className='flex items-center gap-2'>
                <span className='text-muted-foreground text-sm font-semibold whitespace-nowrap'>Months per page</span>
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
