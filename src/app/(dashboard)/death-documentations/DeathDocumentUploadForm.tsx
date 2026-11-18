'use client'

import { useRef, useState, type FormEvent } from 'react'

import { Loader2, Upload } from 'lucide-react'
import { toast } from 'sonner'

import DocumentFileInput from '@/components/forms/DocumentFileInput'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { createDeathDocumentUploadAction, saveUploadedDeceasedMemberDocumentAction } from '@/utils/actions'
import {
  deathDocumentFileTooLargeMessage,
  maxDeathDocumentFileSize,
  maxDeathDocumentFileSizeMb
} from '@/utils/upload-limits'

type CloudinaryUploadResponse = {
  error?: { message?: string }
  public_id?: string
  resource_type?: string
  signature?: string
  version?: number | string
}

const uploadFileToCloudinary = (
  uploadUrl: string,
  params: Record<string, string>,
  file: File,
  onProgress: (percent: number) => void
) =>
  new Promise<CloudinaryUploadResponse>((resolve, reject) => {
    const formData = new FormData()

    Object.entries(params).forEach(([key, value]) => formData.append(key, value))
    formData.append('file', file)

    const request = new XMLHttpRequest()

    request.open('POST', uploadUrl)

    request.upload.onprogress = event => {
      if (event.lengthComputable) onProgress(Math.round((event.loaded / event.total) * 100))
    }

    request.onerror = () => reject(new Error('The upload failed. Check your internet connection and try again.'))

    request.onload = () => {
      let response: CloudinaryUploadResponse = {}

      try {
        response = JSON.parse(request.responseText) as CloudinaryUploadResponse
      } catch {
        // Fall through to the generic error below.
      }

      if (request.status >= 200 && request.status < 300 && response.public_id) {
        resolve(response)

        return
      }

      reject(new Error(response.error?.message || 'The upload failed. Please try again.'))
    }

    request.send(formData)
  })

const DeathDocumentUploadForm = ({
  accept,
  deceasedMemberId,
  documentType,
  hasUploadedDocument,
  inputId
}: {
  accept: string
  deceasedMemberId: string
  documentType: string
  hasUploadedDocument: boolean
  inputId: string
}) => {
  const formRef = useRef<HTMLFormElement>(null)
  const [progress, setProgress] = useState<number | null>(null)
  const isUploading = progress !== null

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const fileInput = event.currentTarget.elements.namedItem('documentFile')
    const file = fileInput instanceof HTMLInputElement ? fileInput.files?.[0] : undefined

    if (!file) {
      toast('Please choose a file to upload.')

      return
    }

    if (file.size > maxDeathDocumentFileSize) {
      toast(deathDocumentFileTooLargeMessage)

      return
    }

    setProgress(0)

    try {
      const preparedUpload = await createDeathDocumentUploadAction({
        deceasedMemberId,
        documentType,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type
      })

      if ('message' in preparedUpload) {
        toast(preparedUpload.message)

        return
      }

      const uploaded = await uploadFileToCloudinary(
        preparedUpload.upload.uploadUrl,
        preparedUpload.upload.params,
        file,
        setProgress
      )

      const result = await saveUploadedDeceasedMemberDocumentAction({
        deceasedMemberId,
        documentType,
        fileName: file.name,
        mimeType: file.type,
        publicId: uploaded.public_id ?? '',
        resourceType: uploaded.resource_type ?? '',
        signature: uploaded.signature ?? '',
        version: String(uploaded.version ?? '')
      })

      toast(result.message)

      if (result.ok) formRef.current?.reset()
    } catch (error) {
      toast(error instanceof Error ? error.message : 'The upload failed. Please try again.')
    } finally {
      setProgress(null)
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className='grid w-full max-w-full min-w-0 gap-2'>
      <Label htmlFor={inputId}>{hasUploadedDocument ? 'Replace file' : 'Choose file'}</Label>
      <p className='text-muted-foreground text-xs'>PDF or image, up to {maxDeathDocumentFileSizeMb} MB.</p>
      <DocumentFileInput
        id={inputId}
        name='documentFile'
        accept={accept}
        maxFileSize={maxDeathDocumentFileSize}
        tooLargeMessage={deathDocumentFileTooLargeMessage}
        disabled={isUploading}
        required
      />
      <Button type='submit' className='h-9 w-full text-sm normal-case' disabled={isUploading}>
        {isUploading ? (
          <>
            <Loader2 className='size-4 animate-spin' />
            {progress < 100 ? `Uploading ${progress}%` : 'Saving…'}
          </>
        ) : (
          <>
            <Upload className='size-4' />
            {hasUploadedDocument ? 'Replace document' : 'Upload document'}
          </>
        )}
      </Button>
    </form>
  )
}

export default DeathDocumentUploadForm
