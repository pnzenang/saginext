import { AlertTriangle, Banknote, Mail, ReceiptText, ShieldCheck, Smartphone, Zap } from 'lucide-react'

import ZellePaymentAmountForm from './ZellePaymentAmountForm'
import type { ContributionPaymentAmountDetails } from '@/utils/contribution-payment-code'

const sagiInfoClassName = 'font-bold text-green-700 dark:text-green-300'
const cardClassName = 'bg-primary/5 h-full rounded-lg p-3 ring-1 ring-primary/15'
const cashAppRecipient = '$cashtag'

type CashAppPaymentInstructionContentProps = {
  associationCode: string
  contributionPaymentAmountDetails?: ContributionPaymentAmountDetails
  paymentType: 'contribution' | 'registration'
}

const CashAppPaymentInstructionContent = ({
  associationCode,
  contributionPaymentAmountDetails,
  paymentType
}: CashAppPaymentInstructionContentProps) => (
  <main className='flex min-h-[calc(100vh-8rem)] w-full justify-center px-1 pt-2 pb-8 sm:px-2 sm:pt-4'>
    <section className='border-primary/20 bg-primary/10 text-primary w-full max-w-[120rem] rounded-lg border p-3 text-center shadow-sm sm:p-6 lg:p-10'>
      <h1 className='text-[10px] leading-tight font-semibold tracking-normal whitespace-nowrap sm:text-base md:text-xl lg:text-2xl xl:text-3xl'>
        {associationCode} Delegate, Welcome to SAGI&apos;s CashApp Payment page.
      </h1>

      <div className='border-primary/30 bg-background mt-6 rounded-lg border p-3 text-left shadow-sm sm:p-4'>
        <div className='grid gap-3 md:grid-cols-2 xl:grid-cols-4'>
          <div className={cardClassName}>
            <span className='bg-primary/10 text-primary flex size-8 shrink-0 items-center justify-center rounded-md'>
              <Zap className='size-4' aria-hidden='true' />
            </span>
            <p className='text-primary mt-2 text-base leading-tight font-semibold sm:text-lg lg:text-xl'>
              Fast mobile payment
            </p>
            <p className='text-primary/80 mt-2 text-sm leading-snug font-normal sm:text-base'>
              CashApp lets you send a payment from your mobile app after you confirm the recipient and amount.
            </p>
          </div>

          <div className={cardClassName}>
            <span className='bg-primary/10 text-primary flex size-8 shrink-0 items-center justify-center rounded-md'>
              <Smartphone className='size-4' aria-hidden='true' />
            </span>
            <p className='text-primary mt-2 text-base leading-tight font-semibold sm:text-lg lg:text-xl'>
              Use CashApp
            </p>
            <p className='text-primary/80 mt-2 text-sm leading-snug font-normal sm:text-base'>
              Open CashApp, enter the payment amount, then choose the recipient before sending.
            </p>
          </div>

          <div className={cardClassName}>
            <span className='bg-primary/10 text-primary flex size-8 shrink-0 items-center justify-center rounded-md'>
              <Mail className='size-4' aria-hidden='true' />
            </span>
            <p className='text-primary mt-2 text-base leading-tight font-semibold sm:text-lg lg:text-xl'>
              SAGI $Cashtag
            </p>
            <p className='text-primary/80 mt-2 text-sm leading-snug font-normal sm:text-base'>
              Send SAGI payments to <span className={sagiInfoClassName}>{cashAppRecipient}</span> in CashApp.
            </p>
          </div>

          <div className={cardClassName}>
            <span className='bg-primary/10 text-primary flex size-8 shrink-0 items-center justify-center rounded-md'>
              <ReceiptText className='size-4' aria-hidden='true' />
            </span>
            <p className='text-primary mt-2 text-base leading-tight font-semibold sm:text-lg lg:text-xl'>
              4-letter memo
            </p>
            <p className='text-primary/80 mt-2 text-sm leading-snug font-normal sm:text-base'>
              Add <span className={sagiInfoClassName}>SAGI-{associationCode}</span> in the note so your payment can be
              matched to your association.
            </p>
          </div>
        </div>

        <div className='mt-3 grid w-full items-stretch gap-3 md:grid-cols-3'>
          <div className={cardClassName}>
            <div className='flex items-center gap-2'>
              <span className='bg-primary/10 text-primary flex size-8 shrink-0 items-center justify-center rounded-md'>
                <ShieldCheck className='size-4' aria-hidden='true' />
              </span>
              <h2 className='text-primary text-base leading-tight font-semibold sm:text-lg lg:text-xl'>
                Confirm SAGI before sending
              </h2>
            </div>
            <p className='text-primary/80 mt-2 text-sm leading-snug font-normal sm:text-base'>
              Always check the recipient details carefully before you send a CashApp payment.
            </p>
          </div>

          <div className={cardClassName}>
            <div className='flex items-center gap-2'>
              <span className='flex size-8 shrink-0 items-center justify-center rounded-md bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'>
                <AlertTriangle className='size-4' aria-hidden='true' />
              </span>
              <h2 className='text-primary text-base leading-tight font-semibold sm:text-lg lg:text-xl'>
                Beware of Payment Scams
              </h2>
            </div>
            <p className='text-primary/80 mt-2 text-sm leading-snug font-normal sm:text-base'>
              If something looks suspicious, stop and contact SAGI directly before sending the payment.
            </p>
          </div>

          <div className={cardClassName}>
            <div className='flex items-center gap-2'>
              <span className='flex size-8 shrink-0 items-center justify-center rounded-md bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-300'>
                <Banknote className='size-4' aria-hidden='true' />
              </span>
              <h2 className='text-primary text-base leading-tight font-semibold sm:text-lg lg:text-xl'>
                Treat CashApp Like Cash
              </h2>
            </div>
            <p className='text-primary/80 mt-2 text-sm leading-snug font-normal sm:text-base'>
              CashApp payments can move quickly, so verify the amount, note, and recipient before confirming.
            </p>
          </div>
        </div>
      </div>

      <p className='text-primary/80 mt-6 text-[8px] leading-snug font-medium whitespace-nowrap sm:text-xs md:text-lg lg:text-2xl xl:text-3xl'>
        To successfully make CashApp payment to SAGI, follow the two step process below.
      </p>

      <div className='border-primary/30 bg-background mt-8 rounded-lg border p-4 text-center shadow-sm sm:p-6'>
        <p className='text-[clamp(1rem,3vw,2.25rem)] leading-tight font-semibold whitespace-nowrap'>
          Step1: Register SAGI CashApp information.
        </p>
        <p className='text-primary/80 mt-4 text-left text-lg leading-snug font-normal sm:text-xl lg:text-2xl'>
          1. Open CashApp: Sign in to your CashApp account.
        </p>
        <p className='text-primary/80 mt-3 text-left text-lg leading-snug font-normal sm:text-xl lg:text-2xl'>
          2. Start a payment: Enter the dollar amount you wish to send and choose Pay.
        </p>
        <p className='text-primary/80 mt-3 text-left text-lg leading-snug font-normal sm:text-xl lg:text-2xl'>
          3. Choose a recipient: Enter SAGI $Cashtag: <span className={sagiInfoClassName}>{cashAppRecipient}</span>.
        </p>
        <p className='text-primary/80 mt-3 text-left text-lg leading-snug font-normal sm:text-xl lg:text-2xl'>
          4. Verify the recipient: Double-check the recipient information before sending.
        </p>
        <p className='text-primary/80 mt-3 text-left text-lg leading-snug font-normal sm:text-xl lg:text-2xl'>
          5. Add a note or memo: Enter <span className={sagiInfoClassName}>SAGI-{associationCode}</span>. Without the
          4-letter code memo, the money won&apos;t be recognizable until you send the receipt including your 4-letter
          code.
        </p>
      </div>

      <div className='border-primary/30 bg-background mt-8 rounded-lg border p-4 text-center shadow-sm sm:p-6'>
        <p className='text-[clamp(1rem,3vw,2.25rem)] leading-tight font-semibold whitespace-nowrap'>
          Step2: Complete the form below:
        </p>
        <ZellePaymentAmountForm
          contributionPaymentAmountDetails={contributionPaymentAmountDetails}
          paymentType={paymentType}
        />
      </div>

    </section>
  </main>
)

export default CashAppPaymentInstructionContent
