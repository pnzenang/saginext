import PaymentTypeSelector from './PaymentTypeSelector'
import { fetchProfile } from '@/utils/actions'
import { fetchContributionPaymentCodeCents } from '@/utils/contribution-payment-code-records'
import { fetchAssociationContributionSummary } from '@/utils/sagi-contribution-summary'
import { fetchAssociationRegistrationSummary, registrationFeePerEligibleMember } from '@/utils/sagi-registration-summary'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const ContributionPayments = async () => {
  const profile = await fetchProfile()

  const [contribution, registration, contributionPaymentCodeCents] = await Promise.all([
    fetchAssociationContributionSummary(profile.associationCode, { noStore: true }),
    fetchAssociationRegistrationSummary(profile.associationCode, { noStore: true }),
    fetchContributionPaymentCodeCents(profile.associationCode)
  ])

  return (
    <main className='flex min-h-[calc(100vh-8rem)] w-full items-center justify-center'>
      <PaymentTypeSelector
        contributionAmountOwed={contribution.amountOwed}
        contributionAmountPerVestedMember={contribution.amountPerVestedMember}
        contributionPaymentCodeCents={contributionPaymentCodeCents}
        contributionVestedMemberCount={contribution.vestedMembersCount}
        pendingRegistrationMemberCount={registration.pendingMemberNames.length}
        registrationFeePerMember={registrationFeePerEligibleMember}
      />
    </main>
  )
}

export default ContributionPayments
