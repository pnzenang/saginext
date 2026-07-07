import { unstable_noStore as noStore } from 'next/cache'

import { Building2, Mail, Phone, UsersRound } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
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

  const profiles = await db.profile.findMany({
    orderBy: [{ associationName: 'asc' }, { createdAt: 'desc' }],
    select: {
      associationCode: true,
      associationName: true,
      createdAt: true,
      firstDelegateEmail: true,
      firstDelegateFullName: true,
      firstDelegatePhoneNumber: true,
      secondDelegateEmail: true,
      secondDelegateFullName: true,
      secondDelegatePhoneNumber: true,
      thirdDelegateEmail: true,
      thirdDelegateFullName: true,
      thirdDelegatePhoneNumber: true
    }
  })

  const totalProfiles = profiles.length
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

        <Card className='rounded-lg shadow-none'>
          <CardContent className='p-0'>
            {profiles.length > 0 ? (
              <>
                <div className='hidden md:block'>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Association</TableHead>
                        <TableHead>Code</TableHead>
                        <TableHead>Primary Delegate</TableHead>
                        <TableHead>Second Delegate</TableHead>
                        <TableHead>Board Member</TableHead>
                        <TableHead>Created</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {profiles.map(profile => (
                        <TableRow key={profile.associationCode}>
                          <TableCell className='min-w-64'>
                            <div className='space-y-1'>
                              <p className='font-medium whitespace-normal'>{profile.associationName}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant='outline' className='rounded-md font-mono'>
                              {profile.associationCode}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <DelegateContact
                              email={profile.firstDelegateEmail}
                              name={profile.firstDelegateFullName}
                              phone={profile.firstDelegatePhoneNumber}
                            />
                          </TableCell>
                          <TableCell>
                            <DelegateContact
                              email={profile.secondDelegateEmail}
                              name={profile.secondDelegateFullName}
                              phone={profile.secondDelegatePhoneNumber}
                            />
                          </TableCell>
                          <TableCell>
                            <DelegateContact
                              email={profile.thirdDelegateEmail}
                              name={profile.thirdDelegateFullName}
                              phone={profile.thirdDelegatePhoneNumber}
                            />
                          </TableCell>
                          <TableCell>{formatDate(profile.createdAt)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div className='grid gap-3 p-3 md:hidden'>
                  {profiles.map(profile => (
                    <Card key={profile.associationCode} className='rounded-lg shadow-none'>
                      <CardContent className='space-y-4'>
                        <div className='space-y-2'>
                          <div className='flex flex-wrap items-start justify-between gap-2'>
                            <h2 className='text-lg font-semibold'>{profile.associationName}</h2>
                            <Badge variant='outline' className='rounded-md font-mono'>
                              {profile.associationCode}
                            </Badge>
                          </div>
                          <p className='text-muted-foreground text-xs'>Created {formatDate(profile.createdAt)}</p>
                        </div>
                        <div className='space-y-3'>
                          <MobileDelegateContact
                            email={profile.firstDelegateEmail}
                            label='Primary Delegate'
                            name={profile.firstDelegateFullName}
                            phone={profile.firstDelegatePhoneNumber}
                          />
                          <MobileDelegateContact
                            email={profile.secondDelegateEmail}
                            label='Second Delegate'
                            name={profile.secondDelegateFullName}
                            phone={profile.secondDelegatePhoneNumber}
                          />
                          <MobileDelegateContact
                            email={profile.thirdDelegateEmail}
                            label='Board Member'
                            name={profile.thirdDelegateFullName}
                            phone={profile.thirdDelegatePhoneNumber}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            ) : (
              <div className='flex min-h-72 items-center justify-center p-6 text-center'>
                <div className='max-w-md space-y-2'>
                  <Building2 className='text-muted-foreground mx-auto size-10' aria-hidden='true' />
                  <h2 className='text-xl font-semibold'>No profiles collected yet.</h2>
                  <p className='text-muted-foreground leading-7'>
                    Profiles will appear here after delegates create their association profile.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  )
}

function DelegateContact({ email, name, phone }: { email: string; name: string; phone: string }) {
  return (
    <div className='min-w-56 space-y-1'>
      <p className='font-medium whitespace-normal'>{name}</p>
      <a className='text-primary block text-sm hover:underline' href={`mailto:${email}`}>
        {email}
      </a>
      <a className='text-muted-foreground block text-sm hover:underline' href={`tel:${phone}`}>
        {phone}
      </a>
    </div>
  )
}

function MobileDelegateContact({
  email,
  label,
  name,
  phone
}: {
  email: string
  label: string
  name: string
  phone: string
}) {
  return (
    <div className='rounded-lg border p-3'>
      <p className='text-muted-foreground mb-1 text-xs font-medium uppercase'>{label}</p>
      <p className='font-medium'>{name}</p>
      <div className='mt-2 space-y-1'>
        <a className='text-primary flex items-center gap-2 text-sm hover:underline' href={`mailto:${email}`}>
          <Mail className='size-4 shrink-0' aria-hidden='true' />
          <span className='break-all'>{email}</span>
        </a>
        <a className='text-muted-foreground flex items-center gap-2 text-sm hover:underline' href={`tel:${phone}`}>
          <Phone className='size-4 shrink-0' aria-hidden='true' />
          <span>{phone}</span>
        </a>
      </div>
    </div>
  )
}

export default AdminProfilesPage
