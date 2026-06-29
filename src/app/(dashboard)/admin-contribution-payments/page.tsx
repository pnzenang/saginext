import type { AdminPaymentRow, AdminPaymentTotals } from '@/components/global/AdminPaymentsTable'
import AdminPaymentsTable from '@/components/global/AdminPaymentsTableClient'
import ContributionAssessmentForm from '@/components/dashboard/ContributionAssessmentForm'
import PaymentSubmissionAlertCard, { type PaymentSubmissionAlert } from '@/components/global/PaymentSubmissionAlertCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import db from '@/utils/db'
import {
  addAssociationContributionBalanceAdjustmentAction,
  addAssociationContributionSentAdjustmentAction,
  resetContributionPaymentAlertAction,
  resetAssociationContributionPaymentAction,
  verifyAssociationContributionPaymentAction
} from '@/utils/actions'
import {
  contributionBalanceAdjustmentType,
  fetchAssociationContributionSummary,
  fetchLatestAssociationContributionAssessment
} from '@/utils/sagi-contribution-summary'
import { contributionPaymentAlertType } from '@/utils/payment-constants'
import { memberStatus } from '@/utils/types'

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium'
})

const decimalToNumber = (value: unknown) => Number(value ?? 0)
const defaultPaymentAlertResetAt = new Date(0)

const AdminContributionPayments = async () => {
  const [
    profiles,
    payments,
    latestContributionAssessment,
    contributionTotals,
    contributionUsages,
    balanceAdjustments,
    vestedCounts,
    memberAssociationNames,
    paymentAlertReset
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
    fetchLatestAssociationContributionAssessment(),
    db.associationContributionAssessmentGroup.groupBy({
      _sum: {
        amountOwed: true
      },
      by: ['associationCode'],
      orderBy: {
        associationCode: 'asc'
      }
    }),
    db.associationContributionUsage.findMany({
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
      orderBy: {
        associationName: 'asc'
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
    `
  ])

  const profilesByCode = new Map(profiles.map(profile => [profile.associationCode, profile]))
  const paymentsByCode = new Map(payments.map(payment => [payment.associationCode, payment]))
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
      ...(latestContributionAssessment?.groups.map(group => group.associationCode) ?? []),
      ...contributionTotals.map(group => group.associationCode),
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

  const contributionSummaries = await Promise.all(
    associationCodes.map(associationCode => fetchAssociationContributionSummary(associationCode, { noStore: true }))
  )

  const contributionSummaryByCode = new Map(contributionSummaries.map(summary => [summary.associationCode, summary]))
  const contributionPaymentAlertResetAt = paymentAlertReset[0]?.resetAt ?? defaultPaymentAlertResetAt

  const contributionPaymentAlerts: PaymentSubmissionAlert[] = payments.flatMap(payment => {
    const amountSent =
      contributionSummaryByCode.get(payment.associationCode)?.amountReceived ?? decimalToNumber(payment.amountSent)

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
    const contributionSummary = contributionSummaryByCode.get(associationCode)
    const vestedMembers = vestedCountsByCode.get(associationCode) ?? 0

    const associationName =
      profile?.associationName.trim() || memberAssociationNamesByCode.get(associationCode) || associationCode

    return {
      amountExpected: contributionSummary?.amountOwed ?? 0,
      amountSent: contributionSummary?.amountReceived ?? 0,
      amountVerified: contributionSummary?.amountVerified ?? 0,
      associationCode,
      associationName,
      balance: contributionSummary?.balance ?? 0,
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
          the latest contribution calculation
          {latestContributionAssessment
            ? ` created on ${dateFormatter.format(latestContributionAssessment.createdAt)}${
                latestContributionAssessment.dueDate
                  ? ` and due on ${dateFormatter.format(latestContributionAssessment.dueDate)}`
                  : ''
              }`
            : ''}
          .
        </p>
      </div>

      <PaymentSubmissionAlertCard
        title='New Contribution Payment Submissions'
        alerts={contributionPaymentAlerts}
        action={resetContributionPaymentAlertAction}
      />

      <ContributionAssessmentForm vestedMembersCount={totalVestedMembers} />

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
            resetAction={resetAssociationContributionPaymentAction}
          />
        </CardContent>
      </Card>
    </section>
  )
}

export default AdminContributionPayments
