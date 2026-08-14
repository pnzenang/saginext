import { auth } from '@clerk/nextjs/server'

import { unstable_noStore as noStore } from 'next/cache'
import { redirect } from 'next/navigation'

import AdminPaymentHistoryTable, {
  type AdminPaymentHistoryRow,
  type AdminPaymentHistoryTotals
} from '@/components/global/AdminPaymentHistoryTable'
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

const getAssociationNameFallbacks = async () => {
  const [profiles, memberAssociationNames] = await Promise.all([
    db.profile.findMany({
      select: {
        associationCode: true,
        associationName: true
      }
    }),
    db.member.findMany({
      distinct: ['associationCode'],
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

  return associationNamesByCode
}

const getPaymentHistoryTotals = (rows: AdminPaymentHistoryRow[]): AdminPaymentHistoryTotals => {
  const associationCodes = new Set<string>()

  return rows.reduce(
    (totals, row) => {
      associationCodes.add(row.associationCode)

      if (row.paymentTypeKey === associationPaymentTypes.contribution) {
        totals.contributionVerified = roundCurrencyAmount(totals.contributionVerified + row.amount)
      }

      if (row.paymentTypeKey === associationPaymentTypes.registration) {
        totals.registrationVerified = roundCurrencyAmount(totals.registrationVerified + row.amount)
      }

      totals.totalVerified = roundCurrencyAmount(totals.totalVerified + row.amount)
      totals.transactionCount += 1
      totals.associationCount = associationCodes.size

      return totals
    },
    {
      associationCount: 0,
      contributionVerified: 0,
      registrationVerified: 0,
      totalVerified: 0,
      transactionCount: 0
    }
  )
}

const AdminPaymentHistoryPage = async () => {
  noStore()

  const { userId } = await auth()

  if (!userId) redirect('/sign-in')
  if (userId !== process.env.ADMIN_USER_ID) redirect('/all-members')

  const [ledgerEntries, associationNamesByCode] = await Promise.all([
    db.associationPaymentLedgerEntry.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      where: {
        cancelledAt: null,
        eventType: associationPaymentLedgerEventTypes.verified
      }
    }),
    getAssociationNameFallbacks()
  ])

  const rows: AdminPaymentHistoryRow[] = ledgerEntries.map(entry => {
    const associationName = associationNamesByCode.get(entry.associationCode) ?? entry.associationCode
    const paymentType = paymentTypeLabels[entry.paymentType] ?? entry.paymentType

    return {
      amount: decimalToNumber(entry.amount),
      associationCode: entry.associationCode,
      associationName,
      createdAt: entry.createdAt.toISOString(),
      createdAtLabel: dateTimeFormatter.format(entry.createdAt),
      createdBy: entry.createdBy ?? '',
      id: entry.id,
      note: entry.note ?? '',
      paymentType,
      paymentTypeKey: entry.paymentType
    }
  })

  const totals = getPaymentHistoryTotals(rows)

  return (
    <div className='max-w-full min-w-0 space-y-6 py-4 sm:py-10'>
      <div className='min-w-0'>
        <h1 className='text-4xl font-semibold tracking-normal'>Association Payment History</h1>
        <p className='text-muted-foreground mt-2 max-w-4xl text-sm leading-6'>
          Verified contribution and registration payments are recorded here by association as soon as SAGI-USA confirms
          payment.
        </p>
      </div>

      <AdminPaymentHistoryTable rows={rows} totals={totals} />
    </div>
  )
}

export default AdminPaymentHistoryPage
