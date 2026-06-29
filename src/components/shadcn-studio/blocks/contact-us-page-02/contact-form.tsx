'use client'

import { SendIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export type ContactFormCopy = {
  nameLabel: string
  namePlaceholder: string
  emailLabel: string
  emailPlaceholder: string
  subjectLabel: string
  subjectPlaceholder: string
  messageLabel: string
  messagePlaceholder: string
  submit: string
}

const defaultCopy: ContactFormCopy = {
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

const ContactForm = ({ copy = defaultCopy }: { copy?: ContactFormCopy }) => {
  return (
    <form className='space-y-6' onSubmit={e => e.preventDefault()}>
      <div className='flex w-full flex-wrap gap-6'>
        {/* Name Input */}
        <div className='w-auto grow space-y-2'>
          <Label htmlFor='name'>{copy.nameLabel}</Label>
          <Input type='text' id='name' className='h-10' placeholder={copy.namePlaceholder} />
        </div>

        {/* Email Input */}
        <div className='w-auto grow space-y-2'>
          <Label htmlFor='email'>{copy.emailLabel}</Label>
          <Input type='email' id='email' className='h-10' placeholder={copy.emailPlaceholder} />
        </div>
      </div>

      {/* Subject Input */}
      <div className='w-full space-y-2'>
        <Label htmlFor='subject'>{copy.subjectLabel}</Label>
        <Input type='text' id='subject' className='h-10' placeholder={copy.subjectPlaceholder} />
      </div>

      {/* Message Input */}
      <div className='space-y-2'>
        <Label htmlFor='message'>{copy.messageLabel}</Label>
        <Textarea id='message' className='h-28 resize-none' placeholder={copy.messagePlaceholder} />
      </div>

      {/* Submit Button */}
      <Button type='submit' size='lg' className='rounded-lg text-base has-[>svg]:px-6'>
        {copy.submit}
        <SendIcon />
      </Button>
    </form>
  )
}

export default ContactForm
