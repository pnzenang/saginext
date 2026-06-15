import AssociationPaymentPageContent from '@/components/dashboard/AssociationPaymentPageContent'
import { fetchProfile } from '@/utils/actions'
import { fetchAssociationRegistrationSummary } from '@/utils/sagi-registration-summary'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const RegistrationPayments = async () => {
  const profile = await fetchProfile()
  const registration = await fetchAssociationRegistrationSummary(profile.associationCode, { noStore: true })

  return (
    <AssociationPaymentPageContent
      associationCode={profile.associationCode}
      kind='registration'
      registration={registration}
    />
  )
}

export default RegistrationPayments
