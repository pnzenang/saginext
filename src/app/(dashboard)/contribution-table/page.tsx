import { Download } from 'lucide-react'

import { Button } from '@/components/ui/button'

const contributionSpreadsheetBaseUrl =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vRoVS4XFshyjUquUn8dxnY23VJJMYsEcHvNtrYDnuaCKs-WsbLaSyvS0YJe-_V9MeycT5mUZCXXuqgO'

const contributionSpreadsheetEmbedUrl = `${contributionSpreadsheetBaseUrl}/pubhtml?widget=true&headers=false`
const contributionSpreadsheetExcelUrl = `${contributionSpreadsheetBaseUrl}/pub?output=xlsx`

const ContributionTable = () => {
  return (
    <section className='min-w-0'>
      <p className='text-muted-foreground mx-auto mb-5 max-w-4xl px-4 text-sm leading-6 sm:text-base'>
        The Contribution Table shows the monthly contribution details for each active case. Use it to review the
        deceased member&apos;s information, the date and place of death, the benefit amount for the family, and the
        amount each group is expected to contribute. Before sending payment, delegates should check the table carefully,
        match the required amount with their group code, and use the table as the official reference for the current
        contribution period.
      </p>

      <div className='mx-auto mt-5 flex w-full max-w-19/20 min-w-0 items-center justify-between gap-3'>
        <h1 className='text-xl font-semibold tracking-normal break-words md:text-4xl'>Sagicam Contributions</h1>
        <Button asChild size='sm' className='print:hidden'>
          <a href={contributionSpreadsheetExcelUrl}>
            <Download />
            Export Page
          </a>
        </Button>
      </div>

      <iframe
        title='Sagicam Contributions spreadsheet'
        src={contributionSpreadsheetEmbedUrl}
        className='mx-auto mt-3 h-170 w-full max-w-19/20 items-center rounded-lg border'
      ></iframe>
    </section>
  )
}

export default ContributionTable
