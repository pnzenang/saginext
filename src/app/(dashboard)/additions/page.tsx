import { unstable_noStore as noStore } from 'next/cache'

import AutoRefreshAt from '@/components/dashboard/AutoRefreshAt'
import db from '@/utils/db'
import { dashboardTimeZone, getCurrentMonthDateRange } from '@/utils/month-date-ranges'
import { memberStatus } from '@/utils/types'

import MonthlyAdditionsTable, { type MonthlyAdditionRow } from './MonthlyAdditionsTable'

const monthTitleFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'long',
  timeZone: dashboardTimeZone,
  year: 'numeric'
})

const MonthlyAdditions = async () => {
  noStore()

  const { monthKey, monthStart, nextMonthStart } = getCurrentMonthDateRange()

  const members = await db.member.findMany({
    orderBy: [{ vestedAt: 'desc' }, { associationCode: 'asc' }, { lastAndMiddleNames: 'asc' }, { firstName: 'asc' }],
    select: {
      associationCode: true,
      associationName: true,
      firstName: true,
      id: true,
      lastAndMiddleNames: true,
      memberMatriculationNumber: true,
      vestedAt: true
    },
    where: {
      memberStatus: memberStatus.Vested,
      vestedAt: {
        gte: monthStart,
        lt: nextMonthStart
      }
    }
  })

  const rows: MonthlyAdditionRow[] = members.flatMap(member =>
    member.vestedAt
      ? [
          {
            associationCode: member.associationCode,
            associationName: member.associationName,
            firstName: member.firstName,
            id: member.id,
            lastAndMiddleNames: member.lastAndMiddleNames,
            memberMatriculationNumber: member.memberMatriculationNumber,
            vestedAt: member.vestedAt.toISOString()
          }
        ]
      : []
  )

  return (
    <section className='max-w-full min-w-0 space-y-6 py-4 sm:py-10'>
      <AutoRefreshAt refreshAt={nextMonthStart.toISOString()} />

      <div className='flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between'>
        <div className='min-w-0'>
          <h1 className='text-3xl font-semibold tracking-normal sm:text-4xl'>
            Added This Month of {monthTitleFormatter.format(monthStart)}
          </h1>
          <p className='text-muted-foreground mt-2 text-sm'>Members marked vested in the current month.</p>
        </div>
      </div>

      <MonthlyAdditionsTable rows={rows} monthKey={monthKey} />
    </section>
  )
}

export default MonthlyAdditions
