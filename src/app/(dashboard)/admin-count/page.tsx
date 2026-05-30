import React from 'react'

import PrintButton from '@/components/global/PrintButton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { fetchMemberStatusCountsByAssociationCode } from '@/utils/actions'

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

  return (
    <div className='py-8 print:py-0 sm:py-10'>
      <div className='max-w-9xl mx-auto w-full px-4 print:px-0 sm:px-6 lg:px-8'>
        <Card className='print:border-0 print:shadow-none'>
          <CardHeader className='flex flex-row items-center justify-between gap-4'>
            <CardTitle>Member Counts by Association Code</CardTitle>
            <PrintButton />
          </CardHeader>
          <CardContent>
            <div className='print:hidden md:hidden'>
              {counts.length > 0 ? (
                <div className='divide-border overflow-hidden rounded-md border'>
                  {counts.map(item => (
                    <div key={item.associationCode} className='space-y-3 p-4 odd:bg-muted/35 even:bg-background'>
                      <div className='flex items-start justify-between gap-3'>
                        <div className='min-w-0'>
                          <p className='line-clamp-2 text-sm font-semibold' title={item.associationName}>
                            {item.associationName}
                          </p>
                          <p className='text-muted-foreground text-xs'>{item.associationCode}</p>
                        </div>
                        <div className='text-right'>
                          <p className='text-muted-foreground text-xs'>Total</p>
                          <p className='text-lg font-extrabold'>{item.total}</p>
                        </div>
                      </div>
                      <div className='grid grid-cols-2 gap-2 text-sm'>
                        <div>
                          <p className='text-muted-foreground text-xs'>Vested</p>
                          <p className='text-primary font-semibold'>{item.vested}</p>
                        </div>
                        <div>
                          <p className='text-muted-foreground text-xs'>Pending</p>
                          <p className='font-semibold'>{item.pending}</p>
                        </div>
                        <div>
                          <p className='text-muted-foreground text-xs'>Awaiting</p>
                          <p className='font-semibold'>{item.awaitingPublication}</p>
                        </div>
                        <div>
                          <p className='text-muted-foreground text-xs'>Delinquent</p>
                          <p className='font-semibold'>{item.notInGoodStanding}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className='bg-muted p-4 font-extrabold'>
                    <div className='mb-3 flex items-center justify-between gap-3'>
                      <span>Total</span>
                      <span>{totals.total}</span>
                    </div>
                    <div className='grid grid-cols-2 gap-2 text-sm'>
                      <span className='text-primary'>Vested: {totals.vested}</span>
                      <span>Pending: {totals.pending}</span>
                      <span>Awaiting: {totals.awaitingPublication}</span>
                      <span>Delinquent: {totals.notInGoodStanding}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className='text-muted-foreground rounded-md border p-8 text-center'>No member counts found.</div>
              )}
            </div>

            <div className='hidden print:block md:block'>
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
                        <TableCell className='text-primary text-right'>{item.vested}</TableCell>
                        <TableCell className='text-right'>{item.pending}</TableCell>
                        <TableCell className='text-right'>{item.awaitingPublication}</TableCell>
                        <TableCell className='text-right'>{item.notInGoodStanding}</TableCell>
                        <TableCell className='text-right font-extrabold'>{item.total}</TableCell>
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
                      <TableCell className='text-primary text-right font-extrabold'>{totals.vested}</TableCell>
                      <TableCell className='text-right font-extrabold'>{totals.pending}</TableCell>
                      <TableCell className='text-right font-extrabold'>{totals.awaitingPublication}</TableCell>
                      <TableCell className='text-right font-extrabold'>{totals.notInGoodStanding}</TableCell>
                      <TableCell className='text-right font-extrabold'>{totals.total}</TableCell>
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
