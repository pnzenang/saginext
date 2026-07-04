import { cookies } from 'next/headers'

import { languageCookieName, normalizeLanguage } from '@/lib/i18n'

export const getDashboardLanguage = async () => {
  const cookieStore = await cookies()

  return normalizeLanguage(cookieStore.get(languageCookieName)?.value)
}
