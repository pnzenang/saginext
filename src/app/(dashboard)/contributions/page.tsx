import Image from 'next/image'
import Link from 'next/link'

const ContributionPayments = () => {
  return (
    <section>
      <p className='text-muted-foreground mx-auto mb-5 max-w-4xl px-4 text-sm leading-6 sm:text-base'>
        To record a contribution payment, first send the contribution using the Zelle QR code, then complete the
        contribution payment form with group details. After submitting the form, keep your payment confirmation until
        the payment appears in the Contribution record.
      </p>
      <div className='flex flex-col justify-center gap-3 sm:flex-row'>
        <Link href='https://enroll.zellepay.com/qr-codes?data=eyJuYW1lIjoiUEFUUklDRSIsImFjdGlvbiI6InBheW1lbnQiLCJ0b2tlbiI6IjQ0MzUzMTU4NTIifQ=='>
          <Image
            alt='chef'
            src='https://res.cloudinary.com/dp8tkb7hq/image/upload/v1778042720/sagiQrCode_jmwsbf.svg'
            width={300}
            height={300}
          />
        </Link>

        <iframe
          // id='JotFormIFrame-261231251869053'
          title='CONTRIBUTION SUBMISSION'
          allow='geolocation; microphone; camera; fullscreen; payment'
          src='https://form.jotform.com/261476766025059'
          // scrolling='Yes'
          width='750'
          height='300'
        ></iframe>
      </div>

      <iframe
        src='https://docs.google.com/spreadsheets/d/e/2PACX-1vRWjKJH4QHWhSbjfFeNeUrjbvIV1Hrjtk0OWe2__OZLQh5T3K1qAs8JVOkxzNuQ2iP61QESytjcrIzC/pubhtml?widget=true&amp;headers=false'
        className='mx-auto mt-5 h-120 w-full max-w-19/20 items-center rounded-lg border'
      ></iframe>
    </section>
  )
}

export default ContributionPayments
