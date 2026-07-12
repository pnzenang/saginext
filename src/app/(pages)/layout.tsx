import type { ReactNode } from 'react'

import { cookies } from 'next/headers'

import FloatingWhatsAppLink from '@/components/global/FloatingWhatsAppLink'
import Header from '@/components/layout/header'
import Footer from '@/components/layout/footer/footer'

import { navigationData } from '@/assets/data/header'
import { languageCookieName, normalizeLanguage } from '@/lib/i18n'

const PagesLayout = async ({ children }: Readonly<{ children: ReactNode }>) => {
  const cookieStore = await cookies()
  const language = normalizeLanguage(cookieStore.get(languageCookieName)?.value)

  return (
    <>
      <div className='flex h-full w-full min-w-0 flex-col'>
        {/* Header Section */}
        <Header navigationData={navigationData} language={language} />

        {/* Main Content */}
        <main className='flex flex-1 flex-col *:scroll-mt-20'>{children}</main>

        {/* Footer Section */}
        <Footer />

        <FloatingWhatsAppLink initialLanguage={language} />
      </div>
    </>
  )
}

export default PagesLayout
