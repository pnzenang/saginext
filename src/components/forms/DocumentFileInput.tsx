'use client'

import { useState, type ChangeEvent, type ComponentProps } from 'react'

import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import {
  documentationFileTooLargeMessages,
  formatFileSizeInMb,
  maxDocumentationFileSize
} from '@/utils/upload-limits'

type DocumentFileInputProps = Omit<ComponentProps<typeof Input>, 'type'> & {
  tooLargeMessage?: string
}

// Rejects oversized files as soon as they are picked: oversized requests never reach
// the server action in production, so the server-side check alone can't show a message.
const DocumentFileInput = ({
  className,
  onChange,
  tooLargeMessage = documentationFileTooLargeMessages.en,
  ...props
}: DocumentFileInputProps) => {
  const [error, setError] = useState('')

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget
    const file = input.files?.[0]

    if (file && file.size > maxDocumentationFileSize) {
      input.value = ''
      setError(`${tooLargeMessage} (${file.name}: ${formatFileSizeInMb(file.size)})`)
    } else {
      setError('')
    }

    onChange?.(event)
  }

  return (
    <>
      <Input
        {...props}
        type='file'
        onChange={handleChange}
        aria-invalid={error ? true : undefined}
        className={cn(error && 'border-destructive', className)}
      />
      {error ? (
        <p role='alert' className='text-destructive text-xs font-semibold break-words'>
          {error}
        </p>
      ) : null}
    </>
  )
}

export default DocumentFileInput
