import { Card } from '@/components/ui/card'
import RemovedMembersDataTable from '@/components/shadcn-studio/blocks/datatable-removedMembers'
import { fetchRemovedMembersAction } from '@/utils/actions'

const DataTablePreview = async () => {
  const removedMembers = await fetchRemovedMembersAction()

  return (
    <div className='py-8 sm:py-10'>
      <div className='max-w-9xl mx-auto px-4 sm:px-6 lg:px-8'>
        <Card className='max-w-9xl mx-auto w-full py-0'>
          <RemovedMembersDataTable data={removedMembers} />
        </Card>
      </div>
    </div>
  )
}

export default DataTablePreview
