'use client'

import type { ReactNode } from 'react'
import { useMemo, useState } from 'react'

import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeftIcon, ChevronRightIcon, History, SearchIcon } from 'lucide-react'

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

const paymentTypes = {
  contribution: 'contribution',
  registration: 'registration'
} as const

export type AdminPaymentHistoryRow = {
  amount: number
  associationCode: string
  associationName: string
  createdAt: string
  createdAtLabel: string
  createdBy: string
  id: string
  note: string
  paymentType: string
  paymentTypeKey: string
}

export type AdminPaymentHistoryTotals = {
  associationCount: number
  contributionVerified: number
  registrationVerified: number
  totalVerified: number
  transactionCount: number
}

type SortKey = keyof AdminPaymentHistoryRow
type SortDirection = 'asc' | 'desc'
type PaymentTypeFilter = 'all' | 'contribution' | 'registration'

type AdminPaymentHistoryColumn = {
  align?: 'left' | 'right'
  key: SortKey
  label: string
}

const columns: AdminPaymentHistoryColumn[] = [
  { key: 'createdAt', label: 'Verified Date' },
  { key: 'associationName', label: 'Association' },
  { key: 'associationCode', label: 'Code' },
  { key: 'paymentType', label: 'Payment Type' },
  { align: 'right', key: 'amount', label: 'Amount Verified' },
  { key: 'createdBy', label: 'Verified By' },
  { key: 'note', label: 'Note' }
]

const columnWidths: Partial<Record<SortKey, number>> = {
  amount: 13,
  associationCode: 8,
  associationName: 23,
  createdAt: 14,
  createdBy: 12,
  note: 18,
  paymentType: 12
}

const pageSizeOptions = [10, 25, 50, 100]

const paymentTypeFilterLabels: Record<PaymentTypeFilter, string> = {
  all: 'All payment types',
  contribution: 'Contribution',
  registration: 'Registration'
}

const getColumnStyle = (columnKey: SortKey) => ({ width: `${columnWidths[columnKey] ?? 10}%` })

const roundCurrencyAmount = (amount: number) => Number(amount.toFixed(2))

const getPaymentBadgeClassName = (paymentType: string) =>
  ({
    contribution: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
    registration: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-700 dark:text-cyan-300'
  })[paymentType] ?? 'border-border bg-muted text-foreground'

const getSortIcon = (isActive: boolean, direction: SortDirection) => {
  if (!isActive) return <ArrowUpDown className='size-3.5' aria-hidden='true' />

  return direction === 'asc' ? (
    <ArrowUp className='size-3.5' aria-hidden='true' />
  ) : (
    <ArrowDown className='size-3.5' aria-hidden='true' />
  )
}

const compareValues = (firstValue: AdminPaymentHistoryRow[SortKey], secondValue: AdminPaymentHistoryRow[SortKey]) => {
  if (typeof firstValue === 'number' && typeof secondValue === 'number') return firstValue - secondValue

  return String(firstValue ?? '').localeCompare(String(secondValue ?? ''), undefined, {
    numeric: true,
    sensitivity: 'base'
  })
}

const getHistoryTotals = (rows: AdminPaymentHistoryRow[]): AdminPaymentHistoryTotals => {
  const associationCodes = new Set<string>()

  return rows.reduce(
    (totals, row) => {
      associationCodes.add(row.associationCode)

      if (row.paymentTypeKey === paymentTypes.contribution) {
        totals.contributionVerified = roundCurrencyAmount(totals.contributionVerified + row.amount)
      }

      if (row.paymentTypeKey === paymentTypes.registration) {
        totals.registrationVerified = roundCurrencyAmount(totals.registrationVerified + row.amount)
      }

      totals.totalVerified = roundCurrencyAmount(totals.totalVerified + row.amount)
      totals.transactionCount += 1
      totals.associationCount = associationCodes.size

      return totals
    },
    {
      associationCount: 0,
      contributionVerified: 0,
      registrationVerified: 0,
      totalVerified: 0,
      transactionCount: 0
    }
  )
}

const getAssociationOptions = (rows: AdminPaymentHistoryRow[]) =>
  Array.from(
    rows
      .reduce((options, row) => {
        if (!options.has(row.associationCode)) {
          options.set(row.associationCode, {
            associationCode: row.associationCode,
            associationName: row.associationName
          })
        }

        return options
      }, new Map<string, { associationCode: string; associationName: string }>())
      .values()
  ).sort((firstOption, secondOption) =>
    firstOption.associationCode.localeCompare(secondOption.associationCode, undefined, {
      numeric: true,
      sensitivity: 'base'
    })
  )

const getRowSearchText = (row: AdminPaymentHistoryRow) =>
  [row.associationCode, row.associationName, row.createdAtLabel, row.createdBy, row.note, row.paymentType]
    .join(' ')
    .toLowerCase()

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
  <div className='grid grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] items-start gap-2'>
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

const AdminPaymentHistoryTable = ({
  rows,
  totals
}: {
  rows: AdminPaymentHistoryRow[]
  totals: AdminPaymentHistoryTotals
}) => {
  const [associationFilter, setAssociationFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)
  const [paymentTypeFilter, setPaymentTypeFilter] = useState<PaymentTypeFilter>('all')
  const [search, setSearch] = useState('')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [sortKey, setSortKey] = useState<SortKey>('createdAt')

  const associationOptions = useMemo(() => getAssociationOptions(rows), [rows])
  const normalizedSearch = search.trim().toLowerCase()

  const filteredRows = useMemo(() => {
    return rows.filter(row => {
      const matchesSearch = normalizedSearch ? getRowSearchText(row).includes(normalizedSearch) : true
      const matchesAssociation = associationFilter === 'all' || row.associationCode === associationFilter
      const matchesPaymentType = paymentTypeFilter === 'all' || row.paymentTypeKey === paymentTypeFilter

      return matchesSearch && matchesAssociation && matchesPaymentType
    })
  }, [associationFilter, normalizedSearch, paymentTypeFilter, rows])

  const sortedRows = useMemo(() => {
    return [...filteredRows].sort((firstRow, secondRow) => {
      const comparison = compareValues(firstRow[sortKey], secondRow[sortKey])

      if (comparison !== 0) return sortDirection === 'asc' ? comparison : -comparison

      return firstRow.associationCode.localeCompare(secondRow.associationCode, undefined, {
        numeric: true,
        sensitivity: 'base'
      })
    })
  }, [filteredRows, sortDirection, sortKey])

  const visibleTotals = useMemo(() => {
    if (!normalizedSearch && associationFilter === 'all' && paymentTypeFilter === 'all') return totals

    return getHistoryTotals(filteredRows)
  }, [associationFilter, filteredRows, normalizedSearch, paymentTypeFilter, totals])

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
    setSortDirection(nextSortKey === 'createdAt' ? 'desc' : 'asc')
    setCurrentPage(1)
  }

  const handleSearchChange = (nextSearch: string) => {
    setSearch(nextSearch)
    setCurrentPage(1)
  }

  const handleAssociationFilterChange = (nextAssociation: string) => {
    setAssociationFilter(nextAssociation)
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
      <div className='grid gap-3 sm:grid-cols-2 xl:grid-cols-4'>
        <SummaryStat label='Verified Records' value={visibleTotals.transactionCount.toLocaleString('en-US')} />
        <SummaryStat label='Associations' value={visibleTotals.associationCount.toLocaleString('en-US')} />
        <SummaryStat
          label='Contribution Verified'
          value={currencyFormatter.format(visibleTotals.contributionVerified)}
        />
        <SummaryStat
          label='Registration Verified'
          value={currencyFormatter.format(visibleTotals.registrationVerified)}
        />
      </div>

      <div className='flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between'>
        <form role='search' onSubmit={event => event.preventDefault()} className='min-w-0 flex-1'>
          <label htmlFor='admin-payment-history-search' className='sr-only'>
            Search payment history
          </label>
          <div className='relative'>
            <SearchIcon className='text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2' />
            <Input
              id='admin-payment-history-search'
              value={search}
              onChange={event => handleSearchChange(event.target.value)}
              placeholder='Search association, code, type, verifier, or note'
              className='bg-background h-10 w-full pl-9 text-sm font-semibold'
            />
          </div>
        </form>

        <div className='grid gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] xl:w-auto xl:min-w-[34rem]'>
          <Select value={associationFilter} onValueChange={handleAssociationFilterChange}>
            <SelectTrigger className='bg-background h-10 w-full'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All associations</SelectItem>
              {associationOptions.map(option => (
                <SelectItem key={option.associationCode} value={option.associationCode}>
                  {option.associationCode} - {option.associationName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

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
                      ? 'No verified payment history has been recorded yet.'
                      : 'No verified payment history matches the current filters.'}
                  </TableCell>
                </TableRow>
              ) : (
                paginatedRows.map(row => (
                  <TableRow key={row.id} className='odd:bg-muted/30 even:bg-background'>
                    <TableCell
                      title={row.createdAtLabel}
                      className='truncate text-xs font-semibold'
                      style={getColumnStyle('createdAt')}
                    >
                      {row.createdAtLabel}
                    </TableCell>
                    <TableCell
                      title={row.associationName}
                      className='truncate font-extrabold'
                      style={getColumnStyle('associationName')}
                    >
                      {row.associationName}
                    </TableCell>
                    <TableCell
                      title={row.associationCode}
                      className='truncate font-mono font-extrabold'
                      style={getColumnStyle('associationCode')}
                    >
                      {row.associationCode}
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
                    <TableCell className='text-right' style={getColumnStyle('amount')}>
                      <span className='font-extrabold text-green-700 tabular-nums dark:text-green-300'>
                        {currencyFormatter.format(row.amount)}
                      </span>
                    </TableCell>
                    <TableCell
                      title={row.createdBy || '-'}
                      className='truncate text-xs font-semibold'
                      style={getColumnStyle('createdBy')}
                    >
                      {row.createdBy || '-'}
                    </TableCell>
                    <TableCell
                      title={row.note || '-'}
                      className='text-muted-foreground truncate text-xs'
                      style={getColumnStyle('note')}
                    >
                      {row.note || '-'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
            {sortedRows.length > 0 ? (
              <TableFooter className='bg-white text-black dark:bg-white dark:text-black'>
                <TableRow className='bg-white text-base text-black hover:bg-white dark:bg-white dark:text-black dark:hover:bg-white'>
                  <TableCell className='font-extrabold' style={getColumnStyle('createdAt')}>
                    Total
                  </TableCell>
                  <TableCell style={getColumnStyle('associationName')} />
                  <TableCell className='font-semibold' style={getColumnStyle('associationCode')}>
                    {visibleTotals.associationCount} association(s)
                  </TableCell>
                  <TableCell className='font-semibold' style={getColumnStyle('paymentType')}>
                    {visibleTotals.transactionCount} record(s)
                  </TableCell>
                  <TableCell className='text-right font-extrabold tabular-nums' style={getColumnStyle('amount')}>
                    {currencyFormatter.format(visibleTotals.totalVerified)}
                  </TableCell>
                  <TableCell style={getColumnStyle('createdBy')} />
                  <TableCell style={getColumnStyle('note')} />
                </TableRow>
              </TableFooter>
            ) : null}
          </Table>
        </div>

        <div className='grid gap-3 p-2 sm:p-3 xl:hidden'>
          {sortedRows.length === 0 ? (
            <div className='text-muted-foreground rounded-md border px-3 py-8 text-center text-sm sm:px-4 sm:py-10'>
              {rows.length === 0
                ? 'No verified payment history has been recorded yet.'
                : 'No verified payment history matches the current filters.'}
            </div>
          ) : (
            paginatedRows.map(row => (
              <article key={row.id} className='bg-background overflow-hidden rounded-md border shadow-sm'>
                <div className='flex flex-col gap-2 border-b px-3 py-3 sm:flex-row sm:items-start sm:justify-between sm:px-4'>
                  <div className='min-w-0'>
                    <div className='flex min-w-0 items-center gap-2'>
                      <History className='text-primary size-4 shrink-0' aria-hidden='true' />
                      <div className='truncate text-lg font-extrabold'>{row.associationName}</div>
                    </div>
                    <div className='text-muted-foreground mt-1 font-mono text-xs font-semibold'>
                      {row.associationCode}
                    </div>
                  </div>
                  <div className='text-muted-foreground shrink-0 text-left text-xs font-semibold sm:text-right'>
                    {row.createdAtLabel}
                  </div>
                </div>
                <div className='grid gap-2 px-3 py-3 text-sm sm:px-4'>
                  <MobileValue
                    label='Type'
                    value={
                      <Badge
                        variant='outline'
                        className={cn('rounded-md capitalize', getPaymentBadgeClassName(row.paymentTypeKey))}
                      >
                        {row.paymentType}
                      </Badge>
                    }
                  />
                  <MobileValue
                    label='Verified'
                    value={currencyFormatter.format(row.amount)}
                    valueClassName='text-green-700 dark:text-green-300'
                  />
                  <MobileValue label='Verified by' value={row.createdBy || '-'} />
                  {row.note ? (
                    <div className='border-t pt-3'>
                      <div className='text-muted-foreground text-xs font-semibold uppercase'>Note</div>
                      <div className='mt-1 text-sm font-semibold break-words'>{row.note}</div>
                    </div>
                  ) : null}
                </div>
              </article>
            ))
          )}
        </div>

        {sortedRows.length > 0 ? (
          <div className='bg-background flex flex-col gap-3 border-t px-3 py-3 lg:flex-row lg:items-center lg:justify-between'>
            <p className='text-muted-foreground text-sm font-semibold'>
              Showing {showingStart}-{pageEndIndex} of {sortedRows.length} verified record(s)
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

export default AdminPaymentHistoryTable
