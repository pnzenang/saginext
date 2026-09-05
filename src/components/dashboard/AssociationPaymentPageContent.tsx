'use client'

import type { ReactNode } from 'react'
import { useActionState, useEffect, useId } from 'react'

import Image from 'next/image'
import Link from 'next/link'
import { AlertTriangle, DollarSign } from 'lucide-react'
import { toast } from 'sonner'

import { SubmitButton } from '@/components/forms/Buttons'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { AppLanguage } from '@/lib/i18n'
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

const getDateFormatters = (language: AppLanguage) => {
  const locale = language === 'fr' ? 'fr-FR' : 'en-US'

  const monthFormatter = new Intl.DateTimeFormat(locale, {
    month: 'long'
  })

  const monthYearFormatter = new Intl.DateTimeFormat(locale, {
    month: 'long',
    year: 'numeric'
  })

  const dateFormatter = new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium'
  })

  const dateTimeFormatter = new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeStyle: 'short'
  })

  return {
    formatDate: (date: string) => dateFormatter.format(new Date(date)),
    formatDateTime: (date: string) => dateTimeFormatter.format(new Date(date)),
    formatMonth: (date: Date) => monthFormatter.format(date),
    formatMonthYear: (date: string) => monthYearFormatter.format(new Date(date))
  }
}

const roundCurrencyAmount = (amount: number) => Number(amount.toFixed(2))

const isPaymentFoundEntry = (entry: Pick<AssociationPaymentLedgerEntry, 'note'>) =>
  entry.note?.toLowerCase().includes('payment found') || entry.note?.toLowerCase().includes('sent manually adjusted')

const associationPaymentCopy = {
  en: {
    amountSent: 'Amount Sent',
    amountVerifiedSagi: 'Amount Verified SAGI',
    amountVerifiedConnector: 'Amount Verified',
    contributionAmountDetail: (count: number, amount: string) => `${count} vested member(s) x ${amount}`,
    contributionAmountSent: 'Contribution amount sent',
    contributionAmountTitle: (month: string, amount: string) => `${month}'s Contribution: ${amount}`,
    contributionDue: 'Contribution Due',
    contributionDueMeta: (monthYear: string, dueDate: string) => `${monthYear} contribution due ${dueDate}`,
    contributionDues: 'Contribution Dues',
    contributionPaymentSummary: 'Contribution payment summary',
    contributionSubmit: 'Add Contribution Amount Sent',
    contributionTitle: 'Contribution Payment',
    defaultConnector: 'for',
    deathCount: (count: number) => `Number of deaths: ${count}`,
    due: 'Due',
    dueDate: 'Due date',
    historyDescription: 'Dues, amount sent, and SAGI verified totals are shown in the cards below.',
    historyTitle: 'Payment history',
    instructionsText: 'Send the Zelle payment first, then record the exact amount here for SAGI verification.',
    instructionsTitle: 'Payment instructions',
    introPrefix: 'Scan or click the QR code to send payment by Zelle. Add',
    introSuffix: 'in the memo so the payment can be matched to your association, then record the amount sent.',
    memberAdded: (date: string) => `Member(s) added ${date}`,
    paymentFound: 'Payment found',
    paymentNotFound: (amount: string, date: string) => `Your ${amount} was not found by SAGI on ${date}`,
    paymentNotFoundSummary: (amount: string) => `Your ${amount} was not found. Please upload proof of payment in the amount form.`,
    paymentProofHelp: 'Upload the Zelle confirmation, receipt, or transaction screenshot requested by SAGI.',
    paymentProofLabel: 'Proof of payment',
    paymentQrAlt: 'SAGI payment QR code',
    paymentSubmitted: 'Payment submitted',
    registrationAmountDetail: (count: number, amount: string) => `${count} pending member(s) x ${amount}`,
    registrationAmountSent: 'Registration amount sent',
    registrationAmountTitle: (amount: string) => `Your Registration Dues: ${amount}`,
    registrationFees: 'Registration Fees',
    registrationPaymentSummary: 'Registration payment summary',
    registrationSubmit: 'Add Registration Amount Sent',
    registrationTitle: 'Registration Payment',
    usedForRegistration: 'Pending Registration Fees',
    verifiedOn: 'Verified on',
    verificationWarning:
      'Record a payment only after sending the money. Submitted amounts are not counted as paid until SAGI verifies the real Zelle payment, and unmatched records will be reversed.',
    balance: {
      deficit: 'Deficit',
      deficitNote: '(Not In Good Standing)',
      registrationOwed: 'Registration Owed',
      reserve: 'Reserve',
      reserveNote: '(To be used for upcoming payments)'
    },
    disclaimer: 'All amounts will be verified by SAGI and reversed if they do not match the payment received.'
  },
  fr: {
    amountSent: 'Montant envoyé',
    amountVerifiedSagi: 'Montant vérifié SAGI',
    amountVerifiedConnector: 'Montant vérifié',
    contributionAmountDetail: (count: number, amount: string) => `${count} membre(s) acquis x ${amount}`,
    contributionAmountSent: 'Montant de cotisation envoyé',
    contributionAmountTitle: (month: string, amount: string) => `Cotisation de ${month} : ${amount}`,
    contributionDue: 'Cotisation due',
    contributionDueMeta: (monthYear: string, dueDate: string) => `Cotisation de ${monthYear} due le ${dueDate}`,
    contributionDues: 'Cotisations dues',
    contributionPaymentSummary: 'Résumé du paiement des cotisations',
    contributionSubmit: 'Ajouter le montant de cotisation envoyé',
    contributionTitle: 'Paiement des cotisations',
    defaultConnector: 'pour',
    deathCount: (count: number) => `Nombre de décès : ${count}`,
    due: 'Échéance',
    dueDate: "Date d'échéance",
    historyDescription: 'Les cotisations, montants envoyés et montants vérifiés par SAGI sont affichés ci-dessous.',
    historyTitle: 'Historique des paiements',
    instructionsText:
      'Envoyez d’abord le paiement Zelle, puis enregistrez ici le montant exact pour la vérification par SAGI.',
    instructionsTitle: 'Instructions de paiement',
    introPrefix: 'Scannez ou cliquez sur le code QR pour envoyer le paiement par Zelle. Ajoutez',
    introSuffix:
      'dans le mémo afin que le paiement soit associé à votre association, puis enregistrez le montant envoyé.',
    memberAdded: (date: string) => `Membre(s) ajouté(s) le ${date}`,
    paymentFound: 'Paiement retrouvé',
    paymentNotFound: (amount: string, date: string) => `Votre paiement de ${amount} n’a pas été retrouvé par SAGI le ${date}`,
    paymentNotFoundSummary: (amount: string) =>
      `Votre paiement de ${amount} n’a pas été retrouvé. Veuillez téléverser une preuve de paiement dans le formulaire du montant.`,
    paymentProofHelp: 'Téléversez la confirmation Zelle, le reçu ou la capture de transaction demandée par SAGI.',
    paymentProofLabel: 'Preuve de paiement',
    paymentQrAlt: 'Code QR de paiement SAGI',
    paymentSubmitted: 'Paiement soumis',
    registrationAmountDetail: (count: number, amount: string) => `${count} membre(s) en attente x ${amount}`,
    registrationAmountSent: "Montant d'inscription envoyé",
    registrationAmountTitle: (amount: string) => `Frais d'inscription dus : ${amount}`,
    registrationFees: "Frais d'inscription",
    registrationPaymentSummary: "Résumé du paiement d'inscription",
    registrationSubmit: "Ajouter le montant d'inscription envoyé",
    registrationTitle: "Paiement d'inscription",
    usedForRegistration: "Frais d'inscription en attente",
    verifiedOn: 'Vérifié le',
    verificationWarning:
      "Enregistrez un paiement seulement après avoir envoyé l'argent. Les montants soumis ne sont pas comptés comme payés tant que SAGI n'a pas vérifié le vrai paiement Zelle, et les enregistrements non correspondants seront annulés.",
    balance: {
      deficit: 'Déficit',
      deficitNote: '(Pas en règle)',
      registrationOwed: 'Inscription due',
      reserve: 'Réserve',
      reserveNote: '(À utiliser pour les paiements à venir)'
    },
    disclaimer: 'Tous les montants seront vérifiés par SAGI et annulés s’ils ne correspondent pas au paiement reçu.'
  }
} as const

type AssociationPaymentCopy = (typeof associationPaymentCopy)[AppLanguage]

const getSubmittedPaymentMeta = (
  entry: AssociationPaymentLedgerEntry,
  formatter: (date: string) => string,
  copy: AssociationPaymentCopy
) => `${isPaymentFoundEntry(entry) ? copy.paymentFound : copy.paymentSubmitted} ${formatter(entry.createdAt)}`

const getVerifiedPaymentMeta = (date: string, formatter: (date: string) => string, copy: AssociationPaymentCopy) =>
  `${copy.verifiedOn}: ${formatter(date)}`

const getLedgerEntryTime = (entry: Pick<AssociationPaymentLedgerEntry, 'createdAt'>) =>
  new Date(entry.createdAt).getTime()

const getLatestLedgerEntry = (entries: AssociationPaymentLedgerEntry[]) =>
  [...entries].sort((firstEntry, secondEntry) => getLedgerEntryTime(secondEntry) - getLedgerEntryTime(firstEntry))[0]

const sagiPaymentUrl =
  'https://enroll.zellepay.com/qr-codes?data=eyJuYW1lIjoiUEFUUklDRSIsImFjdGlvbiI6InBheW1lbnQiLCJ0b2tlbiI6IjQ0MzUzMTU4NTIifQ=='

const sagiQrCodeUrl = 'https://res.cloudinary.com/dp8tkb7hq/image/upload/v1778042720/sagiQrCode_jmwsbf.svg'
const paymentProofAccept = '.pdf,.jpg,.jpeg,.png,.webp,.heic,.heif,application/pdf,image/*'

const initialState = {
  message: ''
}

type PaymentAction = typeof saveAssociationContributionPaymentAction

type PaymentFormProps = {
  action: PaymentAction
  fieldLabel: string
  proofHelp?: string
  proofLabel?: string
  proofUploadRequired?: boolean
  submitText: string
  warning: string
}

type ContributionPaymentPageProps = {
  associationCode: string
  contribution: AssociationContributionSummary
  kind: 'contribution'
  language: AppLanguage
  ledgerEntries: AssociationPaymentLedgerEntry[]
}

type RegistrationPaymentPageProps = {
  associationCode: string
  kind: 'registration'
  language: AppLanguage
  ledgerEntries: AssociationPaymentLedgerEntry[]
  registration: AssociationRegistrationSummary
}

type AssociationPaymentPageContentProps = ContributionPaymentPageProps | RegistrationPaymentPageProps

const PaymentForm = ({
  action,
  fieldLabel,
  proofHelp,
  proofLabel,
  proofUploadRequired = false,
  submitText,
  warning
}: PaymentFormProps) => {
  const [state, formAction] = useActionState(action, initialState)
  const amountInputId = useId()
  const proofInputId = useId()

  useEffect(() => {
    if (state.message) toast(state.message)
  }, [state])

  return (
    <form
      action={formAction}
      encType='multipart/form-data'
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

        {proofUploadRequired && proofLabel && proofHelp ? (
          <div className='grid gap-2'>
            <Label htmlFor={proofInputId} className='text-sm font-extrabold break-words'>
              {proofLabel}
            </Label>
            <Input
              id={proofInputId}
              name='documentFile'
              type='file'
              accept={paymentProofAccept}
              className='bg-background text-foreground'
              required
            />
            <p className='text-muted-foreground text-xs leading-snug font-semibold'>{proofHelp}</p>
          </div>
        ) : null}

        <div className='border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200 flex gap-2 rounded-md border px-3 py-2 text-xs leading-snug font-semibold'>
          <AlertTriangle className='mt-0.5 size-4 shrink-0' aria-hidden='true' />
          <p className='min-w-0 break-words'>{warning}</p>
        </div>
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

const SummaryNoticeRow = ({ message }: { message: string }) => (
  <div className='text-amber-700 dark:text-amber-300 font-extrabold break-words'>{message}</div>
)

const BalanceRow = ({
  balance,
  copy,
  owedLabel
}: {
  balance: number
  copy: AssociationPaymentCopy['balance']
  owedLabel?: string
}) => {
  const hasReserve = balance >= 0
  const displayBalance = owedLabel && balance < 0 ? Math.abs(balance) : balance

  return (
    <div
      className={cn(
        'mt-2 flex items-start justify-between gap-4 text-xl font-extrabold sm:text-2xl',
        hasReserve ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'
      )}
    >
      <span className='min-w-0 break-words'>
        {hasReserve ? copy.reserve : (owedLabel ?? copy.deficit)}{' '}
        {hasReserve || !owedLabel ? (
          <span className='text-[10px] leading-tight font-medium'>
            {hasReserve ? copy.reserveNote : copy.deficitNote}
          </span>
        ) : null}
      </span>
      <span className='shrink-0 text-right tabular-nums'>{currencyFormatter.format(displayBalance)}</span>
    </div>
  )
}

const SummaryCard = ({
  balance,
  balanceCopy,
  children,
  disclaimer,
  owedLabel,
  title
}: {
  balance: number
  balanceCopy: AssociationPaymentCopy['balance']
  children: ReactNode
  disclaimer: string
  owedLabel?: string
  title: string
}) => (
  <div className='border-primary/20 bg-primary/10 text-primary flex h-full min-h-56 min-w-0 flex-col rounded-md border px-3 py-3 sm:px-4'>
    <p className='text-lg font-extrabold break-words sm:text-xl'>{title}</p>
    <div className='mt-2 grid gap-1.5 text-sm font-semibold'>{children}</div>
    <BalanceRow balance={balance} copy={balanceCopy} owedLabel={owedLabel} />
    <p className='text-primary/70 mt-auto pt-4 text-[10px] leading-tight font-medium break-words'>{disclaimer}</p>
  </div>
)

type PaymentLedgerHistoryCardProps = {
  copy: Pick<AssociationPaymentCopy, 'defaultConnector' | 'historyDescription' | 'historyTitle'>
  summaryColumns: PaymentSummaryRow[][]
}

type PaymentDateGroup = {
  amount: number
  connector?: string
  id: string
  message?: string
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

const PaymentSummaryCard = ({ connectorFallback, row }: { connectorFallback: string; row: PaymentSummaryRow }) => {
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
                  {group.message ? (
                    <p className='text-primary/80 text-xs leading-snug font-semibold break-words'>{group.message}</p>
                  ) : (
                    <p className='text-primary/80 flex flex-wrap items-baseline gap-x-2 gap-y-0.5 font-semibold'>
                      <span className='shrink-0 text-xs font-semibold tabular-nums'>
                        {currencyFormatter.format(group.amount)}
                      </span>
                      <span className='text-xs'>{group.connector ?? connectorFallback}</span>
                      <span className='min-w-0 text-xs break-words'>{group.meta}</span>
                    </p>
                  )}
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
  amountVerified: number,
  copy: AssociationPaymentCopy,
  formatDate: (date: string) => string
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
      connector: copy.amountVerifiedConnector,
      id: `amount-verified-linked-${dayKey}`,
      meta: group.meta
    }))
}

const PaymentLedgerHistoryCard = ({ copy, summaryColumns }: PaymentLedgerHistoryCardProps) => (
  <div className='border-primary/20 bg-background rounded-md border'>
    <div className='border-b px-4 py-3'>
      <p className='text-lg font-extrabold'>{copy.historyTitle}</p>
      <p className='text-muted-foreground mt-1 text-sm'>{copy.historyDescription}</p>
    </div>

    <div className='grid gap-3 p-4 sm:grid-cols-3'>
      {summaryColumns.map(column => (
        <div key={column.map(row => row.id).join('-')} className='grid h-fit gap-3'>
          {column.map(row => (
            <PaymentSummaryCard key={row.id} connectorFallback={copy.defaultConnector} row={row} />
          ))}
        </div>
      ))}
    </div>
  </div>
)

const AssociationPaymentPageContent = (props: AssociationPaymentPageContentProps) => {
  const isContributionPayment = props.kind === 'contribution'
  const copy = associationPaymentCopy[props.language]
  const { formatDate, formatDateTime, formatMonth, formatMonthYear } = getDateFormatters(props.language)
  const currentMonthName = formatMonth(new Date())

  const title = isContributionPayment ? copy.contributionTitle : copy.registrationTitle

  const amountTitle = isContributionPayment
    ? copy.contributionAmountTitle(currentMonthName, currencyFormatter.format(props.contribution.amountOwed))
    : copy.registrationAmountTitle(currencyFormatter.format(props.registration.balanceDues))

  const amountDetail = isContributionPayment
    ? copy.contributionAmountDetail(
        props.contribution.vestedMembersCount,
        currencyFormatter.format(props.contribution.amountPerVestedMember)
      )
    : copy.registrationAmountDetail(
        Math.round(props.registration.balanceDues / registrationFeePerEligibleMember),
        currencyFormatter.format(registrationFeePerEligibleMember)
      )

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
    ? getSubmittedPaymentMeta(latestSubmittedPayment, formatDateTime, copy)
    : amountSentDate
      ? `${copy.paymentSubmitted} ${formatDateTime(amountSentDate)}`
      : undefined

  const amountVerifiedMeta = amountVerifiedDate
    ? getVerifiedPaymentMeta(amountVerifiedDate, formatDateTime, copy)
    : undefined

  const amountSentValue = isContributionPayment ? props.contribution.amountReceived : props.registration.amountReceived

  const amountVerifiedValue = isContributionPayment
    ? props.contribution.amountVerified
    : props.registration.amountVerified

  const submittedPaymentLedgerEntries = props.ledgerEntries.filter(entry => entry.eventType === 'submitted')
  const notFoundPaymentLedgerEntries = props.ledgerEntries.filter(entry => entry.eventType === 'not_found')
  const latestNotFoundPayment = getLatestLedgerEntry(notFoundPaymentLedgerEntries)

  const hasSubmittedPaymentAfterLatestNotFound = latestNotFoundPayment
    ? submittedPaymentLedgerEntries.some(entry => getLedgerEntryTime(entry) > getLedgerEntryTime(latestNotFoundPayment))
    : false

  const activeNotFoundPayment =
    latestNotFoundPayment && !hasSubmittedPaymentAfterLatestNotFound ? latestNotFoundPayment : null

  const submittedPaymentEntries = submittedPaymentLedgerEntries.map(entry => ({
    amount: entry.amount,
    id: entry.id,
    meta: getSubmittedPaymentMeta(entry, formatDateTime, copy)
  }))

  const amountSentSummaryEntries =
    submittedPaymentEntries.length > 0
      ? submittedPaymentEntries
      : amountSentValue > 0 && amountSentDate
        ? [
            {
              amount: amountSentValue,
              id: `amount-sent-${amountSentDate}`,
              meta: `${copy.paymentSubmitted} ${formatDateTime(amountSentDate)}`
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
        meta: copy.contributionDueMeta(formatMonthYear(month.dueDate), formatDate(month.dueDate))
      }))
    : []

  const contributionDueSummaryValue = roundCurrencyAmount(
    contributionDueDateGroups.reduce((total, group) => total + group.amount, 0)
  )

  const verifiedPaymentDateGroups = getVerifiedPaymentGroupsLinkedToSubmittedPayments(
    submittedPaymentLedgerEntries,
    amountVerifiedValue,
    copy,
    formatDate
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
          meta: getVerifiedPaymentMeta(verifiedAt, formatDate, copy)
        }
      : null

  const amountNotFoundDateGroups = notFoundPaymentLedgerEntries.map(entry => ({
    amount: entry.amount,
    id: `amount-not-found-${entry.id}`,
    message: copy.paymentNotFound(currencyFormatter.format(entry.amount), formatDateTime(entry.createdAt)),
    meta: ''
  }))

  const groupedAmountVerifiedDateGroups = [
    ...verifiedPaymentDateGroups,
    ...(legacyVerifiedDateGroup ? [legacyVerifiedDateGroup] : []),
    ...amountNotFoundDateGroups
  ]

  const amountVerifiedDateGroups =
    groupedAmountVerifiedDateGroups.length > 0
      ? groupedAmountVerifiedDateGroups
      : amountVerifiedValue > 0 && amountVerifiedDate
        ? [
            {
              amount: amountVerifiedValue,
              id: `amount-verified-${amountVerifiedDate}`,
              meta: getVerifiedPaymentMeta(amountVerifiedDate, formatDate, copy)
            }
          ]
        : []

  const dueSummaryRows = isContributionPayment
    ? [
        {
          dateGroups: contributionDueDateGroups.length > 0 ? contributionDueDateGroups : undefined,
          id: 'contribution-due',
          label: copy.contributionDue,
          meta:
            contributionDueDateGroups.length > 0
              ? undefined
              : dueDate
                ? `${copy.due} ${formatDate(dueDate)}`
                : undefined,
          value: contributionDueDateGroups.length > 0 ? contributionDueSummaryValue : props.contribution.amountOwed
        }
      ]
    : props.registration.pendingMemberDueDays.length > 0
      ? [
          {
            dateGroups: props.registration.pendingMemberDueDays.map(day => ({
              amount: day.amount,
              id: day.addedAt,
              meta: copy.memberAdded(formatDate(day.addedAt)),
              names: day.memberNames
            })),
            id: 'registration-due',
            label: copy.registrationFees,
            value: props.registration.balanceDues
          }
        ]
      : [
          {
            id: 'registration-due',
            label: copy.registrationFees,
            value: props.registration.balanceDues
          }
        ]

  const amountSentSummaryRow = {
    entries: amountSentSummaryEntries,
    id: 'amount-sent',
    label: copy.amountSent,
    meta: amountSentSummaryEntries.length > 0 ? undefined : amountSentMeta,
    value: amountSentSummaryTotal
  }

  const amountVerifiedSummaryRow = {
    dateGroups: amountVerifiedDateGroups,
    id: 'amount-verified',
    label: copy.amountVerifiedSagi,
    meta: amountVerifiedDateGroups.length > 0 ? undefined : amountVerifiedMeta,
    value: amountVerifiedValue
  }

  const historySummaryColumns = [dueSummaryRows, [amountSentSummaryRow], [amountVerifiedSummaryRow]]

  return (
    <section className='space-y-6 py-8 sm:py-10'>
      <div>
        <h1 className='text-xl font-semibold tracking-normal md:text-4xl'>{title}</h1>
        <p className='text-muted-foreground mt-2 max-w-4xl text-sm leading-6 sm:text-base'>
          {copy.introPrefix} <strong className='font-extrabold'>SAGI-USA-{props.associationCode}</strong>{' '}
          {copy.introSuffix}
        </p>
      </div>

      <div className='grid w-full grid-cols-1 items-stretch gap-4 lg:grid-cols-3'>
        <div className='grid h-full min-w-0 auto-rows-fr gap-4'>
          <div className='border-primary/20 bg-primary/10 text-primary flex h-full min-h-32 min-w-0 flex-col rounded-md border px-3 py-3 sm:px-4'>
            <p className='text-lg font-extrabold break-words sm:text-xl'>{amountTitle}</p>
            <p className='text-primary/80 mt-1 text-sm font-semibold break-words'>{amountDetail}</p>
            {isContributionPayment ? (
              <p className='text-primary/80 mt-1 text-sm font-semibold break-words'>
                {copy.deathCount(props.contribution.deathCount)}
              </p>
            ) : null}
            <p
              className={cn(
                'mt-2 text-sm font-extrabold break-words text-teal-600 dark:text-teal-300',
                !dueDate && 'invisible'
              )}
            >
              {dueDate ? `${copy.due} ${formatDate(dueDate)}` : copy.dueDate}
            </p>
          </div>
          <div className='border-primary/20 bg-primary/10 text-primary flex h-full min-h-32 min-w-0 flex-col justify-center rounded-md border px-3 py-3 sm:px-4'>
            <p className='text-lg font-extrabold break-words sm:text-xl'>{copy.instructionsTitle}</p>
            <p className='text-primary/80 mt-1 text-sm font-semibold break-words'>{copy.instructionsText}</p>
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
            alt={copy.paymentQrAlt}
            className='h-auto max-h-80 w-full max-w-80'
            unoptimized
          />
        </Link>

        <div className='grid h-full min-w-0 auto-rows-fr gap-4'>
          <PaymentForm
            action={
              isContributionPayment
                ? saveAssociationContributionPaymentAction
                : saveAssociationRegistrationPaymentAction
            }
            fieldLabel={isContributionPayment ? copy.contributionAmountSent : copy.registrationAmountSent}
            proofHelp={copy.paymentProofHelp}
            proofLabel={copy.paymentProofLabel}
            proofUploadRequired={Boolean(activeNotFoundPayment)}
            submitText={isContributionPayment ? copy.contributionSubmit : copy.registrationSubmit}
            warning={copy.verificationWarning}
          />

          {isContributionPayment ? (
            <SummaryCard
              title={copy.contributionPaymentSummary}
              balance={props.contribution.balance}
              balanceCopy={copy.balance}
              disclaimer={copy.disclaimer}
            >
              <SummaryRow label={copy.amountSent} value={props.contribution.amountReceived} />
              {activeNotFoundPayment ? (
                <SummaryNoticeRow
                  message={copy.paymentNotFoundSummary(currencyFormatter.format(activeNotFoundPayment.amount))}
                />
              ) : (
                <SummaryRow label={copy.amountVerifiedSagi} value={props.contribution.amountVerified} />
              )}
              <SummaryRow label={copy.contributionDues} value={props.contribution.amountOwed} />
            </SummaryCard>
          ) : (
            <SummaryCard
              title={copy.registrationPaymentSummary}
              balance={props.registration.balance}
              balanceCopy={copy.balance}
              disclaimer={copy.disclaimer}
              owedLabel={copy.balance.registrationOwed}
            >
              <SummaryRow label={copy.amountSent} value={props.registration.amountReceived} />
              {activeNotFoundPayment ? (
                <SummaryNoticeRow
                  message={copy.paymentNotFoundSummary(currencyFormatter.format(activeNotFoundPayment.amount))}
                />
              ) : (
                <SummaryRow label={copy.amountVerifiedSagi} value={props.registration.amountVerified} />
              )}
              <SummaryRow label={copy.usedForRegistration} value={props.registration.balanceDues} />
            </SummaryCard>
          )}
        </div>
      </div>

      <PaymentLedgerHistoryCard copy={copy} summaryColumns={historySummaryColumns} />
    </section>
  )
}

export default AssociationPaymentPageContent
