import {
  getRequiredDeceasedMemberDocumentTypes,
  type DeceasedMemberDocument,
  type DeceasedMemberType
} from './types'

export type DeathDocumentationAlertCase = Pick<
  DeceasedMemberType,
  'familyContactName' | 'familyContactPhoneNumber' | 'placeOfDeathCountry'
> & {
  documents?: Pick<DeceasedMemberDocument, 'documentType' | 'status'>[]
}

export const hasDeathDocumentationDetails = (deceasedMember: DeathDocumentationAlertCase) =>
  Boolean(
    deceasedMember.familyContactName?.trim() &&
      deceasedMember.familyContactPhoneNumber?.trim() &&
      deceasedMember.placeOfDeathCountry?.trim()
  )

export const needsDelegateDeathDocumentationAction = (deceasedMember: DeathDocumentationAlertCase) => {
  if (!hasDeathDocumentationDetails(deceasedMember)) return true

  const documentsByType = new Map(
    deceasedMember.documents?.map(document => [document.documentType, document.status]) ?? []
  )

  return getRequiredDeceasedMemberDocumentTypes(deceasedMember).some(documentType => {
    const status = documentsByType.get(documentType)

    return !status || status === 'rejected'
  })
}

export const countSubmittedDeathDocuments = (deceasedMembers: DeathDocumentationAlertCase[]) =>
  deceasedMembers.reduce(
    (total, deceasedMember) =>
      total + (deceasedMember.documents?.filter(document => document.status === 'submitted').length ?? 0),
    0
  )
