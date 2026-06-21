'use client'

import { useId, useMemo, useState } from 'react'

import { ArrowDown, ArrowUp, ArrowUpDown, CheckCircle2, Plus, RotateCcw } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table'
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

const getActionColumnWidthRem = (showSentAdjustment: boolean) => (showSentAdjustment ? 18 : 14)

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
  tableColumns.reduce(
    (totalWidth, column) => totalWidth + getColumnWidthRem(column),
    getActionColumnWidthRem(showSentAdjustment)
  ) + (balanceColumn ? getColumnWidthRem(balanceColumn) : 0)

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

const PaymentControls = ({
  adjustAction,
  resetAction,
  row,
  sentAdjustmentAction,
  showAdjustment,
  verifyAction
}: {
  adjustAction: (formData: FormData) => Promise<void>
  resetAction: (formData: FormData) => Promise<void>
  row: AdminPaymentRow
  sentAdjustmentAction?: (formData: FormData) => Promise<void>
  showAdjustment: boolean
  verifyAction: (formData: FormData) => Promise<void>
}) => {
  const balanceAmountInputId = useId()
  const sentAmountInputId = useId()
  const hasSubmittedPayment = row.amountSent > 0
  const showSentAdjustment = Boolean(sentAdjustmentAction)

  return (
    <div
      className={cn(
        'grid max-w-full min-w-0 gap-2 max-sm:w-full max-sm:grid-cols-1',
        showSentAdjustment ? 'w-72 grid-cols-3' : 'w-56',
        showAdjustment && !showSentAdjustment ? 'grid-cols-2' : !showSentAdjustment && 'grid-cols-1'
      )}
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
      {sentAdjustmentAction ? (
        <form action={sentAdjustmentAction} className='grid gap-1.5'>
          <input type='hidden' name='associationCode' value={row.associationCode} />
          <label htmlFor={sentAmountInputId} className='sr-only'>
            Contribution sent adjustment amount
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
      ) : null}
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
  const showSentAdjustment = kind === 'contribution' && Boolean(sentAdjustmentAction)
  const tableColumns = columns.filter(column => column.key !== 'balance')
  const actionColumnWidthRem = getActionColumnWidthRem(showSentAdjustment)
  const actionColumnClassName = showSentAdjustment ? 'w-72 min-w-72' : 'w-56 min-w-56'
  const tableWidthRem = getTableWidthRem(tableColumns, showSentAdjustment, balanceColumn)
  const [sortKey, setSortKey] = useState<SortKey>('associationCode')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')

  const sortedRows = useMemo(() => {
    return [...rows].sort((firstRow, secondRow) => {
      const comparison = compareValues(firstRow[sortKey], secondRow[sortKey])

      return sortDirection === 'asc' ? comparison : -comparison
    })
  }, [rows, sortDirection, sortKey])

  const handleSort = (nextSortKey: SortKey) => {
    if (nextSortKey === sortKey) {
      setSortDirection(currentDirection => (currentDirection === 'asc' ? 'desc' : 'asc'))

      return
    }

    setSortKey(nextSortKey)
    setSortDirection('asc')
  }

  return (
    <div className='border-border w-full max-w-full min-w-0 overflow-hidden rounded-lg border'>
      <div className='hidden w-full min-w-0 overflow-x-auto lg:block'>
        <Table
          className='table-fixed text-xs [&_td]:whitespace-normal [&_th]:whitespace-normal'
          style={{
            minWidth: `${tableWidthRem}rem`,
            width: '100%'
          }}
        >
          <colgroup>
            {tableColumns.map(column => (
              <col key={column.key} style={{ width: `${getColumnWidthRem(column)}rem` }} />
            ))}
            <col style={{ width: `${actionColumnWidthRem}rem` }} />
            {balanceColumn ? <col style={{ width: `${getColumnWidthRem(balanceColumn)}rem` }} /> : null}
          </colgroup>
          <TableHeader>
            <TableRow className='bg-primary hover:bg-primary'>
              {tableColumns.map(column => {
                const isActive = sortKey === column.key

                return (
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
                )
              })}
              <TableHead className={cn('text-primary-foreground h-14 px-2 text-center', actionColumnClassName)}>
                Actions
              </TableHead>
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
                <TableCell colSpan={columns.length + 1} className='text-muted-foreground h-24 text-center'>
                  No payment records found.
                </TableCell>
              </TableRow>
            ) : (
              sortedRows.map(row => (
                <TableRow key={row.associationCode} className='odd:bg-muted/30 even:bg-background h-[5.875rem]'>
                  {tableColumns.map(column => (
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
                  ))}
                  <TableCell className={cn('px-2 py-3', actionColumnClassName)}>
                    <PaymentControls
                      adjustAction={adjustAction}
                      row={row}
                      verifyAction={verifyAction}
                      resetAction={resetAction}
                      sentAdjustmentAction={showSentAdjustment ? sentAdjustmentAction : undefined}
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
                      : column.key in totals && typeof totals[column.key as keyof AdminPaymentTotals] === 'number'
                        ? column.format === 'currency'
                          ? currencyFormatter.format(Number(totals[column.key as keyof AdminPaymentTotals]))
                          : Number(totals[column.key as keyof AdminPaymentTotals]).toLocaleString('en-US')
                        : ''}
                  </TableCell>
                ))}
                <TableCell className={actionColumnClassName} />
                {balanceColumn ? (
                  <TableCell className='w-40 min-w-40 px-2 py-3 text-right align-middle'>
                    <BalanceCard balance={totals.balance} className='h-[4.375rem] w-full justify-center' />
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
          sortedRows.map(row => (
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
                  sentAdjustmentAction={showSentAdjustment ? sentAdjustmentAction : undefined}
                  showAdjustment={showAdjustment}
                />
              </div>
              <div className='grid min-w-0 gap-2 px-4 py-3 text-sm'>
                {tableColumns
                  .filter(column => !['associationName', 'associationCode'].includes(column.key))
                  .map(column => (
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
    </div>
  )
}

export default AdminPaymentsTable
