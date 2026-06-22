'use client'

import { useId, useMemo, useState } from 'react'

import { ChevronLeftIcon, ChevronRightIcon, FileSpreadsheetIcon, SearchIcon, XIcon } from 'lucide-react'
import * as XLSX from 'xlsx'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem } from '@/components/ui/pagination'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { usePagination } from '@/hooks/use-pagination'
import { cn } from '@/lib/utils'

export type AdminTransactionHistoryRow = {
  amount: number
  associationCode: string
  associationName: string
  createdAt: string
  createdBy: string | null
  eventType: string
  id: string
  note: string | null
  paymentType: string
}

type AdminTransactionHistoryTableProps = {
  rows: AdminTransactionHistoryRow[]
}

type TransactionAmountColumn = {
  eventType: string
  label: string
}

const currencyFormatter = new Intl.NumberFormat('en-US', {
  currency: 'USD',
  style: 'currency'
})

const dateTimeFormatter = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium',
  timeStyle: 'short'
})

const transactionRowsPerPage = 25

const transactionAmountColumns: TransactionAmountColumn[] = [
  { eventType: 'submitted', label: 'Submitted' },
  { eventType: 'verified', label: 'Verified' },
  { eventType: 'due_offset', label: 'Due Offset' },
  { eventType: 'manual_adjustment', label: 'Manual Adjustment' },
  { eventType: 'reset', label: 'Reset' }
]

const formatLabel = (value: string) =>
  value
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

const getSearchableTransactionText = (row: AdminTransactionHistoryRow) =>
  [
    row.associationCode,
    row.associationName,
    row.createdBy,
    row.eventType,
    row.note,
    row.paymentType,
    currencyFormatter.format(row.amount)
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

const filterTransactions = (rows: AdminTransactionHistoryRow[], searchQuery: string) => {
  const searchTerms = searchQuery.trim().toLowerCase().split(/\s+/).filter(Boolean)

  if (searchTerms.length === 0) return rows

  return rows.filter(row => {
    const searchableText = getSearchableTransactionText(row)

    return searchTerms.every(term => searchableText.includes(term))
  })
}

const getEventBadgeClassName = (eventType: string) =>
  ({
    due_offset: 'border-purple-500/30 bg-purple-500/10 text-purple-700 dark:text-purple-300',
    manual_adjustment: 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300',
    reset: 'border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300',
    submitted: 'border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-300',
    verified: 'border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-300'
  })[eventType] ?? 'border-border bg-muted text-foreground'

const getPaymentBadgeClassName = (paymentType: string) =>
  ({
    contribution: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
    registration: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-700 dark:text-cyan-300'
  })[paymentType] ?? 'border-border bg-muted text-foreground'

const getTransactionAmount = (row: AdminTransactionHistoryRow, eventType: string) =>
  row.eventType === eventType ? currencyFormatter.format(row.amount) : '-'

const getTransactionExportAmount = (row: AdminTransactionHistoryRow, eventType: string) =>
  row.eventType === eventType ? row.amount : ''

const AdminTransactionHistoryTable = ({ rows }: AdminTransactionHistoryTableProps) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const searchInputId = useId()

  const filteredRows = useMemo(() => filterTransactions(rows, searchQuery), [rows, searchQuery])
  const totalPages = Math.max(1, Math.ceil(filteredRows.length / transactionRowsPerPage))
  const activePage = Math.min(currentPage, totalPages)

  const paginatedRows = useMemo(() => {
    const startIndex = (activePage - 1) * transactionRowsPerPage

    return filteredRows.slice(startIndex, startIndex + transactionRowsPerPage)
  }, [activePage, filteredRows])

  const { pages, showLeftEllipsis, showRightEllipsis } = usePagination({
    currentPage: activePage,
    totalPages,
    paginationItemsToDisplay: 3
  })

  const exportPageToExcel = () => {
    const worksheetData = [
      [
        'Date',
        'Association Code',
        'Association',
        'Payment',
        ...transactionAmountColumns.map(column => column.label),
        'Event',
        'Note'
      ],
      ...paginatedRows.map(row => [
        dateTimeFormatter.format(new Date(row.createdAt)),
        row.associationCode,
        row.associationName,
        formatLabel(row.paymentType),
        ...transactionAmountColumns.map(column => getTransactionExportAmount(row, column.eventType)),
        formatLabel(row.eventType),
        row.note ?? ''
      ])
    ]

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData)

    worksheet['!cols'] = [
      { wch: 22 },
      { wch: 18 },
      { wch: 34 },
      { wch: 16 },
      ...transactionAmountColumns.map(() => ({ wch: 18 })),
      { wch: 18 },
      { wch: 48 }
    ]

    const workbook = XLSX.utils.book_new()

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Transaction History')
    XLSX.writeFile(workbook, `sagi-usa-transaction-history-${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  return (
    <div className='border-border w-full max-w-full min-w-0 overflow-hidden rounded-lg border'>
      <div className='flex flex-col gap-3 border-b p-3 sm:flex-row sm:items-center sm:justify-between'>
        <div className='flex w-full flex-col gap-3 sm:flex-row sm:items-center'>
          <form
            role='search'
            className='w-full max-w-md'
            onSubmit={event => {
              event.preventDefault()
            }}
          >
            <label htmlFor={searchInputId} className='sr-only'>
              Search transaction history
            </label>
            <div className='relative'>
              <Input
                id={searchInputId}
                type='search'
                value={searchQuery}
                onChange={event => {
                  setSearchQuery(event.target.value)
                  setCurrentPage(1)
                }}
                placeholder='Search transaction history'
                className='pr-9 pl-9'
              />
              <div className='text-muted-foreground/80 pointer-events-none absolute inset-y-0 left-0 flex items-center justify-center pl-3'>
                <SearchIcon className='size-4' aria-hidden='true' />
              </div>
              {searchQuery ? (
                <Button
                  type='button'
                  variant='ghost'
                  size='icon-xs'
                  className='text-muted-foreground hover:text-foreground absolute top-1/2 right-1.5 -translate-y-1/2 rounded-full'
                  onClick={() => {
                    setSearchQuery('')
                    setCurrentPage(1)
                  }}
                  aria-label='Clear transaction history search'
                >
                  <XIcon className='size-3.5' />
                </Button>
              ) : null}
            </div>
          </form>
          <p className='text-muted-foreground text-sm sm:ml-auto' aria-live='polite'>
            {filteredRows.length.toLocaleString('en-US')} transaction(s)
          </p>
        </div>
        <Button
          type='button'
          size='sm'
          onClick={exportPageToExcel}
          disabled={paginatedRows.length === 0}
          className='w-full sm:w-auto'
        >
          <FileSpreadsheetIcon />
          Export Page
        </Button>
      </div>

      <div className='hidden w-full min-w-0 overflow-x-auto lg:block'>
        <Table
          className='table-fixed text-sm'
          style={{
            minWidth: '96rem'
          }}
        >
          <TableHeader>
            <TableRow className='bg-primary hover:bg-primary'>
              <TableHead className='text-primary-foreground w-44'>Date</TableHead>
              <TableHead className='text-primary-foreground w-28'>Code</TableHead>
              <TableHead className='text-primary-foreground w-56'>Association</TableHead>
              <TableHead className='text-primary-foreground w-32'>Payment</TableHead>
              {transactionAmountColumns.map(column => (
                <TableHead key={column.eventType} className='text-primary-foreground w-36 text-right'>
                  {column.label}
                </TableHead>
              ))}
              <TableHead className='text-primary-foreground'>Note</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedRows.length > 0 ? (
              paginatedRows.map(row => (
                <TableRow key={row.id} className='odd:bg-muted/30 even:bg-background'>
                  <TableCell className='py-4 align-top font-semibold'>
                    {dateTimeFormatter.format(new Date(row.createdAt))}
                  </TableCell>
                  <TableCell className='py-4 align-top font-extrabold'>{row.associationCode}</TableCell>
                  <TableCell className='py-4 align-top'>
                    <p className='font-extrabold'>{row.associationName}</p>
                  </TableCell>
                  <TableCell className='py-4 align-top'>
                    <Badge
                      variant='outline'
                      className={cn('rounded-md capitalize', getPaymentBadgeClassName(row.paymentType))}
                    >
                      {formatLabel(row.paymentType)}
                    </Badge>
                  </TableCell>
                  {transactionAmountColumns.map(column => (
                    <TableCell
                      key={column.eventType}
                      className={cn(
                        'py-4 text-right align-top font-extrabold tabular-nums',
                        row.eventType !== column.eventType && 'text-muted-foreground/50 font-semibold'
                      )}
                    >
                      {getTransactionAmount(row, column.eventType)}
                    </TableCell>
                  ))}
                  <TableCell className='text-muted-foreground py-4 align-top text-sm font-semibold'>
                    <div className='grid gap-1'>
                      <Badge
                        variant='outline'
                        className={cn('w-fit rounded-md capitalize', getEventBadgeClassName(row.eventType))}
                      >
                        {formatLabel(row.eventType)}
                      </Badge>
                      <span>{row.note ?? 'No note recorded'}</span>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={5 + transactionAmountColumns.length}
                  className='text-muted-foreground h-24 text-center'
                >
                  No transactions found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className='grid w-full min-w-0 gap-3 p-3 lg:hidden'>
        {paginatedRows.length > 0 ? (
          paginatedRows.map(row => (
            <article key={row.id} className='bg-background rounded-md border p-4 shadow-sm'>
              <div className='flex items-start justify-between gap-4'>
                <div className='min-w-0'>
                  <p className='font-extrabold break-words'>{row.associationName}</p>
                  <p className='text-muted-foreground text-xs font-semibold'>Code: {row.associationCode}</p>
                </div>
                <p className='shrink-0 text-right font-extrabold tabular-nums'>
                  {currencyFormatter.format(row.amount)}
                </p>
              </div>
              <div className='mt-3 flex flex-wrap items-center gap-2'>
                <Badge
                  variant='outline'
                  className={cn('rounded-md capitalize', getPaymentBadgeClassName(row.paymentType))}
                >
                  {formatLabel(row.paymentType)}
                </Badge>
                <Badge variant='outline' className={cn('rounded-md capitalize', getEventBadgeClassName(row.eventType))}>
                  {formatLabel(row.eventType)}
                </Badge>
              </div>
              <div className='mt-3 grid grid-cols-2 gap-2 text-sm'>
                {transactionAmountColumns.map(column => (
                  <div key={column.eventType} className='min-w-0'>
                    <p className='text-muted-foreground text-xs font-semibold'>{column.label}</p>
                    <p
                      className={cn(
                        'font-extrabold tabular-nums',
                        row.eventType !== column.eventType && 'text-muted-foreground/50 font-semibold'
                      )}
                    >
                      {getTransactionAmount(row, column.eventType)}
                    </p>
                  </div>
                ))}
              </div>
              <p className='mt-3 text-sm font-semibold'>{dateTimeFormatter.format(new Date(row.createdAt))}</p>
              <p className='text-muted-foreground mt-2 text-sm font-semibold break-words'>
                {row.note ?? 'No note recorded'}
              </p>
            </article>
          ))
        ) : (
          <div className='text-muted-foreground rounded-md border px-4 py-10 text-center text-sm'>
            No transactions found.
          </div>
        )}
      </div>

      {filteredRows.length > transactionRowsPerPage ? (
        <div className='flex flex-col items-center justify-between gap-3 border-t p-3 sm:flex-row'>
          <p className='text-muted-foreground text-sm' aria-live='polite'>
            Showing {(activePage - 1) * transactionRowsPerPage + 1}-
            {Math.min(activePage * transactionRowsPerPage, filteredRows.length)} of {filteredRows.length}
          </p>
          <Pagination className='w-auto justify-end'>
            <PaginationContent>
              <PaginationItem>
                <Button
                  type='button'
                  variant='ghost'
                  onClick={() => setCurrentPage(Math.max(1, activePage - 1))}
                  disabled={activePage === 1}
                  className='disabled:pointer-events-none disabled:opacity-50'
                  aria-label='Go to previous page'
                >
                  <ChevronLeftIcon aria-hidden='true' className='text-primary' />
                  <span className='text-primary max-sm:hidden'>Previous</span>
                </Button>
              </PaginationItem>

              {showLeftEllipsis ? (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              ) : null}

              {pages.map(page => {
                const isActive = page === activePage

                return (
                  <PaginationItem key={page}>
                    <Button
                      type='button'
                      size='icon'
                      className={cn(
                        !isActive &&
                          'bg-primary/10 text-primary hover:bg-primary/20 focus-visible:ring-primary/20 dark:focus-visible:ring-primary/40'
                      )}
                      onClick={() => setCurrentPage(page)}
                      aria-current={isActive ? 'page' : undefined}
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
                  onClick={() => setCurrentPage(Math.min(totalPages, activePage + 1))}
                  disabled={activePage === totalPages}
                  className='disabled:pointer-events-none disabled:opacity-50'
                  aria-label='Go to next page'
                >
                  <span className='text-primary max-sm:hidden'>Next</span>
                  <ChevronRightIcon aria-hidden='true' className='text-primary' />
                </Button>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      ) : null}
    </div>
  )
}

export default AdminTransactionHistoryTable
