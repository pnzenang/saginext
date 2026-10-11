import { AlertTriangle, BadgeCheck, CreditCard, LockKeyhole, ReceiptText, ShieldCheck } from 'lucide-react'

import ZellePaymentAmountForm from './ZellePaymentAmountForm'
import type { ContributionPaymentAmountDetails } from '@/utils/contribution-payment-code'

const sagiInfoClassName = 'font-bold text-green-700 dark:text-green-300'
const cardClassName = 'bg-primary/5 h-full rounded-lg p-3 ring-1 ring-primary/15'

type CardPaymentInstructionContentProps = {
  associationCode: string
  contributionPaymentAmountDetails?: ContributionPaymentAmountDetails
  paymentType: 'contribution' | 'registration'
}

const CardPaymentInstructionContent = ({
  associationCode,
  contributionPaymentAmountDetails,
  paymentType
}: CardPaymentInstructionContentProps) => (
  <main className='flex min-h-[calc(100vh-8rem)] w-full justify-center px-1 pt-2 pb-8 sm:px-2 sm:pt-4'>
    <section className='border-primary/20 bg-primary/10 text-primary w-full max-w-[120rem] rounded-lg border p-3 text-center shadow-sm sm:p-6 lg:p-10'>
      <h1 className='text-[10px] leading-tight font-semibold tracking-normal whitespace-nowrap sm:text-base md:text-xl lg:text-2xl xl:text-3xl'>
        {associationCode} Delegate, Welcome to SAGI&apos;s Credit/Debit Card Payment page.
      </h1>

      <div className='border-primary/30 bg-background mt-6 rounded-lg border p-3 text-left shadow-sm sm:p-4'>
        <div className='grid gap-3 md:grid-cols-2 xl:grid-cols-4'>
          <div className={cardClassName}>
            <span className='bg-primary/10 text-primary flex size-8 shrink-0 items-center justify-center rounded-md'>
              <CreditCard className='size-4' aria-hidden='true' />
            </span>
            <p className='text-primary mt-2 text-base leading-tight font-semibold sm:text-lg lg:text-xl'>
              Credit/Debit Card
            </p>
            <p className='text-primary/80 mt-2 text-sm leading-snug font-normal sm:text-base'>
              Use this option when you want to pay SAGI with a credit card or debit card.
            </p>
          </div>

          <div className={cardClassName}>
            <span className='bg-primary/10 text-primary flex size-8 shrink-0 items-center justify-center rounded-md'>
              <LockKeyhole className='size-4' aria-hidden='true' />
            </span>
            <p className='text-primary mt-2 text-base leading-tight font-semibold sm:text-lg lg:text-xl'>
              Secure entry
            </p>
            <p className='text-primary/80 mt-2 text-sm leading-snug font-normal sm:text-base'>
              Enter card information only on the secure card payment screen. Do not send card numbers by message.
            </p>
          </div>

          <div className={cardClassName}>
            <span className='bg-primary/10 text-primary flex size-8 shrink-0 items-center justify-center rounded-md'>
              <BadgeCheck className='size-4' aria-hidden='true' />
            </span>
            <p className='text-primary mt-2 text-base leading-tight font-semibold sm:text-lg lg:text-xl'>
              Billing details
            </p>
            <p className='text-primary/80 mt-2 text-sm leading-snug font-normal sm:text-base'>
              Use the correct cardholder name, billing address, and ZIP code to avoid a declined payment.
            </p>
          </div>

          <div className={cardClassName}>
            <span className='bg-primary/10 text-primary flex size-8 shrink-0 items-center justify-center rounded-md'>
              <ReceiptText className='size-4' aria-hidden='true' />
            </span>
            <p className='text-primary mt-2 text-base leading-tight font-semibold sm:text-lg lg:text-xl'>
              4-letter reference
            </p>
            <p className='text-primary/80 mt-2 text-sm leading-snug font-normal sm:text-base'>
              Add <span className={sagiInfoClassName}>SAGI-{associationCode}</span> in the note, memo, or reference
              field when available.
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
                Review before submitting
              </h2>
            </div>
            <p className='text-primary/80 mt-2 text-sm leading-snug font-normal sm:text-base'>
              Confirm the payment amount, card type, and association code before you submit the card payment.
            </p>
          </div>

          <div className={cardClassName}>
            <div className='flex items-center gap-2'>
              <span className='flex size-8 shrink-0 items-center justify-center rounded-md bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'>
                <AlertTriangle className='size-4' aria-hidden='true' />
              </span>
              <h2 className='text-primary text-base leading-tight font-semibold sm:text-lg lg:text-xl'>
                Do not share card details
              </h2>
            </div>
            <p className='text-primary/80 mt-2 text-sm leading-snug font-normal sm:text-base'>
              Never upload, email, text, or message your full card number, expiration date, or security code.
            </p>
          </div>

          <div className={cardClassName}>
            <div className='flex items-center gap-2'>
              <span className='flex size-8 shrink-0 items-center justify-center rounded-md bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-300'>
                <ReceiptText className='size-4' aria-hidden='true' />
              </span>
              <h2 className='text-primary text-base leading-tight font-semibold sm:text-lg lg:text-xl'>
                Keep your receipt
              </h2>
            </div>
            <p className='text-primary/80 mt-2 text-sm leading-snug font-normal sm:text-base'>
              Save the card payment receipt or confirmation number so SAGI can verify your payment if needed.
            </p>
          </div>
        </div>
      </div>

      <p className='text-primary/80 mt-6 text-[8px] leading-snug font-medium whitespace-nowrap sm:text-xs md:text-lg lg:text-2xl xl:text-3xl'>
        To successfully make Credit/Debit Card payment to SAGI, follow the two step process below.
      </p>

      <div className='border-primary/30 bg-background mt-8 rounded-lg border p-4 text-center shadow-sm sm:p-6'>
        <p className='text-[clamp(1rem,3vw,2.25rem)] leading-tight font-semibold whitespace-nowrap'>
          Step1: Complete SAGI Credit/Debit Card payment.
        </p>
        <p className='text-primary/80 mt-4 text-left text-lg leading-snug font-normal sm:text-xl lg:text-2xl'>
          1. Open the secure card payment screen and choose Credit/Debit Card.
        </p>
        <p className='text-primary/80 mt-3 text-left text-lg leading-snug font-normal sm:text-xl lg:text-2xl'>
          2. Enter the dollar amount you wish to send and review it carefully before continuing.
        </p>
        <p className='text-primary/80 mt-3 text-left text-lg leading-snug font-normal sm:text-xl lg:text-2xl'>
          3. Enter the cardholder name, card number, expiration date, security code, and billing ZIP code on the secure
          payment screen only.
        </p>
        <p className='text-primary/80 mt-3 text-left text-lg leading-snug font-normal sm:text-xl lg:text-2xl'>
          4. Add <span className={sagiInfoClassName}>SAGI-{associationCode}</span> in the note, memo, or reference field
          when available.
        </p>
        <p className='text-primary/80 mt-3 text-left text-lg leading-snug font-normal sm:text-xl lg:text-2xl'>
          5. Submit the card payment and keep the receipt or confirmation number. Without the 4-letter code reference,
          the money won&apos;t be recognizable until you send the receipt including your 4-letter code.
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

export default CardPaymentInstructionContent
