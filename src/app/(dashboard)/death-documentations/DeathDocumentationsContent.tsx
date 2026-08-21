import { CheckCircle2, Download, FileText, ShieldCheck, Upload, XCircle } from 'lucide-react'

import FormContainer from '@/components/forms/FormContainer'
import { SubmitButton } from '@/components/forms/Buttons'
import RestoreDeceasedMemberButton from '@/components/global/RestoreDeceasedMemberButton'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import {
  countSubmittedDeathDocuments,
  hasDeathDocumentationDetails,
  needsDelegateDeathDocumentationAction
} from '@/utils/death-documentation-alerts'
import {
  deleteDeceasedMemberDocumentAction,
  reviewDeceasedMemberDocumentAction,
  updateDeathDocumentationDetailsAction,
  uploadDeceasedMemberDocumentAction
} from '@/utils/actions'
import type { fetchDeathDocumentationCasesAction } from '@/utils/actions'
import {
  deceasedMemberDocumentLabels,
  deceasedMemberDocumentStatusLabels,
  getRequiredDeceasedMemberDocumentTypes,
  hasApprovedRequiredDeceasedMemberDocuments,
  isUnitedStatesDeathCountry,
  type DeceasedMemberDocumentStatus,
  type DeceasedMemberDocumentType
} from '@/utils/types'

import DeathDocumentationCasesList, { type DeathDocumentationCasesListItem } from './DeathDocumentationCasesList'

type DeathDocumentationCase = Awaited<ReturnType<typeof fetchDeathDocumentationCasesAction>>['deceasedMembers'][number]
type DeathDocumentationDocument = DeathDocumentationCase['documents'][number]

type DeathDocumentationsContentProps = {
  currentUserId: string
  deceasedMembers: DeathDocumentationCase[]
  description: string
  emptyDescription: string
  emptyTitle: string
  isAdminUser: boolean
  title: string
}

const documentAccept = '.pdf,.jpg,.jpeg,.png,.webp,.heic,.heif,application/pdf,image/*'

const fileSizeFormatter = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 1,
  minimumFractionDigits: 0
})

const dateTimeFormatter = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium',
  timeStyle: 'short'
})

const formatDateTime = (date: Date) => dateTimeFormatter.format(date)

const formatFileSize = (fileSize: number) => {
  if (fileSize < 1024) return `${fileSize} B`

  if (fileSize < 1024 * 1024) return `${fileSizeFormatter.format(fileSize / 1024)} KB`

  return `${fileSizeFormatter.format(fileSize / (1024 * 1024))} MB`
}

const getDocumentStatusLabel = (status: string) =>
  deceasedMemberDocumentStatusLabels[status as DeceasedMemberDocumentStatus] ?? status

const getDocumentStatusClassName = (status: string) => {
  if (status === 'approved') {
    return 'border-green-200 bg-green-50 text-green-700 dark:border-green-900 dark:bg-green-950/40 dark:text-green-300'
  }

  if (status === 'rejected') {
    return 'border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300'
  }

  return 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300'
}

const getRequiredDocumentTypes = (deceasedMember: DeathDocumentationCase): DeceasedMemberDocumentType[] =>
  getRequiredDeceasedMemberDocumentTypes(deceasedMember)

const getUploadedDocumentCount = (deceasedMember: DeathDocumentationCase) =>
  getRequiredDocumentTypes(deceasedMember).filter(documentType =>
    deceasedMember.documents.some(uploadedDocument => uploadedDocument.documentType === documentType)
  ).length

const getCaseSearchText = (deceasedMember: DeathDocumentationCase) =>
  [
    deceasedMember.firstName,
    deceasedMember.lastAndMiddleNames,
    deceasedMember.memberMatriculationNumber,
    deceasedMember.associationCode,
    deceasedMember.associationName,
    deceasedMember.placeOfDeath,
    deceasedMember.placeOfDeathCountry
  ]
    .join(' ')
    .toLowerCase()

const ReviewDocumentControls = ({ uploadedDocument }: { uploadedDocument: DeathDocumentationDocument }) => {
  if (uploadedDocument.status === 'approved') return null

  return (
    <div className='mt-3 grid gap-2 rounded-md border bg-white/60 p-2 dark:bg-black/10'>
      <div className='flex items-center gap-1.5 text-xs font-semibold'>
        <ShieldCheck className='size-3.5' />
        Admin review
      </div>
      <div className='grid gap-2 sm:grid-cols-[auto_minmax(0,1fr)]'>
        <FormContainer action={reviewDeceasedMemberDocumentAction}>
          <input type='hidden' name='documentId' value={uploadedDocument.id} />
          <input type='hidden' name='status' value='approved' />
          <SubmitButton
            text='Approve'
            className='h-8 w-full bg-green-700 px-3 text-xs normal-case hover:bg-green-800 sm:w-auto'
          />
        </FormContainer>
        <FormContainer action={reviewDeceasedMemberDocumentAction} className='grid gap-2 sm:grid-cols-[1fr_auto]'>
          <input type='hidden' name='documentId' value={uploadedDocument.id} />
          <input type='hidden' name='status' value='rejected' />
          <Input
            name='rejectionReason'
            placeholder='Reason if rejected'
            defaultValue={uploadedDocument.status === 'rejected' ? (uploadedDocument.rejectionReason ?? '') : ''}
            className='h-8 text-xs'
          />
          <SubmitButton
            text='Reject'
            className='h-8 w-full bg-red-700 px-3 text-xs normal-case hover:bg-red-800 sm:w-auto'
          />
        </FormContainer>
      </div>
    </div>
  )
}

const DocumentationSlot = ({
  currentUserId,
  deceasedMember,
  documentType,
  isAdminUser,
  uploadedDocument
}: {
  currentUserId: string
  deceasedMember: DeathDocumentationCase
  documentType: DeceasedMemberDocumentType
  isAdminUser: boolean
  uploadedDocument?: DeathDocumentationDocument
}) => {
  const inputId = `${deceasedMember.id}-${documentType}`
  const canManageUploadedDocument = !uploadedDocument || uploadedDocument.clerkId === currentUserId

  const deleteDocument = uploadedDocument && canManageUploadedDocument
    ? deleteDeceasedMemberDocumentAction.bind(null, { documentId: uploadedDocument.id })
    : null

  return (
    <div className='bg-muted/20 grid min-w-0 gap-4 rounded-md border p-4'>
      <div className='flex min-w-0 items-start justify-between gap-3'>
        <div className='min-w-0'>
          <div className='flex items-center gap-2 text-sm font-extrabold'>
            <FileText className='text-primary size-4' />
            <span className='break-words'>{deceasedMemberDocumentLabels[documentType]}</span>
          </div>
          {uploadedDocument ? (
            <p className='text-muted-foreground mt-1 text-xs break-words'>
              {uploadedDocument.fileName} · {formatFileSize(uploadedDocument.fileSize)}
            </p>
          ) : (
            <p className='text-muted-foreground mt-1 text-xs'>Not uploaded yet</p>
          )}
        </div>
        {uploadedDocument ? (
          <Badge
            variant='outline'
            className={cn('shrink-0 capitalize', getDocumentStatusClassName(uploadedDocument.status))}
          >
            {uploadedDocument.status === 'approved' ? <CheckCircle2 /> : null}
            {uploadedDocument.status === 'rejected' ? <XCircle /> : null}
            {getDocumentStatusLabel(uploadedDocument.status)}
          </Badge>
        ) : null}
      </div>

      {uploadedDocument ? (
        <div className='grid gap-2 text-xs'>
          <p className='text-muted-foreground'>Uploaded {formatDateTime(uploadedDocument.updatedAt)}</p>
          {uploadedDocument.rejectionReason ? (
            <p className='rounded-md border border-red-200 bg-red-50 px-2 py-1.5 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300'>
              {uploadedDocument.rejectionReason}
            </p>
          ) : null}
          <div className='flex flex-wrap gap-2'>
            <Button asChild variant='outline' size='sm' className='h-8'>
              <a href={`/death-documentations/${uploadedDocument.id}/download`}>
                <Download className='size-3.5' />
                Download
              </a>
            </Button>
            {deleteDocument ? (
              <FormContainer action={deleteDocument}>
                <SubmitButton text='Remove' className='h-8 bg-red-700 px-3 text-xs normal-case hover:bg-red-800' />
              </FormContainer>
            ) : null}
          </div>
        </div>
      ) : null}

      {canManageUploadedDocument ? (
        <FormContainer action={uploadDeceasedMemberDocumentAction} className='grid gap-2'>
          <input type='hidden' name='deceasedMemberId' value={deceasedMember.id} />
          <input type='hidden' name='documentType' value={documentType} />
          <Label htmlFor={inputId}>{uploadedDocument ? 'Replace file' : 'Choose file'}</Label>
          <p className='text-muted-foreground text-xs'>PDF or image, up to 20 MB.</p>
          <Input id={inputId} name='documentFile' type='file' accept={documentAccept} required />
          <SubmitButton
            text={uploadedDocument ? 'Replace document' : 'Upload document'}
            className='h-9 w-full text-sm normal-case'
          />
        </FormContainer>
      ) : (
        <p className='text-muted-foreground rounded-md border px-3 py-2 text-xs font-semibold'>
          Only the person who uploaded this document can replace or remove it.
        </p>
      )}

      {isAdminUser && uploadedDocument ? <ReviewDocumentControls uploadedDocument={uploadedDocument} /> : null}
    </div>
  )
}

const DeathDocumentationDetailsForm = ({ deceasedMember }: { deceasedMember: DeathDocumentationCase }) => {
  const detailsComplete = hasDeathDocumentationDetails(deceasedMember)
  const countryOfDeath = deceasedMember.placeOfDeathCountry?.trim()
  const requiresInternationalDocuments = Boolean(countryOfDeath && !isUnitedStatesDeathCountry(countryOfDeath))

  return (
    <div className='bg-muted/20 grid gap-3 rounded-md border p-4'>
      <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h3 className='text-sm font-extrabold'>Family contact and country of death</h3>
          <p className='text-muted-foreground mt-1 text-xs'>
            Save these details before final review so the required document list is complete.
          </p>
        </div>
        <Badge variant={detailsComplete ? 'default' : 'secondary'} className='w-fit'>
          {detailsComplete ? 'Details saved' : 'Details required'}
        </Badge>
      </div>

      <FormContainer action={updateDeathDocumentationDetailsAction} className='grid gap-3'>
        <input type='hidden' name='deceasedMemberId' value={deceasedMember.id} />
        <div className='grid gap-3 md:grid-cols-3'>
          <div className='grid gap-1.5'>
            <Label htmlFor={`${deceasedMember.id}-familyContactName`}>Family contact</Label>
            <Input
              id={`${deceasedMember.id}-familyContactName`}
              name='familyContactName'
              defaultValue={deceasedMember.familyContactName ?? ''}
              placeholder='Full name'
              required
            />
          </div>
          <div className='grid gap-1.5'>
            <Label htmlFor={`${deceasedMember.id}-familyContactPhoneNumber`}>Family contact phone number</Label>
            <Input
              id={`${deceasedMember.id}-familyContactPhoneNumber`}
              name='familyContactPhoneNumber'
              type='tel'
              defaultValue={deceasedMember.familyContactPhoneNumber ?? ''}
              placeholder='Phone number'
              required
            />
          </div>
          <div className='grid gap-1.5'>
            <Label htmlFor={`${deceasedMember.id}-placeOfDeathCountry`}>Country of death</Label>
            <Input
              id={`${deceasedMember.id}-placeOfDeathCountry`}
              name='placeOfDeathCountry'
              defaultValue={deceasedMember.placeOfDeathCountry ?? ''}
              placeholder='United States'
              required
            />
          </div>
        </div>
        <SubmitButton text='Save documentation details' className='h-9 w-full text-sm normal-case sm:w-fit' />
      </FormContainer>

      {requiresInternationalDocuments ? (
        <p className='rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200'>
          Country of death is outside the United States, so the international document list below is required.
        </p>
      ) : null}
      {countryOfDeath && !requiresInternationalDocuments ? (
        <p className='rounded-md border border-green-200 bg-green-50 px-3 py-2 text-xs font-semibold text-green-800 dark:border-green-900 dark:bg-green-950/40 dark:text-green-200'>
          Country of death is the United States, so the USA document list below is required.
        </p>
      ) : null}
      {!countryOfDeath ? (
        <p className='rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-800 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-200'>
          Enter the country of death to determine whether international documents are required.
        </p>
      ) : null}
    </div>
  )
}

const DeceasedMemberDocumentationCard = ({
  currentUserId,
  deceasedMember,
  isAdminUser
}: {
  currentUserId: string
  deceasedMember: DeathDocumentationCase
  isAdminUser: boolean
}) => {
  const uploadedCount = getUploadedDocumentCount(deceasedMember)
  const requiredDocumentTypes = getRequiredDocumentTypes(deceasedMember)
  const countryOfDeath = deceasedMember.placeOfDeathCountry?.trim()
  const requiresInternationalDocuments = Boolean(countryOfDeath && !isUnitedStatesDeathCountry(countryOfDeath))
  const showApprovedCaseBackground = isAdminUser && hasApprovedRequiredDeceasedMemberDocuments(deceasedMember)

  const documentsByType = new Map(
    deceasedMember.documents.map(uploadedDocument => [uploadedDocument.documentType, uploadedDocument])
  )

  return (
    <Card
      className={cn(
        'rounded-lg py-0',
        showApprovedCaseBackground
          ? 'border-green-200 bg-green-50/45 dark:border-green-900 dark:bg-green-950/20'
          : null
      )}
    >
      <CardHeader className='border-b px-4 py-4 sm:px-6'>
        <div className='flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between'>
          <div className='min-w-0'>
            <CardTitle className='text-xl break-words'>
              {deceasedMember.firstName} {deceasedMember.lastAndMiddleNames}
            </CardTitle>
            <div className='text-muted-foreground mt-2 grid gap-1 text-sm sm:grid-cols-2'>
              <span>Association: {deceasedMember.associationName}</span>
              <span>Association code: {deceasedMember.associationCode ?? 'Unavailable'}</span>
              <span>Matriculation: {deceasedMember.memberMatriculationNumber}</span>
              <span>Date of death: {deceasedMember.dateOfDeath}</span>
              <span>Place of death: {deceasedMember.placeOfDeath}</span>
            </div>
          </div>
          <div className='flex shrink-0 flex-wrap items-center gap-2'>
            <RestoreDeceasedMemberButton allowExpiredRestore={isAdminUser} deceasedMember={deceasedMember} />
            <Badge variant={uploadedCount === requiredDocumentTypes.length ? 'default' : 'secondary'}>
              {uploadedCount} / {requiredDocumentTypes.length} uploaded
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className='px-4 py-4 sm:px-6'>
        <div className='grid gap-5'>
          <DeathDocumentationDetailsForm deceasedMember={deceasedMember} />

          <div className='grid gap-3'>
            <div>
              <h3 className='text-sm font-extrabold'>
                {requiresInternationalDocuments
                  ? 'Required documents for death outside the United States'
                  : 'Required documents for death in the United States'}
              </h3>
              <p className='text-muted-foreground mt-1 text-xs'>
                {requiresInternationalDocuments
                  ? 'These documents are required when the death occurred in a country other than the USA.'
                  : 'These documents are required when the death occurred in the United States.'}
              </p>
            </div>
            <div className='grid w-full min-w-0 gap-4 lg:grid-cols-2 2xl:grid-cols-4'>
              {requiredDocumentTypes.map(documentType => (
                <DocumentationSlot
                  key={documentType}
                  currentUserId={currentUserId}
                  deceasedMember={deceasedMember}
                  documentType={documentType}
                  isAdminUser={isAdminUser}
                  uploadedDocument={documentsByType.get(documentType)}
                />
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

const DeathDocumentationsContent = ({
  currentUserId,
  deceasedMembers,
  description,
  emptyDescription,
  emptyTitle,
  isAdminUser,
  title
}: DeathDocumentationsContentProps) => {
  const caseListItems: DeathDocumentationCasesListItem[] = deceasedMembers.map(deceasedMember => ({
    id: deceasedMember.id,
    searchText: getCaseSearchText(deceasedMember)
  }))

  const totalRequiredDocuments = deceasedMembers.reduce(
    (total, deceasedMember) => total + getRequiredDocumentTypes(deceasedMember).length,
    0
  )

  const uploadedDocuments = deceasedMembers.reduce(
    (total, deceasedMember) => total + getUploadedDocumentCount(deceasedMember),
    0
  )

  const actionRequiredCount = isAdminUser
    ? countSubmittedDeathDocuments(deceasedMembers)
    : deceasedMembers.filter(needsDelegateDeathDocumentationAction).length

  const alertToneClassName = isAdminUser
    ? 'border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/40'
    : 'border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/40'

  const alertTextClassName = isAdminUser
    ? 'text-amber-800 dark:text-amber-200'
    : 'text-blue-800 dark:text-blue-200'

  const alertMutedTextClassName = isAdminUser
    ? 'text-amber-700 dark:text-amber-300'
    : 'text-blue-700 dark:text-blue-300'

  const actionLabel = isAdminUser
    ? `${actionRequiredCount} document${actionRequiredCount === 1 ? '' : 's'}`
    : `${actionRequiredCount} case${actionRequiredCount === 1 ? '' : 's'}`

  return (
    <section className='grid w-full max-w-full min-w-0 shrink-0 gap-5 overflow-visible px-0 py-4 sm:px-6 sm:py-8 lg:px-8'>
      <div className='flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between'>
        <div>
          <h1 className='text-2xl font-extrabold tracking-normal sm:text-3xl'>{title}</h1>
          <p className='text-muted-foreground mt-1 text-sm'>{description}</p>
        </div>
        <Badge variant='outline' className='w-fit text-sm'>
          {uploadedDocuments} / {totalRequiredDocuments} documents uploaded
        </Badge>
      </div>

      {actionRequiredCount > 0 ? (
        <Card className={cn('rounded-lg py-0', alertToneClassName)}>
          <CardContent className='flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between'>
            <div className='flex min-w-0 items-start gap-3'>
              {isAdminUser ? (
                <ShieldCheck className={cn('mt-0.5 size-5 shrink-0', alertMutedTextClassName)} />
              ) : (
                <FileText className={cn('mt-0.5 size-5 shrink-0', alertMutedTextClassName)} />
              )}
              <div className='min-w-0'>
                <p className={cn('font-extrabold', alertTextClassName)}>
                  {isAdminUser ? 'Death document review pending' : 'Death documentation action required'}
                </p>
                <p className={cn('text-sm', alertMutedTextClassName)}>
                  {isAdminUser
                    ? `${actionLabel} waiting for admin review.`
                    : `${actionLabel} need details, missing documents, or corrected uploads.`}
                </p>
              </div>
            </div>
            <Badge variant='outline' className={cn('w-fit border-current bg-white dark:bg-black/20', alertTextClassName)}>
              {actionRequiredCount} {isAdminUser ? 'pending' : 'required'}
            </Badge>
          </CardContent>
        </Card>
      ) : null}

      {deceasedMembers.length === 0 ? (
        <Card className='rounded-lg'>
          <CardContent className='py-8 text-center'>
            <Upload className='text-muted-foreground mx-auto mb-3 size-8' />
            <p className='font-semibold'>{emptyTitle}</p>
            <p className='text-muted-foreground mt-1 text-sm'>{emptyDescription}</p>
          </CardContent>
        </Card>
      ) : (
        <DeathDocumentationCasesList cases={caseListItems} emptyDescription={emptyDescription}>
          {deceasedMembers.map(deceasedMember => (
            <DeceasedMemberDocumentationCard
              key={deceasedMember.id}
              currentUserId={currentUserId}
              deceasedMember={deceasedMember}
              isAdminUser={isAdminUser}
            />
          ))}
        </DeathDocumentationCasesList>
      )}
    </section>
  )
}

export default DeathDocumentationsContent
