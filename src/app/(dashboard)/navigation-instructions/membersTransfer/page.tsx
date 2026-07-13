import Link from 'next/link'
import {
  ArrowRight,
  ArrowRightLeft,
  CheckCircle2,
  ClipboardCheck,
  Database,
  ShieldCheck,
  Users
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const transferSteps = [
  {
    icon: ArrowRightLeft,
    title: 'A delegate submits a transfer request',
    description:
      'Open Member Transfer, select the member, confirm the receiving association, and submit the request.'
  },
  {
    icon: ClipboardCheck,
    title: 'The other delegate reviews the request',
    description:
      'The delegate on the other side reviews the transfer request and either approves it or rejects it with a reason.'
  },
  {
    icon: Database,
    title: 'Admin completes the transfer',
    description:
      'After both delegates approve, SAGI admin completes the update so the same member record moves to the receiving association.'
  }
]

const currentGroupTasks = [
  'Open Member Transfer from the dashboard.',
  'Select one of the members currently under your association.',
  'Choose the association that will receive the member.',
  'Submit the request and wait for the receiving delegate to approve it.'
]

const receivingGroupTasks = [
  'Open Member Transfer from the dashboard.',
  'Search for the member currently listed under another association.',
  'Submit the release request to the current delegate.',
  'Wait for the current delegate to approve the release before admin review.'
]

const adminReviewItems = [
  'The admin confirms both delegates approved the same transfer request.',
  'The admin verifies the member still belongs to the releasing association.',
  'The admin moves the existing member record to the receiving association.',
  'The admin updates the matriculation number and keeps the member history on the same record.'
]

const transferRules = [
  'A member transfer does not require any fee.',
  'Do not register the same member again in Add Member.',
  'Do not change the delegate recommendation to process a member transfer.',
  'Use the Member Transfer page so both delegates and admin can review the same request.'
]

const MemberTransfer = () => {
  return (
    <section className='flex w-full max-w-full min-w-0 flex-col gap-6 px-3 py-4 sm:px-6 sm:py-6 lg:px-8'>
      <div className='bg-card rounded-lg border p-6 shadow-sm sm:p-8'>
        <Badge className='mb-4 w-fit' variant='secondary'>
          Member Transfer Instructions
        </Badge>
        <div className='grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center'>
          <div>
            <h1 className='text-foreground max-w-4xl text-3xl font-semibold tracking-normal sm:text-4xl'>
              The member transfer is completed in 3 steps
            </h1>
            <div className='text-muted-foreground mt-4 max-w-4xl space-y-3 text-base leading-7'>
              <p>
                A member transfer happens when a member moves from one group to another. The transfer is started by the
                delegate who needs the change, then reviewed by the other delegate involved.
              </p>
              <p>
                Delegates should use the Member Transfer page for this process. The member should not be registered
                again, and the delegate recommendation should not be changed to complete a transfer.
              </p>
              <p>
                Once the second delegate approves the request, the admin team reviews it and completes the database
                update. The same member record is moved to the receiving association.
              </p>
              <p>
                A member transfer does not need any fee at all. Both delegate associations only need to complete their
                review steps.
              </p>
            </div>
            <div className='mt-6 flex flex-col gap-3 sm:flex-row'>
              <Button asChild>
                <Link href='/member-transfer'>
                  Open Member Transfer
                  <ArrowRight className='size-4' />
                </Link>
              </Button>
              <Button asChild variant='outline'>
                <Link href='/admin-member-transfers'>Admin Review</Link>
              </Button>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <ShieldCheck className='text-primary size-5' />
                Main Rule
              </CardTitle>
              <CardDescription>Both delegates must approve the same transfer request.</CardDescription>
            </CardHeader>
            <CardContent className='text-muted-foreground space-y-3 text-sm leading-6'>
              <p>
                The transfer should be handled from the Member Transfer page. Do not create a duplicate member record
                and do not use delegate recommendation options for this workflow.
              </p>
              <p>
                After both delegates approve, the admin team completes the record update with the correct receiving
                association and matriculation number.
              </p>
              <p>No payment or registration fee is required for a member transfer.</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className='grid gap-4 md:grid-cols-3'>
        {transferSteps.map((step, index) => {
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
              <ArrowRightLeft className='text-primary size-5' />
              Group Currently Holding the Member
            </CardTitle>
            <CardDescription>The current group can start a request to send the member.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className='grid gap-3'>
              {currentGroupTasks.map(item => (
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
              <Users className='text-primary size-5' />
              Group Receiving the Member
            </CardTitle>
            <CardDescription>The receiving group can request the member from the current group.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className='grid gap-3'>
              {receivingGroupTasks.map(item => (
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
            <ShieldCheck className='text-primary size-5' />
            Transfer Fee
          </CardTitle>
          <CardDescription>Member transfers are handled without payment.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className='grid gap-3 sm:grid-cols-2'>
            {transferRules.map(item => (
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
            <ClipboardCheck className='text-primary size-5' />
            What the Admin Does Next
          </CardTitle>
          <CardDescription>The admin completes the final database review after both delegate steps.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className='grid gap-3 sm:grid-cols-2'>
            {adminReviewItems.map(item => (
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

export default MemberTransfer
