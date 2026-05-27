import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, CheckCircle2, CreditCard, FileText, ShieldCheck, Upload, WalletCards } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const zellePaymentLink =
  'https://enroll.zellepay.com/qr-codes?data=eyJuYW1lIjoiUEFUUklDRSIsImFjdGlvbiI6InBheW1lbnQiLCJ0b2tlbiI6IjQ0MzUzMTU4NTIifQ=='

const paymentSteps = [
  {
    icon: WalletCards,
    title: 'Open the right payment page',
    description: 'Use Registration Payments for new member fees and Contributions Payments for monthly contributions.'
  },
  {
    icon: CreditCard,
    title: 'Send the money with Zelle',
    description:
      'Scan the QR code or click it to open the SAGI Zelle payment information, then send the exact amount required.'
  },
  {
    icon: FileText,
    title: 'Write a clear payment note',
    description:
      'Always include your group 4-letter code, group name, delegate name, payment month, and whether the payment is for registration or contribution.'
  },
  {
    icon: Upload,
    title: 'Record the payment in SAGI',
    description:
      'Return to the matching payment page, fill out the form, and upload your confirmation or receipt when requested.'
  }
]

const reminders = [
  'Confirm the amount before sending payment.',
  'Always include your group 4-letter code when making a payment.',
  'Use the same group name that appears in your SAGI dashboard.',
  'Keep your Zelle confirmation until the payment is reflected in SAGI.',
  'Do not combine registration and contribution payments without writing a clear note.'
]

const PaymentInstructionsContent = () => {
  return (
    <section className='max-w-9xl mx-auto flex w-full flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8'>
      <div className='grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-stretch'>
        <div className='bg-card flex flex-col justify-center rounded-lg border p-6 shadow-sm sm:p-8'>
          <Badge className='mb-4 w-fit' variant='secondary'>
            Payment Instructions
          </Badge>
          <h1 className='text-foreground max-w-3xl text-3xl font-semibold tracking-normal sm:text-4xl'>
            How to make and record a SAGI payment
          </h1>
          <p className='text-muted-foreground mt-4 max-w-3xl text-base leading-7'>
            Send your payment first, then record it in the correct SAGI payment page so the admin team can match the
            money to your group without delays.{' '}
            <span className='text-primary font-bold'>
              {' '}
              Always include at least your group 4-letter code in the payment memo.
            </span>
          </p>
          <div className='mt-6 flex flex-col gap-3 sm:flex-row'>
            <Button asChild>
              <Link href='/contributions'>
                Contributions Payments
                <ArrowRight className='size-4' />
              </Link>
            </Button>
            <Button asChild variant='outline'>
              <Link href='/registrations'>Registration Payments</Link>
            </Button>
          </div>
        </div>

        <Card className='overflow-hidden'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <CreditCard className='text-primary size-5' />
              Zelle Payment
            </CardTitle>
            <CardDescription>Scan or click the QR code to open the payment information.</CardDescription>
          </CardHeader>
          <CardContent className='flex flex-col items-center gap-4'>
            <Link
              aria-label='Open SAGI Zelle payment information'
              className='bg-background hover:border-primary rounded-lg border p-4 transition'
              href={zellePaymentLink}
            >
              <Image
                alt='SAGI Zelle payment QR code'
                className='h-auto w-full max-w-64'
                height={300}
                priority
                src='https://res.cloudinary.com/dp8tkb7hq/image/upload/v1778042720/sagiQrCode_jmwsbf.svg'
                width={300}
              />
            </Link>
            <p className='text-muted-foreground text-center text-sm'>
              After sending, come back to SAGI and submit the payment record.
            </p>
          </CardContent>
        </Card>
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

      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <ShieldCheck className='text-primary size-5' />
            Before You Submit
          </CardTitle>
          <CardDescription>
            Use these checks to prevent a payment from being delayed or hard to identify.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className='grid gap-3 sm:grid-cols-2'>
            {reminders.map(reminder => (
              <li className='text-muted-foreground flex gap-3 text-sm leading-6' key={reminder}>
                <CheckCircle2 className='text-primary mt-0.5 size-5 shrink-0' />
                <span>{reminder}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </section>
  )
}

export default PaymentInstructionsContent
