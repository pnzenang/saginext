import type { ReactNode } from 'react'

import { UserButton } from '@clerk/nextjs'
import { auth } from '@clerk/nextjs/server'

import { cookies, headers } from 'next/headers'
import Link from 'next/link'
import { redirect } from 'next/navigation'

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
import { getPagesItems } from '@/utils/links'
import { contributionPaymentAlertType, registrationPaymentAlertType } from '@/utils/payment-constants'

export const dynamic = 'force-dynamic'

const defaultPaymentAlertResetAt = new Date(0)

const getDashboardAssociationIdentity = async (userId?: string | null) => {
  if (!userId) return null

  return db.profile.findUnique({
    select: {
      associationCode: true,
      associationName: true,
      internalRulesAcceptedAt: true
    },
    where: {
      clerkId: userId
    }
  })
}

const getPaymentAlertResetAt = async (alertType: string) => {
  const alertReset = await db.paymentAlertReset.findUnique({
    select: {
      resetAt: true
    },
    where: {
      alertType
    }
  })

  return alertReset?.resetAt ?? defaultPaymentAlertResetAt
}

const getContributionPaymentAlertCount = async () => {
  const resetAt = await getPaymentAlertResetAt(contributionPaymentAlertType)

  const payments = await db.associationContributionPayment.findMany({
    select: {
      amountSent: true,
      amountVerified: true,
      lastSubmittedAt: true
    },
    where: {
      lastSubmittedAt: {
        gt: resetAt
      }
    }
  })

  return payments.filter(payment => Number(payment.amountSent ?? 0) - Number(payment.amountVerified ?? 0) > 0).length
}

const getRegistrationPaymentAlertCount = async () => {
  const resetAt = await getPaymentAlertResetAt(registrationPaymentAlertType)

  return db.associationRegistrationPayment.count({
    where: {
      amountSent: {
        gt: 0
      },
      lastSubmittedAt: {
        gt: resetAt
      }
    }
  })
}

type DashboardSidebarActionCounts = Record<string, number>

const getDashboardSidebarActionCounts = async (userId?: string | null): Promise<DashboardSidebarActionCounts> => {
  if (!userId) return {}

  const isAdminUser = userId === process.env.ADMIN_USER_ID

  const [nameChangeDocumentationCount, memberTransferCount, adminCounts] = await Promise.all([
    db.nameChangeRequest.count({
      where: {
        clerkId: userId,
        status: 'documentation_requested'
      }
    }),
    db.memberTransferRequest.count({
      where: {
        OR: [
          {
            initiatingClerkId: userId,
            status: {
              in: ['admin_initiated', 'receiving_delegate_pending']
            }
          },
          {
            receivingClerkId: userId,
            status: 'initiating_delegate_approved'
          }
        ]
      }
    }),
    isAdminUser
      ? Promise.all([
          db.nameChangeRequest.count({
            where: {
              status: 'submitted'
            }
          }),
          db.memberTransferRequest.count({
            where: {
              status: 'receiving_delegate_approved'
            }
          }),
          getContributionPaymentAlertCount(),
          getRegistrationPaymentAlertCount()
        ])
      : Promise.resolve<[number, number, number, number]>([0, 0, 0, 0])
  ])

  const [adminNameChangeCount, adminMemberTransferCount, adminContributionPaymentCount, adminRegistrationPaymentCount] =
    adminCounts

  return {
    '/admin-contribution-payments': adminContributionPaymentCount,
    '/admin-member-transfers': adminMemberTransferCount,
    '/admin-name-changes': adminNameChangeCount,
    '/admin-registration-payments': adminRegistrationPaymentCount,
    '/member-transfer': memberTransferCount,
    '/name-modification': nameChangeDocumentationCount
  } satisfies DashboardSidebarActionCounts
}

const addSidebarActionCounts = (items: ReturnType<typeof getPagesItems>, actionCounts: DashboardSidebarActionCounts) =>
  items.map(item => ({
    ...item,
    alertCount: actionCounts[item.href] ?? 0
  }))

const internalRulesAcknowledgementAllowedPaths = new Set(['/internal-rules', '/profile/create'])

const PagesLayout = async ({ children }: Readonly<{ children: ReactNode }>) => {
  const [cookieStore, headerStore, authData] = await Promise.all([cookies(), headers(), auth()])

  const [associationIdentity, sidebarActionCounts] = await Promise.all([
    getDashboardAssociationIdentity(authData.userId),
    getDashboardSidebarActionCounts(authData.userId)
  ])

  const language = normalizeLanguage(cookieStore.get(languageCookieName)?.value)
  const pathname = headerStore.get('x-pathname') ?? ''

  if (
    associationIdentity &&
    !associationIdentity.internalRulesAcceptedAt &&
    !internalRulesAcknowledgementAllowedPaths.has(pathname)
  ) {
    redirect('/internal-rules')
  }

  const translatedPagesItems = translateDashboardMenuItems(
    addSidebarActionCounts(getPagesItems(), sidebarActionCounts),
    language
  )

  const copy = dashboardText[language]

  return (
    <>
      <div
        data-dashboard-shell
        className='bg-muted flex min-h-dvh w-full overflow-x-hidden print:block print:min-h-0 print:overflow-visible print:bg-white'
        lang={language}
      >
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
            <header
              data-dashboard-header
              className='bg-muted sticky top-0 z-50 flex items-center justify-between gap-2 px-2 py-2 sm:gap-6 sm:px-6 sm:py-4 print:hidden'
            >
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
            <main
              data-dashboard-main
              className='size-full min-w-0 flex-1 overflow-x-hidden px-1 py-2 sm:px-6 sm:py-6 print:block print:overflow-visible print:p-0'
            >
              <Card
                data-dashboard-frame
                className='min-h-full w-full max-w-full min-w-0 overflow-hidden rounded-lg sm:rounded-xl print:min-h-0 print:overflow-visible print:rounded-none print:border-0 print:p-0 print:shadow-none'
              >
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
