import { Skeleton } from '@/components/ui/skeleton'

const profileFormRows = [
  { columns: 'md:grid-cols-2', fields: ['w-40', 'w-36'] },
  { columns: 'md:grid-cols-3', fields: ['w-36', 'w-48', 'w-36'] },
  { columns: 'md:grid-cols-3', fields: ['w-40', 'w-52', 'w-40'] },
  { columns: 'md:grid-cols-3', fields: ['w-36', 'w-52', 'w-36'] }
]

const FieldSkeleton = ({ labelWidth }: { labelWidth: string }) => (
  <div className='mb-2 min-w-0'>
    <Skeleton className={`mb-1 h-4 ${labelWidth} max-w-full`} />
    <Skeleton className='border-primary h-9 w-full rounded-md border bg-background/70' />
  </div>
)

export default function ProfileLoading() {
  return (
    <section className='mx-auto flex w-full max-w-6xl min-w-0 flex-col overflow-hidden py-8 sm:py-10' aria-busy='true'>
      <Skeleton className='mb-6 h-8 w-full max-w-96 md:h-12 lg:h-14' />
      <div className='border-primary bg-primary/15 w-full max-w-full min-w-0 overflow-hidden rounded-lg border p-3 sm:p-8'>
        {profileFormRows.map((row, rowIndex) => (
          <div
            key={rowIndex}
            className={`grid w-full min-w-0 grid-cols-[minmax(0,1fr)] gap-4 ${row.columns} ${
              rowIndex === 0 ? '' : 'mt-4'
            }`}
          >
            {row.fields.map((labelWidth, fieldIndex) => (
              <FieldSkeleton key={`${rowIndex}-${fieldIndex}`} labelWidth={labelWidth} />
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
