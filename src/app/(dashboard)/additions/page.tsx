import { unstable_noStore as noStore } from 'next/cache'

import AutoRefreshAt from '@/components/dashboard/AutoRefreshAt'
import db from '@/utils/db'
import { memberStatus } from '@/utils/types'

import MonthlyAdditionsTable, { type MonthlyAdditionRow } from './MonthlyAdditionsTable'

const monthlyAdditionsTimeZone = 'America/New_York'

const monthTitleFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'long',
  timeZone: monthlyAdditionsTimeZone,
  year: 'numeric'
})

const timeZonePartsFormatter = new Intl.DateTimeFormat('en-US', {
  day: '2-digit',
  hour: '2-digit',
  hourCycle: 'h23',
  minute: '2-digit',
  month: '2-digit',
  second: '2-digit',
  timeZone: monthlyAdditionsTimeZone,
  year: 'numeric'
})

const getTimeZoneParts = (date: Date) => {
  const parts = timeZonePartsFormatter.formatToParts(date)

  return {
    day: Number(parts.find(part => part.type === 'day')?.value ?? 1),
    hour: Number(parts.find(part => part.type === 'hour')?.value ?? 0),
    minute: Number(parts.find(part => part.type === 'minute')?.value ?? 0),
    month: Number(parts.find(part => part.type === 'month')?.value ?? 1),
    second: Number(parts.find(part => part.type === 'second')?.value ?? 0),
    year: Number(parts.find(part => part.type === 'year')?.value ?? 1970)
  }
}

const getTimeZoneOffsetMs = (date: Date) => {
  const parts = getTimeZoneParts(date)

  const sameWallTimeInUtc = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second)

  return sameWallTimeInUtc - date.getTime()
}

const getZonedMonthBoundary = (year: number, monthIndex: number) => {
  const utcGuess = new Date(Date.UTC(year, monthIndex, 1))

  return new Date(utcGuess.getTime() - getTimeZoneOffsetMs(utcGuess))
}

const getZonedDayBoundary = (year: number, monthIndex: number, day: number) => {
  const utcGuess = new Date(Date.UTC(year, monthIndex, day))

  return new Date(utcGuess.getTime() - getTimeZoneOffsetMs(utcGuess))
}

const getCurrentMonthRange = () => {
  const now = new Date()
  const { day, month, year } = getTimeZoneParts(now)
  const monthIndex = month - 1
  const monthStart = getZonedMonthBoundary(year, monthIndex)
  const todayStart = getZonedDayBoundary(year, monthIndex, day)
  const nextDayStart = getZonedDayBoundary(year, monthIndex, day + 1)
  const monthKey = `${year}-${String(month).padStart(2, '0')}`

  return { monthKey, monthStart, nextDayStart, todayStart }
}

const MonthlyAdditions = async () => {
  noStore()

  const { monthKey, monthStart, nextDayStart, todayStart } = getCurrentMonthRange()

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
        lt: todayStart
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
      <AutoRefreshAt refreshAt={nextDayStart.toISOString()} />

      <div className='flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between'>
        <div className='min-w-0'>
          <h1 className='text-3xl font-semibold tracking-normal sm:text-4xl'>
            Added This Month of {monthTitleFormatter.format(monthStart)}
          </h1>
          <p className='text-muted-foreground mt-2 text-sm'>Members marked vested earlier in the current month.</p>
        </div>
      </div>

      <MonthlyAdditionsTable rows={rows} monthKey={monthKey} />
    </section>
  )
}

export default MonthlyAdditions
