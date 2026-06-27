import { ArrowLeftRight, CheckCircle2, Clock3, ShieldCheck, XCircle } from 'lucide-react'

import FormContainer from '@/components/forms/FormContainer'
import { SubmitButton } from '@/components/forms/Buttons'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import {
  cancelMemberTransferRequestAction,
  reviewAdminMemberTransferRequestAction,
  reviewIncomingMemberTransferRequestAction
} from '@/utils/actions'
import { memberTransferRequestStatusLabels, type MemberTransferRequestStatus } from '@/utils/types'

export type MemberTransferRequestCardData = {
  id: string
  adminReviewedAt?: Date | null
  createdAt: Date
  currentFirstName: string
  currentLastAndMiddleNames: string
  initiatingAssociationCode: string
  initiatingClerkId: string
  member?: {
    associationCode: string
    clerkId?: string
    firstName: string
    lastAndMiddleNames: string
    memberMatriculationNumber: string
  } | null
  memberMatriculationNumber: string
  receivingAssociationCode: string
  receivingClerkId: string
  receivingReviewedAt?: Date | null
  rejectionReason?: string | null
  status: string
}

const dateTimeFormatter = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium',
  timeStyle: 'short'
})

export const formatTransferRequestDateTime = (date: Date) => dateTimeFormatter.format(date)

export const getTransferRequestMemberName = (request: MemberTransferRequestCardData) =>
  `${request.currentFirstName} ${request.currentLastAndMiddleNames}`.trim()

const getStatusLabel = (status: string) =>
  memberTransferRequestStatusLabels[status as MemberTransferRequestStatus] ?? status

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

export const RequestStatusBadge = ({ status }: { status: string }) => (
  <Badge variant='outline' className={cn('shrink-0 capitalize', getStatusClassName(status))}>
    {status === 'admin_approved' ? <CheckCircle2 /> : null}
    {status === 'admin_rejected' || status === 'cancelled' || status === 'receiving_delegate_rejected' ? (
      <XCircle />
    ) : null}
    {status === 'receiving_delegate_pending' || status === 'receiving_delegate_approved' ? <Clock3 /> : null}
    {getStatusLabel(status)}
  </Badge>
)

const ReleasingDelegateControls = ({
  compact = false,
  request
}: {
  compact?: boolean
  request: MemberTransferRequestCardData
}) => {
  if (request.status !== 'receiving_delegate_pending') return null

  const rejectionReasonId = `release-rejection-reason-${request.id}`

  return (
    <div className={cn('grid gap-2 rounded-md border bg-white/60 dark:bg-black/10', compact ? 'p-2' : 'p-3')}>
      <div className='flex items-center gap-1.5 text-xs font-semibold'>
        <ArrowLeftRight className='size-3.5' />
        Current delegate release review
      </div>
      <div className={cn('grid gap-2', compact ? '' : 'sm:grid-cols-2')}>
        <FormContainer action={reviewIncomingMemberTransferRequestAction} refreshOnMessage>
          <input type='hidden' name='requestId' value={request.id} />
          <input type='hidden' name='status' value='receiving_delegate_approved' />
          <SubmitButton
            text='Approve release'
            className='h-8 w-full bg-green-700 px-3 text-xs normal-case hover:bg-green-800'
          />
        </FormContainer>
        <FormContainer action={reviewIncomingMemberTransferRequestAction} className='grid gap-2' refreshOnMessage>
          <input type='hidden' name='requestId' value={request.id} />
          <input type='hidden' name='status' value='receiving_delegate_rejected' />
          <SubmitButton
            text='Reject release'
            className='h-8 w-full bg-red-700 px-3 text-xs normal-case hover:bg-red-800'
          />
          <Textarea
            id={rejectionReasonId}
            aria-label='Give the reason to reject the release'
            name='rejectionReason'
            placeholder='Give the reason to reject the release'
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
  request
}: {
  compact?: boolean
  request: MemberTransferRequestCardData
}) => {
  if (request.status !== 'receiving_delegate_approved') return null

  return (
    <div className={cn('grid gap-2 rounded-md border bg-white/60 dark:bg-black/10', compact ? 'p-2' : 'p-3')}>
      <div className='flex items-center gap-1.5 text-xs font-semibold'>
        <ShieldCheck className='size-3.5' />
        Admin review
      </div>
      <div className={cn('grid gap-2', compact ? '' : 'sm:grid-cols-2')}>
        <FormContainer action={reviewAdminMemberTransferRequestAction} refreshOnMessage>
          <input type='hidden' name='requestId' value={request.id} />
          <input type='hidden' name='status' value='admin_approved' />
          <SubmitButton
            text='Complete transfer'
            className='h-8 w-full bg-green-700 px-3 text-xs normal-case hover:bg-green-800'
          />
        </FormContainer>
        <FormContainer action={reviewAdminMemberTransferRequestAction} className='grid gap-2' refreshOnMessage>
          <input type='hidden' name='requestId' value={request.id} />
          <input type='hidden' name='status' value='admin_rejected' />
          <SubmitButton
            text='Reject transfer'
            className='h-8 w-full bg-red-700 px-3 text-xs normal-case hover:bg-red-800'
          />
          <Textarea
            name='rejectionReason'
            placeholder='Reason if rejected'
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
  request
}: {
  compact?: boolean
  request: MemberTransferRequestCardData
}) => {
  const cancelRequest = cancelMemberTransferRequestAction.bind(null, { requestId: request.id })

  return (
    <div className='grid gap-1.5'>
      <FormContainer action={cancelRequest} refreshOnMessage>
        <SubmitButton
          text='Cancel request'
          className={cn('h-8 w-full bg-red-700 px-3 text-xs normal-case hover:bg-red-800', compact ? '' : 'sm:w-fit')}
        />
      </FormContainer>
      <p className='text-muted-foreground text-xs'>You can cancel this request unless SAGI admin has approved it.</p>
    </div>
  )
}

const canRequestingDelegateCancelTransfer = (status: string) => status !== 'admin_approved' && status !== 'cancelled'

export const MemberTransferRequestActions = ({
  className,
  compact = false,
  currentUserClerkId,
  emptyLabel = null,
  isAdminUser,
  request
}: {
  className?: string
  compact?: boolean
  currentUserClerkId?: string
  emptyLabel?: string | null
  isAdminUser: boolean
  request: MemberTransferRequestCardData
}) => {
  const isInitiatingDelegate = currentUserClerkId === request.initiatingClerkId
  const isReceivingDelegate = currentUserClerkId === request.receivingClerkId

  const hasReceivingDelegateAction = isReceivingDelegate && canRequestingDelegateCancelTransfer(request.status)
  const hasReleasingDelegateAction = isInitiatingDelegate && request.status === 'receiving_delegate_pending'
  const hasAdminAction = isAdminUser && request.status === 'receiving_delegate_approved'

  if (!hasReceivingDelegateAction && !hasReleasingDelegateAction && !hasAdminAction) {
    if (!emptyLabel) return null

    return <span className={cn('text-muted-foreground text-xs font-semibold', className)}>{emptyLabel}</span>
  }

  return (
    <div className={cn('grid gap-2', className)}>
      {hasReceivingDelegateAction ? <DelegateCancelTransferControl compact={compact} request={request} /> : null}
      {hasReleasingDelegateAction ? <ReleasingDelegateControls compact={compact} request={request} /> : null}
      {hasAdminAction ? <AdminTransferControls compact={compact} request={request} /> : null}
    </div>
  )
}

const MemberTransferRequestCard = ({
  currentUserClerkId,
  isAdminUser,
  request
}: {
  currentUserClerkId?: string
  isAdminUser: boolean
  request: MemberTransferRequestCardData
}) => {
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
            <span>Matriculation: {request.memberMatriculationNumber}</span>
            <span>Submitted: {formatTransferRequestDateTime(request.createdAt)}</span>
            {showRequestingAssociationCode ? (
              <span>Requested by delegate association code: {request.receivingAssociationCode}</span>
            ) : null}
          </div>
        </div>
        <RequestStatusBadge status={request.status} />
      </div>

      <div className='grid gap-2 text-sm sm:grid-cols-2'>
        <div className='rounded-md border bg-background/70 p-3'>
          <p className='text-muted-foreground text-xs font-semibold'>Current delegate association code</p>
          <p className='mt-1 font-extrabold break-words'>{request.initiatingAssociationCode}</p>
        </div>
        <div className='rounded-md border bg-background/70 p-3'>
          <p className='text-muted-foreground text-xs font-semibold'>Receiving delegate association code</p>
          <p className='mt-1 font-extrabold break-words'>{request.receivingAssociationCode}</p>
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
        request={request}
      />
    </div>
  )
}

export default MemberTransferRequestCard
