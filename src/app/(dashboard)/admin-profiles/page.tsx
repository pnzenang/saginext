import { auth } from '@clerk/nextjs/server'

import { unstable_noStore as noStore } from 'next/cache'
import { redirect } from 'next/navigation'

import { Building2, Mail, UsersRound } from 'lucide-react'

import AdminProfilesTable, { type AdminProfileRow } from '@/components/dashboard/AdminProfilesTable'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import db from '@/utils/db'

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  day: '2-digit',
  month: 'short',
  year: 'numeric'
})

const numberFormatter = new Intl.NumberFormat('en-US')

const formatDate = (date: Date) => dateFormatter.format(date)

const AdminProfilesPage = async () => {
  noStore()

  const { userId } = await auth()

  if (!userId) redirect('/sign-in')
  if (userId !== process.env.ADMIN_USER_ID) redirect('/all-members')

  const profiles = await db.profile.findMany({
    orderBy: [{ createdAt: 'desc' }, { associationName: 'asc' }],
    select: {
      associationCode: true,
      associationName: true,
      createdAt: true,
      firstDelegateEmail: true,
      firstDelegateFullName: true,
      firstDelegatePhoneNumber: true,
      id: true,
      secondDelegateEmail: true,
      secondDelegateFullName: true,
      secondDelegatePhoneNumber: true,
      thirdDelegateEmail: true,
      thirdDelegateFullName: true,
      thirdDelegatePhoneNumber: true
    }
  })

  const totalProfiles = profiles.length

  const profileRows: AdminProfileRow[] = profiles.map(profile => ({
    associationCode: profile.associationCode,
    associationName: profile.associationName,
    createdAtLabel: formatDate(profile.createdAt),
    firstDelegateEmail: profile.firstDelegateEmail,
    firstDelegateFullName: profile.firstDelegateFullName,
    firstDelegatePhoneNumber: profile.firstDelegatePhoneNumber,
    id: profile.id,
    secondDelegateEmail: profile.secondDelegateEmail,
    secondDelegateFullName: profile.secondDelegateFullName,
    secondDelegatePhoneNumber: profile.secondDelegatePhoneNumber,
    thirdDelegateEmail: profile.thirdDelegateEmail,
    thirdDelegateFullName: profile.thirdDelegateFullName,
    thirdDelegatePhoneNumber: profile.thirdDelegatePhoneNumber
  }))

  const uniqueCodes = new Set(profiles.map(profile => profile.associationCode.trim().toUpperCase()).filter(Boolean))

  const delegateAndBoardMemberEmailCount = profiles
    .flatMap(profile => [profile.firstDelegateEmail, profile.secondDelegateEmail, profile.thirdDelegateEmail])
    .filter(email => email.trim()).length

  const summaryCards = [
    {
      icon: Building2,
      label: 'Delegate Profiles',
      value: totalProfiles
    },
    {
      icon: UsersRound,
      label: 'Association Codes',
      value: uniqueCodes.size
    },
    {
      icon: Mail,
      label: 'Delegate + Board Emails',
      value: delegateAndBoardMemberEmailCount
    }
  ]

  return (
    <section className='py-8 sm:py-10'>
      <div className='max-w-9xl mx-auto w-full space-y-6 px-2 sm:px-6 lg:px-8'>
        <div className='space-y-2'>
          <Badge variant='outline' className='border-primary/40 text-primary bg-background px-3 py-1 text-sm'>
            Admin
          </Badge>
          <div className='space-y-1'>
            <h1 className='text-2xl font-semibold tracking-tight md:text-4xl'>Admin View Delegates</h1>
            <p className='text-muted-foreground max-w-3xl leading-7'>
              View every delegate profile, association code, contact email, and phone number collected in SAGI.
            </p>
          </div>
        </div>

        <div className='grid gap-3 sm:grid-cols-3'>
          {summaryCards.map(card => {
            const Icon = card.icon

            return (
              <Card key={card.label} className='rounded-lg shadow-none'>
                <CardHeader className='flex flex-row items-center justify-between gap-3 pb-2'>
                  <CardTitle className='text-muted-foreground text-sm font-medium'>{card.label}</CardTitle>
                  <Icon className='text-primary size-5' aria-hidden='true' />
                </CardHeader>
                <CardContent>
                  <p className='text-3xl font-semibold'>{numberFormatter.format(card.value)}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <AdminProfilesTable profiles={profileRows} />
      </div>
    </section>
  )
}

export default AdminProfilesPage
