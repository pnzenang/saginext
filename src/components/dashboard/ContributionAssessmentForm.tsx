'use client'

import { useActionState } from 'react'

import { CalendarDays, DollarSign } from 'lucide-react'

import { SubmitButton } from '@/components/forms/Buttons'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  createAssociationContributionAssessmentAction,
  resetAssociationContributionCalculationAction,
  zeroAllAssociationContributionBalancesAction
} from '@/utils/actions'

type ContributionAssessmentFormProps = {
  vestedMembersCount: number
}

const initialState = {
  message: ''
}

const ContributionAssessmentForm = ({ vestedMembersCount }: ContributionAssessmentFormProps) => {
  const [state, formAction] = useActionState(createAssociationContributionAssessmentAction, initialState)
  const [resetState, resetFormAction] = useActionState(resetAssociationContributionCalculationAction, initialState)
  const [zeroState, zeroFormAction] = useActionState(zeroAllAssociationContributionBalancesAction, initialState)

  return (
    <Card className='border-primary/30 bg-primary/10 w-full max-w-full min-w-0 overflow-hidden py-0'>
      <CardHeader className='border-primary/20 min-w-0 border-b py-5'>
        <CardTitle className='text-xl leading-tight break-words'>Amount to be contributed this month</CardTitle>
        <CardDescription className='break-words'>
          Enter a total dollar amount. SAGI divides it by all vested members, then multiplies that amount by the number
          of vested members under each 4-letter association code.
        </CardDescription>
      </CardHeader>
      <CardContent className='min-w-0 py-5'>
        <div className='grid w-full min-w-0 gap-4'>
          <div className='grid w-full min-w-0 grid-cols-[minmax(0,1fr)] gap-4 md:grid-cols-5 md:items-end'>
            <form action={formAction} className='contents'>
              <div className='grid min-w-0 gap-2'>
                <Label htmlFor='totalAmount'>Monthly contribution total</Label>
                <div className='relative'>
                  <DollarSign className='text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2' />
                  <Input
                    id='totalAmount'
                    name='totalAmount'
                    type='number'
                    inputMode='decimal'
                    min='0.01'
                    step='0.01'
                    placeholder='0.00'
                    className='border-primary/40 bg-background text-foreground pl-9'
                    required
                  />
                </div>
              </div>

              <div className='grid min-w-0 gap-2'>
                <Label htmlFor='dueDate'>Contribution due date</Label>
                <div className='relative'>
                  <CalendarDays className='text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2' />
                  <Input
                    id='dueDate'
                    name='dueDate'
                    type='date'
                    className='border-primary/40 bg-background text-foreground pl-9'
                    required
                  />
                </div>
              </div>

              <SubmitButton
                text='Distribute amount to associations'
                className='h-auto min-h-10 w-full min-w-0 px-3 py-2 text-center leading-tight whitespace-normal'
              />
            </form>

            <form action={resetFormAction} className='min-w-0'>
              <SubmitButton
                text='Reset calculation'
                className='h-auto min-h-10 w-full min-w-0 bg-red-600 px-3 py-2 whitespace-normal text-white hover:bg-red-700'
              />
            </form>

            <form
              action={zeroFormAction}
              className='min-w-0'
              onSubmit={event => {
                const shouldReset = window.confirm(
                  'Reset every association contribution balance to $0.00 and clear the current contribution cycle? Payment history will be kept.'
                )

                if (!shouldReset) {
                  event.preventDefault()
                }
              }}
            >
              <SubmitButton
                text='Zero all balances'
                className='h-auto min-h-10 w-full min-w-0 bg-orange-600 px-3 py-2 whitespace-normal text-white hover:bg-orange-700'
              />
            </form>
          </div>

          <div className='grid min-w-0 gap-2'>
            <p className='text-muted-foreground text-sm'>Vested members currently counted: {vestedMembersCount}</p>
            {state.message ? <p className='text-primary text-sm font-medium'>{state.message}</p> : null}
            {resetState.message ? <p className='text-primary text-sm font-medium'>{resetState.message}</p> : null}
            {zeroState.message ? <p className='text-primary text-sm font-medium'>{zeroState.message}</p> : null}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default ContributionAssessmentForm
