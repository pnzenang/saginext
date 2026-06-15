import Link from 'next/link'
import {
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  FileBadge,
  FileStack,
  FileText,
  Home,
  IdCard,
  Plane,
  ShieldCheck
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const documentExamples = [
  {
    icon: FileText,
    title: 'Case details',
    description:
      'Include the association name and code, deceased full name, matricule number, membership date, and date and place of death.'
  },
  {
    icon: FileBadge,
    title: 'Death certificate',
    description: 'Upload the death certificate. The cause of death may be hidden before submission.'
  },
  {
    icon: IdCard,
    title: 'Identification',
    description:
      "Upload the SAGI membership ID when available, plus a picture ID such as ID, driver's license, or passport."
  },
  {
    icon: Home,
    title: 'Funeral home invoice',
    description: 'Include the funeral home invoice and any related funeral service documents.'
  }
]

const uploadChecklist = [
  'Family contact.',
  'Association name and code.',
  'Deceased full name.',
  'Matricule number.',
  'Membership date.',
  'Date and place of death.',
  'Death certificate. You can hide the cause of death before submission.',
  'SAGI membership ID, if available.',
  'Picture with a clear and visible face for a presentable contribution chart.',
  "Picture ID, such as ID, driver's license, or passport.",
  'Funeral home invoice.',
  'Confirmation that the association is in good standing with no outstanding invoices',
  'Funeral Program.'
]

const outOfUsChecklist = [
  'Certified copy of the death certificate by the Ministry of External Relations of the country where the death occurred.',
  'Proof that the death has been reported to the Social Security Administration.',
  'For a US citizen, obtain the Consular Report of Death from American Citizen Services in the consular section of the embassy.',
  "Copy of the deceased's green card and passport or US passport, including the VISA page.",
  "Copy of the deceased's trip ticket or tickets."
]

const importantNotes = [
  'Death documentation is uploaded after the death has been announced.',
  'The initial death announcement does not require documents.',
  'All death-related documents should stay together in Death Documentations.',
  'Upload clear images or PDF files so the admin can review the information without delay.',
  'Do not send death documents through unrelated forms such as registration or contribution payment forms.',
  'If more documents become available later, return to Death Documentations and upload them there.'
]

const DeathDocumentations = () => {
  return (
    <section className='max-w-9xl mx-auto flex w-full flex-col gap-6 px-3 py-4 sm:px-6 sm:py-6 lg:px-8'>
      <div className='bg-card rounded-lg border p-6 shadow-sm sm:p-8'>
        <Badge className='mb-4 w-fit' variant='secondary'>
          Death Documentation Instructions
        </Badge>
        <div className='grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center'>
          <div>
            <h1 className='text-foreground max-w-4xl text-3xl font-semibold tracking-normal sm:text-4xl'>
              Upload death-related documents through Death Documentations
            </h1>
            <div className='text-muted-foreground mt-4 max-w-4xl space-y-3 text-base leading-7'>
              <p>
                After a member&apos;s death has been announced, all death-related documents should be uploaded through
                the dashboard link named Death Documentations. This keeps the deceased member&apos;s documents in the
                correct place for admin review.
              </p>
              <p>
                Use Death Documentations for the family contact, association details, deceased member details, death
                certificate, SAGI membership ID when available, clear picture, picture ID, funeral home invoice, and any
                other document related to the death or funeral arrangements.
              </p>
              <p>
                It is better to gather all required documents first and upload them at once when possible. This helps
                keep the case complete and makes the admin review easier and avoid confusion and delays.
              </p>
              <p>
                Please do not upload these files through registration, contribution, or other unrelated forms. Returning
                to Death Documentations whenever new documents are ready helps the admin team review the case clearly.
              </p>
            </div>
            <div className='mt-6 flex flex-col gap-3 sm:flex-row'>
              <Button asChild>
                <Link href='/death-documentations'>
                  Open Death Documentations
                  <ArrowRight className='size-4' />
                </Link>
              </Button>
              <Button asChild variant='outline'>
                <Link href='/navigation-instructions/deathAnnouncement'>Review Death Announcement</Link>
              </Button>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <ShieldCheck className='text-primary size-5' />
                Main Rule
              </CardTitle>
              <CardDescription>Use one place for all documents connected to the death.</CardDescription>
            </CardHeader>
            <CardContent className='text-muted-foreground space-y-3 text-sm leading-6'>
              <p>
                The correct upload location is the dashboard link named Death Documentations. That page is where the
                death certificate, family contact, funeral papers, identification, pictures, and other supporting files
                should be submitted.
              </p>
              <p>
                The death announcement records that the member has passed away. Death Documentations stores the proof
                and supporting documents after they are ready.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-4'>
        {documentExamples.map(example => {
          const Icon = example.icon

          return (
            <Card key={example.title}>
              <CardHeader>
                <div className='bg-primary/10 text-primary mb-3 flex size-11 items-center justify-center rounded-md'>
                  <Icon className='size-5' />
                </div>
                <CardTitle className='text-lg'>{example.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className='text-muted-foreground text-sm leading-6'>{example.description}</p>
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
              Required Documents
            </CardTitle>
            <CardDescription>Gather these items before submitting the death documentation.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className='grid gap-3'>
              {uploadChecklist.map(item => (
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
              <Plane className='text-primary size-5' />
              If Death Occurred Out of the US
            </CardTitle>
            <CardDescription>Upload these additional documents when the death occurred outside the US.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className='grid gap-3'>
              {outOfUsChecklist.map(item => (
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
            <FileStack className='text-primary size-5' />
            Important Notes
          </CardTitle>
          <CardDescription>Documents and announcements are handled in separate steps.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className='grid gap-3 md:grid-cols-2'>
            {importantNotes.map(item => (
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

export default DeathDocumentations
