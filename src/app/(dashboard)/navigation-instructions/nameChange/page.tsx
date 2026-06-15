import Link from 'next/link'
import { ArrowRight, CheckCircle2, ClipboardCheck, FileCheck2, FileText, ShieldCheck, Type } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const requestTypes = [
  {
    icon: Type,
    title: 'Typo or error correction',
    description:
      'Use this for spelling mistakes, missing letters, wrong order, or small data-entry errors. These corrections do not need documentation.'
  },
  {
    icon: FileCheck2,
    title: 'Name change',
    description:
      'Use this when the member has changed their name. A real name change requires supporting name-change documentation.'
  }
]

const reportChecklist = [
  'Open the sidebar link named Name Change & Documentations.',
  'Report every name correction or name change through that page.',
  'Choose error correction when the issue is only a typo or data-entry mistake.',
  'Choose name change when the member is officially changing from one name to another.',
  'Upload name-change documentation when the request is a true name change.'
]

const documentationRules = [
  'Typo corrections do not need documentation.',
  'A name change requires name-change documentation.',
  'Documentation should clearly support the new name being requested.',
  'Do not submit name-change documents through unrelated forms.'
]

const NameChange = () => {
  return (
    <section className='max-w-9xl mx-auto flex w-full flex-col gap-6 px-3 py-4 sm:px-6 sm:py-6 lg:px-8'>
      <div className='bg-card rounded-lg border p-6 shadow-sm sm:p-8'>
        <Badge className='mb-4 w-fit' variant='secondary'>
          Name Change Instructions
        </Badge>
        <div className='grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center'>
          <div>
            <h1 className='text-foreground max-w-4xl text-3xl font-semibold tracking-normal sm:text-4xl'>
              Report name changes through Name Change & Documentations
            </h1>
            <div className='text-muted-foreground mt-4 max-w-4xl space-y-3 text-base leading-7'>
              <p>
                All name changes and name corrections should be reported through the sidebar link named Name Change &
                Documentations. This keeps every request in one place so the admin team can review and update the member
                record correctly.
              </p>
              <p>
                If the request is only an error correction, such as a typo, misspelling, missing letter, or other small
                data-entry mistake, documentation is not required. The request should still be reported through Name
                Change & Documentations.
              </p>
              <p>
                If the member is changing from one name to another, that is a name change. A name change requires
                supporting name-change documentation before the record can be updated.
              </p>
            </div>
            <div className='mt-6 flex flex-col gap-3 sm:flex-row'>
              <Button asChild>
                <Link href='/name-modification'>
                  Open Name Change & Documentations
                  <ArrowRight className='size-4' />
                </Link>
              </Button>
              <Button asChild variant='outline'>
                <Link href='/all-members'>Review Members</Link>
              </Button>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <ShieldCheck className='text-primary size-5' />
                Main Rule
              </CardTitle>
              <CardDescription>Correction and name change requests do not require the same proof.</CardDescription>
            </CardHeader>
            <CardContent className='text-muted-foreground space-y-3 text-sm leading-6'>
              <p>
                A typo correction does not require documentation because it fixes an error already in the member record.
              </p>
              <p>
                A true name change requires documentation because the member is asking SAGI to change the recorded name
                to a different name.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className='grid gap-4 md:grid-cols-2'>
        {requestTypes.map(request => {
          const Icon = request.icon

          return (
            <Card key={request.title}>
              <CardHeader>
                <div className='bg-primary/10 text-primary mb-3 flex size-11 items-center justify-center rounded-md'>
                  <Icon className='size-5' />
                </div>
                <CardTitle className='text-lg'>{request.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className='text-muted-foreground text-sm leading-6'>{request.description}</p>
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
              How to Report It
            </CardTitle>
            <CardDescription>Use the same sidebar link for corrections and name changes.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className='grid gap-3'>
              {reportChecklist.map(item => (
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
              <FileText className='text-primary size-5' />
              Documentation Rules
            </CardTitle>
            <CardDescription>Only true name changes need supporting documents.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className='grid gap-3'>
              {documentationRules.map(item => (
                <li className='text-muted-foreground flex gap-3 text-sm leading-6' key={item}>
                  <CheckCircle2 className='text-primary mt-0.5 size-5 shrink-0' />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}

export default NameChange
