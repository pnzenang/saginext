import { PhoneIcon, MailIcon, MapPinIcon } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'

import ContactForm from '@/components/shadcn-studio/blocks/contact-us-page-02/contact-form'

const ContactUs = () => {
  return (
    <section id='contact' className='bg-muted py-8 sm:py-16 lg:py-24'>
      <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
        <div className='mb-12 space-y-4 text-center sm:mb-16 lg:mb-24'>
          <h2 className='text-2xl font-semibold md:text-3xl lg:text-4xl'>How Can We Help?</h2>
          <p className='text-muted-foreground text-xl'>
            Have a question or need assistance? Contact us and let&apos;s find a solution together!
          </p>
        </div>

        <Card className='border shadow-none'>
          <CardContent className='grid gap-6 md:grid-cols-6'>
            <Card className='bg-primary py-8 shadow-none md:col-span-3 xl:col-span-2'>
              <CardContent className='text-primary-foreground space-y-7'>
                <div className='space-y-2'>
                  <h2 className='text-2xl font-semibold'>Contact Information</h2>
                  <p>Explore new destinations, indulge in local cuisines, and immerse yourself in diverse cultures.</p>
                </div>

                <div className='space-y-7'>
                  {/* Phone */}
                  <div className='flex items-start gap-4 text-lg font-semibold'>
                    <PhoneIcon className='size-7 shrink-0' />
                    +1-316-555-1258
                  </div>

                  {/* Email */}
                  <div className='flex items-start gap-4'>
                    <MailIcon className='size-7 shrink-0' />
                    <a className='text-lg font-semibold' href='mailto:hadams@gmail.com'>
                      hadams@gmail.com
                    </a>
                  </div>

                  {/* Address */}
                  <div className='flex items-start gap-4 text-lg font-semibold'>
                    <MapPinIcon className='size-7 shrink-0' />
                    <address className='not-italic'>802 Pension Rd, Maine 96812, USA</address>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Form Section */}
            <div className='md:col-span-3 xl:col-span-4'>
              <ContactForm />
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}

export default ContactUs
