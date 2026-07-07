import { FilePenLine } from 'lucide-react'

import NameChangeRequestList from '@/components/dashboard/NameChangeRequestList'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { fetchAdminNameChangeRequestsAction } from '@/utils/actions'

const AdminNameChangesPage = async () => {
  const requests = await fetchAdminNameChangeRequestsAction()
  const pendingReviewCount = requests.filter(request => request.status === 'submitted').length

  return (
    <section className='grid w-full max-w-full min-w-0 shrink-0 gap-5 overflow-visible px-0 py-4 sm:px-6 sm:py-8 lg:px-8'>
      <div className='flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between'>
        <div>
          <h1 className='text-2xl font-extrabold tracking-normal sm:text-3xl'>Admin Name Changes</h1>
          <p className='text-muted-foreground mt-1 text-sm'>
            Review delegate name-change requests, approve corrections, reject them, or request documentation.
          </p>
        </div>
        <Badge variant='outline' className='w-fit text-sm'>
          {requests.length} request{requests.length === 1 ? '' : 's'}
        </Badge>
      </div>

      {pendingReviewCount > 0 ? (
        <Card className='rounded-lg border-amber-200 bg-amber-50 py-0 dark:border-amber-900 dark:bg-amber-950/40'>
          <CardContent className='flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between'>
            <div className='flex min-w-0 items-start gap-3'>
              <FilePenLine className='mt-0.5 size-5 shrink-0 text-amber-700 dark:text-amber-300' />
              <div className='min-w-0'>
                <p className='font-extrabold text-amber-800 dark:text-amber-200'>Name change approval pending</p>
                <p className='text-sm text-amber-700 dark:text-amber-300'>
                  {pendingReviewCount} request{pendingReviewCount === 1 ? '' : 's'} waiting for admin review.
                </p>
              </div>
            </div>
            <Badge
              variant='outline'
              className='w-fit border-amber-300 bg-white text-amber-800 dark:bg-black/20 dark:text-amber-200'
            >
              {pendingReviewCount} pending
            </Badge>
          </CardContent>
        </Card>
      ) : null}

      <div className='grid gap-3'>
        <div className='flex items-center gap-2'>
          <FilePenLine className='text-primary size-5' />
          <h2 className='text-lg font-extrabold'>All name change requests</h2>
        </div>
        <NameChangeRequestList
          emptyDescription='Delegate requests will appear here.'
          emptyTitle='No name change requests found.'
          isAdminUser
          requests={requests}
          searchPlaceholder='Search name, matriculation, association code, association name, or status'
          storageKey='sagi:admin-name-changes:request-search'
        />
      </div>
    </section>
  )
}

export default AdminNameChangesPage
