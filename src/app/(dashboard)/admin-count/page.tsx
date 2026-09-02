import React from 'react'

import { AlertTriangle, Clock, Hourglass, ShieldCheck, UserPlus, Users } from 'lucide-react'

import AutoRefreshAt from '@/components/dashboard/AutoRefreshAt'
import AdminCountBreakdown from '@/components/global/AdminCountBreakdownClient'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { fetchMemberStatusCountsByAssociationCode } from '@/utils/actions'
import { getCurrentMonthDateRange } from '@/utils/month-date-ranges'

const numberFormatter = new Intl.NumberFormat('en-US')
const formatNumber = (value: number) => numberFormatter.format(value)

const Counts = async () => {
  const { nextMonthStart } = getCurrentMonthDateRange()
  const counts = await fetchMemberStatusCountsByAssociationCode()

  const totals = counts.reduce(
    (acc, item) => ({
      vested: acc.vested + item.vested,
      monthlyAddition: acc.monthlyAddition + item.monthlyAddition,
      pending: acc.pending + item.pending,
      awaitingPublication: acc.awaitingPublication + item.awaitingPublication,
      notInGoodStanding: acc.notInGoodStanding + item.notInGoodStanding,
      total: acc.total + item.total
    }),
    {
      vested: 0,
      monthlyAddition: 0,
      pending: 0,
      awaitingPublication: 0,
      notInGoodStanding: 0,
      total: 0
    }
  )

  const statusCards = [
    {
      label: 'Vested',
      value: totals.vested,
      icon: ShieldCheck,
      colorClassName: 'text-green-600 dark:text-green-400',
      cardClassName: 'border-green-500/20 bg-green-500/10'
    },
    {
      label: 'Monthly Addition',
      value: totals.monthlyAddition,
      icon: UserPlus,
      colorClassName: 'text-cyan-700 dark:text-cyan-300',
      cardClassName: 'border-cyan-500/20 bg-cyan-500/10'
    },
    {
      label: 'Awaiting',
      value: totals.awaitingPublication,
      icon: Clock,
      colorClassName: 'text-blue-600 dark:text-blue-400',
      cardClassName: 'border-blue-500/20 bg-blue-500/10'
    },
    {
      label: 'Pending',
      value: totals.pending,
      icon: Hourglass,
      colorClassName: 'text-amber-600 dark:text-amber-400',
      cardClassName: 'border-amber-500/20 bg-amber-500/10'
    },
    {
      label: 'Delinquent',
      value: totals.notInGoodStanding,
      icon: AlertTriangle,
      colorClassName: 'text-destructive',
      cardClassName: 'border-destructive/20 bg-destructive/10'
    },
    {
      label: 'Total Membership',
      value: totals.total,
      icon: Users,
      colorClassName: 'text-foreground',
      cardClassName: 'border-foreground/10 bg-muted/70'
    }
  ]

  return (
    <div className='py-8 sm:py-10 print:py-0'>
      <AutoRefreshAt refreshAt={nextMonthStart.toISOString()} />

      <div className='max-w-9xl mx-auto w-full px-2 sm:px-6 lg:px-8 print:px-0'>
        <div className='mb-6'>
          <h1 className='text-xl font-semibold tracking-normal md:text-4xl'>Member Counts by Association Code</h1>
        </div>

        <div className='mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-6'>
          {statusCards.map(status => {
            const Icon = status.icon

            return (
              <Card key={status.label} className={`gap-1 py-2 sm:py-3 ${status.cardClassName}`}>
                <CardHeader className='px-3 pb-0 sm:px-4'>
                  <CardTitle
                    className={`flex w-full items-center justify-between gap-2 text-xs font-medium sm:text-sm ${status.colorClassName}`}
                  >
                    <span>{status.label}</span>
                    <Icon className='size-4 shrink-0' aria-hidden='true' />
                  </CardTitle>
                </CardHeader>
                <CardContent className='px-3 sm:px-4'>
                  <p className={`text-2xl leading-none font-extrabold lg:text-3xl ${status.colorClassName}`}>
                    {formatNumber(status.value)}
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <AdminCountBreakdown counts={counts} totals={totals} />
      </div>
    </div>
  )
}

export default Counts
