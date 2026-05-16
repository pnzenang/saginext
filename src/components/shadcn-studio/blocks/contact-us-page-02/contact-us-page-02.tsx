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
                  <p>
                    If you could not find the information you were looking for, please don&apos;t hesitate to contact
                    us.
                  </p>
                </div>

                <div className='space-y-7'>
                  {/* Phone */}
                  <div className='flex items-start gap-4 text-lg font-semibold'>
                    <PhoneIcon className='size-7 shrink-0' />
                    <a href='tel:+1-804-214-6390'>(804) 214-6390</a>
                  </div>

                  {/* Email */}
                  <div className='flex items-start gap-4'>
                    <MailIcon className='size-7 shrink-0' />
                    <a className='text-lg font-semibold' href='mailto:info@mySagi.org'>
                      info@mySagi.org
                    </a>
                  </div>

                  {/* Address */}
                  <div className='flex items-start gap-4 text-lg font-semibold'>
                    <MapPinIcon className='size-7 shrink-0' />
                    <address className='not-italic'>9711 Washingtonian Blvd Suite 550, Gaithersburg, MD 20878</address>
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
