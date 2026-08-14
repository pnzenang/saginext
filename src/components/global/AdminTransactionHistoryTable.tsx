'use client'

import type { ReactNode } from 'react'
import { useMemo, useState } from 'react'

import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Ban,
  ChevronLeftIcon,
  ChevronRightIcon,
  Download,
  FileSpreadsheetIcon
} from 'lucide-react'
import * as XLSX from 'xlsx'

import FormContainer from '@/components/forms/FormContainer'
import { SubmitButton } from '@/components/forms/Buttons'
import PrintButton from '@/components/global/PrintButton'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem } from '@/components/ui/pagination'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { usePagination } from '@/hooks/use-pagination'
import { cn } from '@/lib/utils'
import { cancelTransactionHistoryEntryAction } from '@/utils/actions'

const currencyFormatter = new Intl.NumberFormat('en-US', {
  currency: 'USD',
  style: 'currency'
})

export type AdminTransactionHistoryRow = {
  amountAdjusted: number | null
  amountReset: number | null
  amountSubmitted: number | null
  amountVerified: number | null
  associationCode: string
  canCancel: boolean
  cancellationReason: string
  cancelledAt: string | null
  cancelledAtLabel: string | null
  cancelledBy: string
  createdAt: string
  createdAtLabel: string
  createdBy: string
  eventType: string
  eventTypeKey: string
  id: string
  note: string
  paymentType: string
  paymentTypeKey: string
  source: string
}

export type AdminTransactionHistoryTotals = {
  amountAdjusted: number
  amountReset: number
  amountSubmitted: number
  amountVerified: number
  transactionCount: number
}

type SortKey = keyof AdminTransactionHistoryRow
type SortDirection = 'asc' | 'desc'

type AdminTransactionHistoryColumn = {
  align?: 'left' | 'right'
  key: SortKey
  label: string
}

const columns: AdminTransactionHistoryColumn[] = [
  { key: 'createdAt', label: 'Date' },
  { key: 'associationCode', label: 'Code' },
  { key: 'paymentType', label: 'Type' },
  { key: 'eventType', label: 'Action' },
  { key: 'amountSubmitted', label: 'Amount set by association', align: 'right' },
  { key: 'amountAdjusted', label: 'Amount adjusted', align: 'right' },
  { key: 'amountVerified', label: 'Amount verified', align: 'right' },
  { key: 'amountReset', label: 'Reset', align: 'right' },
  { key: 'note', label: 'Note' }
]

const pageSizeOptions = [10, 25, 50, 100]

const exportColumnWidths: Partial<Record<SortKey, number>> = {
  amountAdjusted: 18,
  amountReset: 14,
  amountSubmitted: 28,
  amountVerified: 18,
  associationCode: 18,
  createdAt: 22,
  eventType: 24,
  note: 42,
  paymentType: 16,
  source: 14
}

const columnWidths: Partial<Record<SortKey, number>> = {
  amountAdjusted: 9,
  amountReset: 6,
  amountSubmitted: 13,
  amountVerified: 10,
  associationCode: 7,
  createdAt: 11,
  eventType: 12,
  note: 15,
  paymentType: 9
}

const actionColumnStyle = { width: '8%' }

const roundCurrencyAmount = (amount: number) => Number(amount.toFixed(2))

const getColumnStyle = (columnKey: SortKey) => ({ width: `${columnWidths[columnKey] ?? 10}%` })

const getSortIcon = (isActive: boolean, direction: SortDirection) => {
  if (!isActive) return <ArrowUpDown className='size-3.5' />

  return direction === 'asc' ? <ArrowUp className='size-3.5' /> : <ArrowDown className='size-3.5' />
}

const compareValues = (
  firstValue: AdminTransactionHistoryRow[SortKey],
  secondValue: AdminTransactionHistoryRow[SortKey]
) => {
  if (typeof firstValue === 'number' && typeof secondValue === 'number') {
    return firstValue - secondValue
  }

  if (firstValue === null && secondValue === null) return 0
  if (firstValue === null) return -1
  if (secondValue === null) return 1

  return String(firstValue).localeCompare(String(secondValue), undefined, {
    numeric: true,
    sensitivity: 'base'
  })
}

const formatAmount = (amount: number | null) => (amount === null ? '-' : currencyFormatter.format(amount))

const getAmountClassName = (amount: number | null, isCancelled = false) =>
  cn(
    'font-semibold tabular-nums',
    amount === null && 'text-muted-foreground font-medium',
    amount !== null && amount < 0 && 'text-red-700 dark:text-red-300',
    amount !== null && amount > 0 && 'text-green-700 dark:text-green-300',
    isCancelled && 'text-muted-foreground line-through decoration-2'
  )

const getEventBadgeClassName = (eventType: string) =>
  ({
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

const getStatusBadgeClassName = (isCancelled: boolean) =>
  isCancelled
    ? 'border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300'
    : 'border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-300'

const getTransactionTotals = (rows: AdminTransactionHistoryRow[]): AdminTransactionHistoryTotals =>
  rows.reduce(
    (currentTotals, row) => {
      if (row.cancelledAt) {
        return currentTotals
      }

      currentTotals.amountAdjusted = roundCurrencyAmount(currentTotals.amountAdjusted + (row.amountAdjusted ?? 0))
      currentTotals.amountReset = roundCurrencyAmount(currentTotals.amountReset + (row.amountReset ?? 0))
      currentTotals.amountSubmitted = roundCurrencyAmount(currentTotals.amountSubmitted + (row.amountSubmitted ?? 0))
      currentTotals.amountVerified = roundCurrencyAmount(currentTotals.amountVerified + (row.amountVerified ?? 0))
      currentTotals.transactionCount += 1

      return currentTotals
    },
    {
      amountAdjusted: 0,
      amountReset: 0,
      amountSubmitted: 0,
      amountVerified: 0,
      transactionCount: 0
    }
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

const SummaryStat = ({ label, value }: { label: string; value: string | number }) => (
  <div className='bg-background rounded-md border p-4'>
    <div className='text-muted-foreground text-xs font-semibold uppercase'>{label}</div>
    <div className='mt-2 text-2xl font-extrabold tracking-normal tabular-nums'>{value}</div>
  </div>
)

const TransactionStatusBadge = ({ row }: { row: AdminTransactionHistoryRow }) => {
  const isCancelled = Boolean(row.cancelledAt)

  return (
    <Badge
      variant='outline'
      className={cn('rounded-md capitalize', getStatusBadgeClassName(isCancelled))}
      title={isCancelled && row.cancelledAtLabel ? `Cancelled ${row.cancelledAtLabel}` : 'Active'}
    >
      {isCancelled ? 'Cancelled' : 'Active'}
    </Badge>
  )
}

const CancelTransactionEntryButton = ({ row }: { row: AdminTransactionHistoryRow }) => {
  if (row.cancelledAt) {
    return <TransactionStatusBadge row={row} />
  }

  if (!row.canCancel) {
    return <span className='text-muted-foreground text-xs font-semibold'>-</span>
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          type='button'
          variant='outline'
          size='sm'
          className='h-8 border-red-200 px-2 text-xs text-red-700 hover:bg-red-50 hover:text-red-800 dark:border-red-900 dark:text-red-300 dark:hover:bg-red-950/40'
        >
          <Ban className='size-3.5' />
          Cancel
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Cancel transaction entry?</AlertDialogTitle>
          <AlertDialogDescription className='leading-6'>
            This marks the entry cancelled and reverses its effect on the related payment totals. The entry remains
            visible in transaction history for audit.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <FormContainer action={cancelTransactionHistoryEntryAction} className='space-y-4'>
          <input type='hidden' name='transactionEntryId' value={row.id} />
          <div className='space-y-2'>
            <Label htmlFor={`cancellation-reason-${row.id}`}>Reason</Label>
            <Textarea
              id={`cancellation-reason-${row.id}`}
              name='cancellationReason'
              placeholder='Optional note'
              className='min-h-24 resize-y'
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel type='button'>Keep entry</AlertDialogCancel>
            <SubmitButton
              text='Cancel entry'
              className='h-9 w-full bg-red-700 px-4 text-sm normal-case hover:bg-red-800 sm:w-auto'
            />
          </AlertDialogFooter>
        </FormContainer>
      </AlertDialogContent>
    </AlertDialog>
  )
}

const AdminTransactionHistoryTable = ({
  rows,
  totals
}: {
  rows: AdminTransactionHistoryRow[]
  totals: AdminTransactionHistoryTotals
}) => {
  const [sortKey, setSortKey] = useState<SortKey>('createdAt')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)

  const normalizedSearch = search.trim().toLowerCase()

  const filteredRows = useMemo(() => {
    if (!normalizedSearch) return rows

    return rows.filter(row =>
      [
        row.associationCode,
        row.cancellationReason,
        row.cancelledAtLabel ?? '',
        row.cancelledBy,
        row.cancelledAt ? 'cancelled' : 'active',
        row.createdAtLabel,
        row.createdBy,
        row.eventType,
        row.note,
        row.paymentType,
        row.source
      ]
        .join(' ')
        .toLowerCase()
        .includes(normalizedSearch)
    )
  }, [normalizedSearch, rows])

  const sortedRows = useMemo(() => {
    return [...filteredRows].sort((firstRow, secondRow) => {
      const comparison = compareValues(firstRow[sortKey], secondRow[sortKey])

      return sortDirection === 'asc' ? comparison : -comparison
    })
  }, [filteredRows, sortDirection, sortKey])

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

  const visibleTotals = useMemo<AdminTransactionHistoryTotals>(() => {
    if (!normalizedSearch) return totals

    return getTransactionTotals(filteredRows)
  }, [filteredRows, normalizedSearch, totals])

  const currentPageTotals = useMemo(() => getTransactionTotals(paginatedRows), [paginatedRows])

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

  const handlePageSizeChange = (nextPageSize: string) => {
    setPageSize(Number(nextPageSize))
    setCurrentPage(1)
  }

  const handlePageChange = (nextPage: number) => {
    setCurrentPage(Math.min(Math.max(nextPage, 1), totalPages))
  }

  const exportRowsToExcel = (
    exportRows: AdminTransactionHistoryRow[],
    exportTotals: AdminTransactionHistoryTotals,
    fileNamePrefix: string
  ) => {
    const worksheetRows = [
      [
        'Date',
        'Association code',
        'Payment type',
        'Action',
        'Status',
        'Source',
        'Amount set by association',
        'Amount adjusted',
        'Amount verified',
        'Reset',
        'Note'
      ],
      ...exportRows.map(row => [
        row.createdAtLabel,
        row.associationCode,
        row.paymentType,
        row.eventType,
        row.cancelledAt ? 'Cancelled' : 'Active',
        row.source,
        row.amountSubmitted ?? '',
        row.amountAdjusted ?? '',
        row.amountVerified ?? '',
        row.amountReset ?? '',
        row.cancelledAt
          ? [row.note, row.cancelledAtLabel ? `Cancelled ${row.cancelledAtLabel}` : '', row.cancellationReason]
              .filter(Boolean)
              .join(' | ')
          : row.note
      ]),
      [
        'Total',
        '',
        '',
        '',
        '',
        '',
        exportTotals.amountSubmitted,
        exportTotals.amountAdjusted,
        exportTotals.amountVerified,
        exportTotals.amountReset,
        `${exportTotals.transactionCount} transaction(s)`
      ]
    ]

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetRows)

    worksheet['!cols'] = [
      { wch: exportColumnWidths.createdAt },
      { wch: exportColumnWidths.associationCode },
      { wch: exportColumnWidths.paymentType },
      { wch: exportColumnWidths.eventType },
      { wch: 14 },
      { wch: exportColumnWidths.source },
      { wch: exportColumnWidths.amountSubmitted },
      { wch: exportColumnWidths.amountAdjusted },
      { wch: exportColumnWidths.amountVerified },
      { wch: exportColumnWidths.amountReset },
      { wch: exportColumnWidths.note }
    ]

    const workbook = XLSX.utils.book_new()

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Transaction History')
    XLSX.writeFile(workbook, `${fileNamePrefix}-${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  return (
    <div className='max-w-full min-w-0 space-y-4'>
      <div className='grid gap-3 sm:grid-cols-2 xl:grid-cols-5'>
        <SummaryStat label='Transactions' value={visibleTotals.transactionCount} />
        <SummaryStat
          label='Amount set by associations'
          value={currencyFormatter.format(visibleTotals.amountSubmitted)}
        />
        <SummaryStat label='Amount adjusted' value={currencyFormatter.format(visibleTotals.amountAdjusted)} />
        <SummaryStat label='Amount verified' value={currencyFormatter.format(visibleTotals.amountVerified)} />
        <SummaryStat label='Reset' value={currencyFormatter.format(visibleTotals.amountReset)} />
      </div>

      <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
        <form role='search' onSubmit={event => event.preventDefault()} className='min-w-0 flex-1'>
          <label htmlFor='transaction-history-search' className='sr-only'>
            Search transaction history
          </label>
          <Input
            id='transaction-history-search'
            value={search}
            onChange={event => handleSearchChange(event.target.value)}
            placeholder='Search code, type, action, or note'
            className='bg-background h-10 w-full text-sm font-semibold'
          />
        </form>
        <div className='flex flex-col gap-2 sm:flex-row sm:items-center'>
          <PrintButton label='Print PDF' size='sm' className='h-10' />
          <Button
            type='button'
            size='sm'
            className='h-10'
            onClick={() => exportRowsToExcel(sortedRows, visibleTotals, 'sagi-usa-transaction-history')}
            disabled={sortedRows.length === 0}
          >
            <Download />
            Export All
          </Button>
          <Button
            type='button'
            size='sm'
            className='h-10'
            onClick={() =>
              exportRowsToExcel(
                paginatedRows,
                currentPageTotals,
                `sagi-usa-transaction-history-page-${effectiveCurrentPage}`
              )
            }
            disabled={paginatedRows.length === 0}
          >
            <FileSpreadsheetIcon />
            Export Page
          </Button>
        </div>
      </div>

      <div className='border-border max-w-full min-w-0 overflow-hidden rounded-lg border'>
        <div className='hidden overflow-x-auto xl:block'>
          <Table className='table-fixed [&_td]:whitespace-nowrap [&_th]:whitespace-normal'>
            <colgroup>
              {columns.map(column => (
                <col key={column.key} style={getColumnStyle(column.key)} />
              ))}
              <col style={actionColumnStyle} />
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
                        className={`flex min-h-12 w-full items-center gap-1.5 text-left font-semibold ${column.align === 'right' ? 'justify-end text-right [&>span]:text-right' : 'justify-start'}`}
                        onClick={() => handleSort(column.key)}
                      >
                        <span>{column.label}</span>
                        {getSortIcon(isActive, sortDirection)}
                      </button>
                    </TableHead>
                  )
                })}
                <TableHead className='text-primary-foreground h-16 text-right' style={actionColumnStyle}>
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length + 1} className='text-muted-foreground h-24 text-center'>
                    {normalizedSearch
                      ? `No transaction history matching "${search.trim()}" found.`
                      : 'No transaction history found.'}
                  </TableCell>
                </TableRow>
              ) : (
                paginatedRows.map(row => (
                  <TableRow
                    key={row.id}
                    className={cn('odd:bg-muted/30 even:bg-background', row.cancelledAt && 'text-muted-foreground')}
                  >
                    <TableCell
                      title={row.createdAtLabel}
                      className='truncate text-xs font-semibold'
                      style={getColumnStyle('createdAt')}
                    >
                      {row.createdAtLabel}
                    </TableCell>
                    <TableCell
                      title={row.associationCode}
                      className='truncate font-extrabold'
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
                    <TableCell
                      title={`${row.eventType}${row.source ? ` - ${row.source}` : ''}`}
                      className='truncate text-sm font-semibold'
                      style={getColumnStyle('eventType')}
                    >
                      <Badge
                        variant='outline'
                        className={cn(
                          'w-full max-w-full justify-start truncate rounded-md capitalize',
                          getEventBadgeClassName(row.eventTypeKey)
                        )}
                      >
                        {row.eventType}
                      </Badge>
                    </TableCell>
                    <TableCell className='text-right' style={getColumnStyle('amountSubmitted')}>
                      <span className={getAmountClassName(row.amountSubmitted, Boolean(row.cancelledAt))}>
                        {formatAmount(row.amountSubmitted)}
                      </span>
                    </TableCell>
                    <TableCell className='text-right' style={getColumnStyle('amountAdjusted')}>
                      <span className={getAmountClassName(row.amountAdjusted, Boolean(row.cancelledAt))}>
                        {formatAmount(row.amountAdjusted)}
                      </span>
                    </TableCell>
                    <TableCell className='text-right' style={getColumnStyle('amountVerified')}>
                      <span className={getAmountClassName(row.amountVerified, Boolean(row.cancelledAt))}>
                        {formatAmount(row.amountVerified)}
                      </span>
                    </TableCell>
                    <TableCell className='text-right' style={getColumnStyle('amountReset')}>
                      <span className={getAmountClassName(row.amountReset, Boolean(row.cancelledAt))}>
                        {formatAmount(row.amountReset)}
                      </span>
                    </TableCell>
                    <TableCell
                      title={
                        row.cancelledAt
                          ? [
                              row.note,
                              row.cancelledAtLabel ? `Cancelled ${row.cancelledAtLabel}` : '',
                              row.cancellationReason
                            ]
                              .filter(Boolean)
                              .join(' | ') || '-'
                          : row.note || '-'
                      }
                      className='text-muted-foreground truncate text-xs'
                      style={getColumnStyle('note')}
                    >
                      {row.cancelledAt
                        ? [
                            row.note,
                            row.cancelledAtLabel ? `Cancelled ${row.cancelledAtLabel}` : '',
                            row.cancellationReason
                          ]
                            .filter(Boolean)
                            .join(' | ') || '-'
                        : row.note || '-'}
                    </TableCell>
                    <TableCell className='text-right' style={actionColumnStyle}>
                      <CancelTransactionEntryButton row={row} />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
            {sortedRows.length > 0 && (
              <TableFooter className='bg-white text-black dark:bg-white dark:text-black'>
                <TableRow className='bg-white text-base text-black hover:bg-white dark:bg-white dark:text-black dark:hover:bg-white'>
                  <TableCell className='font-extrabold' style={getColumnStyle('createdAt')}>
                    Total
                  </TableCell>
                  <TableCell style={getColumnStyle('associationCode')} />
                  <TableCell style={getColumnStyle('paymentType')} />
                  <TableCell className='font-semibold' style={getColumnStyle('eventType')}>
                    {visibleTotals.transactionCount} transaction(s)
                  </TableCell>
                  <TableCell className='text-right font-extrabold' style={getColumnStyle('amountSubmitted')}>
                    {currencyFormatter.format(visibleTotals.amountSubmitted)}
                  </TableCell>
                  <TableCell className='text-right font-extrabold' style={getColumnStyle('amountAdjusted')}>
                    {currencyFormatter.format(visibleTotals.amountAdjusted)}
                  </TableCell>
                  <TableCell className='text-right font-extrabold' style={getColumnStyle('amountVerified')}>
                    {currencyFormatter.format(visibleTotals.amountVerified)}
                  </TableCell>
                  <TableCell className='text-right font-extrabold' style={getColumnStyle('amountReset')}>
                    {currencyFormatter.format(visibleTotals.amountReset)}
                  </TableCell>
                  <TableCell style={getColumnStyle('note')} />
                  <TableCell style={actionColumnStyle} />
                </TableRow>
              </TableFooter>
            )}
          </Table>
        </div>

        <div className='grid gap-3 p-2 sm:p-3 xl:hidden'>
          {sortedRows.length === 0 ? (
            <div className='text-muted-foreground rounded-md border px-3 py-8 text-center text-sm sm:px-4 sm:py-10'>
              {normalizedSearch
                ? `No transaction history matching "${search.trim()}" found.`
                : 'No transaction history found.'}
            </div>
          ) : (
            paginatedRows.map(row => (
              <article
                key={row.id}
                className={cn(
                  'bg-background overflow-hidden rounded-md border shadow-sm',
                  row.cancelledAt && 'opacity-80'
                )}
              >
                <div className='flex flex-col gap-2 border-b px-3 py-3 sm:flex-row sm:items-start sm:justify-between sm:px-4'>
                  <div className='min-w-0'>
                    <div className='text-lg font-extrabold'>{row.associationCode}</div>
                  </div>
                  <div className='flex shrink-0 flex-col gap-2 text-left sm:items-end sm:text-right'>
                    <div className='text-muted-foreground text-xs font-semibold'>{row.createdAtLabel}</div>
                    <CancelTransactionEntryButton row={row} />
                  </div>
                </div>
                <div className='grid gap-2 px-3 py-3 text-sm sm:px-4'>
                  <MobileValue label='Status' value={<TransactionStatusBadge row={row} />} />
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
                    label='Action'
                    value={
                      <Badge
                        variant='outline'
                        className={cn('rounded-md capitalize', getEventBadgeClassName(row.eventTypeKey))}
                      >
                        {row.eventType}
                      </Badge>
                    }
                  />
                  <MobileValue label='Source' value={row.source} />
                  <MobileValue
                    label='Amount set by association'
                    value={formatAmount(row.amountSubmitted)}
                    valueClassName={getAmountClassName(row.amountSubmitted, Boolean(row.cancelledAt))}
                  />
                  <MobileValue
                    label='Amount adjusted'
                    value={formatAmount(row.amountAdjusted)}
                    valueClassName={getAmountClassName(row.amountAdjusted, Boolean(row.cancelledAt))}
                  />
                  <MobileValue
                    label='Amount verified'
                    value={formatAmount(row.amountVerified)}
                    valueClassName={getAmountClassName(row.amountVerified, Boolean(row.cancelledAt))}
                  />
                  <MobileValue
                    label='Reset'
                    value={formatAmount(row.amountReset)}
                    valueClassName={getAmountClassName(row.amountReset, Boolean(row.cancelledAt))}
                  />
                  {row.note ? (
                    <div className='border-t pt-3'>
                      <div className='text-muted-foreground text-xs font-semibold uppercase'>Note</div>
                      <div className='mt-1 text-sm font-semibold break-words'>{row.note}</div>
                    </div>
                  ) : null}
                  {row.cancelledAt ? (
                    <div className='border-t pt-3'>
                      <div className='text-muted-foreground text-xs font-semibold uppercase'>Cancellation</div>
                      <div className='mt-1 text-sm font-semibold break-words'>
                        {[row.cancelledAtLabel ? `Cancelled ${row.cancelledAtLabel}` : '', row.cancellationReason]
                          .filter(Boolean)
                          .join(' | ') || 'Cancelled'}
                      </div>
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
              Showing {showingStart}-{pageEndIndex} of {sortedRows.length} transaction(s)
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

export default AdminTransactionHistoryTable
