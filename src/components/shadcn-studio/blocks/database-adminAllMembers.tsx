'use client'

import { useId, useMemo, useState } from 'react'

import type { Column, ColumnDef, ColumnFiltersState, PaginationState, RowData } from '@tanstack/react-table'
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
import {
  AlertTriangle,
  ArrowUpDown,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  Clock,
  Cross,
  Ellipsis,
  FileSpreadsheetIcon,
  FileTextIcon,
  Hourglass,
  Pencil,
  SearchIcon,
  ShieldCheck,
  Trash2,
  UploadIcon,
  Users,
  XIcon
} from 'lucide-react'
import Link from 'next/link'
import Papa from 'papaparse'
import * as XLSX from 'xlsx'

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
import { usePagination } from '@/hooks/use-pagination'
import { cn } from '@/lib/utils'
import { getTableCellLabel } from '@/utils/table'
import { formatLongevity } from '@/utils/formatLongevity'
import { memberStatus, type MemberType } from '@/utils/types'

declare module '@tanstack/react-table' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    filterVariant?: 'text' | 'range' | 'select'
  }
}

const numberFormatter = new Intl.NumberFormat('en-US')
const formatNumber = (value: number) => numberFormatter.format(value)

const getVisibleMatriculationNumber = (status: unknown, matriculationNumber: unknown) => {
  if (status === memberStatus.Pending || status === memberStatus.Awaiting) return 'Pending'

  return String(matriculationNumber ?? '')
}

const columns: ColumnDef<MemberType>[] = [
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
    meta: {
      filterVariant: 'select'
    },
    size: 100
  },
  {
    header: 'Matriculation',
    accessorKey: 'memberMatriculationNumber',
    cell: ({ row }) => {
      const status = row.getValue('memberStatus')
      const matriculationNumber = row.getValue('memberMatriculationNumber')

      return (
        <div className='flex items-center gap-2'>
          <div className='flex flex-col'>
            <span className='font-medium'>{getVisibleMatriculationNumber(status, matriculationNumber)}</span>
          </div>
        </div>
      )
    },
    size: 100
  },
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
  //   header: 'Middle Names',
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
    ),
    size: 100
  },

  {
    accessorKey: 'createdAt', // The key in your data object
    header: 'Longevity',
    cell: ({ row }) => {
      const field = row.getValue('createdAt') as Date

      return <div>{formatLongevity(field)}</div>
    },
    size: 160
  },
  {
    header: 'Recommendation',
    accessorKey: 'delegateRecommendation',
    cell: ({ row }) => {
      const recommendation = row.getValue('delegateRecommendation') as string

      const styles = {
        // transfer: 'text-blue-500 bg-transparent ',
        // confirm: ' text-muted-foreground bg-transparent',
        confirm:
          'bg-green-600/10 text-zinc-600 focus-visible:ring-zinc-600/20 dark:bg-zinc-400/10 dark:text-zinc-400 dark:focus-visible:ring-zinc-400/40 [a&]:hover:bg-zinc-600/5 dark:[a&]:hover:bg-zinc-400/5',
        transfer_From_SAGICAM:
          'bg-orange-600/10 text-orange-600 focus-visible:ring-orange-600/20 dark:bg-orange-400/10 dark:text-orange-400 dark:focus-visible:ring-orange-400/40 [a&]:hover:bg-orange-600/5 dark:[a&]:hover:bg-orange-400/5',
        transfer_From_SAGINIGERIA:
          'bg-orange-600/10 text-orange-600 focus-visible:ring-orange-600/20 dark:bg-orange-400/10 dark:text-orange-400 dark:focus-visible:ring-orange-400/40 [a&]:hover:bg-orange-600/5 dark:[a&]:hover:bg-orange-400/5',
        transfer_From_SAGIEUROPE:
          'bg-orange-600/10 text-orange-600 focus-visible:ring-orange-600/20 dark:bg-orange-400/10 dark:text-orange-400 dark:focus-visible:ring-orange-400/40 [a&]:hover:bg-orange-600/5 dark:[a&]:hover:bg-orange-400/5',
        transfer_From_SAGIGHANA:
          'bg-orange-600/10 text-orange-600 focus-visible:ring-orange-600/20 dark:bg-orange-400/10 dark:text-orange-400 dark:focus-visible:ring-orange-400/40 [a&]:hover:bg-orange-600/5 dark:[a&]:hover:bg-orange-400/5',
        transfer_From_SAGICOTEDIVOIRE:
          'bg-orange-600/10 text-orange-600 focus-visible:ring-orange-600/20 dark:bg-orange-400/10 dark:text-orange-400 dark:focus-visible:ring-orange-400/40 [a&]:hover:bg-orange-600/5 dark:[a&]:hover:bg-orange-400/5',
        transfer_Out:
          'bg-blue-600/10 text-blue-600 focus-visible:ring-blue-600/20 dark:bg-blue-400/10 dark:text-blue-400 dark:focus-visible:ring-blue-400/40 [a&]:hover:bg-blue-600/5 dark:[a&]:hover:bg-blue-400/5',
        transfer_In:
          'bg-purple-600/10 text-purple-600 focus-visible:ring-purple-600/20 dark:bg-purple-400/10 dark:text-purple-400 dark:focus-visible:ring-purple-400/40 [a&]:hover:bg-purple-600/5 dark:[a&]:hover:bg-purple-400/5'
      }[recommendation]

      return (
        <Badge className={cn('rounded-sm border capitalize focus-visible:outline-none', styles)}>
          {row.getValue('delegateRecommendation')}
        </Badge>
      )
    },
    meta: {
      filterVariant: 'select'
    },
    size: 100
  },

  {
    header: 'Status',
    accessorKey: 'memberStatus',
    cell: ({ row }) => {
      const status = row.getValue('memberStatus') as string

      const styles = {
        vested:
          'bg-green-600/10 text-green-600 focus-visible:ring-green-600/20 dark:bg-green-400/10 dark:text-green-400 dark:focus-visible:ring-green-400/40 [a&]:hover:bg-green-600/5 dark:[a&]:hover:bg-green-400/5',
        pending:
          'bg-amber-600/10 text-amber-600 focus-visible:ring-amber-600/20 dark:bg-amber-400/10 dark:text-amber-400 dark:focus-visible:ring-amber-400/40 [a&]:hover:bg-amber-600/5 dark:[a&]:hover:bg-amber-400/5',
        not_in_good_standing:
          'bg-red-600/10 text-red-600 focus-visible:ring-red-600/20 dark:bg-red-400/10 dark:text-red-400 dark:focus-visible:ring-red-400/40 [a&]:hover:bg-red-600/5 dark:[a&]:hover:bg-red-400/5',
        awaiting_publication:
          'bg-blue-600/10 text-blue-600 focus-visible:ring-blue-600/20 dark:bg-blue-400/10 dark:text-blue-400 dark:focus-visible:ring-blue-400/40 [a&]:hover:bg-blue-600/5 dark:[a&]:hover:bg-blue-400/5'
      }[status]

      return (
        <Badge className={cn('rounded-sm border-none capitalize focus-visible:outline-none', styles)}>
          {row.getValue('memberStatus')}
        </Badge>
      )
    },
    meta: {
      filterVariant: 'select'
    },
    size: 100
  },
  {
    header: 'Actions',
    accessorKey: 'id',
    cell: ({ row: { original } }) => {
      // Destructuring 'id' directly from the row data
      const { id } = original

      return <RowActions memberId={id} />
    },
    size: 20
  }
]

const MembersDataTable = ({ data }: { data: MemberType[] }) => {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

  const pageSize = 200

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

  const hasMatriculationColumn = Boolean(table.getColumn('memberMatriculationNumber'))

  const getResponsiveColumnClassName = (columnId: string) =>
    cn(
      hasMatriculationColumn && columnId === 'associationCode' && 'md:hidden lg:table-cell',
      hasMatriculationColumn && columnId === 'memberMatriculationNumber' && 'md:pl-4 lg:pl-2'
    )

  const summaryTotals = table.getCoreRowModel().rows.reduce(
    (acc, row) => {
      const status = row.getValue('memberStatus')

      if (status === memberStatus.Vested) acc.vested += 1
      if (status === memberStatus.Pending) acc.pending += 1
      if (status === memberStatus.Awaiting) acc.awaiting += 1
      if (status === memberStatus.Delinquent) acc.delinquent += 1

      acc.total += 1

      return acc
    },
    {
      vested: 0,
      pending: 0,
      awaiting: 0,
      delinquent: 0,
      total: 0
    }
  )

  const summaryCards = [
    {
      label: 'Vested',
      value: summaryTotals.vested,
      icon: ShieldCheck,
      colorClassName: 'text-green-600 dark:text-green-400',
      cardClassName: 'border-green-500/20 bg-green-500/10'
    },
    {
      label: 'Awaiting',
      value: summaryTotals.awaiting,
      icon: Clock,
      colorClassName: 'text-blue-600 dark:text-blue-400',
      cardClassName: 'border-blue-500/20 bg-blue-500/10'
    },
    {
      label: 'Pending',
      value: summaryTotals.pending,
      icon: Hourglass,
      colorClassName: 'text-amber-600 dark:text-amber-400',
      cardClassName: 'border-amber-500/20 bg-amber-500/10'
    },
    {
      label: 'Delinquent',
      value: summaryTotals.delinquent,
      icon: AlertTriangle,
      colorClassName: 'text-destructive',
      cardClassName: 'border-destructive/20 bg-destructive/10'
    },
    {
      label: 'Total Membership',
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
    link.setAttribute('download', `all-members-${new Date().toISOString().split('T')[0]}.csv`)
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

    XLSX.writeFile(workbook, `all-members-${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  const exportVisibleColumnsToExcel = () => {
    const dataToExport = table.getFilteredRowModel().rows.map(row => {
      const createdAt = row.getValue('createdAt') as Date

      return {
        Code: row.getValue('associationCode'),
        Matriculation: getVisibleMatriculationNumber(
          row.getValue('memberStatus'),
          row.getValue('memberMatriculationNumber')
        ),
        'Last And Middle Names': row.getValue('lastAndMiddleNames'),
        'First Name': row.getValue('firstName'),
        Longevity: formatLongevity(createdAt),
        Recommendation: row.getValue('delegateRecommendation'),
        Status: row.getValue('memberStatus')
      }
    })

    const worksheet = XLSX.utils.json_to_sheet(dataToExport)
    const workbook = XLSX.utils.book_new()

    XLSX.utils.book_append_sheet(workbook, worksheet, 'All Members')

    const cols = [{ wch: 12 }, { wch: 18 }, { wch: 28 }, { wch: 18 }, { wch: 32 }, { wch: 28 }, { wch: 22 }]

    worksheet['!cols'] = cols

    XLSX.writeFile(workbook, `all-members-visible-columns-${new Date().toISOString().split('T')[0]}.xlsx`)
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
    link.setAttribute('download', `all-members-${new Date().toISOString().split('T')[0]}.json`)
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
    <div className='border-primary w-full min-w-0 overflow-hidden rounded-lg border'>
      <div className='border-b'>
        <div className='flex flex-col gap-4 border-b p-4 sm:p-6'>
          <span className='text-xl leading-tight font-semibold sm:text-3xl lg:text-5xl'>
            All Active Members (Admin)
          </span>
          <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-5'>
            {summaryCards.map(status => {
              const Icon = status.icon

              return (
                <Card key={status.label} className={`gap-1 py-2 sm:py-3 ${status.cardClassName}`}>
                  <CardHeader className='px-3 pb-0 sm:px-4'>
                    <CardTitle
                      className={`flex w-full items-center justify-between gap-2 text-xs font-medium sm:text-sm ${status.colorClassName}`}
                    >
                      <span>{status.label}</span>
                      <Icon className='size-4 shrink-0' aria-hidden='true' />
                    </CardTitle>
                  </CardHeader>
                  <CardContent className='px-3 sm:px-4'>
                    <p className={`text-2xl leading-none font-extrabold lg:text-3xl ${status.colorClassName}`}>
                      {formatNumber(status.value)}
                    </p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
          <div className='flex items-center justify-between gap-3 py-2 max-sm:flex-col max-sm:items-stretch sm:px-6 sm:py-4'>
            <p className='text-primary text-sm font-extrabold sm:whitespace-nowrap' aria-live='polite'>
              <span>{formatNumber(table.getRowCount())} Member(s) Found</span>
            </p>

            <div className='flex w-full flex-col items-stretch gap-2 sm:w-auto sm:flex-row sm:items-center'>
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
                      <ChevronLeftIcon aria-hidden='true' className='text-primary' />
                      <span className='text-primary max-sm:hidden'>Previous</span>
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
                          className={`${!isActive && 'bg-primary/10 text-primary hover:bg-primary/20 focus-visible:ring-primary/20 dark:focus-visible:ring-red-300/40'}`}
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
                      <span className='text-primary max-sm:hidden'>Next</span>
                      <ChevronRightIcon aria-hidden='true' className='text-primary' />
                    </Button>
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
              <Button
                type='button'
                onClick={exportVisibleColumnsToExcel}
                disabled={table.getFilteredRowModel().rows.length === 0}
                className='bg-primary/10 text-primary hover:bg-primary/20 focus-visible:ring-primary/20 dark:focus-visible:ring-primary/40 w-full sm:w-auto'
              >
                <FileSpreadsheetIcon />
                Export Page
              </Button>
            </div>
          </div>
          <div className='grid grid-cols-1 gap-6 max-md:*:last:col-span-full sm:grid-cols-2 md:grid-cols-3'>
            {/* <Filter column={table.getColumn('dateOfBirth')!} /> */}
          </div>
        </div>
        <div className='flex items-start gap-4 p-4 max-sm:flex-col sm:items-center sm:justify-between sm:p-6'>
          <div className='grid w-full grid-cols-1 gap-2 sm:grid-cols-2 xl:flex xl:items-center'>
            <Filter column={table.getColumn('associationCode')!} />
            <Filter column={table.getColumn('lastAndMiddleNames')!} />
            {/* <Filter column={table.getColumn('middleName')!} /> */}
            <Filter column={table.getColumn('firstName')!} />

            <Filter column={table.getColumn('delegateRecommendation')!} />
            <Filter column={table.getColumn('memberStatus')!} />
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className='bg-primary/10 text-primary hover:bg-primary/20 focus-visible:ring-primary/20 dark:focus-visible:ring-primary/40 w-full sm:w-auto'>
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
        <Table mobileCards className='md:max-lg:text-xs'>
          <TableHeader>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id} className='bg-primary hover:bg-primary/80 h-14 border-t'>
                {headerGroup.headers.map(header => {
                  return (
                    <TableHead
                      key={header.id}
                      style={{ width: `${header.getSize()}px` }}
                      className={cn(
                        'font-extrabold text-white first:pl-4 last:px-4',
                        getResponsiveColumnClassName(header.column.id)
                      )}
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
                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'} className='hover:bg-primary/30'>
                  {row.getVisibleCells().map(cell => {
                    const cellLabel = getTableCellLabel(cell)

                    return (
                      <TableCell
                        key={cell.id}
                        data-label={cellLabel}
                        className={cn(
                          'h-14 first:w-12.5 first:pl-4 last:w-29 last:px-4',
                          getResponsiveColumnClassName(cell.column.id)
                        )}
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
                  No Member Found, add members.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

export default MembersDataTable

function Filter({ column }: { column: Column<any, unknown> }) {
  const id = useId()
  const columnFilterValue = column.getFilterValue()
  const { filterVariant } = column.columnDef.meta ?? {}
  const columnHeader = typeof column.columnDef.header === 'string' ? column.columnDef.header : ''
  const filterValue = (columnFilterValue ?? '') as string
  const searchLabel = column.id === 'lastAndMiddleNames' ? 'last or middle name' : columnHeader.toLowerCase()

  const sortedUniqueValues = useMemo(() => {
    if (filterVariant === 'range') return []

    const values = Array.from(column.getFacetedUniqueValues().keys())

    const flattenedValues = values.reduce((acc: string[], curr) => {
      if (Array.isArray(curr)) {
        return [...acc, ...curr]
      }

      return [...acc, curr]
    }, [])

    return Array.from(new Set(flattenedValues)).sort()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [column.getFacetedUniqueValues(), filterVariant])

  if (filterVariant === 'select') {
    return (
      <div className='border-primary w-full space-y-2 rounded border border-dashed sm:max-w-2xs'>
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
    <div className='border-primary w-full rounded border sm:max-w-2xs'>
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

function RowActions({ memberId }: { memberId: string }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className='flex'>
          <Button size='icon' variant='ghost' className='rounded-full p-2' aria-label='Edit item'>
            <Ellipsis className='size-6' aria-hidden='true' />
          </Button>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='center' className='border-primary rounded border'>
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <Link href={`/admin-all-members/${memberId}/edit`}>
              <span className='flex gap-3 text-blue-500'>
                <Pencil className='text-blue-500' />
                Edit Member&apos;s Details
              </span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Link href={`/admin-all-members/${memberId}/deathAnnouncement`}>
              <span className='flex gap-3 text-purple-500'>
                <Cross className='text-purple-500' />
                Announce Member&apos;s Dead
              </span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Link href={`/admin-all-members/${memberId}/removeMember`}>
              <span className='flex gap-3 text-red-500'>
                <Trash2 className='text-red-500' />
                Remove Member
              </span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
