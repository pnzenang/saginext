import Image from 'next/image'
import Link from 'next/link'
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  Cross,
  Ellipsis,
  FileSearch,
  HeartHandshake,
  ListChecks,
  ShieldCheck,
  UserCheck,
  Users
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const announcementSteps = [
  {
    icon: Users,
    title: 'Open All Members',
    description:
      'Start from the All Members page because the death announcement must be made from the active member record.'
  },
  {
    icon: FileSearch,
    title: 'Find the member',
    description:
      'Use the table filters to search by name, code, matriculation, recommendation, or status before opening the action menu.'
  },
  {
    icon: Ellipsis,
    title: 'Choose death announcement',
    description: 'Click the three-dot menu at the end of the member row and choose the death announcement option.'
  },
  {
    icon: ClipboardCheck,
    title: 'Submit the announcement',
    description:
      'Review the read-only member details, enter place of death and date of death, then post the announcement.'
  }
]

const eligibilityItems = [
  'Only vested members can be announced deceased from the user death-announcement form.',
  'If the member is pending, awaiting publication, or not in good standing, the form will show a stop message.',
  'If the button is missing, return to All Members and confirm the member status before contacting the admin.',
  'Do not create a duplicate member record to work around the vested-member rule.'
]

const formFields = [
  'Last and middle names: read-only field used to confirm the correct member.',
  'First names: read-only field used to confirm the member identity.',
  'Matriculation: the official member number tied to the deceased member.',
  'Registration date: shows when the member originally entered SAGI.',
  'Country of residence: another identity check before submitting.',
  'Name of beneficiary: confirms who is recorded as the beneficiary.',
  'Association name: confirms the member belongs to the correct group.',
  'Place of death: enter the state or place where the death occurred.',
  'Date of death: enter the date in MM/DD/YYYY format.',
  'Contribution status: starts as Case_In_Review so the case can be reviewed.'
]

const afterSubmissionItems = [
  'The member is removed from the active All Members list.',
  'A deceased-member record is created and shown on the Deceased Members page.',
  'The app redirects to Deceased Members after the announcement is submitted.',
  'The deceased-member table shows name, matriculation, group, place of death, date of death, date announced, and contribution status.',
  'The contribution status begins as Case_In_Review while the case is being handled.',
  'Documents are handled separately through Death Documentation when documentation becomes available.'
]

const beforeSubmittingItems = [
  'Confirm that the family or group has verified the death information.',
  'Confirm you selected the correct member from All Members.',
  'Check spelling and identity details before entering the death information.',
  'Enter the date of death carefully in MM/DD/YYYY format.',
  'Enter a clear place of death, such as the state or city/state available to you.',
  'Remember that posting the death is not reversible from this page.'
]

const DeathAnnouncement = () => {
  return (
    <section className='flex w-full max-w-full min-w-0 flex-col gap-6 px-3 py-4 sm:px-6 sm:py-6 lg:px-8'>
      <div className='grid gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-center'>
        <div className='bg-card flex flex-col justify-center rounded-lg border p-6 shadow-sm sm:p-8'>
          <Badge className='mb-4 w-fit border-purple-200 bg-purple-50 text-purple-700' variant='outline'>
            Death Announcement Instructions
          </Badge>
          <h1 className='text-foreground max-w-3xl text-3xl font-semibold tracking-normal sm:text-4xl'>
            How to announce the death of a member
          </h1>
          <p className='text-muted-foreground mt-4 max-w-3xl text-base leading-7'>
            The death announcement process is used when a SAGI member has passed away and the group needs to move that
            person from the active member list to the deceased-member records.
          </p>
          <p className='text-muted-foreground mt-3 max-w-3xl text-base leading-7'>
            This action should be handled with care. Once submitted, the active member record is deleted from All
            Members, a deceased-member record is created, and the case begins in review.
          </p>
          <div className='mt-6 flex flex-col gap-3 sm:flex-row'>
            <Button asChild>
              <Link href='/all-members'>
                Start From All Members
                <ArrowRight className='size-4' />
              </Link>
            </Button>
            <Button asChild variant='outline'>
              <Link href='/deceased-members'>View Deceased Members</Link>
            </Button>
          </div>
        </div>

        <Card className='overflow-hidden'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Cross className='size-5 text-purple-600' />
              Death Announcement Form
            </CardTitle>
            <CardDescription>This is the form users complete after selecting a member.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='bg-background overflow-hidden rounded-lg border'>
              <Image
                alt='Preview of the SAGI death announcement form'
                className='h-auto w-full'
                height={680}
                priority
                src='/images/death-announcement-form-preview.svg'
                width={1120}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className='border-purple-200 bg-purple-50/50'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2 text-purple-700'>
            <HeartHandshake className='size-5' />
            Important Note
          </CardTitle>
          <CardDescription className='text-purple-700/80'>
            The announcement records the death first. Documentation can come later.
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-3 text-sm leading-6 text-purple-900'>
          <p>
            You do not need to upload death documentation to make the initial announcement. The death announcement page
            records the death and moves the member into the deceased-member list.
          </p>
          <p>
            When documents become available, use Death Documentation to upload them through the appropriate
            documentation process.
          </p>
        </CardContent>
      </Card>

      <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-4'>
        {announcementSteps.map((step, index) => {
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

      <div className='grid gap-4 lg:grid-cols-2'>
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <ShieldCheck className='text-primary size-5' />
              Who Can Be Announced
            </CardTitle>
            <CardDescription>The app checks member status before allowing submission.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className='grid gap-3'>
              {eligibilityItems.map(item => (
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
              <AlertTriangle className='text-primary size-5' />
              Before You Submit
            </CardTitle>
            <CardDescription>Use this checklist to avoid posting the wrong record.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className='grid gap-3'>
              {beforeSubmittingItems.map(item => (
                <li className='text-muted-foreground flex gap-3 text-sm leading-6' key={item}>
                  <CheckCircle2 className='text-primary mt-0.5 size-5 shrink-0' />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <ListChecks className='text-primary size-5' />
            What to Check on the Form
          </CardTitle>
          <CardDescription>Most fields are read-only so you can verify the member before posting.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className='grid gap-3 sm:grid-cols-2'>
            {formFields.map(field => (
              <li className='text-muted-foreground flex gap-3 text-sm leading-6' key={field}>
                <CheckCircle2 className='text-primary mt-0.5 size-5 shrink-0' />
                <span>{field}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <UserCheck className='text-primary size-5' />
            After the Announcement Is Posted
          </CardTitle>
          <CardDescription>The member moves from active membership to deceased-member records.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className='grid gap-3 sm:grid-cols-2'>
            {afterSubmissionItems.map(item => (
              <li className='text-muted-foreground flex gap-3 text-sm leading-6' key={item}>
                <CheckCircle2 className='text-primary mt-0.5 size-5 shrink-0' />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </section>
  )
}

export default DeathAnnouncement
