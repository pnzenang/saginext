import AssociationPaymentPageContent from '@/components/dashboard/AssociationPaymentPageContent'
import { fetchProfile } from '@/utils/actions'
import { associationPaymentTypes, fetchAssociationPaymentLedgerEntries } from '@/utils/sagi-payment-ledger'
import { fetchAssociationRegistrationSummary } from '@/utils/sagi-registration-summary'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const RegistrationPayments = async () => {
  const profile = await fetchProfile()

  const [registration, ledgerEntries] = await Promise.all([
    fetchAssociationRegistrationSummary(profile.associationCode, { noStore: true }),
    fetchAssociationPaymentLedgerEntries(profile.associationCode, {
      noStore: true,
      paymentType: associationPaymentTypes.registration
    })
  ])

  return (
    <AssociationPaymentPageContent
      associationCode={profile.associationCode}
      kind='registration'
      ledgerEntries={ledgerEntries}
      registration={registration}
    />
  )
}

export default RegistrationPayments
