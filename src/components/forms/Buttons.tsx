'use client'

import { Loader } from 'lucide-react'
import { useFormStatus } from 'react-dom'

import { Button } from '../ui/button'

type SubmitButtonProps = {
  className?: string
  disabled?: boolean
  text?: string
}

export const SubmitButton = ({ className = '', disabled = false, text = 'submit' }: SubmitButtonProps) => {
  const { pending } = useFormStatus()

  return (
    <Button type='submit' disabled={pending || disabled} className={`capitalize ${className}`} size='lg'>
      {pending ? (
        <>
          <Loader className='mr-2 h-4 w-4 animate-spin' />
          Please wait...
        </>
      ) : (
        text
      )}
    </Button>
  )
}
