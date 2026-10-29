import Image from 'next/image'
import Link from 'next/link'

import { ArrowRight, MessageCircle } from 'lucide-react'
import { FaWhatsapp } from 'react-icons/fa'

import { Button } from '@/components/ui/button'
import { fetchProfile } from '@/utils/profile-actions'

// Same invite link encoded in public/images/sagi-whatsapp-group-invite-qr.png. If the group's invite link is reset in
// WhatsApp, regenerate the QR image and update this link together.
const sagiWhatsappGroupUrl = 'https://chat.whatsapp.com/Cc8nG7rmmxhG6Qm0AzxPv6'

// Login lands here, so send users without a profile to profile creation and users who haven't accepted the rules
// to the SAGI Internal Rules page first.
const WhatsappGroup = async () => {
  await fetchProfile()

  return (
    <section className='grid w-full max-w-full min-w-0 shrink-0 gap-5 overflow-visible px-0 py-4 sm:px-6 sm:py-8 lg:px-8'>
      <FaWhatsapp aria-hidden='true' className='mx-auto size-16 text-[#25D366] sm:size-20' />
      <h1 className='text-center text-2xl font-extrabold tracking-normal sm:text-3xl'>
        SAGI Whatsapp Group (OPTIONAL)
      </h1>

      <div className='flex flex-col items-center gap-5 text-center'>
        <p className='text-muted-foreground text-base sm:text-lg'>
          Scan the QR code with your phone, or click it, to join the SAGI-UPDATES WhatsApp group.
        </p>
        <a
          href={sagiWhatsappGroupUrl}
          target='_blank'
          rel='noopener noreferrer'
          className='w-full max-w-md rounded-3xl border bg-white p-6 text-black shadow-sm sm:p-8'
        >
          <p className='text-xl font-bold'>SAGI-UPDATES</p>
          <p className='mb-5 text-sm text-gray-500'>WhatsApp group</p>
          <Image
            src='/images/sagi-whatsapp-group-invite-qr.png'
            width={1024}
            height={1024}
            alt='QR code to join the SAGI-UPDATES WhatsApp group'
            className='h-auto w-full'
            priority
          />
        </a>
        <Button asChild size='lg' className='bg-green-600 text-white hover:bg-green-700'>
          <a href={sagiWhatsappGroupUrl} target='_blank' rel='noopener noreferrer'>
            <MessageCircle aria-hidden='true' />
            Join the group
          </a>
        </Button>
        <Button asChild variant='outline' size='lg'>
          <Link href='/all-members'>
            Continue to dashboard
            <ArrowRight aria-hidden='true' />
          </Link>
        </Button>
      </div>
    </section>
  )
}

export default WhatsappGroup
