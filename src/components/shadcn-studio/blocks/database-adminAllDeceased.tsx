'use client'
import { useId, useMemo, useState } from 'react'

import day from 'dayjs'
import advancedFormat from 'dayjs/plugin/advancedFormat'
import Papa from 'papaparse'
import * as XLSX from 'xlsx'

day.extend(advancedFormat)

import {
  ArrowUpDown,
  Ban,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  CheckCircle2,
  CircleDollarSign,
  ClipboardList,
  Ellipsis,
  FileSpreadsheetIcon,
  FileTextIcon,
  Pencil,
  SearchIcon,
  Trash2,
  UploadIcon,
  Users,
  XIcon
} from 'lucide-react'

import type { Cell, Column, ColumnDef, PaginationState, RowData } from '@tanstack/react-table'
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

import Link from 'next/link'

import PrintButton from '@/components/global/PrintButton'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
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
import { getSelectFilterValues } from '@/utils/table-filter-values'

import { contributionStatus, type DeceasedMemberType } from '@/utils/types'
import { deleteDeceasedMemberAction } from '@/utils/actions'
import FormContainer from '@/components/forms/FormContainer'
import PaginationControls from '@/components/global/PaginationControls'
import RestoreDeceasedMemberButton from '@/components/global/RestoreDeceasedMemberButton'

declare module '@tanstack/react-table' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    filterVariant?: 'text' | 'range' | 'select'
    label?: string
  }
}

const columns: ColumnDef<DeceasedMemberType>[] = [
  {
    header: 'Last/Middle',
    accessorKey: 'lastAndMiddleNames',
    cell: ({ row }) => (
      <div className='flex min-w-0 items-center gap-2'>
        <div className='flex min-w-0 flex-col'>
          <span className='truncate font-medium'>{row.getValue('lastAndMiddleNames')}</span>
        </div>
      </div>
    ),
    meta: {
      label: 'Last and Middle Names'
    },
    size: 116
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
    header: 'First',
    accessorKey: 'firstName',
    cell: ({ row }) => (
      <div className='flex min-w-0 items-center gap-2'>
        <div className='flex min-w-0 flex-col'>
          <span className='truncate font-medium'>{row.getValue('firstName')}</span>
        </div>
      </div>
    ),
    meta: {
      label: 'First Name'
    },
    size: 96
  },

  {
    header: 'Matric.',
    accessorKey: 'memberMatriculationNumber',
    cell: ({ row }) => (
      <div className='flex min-w-0 items-center gap-2'>
        <div className='flex min-w-0 flex-col'>
          <span className='truncate font-medium'>{row.getValue('memberMatriculationNumber')}</span>
        </div>
      </div>
    ),
    meta: {
      label: 'Matriculation'
    },
    size: 94
  },
  {
    header: 'Group',
    accessorKey: 'associationName',
    cell: ({ row }) => (
      <div className='flex min-w-0 items-center gap-2'>
        <div className='flex min-w-0 flex-col'>
          <span className='truncate font-medium'>{row.getValue('associationName')}</span>
        </div>
      </div>
    ),
    meta: {
      label: `Association/Group's Name`
    },
    size: 96
  },
  {
    header: 'Place',
    accessorKey: 'placeOfDeath',
    cell: ({ row }) => (
      <div className='flex min-w-0 items-center gap-2'>
        <div className='flex min-w-0 flex-col'>
          <span className='truncate font-medium'>{row.getValue('placeOfDeath')}</span>
        </div>
      </div>
    ),
    meta: {
      label: 'Place of Death(State)'
    },
    size: 88
  },

  {
    accessorKey: 'registrationDate', // The key in your data object
    header: 'Reg. Date',
    cell: ({ row }) => {
      const field = row.getValue('registrationDate') as string
      const fieldDate = new Date(field)

      const formattedRegistrationDate = day(fieldDate).format('MMM D, YYYY')

      return <div>{formattedRegistrationDate}</div>
    },
    meta: {
      label: 'Registration Date'
    },
    size: 82
  },
  {
    accessorKey: 'dateOfDeath', // The key in your data object
    header: 'Death',
    cell: ({ row }) => {
      const field = row.getValue('dateOfDeath') as string
      const fieldDate = new Date(field)

      const formattedDateOfDeath = day(fieldDate).format('MMM D, YYYY')

      return <div>{formattedDateOfDeath}</div>
    },
    meta: {
      label: 'Date of Death'
    },
    size: 82
  },
  {
    accessorKey: 'createdAt', // The key in your data object
    header: 'Announced',
    cell: ({ row }) => {
      const field = row.getValue('createdAt') as Date

      const formattedAnnouncementDate = day(field).format('MMM D, YYYY')

      return <div>{formattedAnnouncementDate}</div>
    },
    meta: {
      label: 'Date Announced'
    },
    size: 82
  },
  {
    header: 'Contrib.',
    accessorKey: 'contributionStatus',
    cell: ({ row }) => {
      const contributionStatus = row.getValue('contributionStatus') as string

      const styles = {
        Case_In_Review:
          'bg-amber-600/10 text-amber-600 focus-visible:ring-amber-600/20 dark:bg-amber-400/10 dark:text-amber-400 dark:focus-visible:ring-amber-400/40 [a&]:hover:bg-amber-600/5 dark:[a&]:hover:bg-amber-400/5',
        Contribution_Denied:
          'bg-destructive/10 text-destructive focus-visible:ring-destructive/20 dark:bg-destructive/10 dark:text-destructive dark:focus-visible:ring-destructive/40 [a&]:hover:bg-destructive/5 dark:[a&]:hover:bg-destructive/5',
        Contribution_Underway:
          'bg-blue-600/10 text-blue-600 focus-visible:ring-blue-600/20 dark:bg-blue-400/10 dark:text-blue-400 dark:focus-visible:ring-blue-400/40 [a&]:hover:bg-blue-600/5 dark:[a&]:hover:bg-blue-400/5',
        Contribution_Completed:
          'bg-green-600/10 text-green-600 focus-visible:ring-green-600/20 dark:bg-green-400/10 dark:text-green-400 dark:focus-visible:ring-green-400/40 [a&]:hover:bg-green-600/5 dark:[a&]:hover:bg-green-400/5'
      }[contributionStatus]

      return (
        <Badge
          className={cn(
            'w-full max-w-full justify-start truncate rounded-sm border-none text-left text-xs capitalize focus-visible:outline-none',
            styles
          )}
        >
          {row.getValue('contributionStatus')}
        </Badge>
      )
    },
    meta: {
      filterVariant: 'select',
      label: 'Contribution Status'
    },
    size: 92
  },
  {
    header: 'Act.',
    accessorKey: 'id',
    cell: ({ row: { original } }) => <RowActions deceasedMember={original} />,
    meta: {
      label: 'Actions'
    },
    size: 58
  }
]

const getColumnLabel = (column: Column<DeceasedMemberType, unknown>) => {
  const metaLabel = column.columnDef.meta?.label

  if (typeof metaLabel === 'string' && metaLabel.trim()) return metaLabel

  return typeof column.columnDef.header === 'string' ? column.columnDef.header : column.id
}

const getDeceasedMemberTableCellLabel = (cell: Cell<DeceasedMemberType, unknown>) => getColumnLabel(cell.column)

const getResponsiveColumnClassName = (columnId: string) => columnId === 'associationName' && 'md:hidden lg:table-cell'

const numberFormatter = new Intl.NumberFormat('en-US')
const formatNumber = (value: number) => numberFormatter.format(value)

const DeceasedMembersDataTable = ({ data }: { data: DeceasedMemberType[] }) => {
  const [columnFilters, setColumnFilters] = usePersistentColumnFilters('sagi:admin-all-deceased:columnFilters')

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

  const summaryTotals = table.getCoreRowModel().rows.reduce(
    (acc, row) => {
      const status = row.getValue('contributionStatus')

      if (status === contributionStatus.review) acc.review += 1
      if (status === contributionStatus.denied) acc.denied += 1
      if (status === contributionStatus.underway) acc.underway += 1
      if (status === contributionStatus.completed) acc.completed += 1

      acc.total += 1

      return acc
    },
    {
      review: 0,
      denied: 0,
      underway: 0,
      completed: 0,
      total: 0
    }
  )

  const summaryCards = [
    {
      label: 'Completed',
      value: summaryTotals.completed,
      icon: CheckCircle2,
      colorClassName: 'text-green-600 dark:text-green-400',
      cardClassName: 'border-green-500/20 bg-green-500/10'
    },
    {
      label: 'Underway',
      value: summaryTotals.underway,
      icon: CircleDollarSign,
      colorClassName: 'text-blue-600 dark:text-blue-400',
      cardClassName: 'border-blue-500/20 bg-blue-500/10'
    },
    {
      label: 'In Review',
      value: summaryTotals.review,
      icon: ClipboardList,
      colorClassName: 'text-amber-600 dark:text-amber-400',
      cardClassName: 'border-amber-500/20 bg-amber-500/10'
    },
    {
      label: 'Denied',
      value: summaryTotals.denied,
      icon: Ban,
      colorClassName: 'text-destructive',
      cardClassName: 'border-destructive/20 bg-destructive/10'
    },
    {
      label: 'All Deceased',
      value: summaryTotals.total,
      icon: Users,
      colorClassName: 'text-foreground',
      cardClassName: 'border-foreground/10 bg-muted/70'
    }
  ]

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
    <div className='w-full min-w-0 overflow-hidden rounded-lg border border-purple-500'>
      <div className='border-b'>
        <div className='flex flex-col gap-4 border-b p-4 sm:p-6'>
          <div className='flex flex-wrap items-baseline gap-x-3 gap-y-1 text-purple-500'>
            <span className='text-xl leading-tight font-semibold sm:text-3xl lg:text-5xl'>
              Deceased Members (Admin)
            </span>
            <span className='inline-flex max-w-3xl items-center gap-1 text-sm leading-5 font-medium sm:text-base lg:text-lg'>
              <span className='text-4xl leading-none font-light sm:text-5xl'>(</span>
              <span className='flex min-w-0 flex-col'>
                <span className='whitespace-nowrap'>If a death announcement was made by mistake,</span>
                <span className='whitespace-nowrap'>admins can click Restore on the member row at any time.</span>
              </span>
              <span className='text-4xl leading-none font-light sm:text-5xl'>)</span>
            </span>
          </div>
          <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-5'>
            {summaryCards.map(status => {
              const Icon = status.icon

              return (
                <Card key={status.label} className={`gap-2 py-4 ${status.cardClassName}`}>
                  <CardHeader className='pb-0'>
                    <CardTitle className={`flex items-center gap-2 text-sm font-medium ${status.colorClassName}`}>
                      <Icon className='size-4 shrink-0' aria-hidden='true' />
                      {status.label}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className={`text-3xl font-extrabold lg:text-4xl ${status.colorClassName}`}>
                      {formatNumber(status.value)}
                    </p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
          <div className='flex items-center justify-between gap-3 py-2 max-sm:flex-col max-sm:items-stretch sm:px-6 sm:py-4'>
            <p className='text-sm font-extrabold text-purple-400 sm:whitespace-nowrap' aria-live='polite'>
              <span>{table.getRowCount().toString()} Deceased Member(s) Found</span>
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
                      <ChevronLeftIcon aria-hidden='true' className='text-purple-500' />
                      <span className='text-purple-500 max-sm:hidden'>Previous</span>
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
                          className='bg-purple-500 hover:bg-purple-400'
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
                      <span className='text-purple-500 max-sm:hidden'>Next</span>
                      <ChevronRightIcon aria-hidden='true' className='text-purple-500' />
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
            <Filter column={table.getColumn('associationName')!} />
            <Filter column={table.getColumn('contributionStatus')!} />
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
                  {[5, 10, 25, 50, 100, 200].map(pageSize => (
                    <SelectItem key={pageSize} value={pageSize.toString()}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <PrintButton
              label='Print PDF'
              className='text-primary focus-visible:ring-primary/20 dark:focus-visible:ring-primary/40 w-full bg-purple-500/10 hover:bg-purple-400/20 sm:w-auto'
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className='text-primary focus-visible:ring-primary/20 dark:focus-visible:ring-primary/40 w-full bg-purple-500/10 hover:bg-purple-400/20 sm:w-auto'>
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
        <Table mobileCards className='table-fixed sm:min-w-0'>
          <TableHeader>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id} className='h-14 border-t bg-purple-500 hover:bg-purple-400'>
                {headerGroup.headers.map(header => {
                  const headerTitle = getColumnLabel(header.column)

                  return (
                    <TableHead
                      key={header.id}
                      title={headerTitle}
                      style={{ width: `${header.getSize()}px` }}
                      className={cn(
                        'px-2 text-xs leading-tight font-extrabold whitespace-normal text-white first:pl-3 last:px-3',
                        getResponsiveColumnClassName(header.column.id)
                      )}
                    >
                      {header.isPlaceholder ? null : header.column.getCanSort() ? (
                        <div
                          className={cn(
                            header.column.getCanSort() &&
                              'inline-flex h-full cursor-pointer items-center gap-1 select-none'
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
              table.getRowModel().rows.map(row => {
                const hasApprovedDeathDocuments = row.original.hasApprovedDeathDocuments

                return (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
                    className={cn(
                      'hover:bg-purple-300/30',
                      hasApprovedDeathDocuments &&
                        'bg-green-600/10 hover:bg-green-600/20 dark:bg-green-400/10 dark:hover:bg-green-400/15'
                    )}
                  >
                    {row.getVisibleCells().map(cell => {
                      const cellLabel = getDeceasedMemberTableCellLabel(cell)

                      return (
                        <TableCell
                          key={cell.id}
                          data-label={cellLabel}
                          className={cn(
                            'h-14 px-2 whitespace-normal first:pl-3 last:px-3',
                            getResponsiveColumnClassName(cell.column.id)
                          )}
                        >
                          <span className='sr-only'>{cellLabel}: </span>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      )
                    })}
                  </TableRow>
                )
              })
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className='h-24 text-center'>
                  No Deceased Member(s) Found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <div className='flex justify-center border-t border-purple-500/30 p-4 sm:justify-end sm:p-6'>
          <PaginationControls
            activePage={table.getState().pagination.pageIndex + 1}
            canNext={table.getCanNextPage()}
            canPrevious={table.getCanPreviousPage()}
            getPageButtonClassName={() => 'bg-purple-500 hover:bg-purple-400'}
            iconClassName='text-purple-500'
            labelClassName='text-purple-500 max-sm:hidden'
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

export default DeceasedMembersDataTable

function Filter({ column }: { column: Column<any, unknown> }) {
  const id = useId()
  const columnFilterValue = column.getFilterValue()
  const { filterVariant } = column.columnDef.meta ?? {}
  const columnHeader = getColumnLabel(column)
  const filterValue = (columnFilterValue ?? '') as string
  const searchLabel = column.id === 'lastAndMiddleNames' ? 'last or middle name' : columnHeader.toLowerCase()

  const sortedUniqueValues = useMemo(() => {
    if (filterVariant === 'range') return []

    return getSelectFilterValues(column.getFacetedUniqueValues().keys())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [column.getFacetedUniqueValues(), filterVariant])

  if (filterVariant === 'select') {
    return (
      <div className='w-full space-y-2 rounded border border-dashed border-purple-500 sm:max-w-2xs'>
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
    <div className='w-full rounded border border-purple-500 sm:max-w-2xs'>
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

function RowActions({ deceasedMember }: { deceasedMember: DeceasedMemberType }) {
  const deceasedMemberId = deceasedMember.id
  const deleteDeceasedMember = deleteDeceasedMemberAction.bind(null, { deceasedMemberId })

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className='flex'>
          <Button size='icon' variant='ghost' className='rounded-full p-2' aria-label='Edit item'>
            <Ellipsis className='size-6' aria-hidden='true' />
          </Button>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='start' className='rounded border border-purple-500'>
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <RestoreDeceasedMemberButton allowExpiredRestore deceasedMember={deceasedMember} compact />
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Link href={`/admin-all-deceased/${deceasedMemberId}/edit`}>
              <span className='flex justify-center gap-3 pl-4 text-blue-500'>
                <Pencil className='text-blue-500' />
                Edit Case Status
              </span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <FormContainer action={deleteDeceasedMember}>
              <Button
                size='default'
                variant='ghost'
                className='text-destructive flex justify-center gap-3 rounded-full hover:bg-transparent'

                // aria-label='Edit '
              >
                <Trash2 className='text-destructive size-4' aria-hidden='true' />
                <p className='hover:text-red-400'>remove deceased member</p>
              </Button>
            </FormContainer>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
