import { Skeleton } from '@/components/ui/skeleton'

const DashboardLoading = () => {
  return (
    <section className='flex w-full min-w-0 flex-col gap-6 overflow-hidden py-8 sm:py-10' aria-busy='true'>
      <div className='min-w-0 space-y-3'>
        <Skeleton className='h-8 w-full max-w-80 md:h-10' />
        <Skeleton className='h-4 w-full max-w-3xl' />
        <Skeleton className='h-4 w-full max-w-2xl' />
      </div>
      <div className='grid min-w-0 gap-4'>
        <Skeleton className='h-24 w-full rounded-lg' />
        <Skeleton className='h-48 w-full rounded-lg' />
        <Skeleton className='h-32 w-full rounded-lg' />
      </div>
    </section>
  )
}

export default DashboardLoading
