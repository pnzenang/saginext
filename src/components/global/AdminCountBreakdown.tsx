'use client'

import { useId, useMemo, useState } from 'react'

import { ArrowUpDown, ChevronDown, ChevronUp, Eye, SearchIcon, XIcon } from 'lucide-react'
import Link from 'next/link'

import AdminCountExcelButton from '@/components/global/AdminCountExcelButton'
import PaginationControls from '@/components/global/PaginationControls'
import PrintButton from '@/components/global/PrintButton'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { usePagination } from '@/hooks/use-pagination'
import { cn } from '@/lib/utils'

export type AdminCountRow = {
  associationCode: string
  associationName: string
  vested: number
  monthlyAddition: number
  pending: number
  awaitingPublication: number
  notInGoodStanding: number
  total: number
}

export type AdminCountTotals = {
  vested: number
  monthlyAddition: number
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

const defaultCountRowsPerPage = 10
const countRowsPerPageOptions = [10, 25, 50, 100]
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
  { key: 'monthlyAddition', label: 'Monthly Addition', tableLabel: 'Monthly Add.', align: 'right' },
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

const getSearchableCountRowText = (row: AdminCountRow) =>
  [row.associationName, row.associationCode].join(' ').toLowerCase()

const filterCountRows = (counts: AdminCountRow[], searchQuery: string) => {
  const searchTerms = searchQuery.trim().toLowerCase().split(/\s+/).filter(Boolean)

  if (searchTerms.length === 0) return counts

  return counts.filter(row => {
    const searchableText = getSearchableCountRowText(row)

    return searchTerms.every(term => searchableText.includes(term))
  })
}

const getCountTotals = (counts: AdminCountRow[]): AdminCountTotals =>
  counts.reduce(
    (acc, item) => ({
      vested: acc.vested + item.vested,
      monthlyAddition: acc.monthlyAddition + item.monthlyAddition,
      pending: acc.pending + item.pending,
      awaitingPublication: acc.awaitingPublication + item.awaitingPublication,
      notInGoodStanding: acc.notInGoodStanding + item.notInGoodStanding,
      total: acc.total + item.total
    }),
    {
      vested: 0,
      monthlyAddition: 0,
      pending: 0,
      awaitingPublication: 0,
      notInGoodStanding: 0,
      total: 0
    }
  )

const SortIcon = ({ active, direction }: { active: boolean; direction: SortDirection }) => {
  if (!active) return <ArrowUpDown className='size-3.5 opacity-70 print:hidden' aria-hidden='true' />

  if (direction === 'asc') return <ChevronUp className='size-3.5 opacity-80 print:hidden' aria-hidden='true' />

  return <ChevronDown className='size-3.5 opacity-80 print:hidden' aria-hidden='true' />
}

const AdminCountBreakdown = ({ counts, totals }: AdminCountBreakdownProps) => {
  const [sort, setSort] = useState<SortState>({ key: 'associationCode', direction: 'asc' })
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(defaultCountRowsPerPage)
  const searchInputId = useId()
  const rowsPerPageSelectId = useId()

  const filteredCounts = useMemo(() => filterCountRows(counts, searchQuery), [counts, searchQuery])

  const sortedCounts = useMemo(() => {
    const directionMultiplier = sort.direction === 'asc' ? 1 : -1

    return [...filteredCounts].sort((left, right) => {
      const primarySort = compareValues(left, right, sort.key) * directionMultiplier

      if (primarySort !== 0) return primarySort

      const nameSort = compareValues(left, right, 'associationName')

      if (nameSort !== 0) return nameSort

      return compareValues(left, right, 'associationCode')
    })
  }, [filteredCounts, sort])

  const displayedTotals = useMemo(
    () => (searchQuery.trim() ? getCountTotals(sortedCounts) : totals),
    [searchQuery, sortedCounts, totals]
  )

  const totalPages = Math.max(1, Math.ceil(sortedCounts.length / rowsPerPage))
  const activePage = Math.min(currentPage, totalPages)

  const paginatedCounts = useMemo(() => {
    const startIndex = (activePage - 1) * rowsPerPage

    return sortedCounts.slice(startIndex, startIndex + rowsPerPage)
  }, [activePage, rowsPerPage, sortedCounts])

  const currentPageTotals = useMemo(() => getCountTotals(paginatedCounts), [paginatedCounts])

  const { pages, showLeftEllipsis, showRightEllipsis } = usePagination({
    currentPage: activePage,
    paginationItemsToDisplay: 3,
    totalPages
  })

  const handleSort = (key: SortKey) => {
    setSort(currentSort => ({
      key,
      direction: getNextDirection(currentSort, key)
    }))
  }

  const handleRowsPerPageChange = (value: string) => {
    setRowsPerPage(Number(value))
    setCurrentPage(1)
  }

  return (
    <>
      <div className='mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between print:hidden'>
        <form
          role='search'
          className='w-full max-w-md'
          onSubmit={event => {
            event.preventDefault()
          }}
        >
          <label htmlFor={searchInputId} className='sr-only'>
            Search member counts
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
                aria-label='Clear member counts search'
              >
                <XIcon className='size-3.5' />
              </Button>
            ) : null}
          </div>
        </form>
        <div className='flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center'>
          <div className='flex items-center justify-between gap-2 sm:justify-start'>
            <label
              htmlFor={rowsPerPageSelectId}
              className='text-muted-foreground text-sm font-medium whitespace-nowrap'
            >
              Rows
            </label>
            <Select value={String(rowsPerPage)} onValueChange={handleRowsPerPageChange}>
              <SelectTrigger id={rowsPerPageSelectId} size='sm' className='w-24'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent align='end'>
                {countRowsPerPageOptions.map(option => (
                  <SelectItem key={option} value={String(option)}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className='flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center'>
            <PrintButton label='Print PDF' />
            <AdminCountExcelButton counts={paginatedCounts} totals={currentPageTotals} />
          </div>
        </div>
      </div>

      <Card className='print:border-0 print:shadow-none'>
        <CardHeader>
          <CardTitle>Association Breakdown</CardTitle>
        </CardHeader>
        <CardContent className='px-2 sm:px-6'>
          <div className='lg:hidden print:hidden'>
            {sortedCounts.length > 0 ? (
              <div className='divide-border overflow-hidden rounded-md border'>
                {paginatedCounts.map(item => (
                  <div key={item.associationCode} className='odd:bg-muted/35 even:bg-background space-y-4 p-5'>
                    <div className='min-w-0'>
                      <p className='truncate text-sm font-semibold' title={item.associationName}>
                        {item.associationName}
                      </p>
                      <div className='mt-1 flex flex-wrap items-center gap-2'>
                        <p className='text-muted-foreground text-xs'>{item.associationCode}</p>
                        <Button asChild size='xs' variant='outline' className='h-7 gap-1 px-2 text-xs'>
                          <Link href={`/admin-delegate-view/${encodeURIComponent(item.associationCode)}`}>
                            <Eye className='size-3.5' aria-hidden='true' />
                            View
                          </Link>
                        </Button>
                      </div>
                    </div>
                    <div className='grid grid-cols-2 gap-2 text-sm sm:grid-cols-3'>
                      <div>
                        <p className='text-muted-foreground text-xs'>Vested</p>
                        <p className='font-bold text-green-600 dark:text-green-400'>{formatNumber(item.vested)}</p>
                      </div>
                      <div>
                        <p className='text-muted-foreground text-xs'>Monthly Addition</p>
                        <p className='font-semibold text-cyan-700 dark:text-cyan-300'>
                          {formatNumber(item.monthlyAddition)}
                        </p>
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
                    <span className='text-primary text-lg'>{formatNumber(displayedTotals.total)}</span>
                  </div>
                  <div className='grid grid-cols-2 gap-2 text-sm'>
                    <span className='font-bold text-green-600 dark:text-green-400'>
                      Vested: {formatNumber(displayedTotals.vested)}
                    </span>
                    <span className='font-bold text-cyan-700 dark:text-cyan-300'>
                      Monthly Addition: {formatNumber(displayedTotals.monthlyAddition)}
                    </span>
                    <span className='text-blue-600 dark:text-blue-400'>
                      Awaiting: {formatNumber(displayedTotals.awaitingPublication)}
                    </span>
                    <span className='text-amber-600 dark:text-amber-400'>
                      Pending: {formatNumber(displayedTotals.pending)}
                    </span>
                    <span className='text-destructive'>
                      Delinquent: {formatNumber(displayedTotals.notInGoodStanding)}
                    </span>
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
                <col className='w-[11%]' />
                <col className='w-[9%]' />
                <col className='w-[12%]' />
                <col className='w-[9%]' />
                <col className='w-[9%]' />
                <col className='w-[10%]' />
                <col className='w-[10%]' />
              </colgroup>
              <TableHeader>
                <TableRow className='bg-primary hover:bg-primary'>
                  {sortableColumns.map(column => {
                    const isActive = sort.key === column.key

                    return (
                      <TableHead
                        key={column.key}
                        title={column.label}
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
                  paginatedCounts.map(item => (
                    <TableRow key={item.associationCode} className='odd:bg-muted/35 even:bg-background h-16'>
                      <TableCell className='truncate px-1 py-4 font-medium lg:px-2' title={item.associationName}>
                        {item.associationName}
                      </TableCell>
                      <TableCell className='px-1 py-4 lg:px-2'>
                        <div className='flex min-w-0 flex-col items-start gap-1.5'>
                          <span className='font-medium'>{item.associationCode}</span>
                          <Button
                            asChild
                            size='xs'
                            variant='outline'
                            className='h-6 gap-1 px-1.5 text-[11px] print:hidden'
                          >
                            <Link href={`/admin-delegate-view/${encodeURIComponent(item.associationCode)}`}>
                              <Eye className='size-3' aria-hidden='true' />
                              View
                            </Link>
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className='px-1 py-4 text-right font-bold text-green-600 lg:px-2 dark:text-green-400'>
                        {formatNumber(item.vested)}
                      </TableCell>
                      <TableCell className='px-1 py-4 text-right font-semibold text-cyan-700 lg:px-2 dark:text-cyan-300'>
                        {formatNumber(item.monthlyAddition)}
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
                    <TableCell colSpan={8} className='text-muted-foreground h-24 text-center'>
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
                      {formatNumber(displayedTotals.vested)}
                    </TableCell>
                    <TableCell className='px-1 py-5 text-right font-black text-cyan-700 lg:px-2 dark:text-cyan-300'>
                      {formatNumber(displayedTotals.monthlyAddition)}
                    </TableCell>
                    <TableCell className='px-1 py-5 text-right font-black text-blue-600 lg:px-2 dark:text-blue-400'>
                      {formatNumber(displayedTotals.awaitingPublication)}
                    </TableCell>
                    <TableCell className='px-1 py-5 text-right font-black text-amber-600 lg:px-2 dark:text-amber-400'>
                      {formatNumber(displayedTotals.pending)}
                    </TableCell>
                    <TableCell className='text-destructive px-1 py-5 text-right font-black lg:px-2'>
                      {formatNumber(displayedTotals.notInGoodStanding)}
                    </TableCell>
                    <TableCell className='text-primary px-2 py-5 text-right text-lg font-black lg:px-3 lg:text-xl'>
                      {formatNumber(displayedTotals.total)}
                    </TableCell>
                  </TableRow>
                </TableFooter>
              )}
            </Table>
          </div>
          {sortedCounts.length > 0 ? (
            <div className='mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row print:hidden'>
              <p className='text-muted-foreground text-sm' aria-live='polite'>
                Showing {(activePage - 1) * rowsPerPage + 1}-{Math.min(activePage * rowsPerPage, sortedCounts.length)}{' '}
                of {sortedCounts.length}
              </p>
              {totalPages > 1 ? (
                <PaginationControls
                  activePage={activePage}
                  canNext={activePage < totalPages}
                  canPrevious={activePage > 1}
                  getPageButtonClassName={isActive =>
                    isActive
                      ? undefined
                      : 'bg-primary/10 text-primary hover:bg-primary/20 focus-visible:ring-primary/20 dark:focus-visible:ring-primary/40'
                  }
                  iconClassName='text-primary'
                  labelClassName='text-primary max-sm:hidden'
                  onNext={() => setCurrentPage(Math.min(totalPages, activePage + 1))}
                  onPageChange={setCurrentPage}
                  onPrevious={() => setCurrentPage(Math.max(1, activePage - 1))}
                  pages={pages}
                  showLeftEllipsis={showLeftEllipsis}
                  showRightEllipsis={showRightEllipsis}
                />
              ) : null}
            </div>
          ) : null}
        </CardContent>
      </Card>
    </>
  )
}

export default AdminCountBreakdown
