import { Card } from '@/components/ui/card'

import MembersDataTable from '@/components/shadcn-studio/blocks/database-adminAllRemoved-client'
import { fetchRemovedMembersActionAdmin } from '@/utils/actions'

const DataTablePreview = async () => {
  const members = await fetchRemovedMembersActionAdmin()

  return (
    <div className='py-8 sm:py-10'>
      <div className='max-w-9xl mx-auto px-2 sm:px-6 lg:px-8'>
        <Card className='max-w-9xl mx-auto w-full py-0'>
          <MembersDataTable data={members} />
        </Card>
      </div>
    </div>
  )
}

export default DataTablePreview
