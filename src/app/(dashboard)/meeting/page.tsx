import Link from 'next/link'

import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CalendarRange,
  Clock,
  ExternalLink,
  Info,
  Video
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getDashboardLanguage } from '@/lib/get-dashboard-language'
import type { AppLanguage } from '@/lib/i18n'

type MeetingPageProps = {
  searchParams?: Promise<{
    year?: string | string[]
  }>
}

type MeetingDate = {
  date: Date
  dateKey: string
}

const meetingUrl = process.env.SAGI_DELEGATE_GOOGLE_MEET_URL?.trim() ?? ''
const minimumYear = 2024
const maximumYearOffset = 10

const meetingPageCopy = {
  en: {
    badge: 'Delegate meeting',
    title: 'Monthly Delegate Meeting',
    description:
      'SAGI holds a virtual meeting with delegates on the last Sunday of every month. Use this page to review the yearly schedule and join the shared Google Meet.',
    join: 'Join Google Meet',
    linkUnavailable: 'Google Meet link not configured yet.',
    linkUnavailableDescription: 'Set SAGI_DELEGATE_GOOGLE_MEET_URL in the environment to show the meeting link here.',
    scheduleTitle: (year: number) => `${year} meeting schedule`,
    scheduleDescription: 'Each date below is the last Sunday of the month.',
    previousYear: 'Previous year',
    nextYear: 'Next year',
    recurringRule: 'Recurring rule',
    recurringRuleValue: 'Every last Sunday of the month',
    timeLabel: 'Time',
    meetingTime: '6:00 PM - 7:00 PM Eastern Time',
    nextMeeting: 'Next meeting',
    today: 'Today',
    timeNoteTitle: 'Meeting time',
    timeNoteDescription: 'Delegate meetings are scheduled from 6:00 PM to 7:00 PM Eastern Time.'
  },
  fr: {
    badge: 'Réunion des délégués',
    title: 'Réunion mensuelle des délégués',
    description:
      'SAGI organise une réunion virtuelle avec les délégués le dernier dimanche de chaque mois. Utilisez cette page pour consulter le calendrier annuel et rejoindre le Google Meet partagé.',
    join: 'Rejoindre Google Meet',
    linkUnavailable: "Le lien Google Meet n'est pas encore configuré.",
    linkUnavailableDescription:
      "Ajoutez SAGI_DELEGATE_GOOGLE_MEET_URL dans l'environnement pour afficher le lien de réunion ici.",
    scheduleTitle: (year: number) => `Calendrier des réunions ${year}`,
    scheduleDescription: 'Chaque date ci-dessous est le dernier dimanche du mois.',
    previousYear: 'Année précédente',
    nextYear: 'Année suivante',
    recurringRule: 'Règle récurrente',
    recurringRuleValue: 'Chaque dernier dimanche du mois',
    timeLabel: 'Heure',
    meetingTime: "18 h 00 - 19 h 00, heure de l'Est",
    nextMeeting: 'Prochaine réunion',
    today: "Aujourd'hui",
    timeNoteTitle: 'Heure de la réunion',
    timeNoteDescription: "Les réunions des délégués sont prévues de 18 h 00 à 19 h 00, heure de l'Est."
  }
} as const

const dateFormatters: Record<AppLanguage, Intl.DateTimeFormat> = {
  en: new Intl.DateTimeFormat('en-US', {
    dateStyle: 'full',
    timeZone: 'UTC'
  }),
  fr: new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'full',
    timeZone: 'UTC'
  })
}

const monthFormatters: Record<AppLanguage, Intl.DateTimeFormat> = {
  en: new Intl.DateTimeFormat('en-US', {
    month: 'long',
    timeZone: 'UTC'
  }),
  fr: new Intl.DateTimeFormat('fr-FR', {
    month: 'long',
    timeZone: 'UTC'
  })
}

const getDateKey = (date: Date) => date.toISOString().slice(0, 10)

const getLastSundayOfMonth = (year: number, monthIndex: number) => {
  const lastDayOfMonth = new Date(Date.UTC(year, monthIndex + 1, 0, 12))
  const lastSundayDate = lastDayOfMonth.getUTCDate() - lastDayOfMonth.getUTCDay()

  return new Date(Date.UTC(year, monthIndex, lastSundayDate, 12))
}

const getMeetingDatesForYear = (year: number): MeetingDate[] =>
  Array.from({ length: 12 }, (_, monthIndex) => {
    const date = getLastSundayOfMonth(year, monthIndex)

    return {
      date,
      dateKey: getDateKey(date)
    }
  })

const getSelectedYear = (rawYear: string | string[] | undefined, currentYear: number) => {
  const parsedYear = Number(Array.isArray(rawYear) ? rawYear[0] : rawYear)
  const maxYear = currentYear + maximumYearOffset

  if (!Number.isInteger(parsedYear)) return currentYear

  return Math.min(Math.max(parsedYear, minimumYear), maxYear)
}

const getMeetingHref = (year: number) => `/meeting?year=${year}`

const MeetingPage = async ({ searchParams }: MeetingPageProps) => {
  const [language, resolvedSearchParams] = await Promise.all([getDashboardLanguage(), searchParams])
  const copy = meetingPageCopy[language]
  const now = new Date()
  const currentYear = now.getUTCFullYear()
  const todayKey = getDateKey(new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 12)))
  const selectedYear = getSelectedYear(resolvedSearchParams?.year, currentYear)
  const meetingDates = getMeetingDatesForYear(selectedYear)

  const upcomingMeeting =
    [...getMeetingDatesForYear(currentYear), ...getMeetingDatesForYear(currentYear + 1)].find(
      meeting => meeting.dateKey >= todayKey
    ) ?? getMeetingDatesForYear(currentYear)[0]

  return (
    <section className='grid w-full max-w-full min-w-0 gap-5 overflow-visible px-0 py-4 sm:px-6 sm:py-8 lg:px-8'>
      <div className='grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,0.42fr)] lg:items-stretch'>
        <Card className='rounded-lg py-0'>
          <CardHeader className='gap-3 px-4 py-5 sm:px-6'>
            <Badge variant='secondary' className='w-fit'>
              <Video className='size-3.5' />
              {copy.badge}
            </Badge>
            <div className='grid gap-2'>
              <CardTitle className='text-2xl font-extrabold tracking-normal sm:text-3xl'>{copy.title}</CardTitle>
              <CardDescription className='max-w-3xl text-sm leading-6 sm:text-base'>{copy.description}</CardDescription>
            </div>
            <div className='flex flex-col gap-2 sm:flex-row sm:flex-wrap'>
              {meetingUrl ? (
                <Button asChild className='w-full sm:w-fit'>
                  <a href={meetingUrl} target='_blank' rel='noreferrer'>
                    <Video className='size-4' />
                    {copy.join}
                    <ExternalLink className='size-4' />
                  </a>
                </Button>
              ) : (
                <Button disabled className='w-full sm:w-fit'>
                  <Video className='size-4' />
                  {copy.linkUnavailable}
                </Button>
              )}
            </div>
            {!meetingUrl ? (
              <p className='text-muted-foreground max-w-3xl text-xs leading-5'>{copy.linkUnavailableDescription}</p>
            ) : null}
          </CardHeader>
        </Card>

        <Card className='rounded-lg py-0'>
          <CardHeader className='px-4 py-5 sm:px-6'>
            <CardTitle className='flex items-center gap-2 text-base font-extrabold'>
              <CalendarDays className='text-primary size-5' />
              {copy.nextMeeting}
            </CardTitle>
            <CardDescription>{copy.recurringRuleValue}</CardDescription>
          </CardHeader>
          <CardContent className='grid gap-3 px-4 pb-5 sm:px-6'>
            <div className='bg-primary/10 text-primary rounded-md border px-4 py-3'>
              <p className='text-sm font-semibold capitalize'>
                {monthFormatters[language].format(upcomingMeeting.date)}
              </p>
              <p className='mt-1 text-xl font-black'>{dateFormatters[language].format(upcomingMeeting.date)}</p>
            </div>
            <div className='bg-background rounded-md border px-4 py-3'>
              <p className='text-muted-foreground text-xs font-semibold uppercase'>{copy.timeLabel}</p>
              <p className='mt-1 text-sm font-bold'>{copy.meetingTime}</p>
            </div>
            <div className='bg-background rounded-md border px-4 py-3'>
              <p className='text-muted-foreground text-xs font-semibold uppercase'>{copy.recurringRule}</p>
              <p className='mt-1 text-sm font-bold'>{copy.recurringRuleValue}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className='rounded-lg py-0'>
        <CardHeader className='gap-3 px-4 py-5 sm:px-6'>
          <div className='grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center'>
            <div>
              <CardTitle className='flex items-center gap-2 text-xl font-extrabold'>
                <CalendarRange className='text-primary size-5' />
                {copy.scheduleTitle(selectedYear)}
              </CardTitle>
              <CardDescription className='mt-1'>{copy.scheduleDescription}</CardDescription>
            </div>
            <div className='grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:justify-end'>
              <Button asChild variant='outline' size='sm'>
                <Link href={getMeetingHref(selectedYear - 1)}>
                  <ArrowLeft className='size-4' />
                  {copy.previousYear}
                </Link>
              </Button>
              <Button asChild variant='outline' size='sm'>
                <Link href={getMeetingHref(selectedYear + 1)}>
                  {copy.nextYear}
                  <ArrowRight className='size-4' />
                </Link>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className='grid gap-3 px-4 pb-5 sm:grid-cols-2 sm:px-6 xl:grid-cols-3'>
          {meetingDates.map(meeting => {
            const isToday = meeting.dateKey === todayKey
            const isUpcomingMeeting = meeting.dateKey === upcomingMeeting.dateKey

            return (
              <div
                key={meeting.dateKey}
                className='bg-background grid min-h-28 gap-2 rounded-md border px-4 py-3'
              >
                <div className='flex items-start justify-between gap-3'>
                  <div>
                    <p className='text-muted-foreground text-xs font-semibold uppercase'>
                      {monthFormatters[language].format(meeting.date)}
                    </p>
                    <p className='mt-1 font-extrabold'>{dateFormatters[language].format(meeting.date)}</p>
                    <p className='text-muted-foreground mt-2 flex items-center gap-1.5 text-sm font-medium'>
                      <Clock className='size-4' />
                      {copy.meetingTime}
                    </p>
                  </div>
                  {isToday ? (
                    <Badge>{copy.today}</Badge>
                  ) : isUpcomingMeeting ? (
                    <Badge variant='secondary'>{copy.nextMeeting}</Badge>
                  ) : null}
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>

      <Card className='rounded-lg py-0'>
        <CardContent className='flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-start sm:px-6'>
          <Info className='text-primary mt-0.5 size-5 shrink-0' />
          <div>
            <p className='font-extrabold'>{copy.timeNoteTitle}</p>
            <p className='text-muted-foreground mt-1 text-sm leading-6'>{copy.timeNoteDescription}</p>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}

export default MeetingPage
