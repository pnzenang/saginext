import AdminTransactionHistoryTable, {
  type AdminTransactionHistoryRow
} from '@/components/global/AdminTransactionHistoryTable'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import db from '@/utils/db'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const decimalToNumber = (value: unknown) => Number(value ?? 0)

const AdminTransactionHistory = async () => {
  const [ledgerEntries, profiles, memberAssociationNames] = await Promise.all([
    db.associationPaymentLedgerEntry.findMany({
      orderBy: {
        createdAt: 'desc'
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

  const rows: AdminTransactionHistoryRow[] = ledgerEntries.map(entry => ({
    amount: decimalToNumber(entry.amount),
    associationCode: entry.associationCode,
    associationName: associationNamesByCode.get(entry.associationCode) ?? entry.associationCode,
    createdAt: entry.createdAt.toISOString(),
    createdBy: entry.createdBy,
    eventType: entry.eventType,
    id: entry.id,
    note: entry.note,
    paymentType: entry.paymentType
  }))

  return (
    <section className='flex w-full min-w-0 flex-col gap-6 overflow-hidden py-8 sm:py-10'>
      <div className='min-w-0'>
        <h1 className='text-xl font-semibold tracking-normal break-words md:text-4xl'>SAGI-USA Transaction History</h1>
        <p className='text-muted-foreground mt-2 max-w-4xl text-sm leading-6 break-words sm:text-base'>
          Review contribution and registration transactions recorded across SAGI-USA associations.
        </p>
      </div>

      <Card className='w-full max-w-full min-w-0 overflow-hidden'>
        <CardHeader className='min-w-0'>
          <CardTitle className='break-words'>Transaction Records</CardTitle>
        </CardHeader>
        <CardContent className='min-w-0 px-2 sm:px-6'>
          <AdminTransactionHistoryTable rows={rows} />
        </CardContent>
      </Card>
    </section>
  )
}

export default AdminTransactionHistory
