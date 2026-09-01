import { Prisma } from '@/generated/prisma/client'
import type { AdminPaymentRow, AdminPaymentTotals } from '@/components/global/AdminPaymentsTable'
import AdminPaymentsTable from '@/components/global/AdminPaymentsTableClient'
import ContributionAssessmentForm from '@/components/dashboard/ContributionAssessmentForm'
import PaymentSubmissionAlertCard, { type PaymentSubmissionAlert } from '@/components/global/PaymentSubmissionAlertCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import db from '@/utils/db'
import {
  addAssociationContributionBalanceAdjustmentAction,
  addAssociationContributionSentAdjustmentAction,
  fetchContributionCalculationSummaryAction,
  markAssociationContributionPaymentNotFoundAction,
  resetContributionPaymentAlertAction,
  verifyAssociationContributionPaymentAction
} from '@/utils/actions'
import {
  contributionBalanceAdjustmentType,
  fetchLatestAssociationContributionAssessmentForMonth
} from '@/utils/sagi-contribution-summary'
import { contributionPaymentAlertType } from '@/utils/payment-constants'
import { associationPaymentLedgerEventTypes, associationPaymentTypes } from '@/utils/sagi-payment-ledger'
import { memberStatus } from '@/utils/types'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium'
})

const decimalToNumber = (value: unknown) => Number(value ?? 0)
const defaultPaymentAlertResetAt = new Date(0)

type ContributionVerifiedLedgerTotal = {
  amountVerified: unknown
  associationCode: string
}

const roundCurrencyAmount = (amount: number) => Number(amount.toFixed(2))

const fetchContributionVerifiedLedgerTotalsByCode = async (associationCodes: string[]) => {
  if (associationCodes.length === 0) return new Map<string, number>()

  const totals = await db.$queryRaw<ContributionVerifiedLedgerTotal[]>(Prisma.sql`
    WITH latest_reset AS (
      SELECT "associationCode", MAX("createdAt") AS "resetAt"
      FROM "AssociationPaymentLedgerEntry"
      WHERE "paymentType" = ${associationPaymentTypes.contribution}
        AND "eventType" = ${associationPaymentLedgerEventTypes.reset}
        AND "cancelledAt" IS NULL
        AND "associationCode" IN (${Prisma.join(associationCodes)})
      GROUP BY "associationCode"
    )
    SELECT ledger."associationCode", COALESCE(SUM(ledger."amount"), 0) AS "amountVerified"
    FROM "AssociationPaymentLedgerEntry" ledger
    LEFT JOIN latest_reset
      ON latest_reset."associationCode" = ledger."associationCode"
    WHERE ledger."paymentType" = ${associationPaymentTypes.contribution}
      AND ledger."eventType" = ${associationPaymentLedgerEventTypes.verified}
      AND ledger."cancelledAt" IS NULL
      AND ledger."associationCode" IN (${Prisma.join(associationCodes)})
      AND (latest_reset."resetAt" IS NULL OR ledger."createdAt" > latest_reset."resetAt")
    GROUP BY ledger."associationCode"
  `)

  return new Map(
    totals.map(total => [total.associationCode, roundCurrencyAmount(decimalToNumber(total.amountVerified))])
  )
}

const AdminContributionPayments = async () => {
  const [
    profiles,
    payments,
    currentMonthContributionAssessment,
    contributionAssessmentGroups,
    contributionUsages,
    balanceAdjustments,
    vestedCounts,
    memberAssociationNames,
    paymentAlertReset,
    contributionCalculationSummary
  ] = await Promise.all([
    db.profile.findMany({
      orderBy: {
        associationCode: 'asc'
      }
    }),
    db.associationContributionPayment.findMany({
      orderBy: {
        associationCode: 'asc'
      }
    }),
    fetchLatestAssociationContributionAssessmentForMonth(),
    db.associationContributionAssessmentGroup.findMany({
      distinct: ['associationCode'],
      orderBy: {
        associationCode: 'asc'
      },
      select: {
        associationCode: true
      }
    }),
    db.associationContributionUsage.findMany({
      select: {
        associationCode: true
      },
      orderBy: {
        associationCode: 'asc'
      }
    }),
    db.associationBalanceAdjustment.findMany({
      where: {
        balanceType: contributionBalanceAdjustmentType
      },
      orderBy: {
        associationCode: 'asc'
      }
    }),
    db.member.groupBy({
      _count: {
        _all: true
      },
      by: ['associationCode'],
      orderBy: {
        associationCode: 'asc'
      },
      where: {
        memberStatus: memberStatus.Vested
      }
    }),
    db.member.findMany({
      distinct: ['associationCode'],
      orderBy: {
        associationCode: 'asc'
      },
      select: {
        associationCode: true,
        associationName: true
      }
    }),
    db.$queryRaw<{ resetAt: Date }[]>`
      SELECT "resetAt"
      FROM "PaymentAlertReset"
      WHERE "alertType" = ${contributionPaymentAlertType}
      LIMIT 1
    `,
    fetchContributionCalculationSummaryAction()
  ])

  const profilesByCode = new Map(profiles.map(profile => [profile.associationCode, profile]))
  const paymentsByCode = new Map(payments.map(payment => [payment.associationCode, payment]))

  const balanceAdjustmentsByCode = new Map(
    balanceAdjustments.map(adjustment => [adjustment.associationCode, decimalToNumber(adjustment.amount)])
  )

  const vestedCountsByCode = new Map(vestedCounts.map(item => [item.associationCode, item._count._all]))
  const memberAssociationNamesByCode = new Map<string, string>()

  memberAssociationNames.forEach(member => {
    const associationName = member.associationName.trim()

    if (associationName && !memberAssociationNamesByCode.has(member.associationCode)) {
      memberAssociationNamesByCode.set(member.associationCode, associationName)
    }
  })

  const associationCodes = Array.from(
    new Set([
      ...profilesByCode.keys(),
      ...paymentsByCode.keys(),
      ...(currentMonthContributionAssessment?.groups.map(group => group.associationCode) ?? []),
      ...contributionAssessmentGroups.map(group => group.associationCode),
      ...contributionUsages.map(usage => usage.associationCode),
      ...balanceAdjustments.map(adjustment => adjustment.associationCode),
      ...vestedCountsByCode.keys()
    ])
  ).sort((firstCode, secondCode) =>
    firstCode.localeCompare(secondCode, undefined, {
      numeric: true,
      sensitivity: 'base'
    })
  )

  const verifiedLedgerTotalsByCode = await fetchContributionVerifiedLedgerTotalsByCode(associationCodes)
  const amountPerVestedMember = decimalToNumber(currentMonthContributionAssessment?.amountPerVestedMember)

  const contributionAmountsByCode = new Map(
    associationCodes.map(associationCode => {
      const payment = paymentsByCode.get(associationCode)
      const vestedMembers = vestedCountsByCode.get(associationCode) ?? 0
      const currentAmountSent = decimalToNumber(payment?.amountSent)
      const currentAmountVerified = decimalToNumber(payment?.amountVerified)
      const recordedAmountVerified = verifiedLedgerTotalsByCode.get(associationCode) ?? 0
      const amountVerified = roundCurrencyAmount(Math.max(recordedAmountVerified, currentAmountVerified))
      const amountOwed = roundCurrencyAmount(amountPerVestedMember * vestedMembers)
      const manualBalanceAdjustment = balanceAdjustmentsByCode.get(associationCode) ?? 0

      return [
        associationCode,
        {
          amountOwed,
          amountReceived: roundCurrencyAmount(Math.max(currentAmountSent - currentAmountVerified, 0)),
          amountVerified,
          balance: roundCurrencyAmount(amountVerified + manualBalanceAdjustment - amountOwed)
        }
      ] as const
    })
  )

  const contributionPaymentAlertResetAt = paymentAlertReset[0]?.resetAt ?? defaultPaymentAlertResetAt

  const contributionPaymentAlerts: PaymentSubmissionAlert[] = payments.flatMap(payment => {
    const amountSent =
      contributionAmountsByCode.get(payment.associationCode)?.amountReceived ?? decimalToNumber(payment.amountSent)

    if (amountSent <= 0 || !payment.lastSubmittedAt || payment.lastSubmittedAt <= contributionPaymentAlertResetAt) {
      return []
    }

    const profile = profilesByCode.get(payment.associationCode)

    const associationName =
      profile?.associationName.trim() ||
      memberAssociationNamesByCode.get(payment.associationCode) ||
      payment.associationCode

    return [
      {
        amount: amountSent,
        associationCode: payment.associationCode,
        associationName,
        submittedAt: payment.lastSubmittedAt!
      }
    ]
  })

  const rows: AdminPaymentRow[] = associationCodes.map(associationCode => {
    const profile = profilesByCode.get(associationCode)
    const contributionAmounts = contributionAmountsByCode.get(associationCode)
    const vestedMembers = vestedCountsByCode.get(associationCode) ?? 0

    const associationName =
      profile?.associationName.trim() || memberAssociationNamesByCode.get(associationCode) || associationCode

    return {
      amountExpected: contributionAmounts?.amountOwed ?? 0,
      amountSent: contributionAmounts?.amountReceived ?? 0,
      amountVerified: contributionAmounts?.amountVerified ?? 0,
      associationCode,
      associationName,
      balance: contributionAmounts?.balance ?? 0,
      vestedMembers
    }
  })

  const totals: AdminPaymentTotals = rows.reduce(
    (currentTotals, row) => ({
      amountExpected: (currentTotals.amountExpected ?? 0) + (row.amountExpected ?? 0),
      amountSent: currentTotals.amountSent + row.amountSent,
      amountVerified: currentTotals.amountVerified + row.amountVerified,
      balance: currentTotals.balance + row.balance,
      vestedMembers: currentTotals.vestedMembers + row.vestedMembers
    }),
    {
      amountExpected: 0,
      amountSent: 0,
      amountVerified: 0,
      balance: 0,
      vestedMembers: 0
    }
  )

  const totalVestedMembers = vestedCounts.reduce((total, item) => total + item._count._all, 0)

  return (
    <section className='flex w-full min-w-0 flex-col gap-6 overflow-hidden py-8 sm:py-10'>
      <div className='min-w-0'>
        <h1 className='text-xl font-semibold tracking-normal break-words md:text-4xl'>Admin Contribution Payments</h1>
        <p className='text-muted-foreground mt-2 max-w-4xl text-sm leading-6 break-words sm:text-base'>
          Review contribution payments recorded by associations, verify received amounts, and compare balances against
          the current month contribution calculation
          {currentMonthContributionAssessment
            ? ` created on ${dateFormatter.format(currentMonthContributionAssessment.createdAt)}${
                currentMonthContributionAssessment.dueDate
                  ? ` and due on ${dateFormatter.format(currentMonthContributionAssessment.dueDate)}`
                  : ''
              }`
            : ''}
          .
        </p>
      </div>

      <ContributionAssessmentForm
        calculationDeathCount={contributionCalculationSummary.deathCount}
        monthlyContributionTotal={contributionCalculationSummary.totalAmount}
        vestedMembersCount={totalVestedMembers}
      />

      <PaymentSubmissionAlertCard
        title='New Contribution Payment Submissions'
        alerts={contributionPaymentAlerts}
        action={resetContributionPaymentAlertAction}
      />

      <Card className='w-full max-w-full min-w-0 overflow-hidden'>
        <CardHeader className='min-w-0'>
          <CardTitle className='break-words'>Contribution Payment Records</CardTitle>
        </CardHeader>
        <CardContent className='min-w-0'>
          <AdminPaymentsTable
            kind='contribution'
            rows={rows}
            totals={totals}
            adjustAction={addAssociationContributionBalanceAdjustmentAction}
            sentAdjustmentAction={addAssociationContributionSentAdjustmentAction}
            verifyAction={verifyAssociationContributionPaymentAction}
            secondaryAction={markAssociationContributionPaymentNotFoundAction}
          />
        </CardContent>
      </Card>
    </section>
  )
}

export default AdminContributionPayments
