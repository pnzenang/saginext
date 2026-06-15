import { unstable_noStore as noStore } from 'next/cache'

import db from './db'
import { registrationFeePerEligibleMember } from './payment-constants'
import { memberStatus } from './types'

export const registrationBalanceAdjustmentType = 'registration'
export { registrationFeePerEligibleMember } from './payment-constants'

type FetchAssociationRegistrationSummaryOptions = {
  noStore?: boolean
}

export type AssociationRegistrationSummary = {
  amountReceived: number
  amountUsed: number
  amountVerified: number
  associationCode: string
  balance: number
  balanceDues: number
  manualBalanceAdjustment: number
}

const decimalToNumber = (value: unknown) => Number(value ?? 0)

export const fetchRegistrationUsedMemberCount = async (associationCode: string) => {
  return db.associationRegistrationUsage.count({
    where: {
      associationCode
    }
  })
}

export const fetchAssociationRegistrationSummary = async (
  associationCode: string,
  options: FetchAssociationRegistrationSummaryOptions = {}
): Promise<AssociationRegistrationSummary> => {
  if (options.noStore) {
    noStore()
  }

  const [payment, pendingMembersCount, balanceAdjustment] = await Promise.all([
    db.associationRegistrationPayment.findUnique({
      where: {
        associationCode
      }
    }),
    db.member.count({
      where: {
        associationCode,
        memberStatus: memberStatus.Pending
      }
    }),
    db.associationBalanceAdjustment.findUnique({
      where: {
        associationCode_balanceType: {
          associationCode,
          balanceType: registrationBalanceAdjustmentType
        }
      }
    })
  ])

  const balanceDues = Number((pendingMembersCount * registrationFeePerEligibleMember).toFixed(2))
  const amountVerified = decimalToNumber(payment?.amountVerified)
  const manualBalanceAdjustment = decimalToNumber(balanceAdjustment?.amount)

  return {
    amountReceived: decimalToNumber(payment?.amountSent),
    amountUsed: balanceDues,
    amountVerified,
    associationCode,
    balance: Number((amountVerified + manualBalanceAdjustment - balanceDues).toFixed(2)),
    balanceDues,
    manualBalanceAdjustment
  }
}
