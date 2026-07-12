'use client'

import type { ComponentProps } from 'react'

import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem } from '@/components/ui/pagination'
import { cn } from '@/lib/utils'

type ButtonVariant = ComponentProps<typeof Button>['variant']

type PaginationControlsProps = {
  activePage: number
  canNext: boolean
  canPrevious: boolean
  getPageButtonClassName?: (isActive: boolean) => string | undefined
  iconClassName?: string
  labelClassName?: string
  nextAriaLabel?: string
  nextLabel?: string
  onNext: () => void
  onPageChange: (page: number) => void
  onPrevious: () => void
  pageButtonVariant?: (isActive: boolean) => ButtonVariant
  pages: number[]
  previousAriaLabel?: string
  previousLabel?: string
  showLeftEllipsis: boolean
  showRightEllipsis: boolean
}

const PaginationControls = ({
  activePage,
  canNext,
  canPrevious,
  getPageButtonClassName,
  iconClassName,
  labelClassName = 'max-sm:hidden',
  nextAriaLabel = 'Go to next page',
  nextLabel = 'Next',
  onNext,
  onPageChange,
  onPrevious,
  pageButtonVariant,
  pages,
  previousAriaLabel = 'Go to previous page',
  previousLabel = 'Previous',
  showLeftEllipsis,
  showRightEllipsis
}: PaginationControlsProps) => {
  return (
    <Pagination className='mx-0 w-auto justify-center sm:justify-end'>
      <PaginationContent className='w-max max-w-full flex-nowrap'>
        <PaginationItem>
          <Button
            type='button'
            className='disabled:pointer-events-none disabled:opacity-50'
            variant='ghost'
            onClick={onPrevious}
            disabled={!canPrevious}
            aria-label={previousAriaLabel}
          >
            <ChevronLeftIcon aria-hidden='true' className={iconClassName} />
            <span className={labelClassName}>{previousLabel}</span>
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
                variant={pageButtonVariant?.(isActive)}
                className={cn(getPageButtonClassName?.(isActive))}
                onClick={() => onPageChange(page)}
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
            className='disabled:pointer-events-none disabled:opacity-50'
            variant='ghost'
            onClick={onNext}
            disabled={!canNext}
            aria-label={nextAriaLabel}
          >
            <span className={labelClassName}>{nextLabel}</span>
            <ChevronRightIcon aria-hidden='true' className={iconClassName} />
          </Button>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}

export default PaginationControls
