import Link from 'next/link'
import {
  ArrowRight,
  Banknote,
  CheckCircle2,
  ClipboardCheck,
  Hash,
  PiggyBank,
  ReceiptText,
  ShieldCheck,
  TrendingUp,
  WalletCards
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const excessPaymentSteps = [
  {
    icon: WalletCards,
    title: 'Check the required amount',
    description:
      'Start by checking the Contribution Table and find the amount listed for your group in front of your 4-letter code.'
  },
  {
    icon: TrendingUp,
    title: 'Sending more is allowed',
    description:
      'A delegate can send more than the amount needed in the Contribution Table. The extra amount becomes an excess for the group.'
  },
  {
    icon: Hash,
    title: 'Use the same code and bank details',
    description:
      'Use the same SAGI bank code or payment information, and include your group 4-letter code in the Zelle memo.'
  },
  {
    icon: PiggyBank,
    title: 'Excess is saved',
    description:
      'The excess is kept in Financial Positions so the group can see it and use it toward a future contribution.'
  }
]

const financialPositionItems = [
  'Financial Positions shows whether your group has paid the required monthly contribution.',
  'If your group sends more than the required amount, the extra money is shown as an excess.',
  'The excess remains attached to your group, not to another group or another payment type.',
  'That excess can be used for a future contribution.',
  'Delegates should check Financial Positions after payments are reviewed to confirm the group balance.'
]

const paymentRules = [
  'Use your group bank code when sending the money.',
  'Add your group 4-letter code in the Zelle memo every time you send a payment.',
  'Record the full amount sent in the Contribution Payment form, including any extra amount.',
  'Use the same 4-letter code in the memo and in the payment form so the admin can match the payment.',
  'Keep the payment confirmation until the excess appears in Financial Positions.'
]

const avoidConfusionItems = [
  'Do not send extra money without your 4-letter code in the memo.',
  'Do not use a different bank code from the current SAGI payment instruction.',
  'Do not assume the excess is recorded until it appears in Financial Positions.',
  'Do not mix registration money and contribution money without a clear payment record.'
]

const GroupFinancialPositions = () => {
  return (
    <section className='max-w-9xl mx-auto flex w-full flex-col gap-6 px-3 py-4 sm:px-6 sm:py-6 lg:px-8'>
      <div className='bg-card rounded-lg border p-6 shadow-sm sm:p-8'>
        <Badge className='mb-4 w-fit' variant='secondary'>
          Group Financial Position Instructions
        </Badge>
        <div className='grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center'>
          <div>
            <h1 className='text-foreground max-w-4xl text-3xl font-semibold tracking-normal sm:text-4xl'>
              Understand how excess contribution payments are recorded
            </h1>
            <div className='text-muted-foreground mt-4 max-w-4xl space-y-3 text-base leading-7'>
              <p>
                A delegate can send more than the amount needed in the Contribution Table. When this happens, the extra
                amount is kept in Financial Positions and shown as an excess for that group.
              </p>
              <p>
                Even when sending more than required, use the same SAGI bank code or payment information and include
                your group&apos;s 4-letter code in the Zelle memo. This helps the admin match the money to the correct
                group.
              </p>
              <p>
                The excess can be used in a future contribution. Financial Positions helps the delegate see that the
                group has extra money available after the payment has been reviewed and recorded.
              </p>
            </div>
            <div className='mt-6 flex flex-col gap-3 sm:flex-row'>
              <Button asChild>
                <Link href='/financial-position'>
                  Open Financial Positions
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
                Main Rule
              </CardTitle>
              <CardDescription>Extra contribution money must still be easy to identify.</CardDescription>
            </CardHeader>
            <CardContent className='text-muted-foreground space-y-3 text-sm leading-6'>
              <p>
                If your group sends more than the amount listed in the Contribution Table, the extra money is recorded
                as excess in Financial Positions and will be used in future contributions.
              </p>
              <p>
                The payment should use the correct bank code and include your group&apos;s 4-letter code in the memo so
                the excess can be assigned to the right group.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-4'>
        {excessPaymentSteps.map((step, index) => {
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
              What Financial Positions Shows
            </CardTitle>
            <CardDescription>Use it to understand your group balance.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className='grid gap-3'>
              {financialPositionItems.map(item => (
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
              Payment Rules
            </CardTitle>
            <CardDescription>Follow these rules when sending the required amount or more.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className='grid gap-3'>
              {paymentRules.map(item => (
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
            <ReceiptText className='text-primary size-5' />
            Avoid Confusion
          </CardTitle>
          <CardDescription>Clear payment details help the excess appear under the correct group.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className='grid gap-3 sm:grid-cols-2'>
            {avoidConfusionItems.map(item => (
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

export default GroupFinancialPositions
