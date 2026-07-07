'use client'

import { Children, useMemo, useState, type ReactNode } from 'react'

import { Search } from 'lucide-react'

import PaginationControls from '@/components/global/PaginationControls'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { usePagination } from '@/hooks/use-pagination'

export type DeathDocumentationCasesListItem = {
  id: string
  searchText: string
}

type DeathDocumentationCasesListProps = {
  cases: DeathDocumentationCasesListItem[]
  children: ReactNode
  emptyDescription: string
}

const pageSizeOptions = [5, 10, 25, 50]

const DeathDocumentationCasesList = ({ cases, children, emptyDescription }: DeathDocumentationCasesListProps) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(pageSizeOptions[0])
  const caseNodes = Children.toArray(children)
  const normalizedSearchQuery = searchQuery.trim().toLowerCase()

  const filteredCases = useMemo(() => {
    return cases
      .map((item, index) => ({ ...item, index }))
      .filter(item => !normalizedSearchQuery || item.searchText.includes(normalizedSearchQuery))
  }, [cases, normalizedSearchQuery])

  const totalPages = Math.max(1, Math.ceil(filteredCases.length / pageSize))
  const activePage = Math.min(currentPage, totalPages)
  const pageStartIndex = (activePage - 1) * pageSize
  const pageEndIndex = Math.min(pageStartIndex + pageSize, filteredCases.length)
  const paginatedCases = filteredCases.slice(pageStartIndex, pageEndIndex)
  const hasSearchQuery = normalizedSearchQuery.length > 0

  const { pages, showLeftEllipsis, showRightEllipsis } = usePagination({
    currentPage: activePage,
    paginationItemsToDisplay: 3,
    totalPages
  })

  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    setCurrentPage(1)
  }

  const handlePageSizeChange = (value: string) => {
    setPageSize(Number(value))
    setCurrentPage(1)
  }

  return (
    <div className='grid gap-4'>
      <Card className='rounded-lg py-0'>
        <CardContent className='grid gap-3 px-3 py-3 sm:px-4'>
          <div className='grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center'>
            <div className='relative min-w-0'>
              <Search className='text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2' />
              <Input
                value={searchQuery}
                onChange={event => handleSearchChange(event.target.value)}
                placeholder='Search by deceased name, code, or place of death'
                className='h-10 pl-9'
                aria-label='Search by deceased name, code, or place of death'
              />
            </div>
            <div className='flex items-center gap-2'>
              <span className='text-muted-foreground text-sm font-semibold whitespace-nowrap'>Entries per page</span>
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
          </div>

          <p className='text-muted-foreground text-sm font-medium' aria-live='polite'>
            {filteredCases.length > 0
              ? `Showing ${pageStartIndex + 1}-${pageEndIndex} of ${filteredCases.length} case${
                  filteredCases.length === 1 ? '' : 's'
                }`
              : 'No cases match your search'}
          </p>
        </CardContent>
      </Card>

      {filteredCases.length === 0 ? (
        <Card className='rounded-lg'>
          <CardContent className='py-8 text-center'>
            <Search className='text-muted-foreground mx-auto mb-3 size-8' />
            <p className='font-semibold'>No matching death documentation cases found.</p>
            <p className='text-muted-foreground mt-1 text-sm'>
              {hasSearchQuery
                ? 'Search by deceased name, association code, matriculation code, or place of death.'
                : emptyDescription}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className='grid gap-5'>
          {paginatedCases.map(item => (
            <div key={item.id}>{caseNodes[item.index]}</div>
          ))}
        </div>
      )}

      {filteredCases.length > 0 ? (
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

export default DeathDocumentationCasesList
