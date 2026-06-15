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

const initialState = {
  message: ''
}

const zelleReminder =
  'Send the Zelle first, then enter the exact amount here. Include your 4-letter association code in the Zelle memo.'

type PaymentAction = typeof saveAssociationContributionPaymentAction

type PaymentFormProps = {
  action: PaymentAction
  fieldLabel: string
  submitText: string
}

type ContributionPaymentPageProps = {
  associationCode: string
  contribution: AssociationContributionSummary
  kind: 'contribution'
}

type RegistrationPaymentPageProps = {
  associationCode: string
  kind: 'registration'
  registration: AssociationRegistrationSummary
}

type AssociationPaymentPageContentProps = ContributionPaymentPageProps | RegistrationPaymentPageProps

const PaymentForm = ({ action, fieldLabel, submitText }: PaymentFormProps) => {
  const [state, formAction] = useActionState(action, initialState)
  const amountInputId = useId()

  useEffect(() => {
    if (state.message) toast(state.message)
  }, [state])

  return (
    <form
      action={formAction}
      className='border-secondary bg-secondary text-secondary-foreground h-full min-h-56 min-w-0 rounded-md border px-3 py-3 sm:px-4'
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

const SummaryCard = ({ children, title, balance }: { children: React.ReactNode; title: string; balance: number }) => (
  <div className='border-primary/20 bg-primary/10 text-primary flex h-full min-h-56 min-w-0 flex-col rounded-md border px-3 py-3 sm:px-4'>
    <p className='text-lg font-extrabold break-words sm:text-xl'>{title}</p>
    <div className='mt-2 grid gap-1.5 text-sm font-semibold'>{children}</div>
    <BalanceRow balance={balance} />
    <p className='text-primary/70 mt-auto pt-4 text-[10px] leading-tight font-medium break-words'>
      All amounts will be verified by SAGI and reversed if they do not match the payment received.
    </p>
  </div>
)

const AssociationPaymentPageContent = (props: AssociationPaymentPageContentProps) => {
  const isContributionPayment = props.kind === 'contribution'
  const currentMonthName = monthFormatter.format(new Date())

  const title = isContributionPayment ? 'Contribution Payment' : 'Registration Payment'

  const amountTitle = isContributionPayment
    ? `${currentMonthName}'s Contribution: ${currencyFormatter.format(props.contribution.amountOwed)}`
    : `Your Registration Dues: ${currencyFormatter.format(props.registration.balanceDues)}`

  const amountDetail = isContributionPayment
    ? `${props.contribution.vestedMembersCount} vested member(s) x ${currencyFormatter.format(
        props.contribution.amountPerVestedMember
      )}`
    : `${Math.round(props.registration.balanceDues / registrationFeePerEligibleMember)} pending member(s) x ${currencyFormatter.format(
        registrationFeePerEligibleMember
      )}`

  const dueDate = isContributionPayment ? props.contribution.dueDate : null

  return (
    <section className='space-y-6 py-8 sm:py-10'>
      <div>
        <h1 className='text-xl font-semibold tracking-normal md:text-4xl'>{title}</h1>
        <p className='text-muted-foreground mt-2 max-w-4xl text-sm leading-6 sm:text-base'>
          Scan or click the QR code to send payment by Zelle. Add{' '}
          <strong className='font-extrabold'>Sagicam-{props.associationCode}</strong> in the memo so the payment can be
          matched to your association, then record the amount sent.
        </p>
      </div>

      <div className='grid w-full grid-cols-1 items-stretch gap-4 lg:grid-cols-3'>
        <div className='grid h-full min-w-0 auto-rows-fr gap-4'>
          <div className='border-primary/20 bg-primary/10 text-primary flex h-full min-h-32 min-w-0 flex-col rounded-md border px-3 py-3 sm:px-4'>
            <p className='text-lg font-extrabold break-words sm:text-xl'>{amountTitle}</p>
            <p className='text-primary/80 mt-1 text-sm font-semibold break-words'>{amountDetail}</p>
            <p
              className={cn(
                'mt-2 text-sm font-extrabold break-words text-teal-600 dark:text-teal-300',
                !dueDate && 'invisible'
              )}
            >
              {dueDate ? `Due ${dateFormatter.format(new Date(dueDate))}` : 'Due date'}
            </p>
          </div>
          <div className='border-primary/20 bg-primary/10 text-primary flex h-full min-h-32 min-w-0 flex-col justify-center rounded-md border px-3 py-3 sm:px-4'>
            <p className='text-lg font-extrabold break-words sm:text-xl'>Payment instructions</p>
            <p className='text-primary/80 mt-1 text-sm font-semibold break-words'>
              Send the Zelle payment first, then record the exact amount here for SAGI verification.
            </p>
          </div>
        </div>

        <Link
          href={sagiPaymentUrl}
          className='border-primary/20 bg-background flex h-full min-h-60 min-w-0 items-center justify-center rounded-md border p-0 sm:p-1'
        >
          <Image
            src={sagiQrCodeUrl}
            width={320}
            height={320}
            alt='SAGI payment QR code'
            className='h-auto max-h-80 w-full max-w-80'
          />
        </Link>

        <div className='grid h-full min-w-0 auto-rows-fr gap-4'>
          <PaymentForm
            action={
              isContributionPayment
                ? saveAssociationContributionPaymentAction
                : saveAssociationRegistrationPaymentAction
            }
            fieldLabel={isContributionPayment ? 'Contribution amount sent' : 'Registration amount sent'}
            submitText={isContributionPayment ? 'Add Contribution Amount Sent' : 'Add Registration Amount Sent'}
          />

          {isContributionPayment ? (
            <SummaryCard title='Contribution payment summary' balance={props.contribution.balance}>
              <SummaryRow label='Amount Sent' value={props.contribution.amountReceived} />
              <SummaryRow label='Amount Verified by SAGI' value={props.contribution.amountVerified} />
              <SummaryRow label='Contribution Dues' value={props.contribution.amountOwed} />
              <SummaryRow label='Existing Balance' value={props.contribution.existingBalance} />
              {props.contribution.manualBalanceAdjustment > 0 ? (
                <SummaryRow label='Balance Adjustment' value={props.contribution.manualBalanceAdjustment} />
              ) : null}
            </SummaryCard>
          ) : (
            <SummaryCard title='Registration payment summary' balance={props.registration.balance}>
              <SummaryRow label='Amount Sent' value={props.registration.amountReceived} />
              <SummaryRow label='Amount Verified by SAGI' value={props.registration.amountVerified} />
              <SummaryRow label='Balance Dues' value={props.registration.balanceDues} />
              {props.registration.manualBalanceAdjustment > 0 ? (
                <SummaryRow label='Balance Adjustment' value={props.registration.manualBalanceAdjustment} />
              ) : null}
            </SummaryCard>
          )}
        </div>
      </div>
    </section>
  )
}

export default AssociationPaymentPageContent
