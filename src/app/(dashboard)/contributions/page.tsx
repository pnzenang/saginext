import AssociationPaymentPageContent from '@/components/dashboard/AssociationPaymentPageContent'
import { getDashboardLanguage } from '@/lib/get-dashboard-language'
import { fetchProfile } from '@/utils/actions'
import { fetchAssociationContributionSummary } from '@/utils/sagi-contribution-summary'
import { associationPaymentTypes, fetchAssociationPaymentLedgerEntries } from '@/utils/sagi-payment-ledger'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const ContributionPayments = async () => {
  const [language, profile] = await Promise.all([getDashboardLanguage(), fetchProfile()])

  const [contribution, ledgerEntries] = await Promise.all([
    fetchAssociationContributionSummary(profile.associationCode, { noStore: true }),
    fetchAssociationPaymentLedgerEntries(profile.associationCode, {
      noStore: true,
      paymentType: associationPaymentTypes.contribution
    })
  ])

  return (
    <AssociationPaymentPageContent
      associationCode={profile.associationCode}
      contribution={contribution}
      kind='contribution'
      language={language}
      ledgerEntries={ledgerEntries}
    />
  )
}

export default ContributionPayments
