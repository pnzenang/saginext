import PaymentInstructionsContent from '@/components/payment-instructions-content'
import { getDashboardLanguage } from '@/lib/get-dashboard-language'
import { fetchProfile } from '@/utils/actions'

const PaymentInstructions = async () => {
  const [language, profile] = await Promise.all([getDashboardLanguage(), fetchProfile()])

  return <PaymentInstructionsContent associationCode={profile.associationCode} language={language} />
}

export default PaymentInstructions
