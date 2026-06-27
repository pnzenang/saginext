import type { ComponentType } from 'react'

export type MenuSubItem = {
  label: string
  href: string
  badge?: string
}

export type MenuItem = {
  icon: ComponentType
  label: string
  href: string
}

export type actionFunction = (prevState: any, formData: FormData) => Promise<{ message: string }>

export enum delegateRecommendation {
  Confirm = 'confirm',
  TransferFromSagicam = 'transfer_From_SAGICAM',
  TransferFromSagiEurope = 'transfer_From_SAGIEUROPE',
  TransferFromSAgiNigeria = 'transfer_From_SAGINIGERIA',
  TransferFromSagiGhana = 'transfer_From_SAGIGHANA',
  TransferFromSagiCoteDivoire = 'transfer_From_SAGICOTEDIVOIRE',
  TransferIn = 'transfer_In',
  TransferOut = 'transfer_Out'
}

export enum memberStatus {
  Pending = 'pending',
  Awaiting = 'awaiting_publication',
  Vested = 'vested',
  Delinquent = 'not_in_good_standing'
}

export type MemberType = {
  id: string
  clerkId: string
  firstName: string
  lastAndMiddleNames: string
  dateOfBirth: string
  countryOfResidence: string
  memberMatriculationNumber: string
  delegateRecommendation?: string
  memberStatus?: string
  nameOfBeneficiary?: string
  associationName: string
  associationCode: string
  createdAt: Date
  updatedAt: Date
}

export type RemovedMemberType = {
  id: string
  originalMemberId?: string | null
  clerkId: string
  firstName: string
  lastAndMiddleNames: string
  dateOfBirth: string
  countryOfResidence: string
  memberMatriculationNumber: string
  registrationDate: string
  associationName?: string | null
  associationCode: string
  nameOfBeneficiary?: string | null
  delegateRecommendation?: string | null
  memberStatus?: string | null
  reasonForLeaving: string
  originalMemberCreatedAt?: Date | null
  createdAt: Date
  updatedAt: Date
}

export enum reasonForLeaving {
  NoReason = 'No Reason',
  Relocated = 'Moved out of USA',
  TooExpensive = 'Too Expensive',
  NotNeededAnymore = 'Not Interested Anymore'
}

export type DeceasedMemberType = {
  id: string
  clerkId: string
  firstName: string
  lastAndMiddleNames: string
  contributionStatus: string
  registrationDate: string
  countryOfResidence: string
  memberMatriculationNumber: string
  nameOfBeneficiary?: string
  associationName: string
  associationCode?: string | null
  dateOfDeath: string
  placeOfDeath: string
  createdAt: Date
  updatedAt: Date
}

export enum contributionStatus {
  review = 'Case_In_Review',
  denied = 'Contribution_Denied',
  underway = 'Contribution_Underway',
  completed = 'Contribution_Completed'
}

export const deceasedMemberDocumentTypes = [
  'death_certificate',
  'deceased_id_card',
  'deceased_picture',
  'funeral_program'
] as const

export type DeceasedMemberDocumentType = (typeof deceasedMemberDocumentTypes)[number]

export const deceasedMemberDocumentLabels: Record<DeceasedMemberDocumentType, string> = {
  death_certificate: 'Death certificate',
  deceased_id_card: 'Deceased ID card',
  deceased_picture: 'Deceased picture',
  funeral_program: 'Funeral program'
}

export const deceasedMemberDocumentStatuses = ['submitted', 'approved', 'rejected'] as const

export type DeceasedMemberDocumentStatus = (typeof deceasedMemberDocumentStatuses)[number]

export const deceasedMemberDocumentStatusLabels: Record<DeceasedMemberDocumentStatus, string> = {
  approved: 'Approved',
  rejected: 'Rejected',
  submitted: 'Submitted'
}

export type DeceasedMemberDocument = {
  id: string
  deceasedMemberId: string
  clerkId: string
  associationCode?: string | null
  documentType: string
  fileName: string
  mimeType: string
  fileSize: number
  status: string
  rejectionReason?: string | null
  createdAt: Date
  updatedAt: Date
}

export type DeceasedMemberWithDocuments = DeceasedMemberType & {
  documents: DeceasedMemberDocument[]
}

export const nameChangeRequestReasons = ['typo_or_error', 'legal_document'] as const

export type NameChangeRequestReason = (typeof nameChangeRequestReasons)[number]

export const nameChangeRequestReasonLabels: Record<NameChangeRequestReason, string> = {
  legal_document: 'Legal document',
  typo_or_error: 'Typo or correction'
}

export const nameChangeRequestStatuses = ['submitted', 'documentation_requested', 'approved', 'rejected'] as const

export type NameChangeRequestStatus = (typeof nameChangeRequestStatuses)[number]

export const nameChangeRequestStatusLabels: Record<NameChangeRequestStatus, string> = {
  approved: 'Approved',
  documentation_requested: 'Documentation requested',
  rejected: 'Rejected',
  submitted: 'Submitted'
}

export const memberTransferRequestStatuses = [
  'receiving_delegate_pending',
  'receiving_delegate_approved',
  'receiving_delegate_rejected',
  'admin_approved',
  'admin_rejected',
  'cancelled'
] as const

export type MemberTransferRequestStatus = (typeof memberTransferRequestStatuses)[number]

export const memberTransferRequestStatusLabels: Record<MemberTransferRequestStatus, string> = {
  admin_approved: 'Admin approved',
  admin_rejected: 'Admin rejected',
  cancelled: 'Cancelled',
  receiving_delegate_approved: 'Delegate release approved',
  receiving_delegate_pending: 'Delegate release pending',
  receiving_delegate_rejected: 'Delegate release rejected'
}
