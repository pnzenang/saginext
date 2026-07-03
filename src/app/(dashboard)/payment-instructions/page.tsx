import { cookies } from 'next/headers'

import PaymentInstructionsContent from '@/components/payment-instructions-content'
import { languageCookieName, normalizeLanguage } from '@/lib/i18n'

const PaymentInstructions = async () => {
  const cookieStore = await cookies()
  const language = normalizeLanguage(cookieStore.get(languageCookieName)?.value)

  return <PaymentInstructionsContent language={language} />
}

export default PaymentInstructions
