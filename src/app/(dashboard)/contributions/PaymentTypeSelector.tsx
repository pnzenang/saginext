'use client'

import { useState } from 'react'

import { Banknote, CreditCard, HandCoins, Landmark, UserPlus, WalletCards } from 'lucide-react'
import Link from 'next/link'
import { SiZelle } from 'react-icons/si'

import { cn } from '@/lib/utils'
import {
  getContributionPaymentAmountDetails,
  type ContributionPaymentAmountDetails
} from '@/utils/contribution-payment-code'

const currencyFormatter = new Intl.NumberFormat('en-US', {
  currency: 'USD',
  style: 'currency'
})

type PaymentType = 'contribution' | 'registration'

const paymentTypeOptions: { icon: typeof UserPlus; label: string; value: PaymentType }[] = [
  { icon: UserPlus, label: 'Registration payment', value: 'registration' },
  { icon: HandCoins, label: 'Contribution payment', value: 'contribution' }
]

type PaymentInstructionRoutes = {
  bankDeposit: string
  card: string
  cashapp: string
  zelle: string
}

const paymentInstructionRoutes: Record<PaymentType, PaymentInstructionRoutes> = {
  contribution: {
    bankDeposit: '/contributions/contribution-payment/bank-deposit',
    card: '/contributions/contribution-payment/card',
    cashapp: '/contributions/contribution-payment/cashapp',
    zelle: '/contributions/contribution-payment/zelle'
  },
  registration: {
    bankDeposit: '/contributions/registration-payment/bank-deposit',
    card: '/contributions/registration-payment/card',
    cashapp: '/contributions/registration-payment/cashapp',
    zelle: '/contributions/registration-payment/zelle'
  }
}

const paymentOptionCardClassName =
  'border-primary/20 bg-primary/10 text-primary flex min-h-64 w-full flex-col items-center justify-center rounded-lg border p-5 text-center shadow-sm sm:p-6 xl:p-5 2xl:p-8'

const paymentOptionLinkClassName =
  'max-w-full text-[clamp(1rem,1.18vw,1.375rem)] font-extrabold whitespace-nowrap underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40'

type PaymentOptionCardsProps = {
  routes: PaymentInstructionRoutes
}

const PaymentOptionCards = ({ routes }: PaymentOptionCardsProps) => (
  <>
    <div className={paymentOptionCardClassName}>
      <SiZelle className='mb-4 size-12 text-[#6d1ed4]' aria-hidden='true' />
      <Link href={routes.zelle} className={paymentOptionLinkClassName}>
        Pay with Zelle
      </Link>
    </div>

    <div className={paymentOptionCardClassName}>
      <Landmark className='mb-4 size-12' aria-hidden='true' />
      <Link href={routes.bankDeposit} className={paymentOptionLinkClassName}>
        Pay by Bank Deposit/Transfer
      </Link>
    </div>
  </>
)

type PaymentDetailsProps = {
  amount: number
  contributionPaymentAmountDetails?: ContributionPaymentAmountDetails
  detailCount: number
  detailLabel: string
  detailUnitAmount: number
  emptyMessage: string
  hasPaymentDue: boolean
  routes: PaymentInstructionRoutes
  title: string
  totalLabel: string
}

const PaymentDetails = ({
  amount,
  contributionPaymentAmountDetails,
  detailCount,
  detailLabel,
  detailUnitAmount,
  emptyMessage,
  hasPaymentDue,
  routes,
  title,
  totalLabel
}: PaymentDetailsProps) => {
  if (!hasPaymentDue) {
    return (
      <div className='border-primary/20 bg-primary/10 text-primary w-full rounded-lg border p-4 shadow-sm sm:p-6'>
        <p className='text-lg font-extrabold break-words sm:text-xl'>{title}</p>
        <p className='text-primary/80 mt-2 text-sm font-semibold break-words'>{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className='grid w-full gap-4 lg:grid-cols-2'>
      <div className='border-primary/20 bg-primary/10 text-primary flex min-h-80 w-full flex-col items-center justify-center rounded-lg border p-6 text-center shadow-sm sm:p-10 lg:col-span-2'>
        <Banknote className='mb-5 size-14' aria-hidden='true' />
        <p className='max-w-full text-2xl font-extrabold whitespace-nowrap sm:text-3xl lg:text-4xl'>{title}</p>
        <p className='mt-4 max-w-full text-xl font-extrabold whitespace-nowrap sm:text-2xl lg:text-3xl'>
          {totalLabel}: {currencyFormatter.format(amount)}
        </p>
        <p className='text-primary/80 mt-3 max-w-full text-base font-semibold whitespace-nowrap sm:text-lg lg:text-xl'>
          {detailCount} {detailLabel}
          {detailCount === 1 ? '' : 's'} x {currencyFormatter.format(detailUnitAmount)}
        </p>
        {contributionPaymentAmountDetails ? (
          <div
            className={`mt-6 grid w-full max-w-5xl gap-3 sm:grid-cols-2 ${
              contributionPaymentAmountDetails.hasPaymentCode ? 'xl:grid-cols-4' : 'xl:grid-cols-3'
            }`}
          >
            <div className='bg-background/70 ring-primary/15 rounded-lg p-3 ring-1'>
              <p className='text-primary/70 text-xs font-semibold uppercase'>Contribution due</p>
              <p className='mt-1 text-xl font-extrabold'>
                {currencyFormatter.format(contributionPaymentAmountDetails.amountDue)}
              </p>
            </div>
            <div className='bg-background/70 ring-primary/15 rounded-lg p-3 ring-1'>
              <p className='text-primary/70 text-xs font-semibold uppercase'>Rounded up</p>
              <p className='mt-1 text-xl font-extrabold'>
                {currencyFormatter.format(contributionPaymentAmountDetails.roundedAmountDue)}
              </p>
            </div>
            {contributionPaymentAmountDetails.hasPaymentCode ? (
              <div className='bg-background/70 ring-primary/15 rounded-lg p-3 ring-1'>
                <p className='text-primary/70 text-xs font-semibold uppercase'>Payment code</p>
                <p className='mt-1 text-xl font-extrabold'>
                  {currencyFormatter.format(contributionPaymentAmountDetails.paymentCodeAmount)}
                </p>
              </div>
            ) : null}
            <div className='bg-background/70 ring-primary/15 rounded-lg p-3 ring-1'>
              <p className='text-primary/70 text-xs font-semibold uppercase'>Send exactly</p>
              <p className='mt-1 text-xl font-extrabold'>
                {currencyFormatter.format(contributionPaymentAmountDetails.amountToSend)}
              </p>
            </div>
          </div>
        ) : null}
      </div>

      <PaymentOptionCards routes={routes} />
    </div>
  )
}

type PaymentTypeSelectorProps = {
  contributionAmountOwed: number
  contributionAmountToMatch: number
  contributionAmountPerVestedMember: number
  contributionPaymentCodeCents: number | null
  contributionVestedMemberCount: number
  pendingRegistrationMemberCount: number
  registrationFeePerMember: number
}

const PaymentTypeSelector = ({
  contributionAmountOwed,
  contributionAmountToMatch,
  contributionAmountPerVestedMember,
  contributionPaymentCodeCents,
  contributionVestedMemberCount,
  pendingRegistrationMemberCount,
  registrationFeePerMember
}: PaymentTypeSelectorProps) => {
  const [paymentType, setPaymentType] = useState<PaymentType | ''>('')
  const registrationDues = pendingRegistrationMemberCount * registrationFeePerMember

  const contributionPaymentAmountDetails = getContributionPaymentAmountDetails(
    contributionAmountOwed,
    contributionPaymentCodeCents
  )

  const contributionPaymentAmount = contributionAmountOwed > 0 ? contributionAmountToMatch : 0

  const handlePaymentTypeChange = (value: PaymentType) => {
    setPaymentType(value)
  }

  const selectedPaymentDetails =
    paymentType === 'registration'
      ? {
          amount: registrationDues,
          detailCount: pendingRegistrationMemberCount,
          detailLabel: 'pending member',
          detailUnitAmount: registrationFeePerMember,
          emptyMessage: 'You have no pending member at this time.',
          hasPaymentDue: pendingRegistrationMemberCount > 0,
          routes: paymentInstructionRoutes.registration,
          title: 'Registration payment',
          totalLabel: 'Your Registration Dues'
        }
      : paymentType === 'contribution'
        ? {
            amount: contributionPaymentAmount,
            contributionPaymentAmountDetails,
            detailCount: contributionVestedMemberCount,
            detailLabel: 'vested member',
            detailUnitAmount: contributionAmountPerVestedMember,
            emptyMessage: 'You have no contribution payment at this time.',
            hasPaymentDue: contributionAmountOwed > 0,
            routes: paymentInstructionRoutes.contribution,
            title: 'Contribution payment',
            totalLabel: 'Your Contribution Amount'
          }
        : null

  return (
    <section className='mx-auto grid w-full max-w-[90rem] min-w-0 shrink-0 gap-5 overflow-visible px-0 py-4 sm:px-6 sm:py-8 lg:px-8'>
      <div className='bg-primary text-primary-foreground border-primary/30 w-full rounded-lg border p-5 shadow-md sm:p-7'>
        <div className='flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between'>
          <div className='flex min-w-0 items-center gap-4'>
            <span className='bg-primary-foreground/15 flex size-14 shrink-0 items-center justify-center rounded-lg'>
              <WalletCards className='size-7' aria-hidden='true' />
            </span>
            <div className='min-w-0'>
              <h1 className='text-3xl font-extrabold tracking-normal sm:text-4xl'>Payment Center</h1>
              <p className='text-primary-foreground/85 mt-2 max-w-3xl text-base font-medium sm:text-lg'>
                Choose the payment type, review the amount due, then continue with your preferred payment method.
              </p>
            </div>
          </div>

          <div className='grid shrink-0 gap-3 sm:grid-cols-2 lg:min-w-[28rem]'>
            <div className='bg-primary-foreground/10 ring-primary-foreground/20 rounded-lg p-4 ring-1'>
              <p className='text-primary-foreground/80 text-sm font-semibold'>Registration due</p>
              <p className='mt-1 text-2xl font-extrabold'>{currencyFormatter.format(registrationDues)}</p>
            </div>
            <div className='bg-primary-foreground/10 ring-primary-foreground/20 rounded-lg p-4 ring-1'>
              <p className='text-primary-foreground/80 text-sm font-semibold'>Contribution amount</p>
              <p className='mt-1 text-2xl font-extrabold'>{currencyFormatter.format(contributionPaymentAmount)}</p>
              {contributionAmountOwed > 0 && contributionPaymentAmountDetails.hasPaymentCode ? (
                <p className='text-primary-foreground/75 mt-1 text-xs font-semibold'>Code included</p>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <div className='grid w-full gap-5 md:grid-cols-2'>
        <div className='border-primary/25 bg-background w-full rounded-lg border p-4 shadow-sm sm:p-6'>
          <div className='flex items-start gap-3'>
            <span className='bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-lg'>
              <CreditCard className='size-5' aria-hidden='true' />
            </span>
            <div className='min-w-0'>
              <h1 className='text-2xl font-extrabold tracking-normal sm:text-3xl'>
                What type of payment are you making?
              </h1>
            </div>
          </div>
        </div>

        <div className='border-primary/25 bg-background w-full rounded-lg border p-4 shadow-sm sm:p-6'>
          <div className='grid w-full gap-3'>
            <p id='payment-type-label' className='text-sm leading-none font-medium'>
              Choose a payment type
            </p>
            {/* Two always-visible buttons instead of a dropdown, so neither option can be missed on a phone. */}
            <div role='radiogroup' aria-labelledby='payment-type-label' className='grid gap-3 sm:grid-cols-2'>
              {paymentTypeOptions.map(option => {
                const isSelected = paymentType === option.value
                const Icon = option.icon
                const amountDue = option.value === 'registration' ? registrationDues : contributionPaymentAmount

                return (
                  <button
                    key={option.value}
                    type='button'
                    role='radio'
                    aria-checked={isSelected}
                    onClick={() => handlePaymentTypeChange(option.value)}
                    className={cn(
                      'focus-visible:ring-ring/50 flex min-h-20 w-full items-center gap-4 rounded-lg border-2 p-4 text-left transition-colors focus-visible:ring-3 focus-visible:outline-none',
                      isSelected
                        ? 'border-primary bg-primary text-primary-foreground shadow-md'
                        : 'border-primary/30 bg-primary/5 text-primary hover:border-primary/60 hover:bg-primary/10'
                    )}
                  >
                    <span
                      className={cn(
                        'flex size-11 shrink-0 items-center justify-center rounded-md',
                        isSelected ? 'bg-primary-foreground/15' : 'bg-primary/10'
                      )}
                    >
                      <Icon className='size-6' aria-hidden='true' />
                    </span>
                    <span className='grid min-w-0 gap-0.5'>
                      <span className='text-base font-extrabold sm:text-lg'>{option.label}</span>
                      <span
                        className={cn(
                          'text-sm font-semibold',
                          isSelected ? 'text-primary-foreground/80' : 'text-primary/70'
                        )}
                      >
                        {amountDue > 0 ? `${currencyFormatter.format(amountDue)} due` : 'Nothing due right now'}
                      </span>
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {selectedPaymentDetails ? <PaymentDetails {...selectedPaymentDetails} /> : null}
    </section>
  )
}

export default PaymentTypeSelector
