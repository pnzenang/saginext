import type { AdminPaymentRow, AdminPaymentTotals } from '@/components/global/AdminPaymentsTable'
import AdminPaymentsTable from '@/components/global/AdminPaymentsTableClient'
import PaymentSubmissionAlertCard, { type PaymentSubmissionAlert } from '@/components/global/PaymentSubmissionAlertCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import db from '@/utils/db'
import {
  addAssociationRegistrationBalanceAdjustmentAction,
  addAssociationRegistrationSentAdjustmentAction,
  resetRegistrationPaymentAlertAction,
  resetAssociationRegistrationPaymentAction,
  verifyAssociationRegistrationPaymentAction
} from '@/utils/actions'
import {
  fetchAssociationRegistrationSummary,
  registrationBalanceAdjustmentType
} from '@/utils/sagi-registration-summary'
import { getPendingRegistrationCutoff } from '@/utils/sagi-member-longevity'
import { registrationPaymentAlertType } from '@/utils/payment-constants'
import { memberStatus } from '@/utils/types'

const decimalToNumber = (value: unknown) => Number(value ?? 0)
const defaultPaymentAlertResetAt = new Date(0)

const AdminRegistrationPayments = async () => {
  const [
    profiles,
    payments,
    registrationUsages,
    balanceAdjustments,
    memberCounts,
    memberAssociationNames,
    paymentAlertReset
  ] = await Promise.all([
    db.profile.findMany({
      orderBy: {
        associationCode: 'asc'
      }
    }),
    db.associationRegistrationPayment.findMany({
      orderBy: {
        associationCode: 'asc'
      }
    }),
    db.associationRegistrationUsage.findMany({
      select: {
        associationCode: true
      }
    }),
    db.associationBalanceAdjustment.findMany({
      where: {
        balanceType: registrationBalanceAdjustmentType
      },
      orderBy: {
        associationCode: 'asc'
      }
    }),
    db.member.groupBy({
      _count: {
        _all: true
      },
      by: ['associationCode', 'memberStatus'],
      orderBy: {
        associationCode: 'asc'
      },
      where: {
        AND: [
          {
            memberStatus: {
              in: [memberStatus.Vested, memberStatus.Awaiting, memberStatus.Pending]
            }
          },
          {
            OR: [
              {
                memberStatus: {
                  not: memberStatus.Pending
                }
              },
              {
                createdAt: {
                  gt: getPendingRegistrationCutoff()
                }
              }
            ]
          }
        ]
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
      WHERE "alertType" = ${registrationPaymentAlertType}
      LIMIT 1
    `
  ])

  const profilesByCode = new Map(profiles.map(profile => [profile.associationCode, profile]))
  const paymentsByCode = new Map(payments.map(payment => [payment.associationCode, payment]))
  const memberAssociationNamesByCode = new Map<string, string>()

  memberAssociationNames.forEach(member => {
    const associationName = member.associationName.trim()

    if (associationName && !memberAssociationNamesByCode.has(member.associationCode)) {
      memberAssociationNamesByCode.set(member.associationCode, associationName)
    }
  })

  const statusCountsByCode = new Map<
    string,
    {
      awaitingPublication: number
      pendingMembers: number
      vestedMembers: number
    }
  >()

  memberCounts.forEach(item => {
    const currentCounts = statusCountsByCode.get(item.associationCode) ?? {
      awaitingPublication: 0,
      pendingMembers: 0,
      vestedMembers: 0
    }

    if (item.memberStatus === memberStatus.Vested) currentCounts.vestedMembers = item._count._all
    if (item.memberStatus === memberStatus.Awaiting) currentCounts.awaitingPublication = item._count._all
    if (item.memberStatus === memberStatus.Pending) currentCounts.pendingMembers = item._count._all

    statusCountsByCode.set(item.associationCode, currentCounts)
  })

  const associationCodes = Array.from(
    new Set([
      ...profilesByCode.keys(),
      ...paymentsByCode.keys(),
      ...registrationUsages.map(usage => usage.associationCode),
      ...balanceAdjustments.map(adjustment => adjustment.associationCode),
      ...statusCountsByCode.keys()
    ])
  ).sort((firstCode, secondCode) =>
    firstCode.localeCompare(secondCode, undefined, {
      numeric: true,
      sensitivity: 'base'
    })
  )

  const registrationSummaries = await Promise.all(
    associationCodes.map(associationCode => fetchAssociationRegistrationSummary(associationCode, { noStore: true }))
  )

  const registrationSummaryByCode = new Map(registrationSummaries.map(summary => [summary.associationCode, summary]))
  const registrationPaymentAlertResetAt = paymentAlertReset[0]?.resetAt ?? defaultPaymentAlertResetAt

  const registrationPaymentAlerts: PaymentSubmissionAlert[] = payments.flatMap(payment => {
    const amountSent =
      registrationSummaryByCode.get(payment.associationCode)?.amountReceived ?? decimalToNumber(payment.amountSent)

    if (amountSent <= 0 || !payment.lastSubmittedAt || payment.lastSubmittedAt <= registrationPaymentAlertResetAt) {
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
    const registrationSummary = registrationSummaryByCode.get(associationCode)

    const associationName =
      profile?.associationName.trim() || memberAssociationNamesByCode.get(associationCode) || associationCode

    const statusCounts = statusCountsByCode.get(associationCode) ?? {
      awaitingPublication: 0,
      pendingMembers: 0,
      vestedMembers: 0
    }

    return {
      amountExpected: registrationSummary?.balanceDues ?? 0,
      amountSent: registrationSummary?.amountReceived ?? 0,
      amountVerified: registrationSummary?.amountVerified ?? 0,
      associationCode,
      associationName,
      awaitingPublication: statusCounts.awaitingPublication,
      balance: registrationSummary?.balance ?? 0,
      pendingMembers: statusCounts.pendingMembers,
      vestedMembers: statusCounts.vestedMembers
    }
  })

  const totals: AdminPaymentTotals = rows.reduce(
    (currentTotals, row) => ({
      amountExpected: (currentTotals.amountExpected ?? 0) + (row.amountExpected ?? 0),
      amountSent: currentTotals.amountSent + row.amountSent,
      amountVerified: currentTotals.amountVerified + row.amountVerified,
      awaitingPublication: (currentTotals.awaitingPublication ?? 0) + (row.awaitingPublication ?? 0),
      balance: currentTotals.balance + row.balance,
      pendingMembers: (currentTotals.pendingMembers ?? 0) + (row.pendingMembers ?? 0),
      vestedMembers: currentTotals.vestedMembers + row.vestedMembers
    }),
    {
      amountExpected: 0,
      amountSent: 0,
      amountVerified: 0,
      awaitingPublication: 0,
      balance: 0,
      pendingMembers: 0,
      vestedMembers: 0
    }
  )

  return (
    <section className='flex w-full min-w-0 flex-col gap-6 overflow-hidden py-8 sm:py-10'>
      <div className='min-w-0'>
        <h1 className='text-xl font-semibold tracking-normal break-words md:text-4xl'>Admin Registration Payments</h1>
        <p className='text-muted-foreground mt-2 max-w-4xl text-sm leading-6 break-words sm:text-base'>
          Review registration payments recorded by associations, verify received amounts, and compare them against the
          current registration fees.
        </p>
      </div>

      <PaymentSubmissionAlertCard
        title='New Registration Payment Submissions'
        alerts={registrationPaymentAlerts}
        action={resetRegistrationPaymentAlertAction}
      />

      <Card className='w-full max-w-full min-w-0 overflow-hidden'>
        <CardHeader className='min-w-0'>
          <CardTitle className='break-words'>Registration Payment Records</CardTitle>
        </CardHeader>
        <CardContent className='min-w-0'>
          <AdminPaymentsTable
            kind='registration'
            rows={rows}
            totals={totals}
            adjustAction={addAssociationRegistrationBalanceAdjustmentAction}
            sentAdjustmentAction={addAssociationRegistrationSentAdjustmentAction}
            verifyAction={verifyAssociationRegistrationPaymentAction}
            resetAction={resetAssociationRegistrationPaymentAction}
          />
        </CardContent>
      </Card>
    </section>
  )
}

export default AdminRegistrationPayments
