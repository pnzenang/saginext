import DashboardActivityLogTable from '@/components/dashboard/DashboardActivityLogTable'
import { fetchAdminDashboardActivityLogsAction } from '@/utils/actions'

const AdminActivityLogPage = async () => {
  const rows = await fetchAdminDashboardActivityLogsAction()

  return (
    <section className='w-full min-w-0 px-3 py-6 sm:px-5 lg:px-8'>
      <div className='mb-6 space-y-2'>
        <h1 className='text-3xl font-semibold tracking-normal sm:text-4xl'>Admin activity log</h1>
        <p className='text-muted-foreground max-w-3xl text-sm leading-6 sm:text-base'>
          Review dashboard activity across every association and admin workflow.
        </p>
      </div>

      <DashboardActivityLogTable rows={rows} showAssociation storageKey='sagi:admin-activity-log' />
    </section>
  )
}

export default AdminActivityLogPage
