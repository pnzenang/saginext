import Link from 'next/link'
import {
  ArrowRight,
  Banknote,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  ClipboardList,
  HeartHandshake,
  MapPin,
  Table,
  Users
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getContributionTableLabel } from '@/utils/contribution-table-label'

const tableDetails = [
  {
    icon: HeartHandshake,
    title: 'Name of the deceased member',
    description: 'The table shows the member who passed away and for whom the monthly contribution is being collected.'
  },
  {
    icon: CalendarDays,
    title: 'Date of death',
    description:
      'The date of death helps delegates confirm the case and understand which contribution period the case belongs to.'
  },
  {
    icon: MapPin,
    title: 'Place of death',
    description:
      'The table includes the place where the death occurred, such as the city, state, or location recorded during the announcement.'
  },
  {
    icon: CircleDollarSign,
    title: 'Family benefit amount',
    description:
      'The table explains the amount the family or beneficiary of the deceased member is expected to receive.'
  }
]

const contributionChecklist = [
  'Review the name of each deceased member listed for the month.',
  'Confirm the date and place of death so the group understands the case being supported.',
  'Check the amount the family will receive for each listed case.',
  'Check the amount your group is expected to contribute for the monthly contribution.',
  'Use the table as the reference before sending and recording the contribution payment.'
]

const groupContributionNotes = [
  'The contribution table gives the monthly contribution details in one place.',
  'It shows how much each group should contribute for the current contribution period.',
  'If more than one death case is included, review each case before sending payment.',
  'The table helps delegates explain to their members why the group is contributing and how the amount was calculated.'
]

const getCommonMistakes = (contributionTableLabel: string) => [
  `Do not confuse the ${contributionTableLabel} with the Monthly Additions table.`,
  'Do not send a contribution before checking the amount assigned to your group.',
  'Do not ignore the deceased member details, because they explain who the contribution is for.',
  'Do not forget to record the payment after sending the monthly contribution.'
]

const ContributionTable = () => {
  const contributionTableLabel = getContributionTableLabel()
  const commonMistakes = getCommonMistakes(contributionTableLabel)

  return (
    <section className='flex w-full max-w-full min-w-0 flex-col gap-6 px-3 py-4 sm:px-6 sm:py-6 lg:px-8'>
      <div className='bg-card rounded-lg border p-6 shadow-sm sm:p-8'>
        <Badge className='mb-4 w-fit' variant='secondary'>
          {contributionTableLabel} Instructions
        </Badge>
        <div className='grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center'>
          <div>
            <h1 className='text-foreground max-w-4xl text-3xl font-semibold tracking-normal sm:text-4xl'>
              Understand the monthly contribution details
            </h1>
            <div className='text-muted-foreground mt-4 max-w-4xl space-y-3 text-base leading-7'>
              <p>
                The {contributionTableLabel} gives delegates the details they need for the monthly contribution. It
                explains who the contribution is for, when and where the death occurred, how much the family will receive,
                and how much each group is expected to contribute.
              </p>
              <p>
                Use this table before sending payment so your group understands the purpose of the contribution and the
                correct amount to send. The table is the main reference for the month&apos;s contribution information.
              </p>
            </div>
            <div className='mt-6 flex flex-col gap-3 sm:flex-row'>
              <Button asChild>
                <Link href='/contribution-table'>
                  Open {contributionTableLabel}
                  <ArrowRight className='size-4' />
                </Link>
              </Button>
              <Button asChild variant='outline'>
                <Link href='/contributions'>Record Contribution Payment</Link>
              </Button>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Table className='text-primary size-5' />
                What the Table Answers
              </CardTitle>
              <CardDescription>Use it to understand the month&apos;s contribution before payment.</CardDescription>
            </CardHeader>
            <CardContent className='text-muted-foreground space-y-3 text-sm leading-6'>
              <p>
                The table identifies the deceased member, shows the date and place of death, lists the benefit amount
                their family will receive, and shows the amount each group should contribute.
              </p>
              <p>
                After reviewing the table, delegates should send the correct contribution and then record the payment on
                the Contribution Payments page.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-4'>
        {tableDetails.map(detail => {
          const Icon = detail.icon

          return (
            <Card key={detail.title}>
              <CardHeader>
                <div className='bg-primary/10 text-primary mb-3 flex size-11 items-center justify-center rounded-md'>
                  <Icon className='size-5' />
                </div>
                <CardTitle className='text-lg'>{detail.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className='text-muted-foreground text-sm leading-6'>{detail.description}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className='grid gap-4 lg:grid-cols-2'>
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <ClipboardList className='text-primary size-5' />
              What to Check
            </CardTitle>
            <CardDescription>Review these details before sending the monthly contribution.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className='grid gap-3'>
              {contributionChecklist.map(item => (
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
              <Users className='text-primary size-5' />
              Amount Each Group Contributes
            </CardTitle>
            <CardDescription>The table helps every group know its required amount.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className='grid gap-3'>
              {groupContributionNotes.map(item => (
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
            <Banknote className='text-primary size-5' />
            Avoid These Mistakes
          </CardTitle>
          <CardDescription>Checking the table first helps prevent payment confusion.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className='grid gap-3 sm:grid-cols-2'>
            {commonMistakes.map(item => (
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

export default ContributionTable
