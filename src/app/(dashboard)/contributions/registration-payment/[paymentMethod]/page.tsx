import { AlertTriangle, Banknote, ShieldCheck } from 'lucide-react'

import { fetchProfile } from '@/utils/actions'

import BankDepositPaymentInstructionContent from '../../BankDepositPaymentInstructionContent'
import CardPaymentInstructionContent from '../../CardPaymentInstructionContent'
import CashAppPaymentInstructionContent from '../../CashAppPaymentInstructionContent'
import ZelleFeaturesSection from '../../ZelleFeaturesSection'
import ZellePaymentAmountForm from '../../ZellePaymentAmountForm'

const sagiInfoClassName = 'font-bold text-green-700 dark:text-green-300'

type RegistrationPaymentInstructionPageProps = {
  params: Promise<{
    paymentMethod: string
  }>
}

const RegistrationPaymentInstructionPage = async ({ params }: RegistrationPaymentInstructionPageProps) => {
  const { paymentMethod } = await params

  if (paymentMethod !== 'zelle' && paymentMethod !== 'cashapp' && paymentMethod !== 'bank-deposit' && paymentMethod !== 'card') return null

  const profile = await fetchProfile()

  if (paymentMethod === 'cashapp') {
    return <CashAppPaymentInstructionContent associationCode={profile.associationCode} paymentType='registration' />
  }

  if (paymentMethod === 'bank-deposit') {
    return <BankDepositPaymentInstructionContent associationCode={profile.associationCode} paymentType='registration' />
  }

  if (paymentMethod === 'card') {
    return <CardPaymentInstructionContent associationCode={profile.associationCode} paymentType='registration' />
  }

  return (
    <main className='flex min-h-[calc(100vh-8rem)] w-full justify-center px-1 pt-2 pb-8 sm:px-2 sm:pt-4'>
      <section className='border-primary/20 bg-primary/10 text-primary w-full max-w-[120rem] rounded-lg border p-3 text-center shadow-sm sm:p-6 lg:p-10'>
        <h1 className='text-[10px] leading-tight font-semibold tracking-normal whitespace-nowrap sm:text-base md:text-xl lg:text-2xl xl:text-3xl'>
          {profile.associationCode} Delegate, Welcome to SAGI&apos;s Zelle Payment page.
        </h1>
        <div className='border-primary/30 bg-background mt-6 rounded-lg border p-3 text-left shadow-sm sm:p-4'>
          <div className='grid gap-3 md:grid-cols-2 xl:grid-cols-4'>
            <ZelleFeaturesSection associationCode={profile.associationCode} />
          </div>

          <div className='mt-3 grid w-full items-stretch gap-3 md:grid-cols-3'>
            <div className='bg-primary/5 h-full rounded-lg p-3 ring-1 ring-primary/15'>
            <div className='flex items-center gap-2'>
              <span className='bg-primary/10 text-primary flex size-8 shrink-0 items-center justify-center rounded-md'>
                <ShieldCheck className='size-4' aria-hidden='true' />
              </span>
              <h2 className='text-primary text-base leading-tight font-semibold sm:text-lg lg:text-xl'>
                Only Send Money to Those You Trust
              </h2>
            </div>
            <p className='text-primary/80 mt-2 text-sm leading-snug font-normal sm:text-base'>
              With Zelle&reg;, you can send money from your account to someone else&apos;s within minutes
              <sup>1</sup>. It&apos;s a great way to pay friends, family, your co-workers and others you trust, even if
              they bank somewhere different than you do<sup>1</sup>.
            </p>
          </div>

          <div className='bg-primary/5 h-full rounded-lg p-3 ring-1 ring-primary/15'>
            <div className='flex items-center gap-2'>
              <span className='flex size-8 shrink-0 items-center justify-center rounded-md bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'>
                <AlertTriangle className='size-4' aria-hidden='true' />
              </span>
              <h2 className='text-primary text-base leading-tight font-semibold sm:text-lg lg:text-xl'>
                Beware of Payment Scams
              </h2>
            </div>
            <p className='text-primary/80 mt-2 text-sm leading-snug font-normal sm:text-base'>
              While using Zelle&reg; is a fast way to send money, it&apos;s important to slow down and keep an eye out
              for signs of a scam. If you detect suspicious activity, contact your financial institution directly.
            </p>
          </div>

          <div className='bg-primary/5 h-full rounded-lg p-3 ring-1 ring-primary/15'>
            <div className='flex items-center gap-2'>
              <span className='flex size-8 shrink-0 items-center justify-center rounded-md bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-300'>
                <Banknote className='size-4' aria-hidden='true' />
              </span>
              <h2 className='text-primary text-base leading-tight font-semibold sm:text-lg lg:text-xl'>
                Treat Zelle&reg; Like Cash
              </h2>
            </div>
            <p className='text-primary/80 mt-2 text-sm leading-snug font-normal sm:text-base'>
              With Zelle&reg;, money goes directly into the enrolled recipient&apos;s bank account. Always double check
              you have the recipient&apos;s correct U.S. mobile number, email address, or Zelle&reg; Tag so the money
              goes to the right person or small business.
            </p>
          </div>
          </div>
        </div>
        <p className='text-primary/80 mt-6 text-[8px] leading-snug font-medium whitespace-nowrap sm:text-xs md:text-lg lg:text-2xl xl:text-3xl'>
          To successfully make zelle payment with to SAGI, follow the two step process below.
        </p>
        <div className='border-primary/30 bg-background mt-8 rounded-lg border p-4 text-center shadow-sm sm:p-6'>
          <p className='text-[clamp(1rem,3vw,2.25rem)] leading-tight font-semibold whitespace-nowrap'>
            Step1: Register SAGI Zelle information.
          </p>
          <p className='text-primary/80 mt-4 text-left text-lg leading-snug font-normal sm:text-xl lg:text-2xl'>
            1. Open your banking app: Sign in to your bank or credit union&apos;s mobile app or online portal where Zelle
            is built-in.
          </p>
          <p className='text-primary/80 mt-3 text-left text-lg leading-snug font-normal sm:text-xl lg:text-2xl'>
            2. Navigate to Zelle: Look for a menu labeled &quot;Send Money with Zelle&quot;, &quot;Pay &amp; Transfer&quot;, or
            &quot;Move Money&quot;.
          </p>
          <p className='text-primary/80 mt-3 text-left text-lg leading-snug font-normal sm:text-xl lg:text-2xl'>
            3. Select to send money to a business and enter SAGI email:{' '}
            <span className={sagiInfoClassName}>info@sagiusa.org</span>.
          </p>
          <p className='text-primary/80 mt-3 text-left text-lg leading-snug font-normal sm:text-xl lg:text-2xl'>
            4. Verify the recipient name: Double-check that the recipient&apos;s is:{' '}
            <span className={sagiInfoClassName}>Active Solidarity Ltd.</span>
          </p>
          <p className='text-primary/80 mt-3 text-left text-lg leading-snug font-normal sm:text-xl lg:text-2xl'>
            5. Enter the amount and memo: Type in the dollar amount you wish to send and enter as note or memo:
            <span className={sagiInfoClassName}> SAGI-{profile.associationCode}</span>. Without the 4-letter code memo,
            the money won&apos;t be recognizable until you send the receipt including your 4-letter code.
          </p>
        </div>
        <div className='border-primary/30 bg-background mt-8 rounded-lg border p-4 text-center shadow-sm sm:p-6'>
          <p className='text-[clamp(1rem,3vw,2.25rem)] leading-tight font-semibold whitespace-nowrap'>
            Step2: Complete the form below:
          </p>
          <ZellePaymentAmountForm paymentType='registration' />
        </div>
      </section>
    </main>
  )
}

export default RegistrationPaymentInstructionPage
