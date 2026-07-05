'use client'

import { Fragment, useId, useMemo, useState } from 'react'

import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  CheckCircle2,
  ChevronLeftIcon,
  ChevronRightIcon,
  FileSpreadsheetIcon,
  Plus,
  RotateCcw,
  SearchIcon,
  XIcon
} from 'lucide-react'
import * as XLSX from 'xlsx'

import { Button } from '@/components/ui/button'
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

export type AdminPaymentRow = {
  amountExpected?: number
  amountSent: number
  amountVerified: number
  associationCode: string
  associationName: string
  awaitingPublication?: number
  balance: number
  pendingMembers?: number
  vestedMembers: number
}

export type AdminPaymentTotals = {
  amountExpected?: number
  amountSent: number
  amountVerified: number
  awaitingPublication?: number
  balance: number
  pendingMembers?: number
  vestedMembers: number
}

type SortKey = keyof AdminPaymentRow
type SortDirection = 'asc' | 'desc'
type PaymentKind = 'contribution' | 'registration'

type AdminPaymentColumn = {
  key: SortKey
  label: string
  align?: 'left' | 'right'
  format?: 'currency' | 'date' | 'number' | 'text'
}

type AdminPaymentsTableProps = {
  adjustAction: (formData: FormData) => Promise<void>
  kind: PaymentKind
  rows: AdminPaymentRow[]
  sentAdjustmentAction?: (formData: FormData) => Promise<void>
  totals: AdminPaymentTotals
  verifyAction: (formData: FormData) => Promise<void>
  resetAction: (formData: FormData) => Promise<void>
}

const contributionColumns: AdminPaymentColumn[] = [
  { key: 'associationName', label: 'Association' },
  { key: 'associationCode', label: 'Code' },
  { key: 'vestedMembers', label: 'Vested', align: 'right', format: 'number' },
  { key: 'amountExpected', label: 'Contribution Dues', align: 'right', format: 'currency' },
  { key: 'amountSent', label: 'Contribution Sent', align: 'right', format: 'currency' },
  { key: 'amountVerified', label: 'Verified', align: 'right', format: 'currency' },
  { key: 'balance', label: 'Contribution Balance', align: 'right', format: 'currency' }
]

const registrationColumns: AdminPaymentColumn[] = [
  { key: 'associationCode', label: 'Code' },
  { key: 'vestedMembers', label: 'Vested', align: 'right', format: 'number' },
  { key: 'awaitingPublication', label: 'Awaiting', align: 'right', format: 'number' },
  { key: 'pendingMembers', label: 'Pending', align: 'right', format: 'number' },
  { key: 'amountExpected', label: 'Registration Dues', align: 'right', format: 'currency' },
  { key: 'amountSent', label: 'Registration Sent', align: 'right', format: 'currency' },
  { key: 'amountVerified', label: 'Registration Verified', align: 'right', format: 'currency' },
  { key: 'balance', label: 'Balance', align: 'right', format: 'currency' }
]

const getColumns = (kind: PaymentKind) => (kind === 'contribution' ? contributionColumns : registrationColumns)

const getExportColumns = (kind: PaymentKind) => {
  const columns = getColumns(kind)

  if (kind === 'registration') {
    return [{ key: 'associationName', label: 'Association' } satisfies AdminPaymentColumn, ...columns]
  }

  return columns
}

const actionColumnWidthRem = 14
const sentAdjustmentColumnWidthRem = 9
const defaultPaymentRowsPerPage = 10
const paymentRowsPerPageOptions = [10, 25, 50, 100]

const columnWidthRemByKey: Record<SortKey, number> = {
  amountExpected: 9,
  amountSent: 9,
  amountVerified: 9,
  associationCode: 5,
  associationName: 16,
  awaitingPublication: 6,
  balance: 10,
  pendingMembers: 6,
  vestedMembers: 6
}

const getColumnSizeClassName = (column: AdminPaymentColumn) => {
  if (column.key === 'associationName') return 'w-64 min-w-64'
  if (column.key === 'associationCode') return 'w-20 min-w-20'
  if (['vestedMembers', 'awaitingPublication', 'pendingMembers'].includes(column.key)) return 'w-24 min-w-24'
  if (['amountExpected', 'amountSent', 'amountVerified'].includes(column.key)) return 'w-36 min-w-36'

  return ''
}

const getColumnWidthRem = (column: AdminPaymentColumn) => columnWidthRemByKey[column.key]

const getTableWidthRem = (
  tableColumns: AdminPaymentColumn[],
  showSentAdjustment: boolean,
  balanceColumn?: AdminPaymentColumn
) =>
  tableColumns.reduce((totalWidth, column) => totalWidth + getColumnWidthRem(column), actionColumnWidthRem) +
  (showSentAdjustment ? sentAdjustmentColumnWidthRem : 0) +
  (balanceColumn ? getColumnWidthRem(balanceColumn) : 0)

const shouldRenderSentAdjustmentBeforeColumn = (column: AdminPaymentColumn, showSentAdjustment: boolean) =>
  showSentAdjustment && column.key === 'amountSent'

const getSortIcon = (isActive: boolean, direction: SortDirection) => {
  if (!isActive) return <ArrowUpDown className='size-3.5' />

  return direction === 'asc' ? <ArrowUp className='size-3.5' /> : <ArrowDown className='size-3.5' />
}

const compareValues = (firstValue: AdminPaymentRow[SortKey], secondValue: AdminPaymentRow[SortKey]) => {
  if (typeof firstValue === 'number' && typeof secondValue === 'number') return firstValue - secondValue

  return String(firstValue ?? '').localeCompare(String(secondValue ?? ''), undefined, {
    numeric: true,
    sensitivity: 'base'
  })
}

const formatValue = (row: AdminPaymentRow, column: AdminPaymentColumn) => {
  const value = row[column.key]

  if (column.key === 'associationName') return String(value ?? '').trim() || row.associationCode
  if (column.format === 'currency') return currencyFormatter.format(Number(value ?? 0))
  if (column.format === 'number') return Number(value ?? 0).toLocaleString('en-US')

  return String(value ?? '')
}

const getRawExportValue = (row: AdminPaymentRow, column: AdminPaymentColumn) => {
  const value = row[column.key]

  if (column.key === 'associationName') return String(value ?? '').trim() || row.associationCode
  if (column.format === 'currency' || column.format === 'number') return Number(value ?? 0)

  return String(value ?? '')
}

const getSearchablePaymentRowText = (row: AdminPaymentRow) =>
  [row.associationName, row.associationCode].join(' ').toLowerCase()

const filterPaymentRows = (rows: AdminPaymentRow[], searchQuery: string) => {
  const searchTerms = searchQuery.trim().toLowerCase().split(/\s+/).filter(Boolean)

  if (searchTerms.length === 0) return rows

  return rows.filter(row => {
    const searchableText = getSearchablePaymentRowText(row)

    return searchTerms.every(term => searchableText.includes(term))
  })
}

const getPaymentTotals = (rows: AdminPaymentRow[]): AdminPaymentTotals =>
  rows.reduce(
    (currentTotals, row) => ({
      amountExpected: (currentTotals.amountExpected ?? 0) + (row.amountExpected ?? 0),
      amountSent: currentTotals.amountSent + row.amountSent,
      amountVerified: currentTotals.amountVerified + row.amountVerified,
      awaitingPublication: (currentTotals.awaitingPublication ?? 0) + (row.awaitingPublication ?? 0),
      balance: currentTotals.balance + row.balance,
      pendingMembers: (currentTotals.pendingMembers ?? 0) + (row.pendingMembers ?? 0),
      vestedMembers: currentTotals.vestedMembers + row.vestedMembers
    }),
    {
      amountExpected: 0,
      amountSent: 0,
      amountVerified: 0,
      awaitingPublication: 0,
      balance: 0,
      pendingMembers: 0,
      vestedMembers: 0
    }
  )

const getValueClassName = (row: AdminPaymentRow, column: AdminPaymentColumn) => {
  if (column.key === 'amountSent' && row.amountSent > 0) return 'text-green-700 dark:text-green-300'
  if (column.key === 'amountVerified' && row.amountVerified > 0) return 'text-blue-700 dark:text-blue-300'
  if (column.key === 'vestedMembers') return 'text-green-600 dark:text-green-400'
  if (column.key === 'awaitingPublication') return 'text-blue-600 dark:text-blue-400'
  if (column.key === 'pendingMembers') return 'text-amber-600 dark:text-amber-400'

  return ''
}

const getBalanceCardClassName = (balance: number) =>
  balance >= 0
    ? 'border-green-200 bg-green-50 text-green-800 dark:border-green-800/70 dark:bg-green-950/40 dark:text-green-200'
    : 'border-red-200 bg-red-50 text-red-800 dark:border-red-800/70 dark:bg-red-950/40 dark:text-red-200'

const BalanceCard = ({ balance, className }: { balance: number; className?: string }) => (
  <div
    className={cn(
      'inline-flex min-w-28 items-center justify-end rounded-md border px-3 py-2 text-base font-black tabular-nums shadow-sm',
      getBalanceCardClassName(balance),
      className
    )}
  >
    {currencyFormatter.format(balance)}
  </div>
)

const PaymentSentAdjustmentForm = ({
  action,
  className,
  kind,
  row
}: {
  action: (formData: FormData) => Promise<void>
  className?: string
  kind: PaymentKind
  row: AdminPaymentRow
}) => {
  const sentAmountInputId = useId()
  const paymentLabel = kind === 'contribution' ? 'Contribution' : 'Registration'

  return (
    <form action={action} className={cn('grid min-w-0 gap-1.5', className)}>
      <input type='hidden' name='associationCode' value={row.associationCode} />
      <label htmlFor={sentAmountInputId} className='sr-only'>
        {paymentLabel} sent adjustment amount
      </label>
      <Input
        id={sentAmountInputId}
        name='sentAmount'
        type='number'
        inputMode='decimal'
        step='0.01'
        placeholder='+/- 0.00'
        className='h-8 px-2 text-xs'
        required
      />
      <Button type='submit' size='xs' variant='outline' className='h-8 w-full px-2'>
        <Plus className='size-3' />
        Sent
      </Button>
    </form>
  )
}

const PaymentControls = ({
  adjustAction,
  resetAction,
  row,
  showAdjustment,
  verifyAction
}: {
  adjustAction: (formData: FormData) => Promise<void>
  resetAction: (formData: FormData) => Promise<void>
  row: AdminPaymentRow
  showAdjustment: boolean
  verifyAction: (formData: FormData) => Promise<void>
}) => {
  const balanceAmountInputId = useId()
  const hasSubmittedPayment = row.amountSent > 0

  return (
    <div
      className={cn('grid w-56 max-w-full min-w-0 gap-2 max-sm:w-full', showAdjustment ? 'grid-cols-2' : 'grid-cols-1')}
    >
      <div className='grid gap-1.5'>
        <form action={verifyAction}>
          <input type='hidden' name='associationCode' value={row.associationCode} />
          <Button type='submit' size='xs' variant='outline' disabled={!hasSubmittedPayment} className='h-8 w-full px-2'>
            <CheckCircle2 className='size-3' />
            Verify
          </Button>
        </form>
        <form action={resetAction}>
          <input type='hidden' name='associationCode' value={row.associationCode} />
          <Button
            type='submit'
            size='xs'
            variant='destructive'
            disabled={!hasSubmittedPayment}
            className='h-8 w-full px-2'
          >
            <RotateCcw className='size-3' />
            Reset
          </Button>
        </form>
      </div>
      {showAdjustment ? (
        <form action={adjustAction} className='grid gap-1.5'>
          <input type='hidden' name='associationCode' value={row.associationCode} />
          <label htmlFor={balanceAmountInputId} className='sr-only'>
            Balance adjustment amount
          </label>
          <Input
            id={balanceAmountInputId}
            name='balanceAmount'
            type='number'
            inputMode='decimal'
            step='0.01'
            placeholder='+/- 0.00'
            className='h-8 px-2 text-xs'
            required
          />
          <Button type='submit' size='xs' variant='secondary' className='h-8 w-full px-2'>
            <Plus className='size-3' />
            Add
          </Button>
        </form>
      ) : null}
    </div>
  )
}

const AdminPaymentsTable = ({
  adjustAction,
  kind,
  resetAction,
  rows,
  sentAdjustmentAction,
  totals,
  verifyAction
}: AdminPaymentsTableProps) => {
  const columns = getColumns(kind)
  const balanceColumn = columns.find(column => column.key === 'balance')
  const showAdjustment = true
  const showSentAdjustment = Boolean(sentAdjustmentAction)
  const tableColumns = columns.filter(column => column.key !== 'balance')
  const tableWidthRem = getTableWidthRem(tableColumns, showSentAdjustment, balanceColumn)
  const [sortKey, setSortKey] = useState<SortKey>('associationCode')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(defaultPaymentRowsPerPage)
  const searchInputId = useId()
  const rowsPerPageSelectId = useId()

  const filteredRows = useMemo(() => filterPaymentRows(rows, searchQuery), [rows, searchQuery])

  const sortedRows = useMemo(() => {
    return [...filteredRows].sort((firstRow, secondRow) => {
      const comparison = compareValues(firstRow[sortKey], secondRow[sortKey])

      return sortDirection === 'asc' ? comparison : -comparison
    })
  }, [filteredRows, sortDirection, sortKey])

  const displayedTotals = useMemo(
    () => (searchQuery.trim() ? getPaymentTotals(sortedRows) : totals),
    [searchQuery, sortedRows, totals]
  )

  const totalPages = Math.max(1, Math.ceil(sortedRows.length / rowsPerPage))
  const activePage = Math.min(currentPage, totalPages)

  const paginatedRows = useMemo(() => {
    const startIndex = (activePage - 1) * rowsPerPage

    return sortedRows.slice(startIndex, startIndex + rowsPerPage)
  }, [activePage, rowsPerPage, sortedRows])

  const { pages, showLeftEllipsis, showRightEllipsis } = usePagination({
    currentPage: activePage,
    totalPages,
    paginationItemsToDisplay: 3
  })

  const searchLabel = kind === 'contribution' ? 'contribution payments' : 'registration payments'

  const exportTableToExcel = () => {
    const exportColumns = getExportColumns(kind)
    const exportTotals = getPaymentTotals(sortedRows)

    const worksheetData = [
      exportColumns.map(column => column.label),
      ...sortedRows.map(row => exportColumns.map(column => getRawExportValue(row, column))),
      exportColumns.map((column, index) => {
        if (index === 0) return 'Total'

        if (column.key in exportTotals && typeof exportTotals[column.key as keyof AdminPaymentTotals] === 'number') {
          return Number(exportTotals[column.key as keyof AdminPaymentTotals])
        }

        return ''
      })
    ]

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData)

    worksheet['!cols'] = exportColumns.map(column => ({
      wch: column.key === 'associationName' ? 34 : column.format === 'currency' ? 18 : 14
    }))

    const workbook = XLSX.utils.book_new()
    const worksheetName = kind === 'contribution' ? 'Contribution Payments' : 'Registration Payments'
    const filePrefix = kind === 'contribution' ? 'admin-contribution-payments' : 'admin-registration-payments'

    XLSX.utils.book_append_sheet(workbook, worksheet, worksheetName)
    XLSX.writeFile(workbook, `${filePrefix}-${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  const handleSort = (nextSortKey: SortKey) => {
    if (nextSortKey === sortKey) {
      setSortDirection(currentDirection => (currentDirection === 'asc' ? 'desc' : 'asc'))

      return
    }

    setSortKey(nextSortKey)
    setSortDirection('asc')
  }

  const handleRowsPerPageChange = (value: string) => {
    setRowsPerPage(Number(value))
    setCurrentPage(1)
  }

  return (
    <div className='border-border w-full max-w-full min-w-0 overflow-hidden rounded-lg border'>
      <div className='flex flex-col gap-3 border-b p-3 sm:flex-row sm:items-center sm:justify-between print:hidden'>
        <form
          role='search'
          className='w-full max-w-md'
          onSubmit={event => {
            event.preventDefault()
          }}
        >
          <label htmlFor={searchInputId} className='sr-only'>
            Search {searchLabel}
          </label>
          <div className='relative'>
            <Input
              id={searchInputId}
              type='text'
              value={searchQuery}
              onChange={event => {
                setSearchQuery(event.target.value)
                setCurrentPage(1)
              }}
              placeholder='Search association or code'
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
                aria-label={`Clear ${searchLabel} search`}
              >
                <XIcon className='size-3.5' />
              </Button>
            ) : null}
          </div>
        </form>
        <div className='flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center'>
          <div className='flex items-center justify-between gap-2 sm:justify-start'>
            <label htmlFor={rowsPerPageSelectId} className='text-muted-foreground text-sm font-medium whitespace-nowrap'>
              Rows
            </label>
            <Select value={String(rowsPerPage)} onValueChange={handleRowsPerPageChange}>
              <SelectTrigger id={rowsPerPageSelectId} size='sm' className='w-24'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent align='end'>
                {paymentRowsPerPageOptions.map(option => (
                  <SelectItem key={option} value={String(option)}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            type='button'
            size='sm'
            onClick={exportTableToExcel}
            disabled={sortedRows.length === 0}
            className='w-full sm:w-auto'
          >
            <FileSpreadsheetIcon />
            Export File
          </Button>
        </div>
      </div>
      <div className='hidden w-full min-w-0 overflow-x-auto lg:block'>
        <Table
          className='table-fixed text-xs [&_td]:whitespace-normal [&_th]:whitespace-normal'
          style={{
            minWidth: `${tableWidthRem}rem`,
            width: '100%'
          }}
        >
          <colgroup>
            {tableColumns.flatMap(column => [
              ...(shouldRenderSentAdjustmentBeforeColumn(column, showSentAdjustment)
                ? [<col key='sentAdjustment' style={{ width: `${sentAdjustmentColumnWidthRem}rem` }} />]
                : []),
              <col key={column.key} style={{ width: `${getColumnWidthRem(column)}rem` }} />
            ])}
            <col style={{ width: `${actionColumnWidthRem}rem` }} />
            {balanceColumn ? <col style={{ width: `${getColumnWidthRem(balanceColumn)}rem` }} /> : null}
          </colgroup>
          <TableHeader>
            <TableRow className='bg-primary hover:bg-primary'>
              {tableColumns.map(column => {
                const isActive = sortKey === column.key

                return (
                  <Fragment key={column.key}>
                    {shouldRenderSentAdjustmentBeforeColumn(column, showSentAdjustment) ? (
                      <TableHead
                        key='sentAdjustment'
                        className='text-primary-foreground h-14 w-36 min-w-36 px-2 text-center'
                      >
                        Adjust Sent
                      </TableHead>
                    ) : null}
                    <TableHead
                      key={column.key}
                      aria-sort={isActive ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
                      className={cn(
                        'text-primary-foreground h-14 px-2',
                        getColumnSizeClassName(column),
                        column.align === 'right' && 'text-right'
                      )}
                    >
                      <button
                        type='button'
                        className={cn(
                          'flex min-h-10 w-full items-center gap-1.5 text-left font-semibold',
                          column.align === 'right' ? 'justify-end text-right' : 'justify-start'
                        )}
                        onClick={() => handleSort(column.key)}
                      >
                        <span>{column.label}</span>
                        {getSortIcon(isActive, sortDirection)}
                      </button>
                    </TableHead>
                  </Fragment>
                )
              })}
              <TableHead className='text-primary-foreground h-14 w-56 min-w-56 px-2 text-center'>Actions</TableHead>
              {balanceColumn ? (
                <TableHead
                  aria-sort={
                    sortKey === balanceColumn.key ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'
                  }
                  className='text-primary-foreground h-14 w-40 min-w-40 px-2 text-right'
                >
                  <button
                    type='button'
                    className='flex min-h-10 w-full items-center justify-end gap-1.5 text-right font-semibold'
                    onClick={() => handleSort(balanceColumn.key)}
                  >
                    <span>{balanceColumn.label}</span>
                    {getSortIcon(sortKey === balanceColumn.key, sortDirection)}
                  </button>
                </TableHead>
              ) : null}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedRows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + 1 + (showSentAdjustment ? 1 : 0)}
                  className='text-muted-foreground h-24 text-center'
                >
                  No payment records found.
                </TableCell>
              </TableRow>
            ) : (
              paginatedRows.map(row => (
                <TableRow key={row.associationCode} className='odd:bg-muted/30 even:bg-background h-[5.875rem]'>
                  {tableColumns.map(column => (
                    <Fragment key={column.key}>
                      {shouldRenderSentAdjustmentBeforeColumn(column, showSentAdjustment) && sentAdjustmentAction ? (
                        <TableCell key='sentAdjustment' className='w-36 min-w-36 px-2 py-3 align-middle'>
                          <PaymentSentAdjustmentForm action={sentAdjustmentAction} kind={kind} row={row} />
                        </TableCell>
                      ) : null}
                      <TableCell
                        key={column.key}
                        className={cn(
                          'px-2 py-4 font-semibold',
                          getColumnSizeClassName(column),
                          column.key === 'associationName' && 'text-foreground text-sm font-bold',
                          column.align === 'right' && 'text-right text-sm tabular-nums',
                          getValueClassName(row, column)
                        )}
                      >
                        {formatValue(row, column)}
                      </TableCell>
                    </Fragment>
                  ))}
                  <TableCell className='w-56 min-w-56 px-2 py-3'>
                    <PaymentControls
                      adjustAction={adjustAction}
                      row={row}
                      verifyAction={verifyAction}
                      resetAction={resetAction}
                      showAdjustment={showAdjustment}
                    />
                  </TableCell>
                  {balanceColumn ? (
                    <TableCell className='w-40 min-w-40 px-2 py-3 text-right align-middle'>
                      <BalanceCard balance={row.balance} className='h-[4.375rem] w-full justify-center' />
                    </TableCell>
                  ) : null}
                </TableRow>
              ))
            )}
          </TableBody>
          {sortedRows.length > 0 && (
            <TableFooter>
              <TableRow className='bg-primary/10 h-[5.875rem] text-sm font-black'>
                {tableColumns.map(column => (
                  <Fragment key={column.key}>
                    {shouldRenderSentAdjustmentBeforeColumn(column, showSentAdjustment) ? (
                      <TableCell key='sentAdjustment' className='w-36 min-w-36' />
                    ) : null}
                    <TableCell
                      key={column.key}
                      className={cn(
                        'px-2 py-4',
                        getColumnSizeClassName(column),
                        column.align === 'right' && 'text-right text-base tabular-nums'
                      )}
                    >
                      {column.key === 'associationCode'
                        ? 'Total'
                        : column.key in displayedTotals &&
                            typeof displayedTotals[column.key as keyof AdminPaymentTotals] === 'number'
                          ? column.format === 'currency'
                            ? currencyFormatter.format(Number(displayedTotals[column.key as keyof AdminPaymentTotals]))
                            : Number(displayedTotals[column.key as keyof AdminPaymentTotals]).toLocaleString('en-US')
                          : ''}
                    </TableCell>
                  </Fragment>
                ))}
                <TableCell className='w-56 min-w-56' />
                {balanceColumn ? (
                  <TableCell className='w-40 min-w-40 px-2 py-3 text-right align-middle'>
                    <BalanceCard balance={displayedTotals.balance} className='h-[4.375rem] w-full justify-center' />
                  </TableCell>
                ) : null}
              </TableRow>
            </TableFooter>
          )}
        </Table>
      </div>

      <div className='grid w-full min-w-0 gap-3 p-3 lg:hidden'>
        {sortedRows.length === 0 ? (
          <div className='text-muted-foreground rounded-md border px-4 py-10 text-center text-sm'>
            No payment records found.
          </div>
        ) : (
          paginatedRows.map(row => (
            <article
              key={row.associationCode}
              className='bg-background w-full max-w-full min-w-0 overflow-hidden rounded-md border shadow-sm'
            >
              <div className='flex min-w-0 flex-col gap-3 border-b px-4 py-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4'>
                <div className='min-w-0'>
                  <h2 className='font-extrabold break-words'>{row.associationName}</h2>
                  <p className='text-muted-foreground text-xs break-words'>{row.associationCode}</p>
                </div>
                <PaymentControls
                  adjustAction={adjustAction}
                  row={row}
                  verifyAction={verifyAction}
                  resetAction={resetAction}
                  showAdjustment={showAdjustment}
                />
              </div>
              <div className='grid min-w-0 gap-2 px-4 py-3 text-sm'>
                {tableColumns
                  .filter(column => !['associationName', 'associationCode'].includes(column.key))
                  .map(column => (
                    <Fragment key={column.key}>
                      {shouldRenderSentAdjustmentBeforeColumn(column, showSentAdjustment) && sentAdjustmentAction ? (
                        <div key='sentAdjustment' className='grid min-w-0 gap-2 border-t pt-3'>
                          <span className='text-muted-foreground min-w-0 text-xs font-semibold break-words uppercase'>
                            Adjust Sent
                          </span>
                          <PaymentSentAdjustmentForm action={sentAdjustmentAction} kind={kind} row={row} />
                        </div>
                      ) : null}
                      <div key={column.key} className='grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-start gap-4'>
                        <span className='text-muted-foreground min-w-0 text-xs font-semibold break-words uppercase'>
                          {column.label}
                        </span>
                        <span
                          className={cn(
                            'min-w-0 text-right font-extrabold tabular-nums',
                            column.align === 'right' && 'text-base',
                            getValueClassName(row, column)
                          )}
                        >
                          {formatValue(row, column)}
                        </span>
                      </div>
                    </Fragment>
                  ))}
                {balanceColumn ? (
                  <div className='grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-start gap-4 border-t pt-3'>
                    <span className='text-muted-foreground min-w-0 text-xs font-semibold break-words uppercase'>
                      {balanceColumn.label}
                    </span>
                    <BalanceCard balance={row.balance} className='max-w-full min-w-0' />
                  </div>
                ) : null}
              </div>
            </article>
          ))
        )}
      </div>
      {sortedRows.length > 0 ? (
        <div className='flex flex-col items-center justify-between gap-3 border-t p-3 sm:flex-row print:hidden'>
          <p className='text-muted-foreground text-sm' aria-live='polite'>
            Showing {(activePage - 1) * rowsPerPage + 1}-{Math.min(activePage * rowsPerPage, sortedRows.length)} of{' '}
            {sortedRows.length}
          </p>
          {totalPages > 1 ? (
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
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

export default AdminPaymentsTable
