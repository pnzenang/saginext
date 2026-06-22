import { unstable_noStore as noStore } from 'next/cache'

import AdminTransactionHistoryTable, {
  type AdminTransactionHistoryRow,
  type AdminTransactionHistoryTotals
} from '@/components/global/AdminTransactionHistoryTable'
import db from '@/utils/db'
import { associationPaymentLedgerEventTypes, associationPaymentTypes } from '@/utils/sagi-payment-ledger'

const paymentTypeLabels: Record<string, string> = {
  [associationPaymentTypes.contribution]: 'Contribution',
  [associationPaymentTypes.registration]: 'Registration'
}

const eventTypeLabels: Record<string, string> = {
  [associationPaymentLedgerEventTypes.dueOffset]: 'Due offset',
  [associationPaymentLedgerEventTypes.manualAdjustment]: 'Amount adjusted',
  [associationPaymentLedgerEventTypes.reset]: 'Reset',
  [associationPaymentLedgerEventTypes.submitted]: 'Amount set by association',
  [associationPaymentLedgerEventTypes.verified]: 'Amount verified'
}

const historyEventTypes = [
  associationPaymentLedgerEventTypes.dueOffset,
  associationPaymentLedgerEventTypes.manualAdjustment,
  associationPaymentLedgerEventTypes.reset,
  associationPaymentLedgerEventTypes.submitted,
  associationPaymentLedgerEventTypes.verified
]

const dateTimeFormatter = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: 'America/New_York'
})

const decimalToNumber = (value: unknown) => Number(value ?? 0)

const roundCurrencyAmount = (amount: number) => Number(amount.toFixed(2))

const isAssociationSubmittedAmount = (eventType: string, note?: string | null) => {
  if (eventType !== associationPaymentLedgerEventTypes.submitted) return false

  const normalizedNote = note?.toLowerCase() ?? ''

  return (
    normalizedNote.includes('submitted by association') ||
    normalizedNote.includes('before payment history was recorded')
  )
}

const AdminTransactionHistory = async () => {
  noStore()

  const [ledgerEntries, profiles, memberAssociationNames] = await Promise.all([
    db.associationPaymentLedgerEntry.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      where: {
        eventType: {
          in: historyEventTypes
        }
      }
    }),
    db.profile.findMany({
      select: {
        associationCode: true,
        associationName: true
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
    })
  ])

  const associationNamesByCode = new Map<string, string>()

  memberAssociationNames.forEach(member => {
    const associationName = member.associationName.trim()

    if (associationName && !associationNamesByCode.has(member.associationCode)) {
      associationNamesByCode.set(member.associationCode, associationName)
    }
  })

  profiles.forEach(profile => {
    const associationName = profile.associationName.trim()

    if (associationName) {
      associationNamesByCode.set(profile.associationCode, associationName)
    }
  })

  const rows: AdminTransactionHistoryRow[] = ledgerEntries.map(entry => {
    const amount = decimalToNumber(entry.amount)
    const eventType = eventTypeLabels[entry.eventType] ?? entry.eventType
    const paymentType = paymentTypeLabels[entry.paymentType] ?? entry.paymentType

    return {
      amountAdjusted: entry.eventType === associationPaymentLedgerEventTypes.manualAdjustment ? amount : null,
      amountDueOffset: entry.eventType === associationPaymentLedgerEventTypes.dueOffset ? amount : null,
      amountReset: entry.eventType === associationPaymentLedgerEventTypes.reset ? amount : null,
      amountSubmitted: entry.eventType === associationPaymentLedgerEventTypes.submitted ? amount : null,
      amountVerified: entry.eventType === associationPaymentLedgerEventTypes.verified ? amount : null,
      associationCode: entry.associationCode,
      associationName: associationNamesByCode.get(entry.associationCode) ?? entry.associationCode,
      createdAt: entry.createdAt.toISOString(),
      createdAtLabel: dateTimeFormatter.format(entry.createdAt),
      createdBy: entry.createdBy ?? '',
      eventType,
      eventTypeKey: entry.eventType,
      id: entry.id,
      note: entry.note ?? '',
      paymentType,
      paymentTypeKey: entry.paymentType,
      source: isAssociationSubmittedAmount(entry.eventType, entry.note) ? 'Association' : 'SAGI-USA'
    }
  })

  const totals: AdminTransactionHistoryTotals = rows.reduce(
    (currentTotals, row) => {
      currentTotals.amountAdjusted = roundCurrencyAmount(currentTotals.amountAdjusted + (row.amountAdjusted ?? 0))
      currentTotals.amountDueOffset = roundCurrencyAmount(currentTotals.amountDueOffset + (row.amountDueOffset ?? 0))
      currentTotals.amountReset = roundCurrencyAmount(currentTotals.amountReset + (row.amountReset ?? 0))
      currentTotals.amountSubmitted = roundCurrencyAmount(currentTotals.amountSubmitted + (row.amountSubmitted ?? 0))
      currentTotals.amountVerified = roundCurrencyAmount(currentTotals.amountVerified + (row.amountVerified ?? 0))
      currentTotals.transactionCount += 1

      return currentTotals
    },
    {
      amountAdjusted: 0,
      amountDueOffset: 0,
      amountReset: 0,
      amountSubmitted: 0,
      amountVerified: 0,
      transactionCount: 0
    }
  )

  return (
    <div className='max-w-full min-w-0 space-y-6 py-4 sm:py-10'>
      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div className='min-w-0'>
          <h1 className='text-4xl font-semibold tracking-normal'>SAGI-USA Transaction History</h1>
          <p className='text-muted-foreground mt-2 text-sm'>
            All association payment transactions with submitted, adjusted, due offset, reset, and SAGI-USA verified
            amounts separated by column.
          </p>
        </div>
      </div>

      <AdminTransactionHistoryTable rows={rows} totals={totals} />
    </div>
  )
}

export default AdminTransactionHistory
