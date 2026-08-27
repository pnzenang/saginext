import { auth } from '@clerk/nextjs/server'

import { unstable_noStore as noStore } from 'next/cache'
import { redirect } from 'next/navigation'

import DelegatePaymentHistoryTable, {
  type DelegatePaymentHistoryRow,
  type DelegatePaymentHistoryTotals
} from '@/components/global/DelegatePaymentHistoryTable'
import { fetchProfile } from '@/utils/actions'
import db from '@/utils/db'
import { associationPaymentLedgerEventTypes } from '@/utils/sagi-payment-ledger'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const monthLabelFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'long',
  timeZone: 'America/New_York',
  year: 'numeric'
})

const monthKeyFormatter = new Intl.DateTimeFormat('en-US', {
  month: '2-digit',
  timeZone: 'America/New_York',
  year: 'numeric'
})

const decimalToNumber = (value: unknown) => Number(value ?? 0)
const roundCurrencyAmount = (amount: number) => Number(amount.toFixed(2))

const transactionHistoryEventTypes = [
  associationPaymentLedgerEventTypes.manualAdjustment,
  associationPaymentLedgerEventTypes.notFound,
  associationPaymentLedgerEventTypes.reset,
  associationPaymentLedgerEventTypes.submitted,
  associationPaymentLedgerEventTypes.verified
]

type MonthBucket = {
  amountSentOrAdjusted: number
  amountVerified: number
  entryCount: number
  month: string
  monthLabel: string
}

const getMonthKey = (date: Date) => {
  const parts = monthKeyFormatter.formatToParts(date)
  const month = parts.find(part => part.type === 'month')?.value ?? '01'
  const year = parts.find(part => part.type === 'year')?.value ?? date.getUTCFullYear().toString()

  return `${year}-${month}`
}

const getSentOrAdjustedEffect = (eventType: string, amount: number) => {
  if (eventType === associationPaymentLedgerEventTypes.verified) return 0

  if (
    eventType === associationPaymentLedgerEventTypes.notFound ||
    eventType === associationPaymentLedgerEventTypes.reset
  ) {
    return roundCurrencyAmount(-amount)
  }

  return amount
}

const getMonthlyTransactionHistoryRows = (
  ledgerEntries: { amount: unknown; createdAt: Date; eventType: string }[]
): DelegatePaymentHistoryRow[] => {
  const bucketsByMonth = ledgerEntries.reduce((buckets, entry) => {
    const month = getMonthKey(entry.createdAt)

    const bucket = buckets.get(month) ?? {
      amountSentOrAdjusted: 0,
      amountVerified: 0,
      entryCount: 0,
      month,
      monthLabel: monthLabelFormatter.format(entry.createdAt)
    }

    const amount = decimalToNumber(entry.amount)

    if (entry.eventType === associationPaymentLedgerEventTypes.verified) {
      bucket.amountVerified = roundCurrencyAmount(bucket.amountVerified + amount)
    } else {
      bucket.amountSentOrAdjusted = roundCurrencyAmount(
        bucket.amountSentOrAdjusted + getSentOrAdjustedEffect(entry.eventType, amount)
      )
    }

    bucket.entryCount += 1
    buckets.set(month, bucket)

    return buckets
  }, new Map<string, MonthBucket>())

  let runningBalance = 0

  return Array.from(bucketsByMonth.values())
    .sort((firstBucket, secondBucket) => firstBucket.month.localeCompare(secondBucket.month))
    .map(bucket => {
      runningBalance = roundCurrencyAmount(runningBalance + bucket.amountSentOrAdjusted - bucket.amountVerified)

      return {
        ...bucket,
        balance: runningBalance,
        id: bucket.month
      }
    })
}

const getPaymentHistoryTotals = (rows: DelegatePaymentHistoryRow[]): DelegatePaymentHistoryTotals =>
  rows.reduce(
    (totals, row) => {
      totals.amountSentOrAdjusted = roundCurrencyAmount(totals.amountSentOrAdjusted + row.amountSentOrAdjusted)
      totals.amountVerified = roundCurrencyAmount(totals.amountVerified + row.amountVerified)
      totals.balance = roundCurrencyAmount(totals.amountSentOrAdjusted - totals.amountVerified)
      totals.monthCount += 1
      totals.transactionCount += row.entryCount

      return totals
    },
    {
      amountSentOrAdjusted: 0,
      amountVerified: 0,
      balance: 0,
      monthCount: 0,
      transactionCount: 0
    }
  )

const PaymentHistoryPage = async () => {
  noStore()

  const { userId } = await auth()

  if (!userId) redirect('/sign-in')

  const profile = await fetchProfile()

  const ledgerEntries = await db.associationPaymentLedgerEntry.findMany({
    orderBy: {
      createdAt: 'asc'
    },
    select: {
      amount: true,
      createdAt: true,
      eventType: true
    },
    where: {
      associationCode: profile.associationCode,
      cancelledAt: null,
      eventType: {
        in: transactionHistoryEventTypes
      }
    }
  })

  const rows = getMonthlyTransactionHistoryRows(ledgerEntries)

  const totals = getPaymentHistoryTotals(rows)

  return (
    <div className='max-w-full min-w-0 space-y-6 py-4 sm:py-10'>
      <div className='min-w-0'>
        <h1 className='text-4xl font-semibold tracking-normal'>Sponsor Transaction History</h1>
        <p className='text-muted-foreground mt-2 max-w-4xl text-sm leading-6'>
          Monthly sent amounts, SAGI-USA adjustments, verified payments, and running balance for{' '}
          {profile.associationCode} - {profile.associationName}.
        </p>
      </div>

      <DelegatePaymentHistoryTable rows={rows} totals={totals} />
    </div>
  )
}

export default PaymentHistoryPage
