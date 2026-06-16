import { Card } from '@/components/ui/card'

import MembersDataTable from '@/components/shadcn-studio/blocks/datatable-members'
import { fetchMembers, fetchProfile } from '@/utils/actions'
import { fetchAssociationContributionSummary } from '@/utils/sagi-contribution-summary'
import { fetchAssociationRegistrationSummary } from '@/utils/sagi-registration-summary'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const DataTablePreview = async () => {
  const [members, profile] = await Promise.all([fetchMembers(), fetchProfile()])

  const [currentContribution, currentRegistrationPayment] = await Promise.all([
    fetchAssociationContributionSummary(profile.associationCode, { noStore: true }),
    fetchAssociationRegistrationSummary(profile.associationCode, { noStore: true })
  ])

  return (
    <div className='py-8 sm:py-10'>
      <div className='max-w-9xl mx-auto px-2 sm:px-6 lg:px-8'>
        <Card className='max-w-9xl mx-auto w-full py-0'>
          <MembersDataTable
            currentContribution={currentContribution}
            currentRegistrationPayment={currentRegistrationPayment}
            data={members}
          />
        </Card>
      </div>
    </div>
  )
}

export default DataTablePreview
