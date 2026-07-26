import IssueNotesPageContent from '@/components/dashboard/IssueNotesPageContent'
import { getDashboardLanguage } from '@/lib/get-dashboard-language'
import { fetchAdminIssueNotesPageAction } from '@/utils/actions'

const AdminNotesPage = async () => {
  const [language, notesData] = await Promise.all([getDashboardLanguage(), fetchAdminIssueNotesPageAction()])

  return (
    <IssueNotesPageContent
      associations={notesData.associations}
      isAdminUser
      language={language}
      notes={notesData.notes}
    />
  )
}

export default AdminNotesPage
