import Link from 'next/link'
import { notFound } from 'next/navigation'

import { ArrowLeft, Eye, Mail, Phone } from 'lucide-react'

import DelegatePaymentSummaryCards from '@/components/dashboard/DelegatePaymentSummaryCards'
import MembersDataTable from '@/components/shadcn-studio/blocks/datatable-members-client'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { fetchAdminDelegateDashboardPreviewAction } from '@/utils/actions'

export const dynamic = 'force-dynamic'
export const revalidate = 0

type AdminDelegateViewPageProps = {
  params: Promise<{
    associationCode: string
  }>
}

type AdminDelegatePreview = NonNullable<Awaited<ReturnType<typeof fetchAdminDelegateDashboardPreviewAction>>>

const getDelegateContacts = (delegate: AdminDelegatePreview['delegate']) =>
  [
    {
      email: delegate.firstDelegateEmail,
      name: delegate.firstDelegateFullName,
      phone: delegate.firstDelegatePhoneNumber
    },
    {
      email: delegate.secondDelegateEmail,
      name: delegate.secondDelegateFullName,
      phone: delegate.secondDelegatePhoneNumber
    },
    {
      email: delegate.thirdDelegateEmail,
      name: delegate.thirdDelegateFullName,
      phone: delegate.thirdDelegatePhoneNumber
    }
  ].filter(contact => contact.name || contact.email || contact.phone)

const AdminDelegateViewPage = async ({ params }: AdminDelegateViewPageProps) => {
  const { associationCode } = await params
  const preview = await fetchAdminDelegateDashboardPreviewAction(decodeURIComponent(associationCode))

  if (!preview) {
    notFound()
  }

  const delegateContacts = getDelegateContacts(preview.delegate)

  return (
    <section className='max-w-full min-w-0 space-y-5 py-4 sm:py-10'>
      <div className='flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between'>
        <div className='min-w-0'>
          <Button asChild variant='ghost' size='sm' className='mb-2 w-fit px-0 hover:bg-transparent'>
            <Link href='/admin-count'>
              <ArrowLeft aria-hidden='true' />
              Admin Count
            </Link>
          </Button>
          <div className='flex min-w-0 flex-wrap items-center gap-2'>
            <h1 className='text-2xl font-extrabold tracking-normal sm:text-3xl'>Delegate dashboard preview</h1>
            <Badge variant='secondary' className='rounded-md font-mono'>
              {preview.delegate.associationCode}
            </Badge>
          </div>
          <p className='text-muted-foreground mt-1 text-sm'>
            Viewing the delegate-facing members page for {preview.delegate.associationName}.
          </p>
        </div>
        <Badge variant='outline' className='w-fit rounded-md text-sm'>
          <Eye aria-hidden='true' />
          Read-only admin view
        </Badge>
      </div>

      {delegateContacts.length > 0 ? (
        <div className='grid gap-3 md:grid-cols-3'>
          {delegateContacts.map((contact, index) => (
            <Card key={`${contact.email}-${contact.phone}-${index}`} className='gap-2 p-4'>
              <p className='font-semibold break-words'>{contact.name || `Delegate ${index + 1}`}</p>
              {contact.email ? (
                <a
                  href={`mailto:${contact.email}`}
                  className='text-muted-foreground hover:text-primary flex min-w-0 items-center gap-2 text-sm underline-offset-4 hover:underline'
                >
                  <Mail className='size-4 shrink-0' aria-hidden='true' />
                  <span className='min-w-0 break-words'>{contact.email}</span>
                </a>
              ) : null}
              {contact.phone ? (
                <a
                  href={`tel:${contact.phone}`}
                  className='text-muted-foreground hover:text-primary flex min-w-0 items-center gap-2 text-sm underline-offset-4 hover:underline'
                >
                  <Phone className='size-4 shrink-0' aria-hidden='true' />
                  <span className='min-w-0 break-words'>{contact.phone}</span>
                </a>
              ) : null}
            </Card>
          ))}
        </div>
      ) : null}

      <DelegatePaymentSummaryCards
        contribution={preview.currentContribution}
        registration={preview.currentRegistrationPayment}
      />

      <div className='max-w-9xl mx-auto max-w-full min-w-0 px-0 sm:px-6 lg:px-8'>
        <Card className='max-w-9xl mx-auto max-w-full min-w-0 overflow-hidden py-0'>
          <MembersDataTable
            currentContribution={preview.currentContribution}
            currentRegistrationPayment={preview.currentRegistrationPayment}
            data={preview.members}
            readOnly
          />
        </Card>
      </div>
    </section>
  )
}

export default AdminDelegateViewPage
