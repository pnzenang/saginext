'use client'

import { useId, useMemo, useState } from 'react'

import {
  AlertTriangleIcon,
  ArrowUpDown,
  CheckIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  DownloadIcon,
  EllipsisVerticalIcon,
  EyeIcon,
  MailIcon,
  SearchIcon,
  Trash2Icon,
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

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem } from '@/components/ui/pagination'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

import { usePagination } from '@/hooks/use-pagination'
import { usePersistentColumnFilters } from '@/hooks/use-persistent-column-filters'

import { cn } from '@/lib/utils'
import { getTableCellLabel } from '@/utils/table'

declare module '@tanstack/react-table' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    filterVariant?: 'text' | 'range' | 'select'
  }
}

export type Item = {
  id: string
  status: 'downloaded' | 'draft' | 'paid' | 'past due'
  avatar: string
  fallback: string
  client: string
  field: string
  total: number
  issuedDate: Date
  balance: number
}

const columns: ColumnDef<Item>[] = [
  {
    header: 'ID',
    accessorKey: 'id',
    cell: ({ row }) => <span className='text-muted-foreground'>#{row.getValue('id')}</span>,
    size: 100
  },

  {
    header: 'Client',
    accessorKey: 'client',
    cell: ({ row }) => (
      <div className='flex items-center gap-2'>
        <div className='flex flex-col'>
          <span className='font-medium'>{row.getValue('client')}</span>
        </div>
      </div>
    ),
    size: 280
  },
  {
    header: 'Total',
    accessorKey: 'total',
    cell: ({ row }) => {
      const total = parseFloat(row.getValue('total'))

      const formatted = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(total)

      return <span>{formatted}</span>
    }
  },
  {
    header: 'Issued Date',
    accessorKey: 'issuedDate',
    cell: ({ row }) => {
      const date = row.getValue('issuedDate') as Date

      const formatted = date.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: '2-digit'
      })

      return <span className='text-muted-foreground'>{formatted}</span>
    }
  }
  // {
  //   header: 'Balance',
  //   accessorKey: 'balance',
  //   cell: ({ row }) => {
  //     const balance = parseFloat(row.getValue('balance'))

  //     const formatted = new Intl.NumberFormat('en-US', {
  //       style: 'currency',
  //       currency: 'USD'
  //     }).format(balance)

  //     return (
  //       <>
  //         {row.original.balance === 0 ? (
  //           <Badge className='rounded-sm bg-green-600/10 text-green-600 focus-visible:ring-green-600/20 dark:bg-green-400/10 dark:text-green-400 dark:focus-visible:ring-green-400/40 [a&]:hover:bg-green-600/5 dark:[a&]:hover:bg-green-400/5'>
  //             Paid
  //           </Badge>
  //         ) : (
  //           <span>{formatted}</span>
  //         )}
  //       </>
  //     )
  //   }
  // }
  // {
  //   id: 'actions',
  //   header: () => 'Actions',
  //   cell: () => (
  //     <div className='flex items-center justify-center gap-1'>
  //       <Tooltip>
  //         <TooltipTrigger asChild>
  //           <Button variant='ghost' size={'icon'} aria-label='Delete item'>
  //             <Trash2Icon className='size-4.5' />
  //           </Button>
  //         </TooltipTrigger>
  //         <TooltipContent>
  //           <p>Delete</p>
  //         </TooltipContent>
  //       </Tooltip>
  //       <Tooltip>
  //         <TooltipTrigger asChild>
  //           <Button variant='ghost' size={'icon'} aria-label='View item'>
  //             <EyeIcon className='size-4.5' />
  //           </Button>
  //         </TooltipTrigger>
  //         <TooltipContent>
  //           <p>View</p>
  //         </TooltipContent>
  //       </Tooltip>
  //       {/* <RowActions /> */}
  //     </div>
  //   ),
  //   size: 128,
  //   enableHiding: false
  // }
]

const InvoiceDatatable = ({ data }: { data: Item[] }) => {
  const [columnFilters, setColumnFilters] = usePersistentColumnFilters('sagi:invoice-demo:columnFilters')

  const pageSize = 5

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

  const { pages, showLeftEllipsis, showRightEllipsis } = usePagination({
    currentPage: table.getState().pagination.pageIndex + 1,
    totalPages: table.getPageCount(),
    paginationItemsToDisplay: 2
  })

  return (
    <div className='w-full min-w-0 overflow-hidden'>
      <div className='border-b'>
        <div className='flex flex-col gap-4 p-4 sm:p-6 lg:flex-row lg:items-center lg:justify-between'>
          <div className='flex items-center gap-4'>
            <div className='flex items-center gap-2'>
              <Label htmlFor='#rowSelect' className='text-muted-foreground text-base font-normal max-sm:sr-only'>
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
                  {[5, 10].map(pageSize => (
                    <SelectItem key={pageSize} value={pageSize.toString()}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className='flex w-full flex-1 flex-wrap items-center gap-4 lg:justify-end'>
            <Filter column={table.getColumn('client')!} />
            {/* <Filter column={table.getColumn('status')!} /> */}
          </div>
        </div>
        <Table mobileCards>
          <TableHeader>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id} className='h-20 border-t'>
                {headerGroup.headers.map(header => {
                  return (
                    <TableHead
                      key={header.id}
                      style={{ width: `${header.getSize()}px` }}
                      className='text-muted-foreground first:pl-4 last:px-4 last:text-center'
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
                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'} className='hover:bg-transparent'>
                  {row.getVisibleCells().map(cell => {
                    const cellLabel = getTableCellLabel(cell)

                    return (
                      <TableCell key={cell.id} data-label={cellLabel} className='h-20 first:pl-4'>
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
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className='flex items-center justify-between gap-3 px-4 py-3 max-sm:flex-col max-sm:items-stretch sm:px-6 sm:py-4 md:max-lg:flex-col'>
        <p className='text-muted-foreground text-sm sm:whitespace-nowrap' aria-live='polite'>
          Showing{' '}
          <span>
            {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{' '}
            {Math.min(
              Math.max(
                table.getState().pagination.pageIndex * table.getState().pagination.pageSize +
                  table.getState().pagination.pageSize,
                0
              ),
              table.getRowCount()
            )}
          </span>{' '}
          of <span>{table.getRowCount().toString()} entries</span>
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
                  <ChevronLeftIcon aria-hidden='true' />
                  <span className='max-sm:hidden'>Previous</span>
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
                      className={`${!isActive && 'bg-primary/10 text-primary hover:bg-primary/20 focus-visible:ring-primary/20 dark:focus-visible:ring-primary/40'}`}
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
                  <span className='max-sm:hidden'>Next</span>
                  <ChevronRightIcon aria-hidden='true' />
                </Button>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </div>
  )
}

export default InvoiceDatatable

function Filter({ column }: { column: Column<any, unknown> }) {
  const id = useId()
  const columnFilterValue = column.getFilterValue()
  const { filterVariant } = column.columnDef.meta ?? {}
  const columnHeader = typeof column.columnDef.header === 'string' ? column.columnDef.header : ''
  const filterValue = (columnFilterValue ?? '') as string

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
      <div className='w-full sm:max-w-2xs'>
        <Label htmlFor={`${id}-select`} className='sr-only'>
          {columnHeader}
        </Label>
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
    <div className='w-full sm:max-w-2xs'>
      <Label htmlFor={`${id}-input`} className='sr-only'>
        {columnHeader}
      </Label>
      <div className='relative'>
        <Input
          id={`${id}-input`}
          className='peer pr-9 pl-9'
          value={filterValue}
          onChange={e => column.setFilterValue(e.target.value)}
          placeholder={`Search ${columnHeader.toLowerCase()}`}
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
            aria-label={`Clear ${columnHeader.toLowerCase()} search`}
          >
            <XIcon className='size-3.5' />
          </Button>
        ) : null}
      </div>
    </div>
  )
}

function RowActions() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className='flex'>
          <Button size='icon' variant='ghost' className='rounded-full p-2' aria-label='Edit item'>
            <EllipsisVerticalIcon className='size-4.5' aria-hidden='true' />
          </Button>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='start'>
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <span>Edit</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <span>Duplicate</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
