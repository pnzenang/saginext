import DataTableLoading from '@/components/global/DataTableLoading'

const Loading = () => {
  return (
    <section className='min-h-full w-full pt-16'>
      <DataTableLoading columnCount={10} />
    </section>
  )
}

export default Loading
