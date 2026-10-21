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

// Only documents on the case's required list count as pending; leftovers from the other list
// (e.g. U.S. documents uploaded before the country was set to Cameroon) don't need review.
export const isRequiredDeathDocument = (deceasedMember: DeathDocumentationAlertCase, documentType: string) =>
  (getRequiredDeceasedMemberDocumentTypes(deceasedMember) as string[]).includes(documentType)

export const countSubmittedDeathDocuments = (deceasedMembers: DeathDocumentationAlertCase[]) =>
  deceasedMembers.reduce(
    (total, deceasedMember) =>
      total +
      (deceasedMember.documents?.filter(
        document => document.status === 'submitted' && isRequiredDeathDocument(deceasedMember, document.documentType)
      ).length ?? 0),
    0
  )
