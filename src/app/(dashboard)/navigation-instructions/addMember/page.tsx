import Image from 'next/image'
import Link from 'next/link'
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  CreditCard,
  FileCheck2,
  UserPlus,
  UsersRound
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const memberFields = [
  'Last and middle names: write the last name first and avoid abbreviations.',
  'First names: enter the member first name or names exactly as they should appear.',
  'Date of birth: use the MM / DD / YYYY format.',
  'Country of residence: choose the member country from the dropdown.',
  'Name of beneficiary: enter the person who should be listed as beneficiary.',
  'Association name and association code: these are filled automatically from your profile.',
  'Delegate recommendation: leave it as Confirm unless the member is coming from another SAGI database, such as SAGICAM or SAGINIGERIA. For those cases, choose the matching transfer-from recommendation.',
  'Member status: this starts as Pending until registration is completed.'
]

const preparationItems = [
  'Confirm that the person is ready to join your association or family group.',
  'Collect the correct full legal name before opening the form.',
  'Have the date of birth and beneficiary name ready.',
  'Make sure your profile has the correct association name and association code because the form uses those automatically.'
]

const processSteps = [
  {
    icon: UserPlus,
    title: 'Open Add Member',
    description: 'From the sidebar, click Add Member. This opens the form used to start a new member registration.'
  },
  {
    icon: ClipboardList,
    title: 'Complete the form',
    description:
      'Enter the member names, date of birth, and beneficiary name, then confirm the country of residence. Review spelling carefully before submitting.'
  },
  {
    icon: UsersRound,
    title: 'Submit the member',
    description:
      'Click Add Member. The member will appear in your dashboard as pending while the registration is reviewed.'
  },
  {
    icon: CreditCard,
    title: 'Pay registration fee',
    description:
      'Go to Registration Payments to send and record the registration fee so the admin can complete the process.'
  }
]

const afterSubmissionItems = [
  'Open All Members from the sidebar to confirm the new member was added.',
  'Expect the new member to show as Pending until the registration payment is received and processed.',
  'Use Registration Payments to send and record the $20 registration fee.',
  'Keep the payment confirmation so it can be checked if the admin needs more information.'
]

const commonMistakes = [
  'Do not abbreviate the last name, middle name, first name, or beneficiary name.',
  'Do not enter the first name in the last name field.',
  'Do not change the association name or code if those fields are already filled from your profile.',
  'Do not use a transfer-from recommendation for a member already listed in this SAGI database. Use Member Transfer instead.',
  'Do not forget to record the registration payment after sending it.'
]

const AddingPageInstruction = () => {
  return (
    <section className='flex w-full max-w-full min-w-0 flex-col gap-6 px-3 py-4 sm:px-6 sm:py-6 lg:px-8'>
      <div className='grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center'>
        <div className='bg-card flex flex-col justify-center rounded-lg border p-6 shadow-sm sm:p-8'>
          <Badge className='mb-4 w-fit' variant='secondary'>
            Add Member Instructions
          </Badge>
          <h1 className='text-foreground max-w-3xl text-3xl font-semibold tracking-normal sm:text-4xl'>
            How to add a new member
          </h1>
          <p className='text-muted-foreground mt-4 max-w-3xl text-base leading-7'>
            Adding a member starts the registration process. New members remain pending until their registration fee is
            received and recorded by the admin team. The form should be completed by the delegate or group
            representative using the member&apos;s correct information, because this is the information SAGI will use to
            identify the member later.
          </p>
          <p className='text-muted-foreground mt-3 max-w-3xl text-base leading-7'>
            After you submit the form, the member is not fully active immediately. You still need to send and record the
            registration payment, then allow the admin team to review the record.
          </p>
          <div className='mt-6 flex flex-col gap-3 sm:flex-row'>
            <Button asChild>
              <Link href='/add-member'>
                Open Add New Member Form
                <ArrowRight className='size-4' />
              </Link>
            </Button>
            <Button asChild variant='outline'>
              <Link href='/registrationsPayments'>Registration Payments</Link>
            </Button>
          </div>
        </div>

        <Card className='overflow-hidden'>
          <CardHeader>
            <CardTitle>Add Member Form</CardTitle>
            <CardDescription>This is the form you will complete when adding a member.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='bg-background overflow-hidden rounded-lg border'>
              <Image
                alt='Preview of the SAGI add member form'
                className='h-auto w-full'
                height={500}
                priority
                src='/images/add-member-form-preview.svg'
                width={1100}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className='grid gap-4 lg:grid-cols-2'>
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <FileCheck2 className='text-primary size-5' />
              Before You Start
            </CardTitle>
            <CardDescription>Prepare the member information first so the form is submitted correctly.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className='grid gap-3'>
              {preparationItems.map(item => (
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
              Avoid These Mistakes
            </CardTitle>
            <CardDescription>Small errors can delay the registration or make the member hard to find.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className='grid gap-3'>
              {commonMistakes.map(item => (
                <li className='text-muted-foreground flex gap-3 text-sm leading-6' key={item}>
                  <CheckCircle2 className='text-primary mt-0.5 size-5 shrink-0' />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
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
          <CardTitle>What to Enter</CardTitle>
          <CardDescription>Use this checklist while completing the Add Member form.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className='grid gap-3 sm:grid-cols-2'>
            {memberFields.map(field => (
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
          <CardTitle>After You Click Add Member</CardTitle>
          <CardDescription>The form submission is only the first part of registration.</CardDescription>
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

      <Card>
        <CardHeader>
          <CardTitle>Important Registration Note</CardTitle>
          <CardDescription>Read this before adding members.</CardDescription>
        </CardHeader>
        <CardContent className='text-muted-foreground space-y-3 text-sm leading-6'>
          <p>
            The waiting period is at least 60 days. The $20 registration fee should be received within sixty (60) days
            before the member starts participating in the program.
          </p>
          <p>
            If the registration fee is not received within sixty (60) days, the pending member will be deleted from the
            database. After submitting the member, use Registration Payments to send and record the payment.
          </p>
        </CardContent>
      </Card>
    </section>
  )
}

export default AddingPageInstruction
