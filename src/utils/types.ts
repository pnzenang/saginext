import type { ComponentType } from 'react'

export type MenuSubItem = {
  label: string
  href: string
  badge?: string
}

export type MenuItem = {
  alertCount?: number
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

export const delegateRecommendationOptions = [
  delegateRecommendation.Confirm,
  delegateRecommendation.TransferFromSagicam,
  delegateRecommendation.TransferFromSagiEurope,
  delegateRecommendation.TransferFromSAgiNigeria,
  delegateRecommendation.TransferFromSagiGhana,
  delegateRecommendation.TransferFromSagiCoteDivoire
] as const

export enum memberStatus {
  Pending = 'pending',
  Awaiting = 'awaiting_publication',
  Vested = 'vested',
  Delinquent = 'not_in_good_standing'
}

export const countryOfResidenceOptions = ['UNITED STATES', 'CANADA', 'MEXICO'] as const
export type CountryOfResidenceOption = (typeof countryOfResidenceOptions)[number]
export const defaultCountryOfResidence = countryOfResidenceOptions[0]
export const addMemberCountryOfResidenceOptions = [defaultCountryOfResidence] as const

export const getCountryOfResidenceDefault = (country?: string | null): CountryOfResidenceOption => {
  const normalizedCountry = country?.trim().toUpperCase()

  return countryOfResidenceOptions.includes(normalizedCountry as CountryOfResidenceOption)
    ? (normalizedCountry as CountryOfResidenceOption)
    : defaultCountryOfResidence
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
  originalMemberId?: string | null
  clerkId: string
  firstName: string
  lastAndMiddleNames: string
  contributionStatus: string
  registrationDate: string
  dateOfBirth?: string | null
  countryOfResidence: string
  memberMatriculationNumber: string
  nameOfBeneficiary?: string
  associationName: string
  associationCode?: string | null
  delegateRecommendation?: string | null
  memberStatus?: string | null
  originalMemberCreatedAt?: Date | null
  familyContactName?: string | null
  familyContactPhoneNumber?: string | null
  dateOfDeath: string
  placeOfDeath: string
  placeOfDeathCountry?: string | null
  createdAt: Date
  updatedAt: Date
}

export enum contributionStatus {
  review = 'Case_In_Review',
  denied = 'Contribution_Denied',
  underway = 'Contribution_Underway',
  completed = 'Contribution_Completed'
}

export const deceasedMemberUnitedStatesDocumentTypes = [
  'death_certificate',
  'deceased_id_card',
  'deceased_picture',
  'funeral_home_invoice',
  'funeral_program'
] as const

export const deceasedMemberInternationalDocumentTypes = [
  'ministry_certified_death_certificate',
  'social_security_death_report',
  'green_card_or_us_passport',
  'passport_visa_page',
  'trip_tickets',
  'funeral_program',
  'deceased_picture'
] as const

export const deceasedMemberDocumentTypes = [
  'death_certificate',
  'deceased_id_card',
  'deceased_picture',
  'funeral_home_invoice',
  'funeral_program',
  'ministry_certified_death_certificate',
  'social_security_death_report',
  'green_card_or_us_passport',
  'passport_visa_page',
  'trip_tickets'
] as const

export type DeceasedMemberDocumentType = (typeof deceasedMemberDocumentTypes)[number]

export const deceasedMemberDocumentLabels: Record<DeceasedMemberDocumentType, string> = {
  death_certificate: 'Death certificate',
  deceased_id_card: 'Deceased ID card',
  deceased_picture: 'Deceased picture(s)',
  funeral_home_invoice: 'Funeral Home invoice',
  funeral_program: 'Funeral program',
  green_card_or_us_passport: 'Copy of the deceased green card or US passport',
  ministry_certified_death_certificate:
    'Copy of death certificate certified by the Ministry of External Relations of the country of death',
  passport_visa_page: 'Visa page of the passport',
  social_security_death_report: 'Proof that the death has been reported to the Social Security Administration',
  trip_tickets: 'Copy of the deceased trip ticket(s)'
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
  'initiating_delegate_approved',
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
  initiating_delegate_approved: 'Receiving delegate approval pending',
  receiving_delegate_approved: 'Both delegates approved',
  receiving_delegate_pending: 'Delegate release pending',
  receiving_delegate_rejected: 'Delegate rejected'
}
