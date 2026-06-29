import Link from 'next/link'

import {
  ArrowRightIcon,
  Building2Icon,
  ClipboardCheckIcon,
  FileTextIcon,
  HeartHandshakeIcon,
  PlaneIcon,
  PhoneCallIcon,
  ShieldCheckIcon
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { MotionPreset } from '@/components/ui/motion-preset'

const nextSteps = [
  {
    icon: PhoneCallIcon,
    title: 'Make the first call',
    description:
      'If the death was unexpected or there is an emergency, call 911 first. If your loved one was under hospice, hospital, or facility care, contact that care team so the death can be officially pronounced.'
  },
  {
    icon: HeartHandshakeIcon,
    title: 'Notify SAGI or your delegate',
    description:
      'Call SAGI or your group delegate with the member name, association code, date and place of death, and the best family contact.'
  },
  {
    icon: Building2Icon,
    title: 'Choose a funeral home',
    description:
      'The family may choose any funeral provider or compare options on Funeralocity. When possible, SAGI can help coordinate with a partner funeral home.',
    href: 'https://www.funeralocity.com',
    linkLabel: 'Search Funeralocity'
  },
  {
    icon: FileTextIcon,
    title: 'Gather the key documents',
    description:
      'Keep the death certificate or official proof of death, member details, beneficiary information, family contact, and funeral-home contact information together.'
  },
  {
    icon: ClipboardCheckIcon,
    title: 'Submit the death announcement',
    description:
      'The delegate submits the death announcement and required documentation in the dashboard. SAGI can guide the family or delegate through missing items.'
  },
  {
    icon: ShieldCheckIcon,
    title: 'SAGI reviews and coordinates support',
    description:
      'SAGI verifies the member status, contribution record, and documents, then coordinates the eligible funeral support and payout process.'
  }
]

const documentChecklist = [
  'Family contact name and phone number',
  'Association name and four-letter association code',
  'Deceased member full name, matricule number, and membership date',
  'Date, place, and country of death',
  'Death certificate; the cause of death may be hidden before submission',
  'SAGI membership ID, if available',
  "Picture ID, such as ID, driver's license, or passport",
  'Clear picture with a visible face for the contribution chart',
  'Funeral home invoice and funeral service documents',
  'Funeral program, when available',
  'Confirmation that the association is in good standing with no outstanding invoices'
]

const internationalDocumentChecklist = [
  'Certified copy of the death certificate by the Ministry of External Relations of the country where the death occurred',
  'Proof that the death has been reported to the Social Security Administration',
  'For a US citizen, obtain the Consular Report of Death from American Citizen Services in the consular section of the embassy',
  "Copy of the deceased's green card and passport or US passport, including the visa page",
  "Copy of the deceased's trip ticket or tickets"
]

const FuneralHomesPage = () => {
  return (
    <section className='bg-muted/40 py-16 sm:py-20 lg:py-24' id='funeral-homes'>
      <div className='mx-auto max-w-7xl space-y-10 px-4 sm:px-6 lg:px-8'>
        <div className='grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-end'>
          <div className='space-y-4'>
            <MotionPreset fade slide={{ direction: 'down', offset: 50 }} blur transition={{ duration: 0.5 }}>
              <Badge variant='outline' className='border-primary/40 text-primary bg-background/80 px-3 py-1 text-sm'>
                Funeral support process
              </Badge>
            </MotionPreset>

            <MotionPreset
              component='h2'
              className='text-3xl font-semibold tracking-tight text-balance md:text-4xl lg:text-5xl'
              fade
              slide={{ direction: 'down', offset: 50 }}
              blur
              delay={0.1}
              transition={{ duration: 0.5 }}
            >
              What to do after a loved one passes
            </MotionPreset>
          </div>

          <MotionPreset
            component='p'
            className='text-muted-foreground text-base leading-7 sm:text-lg'
            fade
            blur
            slide={{ direction: 'down', offset: 50 }}
            delay={0.2}
            transition={{ duration: 0.5 }}
          >
            SAGI does not run funeral homes, but families should not have to figure out the next step alone. This guide
            keeps the first calls, documents, and SAGI review process clear during a difficult moment.
          </MotionPreset>
        </div>

        <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-3'>
          {nextSteps.map((step, index) => {
            const Icon = step.icon

            return (
              <MotionPreset
                key={step.title}
                fade
                blur
                slide={{ direction: 'down', offset: 24 }}
                delay={0.1 + index * 0.05}
                transition={{ duration: 0.45 }}
              >
                <Card className='h-full rounded-lg shadow-none'>
                  <CardContent className='flex h-full flex-col gap-5'>
                    <div className='flex items-start justify-between gap-4'>
                      <div className='bg-primary/10 text-primary flex size-12 items-center justify-center rounded-lg'>
                        <Icon className='size-6' aria-hidden='true' />
                      </div>
                      <span className='text-muted-foreground font-mono text-sm'>0{index + 1}</span>
                    </div>

                    <div className='space-y-2'>
                      <h3 className='text-xl font-semibold'>{step.title}</h3>
                      <p className='text-muted-foreground leading-7'>{step.description}</p>
                    </div>

                    {step.href && (
                      <Button asChild variant='outline' size='sm' className='mt-auto w-fit rounded-full'>
                        <a href={step.href} target='_blank' rel='noreferrer'>
                          {step.linkLabel}
                          <ArrowRightIcon className='size-4' aria-hidden='true' />
                        </a>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </MotionPreset>
            )
          })}
        </div>

        <MotionPreset fade blur slide={{ direction: 'down', offset: 24 }} delay={0.3} transition={{ duration: 0.5 }}>
          <div className='grid gap-6 rounded-lg border bg-background p-5 md:grid-cols-[1fr_0.85fr] md:p-6 lg:p-8'>
            <div className='space-y-6'>
              <div className='space-y-2'>
                <h3 className='text-2xl font-semibold'>Documentation needed</h3>
                <p className='text-muted-foreground leading-7'>
                  After the death announcement is recorded, keep these documents together for the Death Documentations
                  upload and SAGI review.
                </p>
              </div>

              <div className='grid gap-3 sm:grid-cols-2'>
                {documentChecklist.map(item => (
                  <div key={item} className='flex items-start gap-3'>
                    <ClipboardCheckIcon className='text-primary mt-0.5 size-5 shrink-0' aria-hidden='true' />
                    <p className='text-muted-foreground leading-6'>{item}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className='flex flex-col gap-5 self-start'>
              <div className='rounded-lg border bg-muted/40 p-4'>
                <div className='mb-3 flex items-center gap-2'>
                  <PlaneIcon className='text-primary size-5 shrink-0' aria-hidden='true' />
                  <h4 className='font-semibold'>If the death occurred outside the United States</h4>
                </div>
                <div className='grid gap-3'>
                  {internationalDocumentChecklist.map(item => (
                    <div key={item} className='flex items-start gap-3'>
                      <FileTextIcon className='text-primary mt-0.5 size-4 shrink-0' aria-hidden='true' />
                      <p className='text-muted-foreground text-sm leading-6'>{item}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className='bg-primary/10 flex flex-col gap-5 rounded-lg border p-5'>
                <div className='space-y-2'>
                  <p className='text-lg font-semibold'>Need help preparing the documents?</p>
                  <p className='text-muted-foreground text-sm leading-6'>
                    Call SAGI and we can guide the family or delegate through what to gather before uploading the death
                    documentation.
                  </p>
                </div>

                <div className='flex flex-wrap gap-3'>
                  <Button asChild className='rounded-full'>
                    <a href='tel:+18042146390'>Call SAGI</a>
                  </Button>
                  <Button asChild variant='outline' className='rounded-full'>
                    <Link href='/sign-in' prefetch={false}>
                      Open dashboard
                      <ArrowRightIcon className='size-4' aria-hidden='true' />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </MotionPreset>
      </div>
    </section>
  )
}

export default FuneralHomesPage
