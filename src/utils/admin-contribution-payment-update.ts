import { Prisma } from '@/generated/prisma/client'

import { getContributionPaymentAmountDetails } from '@/utils/contribution-payment-code'
import { fetchContributionPaymentCodeCentsByAssociationCode } from '@/utils/contribution-payment-code-records'
import db from '@/utils/db'
import {
  contributionBalanceAdjustmentType,
  fetchLatestAssociationContributionAssessmentForMonth,
  getContributionMonthDateRange
} from '@/utils/sagi-contribution-summary'
import { associationPaymentLedgerEventTypes, associationPaymentTypes } from '@/utils/sagi-payment-ledger'
import { memberStatus } from '@/utils/types'

export type AdminContributionPaymentUpdateRow = {
  amountSent: number
  amountToSend?: number
  amountVerified: number
  associationCode: string
  associationName: string
  balance: number
  contributionDue: number
  paymentCodeAmount?: number
  vestedMembers: number
}

type ContributionVerifiedLedgerTotal = {
  amountVerified: unknown
  associationCode: string
}

const decimalToNumber = (value: unknown) => Number(value ?? 0)
const roundCurrencyAmount = (amount: number) => Number(amount.toFixed(2))

type ContributionMonthDateRange = ReturnType<typeof getContributionMonthDateRange>

const isDateInContributionMonthDateRange = (date: Date | null | undefined, dateRange: ContributionMonthDateRange) =>
  Boolean(date && date >= dateRange.monthStart && date < dateRange.nextMonthStart)

const fetchContributionVerifiedLedgerTotalsByCode = async (
  associationCodes: string[],
  dateRange: ContributionMonthDateRange
) => {
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
      AND ledger."createdAt" >= ${dateRange.monthStart}
      AND ledger."createdAt" < ${dateRange.nextMonthStart}
    GROUP BY ledger."associationCode"
  `)

  return new Map(
    totals.map(total => [total.associationCode, roundCurrencyAmount(decimalToNumber(total.amountVerified))])
  )
}

export const fetchAdminContributionPaymentUpdateRows = async () => {
  const [
    profiles,
    payments,
    currentMonthContributionAssessment,
    contributionAssessmentGroups,
    contributionUsages,
    balanceAdjustments,
    vestedCounts,
    memberAssociationNames
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
      orderBy: {
        associationCode: 'asc'
      },
      select: {
        associationCode: true
      }
    }),
    db.associationBalanceAdjustment.findMany({
      orderBy: {
        associationCode: 'asc'
      },
      where: {
        balanceType: contributionBalanceAdjustmentType
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
    })
  ])

  const profilesByCode = new Map(profiles.map(profile => [profile.associationCode, profile]))
  const paymentsByCode = new Map(payments.map(payment => [payment.associationCode, payment]))

  if (!currentMonthContributionAssessment) return []

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

  const currentContributionDateRange = getContributionMonthDateRange()

  const verifiedLedgerTotalsByCode = await fetchContributionVerifiedLedgerTotalsByCode(
    associationCodes,
    currentContributionDateRange
  )

  const contributionPaymentCodesByCode = await fetchContributionPaymentCodeCentsByAssociationCode(associationCodes)

  const amountPerVestedMember = decimalToNumber(currentMonthContributionAssessment?.amountPerVestedMember)

  return associationCodes.map<AdminContributionPaymentUpdateRow>(associationCode => {
    const payment = paymentsByCode.get(associationCode)
    const profile = profilesByCode.get(associationCode)
    const vestedMembers = vestedCountsByCode.get(associationCode) ?? 0
    const currentAmountSent = decimalToNumber(payment?.amountSent)

    const currentAmountVerified = isDateInContributionMonthDateRange(payment?.verifiedAt, currentContributionDateRange)
      ? decimalToNumber(payment?.amountVerified)
      : 0

    const recordedAmountVerified = verifiedLedgerTotalsByCode.get(associationCode) ?? 0
    const amountVerified = roundCurrencyAmount(Math.max(recordedAmountVerified, currentAmountVerified))
    const contributionDue = roundCurrencyAmount(amountPerVestedMember * vestedMembers)
    const paymentCodeCents = contributionPaymentCodesByCode.get(associationCode) ?? null
    const paymentCodeAmount = paymentCodeCents === null ? undefined : roundCurrencyAmount(paymentCodeCents / 100)

    const contributionPaymentAmountDetails =
      contributionDue > 0 ? getContributionPaymentAmountDetails(contributionDue, paymentCodeCents) : undefined

    const amountToMatch =
      contributionPaymentAmountDetails?.hasPaymentCode && contributionPaymentAmountDetails.amountToSend > 0
        ? contributionPaymentAmountDetails.amountToSend
        : contributionDue

    const amountSent = roundCurrencyAmount(Math.max(currentAmountSent - currentAmountVerified, 0))
    const manualBalanceAdjustment = balanceAdjustmentsByCode.get(associationCode) ?? 0

    const associationName =
      profile?.associationName.trim() || memberAssociationNamesByCode.get(associationCode) || associationCode

    return {
      amountSent,
      amountToSend: contributionPaymentAmountDetails?.hasPaymentCode
        ? contributionPaymentAmountDetails.amountToSend
        : undefined,
      amountVerified,
      associationCode,
      associationName,
      balance: roundCurrencyAmount(amountVerified + manualBalanceAdjustment - amountToMatch),
      contributionDue,
      paymentCodeAmount,
      vestedMembers
    }
  })
}
