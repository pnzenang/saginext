import Image from 'next/image'
import Link from 'next/link'
import {
  AlertTriangle,
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  CircleSlash,
  ClipboardCheck,
  Ellipsis,
  FileSearch,
  History,
  Trash2,
  UserMinus
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const removalSteps = [
  {
    icon: FileSearch,
    title: 'Find the member',
    description:
      'Open All Members and use the filters to search by code, last name, first name, recommendation, or member status.'
  },
  {
    icon: Ellipsis,
    title: 'Open the action menu',
    description:
      'At the end of the member row, click the three-dot menu. Choose Remove Member from the list of member actions.'
  },
  {
    icon: ClipboardCheck,
    title: 'Review the form',
    description:
      'The removal page loads the member information. Check the names, date of birth, matriculation, association, and registration date.'
  },
  {
    icon: Trash2,
    title: 'Withdraw the member',
    description:
      'Choose the reason for leaving, then click Withdraw member. The member moves out of All Members and into Removed Members.'
  }
]

const removalFormFields = [
  'Last and middle names: confirm this is the correct member before submitting.',
  'First names: this field is shown from the member record and should match the person being removed.',
  'Date of birth: use this to confirm the member identity when names are similar.',
  'Country of residence: confirm the member record is the right one.',
  'Matriculation: check the member number before removal.',
  'Association name and association code: confirm the member belongs to your group.',
  'Registration date: shows when the member was originally registered in the system.',
  'Reason for leaving: select No Reason, Moved out of USA, Too Expensive, or Not Interested Anymore.'
]

const removedMembersTable = [
  'Removed members no longer appear in the active All Members table.',
  'The Removed Members page keeps a record of the member who was withdrawn.',
  'A removed member can be restored from Removed Members within 48 hours of the removal.',
  'The table shows the member name, matriculation, association code, reason for leaving, and registration date.',
  'Use the filters on the Removed Members page if you need to find a removed member later.'
]

const timingRules = [
  'Removal of vested members is open to users from the 25th day of one month through the 5th day of the next month.',
  'For example, a member can be removed from May 15 through June 5, then removal closes again until June 15.',
  'Removal is blocked from the 6th through the 14th so contribution calculations stay accurate.',
  'If the button is not shown, wait until the removal window opens again.',
  'A removal submitted during the allowed window does not change a contribution that is already in progress.'
]

const beforeSubmitting = [
  'Confirm you selected the correct member from All Members.',
  'Read the red warning message on the removal page.',
  'Check every pre-filled field before submitting.',
  'Select the most accurate reason for leaving.',
  'Make sure your group has agreed to remove the member.',
  'Remember that restoration is only available for 48 hours after submission.'
]

const RemovedMembers = () => {
  return (
    <section className='flex w-full max-w-full min-w-0 flex-col gap-6 px-3 py-4 sm:px-6 sm:py-6 lg:px-8'>
      <div className='grid gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-center'>
        <div className='bg-card flex flex-col justify-center rounded-lg border p-6 shadow-sm sm:p-8'>
          <Badge className='mb-4 w-fit border-red-200 bg-red-50 text-red-700' variant='outline'>
            Removal Instructions
          </Badge>
          <h1 className='text-foreground max-w-3xl text-3xl font-semibold tracking-normal sm:text-4xl'>
            How to remove a member
          </h1>
          <p className='text-muted-foreground mt-4 max-w-3xl text-base leading-7'>
            Removing a member withdraws that person from your active member list. The member will disappear from All
            Members and a record will be created in Removed Members so your group can still see who was removed and why.
          </p>
          <p className='text-muted-foreground mt-3 max-w-3xl text-base leading-7'>
            This process should be used carefully. Once the removal form is submitted, the app deletes the active member
            record and stores the member in the removed-members history. If the removal was a mistake, restore the
            member from Removed Members within 48 hours.
          </p>
          <p className='mt-3 max-w-3xl rounded-md border border-red-200 bg-red-50 p-3 text-sm leading-6 font-medium text-red-700'>
            Vested Member removal is open from the 25th of one month to the 5th of the next month. Outside that window,
            the Withdraw member button is hidden for the vested members.
          </p>
          <div className='mt-6 flex flex-col gap-3 sm:flex-row'>
            <Button asChild>
              <Link href='/all-members'>
                Start From All Members
                <ArrowRight className='size-4' />
              </Link>
            </Button>
            <Button asChild variant='outline'>
              <Link href='/removed-members'>View Removed Members</Link>
            </Button>
          </div>
        </div>

        <Card className='overflow-hidden'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <UserMinus className='size-5 text-red-600' />
              Member Removal Form
            </CardTitle>
            <CardDescription>This is the form users review before withdrawing a member.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='bg-background overflow-hidden rounded-lg border'>
              <Image
                alt='Preview of the SAGI member removal form'
                className='h-auto w-full'
                height={660}
                priority
                src='/images/remove-member-form-preview.svg'
                width={1120}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className='border-red-200 bg-red-50/50'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2 text-red-700'>
            <AlertTriangle className='size-5' />
            Important Warning
          </CardTitle>
          <CardDescription className='text-red-700/80'>Read this before removing any member.</CardDescription>
        </CardHeader>
        <CardContent className='space-y-3 text-sm leading-6 text-red-800'>
          <p>
            Removal is a serious action. When the withdrawal is submitted, the member is removed from the active All
            Members page and moved to the Removed Members page for record keeping. The member can be restored from that
            page within 48 hours.
          </p>
          <p>
            Do not remove a member just to correct a spelling mistake or update information. Use Edit Member&apos;s
            Details for corrections. Use removal only when the member is truly leaving the group or should no longer be
            active.
          </p>
        </CardContent>
      </Card>

      <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-4'>
        {removalSteps.map((step, index) => {
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
              <CalendarClock className='text-primary size-5' />
              Removal Window: 25th to 5th
            </CardTitle>
            <CardDescription>
              Users can remove members from the 25th of one month through the 5th of the next month.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className='grid gap-3'>
              {timingRules.map(rule => (
                <li className='text-muted-foreground flex gap-3 text-sm leading-6' key={rule}>
                  <CheckCircle2 className='text-primary mt-0.5 size-5 shrink-0' />
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <CircleSlash className='text-primary size-5' />
              If the Withdraw Button Is Missing
            </CardTitle>
            <CardDescription>The member information may show even when removal is temporarily blocked.</CardDescription>
          </CardHeader>
          <CardContent className='text-muted-foreground space-y-3 text-sm leading-6'>
            <p>
              If the app shows a red stop message instead of the Withdraw member button, the current date is outside the
              allowed withdrawal window.
            </p>
            <p>
              In that case, do not look for another way to remove the member. Wait until the 25th day of the month or
              later, then return to the same member row and open Remove Member again.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>What to Check on the Removal Form</CardTitle>
          <CardDescription>Use every field to confirm you are removing the correct person.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className='grid gap-3 sm:grid-cols-2'>
            {removalFormFields.map(field => (
              <li className='text-muted-foreground flex gap-3 text-sm leading-6' key={field}>
                <CheckCircle2 className='text-primary mt-0.5 size-5 shrink-0' />
                <span>{field}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <div className='grid gap-4 lg:grid-cols-2'>
        <Card>
          <CardHeader>
            <CardTitle>Before You Submit</CardTitle>
            <CardDescription>Use this checklist to avoid accidental removals.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className='grid gap-3'>
              {beforeSubmitting.map(item => (
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
              <History className='text-primary size-5' />
              After the Member Is Removed
            </CardTitle>
            <CardDescription>The app redirects you to the removed-member record list.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className='grid gap-3'>
              {removedMembersTable.map(item => (
                <li className='text-muted-foreground flex gap-3 text-sm leading-6' key={item}>
                  <CheckCircle2 className='text-primary mt-0.5 size-5 shrink-0' />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}

export default RemovedMembers
