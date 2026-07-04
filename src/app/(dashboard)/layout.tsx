import type { ReactNode } from 'react'

import { UserButton } from '@clerk/nextjs'
import { auth } from '@clerk/nextjs/server'

import { cookies } from 'next/headers'
import Link from 'next/link'

import { LanguageToggle } from '@/components/global/LanguageToggle'
import SidebarGroupedMenuItems from '@/components/dashboard/SidebarGroupedMenuItems'
import { ModeToggle } from '@/components/layout/mode-toggle/mode-toggle'
import LogoSmall from '@/components/logoSmall'
import { Card, CardContent } from '@/components/ui/card'
import {
  SidebarProvider,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarContent,
  SidebarTrigger,
  Sidebar
} from '@/components/ui/sidebar'
import db from '@/utils/db'
import { dashboardText, languageCookieName, normalizeLanguage, translateDashboardMenuItems } from '@/lib/i18n'
import { pagesItems } from '@/utils/links'

export const dynamic = 'force-dynamic'

const getDashboardAssociationIdentity = async () => {
  const { userId } = await auth()

  if (!userId) return null

  return db.profile.findUnique({
    select: {
      associationCode: true,
      associationName: true
    },
    where: {
      clerkId: userId
    }
  })
}

const PagesLayout = async ({ children }: Readonly<{ children: ReactNode }>) => {
  const [cookieStore, associationIdentity] = await Promise.all([cookies(), getDashboardAssociationIdentity()])
  const language = normalizeLanguage(cookieStore.get(languageCookieName)?.value)
  const translatedPagesItems = translateDashboardMenuItems(pagesItems, language)
  const copy = dashboardText[language]

  return (
    <>
      <div className='bg-muted flex min-h-dvh w-full overflow-x-hidden' lang={language}>
        <SidebarProvider>
          <Sidebar collapsible='icon' className='**:data-[slot=sidebar-inner]:bg-muted border-r-0!'>
            <SidebarHeader>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton size='lg' className='gap-2.5 bg-transparent [&>svg]:size-8' asChild>
                    <Link href='/' className='flex justify-center'>
                      <LogoSmall className='size-18' />
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
              <SidebarGroupedMenuItems data={translatedPagesItems} adminLabel={copy.sidebar.admin} />
            </SidebarContent>
          </Sidebar>
          <div className='flex min-w-0 flex-1 flex-col'>
            <header className='bg-muted sticky top-0 z-50 flex items-center justify-between gap-2 px-2 py-2 sm:gap-6 sm:px-6 sm:py-4'>
              <div className='flex min-w-0 items-center gap-2 sm:gap-4'>
                <SidebarTrigger className='text-primary size-10 font-extrabold md:size-7 [&_svg]:size-6!' />
                <LogoSmall className='size-9 shrink-0 sm:hidden' />
              </div>
              <div className='hidden min-w-0 flex-1 flex-col items-center text-center min-[360px]:flex'>
                <div className='text-primary max-w-full truncate font-bold sm:text-2xl'>{copy.brand}</div>
                {associationIdentity ? (
                  <div className='text-muted-foreground max-w-full truncate text-[11px] font-semibold sm:text-xs'>
                    {associationIdentity.associationCode} - {associationIdentity.associationName}
                  </div>
                ) : null}
              </div>
              <div className='flex shrink-0 items-center justify-center gap-x-2 sm:gap-x-3'>
                <LanguageToggle initialLanguage={language} size='xs' />
                <ModeToggle />

                <UserButton />
              </div>
            </header>
            <main className='size-full min-w-0 flex-1 overflow-x-hidden px-1 py-2 sm:px-6 sm:py-6'>
              <Card className='min-h-full w-full max-w-full min-w-0 overflow-hidden rounded-lg sm:rounded-xl'>
                <CardContent className='h-full min-w-0 px-2 sm:px-6'>
                  <main className='flex w-full min-w-0 flex-1 flex-col *:scroll-mt-20'>{children}</main>
                </CardContent>
              </Card>
            </main>
          </div>
        </SidebarProvider>
      </div>
    </>
  )
}

export default PagesLayout
