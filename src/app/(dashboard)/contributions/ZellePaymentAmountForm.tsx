'use client'

import { useActionState, useEffect, useId } from 'react'

import { DollarSign } from 'lucide-react'
import { toast } from 'sonner'

import { SubmitButton } from '@/components/forms/Buttons'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { saveAssociationContributionPaymentAction, saveAssociationRegistrationPaymentAction } from '@/utils/actions'
import type { ContributionPaymentAmountDetails } from '@/utils/contribution-payment-code'

type ZellePaymentAmountFormProps = {
  contributionPaymentAmountDetails?: ContributionPaymentAmountDetails
  paymentType: 'contribution' | 'registration'
}

const initialState = {
  message: ''
}

const paymentFormCopy = {
  contribution: {
    label: 'Contribution Amount Sent',
    submitText: 'Submit Contribution Amount'
  },
  registration: {
    label: 'Registration Amount Sent',
    submitText: 'Submit Registration Amount'
  }
} as const

const currencyFormatter = new Intl.NumberFormat('en-US', {
  currency: 'USD',
  style: 'currency'
})

const ZellePaymentAmountForm = ({ contributionPaymentAmountDetails, paymentType }: ZellePaymentAmountFormProps) => {
  const amountInputId = useId()

  const action =
    paymentType === 'registration' ? saveAssociationRegistrationPaymentAction : saveAssociationContributionPaymentAction

  const [state, formAction] = useActionState(action, initialState)
  const copy = paymentFormCopy[paymentType]

  const shouldShowContributionAmountDetails =
    paymentType === 'contribution' &&
    contributionPaymentAmountDetails !== undefined &&
    contributionPaymentAmountDetails.amountDue > 0

  useEffect(() => {
    if (state.message) toast(state.message)
  }, [state])

  return (
    <form action={formAction} className='mx-auto mt-6 grid w-full max-w-3xl gap-4 text-left'>
      {shouldShowContributionAmountDetails ? (
        <div className='bg-primary/5 text-primary rounded-lg p-4 ring-1 ring-primary/15'>
          <p className='text-lg leading-tight font-semibold sm:text-xl'>Contribution amount to send</p>
          <div className='mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4'>
            <div>
              <p className='text-primary/70 text-xs font-semibold uppercase'>Due</p>
              <p className='mt-1 text-lg font-extrabold'>
                {currencyFormatter.format(contributionPaymentAmountDetails.amountDue)}
              </p>
            </div>
            <div>
              <p className='text-primary/70 text-xs font-semibold uppercase'>Rounded up</p>
              <p className='mt-1 text-lg font-extrabold'>
                {currencyFormatter.format(contributionPaymentAmountDetails.roundedAmountDue)}
              </p>
            </div>
            <div>
              <p className='text-primary/70 text-xs font-semibold uppercase'>Code</p>
              <p className='mt-1 text-lg font-extrabold'>
                {contributionPaymentAmountDetails.hasPaymentCode
                  ? currencyFormatter.format(contributionPaymentAmountDetails.paymentCodeAmount)
                  : 'Not entered'}
              </p>
            </div>
            <div>
              <p className='text-primary/70 text-xs font-semibold uppercase'>Enter exactly</p>
              <p className='mt-1 text-lg font-extrabold'>
                {currencyFormatter.format(contributionPaymentAmountDetails.amountToSend)}
              </p>
            </div>
          </div>
        </div>
      ) : null}

      <div className='grid gap-2'>
        <Label htmlFor={amountInputId} className='text-primary text-lg font-semibold sm:text-xl lg:text-2xl'>
          {copy.label}
        </Label>
        <div className='relative'>
          <DollarSign className='text-muted-foreground pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2' />
          <Input
            id={amountInputId}
            name='amountSent'
            type='number'
            inputMode='decimal'
            min='0'
            step='0.01'
            placeholder={
              shouldShowContributionAmountDetails ? contributionPaymentAmountDetails.amountToSend.toFixed(2) : '0.00'
            }
            className='h-14 pl-11 text-lg font-normal sm:text-xl'
            required
          />
        </div>
      </div>

      <SubmitButton text={copy.submitText} className='w-full' />
      {state.message ? <p className='text-primary text-sm font-normal break-words'>{state.message}</p> : null}
    </form>
  )
}

export default ZellePaymentAmountForm
