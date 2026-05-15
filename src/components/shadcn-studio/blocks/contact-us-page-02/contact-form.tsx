'use client'

import { SendIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

const ContactForm = () => {
  return (
    <form className='space-y-6' onSubmit={e => e.preventDefault()}>
      <div className='flex w-full flex-wrap gap-6'>
        {/* Name Input */}
        <div className='w-auto grow space-y-2'>
          <Label htmlFor='name'>Your Name</Label>
          <Input type='text' id='name' className='h-10' placeholder='Enter your name here...' />
        </div>

        {/* Email Input */}
        <div className='w-auto grow space-y-2'>
          <Label htmlFor='email'>Your Email</Label>
          <Input type='email' id='email' className='h-10' placeholder='Enter your email here...' />
        </div>
      </div>

      {/* Subject Input */}
      <div className='w-full space-y-2'>
        <Label htmlFor='subject'>Your Subject</Label>
        <Input type='text' id='subject' className='h-10' placeholder='Enter your subject here...' />
      </div>

      {/* Message Input */}
      <div className='space-y-2'>
        <Label htmlFor='message'>Message</Label>
        <Textarea id='message' className='h-28 resize-none' placeholder='Type here' />
      </div>

      {/* Submit Button */}
      <Button type='submit' size='lg' className='rounded-lg text-base has-[>svg]:px-6'>
        Send Message
        <SendIcon />
      </Button>
    </form>
  )
}

export default ContactForm
