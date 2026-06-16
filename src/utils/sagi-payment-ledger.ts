import { unstable_noStore as noStore } from 'next/cache'

import db from './db'

export const associationPaymentTypes = {
  contribution: 'contribution',
  registration: 'registration'
} as const

export const associationPaymentLedgerEventTypes = {
  dueOffset: 'due_offset',
  manualAdjustment: 'manual_adjustment',
  reset: 'reset',
  submitted: 'submitted',
  verified: 'verified'
} as const

export type AssociationPaymentType = (typeof associationPaymentTypes)[keyof typeof associationPaymentTypes]
export type AssociationPaymentLedgerEventType =
  (typeof associationPaymentLedgerEventTypes)[keyof typeof associationPaymentLedgerEventTypes]

export type AssociationPaymentLedgerEntry = {
  amount: number
  associationCode: string
  createdAt: string
  createdBy: string | null
  eventType: AssociationPaymentLedgerEventType
  id: string
  note: string | null
  paymentType: AssociationPaymentType
}

export type AssociationPaymentLedgerTotals = {
  amountSubmitted: number
  amountVerified: number
}

type FetchAssociationPaymentLedgerEntriesOptions = {
  eventTypes?: AssociationPaymentLedgerEventType[]
  limit?: number
  noStore?: boolean
  paymentType?: AssociationPaymentType
}

type AssociationPaymentAggregate = {
  amountSent: unknown
  amountVerified: unknown
  associationCode: string
  createdAt: Date
  paymentType: AssociationPaymentType
  verifiedAt: Date | null
}

const decimalToNumber = (value: unknown) => Number(value ?? 0)

const roundCurrencyAmount = (amount: number) => Number(amount.toFixed(2))

const paymentHistoryEventTypes = [
  associationPaymentLedgerEventTypes.submitted,
  associationPaymentLedgerEventTypes.verified
]

const getAggregateSubmittedAmount = (payment: AssociationPaymentAggregate) => {
  if (payment.paymentType === associationPaymentTypes.registration) {
    return roundCurrencyAmount(decimalToNumber(payment.amountSent) + decimalToNumber(payment.amountVerified))
  }

  return decimalToNumber(payment.amountSent)
}

const buildLegacyLedgerEntries = (
  entries: AssociationPaymentLedgerEntry[],
  payments: AssociationPaymentAggregate[]
): AssociationPaymentLedgerEntry[] => {
  const entriesByPayment = entries.reduce(
    (groups, entry) => {
      const key = `${entry.associationCode}:${entry.paymentType}`

      const currentGroup = groups.get(key) ?? {
        submittedTotal: 0,
        verifiedTotal: 0
      }

      if (entry.eventType === associationPaymentLedgerEventTypes.submitted) {
        currentGroup.submittedTotal = roundCurrencyAmount(currentGroup.submittedTotal + entry.amount)
      }

      if (entry.eventType === associationPaymentLedgerEventTypes.verified) {
        currentGroup.verifiedTotal = roundCurrencyAmount(currentGroup.verifiedTotal + entry.amount)
      }

      groups.set(key, currentGroup)

      return groups
    },
    new Map<string, { submittedTotal: number; verifiedTotal: number }>()
  )

  return payments.flatMap(payment => {
    const key = `${payment.associationCode}:${payment.paymentType}`

    const entryTotals = entriesByPayment.get(key) ?? {
      submittedTotal: 0,
      verifiedTotal: 0
    }

    const missingSubmittedAmount = roundCurrencyAmount(getAggregateSubmittedAmount(payment) - entryTotals.submittedTotal)
    const missingVerifiedAmount = roundCurrencyAmount(decimalToNumber(payment.amountVerified) - entryTotals.verifiedTotal)
    const legacyEntries: AssociationPaymentLedgerEntry[] = []

    if (missingSubmittedAmount > 0) {
      legacyEntries.push({
        amount: missingSubmittedAmount,
        associationCode: payment.associationCode,
        createdAt: payment.createdAt.toISOString(),
        createdBy: null,
        eventType: associationPaymentLedgerEventTypes.submitted,
        id: `legacy-${payment.paymentType}-submitted-${payment.associationCode}`,
        note: `${payment.paymentType} payment submitted before payment history was recorded.`,
        paymentType: payment.paymentType
      })
    }

    if (missingVerifiedAmount > 0 && payment.verifiedAt) {
      legacyEntries.push({
        amount: missingVerifiedAmount,
        associationCode: payment.associationCode,
        createdAt: payment.verifiedAt.toISOString(),
        createdBy: null,
        eventType: associationPaymentLedgerEventTypes.verified,
        id: `legacy-${payment.paymentType}-verified-${payment.associationCode}`,
        note: `${payment.paymentType} payment verified before payment history was recorded.`,
        paymentType: payment.paymentType
      })
    }

    return legacyEntries
  })
}

const fetchPaymentAggregates = async (
  associationCode: string,
  paymentType?: AssociationPaymentType
): Promise<AssociationPaymentAggregate[]> => {
  const aggregates: AssociationPaymentAggregate[] = []

  if (!paymentType || paymentType === associationPaymentTypes.contribution) {
    const payment = await db.associationContributionPayment.findUnique({
      where: {
        associationCode
      }
    })

    if (payment) {
      aggregates.push({
        amountSent: payment.amountSent,
        amountVerified: payment.amountVerified,
        associationCode: payment.associationCode,
        createdAt: payment.createdAt,
        paymentType: associationPaymentTypes.contribution,
        verifiedAt: payment.verifiedAt
      })
    }
  }

  if (!paymentType || paymentType === associationPaymentTypes.registration) {
    const payment = await db.associationRegistrationPayment.findUnique({
      where: {
        associationCode
      }
    })

    if (payment) {
      aggregates.push({
        amountSent: payment.amountSent,
        amountVerified: payment.amountVerified,
        associationCode: payment.associationCode,
        createdAt: payment.createdAt,
        paymentType: associationPaymentTypes.registration,
        verifiedAt: payment.verifiedAt
      })
    }
  }

  return aggregates
}

export const fetchAssociationPaymentLedgerEntries = async (
  associationCode: string,
  {
    eventTypes = paymentHistoryEventTypes,
    limit = 100,
    noStore: shouldNoStore = false,
    paymentType
  }: FetchAssociationPaymentLedgerEntriesOptions = {}
): Promise<AssociationPaymentLedgerEntry[]> => {
  if (shouldNoStore) {
    noStore()
  }

  const entries = await db.associationPaymentLedgerEntry.findMany({
    orderBy: {
      createdAt: 'desc'
    },
    take: limit,
    where: {
      associationCode,
      eventType: {
        in: eventTypes
      },
      ...(paymentType ? { paymentType } : {})
    }
  })

  const paymentLedgerEntries = entries.map(entry => ({
    amount: decimalToNumber(entry.amount),
    associationCode: entry.associationCode,
    createdAt: entry.createdAt.toISOString(),
    createdBy: entry.createdBy,
    eventType: entry.eventType as AssociationPaymentLedgerEventType,
    id: entry.id,
    note: entry.note,
    paymentType: entry.paymentType as AssociationPaymentType
  }))

  const aggregatePayments = await fetchPaymentAggregates(associationCode, paymentType)
  const legacyLedgerEntries = buildLegacyLedgerEntries(paymentLedgerEntries, aggregatePayments)

  return [...paymentLedgerEntries, ...legacyLedgerEntries]
    .sort((firstEntry, secondEntry) => new Date(secondEntry.createdAt).getTime() - new Date(firstEntry.createdAt).getTime())
    .slice(0, limit)
}

export const fetchAssociationPaymentLedgerTotals = async (
  associationCode: string,
  paymentType: AssociationPaymentType,
  { noStore: shouldNoStore = false }: Pick<FetchAssociationPaymentLedgerEntriesOptions, 'noStore'> = {}
): Promise<AssociationPaymentLedgerTotals> => {
  if (shouldNoStore) {
    noStore()
  }

  const [ledgerTotals, aggregatePayments] = await Promise.all([
    db.associationPaymentLedgerEntry.groupBy({
      _sum: {
        amount: true
      },
      by: ['eventType'],
      where: {
        associationCode,
        eventType: {
          in: paymentHistoryEventTypes
        },
        paymentType
      }
    }),
    fetchPaymentAggregates(associationCode, paymentType)
  ])

  const recordedSubmittedTotal = ledgerTotals.reduce((total, entry) => {
    if (entry.eventType !== associationPaymentLedgerEventTypes.submitted) {
      return total
    }

    return roundCurrencyAmount(total + decimalToNumber(entry._sum.amount))
  }, 0)

  const recordedVerifiedTotal = ledgerTotals.reduce((total, entry) => {
    if (entry.eventType !== associationPaymentLedgerEventTypes.verified) {
      return total
    }

    return roundCurrencyAmount(total + decimalToNumber(entry._sum.amount))
  }, 0)

  const aggregateSubmittedTotal = roundCurrencyAmount(
    aggregatePayments.reduce((total, payment) => total + getAggregateSubmittedAmount(payment), 0)
  )

  const aggregateVerifiedTotal = roundCurrencyAmount(
    aggregatePayments.reduce((total, payment) => total + decimalToNumber(payment.amountVerified), 0)
  )

  return {
    amountSubmitted: Math.max(recordedSubmittedTotal, aggregateSubmittedTotal),
    amountVerified: Math.max(recordedVerifiedTotal, aggregateVerifiedTotal)
  }
}
