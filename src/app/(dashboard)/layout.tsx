import type { ReactNode } from 'react'

import { UserButton, ClerkProvider } from '@clerk/nextjs'

import Link from 'next/link'

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
import { pagesItems } from '@/utils/links'

const PagesLayout = ({ children }: Readonly<{ children: ReactNode }>) => {
  return (
    <>
      <div className='bg-muted flex min-h-dvh w-full overflow-x-hidden'>
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
              <SidebarGroupedMenuItems data={pagesItems} />
            </SidebarContent>
          </Sidebar>
          <div className='flex min-w-0 flex-1 flex-col'>
            <header className='bg-muted sticky top-0 z-50 flex items-center justify-between gap-2 px-2 py-2 sm:gap-6 sm:px-6 sm:py-4'>
              <div className='flex min-w-0 items-center gap-2 sm:gap-4'>
                <SidebarTrigger className='text-primary size-10 font-extrabold md:size-7 [&_svg]:size-6!' />
                <LogoSmall className='size-9 shrink-0 sm:hidden' />
              </div>
              <div className='text-primary hidden min-w-0 truncate font-bold min-[360px]:block sm:text-2xl'>
                SAGI-USA
              </div>
              <div className='flex shrink-0 items-center justify-center gap-x-2 sm:gap-x-3'>
                <ModeToggle />

                <ClerkProvider>
                  <UserButton />
                </ClerkProvider>
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
