import AccordionWithImage from '@/components/shadcn-studio/blocks/features-section-02/accordion-with-image'
import { Card } from '@/components/ui/card'

import { MotionPreset } from '@/components/ui/motion-preset'
import InvoiceDatatable from './datatable-invoice'
import { invoiceData } from '@/utils/funeralHomes'

const FuneralHomesPage = () => {
  return (
    <section className='py-4 sm:py-8 lg:py-12' id='funeral-homes'>
      <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
        {/* Header */}
        <div className='mb-4 space-y-4 text-center sm:mb-6 lg:mb-8'>
          <MotionPreset
            component='h2'
            className='text-2xl font-semibold md:text-3xl lg:text-4xl'
            fade
            slide={{ direction: 'down', offset: 50 }}
            blur
            transition={{ duration: 0.5 }}
          >
            <p className='text-2xl md:text-4xl lg:text-6xl'>Funeral Homes Near You </p>
          </MotionPreset>
          <MotionPreset
            component='p'
            className='text-muted-foreground text-start text-xl'
            fade
            blur
            slide={{ direction: 'down', offset: 50 }}
            delay={0.3}
            transition={{ duration: 0.5 }}
          >
            SAGI does not run funeral homes, but we think losing a loved one is already hard enough, so we want to make
            it easier for you to find a funeral home near you.
            <br /> Also, we have partnered with some of the best funeral homes in the country that are ready to provide
            you with the best service possible, without initial deposits or any payment from you directly, just call us
            at: <span className='font-extrabold'> 1(804) 214-6390 </span>
            and the rest will be taken care of.
          </MotionPreset>
        </div>
        <MotionPreset
          component='div'
          className='text-muted-foreground text-xl'
          fade
          blur
          slide={{ direction: 'down', offset: 50 }}
          delay={0.3}
          transition={{ duration: 0.5 }}
        >
          <div className='py-4 sm:py-8 lg:py-12'>
            <div className='mx-auto max-w-7xl px-2 sm:px-3 lg:px-4'>
              <Card className='max-w-9xl mx-auto w-full py-0'>
                <InvoiceDatatable data={invoiceData} />
              </Card>
            </div>
          </div>
        </MotionPreset>
      </div>
    </section>
  )
}

export default FuneralHomesPage
