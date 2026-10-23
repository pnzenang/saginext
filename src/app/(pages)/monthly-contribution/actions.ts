'use server'

import db from '@/utils/db'
import {
  fetchAssociationContributionSummary,
  getContributionMonthDateRange
} from '@/utils/sagi-contribution-summary'
import { associationPaymentLedgerEventTypes, associationPaymentTypes } from '@/utils/sagi-payment-ledger'

export type MonthlyContributionPaymentStatus = 'awaiting_verification' | 'paid' | 'partially_paid' | 'unpaid'

export type MonthlyContributionLookupResult = {
  amountPerVestedMember: number
  amountToSend: number
  associationCode: string
  associationName: string
  contributionDue: number
  dueDate: string | null
  paymentStatus: MonthlyContributionPaymentStatus
  vestedMembersCount: number
}

const decimalToNumber = (value: unknown) => Number(value ?? 0)

// Payments recorded this calendar month count toward this month's contribution, as on Admin Contribution Payments.
// Associations often pay early in the month, before the table is published. Paying the contribution due without the
// identifying cents still counts as paid.
const getPaymentStatus = async ({
  associationCode,
  contributionDue,
  monthStart
}: {
  associationCode: string
  contributionDue: number
  monthStart: Date
}): Promise<MonthlyContributionPaymentStatus> => {
  const [ledgerTotals, payment] = await Promise.all([
    db.associationPaymentLedgerEntry.groupBy({
      _sum: {
        amount: true
      },
      by: ['eventType'],
      where: {
        associationCode,
        cancelledAt: null,
        createdAt: {
          gte: monthStart
        },
        eventType: {
          in: [
            associationPaymentLedgerEventTypes.submitted,
            associationPaymentLedgerEventTypes.verified,
            associationPaymentLedgerEventTypes.notFound
          ]
        },
        paymentType: associationPaymentTypes.contribution
      }
    }),
    db.associationContributionPayment.findUnique({
      select: {
        amountVerified: true,
        verifiedAt: true
      },
      where: {
        associationCode
      }
    })
  ])

  const getTotal = (eventType: string) =>
    decimalToNumber(ledgerTotals.find(total => total.eventType === eventType)?._sum.amount)

  // Verifications made before the Oct 21, 2026 Verify fix recorded only part of the amount in the ledger, while the
  // payment record kept the full verified amount, so use whichever is larger (as Admin Contribution Payments does).
  const recordedAmountVerified =
    payment?.verifiedAt && payment.verifiedAt >= monthStart ? decimalToNumber(payment.amountVerified) : 0

  const amountRecorded = Math.max(
    getTotal(associationPaymentLedgerEventTypes.submitted) - getTotal(associationPaymentLedgerEventTypes.notFound),
    0
  )

  // A verification only counts against payments recorded this month, so verifying last month's late payment doesn't
  // mark this month as paid.
  const amountVerified = Math.min(
    Math.max(getTotal(associationPaymentLedgerEventTypes.verified), recordedAmountVerified),
    amountRecorded
  )

  const minimumPaid = contributionDue - 0.01

  if (amountVerified >= minimumPaid) return 'paid'
  if (amountRecorded >= minimumPaid) return 'awaiting_verification'
  if (amountRecorded > 0) return 'partially_paid'

  return 'unpaid'
}

export type MonthlyContributionLookupState =
  | { status: 'idle' }
  | { message: string; status: 'error' }
  | { result: MonthlyContributionLookupResult; status: 'success' }

// Public lookup: returns only the current month's contribution figures for one association code.
export const lookupMonthlyContributionAction = async (
  _prevState: MonthlyContributionLookupState,
  formData: FormData
): Promise<MonthlyContributionLookupState> => {
  const associationCode = String(formData.get('associationCode') ?? '')
    .trim()
    .toUpperCase()

  if (!/^[A-Z]{4}$/.test(associationCode)) {
    return { message: 'Enter your 4-letter association code.', status: 'error' }
  }

  // Many associations have members but no delegate profile yet, so fall back to the members' association name.
  const [profile, member] = await Promise.all([
    db.profile.findUnique({
      select: {
        associationName: true
      },
      where: {
        associationCode
      }
    }),
    db.member.findFirst({
      select: {
        associationName: true
      },
      where: {
        associationCode
      }
    })
  ])

  const associationName = profile?.associationName || member?.associationName

  if (!associationName) {
    return { message: `No association found with code ${associationCode}.`, status: 'error' }
  }

  const summary = await fetchAssociationContributionSummary(associationCode, { noStore: true })

  const paymentStatus =
    summary.amountOwed > 0
      ? await getPaymentStatus({
          associationCode,
          contributionDue: summary.amountOwed,
          monthStart: getContributionMonthDateRange().monthStart
        })
      : 'unpaid'

  return {
    result: {
      amountPerVestedMember: summary.amountPerVestedMember,
      amountToSend: summary.amountToMatch,
      associationCode,
      associationName,
      contributionDue: summary.amountOwed,
      dueDate: summary.dueDate,
      paymentStatus,
      vestedMembersCount: summary.vestedMembersCount
    },
    status: 'success'
  }
}
