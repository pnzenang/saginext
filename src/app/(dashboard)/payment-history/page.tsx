import { auth } from '@clerk/nextjs/server'

import { unstable_noStore as noStore } from 'next/cache'
import { redirect } from 'next/navigation'

import DelegatePaymentHistoryTable, {
  type DelegatePaymentHistoryRow,
  type DelegatePaymentHistoryTotals
} from '@/components/global/DelegatePaymentHistoryTable'
import { fetchProfile } from '@/utils/actions'
import db from '@/utils/db'
import { associationPaymentLedgerEventTypes, associationPaymentTypes } from '@/utils/sagi-payment-ledger'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const paymentTypeLabels: Record<string, string> = {
  [associationPaymentTypes.contribution]: 'Contribution',
  [associationPaymentTypes.registration]: 'Registration'
}

const dateTimeFormatter = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: 'America/New_York'
})

const decimalToNumber = (value: unknown) => Number(value ?? 0)
const roundCurrencyAmount = (amount: number) => Number(amount.toFixed(2))

const getPaymentHistoryTotals = (rows: DelegatePaymentHistoryRow[]): DelegatePaymentHistoryTotals =>
  rows.reduce(
    (totals, row) => {
      if (row.paymentTypeKey === associationPaymentTypes.contribution) {
        totals.contributionVerified = roundCurrencyAmount(totals.contributionVerified + row.amount)
      }

      if (row.paymentTypeKey === associationPaymentTypes.registration) {
        totals.registrationVerified = roundCurrencyAmount(totals.registrationVerified + row.amount)
      }

      totals.totalVerified = roundCurrencyAmount(totals.totalVerified + row.amount)
      totals.transactionCount += 1

      return totals
    },
    {
      contributionVerified: 0,
      registrationVerified: 0,
      totalVerified: 0,
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
      createdAt: 'desc'
    },
    where: {
      associationCode: profile.associationCode,
      cancelledAt: null,
      eventType: associationPaymentLedgerEventTypes.verified
    }
  })

  const rows: DelegatePaymentHistoryRow[] = ledgerEntries.map(entry => {
    const paymentType = paymentTypeLabels[entry.paymentType] ?? entry.paymentType

    return {
      amount: decimalToNumber(entry.amount),
      createdAt: entry.createdAt.toISOString(),
      createdAtLabel: dateTimeFormatter.format(entry.createdAt),
      id: entry.id,
      note: entry.note ?? '',
      paymentType,
      paymentTypeKey: entry.paymentType,
      verifiedBy: entry.createdBy ?? 'SAGI-USA'
    }
  })

  const totals = getPaymentHistoryTotals(rows)

  return (
    <div className='max-w-full min-w-0 space-y-6 py-4 sm:py-10'>
      <div className='min-w-0'>
        <h1 className='text-4xl font-semibold tracking-normal'>Payment History</h1>
        <p className='text-muted-foreground mt-2 max-w-4xl text-sm leading-6'>
          Verified contribution and registration payments for {profile.associationCode} - {profile.associationName} are
          recorded here as soon as SAGI-USA confirms payment.
        </p>
      </div>

      <DelegatePaymentHistoryTable rows={rows} totals={totals} />
    </div>
  )
}

export default PaymentHistoryPage
