import Link from 'next/link'
import {
  AlertCircle,
  ArrowRight,
  BadgeDollarSign,
  Banknote,
  CheckCircle2,
  ClipboardCheck,
  Hash,
  ListChecks,
  MessageSquareText,
  ReceiptText,
  ShieldCheck
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const paymentSteps = [
  {
    icon: ListChecks,
    title: 'Check your 4-letter code',
    description:
      'Start from the contribution information and find your group by its 4-letter code. Use the amount listed in front of that code.'
  },
  {
    icon: BadgeDollarSign,
    title: 'Send the exact amount',
    description:
      'Send exactly the contribution amount shown for your group. Do not round it, estimate it, or send a different amount unless the admin instructed you.'
  },
  {
    icon: Hash,
    title: 'Use the exact bank code',
    description:
      'When sending the Zelle payment, use the exact bank code or payment information provided by SAGI so the payment goes to the correct account.'
  },
  {
    icon: MessageSquareText,
    title: 'Add your code in the memo',
    description:
      'Add your group 4-letter code in the Zelle memo. This helps the admin identify which group sent the contribution.'
  }
]

const formChecklist = [
  'Enter the same 4-letter group code that you used in the Zelle memo.',
  'Report the exact amount you sent, matching the amount listed in front of your group code.',
  'Enter the correct payment month or contribution period.',
  'Add the sender name, confirmation information, or transaction details requested by the form.',
  'Submit the Contribution Payment form after the Zelle payment has already been sent.'
]

const whyItMatters = [
  'The 4-letter code connects the Zelle payment to the correct group.',
  'The exact amount helps the admin match the payment to the contribution table.',
  'The exact bank code prevents the payment from being sent to the wrong destination.',
  'The Contribution Payment form creates the official record that the payment was sent.',
  'Recording the payment helps avoid confusion, duplicate questions, and delays in updating your group record.'
]

const avoidMistakes = [
  'Do not send an amount that is different from the amount listed in front of your group code.',
  'Do not forget to write your 4-letter group code in the Zelle memo.',
  'Do not use the wrong bank code or old payment information.',
  'Do not send the payment and skip the Contribution Payment form.',
  'Do not combine payments without a clear memo and a clear form submission.'
]

const ContributionPayment = () => {
  return (
    <section className='flex w-full max-w-full min-w-0 flex-col gap-6 px-3 py-4 sm:px-6 sm:py-6 lg:px-8'>
      <div className='bg-card rounded-lg border p-6 shadow-sm sm:p-8'>
        <Badge className='mb-4 w-fit' variant='secondary'>
          Contribution Payment Instructions
        </Badge>
        <div className='grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center'>
          <div>
            <h1 className='text-foreground max-w-4xl text-3xl font-semibold tracking-normal sm:text-4xl'>
              Send the exact contribution and record the payment
            </h1>
            <div className='text-muted-foreground mt-4 max-w-4xl space-y-3 text-base leading-7'>
              <p>
                Before sending a contribution payment, find your group&apos;s 4-letter code and send exactly the amount
                listed in front of that code. This amount is the amount your group is responsible for during that
                contribution period.
              </p>
              <p>
                When paying with Zelle, use the exact bank code or payment information provided by SAGI, and write your
                group&apos;s 4-letter code in the payment memo. The memo is very important because it helps the admin
                identify your group when the payment is received.
              </p>
              <p>
                After sending the money, report the payment in the Contribution Payment form. Sending the money without
                completing the form can create confusion because the admin may not know which group or contribution
                period the payment belongs to.
              </p>
            </div>
            <div className='mt-6 flex flex-col gap-3 sm:flex-row'>
              <Button asChild>
                <Link href='/contributions'>
                  Open Contribution Payment Form
                  <ArrowRight className='size-4' />
                </Link>
              </Button>
              <Button asChild variant='outline'>
                <Link href='/contribution-table'>Check Contribution Table</Link>
              </Button>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <ShieldCheck className='text-primary size-5' />
                Required Before You Submit
              </CardTitle>
              <CardDescription>These details must match the contribution record.</CardDescription>
            </CardHeader>
            <CardContent className='text-muted-foreground space-y-3 text-sm leading-6'>
              <p>
                The amount sent must match the amount listed in front of your group&apos;s 4-letter code. The memo must
                include that same 4-letter code.
              </p>
              <p>
                The bank code or Zelle payment information must be copied exactly from the current SAGI payment
                instruction so the payment reaches the correct destination.
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
              What to Report in the Form
            </CardTitle>
            <CardDescription>The form should match the payment you already sent.</CardDescription>
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
              <ReceiptText className='text-primary size-5' />
              Why This Prevents Confusion
            </CardTitle>
            <CardDescription>Each detail helps the admin match the payment correctly.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className='grid gap-3'>
              {whyItMatters.map(item => (
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
            <AlertCircle className='text-primary size-5' />
            Avoid These Mistakes
          </CardTitle>
          <CardDescription>Small payment errors can delay updates to your group record.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className='grid gap-3 sm:grid-cols-2'>
            {avoidMistakes.map(item => (
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
            <Banknote className='text-primary size-5' />
            Simple Rule
          </CardTitle>
          <CardDescription>Use the same information everywhere.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className='text-muted-foreground text-sm leading-6'>
            The amount in the Contribution Table, the amount sent through Zelle, the 4-letter code in the Zelle memo,
            and the information reported in the Contribution Payment form should all match.
          </p>
        </CardContent>
      </Card>
    </section>
  )
}

export default ContributionPayment
