import DashboardActivityLogTable from '@/components/dashboard/DashboardActivityLogTable'
import { fetchAssociationDashboardActivityLogsAction } from '@/utils/actions'

const ActivityLogPage = async () => {
  const rows = await fetchAssociationDashboardActivityLogsAction()

  return (
    <section className='mx-auto w-full max-w-7xl px-3 py-6 sm:px-5 lg:px-8'>
      <div className='mb-6 space-y-2'>
        <h1 className='text-3xl font-semibold tracking-normal sm:text-4xl'>Activity log</h1>
        <p className='text-muted-foreground max-w-3xl text-sm leading-6 sm:text-base'>
          Review recent changes made from your association dashboard.
        </p>
      </div>

      <DashboardActivityLogTable rows={rows} storageKey='sagi:activity-log' />
    </section>
  )
}

export default ActivityLogPage
