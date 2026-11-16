import AdminPaymentCodesTable, { type AdminPaymentCodeRow } from '@/components/global/AdminPaymentCodesTable'
import db from '@/utils/db'
import { updateAssociationContributionPaymentCodeAction } from '@/utils/actions'
import { memberStatus } from '@/utils/types'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const AdminPaymentCodesPage = async () => {
  const [profiles, memberAssociations, vestedCounts, paymentCodes] = await Promise.all([
    db.profile.findMany({ select: { associationCode: true, associationName: true } }),
    db.member.groupBy({ by: ['associationCode', 'associationName'] }),
    db.member.groupBy({
      _count: { _all: true },
      by: ['associationCode'],
      where: { memberStatus: memberStatus.Vested }
    }),
    db.associationContributionPaymentCode.findMany({ select: { associationCode: true, codeCents: true } })
  ])

  const namesByCode = new Map<string, string>()

  profiles.forEach(profile => {
    const associationName = profile.associationName.trim()

    if (associationName) namesByCode.set(profile.associationCode, associationName)
  })

  memberAssociations.forEach(member => {
    const associationName = member.associationName.trim()

    if (associationName && !namesByCode.has(member.associationCode)) {
      namesByCode.set(member.associationCode, associationName)
    }
  })

  const vestedByCode = new Map(vestedCounts.map(item => [item.associationCode, item._count._all]))
  const codeCentsByCode = new Map(paymentCodes.map(paymentCode => [paymentCode.associationCode, paymentCode.codeCents]))

  const associationCodes = Array.from(
    new Set(
      [
        ...profiles.map(profile => profile.associationCode),
        ...memberAssociations.map(member => member.associationCode),
        ...paymentCodes.map(paymentCode => paymentCode.associationCode)
      ]
        .map(code => code.trim().toUpperCase())
        .filter(Boolean)
    )
  ).sort((firstCode, secondCode) => firstCode.localeCompare(secondCode))

  const rows: AdminPaymentCodeRow[] = associationCodes.map(associationCode => ({
    associationCode,
    associationName: namesByCode.get(associationCode) ?? '',
    codeCents: codeCentsByCode.get(associationCode) ?? null,
    vestedMembers: vestedByCode.get(associationCode) ?? 0
  }))

  return (
    <div className='py-8 sm:py-10'>
      <div className='mx-auto w-full max-w-5xl px-2 sm:px-6 lg:px-8'>
        <div className='mb-6 space-y-2'>
          <h1 className='text-xl font-semibold tracking-normal md:text-4xl'>Contribution Payment Codes</h1>
          <p className='text-muted-foreground text-sm'>
            The cents code is added to each association&apos;s monthly contribution so its payment can be recognized.
            Codes do not need to be unique.
          </p>
        </div>

        <AdminPaymentCodesTable rows={rows} saveAction={updateAssociationContributionPaymentCodeAction} />
      </div>
    </div>
  )
}

export default AdminPaymentCodesPage
