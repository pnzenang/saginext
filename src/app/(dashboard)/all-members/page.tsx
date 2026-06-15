import { Card } from '@/components/ui/card'

import MembersDataTable from '@/components/shadcn-studio/blocks/datatable-members'
import { fetchMembers, fetchProfile } from '@/utils/actions'
import { fetchAssociationContributionSummary } from '@/utils/sagi-contribution-summary'
import { fetchAssociationRegistrationSummary } from '@/utils/sagi-registration-summary'
import { memberStatus } from '@/utils/types'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const getMembershipSummary = (members: Awaited<ReturnType<typeof fetchMembers>>) => ({
  awaiting: members.filter(member => member.memberStatus === memberStatus.Awaiting).length,
  delinquent: members.filter(member => member.memberStatus === memberStatus.Delinquent).length,
  pending: members.filter(member => member.memberStatus === memberStatus.Pending).length,
  total: members.length,
  vested: members.filter(member => member.memberStatus === memberStatus.Vested).length
})

const DataTablePreview = async () => {
  const [members, user] = await Promise.all([fetchMembers(), fetchProfile()])

  const [currentContribution, currentRegistrationPayment] = await Promise.all([
    fetchAssociationContributionSummary(user.associationCode, { noStore: true }),
    fetchAssociationRegistrationSummary(user.associationCode, { noStore: true })
  ])

  const membershipSummary = getMembershipSummary(members)

  return (
    <div className='py-8 sm:py-10'>
      <div className='max-w-9xl mx-auto px-2 sm:px-6 lg:px-8'>
        <Card className='max-w-9xl mx-auto w-full py-0'>
          <MembersDataTable
            associationCode={user.associationCode}
            currentContribution={currentContribution}
            currentRegistrationPayment={currentRegistrationPayment}
            data={members}
            membershipSummary={membershipSummary}
          />
        </Card>
      </div>
    </div>
  )
}

export default DataTablePreview
