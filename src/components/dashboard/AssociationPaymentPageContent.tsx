'use client'

import type { ReactNode } from 'react'
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
import type { AssociationPaymentLedgerEntry } from '@/utils/sagi-payment-ledger'
import type { AssociationContributionSummary } from '@/utils/sagi-contribution-summary'
import type { AssociationRegistrationSummary } from '@/utils/sagi-registration-summary'

const currencyFormatter = new Intl.NumberFormat('en-US', {
  currency: 'USD',
  style: 'currency'
})

const monthFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'long'
})

const monthYearFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'long',
  year: 'numeric'
})

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium'
})

const dateTimeFormatter = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium',
  timeStyle: 'short'
})

const formatDate = (date: string) => dateFormatter.format(new Date(date))
const formatDateTime = (date: string) => dateTimeFormatter.format(new Date(date))
const roundCurrencyAmount = (amount: number) => Number(amount.toFixed(2))

const isPaymentFoundEntry = (entry: Pick<AssociationPaymentLedgerEntry, 'note'>) =>
  entry.note?.toLowerCase().includes('payment found') || entry.note?.toLowerCase().includes('sent manually adjusted')

const getSubmittedPaymentMeta = (entry: AssociationPaymentLedgerEntry, formatter: (date: string) => string) =>
  `${isPaymentFoundEntry(entry) ? 'Payment found' : 'Payment submitted'} ${formatter(entry.createdAt)}`

const getVerifiedPaymentMeta = (date: string, formatter: (date: string) => string) => `Verified on: ${formatter(date)}`

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
  ledgerEntries: AssociationPaymentLedgerEntry[]
}

type RegistrationPaymentPageProps = {
  associationCode: string
  kind: 'registration'
  ledgerEntries: AssociationPaymentLedgerEntry[]
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

const BalanceRow = ({ balance }: { balance: number }) => {
  const hasReserve = balance >= 0

  return (
    <div
      className={cn(
        'mt-2 flex items-start justify-between gap-4 text-xl font-extrabold sm:text-2xl',
        hasReserve ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'
      )}
    >
      <span className='min-w-0 break-words'>
        {hasReserve ? 'Reserve' : 'Deficit'}{' '}
        <span className='text-[10px] leading-tight font-medium'>
          {hasReserve ? '(To be used for upcoming payments)' : '(Not In Good Standing)'}
        </span>
      </span>
      <span className='shrink-0 text-right tabular-nums'>{currencyFormatter.format(balance)}</span>
    </div>
  )
}

const SummaryCard = ({ children, title, balance }: { children: ReactNode; title: string; balance: number }) => (
  <div className='border-primary/20 bg-primary/10 text-primary flex h-full min-h-56 min-w-0 flex-col rounded-md border px-3 py-3 sm:px-4'>
    <p className='text-lg font-extrabold break-words sm:text-xl'>{title}</p>
    <div className='mt-2 grid gap-1.5 text-sm font-semibold'>{children}</div>
    <BalanceRow balance={balance} />
    <p className='text-primary/70 mt-auto pt-4 text-[10px] leading-tight font-medium break-words'>
      All amounts will be verified by SAGI and reversed if they do not match the payment received.
    </p>
  </div>
)

type PaymentLedgerHistoryCardProps = {
  summaryColumns: PaymentSummaryRow[][]
}

type PaymentDateGroup = {
  amount: number
  connector?: string
  id: string
  meta: string
  names?: string[]
}

type PaymentSummaryRow = {
  entries?: {
    amount: number
    id: string
    meta: string
  }[]
  dateGroups?: PaymentDateGroup[]
  id: string
  label: string
  meta?: string
  names?: string[]
  value: number
}

const PaymentSummaryCard = ({ row }: { row: PaymentSummaryRow }) => {
  const hasEntries = row.entries && row.entries.length > 0

  return (
    <div className='border-primary/20 bg-primary/10 text-primary rounded-md border px-3 py-3'>
      <div className='flex items-start justify-between gap-3'>
        <div className='min-w-0'>
          <p className='text-sm font-extrabold tracking-normal break-words uppercase sm:text-base'>{row.label}</p>
          {row.names && row.names.length > 0 ? (
            <div className='mt-1 grid gap-0.5 text-xs leading-snug font-extrabold'>
              {row.names.map((name, index) => (
                <p key={`${name}-${index}`} className='break-words'>
                  {name}
                </p>
              ))}
            </div>
          ) : null}
          {row.dateGroups && row.dateGroups.length > 0 ? (
            <div className='mt-2 grid gap-2 text-xs leading-snug'>
              {row.dateGroups.map(group => (
                <div key={group.id} className='min-w-0'>
                  <p className='text-primary/80 flex flex-wrap items-baseline gap-x-2 gap-y-0.5 font-semibold'>
                    <span className='shrink-0 text-xs font-semibold tabular-nums'>
                      {currencyFormatter.format(group.amount)}
                    </span>
                    <span className='text-xs'>{group.connector ?? 'for'}</span>
                    <span className='min-w-0 text-xs break-words'>{group.meta}</span>
                  </p>
                  {group.names && group.names.length > 0 ? (
                    <div className='mt-0.5 grid gap-0.5 font-extrabold'>
                      {group.names.map((name, index) => (
                        <p key={`${group.id}-${name}-${index}`} className='break-words'>
                          {name}
                        </p>
                      ))}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          ) : null}
          {row.meta ? <p className='text-primary/80 mt-1 text-xs leading-snug font-semibold'>{row.meta}</p> : null}
        </div>
        <p className='shrink-0 text-right text-sm font-extrabold tabular-nums sm:text-base'>
          {currencyFormatter.format(row.value)}
        </p>
      </div>

      {hasEntries ? (
        <div className='mt-3 grid gap-2'>
          {row.entries?.map(entry => (
            <div key={entry.id} className='flex items-start justify-between gap-3'>
              <p className='text-primary/80 min-w-0 text-xs leading-snug font-semibold'>{entry.meta}</p>
              <p className='shrink-0 text-right text-xs font-semibold tabular-nums'>
                {currencyFormatter.format(entry.amount)}
              </p>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  )
}

const getVerifiedPaymentGroupsLinkedToSubmittedPayments = (
  submittedEntries: AssociationPaymentLedgerEntry[],
  amountVerified: number
): PaymentDateGroup[] => {
  let remainingVerifiedAmount = roundCurrencyAmount(amountVerified)

  const verifiedGroupsByDay = new Map<
    string,
    {
      amount: number
      meta: string
    }
  >()

  const sortedSubmittedEntries = [...submittedEntries]
    .filter(entry => entry.amount > 0)
    .sort(
      (firstEntry, secondEntry) => new Date(firstEntry.createdAt).getTime() - new Date(secondEntry.createdAt).getTime()
    )

  sortedSubmittedEntries.forEach(entry => {
    if (remainingVerifiedAmount <= 0) {
      return
    }

    const dayKey = entry.createdAt.slice(0, 10)
    const linkedAmount = roundCurrencyAmount(Math.min(entry.amount, remainingVerifiedAmount))

    const currentGroup = verifiedGroupsByDay.get(dayKey) ?? {
      amount: 0,
      meta: formatDate(`${dayKey}T12:00:00.000Z`)
    }

    remainingVerifiedAmount = roundCurrencyAmount(remainingVerifiedAmount - linkedAmount)
    verifiedGroupsByDay.set(dayKey, {
      ...currentGroup,
      amount: roundCurrencyAmount(currentGroup.amount + linkedAmount)
    })
  })

  return Array.from(verifiedGroupsByDay.entries())
    .sort(([firstDay], [secondDay]) => secondDay.localeCompare(firstDay))
    .map(([dayKey, group]) => ({
      amount: group.amount,
      connector: 'Amount Verified',
      id: `amount-verified-linked-${dayKey}`,
      meta: group.meta
    }))
}

const PaymentLedgerHistoryCard = ({ summaryColumns }: PaymentLedgerHistoryCardProps) => (
  <div className='border-primary/20 bg-background rounded-md border'>
    <div className='border-b px-4 py-3'>
      <p className='text-lg font-extrabold'>Payment history</p>
      <p className='text-muted-foreground mt-1 text-sm'>
        Dues, amount sent, and SAGI verified totals are shown in the cards below.
      </p>
    </div>

    <div className='grid gap-3 p-4 sm:grid-cols-3'>
      {summaryColumns.map(column => (
        <div key={column.map(row => row.id).join('-')} className='grid h-fit gap-3'>
          {column.map(row => (
            <PaymentSummaryCard key={row.id} row={row} />
          ))}
        </div>
      ))}
    </div>
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
    : `${Math.round(props.registration.balanceDues / registrationFeePerEligibleMember)} registered member(s) x ${currencyFormatter.format(
        registrationFeePerEligibleMember
      )}`

  const dueDate = isContributionPayment ? props.contribution.dueDate : null

  const lastSubmittedAt = isContributionPayment
    ? props.contribution.lastSubmittedAt
    : props.registration.lastSubmittedAt

  const verifiedAt = isContributionPayment ? props.contribution.verifiedAt : props.registration.verifiedAt

  const latestSubmittedPayment = props.ledgerEntries.find(entry => entry.eventType === 'submitted')
  const latestVerifiedPayment = props.ledgerEntries.find(entry => entry.eventType === 'verified')

  const amountSentDate = latestSubmittedPayment?.createdAt ?? lastSubmittedAt
  const amountVerifiedDate = latestVerifiedPayment?.createdAt ?? verifiedAt

  const amountSentMeta = latestSubmittedPayment
    ? getSubmittedPaymentMeta(latestSubmittedPayment, formatDateTime)
    : amountSentDate
      ? `Payment submitted ${formatDateTime(amountSentDate)}`
      : undefined

  const amountVerifiedMeta = amountVerifiedDate ? getVerifiedPaymentMeta(amountVerifiedDate, formatDateTime) : undefined

  const amountSentValue = isContributionPayment ? props.contribution.amountReceived : props.registration.amountReceived

  const amountVerifiedValue = isContributionPayment
    ? props.contribution.amountVerified
    : props.registration.amountVerified

  const submittedPaymentLedgerEntries = props.ledgerEntries.filter(entry => entry.eventType === 'submitted')

  const submittedPaymentEntries = submittedPaymentLedgerEntries.map(entry => ({
    amount: entry.amount,
    id: entry.id,
    meta: getSubmittedPaymentMeta(entry, formatDateTime)
  }))

  const amountSentSummaryEntries =
    submittedPaymentEntries.length > 0
      ? submittedPaymentEntries
      : amountSentValue > 0 && amountSentDate
        ? [
            {
              amount: amountSentValue,
              id: `amount-sent-${amountSentDate}`,
              meta: `Payment submitted ${formatDateTime(amountSentDate)}`
            }
          ]
        : []

  const amountSentSummaryTotal = roundCurrencyAmount(
    amountSentSummaryEntries.reduce((total, entry) => total + entry.amount, 0)
  )

  const contributionDueDateGroups = isContributionPayment
    ? props.contribution.contributionDueMonths.map(month => ({
        amount: month.amount,
        id: month.dueDate,
        meta: `${monthYearFormatter.format(new Date(month.dueDate))} contribution due ${formatDate(month.dueDate)}`
      }))
    : []

  const contributionDueSummaryValue = roundCurrencyAmount(
    contributionDueDateGroups.reduce((total, group) => total + group.amount, 0)
  )

  const verifiedPaymentDateGroups = getVerifiedPaymentGroupsLinkedToSubmittedPayments(
    submittedPaymentLedgerEntries,
    amountVerifiedValue
  )

  const linkedVerifiedPaymentTotal = roundCurrencyAmount(
    verifiedPaymentDateGroups.reduce((total, group) => total + group.amount, 0)
  )

  const legacyVerifiedAmount = roundCurrencyAmount(amountVerifiedValue - linkedVerifiedPaymentTotal)

  const legacyVerifiedDateGroup =
    legacyVerifiedAmount > 0 && verifiedAt
      ? {
          amount: legacyVerifiedAmount,
          id: `amount-verified-legacy-${verifiedAt}`,
          meta: getVerifiedPaymentMeta(verifiedAt, formatDate)
        }
      : null

  const amountVerifiedDateGroups =
    verifiedPaymentDateGroups.length > 0 || legacyVerifiedDateGroup
      ? [...verifiedPaymentDateGroups, ...(legacyVerifiedDateGroup ? [legacyVerifiedDateGroup] : [])]
      : amountVerifiedValue > 0 && amountVerifiedDate
        ? [
            {
              amount: amountVerifiedValue,
              id: `amount-verified-${amountVerifiedDate}`,
              meta: getVerifiedPaymentMeta(amountVerifiedDate, formatDate)
            }
          ]
        : []

  const dueSummaryRows = isContributionPayment
    ? [
        {
          dateGroups: contributionDueDateGroups.length > 0 ? contributionDueDateGroups : undefined,
          id: 'contribution-due',
          label: 'Contribution Due',
          meta: contributionDueDateGroups.length > 0 ? undefined : dueDate ? `Due ${formatDate(dueDate)}` : undefined,
          value: contributionDueDateGroups.length > 0 ? contributionDueSummaryValue : props.contribution.amountOwed
        }
      ]
    : props.registration.pendingMemberDueDays.length > 0
      ? [
          {
            dateGroups: props.registration.pendingMemberDueDays.map(day => ({
              amount: day.amount,
              id: day.addedAt,
              meta: `Member(s) added ${formatDate(day.addedAt)}`,
              names: day.memberNames
            })),
            id: 'registration-due',
            label: 'Registrations Fee',
            value: props.registration.balanceDues
          }
        ]
      : [
          {
            id: 'registration-due',
            label: 'Registrations Fee',
            value: props.registration.balanceDues
          }
        ]

  const amountSentSummaryRow = {
    entries: amountSentSummaryEntries,
    id: 'amount-sent',
    label: 'Amount Sent',
    meta: amountSentSummaryEntries.length > 0 ? undefined : amountSentMeta,
    value: amountSentSummaryTotal
  }

  const amountVerifiedSummaryRow = {
    dateGroups: amountVerifiedDateGroups,
    id: 'amount-verified',
    label: 'Amount Verified SAGI',
    meta: amountVerifiedDateGroups.length > 0 ? undefined : amountVerifiedMeta,
    value: amountVerifiedValue
  }

  const historySummaryColumns = [dueSummaryRows, [amountSentSummaryRow], [amountVerifiedSummaryRow]]

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
              {dueDate ? `Due ${formatDate(dueDate)}` : 'Due date'}
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
              <SummaryRow label='Amount Verified SAGI' value={props.contribution.amountVerified} />
              <SummaryRow label='Contribution Dues' value={props.contribution.amountOwed} />
              <SummaryRow label='Existing Balance' value={props.contribution.existingBalance} />
              {props.contribution.manualBalanceAdjustment > 0 ? (
                <SummaryRow label='Balance Adjustment' value={props.contribution.manualBalanceAdjustment} />
              ) : null}
            </SummaryCard>
          ) : (
            <SummaryCard title='Registration payment summary' balance={props.registration.balance}>
              <SummaryRow label='Amount Sent' value={props.registration.amountReceived} />
              <SummaryRow label='Amount Verified SAGI' value={props.registration.amountVerified} />
              <SummaryRow label='Used for Registration' value={props.registration.balanceDues} />
              {props.registration.manualBalanceAdjustment > 0 ? (
                <SummaryRow label='Balance Adjustment' value={props.registration.manualBalanceAdjustment} />
              ) : null}
            </SummaryCard>
          )}
        </div>
      </div>

      <PaymentLedgerHistoryCard summaryColumns={historySummaryColumns} />
    </section>
  )
}

export default AssociationPaymentPageContent
