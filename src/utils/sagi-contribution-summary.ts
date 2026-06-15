import { unstable_noStore as noStore } from 'next/cache'

import db from './db'
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
  existingBalance: number
  manualBalanceAdjustment: number
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

  const [payment, balanceAdjustment, vestedMembersCount] = await Promise.all([
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
    })
  ])

  const amountOwed = Number((amountPerVestedMember * vestedMembersCount).toFixed(2))
  const amountReceived = decimalToNumber(payment?.amountSent)
  const amountVerified = decimalToNumber(payment?.amountVerified)
  const manualBalanceAdjustment = decimalToNumber(balanceAdjustment?.amount)
  const existingBalance = 0

  return {
    amountOwed,
    amountPerVestedMember,
    amountReceived,
    amountVerified,
    associationCode,
    balance: Number((amountVerified + manualBalanceAdjustment - amountOwed).toFixed(2)),
    existingBalance,
    manualBalanceAdjustment,
    vestedContributionCredit: 0,
    vestedMembersCount
  }
}
