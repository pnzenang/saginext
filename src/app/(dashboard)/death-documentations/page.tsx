import DeathDocumentationsContent from './DeathDocumentationsContent'

import { fetchDelegateDeathDocumentationCasesAction } from '@/utils/actions'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const DeathDocumentationsPage = async () => {
  const { currentUserId, deceasedMembers } = await fetchDelegateDeathDocumentationCasesAction()

  return (
    <DeathDocumentationsContent
      currentUserId={currentUserId}
      deceasedMembers={deceasedMembers}
      description='Upload the required documents for death announcements submitted by your delegate association.'
      emptyDescription='Your death documentation will appear here after you submit a death announcement.'
      emptyTitle='No death announcements found.'
      isAdminUser={false}
      title='Death Documentations'
    />
  )
}

export default DeathDocumentationsPage
