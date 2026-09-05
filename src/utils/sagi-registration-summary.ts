import { unstable_noStore as noStore } from 'next/cache'

import db from './db'
import { registrationFeePerEligibleMember } from './payment-constants'
import { associationPaymentTypes, fetchAssociationPaymentLedgerTotals } from './sagi-payment-ledger'
import { memberStatus } from './types'

export const registrationBalanceAdjustmentType = 'registration'
export { registrationFeePerEligibleMember } from './payment-constants'

type FetchAssociationRegistrationSummaryOptions = {
  noStore?: boolean
}

export type AssociationRegistrationSummary = {
  amountAwaitingVerification: number
  amountReceived: number
  amountUsed: number
  amountVerified: number
  associationCode: string
  balance: number
  balanceDues: number
  lastSubmittedAt: string | null
  manualBalanceAdjustment: number
  pendingMemberAddedAt: string | null
  pendingMemberDueDays: {
    addedAt: string
    amount: number
    memberNames: string[]
  }[]
  pendingMemberNames: string[]
  verifiedAt: string | null
}

const decimalToNumber = (value: unknown) => Number(value ?? 0)
const roundCurrencyAmount = (amount: number) => Number(amount.toFixed(2))

type PendingRegistrationMemberWithAmount = {
  amountUsed: number
  createdAt: Date
  firstName: string
  lastAndMiddleNames: string
}

const getPendingMemberName = (member: Pick<PendingRegistrationMemberWithAmount, 'firstName' | 'lastAndMiddleNames'>) =>
  [member.firstName, member.lastAndMiddleNames].filter(Boolean).join(' ')

const getPendingMemberDueDays = (members: PendingRegistrationMemberWithAmount[]) => {
  const pendingMemberDueDaysByDate = new Map<string, { addedAt: string; amount: number; memberNames: string[] }>()

  const sortedMembers = [...members].sort(
    (firstMember, secondMember) => firstMember.createdAt.getTime() - secondMember.createdAt.getTime()
  )

  sortedMembers.forEach(member => {
    const dateKey = member.createdAt.toISOString().slice(0, 10)
    const currentGroup = pendingMemberDueDaysByDate.get(dateKey)

    pendingMemberDueDaysByDate.set(dateKey, {
      addedAt: `${dateKey}T12:00:00.000Z`,
      amount: roundCurrencyAmount((currentGroup?.amount ?? 0) + member.amountUsed),
      memberNames: [...(currentGroup?.memberNames ?? []), getPendingMemberName(member)]
    })
  })

  return Array.from(pendingMemberDueDaysByDate.values()).sort((firstDay, secondDay) =>
    secondDay.addedAt.localeCompare(firstDay.addedAt)
  )
}

export const fetchRegistrationUsedMemberCount = async (associationCode: string) => {
  return db.member.count({
    where: {
      associationCode,
      memberStatus: memberStatus.Pending
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

  const [payment, balanceAdjustment, paymentLedgerTotals] = await Promise.all([
    db.associationRegistrationPayment.findUnique({
      where: {
        associationCode
      }
    }),
    db.associationBalanceAdjustment.findUnique({
      where: {
        associationCode_balanceType: {
          associationCode,
          balanceType: registrationBalanceAdjustmentType
        }
      }
    }),
    fetchAssociationPaymentLedgerTotals(associationCode, associationPaymentTypes.registration, {
      noStore: options.noStore
    })
  ])

  const pendingRegistrationMembers = await db.member.findMany({
    orderBy: {
      createdAt: 'desc'
    },
    select: {
      firstName: true,
      lastAndMiddleNames: true,
      createdAt: true,
      memberMatriculationNumber: true
    },
    where: {
      associationCode,
      memberStatus: memberStatus.Pending
    }
  })

  const registrationMembersWithAmounts = pendingRegistrationMembers.map(member => ({
    ...member,
    amountUsed: registrationFeePerEligibleMember
  }))

  const pendingRegistrationFees = Number(
    registrationMembersWithAmounts.reduce((total, member) => total + member.amountUsed, 0).toFixed(2)
  )

  const amountAwaitingVerification = decimalToNumber(payment?.amountSent)
  const amountReceived = paymentLedgerTotals.amountSubmitted
  const amountVerified = amountReceived > 0 ? paymentLedgerTotals.amountVerified : 0
  const manualBalanceAdjustment = decimalToNumber(balanceAdjustment?.amount)
  const pendingMember = registrationMembersWithAmounts[0]
  const balance = roundCurrencyAmount(amountVerified + manualBalanceAdjustment - pendingRegistrationFees)
  const balanceDues = pendingRegistrationFees

  const pendingMemberDueDays = getPendingMemberDueDays(registrationMembersWithAmounts)

  return {
    amountAwaitingVerification,
    amountReceived,
    amountUsed: pendingRegistrationFees,
    amountVerified,
    associationCode,
    balance,
    balanceDues,
    lastSubmittedAt: payment?.lastSubmittedAt?.toISOString() ?? null,
    manualBalanceAdjustment,
    pendingMemberAddedAt: pendingMember?.createdAt.toISOString() ?? null,
    pendingMemberDueDays,
    pendingMemberNames: registrationMembersWithAmounts.map(member => getPendingMemberName(member)),
    verifiedAt: payment?.verifiedAt?.toISOString() ?? null
  }
}
