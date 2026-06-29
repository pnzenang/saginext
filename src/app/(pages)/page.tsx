import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowRightIcon,
  BadgeCheckIcon,
  BellRingIcon,
  CheckCircle2Icon,
  CircleDollarSignIcon,
  ClipboardCheckIcon,
  Clock3Icon,
  FileTextIcon,
  HeartHandshakeIcon,
  LayoutDashboardIcon,
  LockKeyholeIcon,
  ShieldCheckIcon,
  UploadCloudIcon,
  UserMinusIcon,
  UserPlusIcon,
  UsersRoundIcon,
  WalletCardsIcon
} from 'lucide-react'

import { faqData } from '@/assets/data/faq-section'
import { testimonialsData } from '@/assets/data/testimonials'
import FAQ from '@/components/blocks/faq-section'
import Testimonials from '@/components/blocks/testimonials-section/testimonials-section'
import ContactUs from '@/components/shadcn-studio/blocks/contact-us-page-02/contact-us-page-02'
import FuneralHomesPage from '@/components/shadcn-studio/blocks/funeralHomes'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

const heroStats = [
  { value: '$20', label: 'maximum monthly member contribution' },
  { value: '$20,000', label: 'family support after vesting' },
  { value: '30 days', label: 'target payout after documents' }
]

const steps = [
  {
    icon: UserPlusIcon,
    title: 'Register members',
    description: 'Delegates add individual, family, association, or group members to their dashboard.'
  },
  {
    icon: WalletCardsIcon,
    title: 'Contribute together',
    description: 'Members keep participation active through predictable, low-overhead contributions.'
  },
  {
    icon: BadgeCheckIcon,
    title: 'Stay vested',
    description: 'The platform makes member status clear before a family ever needs support.'
  },
  {
    icon: HeartHandshakeIcon,
    title: 'Receive support',
    description:
      'If affected, When documentation is complete, SAGI coordinates funeral assistance and payout processing.'
  }
]

const eligibilityHighlights = [
  'No health checks',
  'No age limitation',
  'No nationality limitation',
  'Any group size',
  'Individual, Families and associations welcome',
  'Self-service delegate dashboard'
]

const memberStatuses = [
  {
    name: 'Pending',
    badge: 'Registration started',
    icon: Clock3Icon,
    description: 'The member has started registration but is not eligible for benefits yet.',
    points: ['Waiting period is active', 'Registration fee not received', 'Benefits are not available yet'],
    className: 'border-amber-500/40 bg-amber-100 dark:bg-amber-500/20'
  },
  {
    name: 'Awaiting Publication',
    badge: 'Paid and waiting',
    icon: FileTextIcon,
    description: 'The member registration was paid, and the member is waiting to finish the waiting period.',
    points: ['Registration fee received.', 'Awaiting publication ', 'Benefits are not available yet.'],
    className: 'border-sky-500/40 bg-sky-100 dark:bg-sky-500/20'
  },
  {
    name: 'Vested',
    badge: 'Eligible',
    icon: ShieldCheckIcon,
    description: 'The member has satisfied the requirements and is eligible for family support.',
    points: ['Waiting period is complete', 'Registration is complete', 'Contributions are current'],
    className: 'border-emerald-500/40 bg-emerald-500/10',
    featured: true
  },
  {
    name: 'Not in Good Standing',
    badge: 'Action needed',
    icon: LockKeyholeIcon,
    description: 'The member has missed one or more contributions.',
    points: ['Missed contribution ', 'Eligibility is paused', 'Delegate can review next steps'],
    className: 'border-rose-500/40 bg-rose-100 dark:bg-rose-500/20'
  }
]

const benefitSchedule = [
  {
    status: 'Pending',
    benefit: '$0',
    timing: 'Registration started',
    description: 'Benefits are not available while registration, payment, and waiting-period steps are still open.',
    icon: Clock3Icon,
    rowClassName: 'bg-amber-100 dark:bg-amber-500/20',
    iconClassName: 'border-amber-500/40 bg-amber-500/20 text-amber-700 dark:text-amber-200'
  },
  {
    status: 'Awaiting Publication',
    benefit: '$0',
    timing: 'Paid and waiting',
    description: 'Benefits begin only after the waiting period is complete and the member is published as eligible.',
    icon: FileTextIcon,
    rowClassName: 'bg-sky-100 dark:bg-sky-500/20',
    iconClassName: 'border-sky-500/40 bg-sky-500/20 text-sky-700 dark:text-sky-200'
  },
  {
    status: 'Vested',
    benefit: 'Up to $20,000',
    timing: 'Eligible after approval',
    description: 'Family support is available when the member is vested, current, and required documents are approved.',
    icon: ShieldCheckIcon,
    rowClassName: 'bg-emerald-500/10',
    iconClassName: 'border-emerald-600 bg-emerald-600 text-white',
    featured: true
  },
  {
    status: 'Not in Good Standing',
    benefit: 'Canceled or paused',
    timing: 'Action needed',
    description: 'Benefits are canceled or paused while contribution or standing issues are unresolved.',
    icon: LockKeyholeIcon,
    rowClassName: 'bg-rose-100 dark:bg-rose-500/20',
    iconClassName: 'border-rose-500/40 bg-rose-500/20 text-rose-700 dark:text-rose-200'
  }
]

const dashboardActions = [
  {
    icon: UsersRoundIcon,
    title: 'Member records',
    description: 'Review member rosters, status, contributions, and changes without emailing back and forth.'
  },
  {
    icon: UserPlusIcon,
    title: 'Add members',
    description: 'Register new participants with the personal and beneficiary details SAGI requires.'
  },
  {
    icon: UserMinusIcon,
    title: 'Remove members',
    description: 'Keep the group clean when a member withdraws or no longer participates.'
  },
  {
    icon: UploadCloudIcon,
    title: 'Submit documents',
    description: 'Upload death announcement documentation and keep a traceable support record.'
  }
]

const trustStats = [
  { icon: CircleDollarSignIcon, value: '$15M+', label: 'distributed to families' },
  { icon: UsersRoundIcon, value: '800K+', label: 'families reached' },
  { icon: ClipboardCheckIcon, value: '17+', label: 'years of experience' },
  { icon: BellRingIcon, value: '24/7', label: 'online member access' }
]

const ruleHighlights = [
  'Members become eligible only after their waiting period and registration requirements are complete.',
  'Delegates can manage registrations, removals, death announcements, and document submissions online.',
  'SAGI helps coordinate funeral-home support while keeping contribution and member records visible.',
  'Participation is designed around solidarity: every member contributes so families are not left alone.'
]

const Home = () => {
  return (
    <>
      <HeroSection />
      <HowItWorksSection />
      <WhoCanJoinSection />
      <MemberStatusSection />
      <BenefitScheduleSection />
      <DelegateDashboardSection />
      <FuneralHomesPage />
      <TrustSection />
      <Testimonials testimonials={testimonialsData} />
      <FAQ faqItems={faqData} />
      <ContactUs />
    </>
  )
}

export default Home

function SectionIntro({
  eyebrow,
  title,
  description,
  align = 'center'
}: {
  eyebrow: string
  title: string
  description: string
  align?: 'center' | 'left'
}) {
  return (
    <div className={align === 'center' ? 'mx-auto max-w-3xl space-y-4 text-center' : 'max-w-3xl space-y-4'}>
      <Badge variant='outline' className='border-primary/40 text-primary bg-background/80 px-3 py-1 text-sm'>
        {eyebrow}
      </Badge>
      <h2 className='text-3xl font-semibold tracking-tight text-balance md:text-4xl lg:text-5xl'>{title}</h2>
      <p className='text-muted-foreground text-lg leading-8'>{description}</p>
    </div>
  )
}

function HeroSection() {
  return (
    <section
      id='home'
      className='relative isolate mt-3 min-h-[82svh] overflow-hidden pt-28 pb-16 sm:mt-4 sm:pt-32 lg:pt-36'
    >
      <Image
        src='/images/hero-compassionate-support.webp'
        alt='Family receiving compassionate guidance with support documents'
        fill
        priority
        sizes='100vw'
        className='-z-20 object-cover'
      />
      <div className='absolute inset-0 -z-10 bg-slate-950/45' />
      <div className='absolute inset-0 -z-10 bg-linear-to-r from-slate-950/75 via-slate-950/45 to-slate-950/10' />

      <div className='mx-auto flex max-w-7xl flex-col gap-12 px-4 sm:px-6 lg:px-8'>
        <div className='max-w-4xl space-y-7'>
          <Badge className='bg-white/12 text-white ring-1 ring-white/25 backdrop-blur-sm hover:bg-white/12'>
            Member-funded funeral support
          </Badge>
          <div className='space-y-5'>
            <h1 className='text-4xl font-semibold tracking-tight text-balance text-white sm:text-5xl lg:text-7xl'>
              SAGI: Active Solidarity Ltd.
            </h1>
            <p className='max-w-3xl text-lg leading-8 text-white/84 sm:text-xl'>
              A mutual aid community where low monthly contributions create real funeral support for families when it
              matters most.
            </p>
            <p className='max-w-3xl text-lg leading-8 text-white/84 sm:text-xl'>
              SAGI is a 501(c)(3) nonprofit organization.
            </p>
          </div>

          <div className='flex flex-wrap gap-3'>
            <Button asChild size='lg' className='rounded-full'>
              <Link href='/sign-up' prefetch={false}>
                Join SAGI
                <ArrowRightIcon className='size-4' />
              </Link>
            </Button>
            <Button
              asChild
              size='lg'
              variant='outline'
              className='rounded-full border-white/35 bg-white/10 text-white hover:bg-white/20 hover:text-white'
            >
              <Link href='/#how-it-works'>See how it works</Link>
            </Button>
          </div>
        </div>

        <div className='flex flex-col gap-6 border-t border-white/18 pt-6 text-white sm:flex-row sm:items-start sm:justify-between'>
          {heroStats.map((stat, index) => (
            <div
              key={stat.label}
              className={`space-y-1 ${
                index === 1 ? 'sm:text-center' : index === 2 ? 'sm:text-right' : ''
              }`}
            >
              <p className='text-3xl font-semibold sm:text-4xl'>{stat.value}</p>
              <p className='text-sm leading-6 text-white/72 sm:max-w-48'>{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function HowItWorksSection() {
  return (
    <section id='how-it-works' className='py-16 sm:py-20 lg:py-24'>
      <div className='mx-auto max-w-7xl space-y-12 px-4 sm:px-6 lg:px-8'>
        <SectionIntro
          eyebrow='How SAGI works'
          title='A clear path from registration to family support.'
          description='From first registration to urgent family support, every step is organized so members and delegates know what comes next.'
        />

        <ol className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
          {steps.map((step, index) => (
            <li key={step.title}>
              <Card className='h-full rounded-lg shadow-none'>
                <CardContent className='space-y-5'>
                  <div className='flex items-center justify-between gap-4'>
                    <div className='bg-primary/10 text-primary flex size-12 items-center justify-center rounded-lg'>
                      <step.icon className='size-6' />
                    </div>
                    <span className='text-muted-foreground font-mono text-sm'>0{index + 1}</span>
                  </div>
                  <div className='space-y-2'>
                    <h3 className='text-xl font-semibold'>{step.title}</h3>
                    <p className='text-muted-foreground leading-7'>{step.description}</p>
                  </div>
                </CardContent>
              </Card>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

function WhoCanJoinSection() {
  return (
    <section id='join' className='bg-muted py-16 sm:py-20 lg:py-24'>
      <div className='mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8'>
        <div className='relative min-h-88 overflow-hidden rounded-lg lg:min-h-full'>
          <Image
            src='/images/who-can-join-member.webp'
            alt='Black delegate reviewing member information on a phone'
            fill
            sizes='(min-width: 1024px) 40vw, 100vw'
            className='object-cover'
          />
        </div>

        <div className='space-y-8'>
          <SectionIntro
            eyebrow='Who can join'
            title='Built for individuals, families, associations, and groups.'
            description='SAGI should feel open and practical from the first visit: no health checks, no group-size ceiling, and no complicated gatekeeping.'
            align='left'
          />

          <div className='grid gap-3 sm:grid-cols-2'>
            {eligibilityHighlights.map(item => (
              <div key={item} className='bg-background flex items-start gap-3 rounded-lg border p-4'>
                <CheckCircle2Icon className='text-primary mt-0.5 size-5 shrink-0' />
                <span className='font-medium'>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function MemberStatusSection() {
  return (
    <section id='member-status' className='py-16 sm:py-20 lg:py-24'>
      <div className='mx-auto max-w-7xl space-y-12 px-4 sm:px-6 lg:px-8'>
        <SectionIntro
          eyebrow='Member status'
          title='Know exactly where every member stands.'
          description='These four statuses explain when a member is newly registered, awaiting publication, ready for support, or needs action.'
        />

        <div className='grid gap-5 md:grid-cols-2 xl:grid-cols-4'>
          {memberStatuses.map(status => (
            <Card
              key={status.name}
              className={`relative h-full overflow-hidden rounded-lg ${
                status.featured
                  ? `shadow-lg shadow-emerald-950/10 ${status.className}`
                  : `shadow-none ${status.className}`
              }`}
            >
              <CardContent className='flex h-full flex-col gap-6'>
                <div className='flex items-start justify-between gap-4'>
                  <div className='space-y-3'>
                    <Badge
                      variant={status.featured ? 'default' : 'secondary'}
                      className={status.featured ? 'bg-emerald-600 text-white hover:bg-emerald-600' : undefined}
                    >
                      {status.badge}
                    </Badge>
                    <h3 className='text-2xl font-semibold'>{status.name}</h3>
                  </div>
                  <div
                    className={`flex size-11 items-center justify-center rounded-lg border ${
                      status.featured ? 'border-emerald-600 bg-emerald-600 shadow-sm' : 'bg-background'
                    }`}
                  >
                    <status.icon className={status.featured ? 'size-5 text-white' : 'text-primary size-5'} />
                  </div>
                </div>

                <p className='text-muted-foreground leading-7'>{status.description}</p>

                <ul className='mt-auto space-y-3'>
                  {status.points.map(point => (
                    <li key={point} className='flex items-start gap-2 text-sm leading-6'>
                      <CheckCircle2Icon className='text-primary mt-1 size-4 shrink-0' />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

function BenefitScheduleSection() {
  return (
    <section id='benefit-schedule' className='bg-muted py-16 sm:py-20 lg:py-24'>
      <div className='mx-auto max-w-7xl space-y-10 px-4 sm:px-6 lg:px-8'>
        <div className='grid gap-6 lg:grid-cols-[1fr_26rem] lg:items-end'>
          <SectionIntro
            eyebrow='Benefit schedule'
            title='What support is available by member status.'
            description='A simple schedule helps families and delegates understand when support is available, paused, or still waiting on registration steps.'
            align='left'
          />

          <div className='bg-background overflow-hidden rounded-lg border p-2 shadow-sm lg:justify-self-end'>
            <Image
              src='/images/benefit-support-planning.jpg'
              alt='Family reviewing benefit support paperwork with an advisor'
              width={520}
              height={260}
              sizes='(min-width: 1024px) 416px, 100vw'
              className='h-44 w-full rounded-md object-cover object-center sm:h-52 lg:w-[26rem]'
            />
          </div>
        </div>

        <div className='bg-background overflow-hidden rounded-lg border'>
          <div className='bg-muted/60 text-muted-foreground hidden grid-cols-[1fr_0.8fr_1fr_1.35fr] gap-4 border-b px-5 py-3 text-sm font-medium md:grid'>
            <span>Status</span>
            <span>Benefit</span>
            <span>Timing</span>
            <span>What it means</span>
          </div>

          <div className='divide-y'>
            {benefitSchedule.map(item => (
              <div
                key={item.status}
                className={`grid gap-4 px-5 py-5 md:grid-cols-[1fr_0.8fr_1fr_1.35fr] md:items-center ${item.rowClassName}`}
              >
                <div className='flex items-center gap-3'>
                  <div className={`flex size-10 items-center justify-center rounded-lg border ${item.iconClassName}`}>
                    <item.icon className='size-5' aria-hidden='true' />
                  </div>
                  <div>
                    <p className='font-semibold'>{item.status}</p>
                    {item.featured && <p className='text-xs font-medium text-emerald-700'>Eligible status</p>}
                  </div>
                </div>

                <div>
                  <p className='text-muted-foreground text-xs font-medium md:hidden'>Benefit</p>
                  <p className='text-lg font-semibold'>{item.benefit}</p>
                </div>

                <div>
                  <p className='text-muted-foreground text-xs font-medium md:hidden'>Timing</p>
                  <p className='font-medium'>{item.timing}</p>
                </div>

                <p className='text-muted-foreground leading-7'>{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function DelegateDashboardSection() {
  return (
    <section id='delegate-dashboard' className='bg-muted py-16 sm:py-20 lg:py-24'>
      <div className='mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:px-8'>
        <div className='space-y-8'>
          <SectionIntro
            eyebrow='Delegate dashboard'
            title='Delegate working hub.'
            description='Delegates can manage the everyday details that keep member records current and support requests moving.'
            align='left'
          />

          <div className='grid gap-4 sm:grid-cols-2'>
            {dashboardActions.map(action => (
              <Card key={action.title} className='rounded-lg shadow-none'>
                <CardContent className='space-y-4'>
                  <div className='bg-background flex size-11 items-center justify-center rounded-lg border'>
                    <action.icon className='text-primary size-5' />
                  </div>
                  <div className='space-y-2'>
                    <h3 className='font-semibold'>{action.title}</h3>
                    <p className='text-muted-foreground text-sm leading-6'>{action.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className='grid gap-4'>
          <div className='bg-background overflow-hidden rounded-lg border p-3 shadow-sm'>
            <Image
              src='/images/all-members-table-preview.svg'
              alt='All members table preview'
              width={1060}
              height={640}
              className='h-auto w-full rounded-md'
            />
          </div>
          <div className='grid gap-4 sm:grid-cols-2'>
            <div className='bg-background overflow-hidden rounded-lg border p-3 shadow-sm'>
              <Image
                src='/images/add-member-form-preview.svg'
                alt='Add member form preview'
                width={600}
                height={460}
                className='h-auto w-full rounded-md'
              />
            </div>
            <div className='bg-background overflow-hidden rounded-lg border p-3 shadow-sm'>
              <Image
                src='/images/death-announcement-form-preview.svg'
                alt='Death announcement form preview'
                width={600}
                height={460}
                className='h-auto w-full rounded-md'
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function TrustSection() {
  return (
    <section id='trust' className='py-16 sm:py-20 lg:py-24'>
      <div className='mx-auto max-w-7xl space-y-12 px-4 sm:px-6 lg:px-8'>
        <div className='grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-start'>
          <SectionIntro
            eyebrow='Trust and rules'
            title='Show the rules before families need them.'
            description='Trust comes from clear expectations: who is eligible, what delegates can do, and what support looks like during a hard moment.'
            align='left'
          />

          <div className='grid gap-4 sm:grid-cols-2'>
            {trustStats.map(stat => (
              <Card key={stat.label} className='rounded-lg shadow-none'>
                <CardContent className='space-y-4'>
                  <div className='text-primary bg-primary/10 flex size-11 items-center justify-center rounded-lg'>
                    <stat.icon className='size-5' />
                  </div>
                  <div>
                    <p className='text-3xl font-semibold'>{stat.value}</p>
                    <p className='text-muted-foreground leading-7'>{stat.label}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className='grid gap-4 md:grid-cols-2'>
          {ruleHighlights.map(rule => (
            <div key={rule} className='bg-muted/50 flex gap-3 rounded-lg border p-5'>
              <FileTextIcon className='text-primary mt-1 size-5 shrink-0' />
              <p className='text-muted-foreground leading-7'>{rule}</p>
            </div>
          ))}
        </div>

        <div className='bg-primary/10 flex flex-wrap items-center justify-between gap-4 rounded-lg border p-5'>
          <div className='flex items-center gap-3'>
            <LayoutDashboardIcon className='text-primary size-6 shrink-0' />
            <p className='font-medium'>
              Delegates can manage members, documents, and contributions from the dashboard.
            </p>
          </div>
          <Button asChild variant='outline' className='rounded-full'>
            <Link href='/sign-in' prefetch={false}>
              Login
              <ArrowRightIcon className='size-4' />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
