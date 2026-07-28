import DeathDocumentationsContent from '../death-documentations/DeathDocumentationsContent'

import { fetchAdminDeathDocumentationCasesAction } from '@/utils/actions'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const AdminDeathDocumentationsPage = async () => {
  const { currentUserId, deceasedMembers } = await fetchAdminDeathDocumentationCasesAction()

  return (
    <DeathDocumentationsContent
      currentUserId={currentUserId}
      deceasedMembers={deceasedMembers}
      description='Review, approve, reject, and manage death documentation cases submitted by all delegate associations.'
      emptyDescription='All delegate death documentation cases will appear here after death announcements are submitted.'
      emptyTitle='No death documentation cases found.'
      isAdminUser
      title='Admin Death Documentation'
    />
  )
}

export default AdminDeathDocumentationsPage
