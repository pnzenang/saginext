import { AlertTriangle, Banknote, Building2, Landmark, ReceiptText, ShieldCheck } from 'lucide-react'

import ZellePaymentAmountForm from './ZellePaymentAmountForm'
import type { ContributionPaymentAmountDetails } from '@/utils/contribution-payment-code'

const sagiInfoClassName = 'font-bold text-green-700 dark:text-green-300'
const cardClassName = 'bg-primary/5 h-full rounded-lg p-3 ring-1 ring-primary/15'
const bankName = 'BANK OF AMERICA'
const businessName = 'ACTIVE SOLIDARITY LTD'
const accountNumber = '446008676977'
const paperElectronicRoutingNumber = '052001633'
const wireRoutingNumber = '026009593'

type BankDepositPaymentInstructionContentProps = {
  associationCode: string
  contributionPaymentAmountDetails?: ContributionPaymentAmountDetails
  paymentType: 'contribution' | 'registration'
}

const BankDepositPaymentInstructionContent = ({
  associationCode,
  contributionPaymentAmountDetails,
  paymentType
}: BankDepositPaymentInstructionContentProps) => (
  <main className='flex min-h-[calc(100vh-8rem)] w-full justify-center px-1 pt-2 pb-8 sm:px-2 sm:pt-4'>
    <section className='border-primary/20 bg-primary/10 text-primary w-full max-w-[120rem] rounded-lg border p-3 text-center shadow-sm sm:p-6 lg:p-10'>
      <h1 className='text-[10px] leading-tight font-semibold tracking-normal whitespace-nowrap sm:text-base md:text-xl lg:text-2xl xl:text-3xl'>
        {associationCode} Delegate, Welcome to SAGI&apos;s Bank Deposit Payment page.
      </h1>

      <div className='border-primary/30 bg-background mt-6 rounded-lg border p-3 text-left shadow-sm sm:p-4'>
        <div className='grid gap-3 md:grid-cols-2 xl:grid-cols-4'>
          <div className={cardClassName}>
            <span className='bg-primary/10 text-primary flex size-8 shrink-0 items-center justify-center rounded-md'>
              <Building2 className='size-4' aria-hidden='true' />
            </span>
            <p className='text-primary mt-2 text-base leading-tight font-semibold sm:text-lg lg:text-xl'>Bank</p>
            <p className='text-primary/80 mt-2 text-sm leading-snug font-normal sm:text-base'>
              Deposit or transfer SAGI payments through <span className={sagiInfoClassName}>{bankName}</span>. Account
              number: <span className={sagiInfoClassName}>{accountNumber}</span>
            </p>
          </div>

          <div className={cardClassName}>
            <span className='bg-primary/10 text-primary flex size-8 shrink-0 items-center justify-center rounded-md'>
              <Landmark className='size-4' aria-hidden='true' />
            </span>
            <p className='text-primary mt-2 text-base leading-tight font-semibold sm:text-lg lg:text-xl'>
              Paper &amp; Electronic
            </p>
            <p className='text-primary/80 mt-2 text-sm leading-snug font-normal sm:text-base'>
              Routing number: <span className={sagiInfoClassName}>{paperElectronicRoutingNumber}</span>
            </p>
          </div>

          <div className={cardClassName}>
            <span className='bg-primary/10 text-primary flex size-8 shrink-0 items-center justify-center rounded-md'>
              <Banknote className='size-4' aria-hidden='true' />
            </span>
            <p className='text-primary mt-2 text-base leading-tight font-semibold sm:text-lg lg:text-xl'>Wires</p>
            <p className='text-primary/80 mt-2 text-sm leading-snug font-normal sm:text-base'>
              Routing number: <span className={sagiInfoClassName}>{wireRoutingNumber}</span>
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
              Add <span className={sagiInfoClassName}>SAGI-{associationCode}</span> in the memo so your payment can be
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
                Confirm the account
              </h2>
            </div>
            <p className='text-primary/80 mt-2 text-sm leading-snug font-normal sm:text-base'>
              Verify the SAGI bank account details before sending a bank deposit, ACH transfer, or wire.
            </p>
          </div>

          <div className={cardClassName}>
            <div className='flex items-center gap-2'>
              <span className='flex size-8 shrink-0 items-center justify-center rounded-md bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'>
                <AlertTriangle className='size-4' aria-hidden='true' />
              </span>
              <h2 className='text-primary text-base leading-tight font-semibold sm:text-lg lg:text-xl'>
                Use the right routing number
              </h2>
            </div>
            <p className='text-primary/80 mt-2 text-sm leading-snug font-normal sm:text-base'>
              Use <span className={sagiInfoClassName}>{paperElectronicRoutingNumber}</span> for paper/electronic
              transfers and <span className={sagiInfoClassName}>{wireRoutingNumber}</span> for wires.
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
              Save the deposit slip, confirmation, or wire receipt so SAGI can verify your payment if needed.
            </p>
          </div>
        </div>
      </div>

      <p className='text-primary/80 mt-6 text-[8px] leading-snug font-medium whitespace-nowrap sm:text-xs md:text-lg lg:text-2xl xl:text-3xl'>
        To successfully make Bank Deposit payment to SAGI, follow the two step process below.
      </p>

      <div className='border-primary/30 bg-background mt-8 rounded-lg border p-4 text-center shadow-sm sm:p-6'>
        <p className='text-[clamp(1rem,3vw,2.25rem)] leading-tight font-semibold whitespace-nowrap'>
          Step1: Register SAGI Bank Deposit information.
        </p>
        <p className='text-primary/80 mt-4 text-left text-lg leading-snug font-normal sm:text-xl lg:text-2xl'>
          1. Choose your bank payment method: Use paper/electronic transfer, wire transfer, or deposit at the bank.
        </p>
        <p className='text-primary/80 mt-3 text-left text-lg leading-snug font-normal sm:text-xl lg:text-2xl'>
          2. If you want to deposit at the bank, go to a <span className={sagiInfoClassName}>{bankName}</span> branch
          and fill the deposit slip with the business name <span className={sagiInfoClassName}>{businessName}</span> and
          account number <span className={sagiInfoClassName}>{accountNumber}</span>.
        </p>
        <p className='text-primary/80 mt-3 text-left text-lg leading-snug font-normal sm:text-xl lg:text-2xl'>
          3. For Transfer, use the Routing Number:{' '}
          <span className={sagiInfoClassName}>{paperElectronicRoutingNumber}</span> for Paper &amp; Electronic, or{' '}
          <span className={sagiInfoClassName}>{wireRoutingNumber}</span> for Wires.
        </p>
        <p className='text-primary/80 mt-3 text-left text-lg leading-snug font-normal sm:text-xl lg:text-2xl'>
          4. Verify the bank information: Double-check the bank name, routing number, account information, and amount
          before sending.
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

export default BankDepositPaymentInstructionContent
