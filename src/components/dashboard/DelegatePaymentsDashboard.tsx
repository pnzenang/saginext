'use client'

import { useActionState, useEffect, useId } from 'react'

import Image from 'next/image'
import Link from 'next/link'
import { DollarSign } from 'lucide-react'
import { toast } from 'sonner'

import { SubmitButton } from '@/components/forms/Buttons'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { saveAssociationContributionPaymentAction, saveAssociationRegistrationPaymentAction } from '@/utils/actions'
import { registrationFeePerEligibleMember } from '@/utils/payment-constants'
import type { AssociationContributionSummary } from '@/utils/sagi-contribution-summary'
import type { AssociationRegistrationSummary } from '@/utils/sagi-registration-summary'

const currencyFormatter = new Intl.NumberFormat('en-US', {
  currency: 'USD',
  style: 'currency'
})

const monthFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'long'
})

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium'
})

const sagiPaymentUrl =
  'https://enroll.zellepay.com/qr-codes?data=eyJuYW1lIjoiUEFUUklDRSIsImFjdGlvbiI6InBheW1lbnQiLCJ0b2tlbiI6IjQ0MzUzMTU4NTIifQ=='

const sagiQrCodeUrl = 'https://res.cloudinary.com/dp8tkb7hq/image/upload/v1778042720/sagiQrCode_jmwsbf.svg'

type MembershipSummary = {
  awaiting: number
  delinquent: number
  pending: number
  total: number
  vested: number
}

type DelegatePaymentsDashboardProps = {
  associationCode: string
  currentContribution: AssociationContributionSummary
  currentRegistrationPayment: AssociationRegistrationSummary
  membershipSummary: MembershipSummary
}

type PaymentFormProps = {
  action: typeof saveAssociationContributionPaymentAction
  amountExpected: number
  amountSent: number
  fieldLabel: string
  submitText: string
}

const initialState = {
  message: ''
}

const zelleReminder =
  'Send the Zelle first, then enter the exact amount here. Include your 4-letter association code in the Zelle memo.'

const PaymentForm = ({ action, amountExpected, amountSent, fieldLabel, submitText }: PaymentFormProps) => {
  const [state, formAction] = useActionState(action, initialState)
  const amountInputId = useId()
  const cardIsComplete = amountExpected <= 0 || amountSent >= amountExpected

  useEffect(() => {
    if (state.message) toast(state.message)
  }, [state])

  return (
    <form
      action={formAction}
      className={cn(
        'h-full min-w-0 rounded-md border px-3 py-3 sm:px-4',
        cardIsComplete
          ? 'border-green-600/20 bg-green-600/10 text-green-700 dark:text-green-300'
          : 'border-red-600/20 bg-red-600/10 text-red-700 dark:text-red-300'
      )}
    >
      <div className='grid gap-3'>
        <div className='grid gap-2'>
          <Label htmlFor={amountInputId} className='text-sm font-extrabold break-words sm:text-base'>
            {fieldLabel}
          </Label>
          <div className='relative'>
            <DollarSign className='pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 opacity-70' />
            <Input
              id={amountInputId}
              name='amountSent'
              type='number'
              inputMode='decimal'
              min='0'
              step='0.01'
              placeholder='0.00'
              className='bg-background text-foreground pl-9'
              required
            />
          </div>
        </div>

        <p className='text-muted-foreground text-xs leading-snug font-semibold'>{zelleReminder}</p>
        <SubmitButton text={submitText} className='w-full whitespace-normal' />
        {state.message ? <p className='text-sm font-semibold break-words'>{state.message}</p> : null}
      </div>
    </form>
  )
}

const SummaryRow = ({ label, value }: { label: string; value: number }) => (
  <div className='text-primary/80 flex items-start justify-between gap-4'>
    <span className='min-w-0 break-words'>{label}</span>
    <span className='shrink-0 text-right tabular-nums'>{currencyFormatter.format(value)}</span>
  </div>
)

const BalanceRow = ({ balance }: { balance: number }) => (
  <div
    className={cn(
      'mt-2 flex items-start justify-between gap-4 text-base font-extrabold',
      balance >= 0 ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'
    )}
  >
    <span className='min-w-0 break-words'>
      Balance{' '}
      {balance >= 0 ? (
        <span className='text-[10px] leading-tight font-medium'>(To be used for upcoming payments)</span>
      ) : null}
    </span>
    <span className='shrink-0 text-right tabular-nums'>{currencyFormatter.format(balance)}</span>
  </div>
)

const DelegatePaymentsDashboard = ({
  associationCode,
  currentContribution,
  currentRegistrationPayment,
  membershipSummary
}: DelegatePaymentsDashboardProps) => {
  const currentMonthName = monthFormatter.format(new Date())
  const monthlyContributionAmount = currentContribution.amountOwed
  const registrationPaymentAmount = membershipSummary.pending * registrationFeePerEligibleMember

  return (
    <div className='w-full pb-4'>
      <div className='grid w-full grid-cols-1 items-stretch gap-4 md:grid-cols-2 xl:grid-cols-4'>
        <div className='grid h-full min-w-0 auto-rows-fr gap-4'>
          <div className='border-primary/20 bg-primary/10 text-primary flex h-full min-w-0 flex-col rounded-md border px-3 py-3 sm:px-4'>
            <p className='text-lg font-extrabold break-words sm:text-xl'>
              {currentMonthName}&apos;s Contribution: {currencyFormatter.format(monthlyContributionAmount)}
            </p>
            <p className='text-primary/80 mt-1 text-sm font-semibold break-words'>
              {currentContribution.vestedMembersCount} vested member(s) x{' '}
              {currencyFormatter.format(currentContribution.amountPerVestedMember)}
            </p>
            {currentContribution.dueDate ? (
              <p className='text-primary/80 mt-2 text-sm font-extrabold break-words'>
                Due {dateFormatter.format(new Date(currentContribution.dueDate))}
              </p>
            ) : null}
          </div>
          <div className='border-primary/20 bg-primary/10 text-primary flex h-full min-w-0 flex-col rounded-md border px-3 py-3 sm:px-4'>
            <p className='text-lg font-extrabold break-words sm:text-xl'>
              Your Registration Dues: {currencyFormatter.format(registrationPaymentAmount)}
            </p>
            <p className='text-primary/80 mt-1 text-sm font-semibold break-words'>
              {membershipSummary.pending} pending member(s) x{' '}
              {currencyFormatter.format(registrationFeePerEligibleMember)}
            </p>
          </div>
        </div>

        <div className='grid h-full min-w-0 auto-rows-fr gap-4'>
          <Link
            href={sagiPaymentUrl}
            className='border-primary/20 bg-background flex h-full min-h-44 min-w-0 items-center justify-center rounded-md border p-3'
          >
            <Image
              src={sagiQrCodeUrl}
              width={190}
              height={190}
              alt='SAGI payment QR code'
              className='h-auto max-h-48 w-full max-w-48'
            />
          </Link>
          <div className='border-primary/20 bg-primary/10 text-primary flex h-full min-w-0 flex-col justify-center rounded-md border px-3 py-3 sm:px-4'>
            <p className='text-lg font-extrabold break-words sm:text-xl'>Payment instructions</p>
            <p className='text-primary/80 mt-1 text-sm font-semibold break-words'>
              Scan or click the QR code to send payment by Zelle. Add {associationCode} in the memo so the payment can
              be matched to your association, then record the contribution or registration amount sent.
            </p>
          </div>
        </div>

        <div className='grid h-full min-w-0 auto-rows-fr gap-4'>
          <PaymentForm
            action={saveAssociationContributionPaymentAction}
            amountExpected={monthlyContributionAmount}
            amountSent={Math.max(currentContribution.amountReceived, currentContribution.amountVerified)}
            fieldLabel='Contribution amount sent'
            submitText='Add Contribution Amount Sent'
          />
          <PaymentForm
            action={saveAssociationRegistrationPaymentAction}
            amountExpected={registrationPaymentAmount}
            amountSent={Math.max(currentRegistrationPayment.amountReceived, currentRegistrationPayment.amountVerified)}
            fieldLabel='Registration amount sent'
            submitText='Add Registration Amount Sent'
          />
        </div>

        <div className='grid h-full min-w-0 auto-rows-fr gap-4'>
          <div className='border-primary/20 bg-primary/10 text-primary flex h-full min-w-0 flex-col rounded-md border px-3 py-3 sm:px-4'>
            <p className='text-lg font-extrabold break-words sm:text-xl'>Contribution payment summary</p>
            <div className='mt-2 grid gap-1.5 text-sm font-semibold'>
              <SummaryRow label='Amount Sent' value={currentContribution.amountReceived} />
              <SummaryRow label='Amount Verified by SAGI' value={currentContribution.amountVerified} />
              <SummaryRow label='Contribution Owed' value={currentContribution.amountOwed} />
              <SummaryRow label='Existing Balance' value={currentContribution.existingBalance} />
              {currentContribution.manualBalanceAdjustment > 0 ? (
                <SummaryRow label='Balance Adjustment' value={currentContribution.manualBalanceAdjustment} />
              ) : null}
            </div>
            <BalanceRow balance={currentContribution.balance} />
            <p className='text-primary/70 mt-auto pt-4 text-[10px] leading-tight font-medium break-words'>
              All amounts will be verified by SAGI and reversed if they do not match the payment received.
            </p>
          </div>

          <div className='border-primary/20 bg-primary/10 text-primary flex h-full min-w-0 flex-col rounded-md border px-3 py-3 sm:px-4'>
            <p className='text-lg font-extrabold break-words sm:text-xl'>Registration payment summary</p>
            <div className='mt-2 grid gap-1.5 text-sm font-semibold'>
              <SummaryRow label='Amount Sent' value={currentRegistrationPayment.amountReceived} />
              <SummaryRow label='Amount Verified by SAGI' value={currentRegistrationPayment.amountVerified} />
              <SummaryRow label='Balance Dues' value={currentRegistrationPayment.balanceDues} />
              {currentRegistrationPayment.manualBalanceAdjustment > 0 ? (
                <SummaryRow label='Balance Adjustment' value={currentRegistrationPayment.manualBalanceAdjustment} />
              ) : null}
            </div>
            <BalanceRow balance={currentRegistrationPayment.balance} />
            <p className='text-primary/70 mt-auto pt-4 text-[10px] leading-tight font-medium break-words'>
              All amounts will be verified by SAGI and reversed if they do not match the payment received.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DelegatePaymentsDashboard
