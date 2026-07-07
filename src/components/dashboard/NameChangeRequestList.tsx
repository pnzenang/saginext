'use client'

import { useMemo, useState } from 'react'

import { FileText, Search, X } from 'lucide-react'

import PaginationControls from '@/components/global/PaginationControls'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { usePagination } from '@/hooks/use-pagination'
import { usePersistentState } from '@/hooks/use-persistent-state'
import { nameChangeRequestStatusLabels, type NameChangeRequestStatus } from '@/utils/types'

import NameChangeRequestCard, { type NameChangeRequestCardData } from './NameChangeRequestCard'

const getStatusLabel = (status: string) => nameChangeRequestStatusLabels[status as NameChangeRequestStatus] ?? status

const pageSizeOptions = [6, 12, 24, 48]

const getRequestSearchValue = (request: NameChangeRequestCardData) =>
  [
    request.associationCode,
    request.associationName,
    request.currentFirstName,
    request.currentLastAndMiddleNames,
    request.member?.associationCode,
    request.member?.associationName,
    request.member?.firstName,
    request.member?.lastAndMiddleNames,
    request.member?.memberMatriculationNumber,
    request.rejectionReason,
    request.requestedFirstName,
    request.requestedLastAndMiddleNames,
    getStatusLabel(request.status),
    request.status
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

const NameChangeRequestList = ({
  emptyDescription,
  emptyTitle,
  isAdminUser,
  requests,
  searchPlaceholder,
  storageKey
}: {
  emptyDescription: string
  emptyTitle: string
  isAdminUser: boolean
  requests: NameChangeRequestCardData[]
  searchPlaceholder: string
  storageKey: string
}) => {
  const [search, setSearch] = usePersistentState(storageKey, '')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(pageSizeOptions[0])
  const normalizedSearch = search.trim().toLowerCase()

  const filteredRequests = useMemo(() => {
    if (!normalizedSearch) return requests

    return requests.filter(request => getRequestSearchValue(request).includes(normalizedSearch))
  }, [normalizedSearch, requests])

  const searchInputId = `${storageKey.replace(/[^a-z0-9-]/gi, '-')}-search`
  const totalPages = Math.max(1, Math.ceil(filteredRequests.length / pageSize))
  const activePage = Math.min(currentPage, totalPages)
  const pageStartIndex = (activePage - 1) * pageSize
  const pageEndIndex = Math.min(pageStartIndex + pageSize, filteredRequests.length)
  const paginatedRequests = filteredRequests.slice(pageStartIndex, pageEndIndex)

  const { pages, showLeftEllipsis, showRightEllipsis } = usePagination({
    currentPage: activePage,
    paginationItemsToDisplay: 3,
    totalPages
  })

  const handleSearchChange = (value: string) => {
    setSearch(value)
    setCurrentPage(1)
  }

  const handlePageSizeChange = (value: string) => {
    setPageSize(Number(value))
    setCurrentPage(1)
  }

  return (
    <div className='grid gap-3'>
      {requests.length > 0 ? (
        <Card className='rounded-lg py-0'>
          <CardContent className='grid gap-3 px-3 py-3 sm:px-4'>
            <div className='grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center'>
              <form role='search' onSubmit={event => event.preventDefault()} className='min-w-0'>
                <label htmlFor={searchInputId} className='sr-only'>
                  Search name change requests
                </label>
                <div className='relative'>
                  <Search className='text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2' />
                  <Input
                    id={searchInputId}
                    type='search'
                    value={search}
                    onChange={event => handleSearchChange(event.target.value)}
                    placeholder={searchPlaceholder}
                    className='bg-background h-10 pl-9 text-sm font-semibold'
                  />
                </div>
              </form>
              <div className='grid gap-2 sm:grid-cols-[auto_auto] sm:items-center'>
                <div className='flex items-center gap-2'>
                  <span className='text-muted-foreground text-sm font-semibold whitespace-nowrap'>
                    Entries per page
                  </span>
                  <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
                    <SelectTrigger className='bg-background h-10 w-24'>
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
                {normalizedSearch ? (
                  <Button
                    type='button'
                    variant='outline'
                    size='sm'
                    className='h-10 w-full sm:w-fit'
                    onClick={() => {
                      setSearch('')
                      setCurrentPage(1)
                    }}
                  >
                    <X />
                    Clear
                  </Button>
                ) : null}
              </div>
            </div>

            <p className='text-muted-foreground text-sm font-medium' aria-live='polite'>
              {filteredRequests.length > 0
                ? `Showing ${pageStartIndex + 1}-${pageEndIndex} of ${filteredRequests.length} matching request${
                    filteredRequests.length === 1 ? '' : 's'
                  }`
                : `No matching requests out of ${requests.length}`}
            </p>
          </CardContent>
        </Card>
      ) : null}

      {requests.length === 0 ? (
        <Card className='rounded-lg'>
          <CardContent className='py-8 text-center'>
            <FileText className='text-muted-foreground mx-auto mb-3 size-8' />
            <p className='font-semibold'>{emptyTitle}</p>
            <p className='text-muted-foreground mt-1 text-sm'>{emptyDescription}</p>
          </CardContent>
        </Card>
      ) : filteredRequests.length === 0 ? (
        <Card className='rounded-lg'>
          <CardContent className='py-8 text-center'>
            <Search className='text-muted-foreground mx-auto mb-3 size-8' />
            <p className='font-semibold'>No name change requests match your search.</p>
            <p className='text-muted-foreground mt-1 text-sm'>
              Try another name, matriculation number, association code, association name, or status.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className='grid gap-4 xl:grid-cols-2 2xl:grid-cols-3'>
          {paginatedRequests.map(request => (
            <NameChangeRequestCard key={request.id} request={request} isAdminUser={isAdminUser} />
          ))}
        </div>
      )}

      {filteredRequests.length > 0 ? (
        <div className='bg-background flex max-w-full flex-col items-center justify-between gap-3 rounded-lg border px-3 py-3 sm:flex-row'>
          <p className='text-muted-foreground text-sm font-semibold' aria-live='polite'>
            Page {activePage} of {totalPages}
          </p>
          <PaginationControls
            activePage={activePage}
            canNext={activePage < totalPages}
            canPrevious={activePage > 1}
            getPageButtonClassName={isActive =>
              isActive ? undefined : 'bg-primary/10 text-primary hover:bg-primary/20'
            }
            iconClassName='text-primary'
            onNext={() => setCurrentPage(Math.min(totalPages, activePage + 1))}
            onPageChange={setCurrentPage}
            onPrevious={() => setCurrentPage(Math.max(1, activePage - 1))}
            pages={pages}
            showLeftEllipsis={showLeftEllipsis}
            showRightEllipsis={showRightEllipsis}
          />
        </div>
      ) : null}
    </div>
  )
}

export default NameChangeRequestList
