'use client'

import { useActionState } from 'react'

import { CalendarDays, DollarSign, HeartHandshake } from 'lucide-react'

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
  calculationDeathCount: number
  monthlyContributionTotal: number
  vestedMembersCount: number
}

const initialState = {
  message: ''
}

const currencyFormatter = new Intl.NumberFormat('en-US', {
  currency: 'USD',
  style: 'currency'
})

const ContributionAssessmentForm = ({
  calculationDeathCount,
  monthlyContributionTotal,
  vestedMembersCount
}: ContributionAssessmentFormProps) => {
  const [state, formAction] = useActionState(createAssociationContributionAssessmentAction, initialState)
  const [resetState, resetFormAction] = useActionState(resetAssociationContributionCalculationAction, initialState)
  const [zeroState, zeroFormAction] = useActionState(zeroAllAssociationContributionBalancesAction, initialState)

  const calculatedAmountPerVestedMember =
    vestedMembersCount > 0 ? Number((monthlyContributionTotal / vestedMembersCount).toFixed(2)) : 0

  const hasVestedMembers = vestedMembersCount > 0

  return (
    <Card className='border-primary/30 bg-primary/10 w-full max-w-full min-w-0 overflow-hidden py-0'>
      <CardHeader className='border-primary/20 min-w-0 border-b py-5'>
        <CardTitle className='text-xl leading-tight break-words'>Amount to be contributed this month</CardTitle>
        <CardDescription className='break-words'>
          Use the calculated contribution values, or enter manual values for the monthly contribution per member and the
          number of deaths before publishing.
        </CardDescription>
      </CardHeader>
      <CardContent className='min-w-0 py-5'>
        <div className='grid w-full min-w-0 gap-4'>
          <div className='grid w-full min-w-0 grid-cols-[minmax(0,1fr)] gap-4 md:grid-cols-2 xl:grid-cols-7 xl:items-end'>
            <form action={formAction} className='contents'>
              <div className='grid min-w-0 gap-2'>
                <Label>Calculated contribution total</Label>
                <div className='border-primary/40 bg-background text-foreground flex min-h-10 items-center gap-2 rounded-md border px-3 py-2 font-semibold'>
                  <DollarSign className='text-muted-foreground size-4 shrink-0' />
                  <span>{currencyFormatter.format(monthlyContributionTotal)}</span>
                </div>
              </div>

              <div className='grid min-w-0 gap-2'>
                <Label>Calculated per member</Label>
                <div className='border-primary/40 bg-background text-foreground flex min-h-10 items-center gap-2 rounded-md border px-3 py-2 font-semibold'>
                  <DollarSign className='text-muted-foreground size-4 shrink-0' />
                  <span>{currencyFormatter.format(calculatedAmountPerVestedMember)}</span>
                </div>
              </div>

              <div className='grid min-w-0 gap-2'>
                <Label htmlFor='manualAmountPerVestedMember'>Manual per member</Label>
                <div className='relative'>
                  <DollarSign className='text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2' />
                  <Input
                    id='manualAmountPerVestedMember'
                    name='manualAmountPerVestedMember'
                    type='number'
                    inputMode='decimal'
                    min='0.01'
                    step='0.01'
                    placeholder='Optional'
                    className='border-primary/40 bg-background text-foreground pl-9 font-semibold'
                  />
                </div>
              </div>

              <div className='grid min-w-0 gap-2'>
                <Label>Calculated deaths</Label>
                <div className='border-primary/40 bg-background text-foreground flex min-h-10 items-center gap-2 rounded-md border px-3 py-2 font-semibold'>
                  <HeartHandshake className='text-muted-foreground size-4 shrink-0' />
                  <span>{calculationDeathCount}</span>
                </div>
              </div>

              <div className='grid min-w-0 gap-2'>
                <Label htmlFor='manualDeathCount'>Manual deaths</Label>
                <div className='relative'>
                  <HeartHandshake className='text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2' />
                  <Input
                    id='manualDeathCount'
                    name='manualDeathCount'
                    type='number'
                    inputMode='numeric'
                    min='1'
                    step='1'
                    placeholder='Optional'
                    className='border-primary/40 bg-background text-foreground pl-9 font-semibold'
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
                text='Publish Contribution'
                disabled={!hasVestedMembers}
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
                text='Zero All Balances'
                className='h-auto min-h-10 w-full min-w-0 bg-orange-600 px-3 py-2 whitespace-normal text-white hover:bg-orange-700'
              />
            </form>
          </div>

          <div className='grid min-w-0 gap-2'>
            <p className='text-muted-foreground text-sm'>Vested members currently counted: {vestedMembersCount}</p>
            {!hasVestedMembers ? (
              <p className='text-destructive text-sm font-medium'>Add at least one vested member before publishing.</p>
            ) : calculationDeathCount === 0 || monthlyContributionTotal <= 0 ? (
              <p className='text-destructive text-sm font-medium'>
                Enter manual contribution values, or add deaths in Contribution Calculation before publishing.
              </p>
            ) : null}
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
