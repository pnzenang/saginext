import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, CheckCircle2, CreditCard, FileText, ShieldCheck, Upload, WalletCards } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { AppLanguage } from '@/lib/i18n'

const zellePaymentLink =
  'https://enroll.zellepay.com/qr-codes?data=eyJuYW1lIjoiUEFUUklDRSIsImFjdGlvbiI6InBheW1lbnQiLCJ0b2tlbiI6IjQ0MzUzMTU4NTIifQ=='

const paymentInstructionsCopy = {
  en: {
    badge: 'Payment Instructions',
    title: 'How to make and record a SAGI payment',
    intro:
      'Send your payment first, then record it in the correct SAGI payment page so the admin team can match the money to your group without delays.',
    memoReminder: 'Always include SAGI-{4-letter code} in the Zelle memo.',
    contributionsCta: 'Contributions Payments',
    registrationsCta: 'Registration Payments',
    zelle: {
      title: 'Zelle Payment',
      descriptionStart: 'Send Zelle payment using:',
      nameLabel: 'SAGI name:',
      emailLabel: 'and email:',
      descriptionEnd: 'or click the QR code to search your bank and connect the Zelle payment.',
      ariaLabel: 'Open SAGI Zelle payment information',
      imageAlt: 'SAGI Zelle payment QR code',
      after:
        'After sending, come back to SAGI and submit the payment record in Registration Payments or Contributions Payments.'
    },
    stepLabel: 'Step',
    paymentSteps: [
      {
        icon: WalletCards,
        title: 'Open the right payment page',
        description:
          'Use Registration Payments for new member fees and Contributions Payments for monthly contributions.'
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
        description: 'Always include SAGI-{4-letter code} in the Zelle memo.'
      },
      {
        icon: Upload,
        title: 'Record the payment in SAGI',
        description:
          'Return to the matching payment page, fill out the form, and upload your confirmation or receipt when requested.'
      }
    ],
    beforeSubmit: {
      title: 'Before You Submit',
      description: 'Use these checks to prevent a payment from being delayed or hard to identify.'
    },
    reminders: [
      'Confirm the amount before sending payment.',
      'Always include SAGI-{4-letter code} when making a payment.',
      'Use the same group 4-letter code that appears in your SAGI dashboard.',
      'Keep your Zelle confirmation until the payment is reflected in SAGI.',
      'Do not combine registration and contribution payments without writing a clear note.'
    ]
  },
  fr: {
    badge: 'Instructions de paiement',
    title: 'Comment effectuer et enregistrer un paiement SAGI',
    intro:
      "Envoyez d'abord votre paiement, puis enregistrez-le sur la bonne page de paiement SAGI afin que l'équipe administrative puisse associer l'argent à votre groupe sans délai.",
    memoReminder:
      'Incluez toujours SAGI-{code à 4 lettres} dans le mémo Zelle.',
    contributionsCta: 'Paiements des cotisations',
    registrationsCta: "Paiements d'inscription",
    zelle: {
      title: 'Paiement Zelle',
      descriptionStart: 'Envoyez le paiement Zelle avec :',
      nameLabel: 'Nom SAGI :',
      emailLabel: "et l'e-mail :",
      descriptionEnd: 'ou cliquez sur le code QR pour chercher votre banque et connecter le paiement Zelle.',
      ariaLabel: 'Ouvrir les informations de paiement Zelle de SAGI',
      imageAlt: 'Code QR du paiement Zelle de SAGI',
      after:
        "Après l'envoi, revenez dans SAGI et soumettez l'enregistrement du paiement dans Paiements d'inscription ou Paiements des cotisations."
    },
    stepLabel: 'Étape',
    paymentSteps: [
      {
        icon: WalletCards,
        title: 'Ouvrir la bonne page de paiement',
        description:
          "Utilisez Paiements d'inscription pour les frais des nouveaux membres et Paiements des cotisations pour les cotisations mensuelles."
      },
      {
        icon: CreditCard,
        title: "Envoyer l'argent avec Zelle",
        description:
          'Scannez le code QR ou cliquez dessus pour ouvrir les informations de paiement Zelle de SAGI, puis envoyez le montant exact requis.'
      },
      {
        icon: FileText,
        title: 'Écrire une note de paiement claire',
        description:
          'Incluez toujours SAGI-{code à 4 lettres} dans le mémo Zelle.'
      },
      {
        icon: Upload,
        title: 'Enregistrer le paiement dans SAGI',
        description:
          'Retournez à la page de paiement correspondante, remplissez le formulaire et téléversez votre confirmation ou votre reçu lorsque cela est demandé.'
      }
    ],
    beforeSubmit: {
      title: 'Avant de soumettre',
      description: "Utilisez ces vérifications pour éviter qu'un paiement soit retardé ou difficile à identifier."
    },
    reminders: [
      "Confirmez le montant avant d'envoyer le paiement.",
      'Incluez toujours SAGI-{code à 4 lettres} lorsque vous effectuez un paiement.',
      'Utilisez le même code à 4 lettres que celui qui apparaît dans votre tableau de bord SAGI.',
      "Gardez votre confirmation Zelle jusqu'à ce que le paiement apparaisse dans SAGI.",
      "Ne combinez pas les paiements d'inscription et de cotisation sans écrire une note claire."
    ]
  }
} as const

type PaymentInstructionsContentProps = {
  language?: AppLanguage
}

const PaymentInstructionsContent = ({ language = 'en' }: PaymentInstructionsContentProps) => {
  const copy = paymentInstructionsCopy[language]

  return (
    <section className='max-w-9xl mx-auto flex w-full flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8'>
      <div className='grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-stretch'>
        <div className='bg-card flex flex-col justify-center rounded-lg border p-6 shadow-sm sm:p-8'>
          <Badge className='mb-4 w-fit' variant='secondary'>
            {copy.badge}
          </Badge>
          <h1 className='text-foreground max-w-3xl text-3xl font-semibold tracking-normal sm:text-4xl'>
            {copy.title}
          </h1>
          <p className='text-muted-foreground mt-4 max-w-3xl text-base leading-7'>
            {copy.intro} <span className='text-primary font-bold'>{copy.memoReminder}</span>
          </p>
          <div className='mt-6 flex flex-col gap-3 sm:flex-row'>
            <Button asChild>
              <Link href='/contributions'>
                {copy.contributionsCta}
                <ArrowRight className='size-4' />
              </Link>
            </Button>
            <Button asChild variant='outline'>
              <Link href='/registrationsPayments'>{copy.registrationsCta}</Link>
            </Button>
          </div>
        </div>

        <Card className='overflow-hidden'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <CreditCard className='text-primary size-5' />
              {copy.zelle.title}
            </CardTitle>
            <CardDescription>
              {copy.zelle.descriptionStart}
              <br /> {copy.zelle.nameLabel}
              <span className='font-bold'> Active Solidarity Ltd</span> {copy.zelle.emailLabel}{' '}
              <span className='font-bold'>info@sagiusa.org </span>
              <br />
              {copy.zelle.descriptionEnd}
            </CardDescription>
          </CardHeader>
          <CardContent className='flex flex-col items-center gap-4'>
            <Link
              aria-label={copy.zelle.ariaLabel}
              className='bg-background hover:border-primary rounded-lg border p-4 transition'
              href={zellePaymentLink}
            >
              <Image
                alt={copy.zelle.imageAlt}
                className='h-auto w-full max-w-64'
                height={300}
                priority
                src='https://res.cloudinary.com/dp8tkb7hq/image/upload/v1778042720/sagiQrCode_jmwsbf.svg'
                width={300}
              />
            </Link>
            <p className='text-muted-foreground text-center text-sm'>{copy.zelle.after}</p>
          </CardContent>
        </Card>
      </div>

      <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-4'>
        {copy.paymentSteps.map((step, index) => {
          const Icon = step.icon

          return (
            <Card key={step.title}>
              <CardHeader>
                <div className='bg-primary/10 text-primary mb-3 flex size-11 items-center justify-center rounded-md'>
                  <Icon className='size-5' />
                </div>
                <CardDescription>
                  {copy.stepLabel} {index + 1}
                </CardDescription>
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
            {copy.beforeSubmit.title}
          </CardTitle>
          <CardDescription>{copy.beforeSubmit.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className='grid gap-3 sm:grid-cols-2'>
            {copy.reminders.map(reminder => (
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
