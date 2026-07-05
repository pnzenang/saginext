import Link from 'next/link'
import {
  AlertCircle,
  ArrowRight,
  Banknote,
  CheckCircle2,
  ClipboardCheck,
  ClipboardList,
  FileText,
  ReceiptText,
  SearchCheck,
  Send,
  ShieldCheck
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const paymentSteps = [
  {
    icon: ClipboardList,
    title: 'Submit the member registration first',
    description:
      'Complete the member registration or Add Member form before making the payment record. The payment form should match a member who has already been submitted.'
  },
  {
    icon: Banknote,
    title: 'Send the registration fee',
    description:
      'Open Registration Payments and use the Zelle QR code to send the registration fee. A delegate may send payment for one member or for many members at once.'
  },
  {
    icon: FileText,
    title: 'Fill out the registration payment form',
    description:
      'After sending the money, complete the form shown on the Registration Payments page. This tells the admin which member, group, and payment the fee belongs to.'
  },
  {
    icon: ReceiptText,
    title: 'Keep your confirmation',
    description:
      'Save the Zelle confirmation, receipt, or transaction note until the payment appears in the registration payment record and the member status is updated to awaiting publication.'
  }
]

const formChecklist = [
  'Use the same member name you entered during registration so the admin can match the payment correctly.',
  'Enter your group, family, or association information exactly as it appears in your profile.',
  'Record the amount sent and confirm it covers the registration fee for the correct number of members, especially when paying for many members at once.',
  'Include any requested Zelle confirmation, sender name, payment date, or transaction information.',
  'Submit the form only after the payment has already been sent.'
]

const whyTheFormMatters = [
  'The Zelle payment alone does not always show which member the money belongs to.',
  'The form creates a record that connects the registration fee to the member registration.',
  'The admin uses the form response to verify the fee, review the pending member, and complete the registration process.',
  'A missing or incomplete payment form can delay approval even when the money was already sent.'
]

const afterPaymentItems = [
  'Check the registration payment record later to confirm that the submitted payment appears.',
  'Check All Members to see whether the member still shows as Pending or has been updated after review.',
  'Allow the admin team time to compare the form, Zelle payment, and member registration.',
  'If there is a question, use your saved payment confirmation to help verify the payment.'
]

const commonMistakes = [
  'Do not send the fee and forget to complete the Registration Payments form.',
  'Do not complete the payment form before sending the money.',
  'Do not use nicknames or shortened names that are different from the registration form.',
  'Do not combine payments without clearly recording which members the payment covers.',
  'Do not assume the member is fully registered while the status is still Pending.'
]

const MemberRegistration = () => {
  return (
    <section className='flex w-full max-w-full min-w-0 flex-col gap-6 px-3 py-4 sm:px-6 sm:py-6 lg:px-8'>
      <div className='bg-card rounded-lg border p-6 shadow-sm sm:p-8'>
        <Badge className='mb-4 w-fit' variant='secondary'>
          Registration Payment Instructions
        </Badge>
        <div className='grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center'>
          <div>
            <h1 className='text-foreground max-w-4xl text-3xl font-semibold tracking-normal sm:text-4xl'>
              Complete the registration payment after submitting the member
            </h1>
            <div className='text-muted-foreground mt-4 max-w-4xl space-y-3 text-base leading-7'>
              <p>
                Submitting a member registration is only the first part of the process. After the member has been
                submitted, you must send the registration fee and then complete the form on the Registration Payments
                page. This second form is important because it connects the money you sent to the correct member and
                group.
              </p>
              <p>
                A delegate can send the registration fees for several members together in one payment. When you do this,
                make sure the Registration Payments form clearly shows all the members covered by that payment and that
                the total amount matches the number of members being registered.
              </p>
              <p>
                Please follow the instructions carefully. A member may remain pending if the registration fee is not
                received, if the Registration Payments form is not submitted, or if the information on the payment form
                does not match the member registration.
              </p>
            </div>
            <div className='mt-6 flex flex-col gap-3 sm:flex-row'>
              <Button asChild>
                <Link href='/registrationsPayments'>
                  Open Registration Payments
                  <ArrowRight className='size-4' />
                </Link>
              </Button>
              <Button asChild variant='outline'>
                <Link href='/add-member'>Open Add Member Form</Link>
              </Button>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <ShieldCheck className='text-primary size-5' />
                Before the Member Is Active
              </CardTitle>
              <CardDescription>The admin needs both the registration and the payment record.</CardDescription>
            </CardHeader>
            <CardContent className='text-muted-foreground space-y-3 text-sm leading-6'>
              <p>
                The member should be expected to show as Pending until the registration fee has been sent, recorded, and
                reviewed.
              </p>
              <p>
                The waiting period is at least 60 days. The $20 registration fee should be received within seventy (70)
                days. If the fee is not received within seventy (70) days, the pending member will be deleted from the
                database.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-4'>
        {paymentSteps.map((step, index) => {
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
              <ClipboardCheck className='text-primary size-5' />
              What to Enter on the Payment Form
            </CardTitle>
            <CardDescription>Use the form after clicking the Registration Payments link.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className='grid gap-3'>
              {formChecklist.map(item => (
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
              <SearchCheck className='text-primary size-5' />
              Why This Step Is Required
            </CardTitle>
            <CardDescription>The payment form helps prevent confusion and delayed approval.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className='grid gap-3'>
              {whyTheFormMatters.map(item => (
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
            <Send className='text-primary size-5' />
            After You Submit the Payment Form
          </CardTitle>
          <CardDescription>Registration is reviewed after the payment and form are matched.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className='grid gap-3 sm:grid-cols-2'>
            {afterPaymentItems.map(item => (
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
          <CardDescription>These issues can make the registration take longer than expected.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className='grid gap-3 sm:grid-cols-2'>
            {commonMistakes.map(item => (
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

export default MemberRegistration
