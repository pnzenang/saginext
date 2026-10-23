import { dashboardTimeZone } from '@/utils/month-date-ranges'

import MonthlyContributionLookupForm from './MonthlyContributionLookupForm'

export const dynamic = 'force-dynamic'

const monthFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'long',
  timeZone: dashboardTimeZone,
  year: 'numeric'
})

const MonthlyContribution = () => {
  const month = monthFormatter.format(new Date())

  return (
    <section className='mx-auto flex min-h-[calc(100dvh-3.5rem)] w-full sm:min-h-[calc(100dvh-5rem)] max-w-3xl flex-1 flex-col items-center justify-center gap-6 px-6 py-10 text-center sm:py-12 lg:py-16'>
      <h1 className='text-[clamp(1.25rem,6vw,3.75rem)] font-semibold whitespace-nowrap'>{month} Contribution</h1>
      <p className='text-muted-foreground text-base sm:text-lg'>
        Enter your 4-letter code here to see your contribution for this month.
      </p>
      <MonthlyContributionLookupForm />
    </section>
  )
}

export default MonthlyContribution
