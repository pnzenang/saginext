import Image from 'next/image'
import Link from 'next/link'
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Ellipsis,
  FileDown,
  Search,
  Table2,
  UserCheck,
  Users
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const tableColumns = [
  'Code: the association or group code connected to the member.',
  'Matriculation: the official member number after admin processing. New pending members may not have this yet.',
  'Last and Middle Names: the name entered in the Add Member form.',
  'First Name: the member first name or names.',
  'Longevity: the number of days since the member was created in the system.',
  'Recommendation: the delegate recommendation, such as confirm or transfer.',
  'Status: shows whether the member is pending, vested, awaiting publication, or not in good standing.',
  'Actions: the three-dot menu used to edit, announce death, or remove a member when allowed.'
]

const processSteps = [
  {
    icon: UserCheck,
    title: 'Submit the member',
    description:
      'After using Add Member, the member record is created in SAGI and becomes connected to your group profile.'
  },
  {
    icon: Users,
    title: 'Open All Members',
    description:
      'Click All Members in the sidebar. This page is where your active and pending member records are listed.'
  },
  {
    icon: Search,
    title: 'Find the new member',
    description:
      'Use the filters for code, last name, first name, recommendation, or status if the table has many members.'
  },
  {
    icon: Clock,
    title: 'Watch the status',
    description:
      'New registrations normally show as pending until the registration payment and admin review are completed.'
  }
]

const statusExplanations = [
  {
    title: 'Pending',
    description:
      'This usually means the member has been added, but the registration is not fully complete. The admin may still need the registration fee, payment record, or review time.'
  },
  {
    title: 'Vested',
    description:
      'This means the member has completed the required process and is recognized as an active/vested member in the program.'
  },
  {
    title: 'Awaiting publication',
    description:
      'This means the member is in a later review or publication stage. Continue checking the table for updates.'
  },
  {
    title: 'Not in good standing',
    description:
      'This means there is an issue with the member standing. Review payments, contribution status, or contact the admin for clarification.'
  }
]

const afterRegistrationChecklist = [
  'Check that the member appears on the All Members page after submitting the Add Member form.',
  'Confirm the spelling of the last and middle names, first names, and beneficiary information.',
  'Confirm the association code matches your group.',
  'Look at the status column. New members should normally begin as pending.',
  'Record the registration payment if it has not already been recorded.',
  'Keep checking the table until the member status changes after admin review.'
]

const tableTools = [
  {
    icon: Search,
    title: 'Filters',
    description:
      'Use the filter boxes above the table to search by association code, last and middle names, first name, recommendation, or status.'
  },
  {
    icon: FileDown,
    title: 'Export',
    description:
      'Use Export when you need a copy of your member list for your group records. This helps delegates reconcile who is pending or vested.'
  },
  {
    icon: Ellipsis,
    title: 'Three-dot menu',
    description:
      'Use the action menu at the end of a member row to edit details, announce a death, or remove a member when that action applies.'
  }
]

const SeeingAllMembers = () => {
  return (
    <section className='max-w-9xl mx-auto flex w-full flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8'>
      <div className='grid gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-center'>
        <div className='bg-card flex flex-col justify-center rounded-lg border p-6 shadow-sm sm:p-8'>
          <Badge className='mb-4 w-fit' variant='secondary'>
            All Members Instructions
          </Badge>
          <h1 className='text-foreground max-w-3xl text-3xl font-semibold tracking-normal sm:text-4xl'>
            Where to see members after registration
          </h1>
          <p className='text-muted-foreground mt-4 max-w-3xl text-base leading-7'>
            After you add or register a member, the next place to check is the All Members page. This page shows the
            members connected to your group, including new members who are still pending and members who have already
            been processed.
          </p>
          <p className='text-muted-foreground mt-3 max-w-3xl text-base leading-7'>
            Seeing a member in the table does not always mean the registration is complete. The status column tells you
            where the member is in the process, and the payment record helps the admin team complete the registration.
          </p>
          <div className='mt-6 flex flex-col gap-3 sm:flex-row'>
            <Button asChild>
              <Link href='/all-members'>
                Open All Members
                <ArrowRight className='size-4' />
              </Link>
            </Button>
            <Button asChild variant='outline'>
              <Link href='/add-member'>Add Member</Link>
            </Button>
          </div>
        </div>

        <Card className='overflow-hidden'>
          <CardHeader>
            <CardTitle>All Members Table</CardTitle>
            <CardDescription>This is where newly added members should appear after submission.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='bg-background overflow-hidden rounded-lg border'>
              <Image
                alt='Preview of the SAGI All Members table'
                className='h-auto w-full'
                height={640}
                priority
                src='/images/all-members-table-preview.svg'
                width={1120}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-4'>
        {processSteps.map((step, index) => {
          const Icon = step.icon

          return (
            <Card key={step.title}>
              <CardHeader>
                <div className='bg-primary/10 text-primary mb-3 flex size-11 items-center justify-center rounded-md'>
                  <Icon className='size-5' />
                </div>
                <CardDescription>Step {index + 1}</CardDescription>
                <CardTitle className='text-lg'>{step.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className='text-muted-foreground text-sm leading-6'>{step.description}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Table2 className='text-primary size-5' />
            What the Table Shows
          </CardTitle>
          <CardDescription>Use these columns to confirm that the member was added correctly.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className='grid gap-3 sm:grid-cols-2'>
            {tableColumns.map(column => (
              <li className='text-muted-foreground flex gap-3 text-sm leading-6' key={column}>
                <CheckCircle2 className='text-primary mt-0.5 size-5 shrink-0' />
                <span>{column}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <div className='grid gap-4 lg:grid-cols-2'>
        <Card>
          <CardHeader>
            <CardTitle>After Registering a Member</CardTitle>
            <CardDescription>Follow this checklist when a new member is submitted.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className='grid gap-3'>
              {afterRegistrationChecklist.map(item => (
                <li className='text-muted-foreground flex gap-3 text-sm leading-6' key={item}>
                  <CheckCircle2 className='text-primary mt-0.5 size-5 shrink-0' />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <AlertCircle className='text-primary size-5' />
              If You Do Not See the Member
            </CardTitle>
            <CardDescription>Try these checks before adding the same member again.</CardDescription>
          </CardHeader>
          <CardContent className='text-muted-foreground space-y-3 text-sm leading-6'>
            <p>
              First, clear or change any filters on the All Members table. A member may be hidden because the table is
              filtered by name, code, recommendation, or status.
            </p>
            <p>
              Next, search by last name and first name separately. If the name was entered with a spelling difference,
              one filter may find the record even when another does not.
            </p>
            <p>
              If the member still does not appear, confirm that the Add Member form was submitted successfully. Avoid
              creating a duplicate record until you are sure the original submission did not go through.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className='grid gap-4 md:grid-cols-3'>
        {tableTools.map(tool => {
          const Icon = tool.icon

          return (
            <Card key={tool.title}>
              <CardHeader>
                <div className='bg-primary/10 text-primary mb-3 flex size-11 items-center justify-center rounded-md'>
                  <Icon className='size-5' />
                </div>
                <CardTitle className='text-lg'>{tool.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className='text-muted-foreground text-sm leading-6'>{tool.description}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Understanding Member Status</CardTitle>
          <CardDescription>The status column is the quickest way to know where the registration stands.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='grid gap-4 md:grid-cols-2'>
            {statusExplanations.map(status => (
              <div className='rounded-lg border p-4' key={status.title}>
                <h2 className='text-foreground text-base font-semibold'>{status.title}</h2>
                <p className='text-muted-foreground mt-2 text-sm leading-6'>{status.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </section>
  )
}

export default SeeingAllMembers
