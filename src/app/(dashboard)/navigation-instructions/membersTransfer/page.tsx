import Link from 'next/link'
import {
  ArrowRight,
  ArrowRightLeft,
  CheckCircle2,
  ClipboardCheck,
  Database,
  Pencil,
  ShieldCheck,
  UserPlus,
  Users
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const transferSteps = [
  {
    icon: Pencil,
    title: 'Current group marks Transfer_Out',
    description:
      "The delegate of the group the member is leaving should open the member's record, edit the member information, and change the delegate recommendation to Transfer_Out."
  },
  {
    icon: UserPlus,
    title: 'New group registers Transfer_In',
    description:
      'The delegate of the group receiving the member should register the same member and select Transfer_In as the delegate recommendation during registration.'
  },
  {
    icon: Database,
    title: 'Admin completes the merge',
    description:
      'The admin team then reviews both records and makes sure the member appears only once in the database with the correct matriculation number and longevity.'
  }
]

const currentGroupTasks = [
  'Go to All Members and find the member who is transferring out.',
  "Open the member's action menu and select the edit option.",
  'Change the delegate recommendation to Transfer_Out.',
  'Review the member details before saving so the outgoing transfer is attached to the correct person.'
]

const receivingGroupTasks = [
  'Open Add Member or the member registration page.',
  'Register the same member under the group receiving the member.',
  'Select Transfer_In as the delegate recommendation during registration.',
  'Enter the member information carefully so the admin can match the transfer-in request with the transfer-out record.'
]

const adminReviewItems = [
  'The admin confirms that the Transfer_Out and Transfer_In records refer to the same member.',
  'The admin makes sure the member appears only once in the database.',
  'The admin preserves the correct matriculation number.',
  'The admin preserves the correct longevity so the transfer does not restart the member history.'
]

const transferRules = [
  'A member transfer does not require any fee.',
  'The outgoing group should not send a payment for Transfer_Out.',
  'The receiving group should not send a registration fee for Transfer_In.',
  'Only the Transfer_Out and Transfer_In records are needed for the admin to review the transfer.'
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
                two delegates involved: the delegate of the group the member is leaving and the delegate of the group
                the member is joining.
              </p>
              <p>
                The delegate of the group where the member is coming from should edit the transferring member&apos;s
                information and change the delegate recommendation to Transfer_Out. This shows that the current group is
                releasing the member.
              </p>
              <p>
                The delegate of the group where the member is going should register the same member and select
                Transfer_In as the delegate recommendation during registration. The admin team will then review both
                sides and complete the database update.
              </p>
              <p>
                A member transfer does not need any fee at all. The outgoing group and the receiving group only need to
                complete their transfer steps.
              </p>
            </div>
            <div className='mt-6 flex flex-col gap-3 sm:flex-row'>
              <Button asChild>
                <Link href='/all-members'>
                  Open All Members
                  <ArrowRight className='size-4' />
                </Link>
              </Button>
              <Button asChild variant='outline'>
                <Link href='/add-member'>Open Add Member</Link>
              </Button>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <ShieldCheck className='text-primary size-5' />
                Main Rule
              </CardTitle>
              <CardDescription>Both groups must report their side of the same transfer.</CardDescription>
            </CardHeader>
            <CardContent className='text-muted-foreground space-y-3 text-sm leading-6'>
              <p>
                The outgoing group uses Transfer_Out on the existing member record. The receiving group uses Transfer_In
                when registering the same member.
              </p>
              <p>
                After both sides are submitted, the admin team makes sure the member appears only once with the correct
                matriculation number and longevity.
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
              Group Sending the Member
            </CardTitle>
            <CardDescription>The current group marks the member as transferring out.</CardDescription>
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
            <CardDescription>The new group registers the member as transferring in.</CardDescription>
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
