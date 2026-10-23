'use client'

import { useActionState } from 'react'

import { CheckCircle2, Clock, Loader2, Search } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import {
  lookupMonthlyContributionAction,
  type MonthlyContributionLookupState,
  type MonthlyContributionPaymentStatus
} from './actions'

const currencyFormatter = new Intl.NumberFormat('en-US', {
  currency: 'USD',
  style: 'currency'
})

const dueDateFormatter = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'long',
  timeZone: 'UTC'
})

const initialState: MonthlyContributionLookupState = { status: 'idle' }

const paymentStatusMessages: Record<
  Exclude<MonthlyContributionPaymentStatus, 'unpaid'>,
  { className: string; description: string; icon: typeof CheckCircle2; title: string }
> = {
  awaiting_verification: {
    className:
      'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200',
    description: 'Your payment has been recorded. SAGI will verify it shortly.',
    icon: Clock,
    title: 'Awaiting verification'
  },
  paid: {
    className:
      'border-green-200 bg-green-50 text-green-800 dark:border-green-900 dark:bg-green-950/40 dark:text-green-200',
    description: 'Your contribution for this month has been received and verified by SAGI. Thank you!',
    icon: CheckCircle2,
    title: 'Paid'
  },
  partially_paid: {
    className:
      'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200',
    description:
      'Part of this month’s contribution has been paid. Log in to your Payment Center to see your remaining balance.',
    icon: Clock,
    title: 'Partially paid'
  }
}

const MonthlyContributionLookupForm = () => {
  const [state, formAction, isPending] = useActionState(lookupMonthlyContributionAction, initialState)

  return (
    <div className='grid w-full gap-6'>
      <form action={formAction} className='grid justify-items-center gap-3'>
        <Label htmlFor='associationCode' className='sr-only'>
          Association code
        </Label>
        <div className='flex w-full flex-col justify-center gap-3 sm:flex-row'>
          <Input
            id='associationCode'
            name='associationCode'
            placeholder='Ex. ABCD'
            maxLength={4}
            minLength={4}
            pattern='[A-Za-z]{4}'
            title='Enter your 4-letter association code'
            autoComplete='off'
            autoCapitalize='characters'
            required
            className='placeholder:text-muted-foreground/50 h-11 text-center text-lg tracking-widest uppercase placeholder:text-left placeholder:tracking-normal placeholder:normal-case sm:w-56'
          />
          <Button type='submit' className='h-11 sm:w-fit' disabled={isPending}>
            {isPending ? <Loader2 className='animate-spin' /> : <Search />}
            Show contribution
          </Button>
        </div>
      </form>

      {state.status === 'error' ? (
        <p
          role='alert'
          className='rounded-md border border-red-200 bg-red-50 px-4 py-3 text-center text-sm font-medium text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300'
        >
          {state.message}
        </p>
      ) : null}

      {state.status === 'success' ? (
        <Card className='text-center'>
          <CardContent className='grid gap-5'>
            <div>
              <p className='text-muted-foreground text-sm font-semibold'>{state.result.associationCode}</p>
              <p className='text-xl font-semibold'>{state.result.associationName}</p>
            </div>

            {state.result.contributionDue > 0 ? (
              <>
                {state.result.paymentStatus !== 'unpaid'
                  ? (() => {
                      const statusMessage = paymentStatusMessages[state.result.paymentStatus]

                      return (
                        <div role='status' className={`rounded-lg border p-4 ${statusMessage.className}`}>
                          <p className='flex items-center justify-center gap-2 text-lg font-bold'>
                            <statusMessage.icon className='size-5' aria-hidden='true' />
                            {statusMessage.title}
                          </p>
                          <p className='mt-1 text-sm'>{statusMessage.description}</p>
                        </div>
                      )
                    })()
                  : null}
                <div className='bg-primary/10 rounded-lg p-4'>
                  <p className='text-muted-foreground text-sm font-semibold'>
                    {state.result.paymentStatus === 'paid' ? 'This month’s contribution' : 'Amount to send this month'}
                  </p>
                  <p className='text-primary text-4xl font-extrabold'>
                    {currencyFormatter.format(state.result.amountToSend)}
                  </p>
                  {state.result.dueDate ? (
                    <p className='text-muted-foreground mt-1 text-sm'>
                      Due {dueDateFormatter.format(new Date(state.result.dueDate))}
                    </p>
                  ) : null}
                </div>
                <dl className='grid gap-3 text-sm sm:grid-cols-3'>
                  <div>
                    <dt className='text-muted-foreground'>Vested members</dt>
                    <dd className='text-base font-semibold'>{state.result.vestedMembersCount}</dd>
                  </div>
                  <div>
                    <dt className='text-muted-foreground'>Per vested member</dt>
                    <dd className='text-base font-semibold'>
                      {currencyFormatter.format(state.result.amountPerVestedMember)}
                    </dd>
                  </div>
                  <div>
                    <dt className='text-muted-foreground'>Contribution due</dt>
                    <dd className='text-base font-semibold'>
                      {currencyFormatter.format(state.result.contributionDue)}
                    </dd>
                  </div>
                </dl>
                {state.result.paymentStatus === 'paid' ? null : (
                  <p className='text-muted-foreground text-sm'>
                    Send the exact amount, including cents, by Zelle and include your 4-letter code in the memo. The
                    cents identify your association.
                  </p>
                )}
              </>
            ) : (
              <p className='text-muted-foreground'>There is no contribution due for this association this month.</p>
            )}
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}

export default MonthlyContributionLookupForm
