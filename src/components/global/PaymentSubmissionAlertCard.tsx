import { BellRing } from 'lucide-react'

import { Button } from '@/components/ui/button'

const alertTimeFormatter = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium',
  timeStyle: 'short'
})

const currencyFormatter = new Intl.NumberFormat('en-US', {
  currency: 'USD',
  style: 'currency'
})

export type PaymentSubmissionAlert = {
  amount: number
  associationCode: string
  associationName: string
  submittedAt: Date
}

type PaymentSubmissionAlertCardProps = {
  action: (formData: FormData) => Promise<void>
  alerts: PaymentSubmissionAlert[]
  title: string
}

const PaymentSubmissionAlertCard = ({ action, alerts, title }: PaymentSubmissionAlertCardProps) => {
  const paymentLabel = alerts.length === 1 ? 'payment' : 'payments'

  return (
    <div className='border-primary/20 bg-primary/5 w-full max-w-full min-w-0 overflow-hidden rounded-md border p-4'>
      <div className='flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between'>
        <div className='min-w-0'>
          <div className='flex min-w-0 items-center gap-2'>
            <BellRing className='text-primary size-5 shrink-0' />
            <h2 className='min-w-0 text-lg font-extrabold break-words'>{title}</h2>
          </div>
          <p className='text-muted-foreground mt-1 text-sm font-semibold break-words'>
            You have {alerts.length} {paymentLabel} from the following associations:
          </p>
        </div>
        <form action={action} className='min-w-0 sm:shrink-0'>
          <Button type='submit' size='sm' variant='outline' disabled={alerts.length === 0} className='w-full sm:w-auto'>
            Reset
          </Button>
        </form>
      </div>

      {alerts.length > 0 ? (
        <div className='mt-4 grid min-w-0 grid-cols-1 gap-2 xl:grid-cols-2'>
          {alerts.map(alert => (
            <div
              key={`${alert.associationCode}-${alert.submittedAt.toISOString()}`}
              className='bg-background grid max-w-full min-w-0 grid-cols-[minmax(0,1fr)_auto] gap-3 overflow-hidden rounded-md border px-3 py-2 text-sm font-extrabold sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] sm:items-center'
            >
              <span className='min-w-0 break-words'>
                {alert.associationCode}
                <span className='text-muted-foreground ml-2 text-xs font-semibold break-words'>
                  {alert.associationName}
                </span>
              </span>
              <span className='text-primary shrink-0 text-right tabular-nums'>
                {currencyFormatter.format(alert.amount)}
              </span>
              <span className='text-muted-foreground col-span-2 shrink-0 text-left text-xs font-semibold sm:col-span-1 sm:text-right'>
                {alertTimeFormatter.format(alert.submittedAt)}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className='text-muted-foreground mt-4 rounded-md border border-dashed px-3 py-4 text-center text-sm'>
          No new payments since the last reset.
        </p>
      )}
    </div>
  )
}

export default PaymentSubmissionAlertCard
