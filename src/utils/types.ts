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
