'use client'

import type { ReactNode } from 'react'

import { Card, CardContent } from '@/components/ui/card'
import { Marquee } from '@/components/ui/marquee'
import { MotionPreset } from '@/components/ui/motion-preset'

import { cn } from '@/lib/utils'

type TransactionItem = {
  title: string
  amount: number
  icon: ReactNode
  difference: number
  type: 'credit' | 'debit'
  isBordered?: boolean
}

export type TransactionRow = {
  reverse: boolean
  transactions: TransactionItem[]
}

const AccountingOfTransaction = ({ transactions }: { transactions: TransactionRow[] }) => {
  return (
    <Card className='bg-muted group/palette h-full gap-6 border-0 shadow-none lg:col-span-2'>
      <MotionPreset
        fade
        blur
        slide={{ direction: 'down', offset: 15 }}
        delay={0.75}
        transition={{ duration: 0.5 }}
        className='relative flex min-h-68 flex-1 flex-col justify-center gap-6 overflow-hidden md:gap-10.5'
      >
        {transactions.map((row, index) => (
          <Marquee key={index} pauseOnHover reverse={row.reverse} gap={0.625} duration={35 + index * 2} className='p-0'>
            {row.transactions.map((transaction, idx) => (
              <div
                key={idx}
                className={cn('flex h-14 items-center gap-3 rounded-full px-3.5 py-2', {
                  'border-primary/40 border': transaction.isBordered,
                  'bg-card text-card-foreground': !transaction.isBordered
                })}
              >
                <span
                  className={cn(
                    'grid size-9.5 place-content-center rounded-full [&>svg]:size-5',
                    transaction.type === 'debit'
                      ? 'bg-destructive/20 text-destructive'
                      : 'bg-green-600/20 text-green-600 dark:bg-green-400/20 dark:text-green-400'
                  )}
                >
                  {transaction.icon}
                </span>
                <div className='grid'>
                  <span className='text-muted-foreground text-xs'>{transaction.title}</span>
                  <div className='flex items-center gap-1'>
                    <span className='text-base font-medium'>{`$${transaction.amount.toLocaleString()}`}</span>
                    <span
                      className={cn('text-xs', {
                        'text-destructive': transaction.type === 'debit',
                        'text-green-600 dark:text-green-400': transaction.type === 'credit'
                      })}
                    >{`${transaction.type === 'debit' ? '-' : '+'}$${transaction.difference.toLocaleString()}`}</span>
                  </div>
                </div>
              </div>
            ))}
          </Marquee>
        ))}
        <div className='from-muted pointer-events-none absolute inset-y-0 left-0 w-[15%] bg-linear-to-r from-20% to-transparent' />
        <div className='from-muted pointer-events-none absolute inset-y-0 right-0 w-[15%] bg-linear-to-l from-20% to-transparent' />
      </MotionPreset>

      <CardContent className='flex flex-col gap-4 md:items-center'>
        <MotionPreset
          component='h3'
          fade
          blur
          slide={{ direction: 'down', offset: 15 }}
          delay={0.9}
          transition={{ duration: 0.5 }}
          className='text-xl font-semibold md:text-center md:text-2xl'
        >
          Accounting of every transaction.
        </MotionPreset>
        <MotionPreset
          component='p'
          fade
          blur
          slide={{ direction: 'down', offset: 15 }}
          delay={1.05}
          transition={{ duration: 0.5 }}
          className='text-muted-foreground text-base md:text-center md:text-lg'
        >
          Stay informed with real-time balance updates and complete history, so you always know exactly where your money
          stands.
        </MotionPreset>
      </CardContent>
    </Card>
  )
}

export default AccountingOfTransaction
