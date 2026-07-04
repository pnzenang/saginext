import { unstable_noStore as noStore } from 'next/cache'

import db from './db'
import { associationPaymentTypes, fetchAssociationPaymentLedgerTotals } from './sagi-payment-ledger'
import { memberStatus } from './types'

export const contributionBalanceAdjustmentType = 'contribution'
export { contributionCreditPerVestedMember } from './payment-constants'

type FetchAssociationContributionSummaryOptions = {
  noStore?: boolean
}

export type AssociationContributionSummary = {
  amountOwed: number
  amountPerVestedMember: number
  amountReceived: number
  amountVerified: number
  balance: number
  associationCode: string
  contributionDueMonths: {
    amount: number
    dueDate: string
  }[]
  deathCount: number
  dueDate: string | null
  existingBalance: number
  lastSubmittedAt: string | null
  manualBalanceAdjustment: number
  verifiedAt: string | null
  vestedContributionCredit: number
  vestedMembersCount: number
}

const decimalToNumber = (value: unknown) => Number(value ?? 0)

export const fetchLatestAssociationContributionAssessment = () =>
  db.associationContributionAssessment.findFirst({
    include: {
      groups: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

export const fetchAssociationContributionSummary = async (
  associationCode: string,
  options: FetchAssociationContributionSummaryOptions = {}
): Promise<AssociationContributionSummary> => {
  if (options.noStore) {
    noStore()
  }

  const latestAssessment = await fetchLatestAssociationContributionAssessment()
  const amountPerVestedMember = decimalToNumber(latestAssessment?.amountPerVestedMember)

  const [
    payment,
    balanceAdjustment,
    vestedMembersCount,
    contributionAssessmentGroups,
    paymentLedgerTotals
  ] = await Promise.all([
    db.associationContributionPayment.findUnique({
      where: {
        associationCode
      }
    }),
    db.associationBalanceAdjustment.findUnique({
      where: {
        associationCode_balanceType: {
          associationCode,
          balanceType: contributionBalanceAdjustmentType
        }
      }
    }),
    db.member.count({
      where: {
        associationCode,
        memberStatus: memberStatus.Vested
      }
    }),
    db.associationContributionAssessmentGroup.findMany({
      include: {
        assessment: {
          select: {
            createdAt: true,
            dueDate: true
          }
        }
      },
      where: {
        associationCode
      }
    }),
    fetchAssociationPaymentLedgerTotals(associationCode, associationPaymentTypes.contribution, {
      noStore: options.noStore
    })
  ])

  const amountOwed = Number((amountPerVestedMember * vestedMembersCount).toFixed(2))
  const currentAmountSent = decimalToNumber(payment?.amountSent)
  const currentAmountVerified = decimalToNumber(payment?.amountVerified)
  const amountReceived = Number(Math.max(currentAmountSent - currentAmountVerified, 0).toFixed(2))
  const amountVerified = paymentLedgerTotals.amountVerified
  const manualBalanceAdjustment = decimalToNumber(balanceAdjustment?.amount)
  const existingBalance = 0

  const contributionDueMonthsByDate = contributionAssessmentGroups.reduce((groups, group) => {
    const dueDate = group.assessment.dueDate ?? group.assessment.createdAt
    const dueDateKey = dueDate.toISOString().slice(0, 7)
    const currentGroup = groups.get(dueDateKey)

    groups.set(dueDateKey, {
      amount: Number(((currentGroup?.amount ?? 0) + decimalToNumber(group.amountOwed)).toFixed(2)),
      dueDate: currentGroup?.dueDate ?? dueDate.toISOString()
    })

    return groups
  }, new Map<string, { amount: number; dueDate: string }>())

  const contributionDueMonths = Array.from(contributionDueMonthsByDate.values()).sort(
    (firstMonth, secondMonth) => new Date(secondMonth.dueDate).getTime() - new Date(firstMonth.dueDate).getTime()
  )

  const fallbackContributionDueMonths =
    contributionDueMonths.length > 0 || amountOwed <= 0 || !latestAssessment?.dueDate
      ? contributionDueMonths
      : [
          {
            amount: amountOwed,
            dueDate: latestAssessment.dueDate.toISOString()
          }
        ]

  return {
    amountOwed,
    amountPerVestedMember,
    amountReceived,
    amountVerified,
    associationCode,
    balance: Number((amountVerified + manualBalanceAdjustment - amountOwed).toFixed(2)),
    contributionDueMonths: fallbackContributionDueMonths,
    deathCount: latestAssessment?.deathCount ?? 0,
    dueDate: latestAssessment?.dueDate?.toISOString() ?? null,
    existingBalance,
    lastSubmittedAt: payment?.lastSubmittedAt?.toISOString() ?? null,
    manualBalanceAdjustment,
    verifiedAt: payment?.verifiedAt?.toISOString() ?? null,
    vestedContributionCredit: 0,
    vestedMembersCount
  }
}
