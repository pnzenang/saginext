import {
  AlertTriangle,
  CheckCircle2,
  Download,
  FileText,
  ShieldCheck,
  Target,
  UserPlus,
  Users,
  WalletCards
} from 'lucide-react'
import Link from 'next/link'

import FormContainer from '@/components/forms/FormContainer'
import { SubmitButton } from '@/components/forms/Buttons'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { acceptInternalRulesAction, fetchProfile } from '@/utils/profile-actions'
import { internalRulesAtGlance, internalRulesDownloadFileName } from '@/utils/internal-rules-at-glance'

const ruleIcons = [UserPlus, Users, Target, ShieldCheck, WalletCards, FileText, AlertTriangle]

const acceptedDateFormatter = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium',
  timeStyle: 'short'
})

const InternalRules = async () => {
  const profile = await fetchProfile({ requireInternalRulesAccepted: false })
  const hasAcceptedInternalRules = Boolean(profile.internalRulesAcceptedAt)

  return (
    <section className='flex w-full max-w-none flex-col gap-6 px-0 py-4 sm:py-6'>
      <div className='bg-muted/30 flex flex-col gap-4 rounded-lg border p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between'>
        <div className='max-w-3xl'>
          <Badge variant='secondary' className='mb-3 w-fit'>
            Last Revised: Oct 1, 2025
          </Badge>
          <h1 className='text-foreground text-2xl font-semibold tracking-normal sm:text-3xl'>
            Internal Rules At Glance
          </h1>
          <p className='text-muted-foreground mt-3 text-sm leading-6 sm:text-base'>
            A quick summary of the SAGI internal rules PDF, covering governance, membership, list updates, fraud, death
            announcements, contributions, disbursements, penalties, and fees.
          </p>
        </div>
        <Button asChild className='w-full sm:w-fit'>
          <a href='/internal-rules/download' download={internalRulesDownloadFileName}>
            <Download aria-hidden='true' />
            Download PDF
          </a>
        </Button>
      </div>

      <div className='border-primary/20 bg-primary/5 flex flex-col gap-4 rounded-lg border p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between'>
        <div className='max-w-3xl'>
          <h2 className='text-foreground text-lg font-semibold'>Internal Rules Acknowledgement</h2>
          <p className='text-muted-foreground mt-2 text-sm leading-6'>
            {hasAcceptedInternalRules
              ? `Accepted on ${acceptedDateFormatter.format(profile.internalRulesAcceptedAt!)}.`
              : 'Please read the Internal Rules PDF and confirm that you agree before continuing to the dashboard.'}
          </p>
        </div>
        {hasAcceptedInternalRules ? (
          <Button asChild className='w-full sm:w-fit'>
            <Link href='/navigation-instructions'>Continue</Link>
          </Button>
        ) : (
          <FormContainer action={acceptInternalRulesAction} className='max-w-2xl lg:max-w-xl'>
            <label className='border-primary/30 bg-background flex items-start gap-3 rounded-md border p-4 text-sm leading-6'>
              <input
                className='border-primary mt-1 size-4 shrink-0 accent-current'
                name='internalRulesAccepted'
                required
                type='checkbox'
                value='accepted'
              />
              <span>I have read and agree to the terms in the SAGI Internal Rules.</span>
            </label>
            <SubmitButton text='Agree and Continue' className='mt-3 w-full sm:w-fit' />
          </FormContainer>
        )}
      </div>

      <div className='grid w-full gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4'>
        {internalRulesAtGlance.map((rule, index) => {
          const Icon = ruleIcons[index] ?? CheckCircle2

          return (
            <Card key={rule.title} className='h-full gap-3'>
              <CardHeader>
                <div className='bg-primary/10 text-primary mb-2 flex size-10 items-center justify-center rounded-md'>
                  <Icon className='size-5' aria-hidden='true' />
                </div>
                <Badge variant='outline' className='w-fit'>
                  Rule {index + 1}
                </Badge>
                <CardTitle className='text-lg leading-tight'>{rule.title}</CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <p className='text-muted-foreground text-sm leading-6'>{rule.summary}</p>
                <ul className='grid gap-2 text-sm leading-6'>
                  {rule.bullets.map(bullet => (
                    <li key={bullet} className='flex gap-2'>
                      <CheckCircle2 className='text-primary mt-0.5 size-4 shrink-0' aria-hidden='true' />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className='border-primary/20 bg-primary/5 text-primary flex gap-3 rounded-lg border p-4 text-sm leading-6'>
        <ShieldCheck className='mt-0.5 size-5 shrink-0' aria-hidden='true' />
        <p>
          This page is a quick reference only. Use the downloaded Internal Rules PDF as the complete reference when more
          detail is needed.
        </p>
      </div>
    </section>
  )
}

export default InternalRules
