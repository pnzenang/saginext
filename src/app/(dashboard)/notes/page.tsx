import IssueNotesPageContent from '@/components/dashboard/IssueNotesPageContent'
import { getDashboardLanguage } from '@/lib/get-dashboard-language'
import { fetchDelegateIssueNotesPageAction } from '@/utils/actions'

const NotesPage = async () => {
  const [language, notesData] = await Promise.all([getDashboardLanguage(), fetchDelegateIssueNotesPageAction()])

  return <IssueNotesPageContent isAdminUser={false} language={language} notes={notesData.notes} />
}

export default NotesPage
