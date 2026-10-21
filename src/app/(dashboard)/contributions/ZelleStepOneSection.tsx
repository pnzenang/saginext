import Image from 'next/image'
import Link from 'next/link'

import { sagiZellePaymentUrl, sagiZelleQrCodeUrl } from '@/utils/payment-constants'

const sagiInfoClassName = 'font-bold text-green-700 dark:text-green-300'

type ZelleStepOneSectionProps = {
  associationCode: string
}

const ZelleStepOneSection = ({ associationCode }: ZelleStepOneSectionProps) => (
  <div className='border-primary/30 bg-background mt-8 rounded-lg border p-4 text-center shadow-sm sm:p-6'>
    <p className='text-[clamp(1rem,3vw,2.25rem)] leading-tight font-semibold whitespace-nowrap'>
      Step1: Register SAGI Zelle information.
    </p>
    <div className='mt-4 grid items-stretch gap-6 lg:grid-cols-[1fr_auto_1fr]'>
      <div>
        <p className='text-primary/80 text-left text-lg leading-snug font-normal sm:text-xl lg:text-2xl'>
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
          <span className={sagiInfoClassName}> SAGI-{associationCode}</span>. Without the 4-letter code memo, the money
          won&apos;t be recognizable until you send the receipt including your 4-letter code.
        </p>
      </div>

      <div className='flex items-center gap-3 lg:flex-col' aria-hidden='true'>
        <span className='bg-primary/30 h-px flex-1 lg:h-auto lg:w-px' />
        <span className='border-primary/30 bg-primary/10 text-primary flex size-12 shrink-0 items-center justify-center rounded-full border text-base font-extrabold sm:text-lg'>
          OR
        </span>
        <span className='bg-primary/30 h-px flex-1 lg:h-auto lg:w-px' />
      </div>

      <div className='border-primary/20 bg-primary/5 flex flex-col items-center justify-between gap-3 rounded-lg border p-4'>
        <p className='text-primary/80 text-base leading-snug font-medium sm:text-lg'>
          Scan or click the QR code to send payment by Zelle. Add{' '}
          <span className={sagiInfoClassName}>SAGI-{associationCode}</span> in the memo.
        </p>
        <Link href={sagiZellePaymentUrl} target='_blank' rel='noopener noreferrer'>
          <Image
            src={sagiZelleQrCodeUrl}
            width={320}
            height={320}
            alt='SAGI Zelle payment QR code'
            className='h-auto w-full max-w-72 sm:max-w-80'
            unoptimized
          />
        </Link>
      </div>
    </div>
  </div>
)

export default ZelleStepOneSection
