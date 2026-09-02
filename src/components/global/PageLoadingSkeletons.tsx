import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { cn } from '@/lib/utils'

type MemberTableTone = 'primary' | 'purple' | 'red'

const memberTableToneClassNames: Record<
  MemberTableTone,
  {
    border: string
    header: string
    rowHover: string
    text: string
  }
> = {
  primary: {
    border: 'border-primary',
    header: 'bg-primary',
    rowHover: 'hover:bg-primary/30',
    text: 'text-primary'
  },
  purple: {
    border: 'border-purple-500',
    header: 'bg-purple-500',
    rowHover: 'hover:bg-purple-300/30',
    text: 'text-purple-500'
  },
  red: {
    border: 'border-destructive',
    header: 'bg-red-400',
    rowHover: 'hover:bg-red-400/30',
    text: 'text-red-500'
  }
}

const formToneClassNames = {
  muted: {
    icon: 'bg-primary/35',
    panel: 'border-primary bg-muted',
    text: 'bg-primary/35'
  },
  primary: {
    icon: 'bg-primary/35',
    panel: 'border-primary bg-muted',
    text: 'bg-primary/35'
  },
  profile: {
    icon: 'bg-primary/35',
    panel: 'border-primary bg-primary/15',
    text: 'bg-primary/35'
  },
  purple: {
    icon: 'bg-purple-500/35',
    panel: 'border-purple-800 bg-purple-300/50',
    text: 'bg-purple-500/35'
  },
  red: {
    icon: 'bg-red-500/35',
    panel: 'border-destructive bg-red-800/40',
    text: 'bg-red-500/35'
  }
} as const

type FormTone = keyof typeof formToneClassNames

const skeletonCards = Array.from({ length: 5 })

const LoadingField = ({ labelClassName = 'w-36' }: { labelClassName?: string }) => (
  <div className='min-w-0'>
    <Skeleton className={cn('mb-1 h-4 max-w-full', labelClassName)} />
    <Skeleton className='bg-background/70 h-9 w-full rounded-md border' />
  </div>
)

const PaginationSkeleton = ({ className }: { className?: string }) => (
  <div className={cn('flex items-center gap-1', className)}>
    <Skeleton className='h-10 w-10 rounded-md sm:w-24' />
    <Skeleton className='h-10 w-10 rounded-md' />
    <Skeleton className='h-10 w-10 rounded-md' />
    <Skeleton className='h-10 w-10 rounded-md sm:w-20' />
  </div>
)

const SummaryCardsSkeleton = ({ compact = false, count = 5 }: { compact?: boolean; count?: number }) => {
  const cards = Array.from({ length: count })

  return (
    <div className={cn('grid gap-3 sm:grid-cols-2', count >= 6 ? 'lg:grid-cols-6' : 'lg:grid-cols-5')}>
      {cards.map((_, index) => (
        <Card key={index} className={cn('gap-1 py-2 sm:py-3', compact && 'gap-2 py-4')}>
          <CardHeader className='px-3 pb-0 sm:px-4'>
            <div className='flex items-center justify-between gap-2'>
              <Skeleton className='h-4 w-20' />
              <Skeleton className='size-4 rounded-md' />
            </div>
          </CardHeader>
          <CardContent className='px-3 sm:px-4'>
            <Skeleton className={cn('h-7 w-16', compact && 'h-9 w-20')} />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

const PaymentRouteCardsSkeleton = () => (
  <div className='grid w-full grid-cols-1 items-stretch gap-4 lg:grid-cols-2'>
    {Array.from({ length: 2 }).map((_, index) => (
      <div
        key={index}
        className='border-primary/20 bg-primary/10 flex min-w-0 flex-col rounded-md border px-3 py-3 sm:px-4'
      >
        <Skeleton className='h-6 w-full max-w-80' />
        <Skeleton className='mt-2 h-4 w-full max-w-sm' />
        <div className='mt-3 grid gap-1.5'>
          <Skeleton className='h-4 w-full max-w-xs' />
          <Skeleton className='h-4 w-full max-w-xs' />
        </div>
        <Skeleton className='mt-4 h-10 w-56 rounded-md' />
      </div>
    ))}
  </div>
)

type MemberTableSkeletonProps = {
  columnCount?: number
  filterCount?: number
  rowCount?: number
  showExportPage?: boolean
  showPaymentCards?: boolean
  showSummaryCards?: boolean
  titleClassName?: string
  tone?: MemberTableTone
}

const MemberTableSkeleton = ({
  columnCount = 7,
  filterCount = 4,
  rowCount = 8,
  showExportPage = false,
  showPaymentCards = false,
  showSummaryCards = false,
  titleClassName = 'max-w-80',
  tone = 'primary'
}: MemberTableSkeletonProps) => {
  const toneClassNames = memberTableToneClassNames[tone]
  const columns = Array.from({ length: columnCount })
  const rows = Array.from({ length: rowCount })
  const filters = Array.from({ length: filterCount })

  return (
    <div className={cn('w-full min-w-0 overflow-hidden rounded-lg border', toneClassNames.border)} aria-busy='true'>
      <div className='border-b'>
        <div className='flex flex-col gap-4 border-b p-4 sm:p-6'>
          <Skeleton className={cn('h-7 w-full sm:h-9 lg:h-12', titleClassName)} />
          {showSummaryCards ? <SummaryCardsSkeleton compact={tone === 'purple'} /> : null}
          {showPaymentCards ? <PaymentRouteCardsSkeleton /> : null}
          <div className='flex items-center justify-between gap-3 py-2 max-sm:flex-col max-sm:items-stretch sm:px-6 sm:py-4'>
            <Skeleton className='h-5 w-full max-w-52' />
            <div className='flex w-full flex-col items-stretch gap-2 sm:w-auto sm:flex-row sm:items-center'>
              <PaginationSkeleton className='justify-end' />
              {showExportPage ? (
                <div className='grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:items-center'>
                  <Skeleton className='h-10 w-full rounded-md sm:w-32' />
                  <Skeleton className='h-10 w-full rounded-md sm:w-28' />
                </div>
              ) : null}
            </div>
          </div>
        </div>
        <div className='flex items-start gap-4 p-4 max-sm:flex-col sm:items-center sm:justify-between sm:p-6'>
          <div className='grid w-full grid-cols-1 gap-2 sm:grid-cols-2 xl:flex xl:items-center'>
            {filters.map((_, index) => (
              <Skeleton
                key={index}
                className={cn('bg-background/70 h-10 w-full rounded border sm:max-w-2xs', toneClassNames.border)}
              />
            ))}
          </div>
          <div className='flex w-full flex-col items-stretch gap-2 sm:w-auto sm:flex-row sm:items-center sm:justify-between'>
            <Skeleton className='h-10 w-full rounded-md sm:w-24' />
            <Skeleton className='h-10 w-full rounded-md sm:w-28' />
          </div>
        </div>
        <div className='hidden sm:block'>
          <Table mobileCards className='md:max-lg:text-xs'>
            <TableHeader>
              <TableRow className={cn('h-14 border-t hover:opacity-95', toneClassNames.header)}>
                {columns.map((_, index) => (
                  <TableHead key={index} className='first:pl-4 last:px-4'>
                    <Skeleton className='h-5 w-full bg-white/35' />
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((_, rowIndex) => (
                <TableRow key={rowIndex} className={toneClassNames.rowHover}>
                  {columns.map((_, columnIndex) => (
                    <TableCell key={columnIndex} className='h-14 first:pl-4 last:px-4'>
                      <Skeleton className='h-5 w-full' />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className='grid gap-3 p-3 sm:hidden'>
          {Array.from({ length: 4 }).map((_, index) => (
            <article key={index} className='bg-background overflow-hidden rounded-md border shadow-sm'>
              <div className='border-b px-4 py-3'>
                <Skeleton className='h-5 w-44' />
                <Skeleton className='mt-2 h-4 w-24' />
              </div>
              <div className='grid gap-3 px-4 py-3'>
                {Array.from({ length: 4 }).map((__, itemIndex) => (
                  <div key={itemIndex} className='grid grid-cols-[minmax(0,1fr)_auto] gap-4'>
                    <Skeleton className='h-4 w-24' />
                    <Skeleton className='h-4 w-20' />
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
        <div className='flex justify-center border-t p-4 sm:justify-end sm:p-6'>
          <PaginationSkeleton />
        </div>
      </div>
    </div>
  )
}

type MemberTablePageSkeletonProps = MemberTableSkeletonProps

const MemberTablePageSkeleton = (props: MemberTablePageSkeletonProps) => (
  <div className='py-8 sm:py-10'>
    <div className='max-w-9xl mx-auto px-2 sm:px-6 lg:px-8'>
      <Card className='max-w-9xl mx-auto w-full py-0'>
        <MemberTableSkeleton {...props} />
      </Card>
    </div>
  </div>
)

const PaymentAlertSkeleton = () => (
  <div className='border-primary/20 bg-primary/5 w-full max-w-full min-w-0 overflow-hidden rounded-md border p-4'>
    <div className='flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between'>
      <div className='min-w-0 flex-1'>
        <div className='flex min-w-0 items-center gap-2'>
          <Skeleton className='size-5 rounded-md' />
          <Skeleton className='h-6 w-full max-w-80' />
        </div>
        <Skeleton className='mt-2 h-4 w-full max-w-md' />
      </div>
      <Skeleton className='h-9 w-full rounded-md sm:w-20' />
    </div>
    <div className='mt-4 rounded-md border border-dashed px-3 py-4'>
      <Skeleton className='mx-auto h-4 w-full max-w-64' />
    </div>
  </div>
)

const ContributionAssessmentSkeleton = () => (
  <Card className='border-primary/30 bg-primary/10 w-full max-w-full min-w-0 overflow-hidden py-0'>
    <CardHeader className='border-primary/20 min-w-0 border-b py-5'>
      <Skeleton className='h-6 w-full max-w-80' />
      <Skeleton className='mt-2 h-4 w-full max-w-3xl' />
      <Skeleton className='h-4 w-full max-w-2xl' />
    </CardHeader>
    <CardContent className='min-w-0 py-5'>
      <div className='grid w-full min-w-0 gap-4'>
        <div className='grid w-full min-w-0 grid-cols-[minmax(0,1fr)] gap-4 md:grid-cols-4 md:items-end'>
          <LoadingField labelClassName='w-44' />
          <LoadingField labelClassName='w-36' />
          <Skeleton className='h-10 w-full rounded-md' />
          <Skeleton className='h-10 w-full rounded-md bg-red-600/40' />
        </div>
        <Skeleton className='h-4 w-full max-w-72' />
      </div>
    </CardContent>
  </Card>
)

const AdminPaymentsTableSkeleton = ({ columnCount = 10 }: { columnCount?: number }) => {
  const columns = Array.from({ length: columnCount })
  const rows = Array.from({ length: 8 })

  return (
    <div className='border-border w-full max-w-full min-w-0 overflow-hidden rounded-lg border' aria-busy='true'>
      <div className='flex flex-col gap-3 border-b p-3 sm:flex-row sm:items-center sm:justify-between'>
        <Skeleton className='h-10 w-full max-w-md rounded-md' />
        <Skeleton className='h-9 w-full rounded-md sm:w-32' />
      </div>
      <div className='hidden w-full min-w-0 overflow-x-auto lg:block'>
        <Table className='table-fixed text-xs [&_td]:whitespace-normal [&_th]:whitespace-normal'>
          <TableHeader>
            <TableRow className='bg-primary hover:bg-primary h-14'>
              {columns.map((_, index) => (
                <TableHead key={index} className='h-14 px-2'>
                  <Skeleton className='h-5 w-full bg-white/35' />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((_, rowIndex) => (
              <TableRow key={rowIndex} className='odd:bg-muted/30 even:bg-background h-[5.875rem]'>
                {columns.map((_, columnIndex) => (
                  <TableCell key={columnIndex} className='px-2 py-4'>
                    <Skeleton className={cn('h-5 w-full', columnIndex >= columnCount - 2 && 'h-16 rounded-md')} />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow className='bg-primary/10 h-[5.875rem]'>
              {columns.map((_, index) => (
                <TableCell key={index} className='px-2 py-4'>
                  <Skeleton className='h-5 w-full' />
                </TableCell>
              ))}
            </TableRow>
          </TableFooter>
        </Table>
      </div>
      <div className='grid w-full min-w-0 gap-3 p-3 lg:hidden'>
        {Array.from({ length: 4 }).map((_, index) => (
          <article
            key={index}
            className='bg-background w-full max-w-full min-w-0 overflow-hidden rounded-md border shadow-sm'
          >
            <div className='flex min-w-0 flex-col gap-3 border-b px-4 py-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4'>
              <div className='min-w-0 flex-1'>
                <Skeleton className='h-5 w-full max-w-52' />
                <Skeleton className='mt-2 h-4 w-20' />
              </div>
              <Skeleton className='h-20 w-full rounded-md sm:w-56' />
            </div>
            <div className='grid min-w-0 gap-3 px-4 py-3'>
              {Array.from({ length: 5 }).map((__, itemIndex) => (
                <div key={itemIndex} className='grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-start gap-4'>
                  <Skeleton className='h-4 w-28' />
                  <Skeleton className='h-5 w-24' />
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>
      <div className='flex flex-col items-center justify-between gap-3 border-t p-3 sm:flex-row'>
        <Skeleton className='h-5 w-32' />
        <PaginationSkeleton />
      </div>
    </div>
  )
}

const AdminPaymentPageSkeleton = ({
  columnCount,
  showAssessment = false,
  titleWidth = 'max-w-96'
}: {
  columnCount: number
  showAssessment?: boolean
  titleWidth?: string
}) => (
  <section className='flex w-full min-w-0 flex-col gap-6 overflow-hidden py-8 sm:py-10' aria-busy='true'>
    <div className='min-w-0'>
      <Skeleton className={cn('h-7 w-full md:h-10', titleWidth)} />
      <Skeleton className='mt-2 h-4 w-full max-w-4xl' />
      <Skeleton className='mt-2 h-4 w-full max-w-3xl' />
    </div>
    <PaymentAlertSkeleton />
    {showAssessment ? <ContributionAssessmentSkeleton /> : null}
    <Card className='w-full max-w-full min-w-0 overflow-hidden'>
      <CardHeader className='min-w-0'>
        <Skeleton className='h-6 w-full max-w-72' />
      </CardHeader>
      <CardContent className='min-w-0'>
        <AdminPaymentsTableSkeleton columnCount={columnCount} />
      </CardContent>
    </Card>
  </section>
)

const AdminCountPageSkeleton = () => (
  <div className='py-8 sm:py-10' aria-busy='true'>
    <div className='max-w-9xl mx-auto w-full px-2 sm:px-6 lg:px-8'>
      <div className='mb-6'>
        <Skeleton className='h-7 w-full max-w-lg md:h-10' />
      </div>
      <div className='mb-6'>
        <SummaryCardsSkeleton count={6} />
      </div>
      <div className='mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
        <Skeleton className='h-10 w-full max-w-md rounded-md' />
        <Skeleton className='h-10 w-full rounded-md sm:w-36' />
      </div>
      <Card>
        <CardHeader>
          <Skeleton className='h-6 w-56' />
        </CardHeader>
        <CardContent className='px-2 sm:px-6'>
          <div className='hidden lg:block'>
            <Table className='min-w-0 table-fixed text-xs lg:text-sm'>
              <TableHeader>
                <TableRow className='bg-primary hover:bg-primary'>
                  {Array.from({ length: 8 }).map((_, index) => (
                    <TableHead key={index} className='px-1 lg:px-2'>
                      <Skeleton className='h-5 w-full bg-white/35' />
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 7 }).map((_, rowIndex) => (
                  <TableRow key={rowIndex} className='odd:bg-muted/35 even:bg-background h-16'>
                    {Array.from({ length: 8 }).map((_, columnIndex) => (
                      <TableCell key={columnIndex} className='px-1 py-4 lg:px-2'>
                        <Skeleton className='h-5 w-full' />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow className='bg-primary/10 h-20'>
                  {Array.from({ length: 8 }).map((_, index) => (
                    <TableCell key={index} className='py-5'>
                      <Skeleton className='h-6 w-full' />
                    </TableCell>
                  ))}
                </TableRow>
              </TableFooter>
            </Table>
          </div>
          <div className='divide-border overflow-hidden rounded-md border lg:hidden'>
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className='odd:bg-muted/35 even:bg-background space-y-4 p-5'>
                <div>
                  <Skeleton className='h-5 w-full max-w-64' />
                  <Skeleton className='mt-2 h-4 w-20' />
                </div>
                <div className='grid grid-cols-2 gap-2 text-sm sm:grid-cols-3'>
                  {Array.from({ length: 6 }).map((__, itemIndex) => (
                    <div key={itemIndex}>
                      <Skeleton className='h-4 w-16' />
                      <Skeleton className='mt-2 h-5 w-12' />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
)

const TransactionHistoryPageSkeleton = () => (
  <div className='max-w-full min-w-0 space-y-6 py-4 sm:py-10' aria-busy='true'>
    <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
      <div className='min-w-0 flex-1'>
        <Skeleton className='h-10 w-full max-w-xl' />
        <Skeleton className='mt-2 h-4 w-full max-w-3xl' />
        <Skeleton className='mt-2 h-4 w-full max-w-2xl' />
      </div>
    </div>
    <div className='max-w-full min-w-0 space-y-4'>
      <div className='grid gap-3 sm:grid-cols-2 xl:grid-cols-5'>
        {skeletonCards.map((_, index) => (
          <div key={index} className='bg-background rounded-md border p-4'>
            <Skeleton className='h-4 w-28' />
            <Skeleton className='mt-2 h-8 w-24' />
          </div>
        ))}
      </div>
      <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
        <Skeleton className='h-10 w-full rounded-md' />
        <div className='flex flex-col gap-2 sm:flex-row sm:items-center'>
          <Skeleton className='h-10 w-full rounded-md sm:w-32' />
          <Skeleton className='h-10 w-full rounded-md sm:w-32' />
        </div>
      </div>
      <div className='border-border max-w-full min-w-0 overflow-hidden rounded-lg border'>
        <div className='hidden overflow-x-auto xl:block'>
          <Table className='table-fixed'>
            <TableHeader>
              <TableRow className='bg-primary hover:bg-primary h-16'>
                {Array.from({ length: 9 }).map((_, index) => (
                  <TableHead key={index} className='h-16'>
                    <Skeleton className='h-5 w-full bg-white/35' />
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 8 }).map((_, rowIndex) => (
                <TableRow key={rowIndex} className='odd:bg-muted/30 even:bg-background'>
                  {Array.from({ length: 9 }).map((_, columnIndex) => (
                    <TableCell key={columnIndex}>
                      <Skeleton className={cn('h-5 w-full', [2, 3].includes(columnIndex) && 'h-7 rounded-md')} />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
            <TableFooter className='bg-white text-black dark:bg-white dark:text-black'>
              <TableRow className='bg-white text-base text-black hover:bg-white dark:bg-white dark:text-black dark:hover:bg-white'>
                {Array.from({ length: 9 }).map((_, index) => (
                  <TableCell key={index}>
                    <Skeleton className='h-5 w-full' />
                  </TableCell>
                ))}
              </TableRow>
            </TableFooter>
          </Table>
        </div>
        <div className='grid gap-3 p-2 sm:p-3 xl:hidden'>
          {Array.from({ length: 4 }).map((_, index) => (
            <article key={index} className='bg-background overflow-hidden rounded-md border shadow-sm'>
              <div className='flex flex-col gap-2 border-b px-3 py-3 sm:flex-row sm:items-start sm:justify-between sm:px-4'>
                <Skeleton className='h-7 w-28' />
                <Skeleton className='h-4 w-40' />
              </div>
              <div className='grid gap-3 px-3 py-3 text-sm sm:px-4'>
                {Array.from({ length: 7 }).map((__, itemIndex) => (
                  <div key={itemIndex} className='grid grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] gap-2'>
                    <Skeleton className='h-4 w-24' />
                    <Skeleton className='h-4 w-full justify-self-end' />
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
        <div className='bg-background flex flex-col gap-3 border-t px-3 py-3 lg:flex-row lg:items-center lg:justify-between'>
          <Skeleton className='h-5 w-44' />
          <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end'>
            <Skeleton className='h-9 w-36 rounded-md' />
            <PaginationSkeleton />
          </div>
        </div>
      </div>
    </div>
  </div>
)

const MemberFormPageSkeleton = ({
  fieldCount = 10,
  showDescription = true,
  showIcon = false,
  tone = 'primary',
  titleWidth = 'max-w-2xl'
}: {
  fieldCount?: number
  showDescription?: boolean
  showIcon?: boolean
  titleWidth?: string
  tone?: FormTone
}) => {
  const toneClassNames = formToneClassNames[tone]
  const fields = Array.from({ length: fieldCount })

  return (
    <section className='mt-16 flex flex-col' aria-busy='true'>
      <div className='my-4 flex flex-col'>
        <div className={cn('flex items-center gap-3', !showIcon && 'block')}>
          {showIcon ? <Skeleton className={cn('size-12 shrink-0 rounded-md sm:size-15', toneClassNames.icon)} /> : null}
          <Skeleton className={cn('h-9 w-full md:h-12 lg:h-14', titleWidth, toneClassNames.text)} />
        </div>
        {showDescription ? (
          <div className='mt-3 space-y-2'>
            <Skeleton className={cn('h-4 w-full max-w-4xl', toneClassNames.text)} />
            <Skeleton className={cn('h-4 w-full max-w-3xl', toneClassNames.text)} />
          </div>
        ) : null}
      </div>
      <div className={cn('rounded-lg border p-3 sm:p-8', toneClassNames.panel)}>
        <div className='mt-4 grid gap-4 md:grid-cols-3'>
          {fields.map((_, index) => (
            <LoadingField key={index} labelClassName={index % 3 === 0 ? 'w-56' : index % 3 === 1 ? 'w-36' : 'w-44'} />
          ))}
          <Skeleton className='mt-4 h-10 w-full rounded-md' />
        </div>
      </div>
    </section>
  )
}

const ProfileFormPageSkeleton = ({
  titleWidth = 'max-w-96',
  tone = 'profile'
}: {
  titleWidth?: string
  tone?: Extract<FormTone, 'muted' | 'profile'>
}) => {
  const toneClassNames = formToneClassNames[tone]

  const profileFormRows = [
    { columns: 'md:grid-cols-2', fields: ['w-40', 'w-36'] },
    { columns: 'md:grid-cols-3', fields: ['w-36', 'w-48', 'w-36'] },
    { columns: 'md:grid-cols-3', fields: ['w-40', 'w-52', 'w-40'] },
    { columns: 'md:grid-cols-3', fields: ['w-36', 'w-52', 'w-36'] }
  ]

  return (
    <section className='flex min-h-full w-full min-w-0 flex-col overflow-hidden py-8 sm:py-10' aria-busy='true'>
      <Skeleton className={cn('mb-6 h-8 w-full md:h-12 lg:h-14', titleWidth)} />
      <div
        className={cn('w-full max-w-full min-w-0 overflow-hidden rounded-lg border p-3 sm:p-8', toneClassNames.panel)}
      >
        {profileFormRows.map((row, rowIndex) => (
          <div
            key={rowIndex}
            className={cn('grid w-full min-w-0 grid-cols-[minmax(0,1fr)] gap-4', row.columns, rowIndex !== 0 && 'mt-4')}
          >
            {row.fields.map((labelWidth, fieldIndex) => (
              <LoadingField key={`${rowIndex}-${fieldIndex}`} labelClassName={labelWidth} />
            ))}
          </div>
        ))}
        <div className='mt-4 grid w-full min-w-0 grid-cols-[minmax(0,1fr)] gap-4 md:grid-cols-3'>
          <Skeleton className='mt-3 h-11 w-full rounded-md' />
        </div>
      </div>
    </section>
  )
}

const DashboardOverviewSkeleton = () => (
  <section className='flex min-h-full w-full min-w-0 flex-col gap-6 overflow-hidden py-8 sm:py-10' aria-busy='true'>
    <div className='min-w-0 space-y-3'>
      <Skeleton className='h-8 w-full max-w-80 md:h-10' />
      <Skeleton className='h-4 w-full max-w-3xl' />
      <Skeleton className='h-4 w-full max-w-2xl' />
    </div>
    <SummaryCardsSkeleton />
    <div className='grid min-w-0 gap-4 lg:grid-cols-2'>
      <PaymentRouteCardsSkeleton />
    </div>
    <Card className='w-full max-w-full min-w-0 overflow-hidden'>
      <CardHeader>
        <Skeleton className='h-6 w-56' />
      </CardHeader>
      <CardContent>
        <AdminPaymentsTableSkeleton columnCount={7} />
      </CardContent>
    </Card>
  </section>
)

export {
  AdminCountPageSkeleton,
  AdminPaymentsTableSkeleton,
  AdminPaymentPageSkeleton,
  DashboardOverviewSkeleton,
  MemberFormPageSkeleton,
  MemberTablePageSkeleton,
  MemberTableSkeleton,
  ProfileFormPageSkeleton,
  TransactionHistoryPageSkeleton
}
