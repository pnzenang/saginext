'use client'
import { useId, useMemo, useState } from 'react'

import day from 'dayjs'
import advancedFormat from 'dayjs/plugin/advancedFormat'
import Papa from 'papaparse'
import * as XLSX from 'xlsx'

day.extend(advancedFormat)

import {
  ArrowUpDown,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  FileSpreadsheetIcon,
  FileTextIcon,
  SearchIcon,
  UploadIcon,
  XIcon
} from 'lucide-react'

import type { Column, ColumnDef, PaginationState, RowData } from '@tanstack/react-table'
import {
  flexRender,
  getCoreRowModel,
  getFacetedMinMaxValues,
  getFacetedRowModel,
  getPaginationRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable
} from '@tanstack/react-table'

import { Button } from '@/components/ui/button'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem } from '@/components/ui/pagination'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

import { usePersistentColumnFilters } from '@/hooks/use-persistent-column-filters'
import { usePagination } from '@/hooks/use-pagination'

import { cn } from '@/lib/utils'
import { getTableCellLabel } from '@/utils/table'
import { getSelectFilterValues } from '@/utils/table-filter-values'
import type { RemovedMemberType } from '@/utils/types'
import PaginationControls from '@/components/global/PaginationControls'
import PrintButton from '@/components/global/PrintButton'
import RestoreRemovedMemberButton from '@/components/global/RestoreRemovedMemberButton'

declare module '@tanstack/react-table' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    filterVariant?: 'text' | 'range' | 'select'
  }
}

const columns: ColumnDef<RemovedMemberType>[] = [
  {
    header: 'Last And Middle Names',
    accessorKey: 'lastAndMiddleNames',
    cell: ({ row }) => (
      <div className='flex items-center gap-2'>
        <div className='flex flex-col'>
          <span className='font-medium'>{row.getValue('lastAndMiddleNames')}</span>
        </div>
      </div>
    ),
    size: 100
  },

  // {
  //   header: 'Middle Name',
  //   accessorKey: 'middleName',
  //   cell: ({ row }) => (
  //     <div className='flex items-center gap-2'>
  //       <div className='flex flex-col'>
  //         <span className='font-medium'>{row.getValue('middleName')}</span>
  //       </div>
  //     </div>
  //   ),
  //   size: 100
  // },
  {
    header: 'First Name',
    accessorKey: 'firstName',
    cell: ({ row }) => (
      <div className='flex items-center gap-2'>
        <div className='flex flex-col'>
          <span className='font-medium'>{row.getValue('firstName')}</span>
        </div>
      </div>
    )
  },

  {
    header: 'Matriculation',
    accessorKey: 'memberMatriculationNumber',
    cell: ({ row }) => (
      <div className='flex items-center gap-2'>
        <div className='flex flex-col'>
          <span className='font-medium'>{row.getValue('memberMatriculationNumber')}</span>
        </div>
      </div>
    ),
    size: 150
  },
  {
    header: 'Code',
    accessorKey: 'associationCode',
    cell: ({ row }) => (
      <div className='flex items-center gap-2'>
        <div className='flex flex-col'>
          <span className='font-medium'>{row.getValue('associationCode')}</span>
        </div>
      </div>
    ),
    size: 150
  },

  // {
  //   header: 'Groupe Name',
  //   accessorKey: 'associationName',
  //   cell: ({ row }) => (
  //     <div className='flex items-center gap-2'>
  //       <div className='flex flex-col'>
  //         <span className='font-medium'>{row.getValue('associationName')}</span>
  //       </div>
  //     </div>
  //   ),
  //   size: 150
  // },
  {
    header: 'Reason For Leaving',
    accessorKey: 'reasonForLeaving',
    cell: ({ row }) => (
      <div className='flex items-center gap-2'>
        <div className='flex flex-col'>
          <span className='font-medium'>{row.getValue('reasonForLeaving')}</span>
        </div>
      </div>
    ),
    meta: {
      filterVariant: 'select'
    },
    size: 150
  },
  {
    accessorKey: 'registrationDate', // The key in your data object
    header: 'Registration Date',
    cell: ({ row }) => {
      const field = row.getValue('registrationDate') as string
      const fieldDate = new Date(field)

      const formattedRegistrationDate = day(fieldDate).format('MMM D, YYYY')

      return <div>{formattedRegistrationDate}</div>
    },
    size: 100
  },

  {
    accessorKey: 'createdAt', // The key in your data object
    header: 'Date Removed',
    cell: ({ row }) => {
      const field = row.getValue('createdAt') as Date

      const formattedLongevity = day(field).format('MMM D, YYYY')

      return <div>{formattedLongevity}</div>
    },
    size: 150
  },
  {
    header: 'Actions',
    id: 'actions',
    cell: ({ row: { original } }) => <RowActions removedMember={original} />,
    size: 120
  }
]

const RemovedMembersDataTable = ({ data }: { data: RemovedMemberType[] }) => {
  const [columnFilters, setColumnFilters] = usePersistentColumnFilters('sagi:removed-members:columnFilters')

  const pageSize = 100

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: pageSize
  })

  const table = useReactTable({
    data,
    columns,
    state: {
      columnFilters,
      pagination
    },
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
    enableSortingRemoval: false,
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination
  })

  const exportToCSV = () => {
    const selectedRows = table.getSelectedRowModel().rows

    const dataToExport =
      selectedRows.length > 0
        ? selectedRows.map(row => row.original)
        : table.getFilteredRowModel().rows.map(row => row.original)

    const csv = Papa.unparse(dataToExport, {
      header: true
    })

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)

    link.setAttribute('href', url)
    link.setAttribute('download', `payments-export-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const exportToExcel = () => {
    const selectedRows = table.getSelectedRowModel().rows

    const dataToExport =
      selectedRows.length > 0
        ? selectedRows.map(row => row.original)
        : table.getFilteredRowModel().rows.map(row => row.original)

    const worksheet = XLSX.utils.json_to_sheet(dataToExport)
    const workbook = XLSX.utils.book_new()

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Payments')

    const cols = [{ wch: 10 }, { wch: 20 }, { wch: 15 }, { wch: 25 }, { wch: 15 }]

    worksheet['!cols'] = cols

    XLSX.writeFile(workbook, `payments-export-${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  const exportToJSON = () => {
    const selectedRows = table.getSelectedRowModel().rows

    const dataToExport =
      selectedRows.length > 0
        ? selectedRows.map(row => row.original)
        : table.getFilteredRowModel().rows.map(row => row.original)

    const json = JSON.stringify(dataToExport, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)

    link.setAttribute('href', url)
    link.setAttribute('download', `payments-export-${new Date().toISOString().split('T')[0]}.json`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const { pages, showLeftEllipsis, showRightEllipsis } = usePagination({
    currentPage: table.getState().pagination.pageIndex + 1,
    totalPages: table.getPageCount(),
    paginationItemsToDisplay: 2
  })

  return (
    <div className='border-destructive w-full min-w-0 overflow-hidden rounded-lg border'>
      <div className='border-b'>
        <div className='flex flex-col gap-4 border-b p-4 sm:p-6'>
          <span className='text-xl leading-tight font-semibold text-red-500 sm:text-3xl lg:text-5xl'>
            REMOVED MEMBERS{' '}
          </span>

          <div className='flex items-center justify-between gap-3 py-2 max-sm:flex-col max-sm:items-stretch sm:px-6 sm:py-4'>
            <p className='text-sm font-extrabold text-red-500 sm:whitespace-nowrap' aria-live='polite'>
              <span>{table.getRowCount().toString()} Member(s) removed so far </span>
            </p>

            <div className='w-full sm:w-auto'>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <Button
                      className='disabled:pointer-events-none disabled:opacity-50'
                      variant={'ghost'}
                      onClick={() => table.previousPage()}
                      disabled={!table.getCanPreviousPage()}
                      aria-label='Go to previous page'
                    >
                      <ChevronLeftIcon aria-hidden='true' className='text-red-400' />
                      <span className='text-red-400 max-sm:hidden'>Previous</span>
                    </Button>
                  </PaginationItem>

                  {showLeftEllipsis && (
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                  )}

                  {pages.map(page => {
                    const isActive = page === table.getState().pagination.pageIndex + 1

                    return (
                      <PaginationItem key={page}>
                        <Button
                          size='icon'
                          className='bg-red-400 hover:bg-red-300'
                          onClick={() => table.setPageIndex(page - 1)}
                          aria-current={isActive ? 'page' : undefined}
                        >
                          {page}
                        </Button>
                      </PaginationItem>
                    )
                  })}

                  {showRightEllipsis && (
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                  )}

                  <PaginationItem>
                    <Button
                      className='disabled:pointer-events-none disabled:opacity-50'
                      variant={'ghost'}
                      onClick={() => table.nextPage()}
                      disabled={!table.getCanNextPage()}
                      aria-label='Go to next page'
                    >
                      <span className='text-red-400 max-sm:hidden'>Next</span>
                      <ChevronRightIcon aria-hidden='true' className='text-red-400' />
                    </Button>
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </div>
          <div className='grid grid-cols-1 gap-6 max-md:*:last:col-span-full sm:grid-cols-2 md:grid-cols-3'>
            {/* <Filter column={table.getColumn('dateOfBirth')!} /> */}
          </div>
        </div>
        <div className='flex items-start gap-4 p-4 max-sm:flex-col sm:items-center sm:justify-between sm:p-6'>
          <div className='grid w-full grid-cols-1 gap-2 sm:grid-cols-2 xl:flex xl:items-center'>
            <Filter column={table.getColumn('lastAndMiddleNames')!} />
            {/* <Filter column={table.getColumn('middleName')!} /> */}
            <Filter column={table.getColumn('firstName')!} />
            <Filter column={table.getColumn('associationCode')!} />
            <Filter column={table.getColumn('reasonForLeaving')!} />
          </div>
          <div className='flex w-full flex-col items-stretch gap-2 sm:w-auto sm:flex-row sm:items-center sm:justify-between'>
            <div className='flex items-center gap-2'>
              <Label htmlFor='#rowSelect' className=''>
                Show
              </Label>
              <Select
                value={table.getState().pagination.pageSize.toString()}
                onValueChange={value => {
                  table.setPageSize(Number(value))
                }}
              >
                <SelectTrigger id='rowSelect' className='w-full whitespace-nowrap sm:w-fit'>
                  <SelectValue placeholder='Select number of results' />
                </SelectTrigger>
                <SelectContent className='[&_*[role=option]]:pr-8 [&_*[role=option]]:pl-2 [&_*[role=option]>span]:right-2 [&_*[role=option]>span]:left-auto'>
                  {[5, 10, 25, 50, 100].map(pageSize => (
                    <SelectItem key={pageSize} value={pageSize.toString()}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <PrintButton
              label='Print PDF'
              className='text-primary hover:bg-primary/20 focus-visible:ring-primary/20 dark:focus-visible:ring-primary/40 w-full bg-red-400/10 sm:w-auto'
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className='text-primary hover:bg-primary/20 focus-visible:ring-primary/20 dark:focus-visible:ring-primary/40 w-full bg-red-400/10 sm:w-auto'>
                  <UploadIcon />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end'>
                <DropdownMenuItem onClick={exportToCSV}>
                  <FileTextIcon className='mr-2 size-4' />
                  Export as CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={exportToExcel}>
                  <FileSpreadsheetIcon className='mr-2 size-4' />
                  Export as Excel
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={exportToJSON}>
                  <FileTextIcon className='mr-2 size-4' />
                  Export as JSON
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <Table mobileCards>
          <TableHeader>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id} className='h-14 border-t bg-red-400 hover:bg-red-300'>
                {headerGroup.headers.map(header => {
                  return (
                    <TableHead
                      key={header.id}
                      style={{ width: `${header.getSize()}px` }}
                      className='font-extrabold text-white first:pl-4 last:px-4'
                    >
                      {header.isPlaceholder ? null : header.column.getCanSort() ? (
                        <div
                          className={cn(
                            header.column.getCanSort() &&
                              'inline-flex h-full cursor-pointer items-center gap-1.5 select-none'
                          )}
                          onClick={header.column.getToggleSortingHandler()}
                          onKeyDown={e => {
                            if (header.column.getCanSort() && (e.key === 'Enter' || e.key === ' ')) {
                              e.preventDefault()
                              header.column.getToggleSortingHandler()?.(e)
                            }
                          }}
                          tabIndex={header.column.getCanSort() ? 0 : undefined}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {{
                            asc: <ChevronUpIcon className='shrink-0 opacity-60' size={16} aria-hidden='true' />,
                            desc: <ChevronDownIcon className='shrink-0 opacity-60' size={16} aria-hidden='true' />
                          }[header.column.getIsSorted() as string] ?? (
                            <ArrowUpDown className='shrink-0 opacity-60' size={16} aria-hidden='true' />
                          )}
                        </div>
                      ) : (
                        flexRender(header.column.columnDef.header, header.getContext())
                      )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map(row => (
                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'} className='hover:bg-red-400/30'>
                  {row.getVisibleCells().map(cell => {
                    const cellLabel = getTableCellLabel(cell)

                    return (
                      <TableCell
                        key={cell.id}
                        data-label={cellLabel}
                        className='h-14 first:w-12.5 first:pl-4 last:w-29 last:px-4'
                      >
                        <span className='sr-only'>{cellLabel}: </span>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    )
                  })}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className='h-24 text-center'>
                  No Removed Member(s) Found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <div className='flex justify-center border-t border-red-400/30 p-4 sm:justify-end sm:p-6'>
          <PaginationControls
            activePage={table.getState().pagination.pageIndex + 1}
            canNext={table.getCanNextPage()}
            canPrevious={table.getCanPreviousPage()}
            getPageButtonClassName={() => 'bg-red-400 hover:bg-red-300'}
            iconClassName='text-red-400'
            labelClassName='text-red-400 max-sm:hidden'
            onNext={() => table.nextPage()}
            onPageChange={page => table.setPageIndex(page - 1)}
            onPrevious={() => table.previousPage()}
            pages={pages}
            showLeftEllipsis={showLeftEllipsis}
            showRightEllipsis={showRightEllipsis}
          />
        </div>
      </div>
    </div>
  )
}

export default RemovedMembersDataTable

function Filter({ column }: { column: Column<any, unknown> }) {
  const id = useId()
  const columnFilterValue = column.getFilterValue()
  const { filterVariant } = column.columnDef.meta ?? {}
  const columnHeader = typeof column.columnDef.header === 'string' ? column.columnDef.header : ''
  const filterValue = (columnFilterValue ?? '') as string
  const searchLabel = column.id === 'lastAndMiddleNames' ? 'last or middle name' : columnHeader.toLowerCase()

  const sortedUniqueValues = useMemo(() => {
    if (filterVariant === 'range') return []

    return getSelectFilterValues(column.getFacetedUniqueValues().keys())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [column.getFacetedUniqueValues(), filterVariant])

  if (filterVariant === 'select') {
    return (
      <div className='w-full space-y-2 rounded border border-dashed border-red-400 sm:max-w-2xs'>
        {/* <Label htmlFor={`${id}-select`}>Select {columnHeader}</Label> */}
        <Select
          value={columnFilterValue?.toString() ?? 'all'}
          onValueChange={value => {
            column.setFilterValue(value === 'all' ? undefined : value)
          }}
        >
          <SelectTrigger id={`${id}-select`} className='w-full capitalize'>
            <SelectValue placeholder={`Select ${columnHeader}`} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All</SelectItem>
            {sortedUniqueValues.map(value => (
              <SelectItem key={String(value)} value={String(value)} className='capitalize'>
                {String(value)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    )
  }

  return (
    <div className='w-full rounded border border-red-400 sm:max-w-2xs'>
      <Label htmlFor={`${id}-input`} className='sr-only'>
        {columnHeader}
      </Label>
      <div className='relative'>
        <Input
          id={`${id}-input`}
          className='peer pr-9 pl-9'
          value={filterValue}
          onChange={e => column.setFilterValue(e.target.value)}
          placeholder={`Search ${searchLabel}`}
          type='text'
        />
        <div className='text-muted-foreground/80 pointer-events-none absolute inset-y-0 left-0 flex items-center justify-center pl-3 peer-disabled:opacity-50'>
          <SearchIcon size={16} />
        </div>
        {filterValue ? (
          <Button
            type='button'
            variant='ghost'
            size='icon-xs'
            className='text-muted-foreground hover:text-foreground absolute top-1/2 right-1.5 -translate-y-1/2 rounded-full'
            onClick={() => column.setFilterValue(undefined)}
            aria-label={`Clear ${searchLabel} search`}
          >
            <XIcon className='size-3.5' />
          </Button>
        ) : null}
      </div>
    </div>
  )
}

function RowActions({ removedMember }: { removedMember: RemovedMemberType }) {
  return <RestoreRemovedMemberButton removedMember={removedMember} />
}
