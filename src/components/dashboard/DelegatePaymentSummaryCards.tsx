import type { ReactNode } from 'react'

import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { AssociationContributionSummary } from '@/utils/sagi-contribution-summary'
import type { AssociationRegistrationSummary } from '@/utils/sagi-registration-summary'

const currencyFormatter = new Intl.NumberFormat('en-US', {
  currency: 'USD',
  style: 'currency'
})

const formatCurrency = (value: number) => currencyFormatter.format(value)

const SummaryRow = ({ label, value }: { label: string; value: number }) => (
  <div className='text-primary/80 flex items-start justify-between gap-4'>
    <span className='min-w-0 break-words'>{label}</span>
    <span className='shrink-0 text-right tabular-nums'>{formatCurrency(value)}</span>
  </div>
)

const BalanceRow = ({ balance }: { balance: number }) => {
  const hasReserve = balance >= 0

  return (
    <div
      className={cn(
        'mt-2 flex items-start justify-between gap-4 text-xl font-extrabold sm:text-2xl',
        hasReserve ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'
      )}
    >
      <span className='min-w-0 break-words'>
        {hasReserve ? 'Reserve' : 'Deficit'}{' '}
        <span className='text-[10px] leading-tight font-medium'>
          {hasReserve ? '(To be used for upcoming payments)' : '(Not In Good Standing)'}
        </span>
      </span>
      <span className='shrink-0 text-right tabular-nums'>{formatCurrency(balance)}</span>
    </div>
  )
}

const PaymentSummaryCard = ({ balance, children, title }: { balance: number; children: ReactNode; title: string }) => (
  <Card className='border-primary/20 bg-primary/10 text-primary flex h-full min-h-56 min-w-0 flex-col rounded-md px-3 py-3 sm:px-4'>
    <p className='text-lg font-extrabold break-words sm:text-xl'>{title}</p>
    <div className='mt-2 grid gap-1.5 text-sm font-semibold'>{children}</div>
    <BalanceRow balance={balance} />
    <p className='text-primary/70 mt-auto pt-4 text-[10px] leading-tight font-medium break-words'>
      All amounts are read-only in this admin view and reflect the delegate payment summaries.
    </p>
  </Card>
)

type DelegatePaymentSummaryCardsProps = {
  contribution: AssociationContributionSummary
  registration: AssociationRegistrationSummary
}

const DelegatePaymentSummaryCards = ({ contribution, registration }: DelegatePaymentSummaryCardsProps) => (
  <section className='space-y-3'>
    <div className='min-w-0'>
      <h2 className='text-xl font-extrabold tracking-normal sm:text-2xl'>Delegate payment summaries</h2>
      <p className='text-muted-foreground mt-1 text-sm'>
        Read-only contribution and registration balances for this association.
      </p>
    </div>
    <div className='grid gap-4 lg:grid-cols-2'>
      <PaymentSummaryCard title='Contribution payment summary' balance={contribution.balance}>
        <SummaryRow label='Amount Sent' value={contribution.amountReceived} />
        <SummaryRow label='Amount Verified SAGI' value={contribution.amountVerified} />
        <SummaryRow label='Contribution Dues' value={contribution.amountOwed} />
        <SummaryRow label='Existing Balance' value={contribution.existingBalance} />
        {contribution.manualBalanceAdjustment !== 0 ? (
          <SummaryRow label='Balance Adjustment' value={contribution.manualBalanceAdjustment} />
        ) : null}
      </PaymentSummaryCard>

      <PaymentSummaryCard title='Registration payment summary' balance={registration.balance}>
        <SummaryRow label='Amount Sent' value={registration.amountReceived} />
        <SummaryRow label='Amount Verified SAGI' value={registration.amountVerified} />
        <SummaryRow label='Used for Registration' value={registration.balanceDues} />
        {registration.manualBalanceAdjustment !== 0 ? (
          <SummaryRow label='Balance Adjustment' value={registration.manualBalanceAdjustment} />
        ) : null}
      </PaymentSummaryCard>
    </div>
  </section>
)

export default DelegatePaymentSummaryCards
