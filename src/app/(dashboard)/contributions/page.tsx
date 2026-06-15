import AssociationPaymentPageContent from '@/components/dashboard/AssociationPaymentPageContent'
import { fetchProfile } from '@/utils/actions'
import { fetchAssociationContributionSummary } from '@/utils/sagi-contribution-summary'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const ContributionPayments = async () => {
  const profile = await fetchProfile()
  const contribution = await fetchAssociationContributionSummary(profile.associationCode, { noStore: true })

  return (
    <AssociationPaymentPageContent
      associationCode={profile.associationCode}
      contribution={contribution}
      kind='contribution'
    />
  )
}

export default ContributionPayments
