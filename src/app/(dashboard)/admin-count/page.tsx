import React from 'react'

import { AlertTriangle, Clock, Hourglass, ShieldCheck, Users } from 'lucide-react'

import AdminCountExcelButton from '@/components/global/AdminCountExcelButton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { fetchMemberStatusCountsByAssociationCode } from '@/utils/actions'

const numberFormatter = new Intl.NumberFormat('en-US')
const formatNumber = (value: number) => numberFormatter.format(value)

const Counts = async () => {
  const counts = await fetchMemberStatusCountsByAssociationCode()

  const totals = counts.reduce(
    (acc, item) => ({
      vested: acc.vested + item.vested,
      pending: acc.pending + item.pending,
      awaitingPublication: acc.awaitingPublication + item.awaitingPublication,
      notInGoodStanding: acc.notInGoodStanding + item.notInGoodStanding,
      total: acc.total + item.total
    }),
    {
      vested: 0,
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
      <div className='max-w-9xl mx-auto w-full px-4 sm:px-6 lg:px-8 print:px-0'>
        <div className='mb-6'>
          <h1 className='text-xl font-semibold tracking-normal md:text-4xl'>Member Counts by Association Code</h1>
        </div>

        <div className='mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5'>
          {statusCards.map(status => {
            const Icon = status.icon

            return (
              <Card key={status.label} className={`gap-2 py-4 ${status.cardClassName}`}>
                <CardHeader className='pb-0'>
                  <CardTitle className={`flex items-center gap-2 text-sm font-medium ${status.colorClassName}`}>
                    <Icon className='size-4 shrink-0' aria-hidden='true' />
                    {status.label}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className={`text-3xl font-extrabold lg:text-4xl ${status.colorClassName}`}>
                    {formatNumber(status.value)}
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className='mb-6 flex justify-end'>
          <AdminCountExcelButton counts={counts} totals={totals} />
        </div>

        <Card className='print:border-0 print:shadow-none'>
          <CardHeader>
            <CardTitle>Association Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='md:hidden print:hidden'>
              {counts.length > 0 ? (
                <div className='divide-border overflow-hidden rounded-md border'>
                  {counts.map(item => (
                    <div key={item.associationCode} className='odd:bg-muted/35 even:bg-background space-y-3 p-4'>
                      <div className='flex items-start justify-between gap-3'>
                        <div className='min-w-0'>
                          <p className='line-clamp-2 text-sm font-semibold' title={item.associationName}>
                            {item.associationName}
                          </p>
                          <p className='text-muted-foreground text-xs'>{item.associationCode}</p>
                        </div>
                        <div className='text-right'>
                          <p className='text-muted-foreground text-xs'>Total</p>
                          <p className='text-lg font-extrabold'>{formatNumber(item.total)}</p>
                        </div>
                      </div>
                      <div className='grid grid-cols-2 gap-2 text-sm'>
                        <div>
                          <p className='text-muted-foreground text-xs'>Vested</p>
                          <p className='text-primary font-semibold'>{formatNumber(item.vested)}</p>
                        </div>
                        <div>
                          <p className='text-muted-foreground text-xs'>Pending</p>
                          <p className='font-semibold'>{formatNumber(item.pending)}</p>
                        </div>
                        <div>
                          <p className='text-muted-foreground text-xs'>Awaiting</p>
                          <p className='font-semibold'>{formatNumber(item.awaitingPublication)}</p>
                        </div>
                        <div>
                          <p className='text-muted-foreground text-xs'>Delinquent</p>
                          <p className='font-semibold'>{formatNumber(item.notInGoodStanding)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className='bg-muted p-4 font-extrabold'>
                    <div className='mb-3 flex items-center justify-between gap-3'>
                      <span>Total</span>
                      <span>{formatNumber(totals.total)}</span>
                    </div>
                    <div className='grid grid-cols-2 gap-2 text-sm'>
                      <span className='text-primary'>Vested: {formatNumber(totals.vested)}</span>
                      <span>Pending: {formatNumber(totals.pending)}</span>
                      <span>Awaiting: {formatNumber(totals.awaitingPublication)}</span>
                      <span>Delinquent: {formatNumber(totals.notInGoodStanding)}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className='text-muted-foreground rounded-md border p-8 text-center'>No member counts found.</div>
              )}
            </div>

            <div className='hidden md:block print:block'>
              <Table className='table-fixed'>
                <colgroup>
                  <col className='w-[52%]' />
                  <col className='w-[8%]' />
                  <col className='w-[8%]' />
                  <col className='w-[8%]' />
                  <col className='w-[8%]' />
                  <col className='w-[8%]' />
                  <col className='w-[8%]' />
                </colgroup>
                <TableHeader>
                  <TableRow className='bg-primary hover:bg-primary'>
                    <TableHead className='text-primary-foreground'>Association Name</TableHead>
                    <TableHead className='text-primary-foreground'>Association Code</TableHead>
                    <TableHead className='text-primary-foreground text-right'>Vested</TableHead>
                    <TableHead className='text-primary-foreground text-right'>Pending</TableHead>
                    <TableHead className='text-primary-foreground text-right'>Awaiting</TableHead>
                    <TableHead className='text-primary-foreground text-right'>Delinquent</TableHead>
                    <TableHead className='text-primary-foreground text-right'>Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {counts.length > 0 ? (
                    counts.map(item => (
                      <TableRow key={item.associationCode} className='odd:bg-muted/35 even:bg-background'>
                        <TableCell className='truncate font-medium' title={item.associationName}>
                          {item.associationName}
                        </TableCell>
                        <TableCell>{item.associationCode}</TableCell>
                        <TableCell className='text-primary text-right'>{formatNumber(item.vested)}</TableCell>
                        <TableCell className='text-right'>{formatNumber(item.pending)}</TableCell>
                        <TableCell className='text-right'>{formatNumber(item.awaitingPublication)}</TableCell>
                        <TableCell className='text-right'>{formatNumber(item.notInGoodStanding)}</TableCell>
                        <TableCell className='text-right font-extrabold'>{formatNumber(item.total)}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className='text-muted-foreground h-24 text-center'>
                        No member counts found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
                {counts.length > 0 && (
                  <TableFooter>
                    <TableRow className='font-extrabold'>
                      <TableCell colSpan={2}>Total</TableCell>
                      <TableCell className='text-primary text-right font-extrabold'>
                        {formatNumber(totals.vested)}
                      </TableCell>
                      <TableCell className='text-right font-extrabold'>{formatNumber(totals.pending)}</TableCell>
                      <TableCell className='text-right font-extrabold'>
                        {formatNumber(totals.awaitingPublication)}
                      </TableCell>
                      <TableCell className='text-right font-extrabold'>
                        {formatNumber(totals.notInGoodStanding)}
                      </TableCell>
                      <TableCell className='text-right font-extrabold'>{formatNumber(totals.total)}</TableCell>
                    </TableRow>
                  </TableFooter>
                )}
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Counts
