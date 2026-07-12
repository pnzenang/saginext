import { MailIcon, MapPinIcon, MessageCircleIcon, PhoneIcon } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'

import ContactForm, { type ContactFormCopy } from '@/components/shadcn-studio/blocks/contact-us-page-02/contact-form'
import { getSagiWhatsAppUrl, sagiPhoneDisplay, sagiPhoneHref } from '@/utils/sagi-contact'

type ContactCopy = {
  title: string
  description: string
  infoTitle: string
  infoDescription: string
  whatsappAriaLabel: string
  whatsappLabel: string
  whatsappMessage: string
  form: ContactFormCopy
}

const defaultCopy: ContactCopy = {
  title: 'How Can We Help?',
  description: "Have a question or need assistance? Contact us and let's find a solution together!",
  infoTitle: 'Contact Information',
  infoDescription: "If you could not find the information you were looking for, please don't hesitate to contact us.",
  whatsappAriaLabel: 'Chat with SAGI on WhatsApp',
  whatsappLabel: 'Chat with us on WhatsApp',
  whatsappMessage: 'Hello SAGI, I need help.',
  form: {
    nameLabel: 'Your Name',
    namePlaceholder: 'Enter your name here...',
    emailLabel: 'Your Email',
    emailPlaceholder: 'Enter your email here...',
    subjectLabel: 'Your Subject',
    subjectPlaceholder: 'Enter your subject here...',
    messageLabel: 'Message',
    messagePlaceholder: 'Type here',
    submit: 'Send Message'
  }
}

const ContactUs = ({ copy = defaultCopy }: { copy?: ContactCopy }) => {
  return (
    <section id='contact' className='bg-muted py-8 sm:py-16 lg:py-24'>
      <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
        <div className='mb-12 space-y-4 text-center sm:mb-16 lg:mb-24'>
          <h2 className='text-2xl font-semibold md:text-3xl lg:text-6xl'>{copy.title}</h2>
          <p className='text-muted-foreground text-xl'>
            {copy.description}
          </p>
        </div>

        <Card className='border bg-background shadow-none'>
          <CardContent className='grid gap-6 p-6 md:grid-cols-2'>
            <Card className='border-primary/20 bg-primary/10 h-full py-8 shadow-none'>
              <CardContent className='space-y-7'>
                <div className='space-y-2'>
                  <h2 className='text-primary text-2xl font-semibold'>{copy.infoTitle}</h2>
                  <p className='text-muted-foreground'>
                    {copy.infoDescription}
                  </p>
                </div>

                <div className='space-y-7'>
                  {/* Phone */}
                  <div className='flex items-start gap-4 text-lg font-semibold'>
                    <PhoneIcon className='text-primary size-7 shrink-0' />
                    <a href={sagiPhoneHref}>{sagiPhoneDisplay}</a>
                  </div>

                  {/* WhatsApp */}
                  <div className='flex items-start gap-4'>
                    <MessageCircleIcon className='text-primary size-7 shrink-0' />
                    <a
                      aria-label={copy.whatsappAriaLabel}
                      className='text-lg font-semibold hover:underline'
                      href={getSagiWhatsAppUrl(copy.whatsappMessage)}
                      rel='noopener noreferrer'
                      target='_blank'
                    >
                      {copy.whatsappLabel}
                    </a>
                  </div>

                  {/* Email */}
                  <div className='flex items-start gap-4'>
                    <MailIcon className='text-primary size-7 shrink-0' />
                    <a className='text-lg font-semibold' href='mailto:info@mySagi.org'>
                      info@mySagi.org
                    </a>
                  </div>

                  {/* Address */}
                  <div className='flex items-start gap-4 text-lg font-semibold'>
                    <MapPinIcon className='text-primary size-7 shrink-0' />
                    <address className='not-italic'>9711 Washingtonian Blvd Suite 550, Gaithersburg, MD 20878</address>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Form Section */}
            <div className='h-full'>
              <ContactForm copy={copy.form} />
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}

export default ContactUs
