import type { ReactNode } from 'react'

import Header from '@/components/layout/header'
import Footer from '@/components/layout/footer/footer'

import { navigationData } from '@/assets/data/header'

const PagesLayout = ({ children }: Readonly<{ children: ReactNode }>) => {
  return (
    <>
      <div className='flex h-full w-full min-w-0 flex-col'>
        {/* Header Section */}
        <Header navigationData={navigationData} />

        {/* Main Content */}
        <main className='flex flex-1 flex-col *:scroll-mt-20'>{children}</main>

        {/* Footer Section */}
        <Footer />
      </div>
    </>
  )
}

export default PagesLayout
