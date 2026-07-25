import { ArrowLeftRight, CheckCircle2, Clock3, ShieldCheck, XCircle } from 'lucide-react'

import FormContainer from '@/components/forms/FormContainer'
import { SubmitButton } from '@/components/forms/Buttons'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { formatMemberTransferRequestStatus, type AppLanguage } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import {
  cancelMemberTransferRequestAction,
  reviewAdminMemberTransferRequestAction,
  reviewIncomingMemberTransferRequestAction
} from '@/utils/actions'

export type MemberTransferRequestCardData = {
  id: string
  adminReviewedAt?: Date | null
  createdAt: Date
  currentFirstName: string
  currentLastAndMiddleNames: string
  initiatingAssociationCode: string
  initiatingAssociationName?: string | null
  initiatingClerkId: string
  member?: {
    associationCode: string
    associationName?: string | null
    clerkId?: string
    firstName: string
    lastAndMiddleNames: string
    memberMatriculationNumber: string
  } | null
  memberMatriculationNumber: string
  receivingAssociationCode: string
  receivingAssociationName?: string | null
  receivingClerkId: string
  receivingReviewedAt?: Date | null
  receivingReviewedBy?: string | null
  rejectionReason?: string | null
  status: string
}

const dateTimeFormatters: Record<AppLanguage, Intl.DateTimeFormat> = {
  en: new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }),
  fr: new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short'
  })
}

export const formatTransferRequestDateTime = (date: Date, language: AppLanguage = 'en') =>
  dateTimeFormatters[language].format(date)

export const getTransferRequestMemberName = (request: MemberTransferRequestCardData) =>
  `${request.currentFirstName} ${request.currentLastAndMiddleNames}`.trim()

const formatAssociationLabel = (associationCode: string, associationName?: string | null) =>
  associationName ? `${associationCode} - ${associationName}` : associationCode

const getStatusClassName = (status: string) => {
  if (status === 'admin_approved') {
    return 'border-green-200 bg-green-50 text-green-700 dark:border-green-900 dark:bg-green-950/40 dark:text-green-300'
  }

  if (status === 'admin_rejected' || status === 'cancelled' || status === 'receiving_delegate_rejected') {
    return 'border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300'
  }

  if (status === 'receiving_delegate_approved') {
    return 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300'
  }

  return 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300'
}

const memberTransferRequestCardCopy = {
  en: {
    adminRejectReasonPlaceholder: 'Reason if rejected',
    adminReview: 'Admin review',
    approveRelease: 'Approve release',
    approveTransfer: 'Approve transfer',
    cancelNote: 'You can cancel this request unless SAGI admin has approved it.',
    cancelRequest: 'Cancel request',
    completeTransfer: 'Complete transfer',
    currentDelegateAssociation: 'Current delegate association',
    currentDelegateReleaseReview: 'Current delegate release review',
    matriculation: 'Matriculation',
    receivingDelegateAssociation: 'Receiving delegate association',
    receivingDelegateReview: 'Receiving delegate review',
    rejectRelease: 'Reject release',
    rejectReleaseReason: 'Give the reason to reject the release',
    rejectTransfer: 'Reject transfer',
    rejectTransferReason: 'Give the reason to reject the transfer',
    submitted: 'Submitted'
  },
  fr: {
    adminRejectReasonPlaceholder: 'Raison du rejet',
    adminReview: 'Revue admin',
    approveRelease: 'Approuver la libération',
    approveTransfer: 'Approuver le transfert',
    cancelNote: "Vous pouvez annuler cette demande sauf si l'admin SAGI l'a approuvée.",
    cancelRequest: 'Annuler la demande',
    completeTransfer: 'Terminer le transfert',
    currentDelegateAssociation: 'Association déléguée actuelle',
    currentDelegateReleaseReview: 'Revue de libération du délégué actuel',
    matriculation: 'Matricule',
    receivingDelegateAssociation: 'Association déléguée destinataire',
    receivingDelegateReview: 'Revue du délégué destinataire',
    rejectRelease: 'Rejeter la libération',
    rejectReleaseReason: 'Indiquez la raison du rejet de la libération',
    rejectTransfer: 'Rejeter le transfert',
    rejectTransferReason: 'Indiquez la raison du rejet du transfert',
    submitted: 'Soumis'
  }
} as const

export const RequestStatusBadge = ({ language, status }: { language: AppLanguage; status: string }) => (
  <Badge variant='outline' className={cn('shrink-0 capitalize', getStatusClassName(status))}>
    {status === 'admin_approved' ? <CheckCircle2 /> : null}
    {status === 'admin_rejected' || status === 'cancelled' || status === 'receiving_delegate_rejected' ? (
      <XCircle />
    ) : null}
    {status === 'receiving_delegate_pending' ||
    status === 'admin_initiated' ||
    status === 'initiating_delegate_approved' ||
    status === 'receiving_delegate_approved' ? (
      <Clock3 />
    ) : null}
    {formatMemberTransferRequestStatus(status, language)}
  </Badge>
)

const ReleasingDelegateControls = ({
  compact = false,
  language,
  reviewKind,
  request
}: {
  compact?: boolean
  language: AppLanguage
  reviewKind: 'release' | 'receiving'
  request: MemberTransferRequestCardData
}) => {
  if (!['admin_initiated', 'receiving_delegate_pending', 'initiating_delegate_approved'].includes(request.status)) {
    return null
  }

  const copy = memberTransferRequestCardCopy[language]
  const rejectionReasonId = `release-rejection-reason-${request.id}`
  const isReleaseReview = reviewKind === 'release'

  const approvedStatus =
    request.status === 'admin_initiated' ? 'initiating_delegate_approved' : 'receiving_delegate_approved'

  return (
    <div className={cn('grid gap-2 rounded-md border bg-white/60 dark:bg-black/10', compact ? 'p-2' : 'p-3')}>
      <div className='flex items-center gap-1.5 text-xs font-semibold'>
        <ArrowLeftRight className='size-3.5' />
        {isReleaseReview ? copy.currentDelegateReleaseReview : copy.receivingDelegateReview}
      </div>
      <div className={cn('grid gap-2', compact ? '' : 'sm:grid-cols-2')}>
        <FormContainer action={reviewIncomingMemberTransferRequestAction}>
          <input type='hidden' name='requestId' value={request.id} />
          <input type='hidden' name='status' value={approvedStatus} />
          <SubmitButton
            text={isReleaseReview ? copy.approveRelease : copy.approveTransfer}
            className='h-8 w-full bg-green-700 px-3 text-xs normal-case hover:bg-green-800'
          />
        </FormContainer>
        <FormContainer action={reviewIncomingMemberTransferRequestAction} className='grid gap-2'>
          <input type='hidden' name='requestId' value={request.id} />
          <input type='hidden' name='status' value='receiving_delegate_rejected' />
          <SubmitButton
            text={isReleaseReview ? copy.rejectRelease : copy.rejectTransfer}
            className='h-8 w-full bg-red-700 px-3 text-xs normal-case hover:bg-red-800'
          />
          <Textarea
            id={rejectionReasonId}
            aria-label={isReleaseReview ? copy.rejectReleaseReason : copy.rejectTransferReason}
            name='rejectionReason'
            placeholder={isReleaseReview ? copy.rejectReleaseReason : copy.rejectTransferReason}
            required
            defaultValue={request.rejectionReason ?? ''}
            className={cn('text-xs', compact ? 'min-h-14' : 'min-h-16')}
          />
        </FormContainer>
      </div>
    </div>
  )
}

const AdminTransferControls = ({
  compact = false,
  language,
  request
}: {
  compact?: boolean
  language: AppLanguage
  request: MemberTransferRequestCardData
}) => {
  if (request.status !== 'receiving_delegate_approved') return null

  const copy = memberTransferRequestCardCopy[language]

  return (
    <div className={cn('grid gap-2 rounded-md border bg-white/60 dark:bg-black/10', compact ? 'p-2' : 'p-3')}>
      <div className='flex items-center gap-1.5 text-xs font-semibold'>
        <ShieldCheck className='size-3.5' />
        {copy.adminReview}
      </div>
      <div className={cn('grid gap-2', compact ? '' : 'sm:grid-cols-2')}>
        <FormContainer action={reviewAdminMemberTransferRequestAction}>
          <input type='hidden' name='requestId' value={request.id} />
          <input type='hidden' name='status' value='admin_approved' />
          <SubmitButton
            text={copy.completeTransfer}
            className='h-8 w-full bg-green-700 px-3 text-xs normal-case hover:bg-green-800'
          />
        </FormContainer>
        <FormContainer action={reviewAdminMemberTransferRequestAction} className='grid gap-2'>
          <input type='hidden' name='requestId' value={request.id} />
          <input type='hidden' name='status' value='admin_rejected' />
          <SubmitButton
            text={copy.rejectTransfer}
            className='h-8 w-full bg-red-700 px-3 text-xs normal-case hover:bg-red-800'
          />
          <Textarea
            name='rejectionReason'
            placeholder={copy.adminRejectReasonPlaceholder}
            defaultValue={request.rejectionReason ?? ''}
            className={cn('text-xs', compact ? 'min-h-14' : 'min-h-16')}
          />
        </FormContainer>
      </div>
    </div>
  )
}

const DelegateCancelTransferControl = ({
  compact = false,
  language,
  request
}: {
  compact?: boolean
  language: AppLanguage
  request: MemberTransferRequestCardData
}) => {
  const copy = memberTransferRequestCardCopy[language]
  const cancelRequest = cancelMemberTransferRequestAction.bind(null, { requestId: request.id })

  return (
    <div className='grid gap-1.5'>
      <FormContainer action={cancelRequest}>
        <SubmitButton
          text={copy.cancelRequest}
          className={cn('h-8 w-full bg-red-700 px-3 text-xs normal-case hover:bg-red-800', compact ? '' : 'sm:w-fit')}
        />
      </FormContainer>
      <p className='text-muted-foreground text-xs'>{copy.cancelNote}</p>
    </div>
  )
}

const cancellableTransferStatuses = [
  'admin_initiated',
  'receiving_delegate_pending',
  'initiating_delegate_approved',
  'receiving_delegate_approved'
] as const

const canDelegateCancelTransfer = (status: string) =>
  cancellableTransferStatuses.includes(status as (typeof cancellableTransferStatuses)[number])

const getRequestInitiatorClerkId = (request: MemberTransferRequestCardData) => {
  if (request.status === 'admin_initiated') return null

  if (request.status === 'receiving_delegate_pending') return request.receivingClerkId

  if (request.status === 'initiating_delegate_approved') return request.initiatingClerkId

  if (request.status === 'receiving_delegate_approved') {
    return request.receivingReviewedBy === request.receivingClerkId
      ? request.initiatingClerkId
      : request.receivingClerkId
  }

  return null
}

export const MemberTransferRequestActions = ({
  className,
  compact = false,
  currentUserClerkId,
  emptyLabel = null,
  isAdminUser,
  language,
  request
}: {
  className?: string
  compact?: boolean
  currentUserClerkId?: string
  emptyLabel?: string | null
  isAdminUser: boolean
  language: AppLanguage
  request: MemberTransferRequestCardData
}) => {
  const isInitiatingDelegate = currentUserClerkId === request.initiatingClerkId
  const isReceivingDelegate = currentUserClerkId === request.receivingClerkId
  const requestInitiatorClerkId = getRequestInitiatorClerkId(request)

  const hasCancelAction =
    !isAdminUser && currentUserClerkId === requestInitiatorClerkId && canDelegateCancelTransfer(request.status)

  const delegateReviewKind =
    isInitiatingDelegate && ['admin_initiated', 'receiving_delegate_pending'].includes(request.status)
      ? 'release'
      : isReceivingDelegate && request.status === 'initiating_delegate_approved'
        ? 'receiving'
        : null

  const hasAdminAction = isAdminUser && request.status === 'receiving_delegate_approved'

  if (!hasCancelAction && !delegateReviewKind && !hasAdminAction) {
    if (!emptyLabel) return null

    return <span className={cn('text-muted-foreground text-xs font-semibold', className)}>{emptyLabel}</span>
  }

  return (
    <div className={cn('grid gap-2', className)}>
      {hasCancelAction ? (
        <DelegateCancelTransferControl compact={compact} language={language} request={request} />
      ) : null}
      {delegateReviewKind ? (
        <ReleasingDelegateControls
          compact={compact}
          language={language}
          request={request}
          reviewKind={delegateReviewKind}
        />
      ) : null}
      {hasAdminAction ? <AdminTransferControls compact={compact} language={language} request={request} /> : null}
    </div>
  )
}

const MemberTransferRequestCard = ({
  currentUserClerkId,
  isAdminUser,
  language,
  request
}: {
  currentUserClerkId?: string
  isAdminUser: boolean
  language: AppLanguage
  request: MemberTransferRequestCardData
}) => {
  const copy = memberTransferRequestCardCopy[language]
  const memberName = getTransferRequestMemberName(request)
  const isRequestingDelegate = currentUserClerkId === request.receivingClerkId
  const showRequestingAssociationCode = isAdminUser || (!!currentUserClerkId && !isRequestingDelegate)

  return (
    <div className='grid min-w-0 gap-4 rounded-md border bg-muted/20 p-4'>
      <div className='flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between'>
        <div className='min-w-0'>
          <div className='flex items-center gap-2 text-sm font-extrabold'>
            <ArrowLeftRight className='text-primary size-4' />
            <span className='break-words'>{memberName}</span>
          </div>
          <div className='text-muted-foreground mt-1 grid gap-1 text-xs'>
            <span>
              {copy.matriculation}: {request.memberMatriculationNumber}
            </span>
            <span>
              {copy.submitted}: {formatTransferRequestDateTime(request.createdAt, language)}
            </span>
            {showRequestingAssociationCode ? (
              <span>
                {copy.receivingDelegateAssociation}:{' '}
                {formatAssociationLabel(request.receivingAssociationCode, request.receivingAssociationName)}
              </span>
            ) : null}
          </div>
        </div>
        <RequestStatusBadge language={language} status={request.status} />
      </div>

      <div className='grid gap-2 text-sm sm:grid-cols-2'>
        <div className='rounded-md border bg-background/70 p-3'>
          <p className='text-muted-foreground text-xs font-semibold'>{copy.currentDelegateAssociation}</p>
          <p className='mt-1 font-extrabold break-words'>
            {formatAssociationLabel(request.initiatingAssociationCode, request.initiatingAssociationName)}
          </p>
        </div>
        <div className='rounded-md border bg-background/70 p-3'>
          <p className='text-muted-foreground text-xs font-semibold'>{copy.receivingDelegateAssociation}</p>
          <p className='mt-1 font-extrabold break-words'>
            {formatAssociationLabel(request.receivingAssociationCode, request.receivingAssociationName)}
          </p>
        </div>
      </div>

      {request.rejectionReason ? (
        <p className='rounded-md border border-red-200 bg-red-50 px-2 py-1.5 text-xs text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300'>
          {request.rejectionReason}
        </p>
      ) : null}

      <MemberTransferRequestActions
        currentUserClerkId={currentUserClerkId}
        isAdminUser={isAdminUser}
        language={language}
        request={request}
      />
    </div>
  )
}

export default MemberTransferRequestCard
