'use server'

import { randomUUID } from 'crypto'

import { auth, currentUser } from '@clerk/nextjs/server'

import { redirect } from 'next/navigation'

import { revalidatePath, unstable_noStore as noStore } from 'next/cache'
import { cookies } from 'next/headers'
import { after } from 'next/server'
import { customAlphabet } from 'nanoid'

import db from './db'
import {
  createMemberSchema,
  DeceasedMemberSchema,
  memberSchema,
  RemovedMemberSchema,
  validateWithZodSchema
} from './schemas'
import { Prisma } from '@/generated/prisma/client'
import {
  delegateIssueNotePriorities,
  deceasedMemberDocumentLabels,
  deceasedMemberDocumentStatuses,
  deceasedMemberDocumentTypes,
  hasApprovedRequiredDeceasedMemberDocuments,
  memberStatus,
  memberTransferRequestStatuses,
  nameChangeRequestStatuses,
  reasonForLeaving,
  type DelegateIssueNotePriority,
  type DelegateIssueNoteRole,
  type DeceasedMemberDocumentStatus,
  type DeceasedMemberDocumentType,
  type DashboardActivityLogRow,
  type MemberTransferRequestStatus,
  type NameChangeRequestStatus
} from './types'
import {
  contributionBalanceAdjustmentType,
  contributionCreditPerVestedMember,
  fetchAssociationContributionSummary,
  fetchLatestAssociationContributionAssessment
} from './sagi-contribution-summary'
import { awaitingPublicationVestingLongevityDays, getAwaitingPublicationVestingCutoff } from './sagi-member-longevity'
import { getOverdueRegistrationPaymentCreatedAtCutoff } from './registration-payment-deadline'
import {
  fetchAssociationRegistrationSummary,
  registrationBalanceAdjustmentType,
  registrationFeePerEligibleMember
} from './sagi-registration-summary'
import { contributionPaymentAlertType, registrationPaymentAlertType } from './payment-constants'
import {
  deleteCloudinaryDocument,
  getSafeCloudinaryPathSegment,
  uploadDocumentToCloudinary,
  type StoredCloudinaryDocument
} from './cloudinary-documents'
import { sendDeathAnnouncementAcknowledgmentEmail, sendMemberAdditionAcknowledgmentEmail } from './email'
import { languageCookieName, normalizeLanguage, type AppLanguage } from '@/lib/i18n'
import {
  createProfileAction as createProfileActionBase,
  fetchProfile as fetchProfileBase,
  updateProfileAction as updateProfileActionBase
} from './profile-actions'
import { associationPaymentLedgerEventTypes, associationPaymentTypes } from './sagi-payment-ledger'

const randomMatriculation = customAlphabet('1234567890', 6)
const MEMBER_REMOVAL_RESTORE_WINDOW_MS = 48 * 60 * 60 * 1000
const maxDocumentationFileSize = 20 * 1024 * 1024

const allowedDeceasedMemberDocumentMimeTypes = new Set([
  'application/pdf',
  'image/heic',
  'image/heif',
  'image/jpeg',
  'image/png',
  'image/webp'
])

const allowedDeceasedMemberDocumentExtensions = new Set(['.heic', '.heif', '.jpeg', '.jpg', '.pdf', '.png', '.webp'])

const currencyFormatter = new Intl.NumberFormat('en-US', {
  currency: 'USD',
  style: 'currency'
})

const registrationDateFormatter = new Intl.DateTimeFormat('en-US', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric'
})

const getAssociationDisplayName = (profile: { associationCode: string; associationName: string }) =>
  profile.associationName.trim() || profile.associationCode

const getMemberActivityLabel = (member: {
  firstName: string
  lastAndMiddleNames: string
  memberMatriculationNumber?: string | null
}) => {
  const fullName = `${member.firstName} ${member.lastAndMiddleNames}`.trim()
  const matriculationNumber = member.memberMatriculationNumber?.trim()

  return matriculationNumber ? `${fullName} (${matriculationNumber})` : fullName
}

const dashboardActivityScopes = {
  admin: 'admin',
  association: 'association'
} as const

type DashboardActivityScope = (typeof dashboardActivityScopes)[keyof typeof dashboardActivityScopes]
type DashboardActivityLogClient = Prisma.TransactionClient | typeof db
let dashboardActivityLogSchemaAvailable: boolean | undefined

const revalidateDashboardActivityLogs = () => {
  revalidatePath('/activity-log')
  revalidatePath('/admin-activity-log')
}

const hasDashboardActivityLogTable = async (client: DashboardActivityLogClient) => {
  if (dashboardActivityLogSchemaAvailable) return true

  const [result] = await client.$queryRaw<{ exists: boolean }[]>(
    Prisma.sql`
      SELECT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'DashboardActivityLog'
          AND column_name = 'actorEmail'
      ) AS "exists"
    `
  )

  dashboardActivityLogSchemaAvailable = Boolean(result?.exists)

  return dashboardActivityLogSchemaAvailable
}

const defaultAdminActivityEmail = 'info@sagiusa.org'

const findEmailClaim = (claims: unknown) => {
  if (!claims || typeof claims !== 'object') return null

  const record = claims as Record<string, unknown>
  const emailClaimNames = ['email', 'email_address', 'login_email', 'identifier']

  for (const claimName of emailClaimNames) {
    const value = record[claimName]

    if (typeof value === 'string' && value.includes('@')) {
      return value
    }
  }

  return null
}

const getAdminActivityEmail = (actorClerkId: string) => {
  if (actorClerkId !== process.env.ADMIN_USER_ID) return null

  const adminActivityEmail = process.env.ADMIN_ACTIVITY_EMAIL?.trim() || defaultAdminActivityEmail

  return adminActivityEmail.includes('@') ? adminActivityEmail : null
}

const fetchCurrentActorEmail = async (actorClerkId: string) => {
  const currentAuth = await auth().catch(() => null)

  if (currentAuth?.userId !== actorClerkId) return null

  const sessionEmail = findEmailClaim(currentAuth.sessionClaims)
  const actor = await currentUser().catch(() => null)

  if (actor?.id !== actorClerkId) return null

  const adminActivityEmail = getAdminActivityEmail(actorClerkId)

  const matchingAdminActivityEmail = adminActivityEmail
    ? actor.emailAddresses.find(email => email.emailAddress.toLowerCase() === adminActivityEmail.toLowerCase())
        ?.emailAddress
    : null

  if (matchingAdminActivityEmail) return matchingAdminActivityEmail
  if (sessionEmail) return sessionEmail

  return actor.primaryEmailAddress?.emailAddress ?? actor.emailAddresses[0]?.emailAddress ?? null
}

const recordDashboardActivity = async ({
  action,
  actorClerkId,
  associationCode,
  dashboardScope,
  entityId,
  entityType,
  metadata,
  summary,
  tx = db
}: {
  action: string
  actorClerkId: string
  associationCode?: string | null
  dashboardScope: DashboardActivityScope
  entityId?: string | null
  entityType: string
  metadata?: Prisma.InputJsonValue
  summary: string
  tx?: DashboardActivityLogClient
}) => {
  if (!(await hasDashboardActivityLogTable(tx))) {
    console.warn('DashboardActivityLog table is not available. Skipping activity log write.')

    return
  }

  const actorProfile = await tx.profile
    .findUnique({
      select: {
        associationCode: true,
        associationName: true
      },
      where: {
        clerkId: actorClerkId
      }
    })
    .catch(() => null)

  const actorEmail = await fetchCurrentActorEmail(actorClerkId)

  await tx.dashboardActivityLog.create({
    data: {
      action,
      actorAssociationCode: actorProfile?.associationCode ?? null,
      actorClerkId,
      actorEmail,
      actorName: actorProfile ? getAssociationDisplayName(actorProfile) : null,
      associationCode: associationCode ?? null,
      dashboardScope,
      entityId: entityId ?? null,
      entityType,
      ...(metadata === undefined ? {} : { metadata }),
      summary
    }
  })
}

const fetchDashboardActivityLogs = async (
  where: Prisma.DashboardActivityLogWhereInput
): Promise<DashboardActivityLogRow[]> => {
  noStore()

  if (!(await hasDashboardActivityLogTable(db))) {
    console.warn('DashboardActivityLog table is not available. Returning an empty activity log.')

    return []
  }

  const logs = await db.dashboardActivityLog.findMany({
    orderBy: {
      createdAt: 'desc'
    },
    take: 500,
    where
  })

  const associationCodes = Array.from(
    new Set(logs.map(log => log.associationCode).filter((code): code is string => Boolean(code)))
  )

  const associations =
    associationCodes.length > 0
      ? await db.profile.findMany({
          select: {
            associationCode: true,
            associationName: true
          },
          where: {
            associationCode: {
              in: associationCodes
            }
          }
        })
      : []

  const associationsByCode = new Map(associations.map(association => [association.associationCode, association]))

  return logs.map(log => {
    const association = log.associationCode ? associationsByCode.get(log.associationCode) : null
    const associationName = association ? getAssociationDisplayName(association) : ''

    return {
      action: log.action,
      actorEmail: log.actorEmail ?? '',
      associationCode: log.associationCode ?? '',
      associationLabel: [associationName, log.associationCode].filter(Boolean).join(' - '),
      createdAt: log.createdAt.toISOString(),
      dashboardScope: log.dashboardScope,
      entityId: log.entityId ?? '',
      entityType: log.entityType,
      id: log.id,
      summary: log.summary
    }
  })
}

const getAuthUser = async () => {
  const { userId } = await auth()

  if (!userId) {
    throw new Error('You must be login to access this route')
  }

  const profile = await db.profile.findUnique({
    where: {
      clerkId: userId
    },
    select: {
      id: true,
      internalRulesAcceptedAt: true
    }
  })

  if (!profile) redirect('/profile/create')
  if (!profile.internalRulesAcceptedAt) redirect('/internal-rules')

  return { id: userId }
}

const renderError = (error: unknown): { message: string } => {
  console.log(error)

  return { message: error instanceof Error ? error.message : 'An error occurred' }
}

const getServerActionLanguage = async (): Promise<AppLanguage> => {
  const cookieStore = await cookies()

  return normalizeLanguage(cookieStore.get(languageCookieName)?.value)
}

const decimalToNumber = (value: unknown) => Number(value ?? 0)
const roundCurrencyAmount = (amount: number) => Number(amount.toFixed(2))

const createMissingVerifiedLedgerEntry = async ({
  amountVerified,
  associationCode,
  createdBy,
  paymentType,
  tx,
  verifiedAt
}: {
  amountVerified: number
  associationCode: string
  createdBy: string
  paymentType: string
  tx: Prisma.TransactionClient
  verifiedAt: Date | null
}) => {
  if (amountVerified <= 0 || !verifiedAt) {
    return
  }

  const verifiedLedgerTotal = await tx.associationPaymentLedgerEntry.aggregate({
    _sum: {
      amount: true
    },
    where: {
      associationCode,
      cancelledAt: null,
      eventType: associationPaymentLedgerEventTypes.verified,
      paymentType
    }
  })

  const missingVerifiedAmount = roundCurrencyAmount(amountVerified - decimalToNumber(verifiedLedgerTotal._sum.amount))

  if (missingVerifiedAmount <= 0) {
    return
  }

  await tx.associationPaymentLedgerEntry.create({
    data: {
      amount: missingVerifiedAmount,
      associationCode,
      createdAt: verifiedAt,
      createdBy,
      eventType: associationPaymentLedgerEventTypes.verified,
      note: `${paymentType} payment verified by SAGI before payment history was recorded.`,
      paymentType
    }
  })
}

const createMissingSubmittedLedgerEntry = async ({
  amountSubmitted,
  associationCode,
  createdBy,
  paymentType,
  submittedAt,
  tx
}: {
  amountSubmitted: number
  associationCode: string
  createdBy: string
  paymentType: string
  submittedAt: Date | null
  tx: Prisma.TransactionClient
}) => {
  if (amountSubmitted <= 0 || !submittedAt) {
    return
  }

  const submittedLedgerTotal = await tx.associationPaymentLedgerEntry.aggregate({
    _sum: {
      amount: true
    },
    where: {
      associationCode,
      cancelledAt: null,
      eventType: associationPaymentLedgerEventTypes.submitted,
      paymentType
    }
  })

  const missingSubmittedAmount = roundCurrencyAmount(
    amountSubmitted - decimalToNumber(submittedLedgerTotal._sum.amount)
  )

  if (missingSubmittedAmount <= 0) {
    return
  }

  await tx.associationPaymentLedgerEntry.create({
    data: {
      amount: missingSubmittedAmount,
      associationCode,
      createdAt: submittedAt,
      createdBy,
      eventType: associationPaymentLedgerEventTypes.submitted,
      note: `${paymentType} payment submitted before payment history was recorded.`,
      paymentType
    }
  })
}

type PaymentHistorySnapshot = {
  amountSent: unknown
  amountVerified: unknown
  associationCode: string
  createdAt: Date
  verifiedAt: Date | null
}

const getSubmittedAmountForPaymentHistory = (payment: PaymentHistorySnapshot, paymentType: string) => {
  if (paymentType === associationPaymentTypes.registration) {
    return roundCurrencyAmount(decimalToNumber(payment.amountSent) + decimalToNumber(payment.amountVerified))
  }

  return decimalToNumber(payment.amountSent)
}

const createMissingPaymentHistoryLedgerEntries = async ({
  createdBy,
  payment,
  paymentType,
  tx
}: {
  createdBy: string
  payment: PaymentHistorySnapshot | null
  paymentType: string
  tx: Prisma.TransactionClient
}) => {
  if (!payment) {
    return
  }

  await createMissingSubmittedLedgerEntry({
    amountSubmitted: getSubmittedAmountForPaymentHistory(payment, paymentType),
    associationCode: payment.associationCode,
    createdBy,
    paymentType,
    submittedAt: payment.createdAt,
    tx
  })

  await createMissingVerifiedLedgerEntry({
    amountVerified: decimalToNumber(payment.amountVerified),
    associationCode: payment.associationCode,
    createdBy,
    paymentType,
    tx,
    verifiedAt: payment.verifiedAt
  })
}

const getRequiredFormValue = (formData: FormData, fieldName: string) => {
  const value = formData.get(fieldName)

  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`${fieldName} is required`)
  }

  return value.trim()
}

const getStringFormValues = (formData: FormData, fieldName: string) =>
  Array.from(
    new Set(
      formData
        .getAll(fieldName)
        .filter((value): value is string => typeof value === 'string')
        .map(value => value.trim())
        .filter(Boolean)
    )
  )

const isDeceasedMemberDocumentType = (value: string): value is DeceasedMemberDocumentType =>
  deceasedMemberDocumentTypes.includes(value as DeceasedMemberDocumentType)

const isDeceasedMemberDocumentStatus = (value: string): value is DeceasedMemberDocumentStatus =>
  deceasedMemberDocumentStatuses.includes(value as DeceasedMemberDocumentStatus)

const isNameChangeRequestStatus = (value: string): value is NameChangeRequestStatus =>
  nameChangeRequestStatuses.includes(value as NameChangeRequestStatus)

const isMemberTransferRequestStatus = (value: string): value is MemberTransferRequestStatus =>
  memberTransferRequestStatuses.includes(value as MemberTransferRequestStatus)

const getFileExtension = (fileName: string) => {
  const extensionStart = fileName.lastIndexOf('.')

  return extensionStart >= 0 ? fileName.slice(extensionStart).toLowerCase() : ''
}

const isAllowedDeceasedMemberDocumentFile = (file: File) =>
  allowedDeceasedMemberDocumentMimeTypes.has(file.type) ||
  allowedDeceasedMemberDocumentExtensions.has(getFileExtension(file.name))

const getSafeDocumentFileName = (file: File, documentType: DeceasedMemberDocumentType) => {
  const fileName = file.name.trim()

  if (!fileName) return deceasedMemberDocumentLabels[documentType]

  return fileName.slice(0, 180)
}

const getSafeUploadedFileName = (file: File, fallbackFileName: string) => {
  const fileName = file.name.trim()

  if (!fileName) return fallbackFileName

  return fileName.slice(0, 180)
}

const getDeathDocumentCloudinaryFolder = (deceasedMemberId: string, documentType: string) =>
  `mysagi/death-documentations/${getSafeCloudinaryPathSegment(deceasedMemberId)}/${getSafeCloudinaryPathSegment(documentType)}`

const getNameChangeDocumentCloudinaryFolder = (requestId: string) =>
  `mysagi/name-change-documentations/${getSafeCloudinaryPathSegment(requestId)}`

const getIssueNoteDocumentCloudinaryFolder = (noteId: string, messageId: string) =>
  `mysagi/issue-notes/${getSafeCloudinaryPathSegment(noteId)}/${getSafeCloudinaryPathSegment(messageId)}`

const getCloudinaryDocumentData = (document: StoredCloudinaryDocument) => ({
  cloudinaryDeliveryType: document.deliveryType,
  cloudinaryFormat: document.format,
  cloudinaryPublicId: document.publicId,
  cloudinaryResourceType: document.resourceType,
  cloudinarySecureUrl: document.secureUrl,
  fileData: null,
  fileSize: document.bytes
})

const deleteCloudinaryDocumentWithoutBlocking = async (document: {
  cloudinaryDeliveryType?: string | null
  cloudinaryPublicId?: string | null
  cloudinaryResourceType?: string | null
}) => {
  if (!document.cloudinaryPublicId) return

  try {
    await deleteCloudinaryDocument({
      deliveryType: document.cloudinaryDeliveryType,
      publicId: document.cloudinaryPublicId,
      resourceType: document.cloudinaryResourceType
    })
  } catch (error) {
    console.error('Unable to delete replaced Cloudinary document', error)
  }
}

const hasUploadedDocument = (document: { cloudinaryPublicId?: string | null; fileData?: unknown }) =>
  Boolean(document.cloudinaryPublicId || document.fileData)

const getOptionalIssueNoteDocumentFile = (formData: FormData) => {
  const file = formData.get('documentFile')

  if (!(file instanceof File) || file.size <= 0) return null

  if (file.size > maxDocumentationFileSize) {
    throw new Error('The file is too large. Please upload a file that is 20 MB or smaller.')
  }

  if (!isAllowedDeceasedMemberDocumentFile(file)) {
    throw new Error('Please upload a PDF, JPG, PNG, WEBP, HEIC, or HEIF file.')
  }

  return file
}

const uploadIssueNoteDocument = async ({
  file,
  messageId,
  noteId
}: {
  file: File
  messageId: string
  noteId: string
}) => {
  const safeFileName = getSafeUploadedFileName(file, 'Issue note document')
  const mimeType = file.type || 'application/octet-stream'
  const fileBuffer = Buffer.from(await file.arrayBuffer())

  const cloudinaryDocument = await uploadDocumentToCloudinary({
    fileBuffer,
    fileName: safeFileName,
    folder: getIssueNoteDocumentCloudinaryFolder(noteId, messageId),
    mimeType
  })

  return {
    cloudinaryDocument,
    messageData: {
      cloudinaryDeliveryType: cloudinaryDocument.deliveryType,
      cloudinaryFormat: cloudinaryDocument.format,
      cloudinaryPublicId: cloudinaryDocument.publicId,
      cloudinaryResourceType: cloudinaryDocument.resourceType,
      cloudinarySecureUrl: cloudinaryDocument.secureUrl,
      documentFileName: safeFileName,
      documentFileSize: cloudinaryDocument.bytes,
      documentMimeType: mimeType
    }
  }
}

const getUppercaseFormName = (formData: FormData, fieldName: string) => {
  const value = getRequiredFormValue(formData, fieldName).toUpperCase()

  if (value.length < 2) {
    throw new Error(`${fieldName} should be at least 2 characters.`)
  }

  return value
}

const getPositiveDollarAmountFromForm = (formData: FormData, fieldName: string) => {
  const amount = Number(getRequiredFormValue(formData, fieldName))

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error('Enter a payment amount greater than zero.')
  }

  return Number(amount.toFixed(2))
}

const getOptionalPositiveDollarAmountFromForm = (formData: FormData, fieldName: string, label: string) => {
  const value = formData.get(fieldName)

  if (typeof value !== 'string' || value.trim().length === 0) {
    return null
  }

  const amount = Number(value)

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error(`Enter a ${label} greater than zero.`)
  }

  return Number(amount.toFixed(2))
}

const getOptionalPositiveIntegerFromForm = (formData: FormData, fieldName: string, label: string) => {
  const value = formData.get(fieldName)

  if (typeof value !== 'string' || value.trim().length === 0) {
    return null
  }

  const amount = Number(value)

  if (!Number.isInteger(amount) || amount <= 0) {
    throw new Error(`Enter a ${label} greater than zero.`)
  }

  return amount
}

const getSignedDollarAmountFromForm = (formData: FormData, fieldName: string) => {
  const amount = Number(getRequiredFormValue(formData, fieldName))

  if (!Number.isFinite(amount) || amount === 0) {
    throw new Error('Enter a positive or negative adjustment amount.')
  }

  return Number(amount.toFixed(2))
}

const getRequiredDateFromForm = (formData: FormData, fieldName: string) => {
  const value = getRequiredFormValue(formData, fieldName)

  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error(`${fieldName} must be a valid date.`)
  }

  const date = new Date(`${value}T12:00:00.000Z`)

  if (Number.isNaN(date.getTime())) {
    throw new Error(`${fieldName} must be a valid date.`)
  }

  return date
}

const formatRegistrationDate = (date: Date) => registrationDateFormatter.format(date)

const parseUsDateOnlyTimestamp = (value: string, fieldLabel: string) => {
  const match = value.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)

  if (!match) {
    throw new Error(`Enter ${fieldLabel} in MM/DD/YYYY format.`)
  }

  const month = Number(match[1])
  const day = Number(match[2])
  const year = Number(match[3])
  const timestamp = Date.UTC(year, month - 1, day)
  const date = new Date(timestamp)

  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
    throw new Error(`Enter a valid ${fieldLabel}.`)
  }

  return timestamp
}

const getDateOnlyTimestamp = (date: Date) => Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())

const getDeathAnnouncementDateBoundary = (date: Date | string) =>
  date instanceof Date ? getDateOnlyTimestamp(date) : parseUsDateOnlyTimestamp(date, 'registration date')

const assertValidDeathAnnouncementDate = ({
  announcementDate,
  dateOfDeath,
  registrationDate
}: {
  announcementDate: Date
  dateOfDeath: string
  registrationDate: Date | string
}) => {
  const deathDate = parseUsDateOnlyTimestamp(dateOfDeath, 'date of death')
  const registrationDateBoundary = getDeathAnnouncementDateBoundary(registrationDate)
  const announcementDateBoundary = getDateOnlyTimestamp(announcementDate)

  if (deathDate <= registrationDateBoundary) {
    throw new Error('Date of death must be after the registration date.')
  }

  if (deathDate > announcementDateBoundary) {
    throw new Error('Date of death cannot be after the announcement date.')
  }
}

type RegistrationUsageClient = Pick<typeof db, 'associationRegistrationUsage'>

const createRegistrationUsage = async (
  client: RegistrationUsageClient,
  {
    associationCode,
    memberMatriculationNumber
  }: {
    associationCode: string
    memberMatriculationNumber: string
  }
) => {
  await client.associationRegistrationUsage.upsert({
    create: {
      amountUsed: registrationFeePerEligibleMember,
      associationCode,
      memberMatriculationNumber
    },
    update: {
      amountUsed: registrationFeePerEligibleMember,
      associationCode
    },
    where: {
      memberMatriculationNumber
    }
  })
}

const createPendingRegistrationUsage = async ({
  associationCode,
  memberMatriculationNumber
}: {
  associationCode: string
  memberMatriculationNumber: string
}) => {
  await createRegistrationUsage(db, { associationCode, memberMatriculationNumber })
}

const removeRegistrationUsage = async (client: RegistrationUsageClient, memberMatriculationNumber: string) => {
  await client.associationRegistrationUsage.deleteMany({
    where: {
      memberMatriculationNumber
    }
  })
}

const syncPendingRegistrationUsage = async ({
  associationCode,
  memberMatriculationNumber,
  nextStatus,
  previousMatriculationNumber,
  previousStatus
}: {
  associationCode: string
  memberMatriculationNumber: string
  nextStatus: string
  previousMatriculationNumber: string
  previousStatus: string
}) => {
  if (previousStatus === memberStatus.Pending && nextStatus !== memberStatus.Pending) {
    await removeRegistrationUsage(db, previousMatriculationNumber)

    return
  }

  if (nextStatus !== memberStatus.Pending) {
    return
  }

  if (previousStatus === memberStatus.Pending && previousMatriculationNumber !== memberMatriculationNumber) {
    const updatedUsage = await db.associationRegistrationUsage.updateMany({
      data: {
        amountUsed: registrationFeePerEligibleMember,
        associationCode,
        memberMatriculationNumber
      },
      where: {
        memberMatriculationNumber: previousMatriculationNumber
      }
    })

    if (updatedUsage.count > 0) {
      return
    }
  }

  await createPendingRegistrationUsage({ associationCode, memberMatriculationNumber })
}

const createVestedContributionCredit = async ({
  associationCode,
  memberMatriculationNumber
}: {
  associationCode: string
  memberMatriculationNumber: string
}) => {
  await db.associationContributionCredit.upsert({
    create: {
      amountCredited: contributionCreditPerVestedMember,
      associationCode,
      memberMatriculationNumber
    },
    update: {
      amountCredited: contributionCreditPerVestedMember,
      associationCode
    },
    where: {
      memberMatriculationNumber
    }
  })
}

const removeVestedContributionCredit = async (memberMatriculationNumber: string) => {
  await db.associationContributionCredit.deleteMany({
    where: {
      memberMatriculationNumber
    }
  })
}

const updateVestedContributionCredit = async ({
  associationCode,
  memberMatriculationNumber,
  previousMatriculationNumber
}: {
  associationCode: string
  memberMatriculationNumber: string
  previousMatriculationNumber: string
}) => {
  await db.associationContributionCredit.updateMany({
    data: {
      amountCredited: contributionCreditPerVestedMember,
      associationCode,
      memberMatriculationNumber
    },
    where: {
      memberMatriculationNumber: previousMatriculationNumber
    }
  })
}

const syncVestedContributionCredit = async ({
  associationCode,
  memberMatriculationNumber,
  nextStatus,
  previousMatriculationNumber,
  previousStatus
}: {
  associationCode: string
  memberMatriculationNumber: string
  nextStatus: string
  previousMatriculationNumber: string
  previousStatus: string
}) => {
  if (previousStatus !== memberStatus.Vested && nextStatus === memberStatus.Vested) {
    await createVestedContributionCredit({ associationCode, memberMatriculationNumber })

    return
  }

  if (previousStatus === memberStatus.Vested && nextStatus === memberStatus.Vested) {
    await updateVestedContributionCredit({
      associationCode,
      memberMatriculationNumber,
      previousMatriculationNumber
    })

    return
  }

  if (previousStatus === memberStatus.Vested && nextStatus !== memberStatus.Vested) {
    await removeVestedContributionCredit(previousMatriculationNumber)
  }
}

const getManualVestedAtUpdateData = ({
  nextStatus,
  previousStatus
}: {
  nextStatus: string
  previousStatus: string
}) => {
  if (previousStatus !== memberStatus.Vested && nextStatus === memberStatus.Vested) {
    return { vestedAt: new Date() }
  }

  if (previousStatus === memberStatus.Vested && nextStatus !== memberStatus.Vested) {
    return { vestedAt: null }
  }

  return {}
}

const addDeceasedMemberContributionUsage = async (associationCode: string) => {
  await db.associationContributionUsage.upsert({
    create: {
      amountUsed: contributionCreditPerVestedMember,
      associationCode
    },
    update: {
      amountUsed: {
        increment: contributionCreditPerVestedMember
      }
    },
    where: {
      associationCode
    }
  })
}

const assertAdminUser = async () => {
  const { userId } = await auth()

  if (!userId) {
    throw new Error('You must be logged in to access this route')
  }

  if (userId !== process.env.ADMIN_USER_ID) {
    throw new Error('Admin privileges are required for this action')
  }

  return { id: userId }
}

const getCurrentAssociationCode = async (clerkId: string) => {
  const profile = await db.profile.findUnique({
    where: {
      clerkId
    },
    select: {
      associationCode: true
    }
  })

  if (!profile) {
    throw new Error('Association profile not found.')
  }

  return profile.associationCode
}

export const fetchAssociationDashboardActivityLogsAction = async () => {
  const user = await getAuthUser()
  const associationCode = await getCurrentAssociationCode(user.id)

  return fetchDashboardActivityLogs({
    associationCode
  })
}

export const fetchAdminDashboardActivityLogsAction = async () => {
  await assertAdminUser()

  return fetchDashboardActivityLogs({})
}

const revalidatePaymentViews = () => {
  revalidatePath('/')
  revalidatePath('/admin-contribution-payments')
  revalidatePath('/admin-activity-log')
  revalidatePath('/admin-payment-history')
  revalidatePath('/admin-payment-update')
  revalidatePath('/admin-registration-payments')
  revalidatePath('/admin-transaction-history')
  revalidatePath('/admin-all-members')
  revalidatePath('/additions')
  revalidatePath('/contribution-table')
  revalidatePath('/contributions')
  revalidatePath('/payment-history')
  revalidatePath('/registrationsPayments')
  revalidatePath('/all-members')
  revalidatePath('/financial-position')
  revalidatePath('/admin-count')
  revalidateDashboardActivityLogs()
}

const resettableTransactionHistoryEventTypes = [
  associationPaymentLedgerEventTypes.manualAdjustment,
  associationPaymentLedgerEventTypes.notFound,
  associationPaymentLedgerEventTypes.reset,
  associationPaymentLedgerEventTypes.submitted,
  associationPaymentLedgerEventTypes.verified
]

const cancellableTransactionHistoryEventTypes: string[] = [
  associationPaymentLedgerEventTypes.manualAdjustment,
  associationPaymentLedgerEventTypes.submitted,
  associationPaymentLedgerEventTypes.verified
]

export const resetTransactionHistoryAction = async (): Promise<{ message: string }> => {
  const user = await assertAdminUser()

  try {
    const deletedHistory = await db.associationPaymentLedgerEntry.deleteMany({
      where: {
        eventType: {
          in: resettableTransactionHistoryEventTypes
        }
      }
    })

    await recordDashboardActivity({
      action: 'transaction_history_reset',
      actorClerkId: user.id,
      dashboardScope: dashboardActivityScopes.admin,
      entityType: 'transaction_history',
      summary:
        deletedHistory.count === 0
          ? 'Reset transaction history with no matching records found.'
          : `Reset ${deletedHistory.count} transaction history record${deletedHistory.count === 1 ? '' : 's'}.`
    })

    revalidatePaymentViews()

    return {
      message:
        deletedHistory.count === 0
          ? 'No transaction history records were found to reset.'
          : `${deletedHistory.count} transaction history record${deletedHistory.count === 1 ? '' : 's'} reset successfully.`
    }
  } catch (error) {
    return renderError(error)
  }
}

const getOptionalTransactionCancellationReason = (formData: FormData) => {
  const reason = formData.get('cancellationReason')

  if (typeof reason !== 'string') return null

  const normalizedReason = reason.trim()

  return normalizedReason.length > 0 ? normalizedReason : null
}

const getLatestActiveLedgerEntryDate = async ({
  associationCode,
  eventType,
  paymentType,
  tx
}: {
  associationCode: string
  eventType: string
  paymentType: string
  tx: Prisma.TransactionClient
}) => {
  const latestEntry = await tx.associationPaymentLedgerEntry.findFirst({
    orderBy: {
      createdAt: 'desc'
    },
    select: {
      createdAt: true
    },
    where: {
      associationCode,
      cancelledAt: null,
      eventType,
      paymentType
    }
  })

  return latestEntry?.createdAt ?? null
}

const assertPositiveTransactionAmount = (amount: number) => {
  if (amount <= 0) {
    throw new Error('Only positive submitted and verified payment entries can be cancelled.')
  }
}

const assertNonZeroTransactionAmount = (amount: number) => {
  if (amount === 0) {
    throw new Error('This transaction entry has no amount to cancel.')
  }
}

const assertTransactionEntryIsInCurrentPaymentCycle = async ({
  associationCode,
  createdAt,
  paymentType,
  tx
}: {
  associationCode: string
  createdAt: Date
  paymentType: string
  tx: Prisma.TransactionClient
}) => {
  const laterReset = await tx.associationPaymentLedgerEntry.findFirst({
    select: {
      id: true
    },
    where: {
      associationCode,
      cancelledAt: null,
      createdAt: {
        gt: createdAt
      },
      eventType: associationPaymentLedgerEventTypes.reset,
      paymentType
    }
  })

  if (laterReset) {
    throw new Error('This entry belongs to a previous payment cycle and cannot be cancelled after a reset.')
  }
}

const cancelSubmittedTransactionEntry = async ({
  amount,
  associationCode,
  paymentType,
  tx
}: {
  amount: number
  associationCode: string
  paymentType: string
  tx: Prisma.TransactionClient
}) => {
  assertPositiveTransactionAmount(amount)

  const latestSubmittedAt = await getLatestActiveLedgerEntryDate({
    associationCode,
    eventType: associationPaymentLedgerEventTypes.submitted,
    paymentType,
    tx
  })

  if (paymentType === associationPaymentTypes.contribution) {
    const payment = await tx.associationContributionPayment.findUnique({
      where: {
        associationCode
      }
    })

    if (!payment) {
      throw new Error('No contribution payment record found for this transaction.')
    }

    const currentAmountSent = decimalToNumber(payment.amountSent)
    const currentAmountVerified = decimalToNumber(payment.amountVerified)
    const nextAmountSent = roundCurrencyAmount(currentAmountSent - amount)

    if (nextAmountSent < 0) {
      throw new Error('This submitted contribution amount is no longer available to cancel.')
    }

    if (nextAmountSent < currentAmountVerified) {
      throw new Error('Cancel the verified contribution entry before cancelling this submitted contribution entry.')
    }

    await tx.associationContributionPayment.update({
      data: {
        amountSent: nextAmountSent,
        lastSubmittedAt: latestSubmittedAt
      },
      where: {
        associationCode
      }
    })

    return
  }

  if (paymentType === associationPaymentTypes.registration) {
    const payment = await tx.associationRegistrationPayment.findUnique({
      where: {
        associationCode
      }
    })

    if (!payment) {
      throw new Error('No registration payment record found for this transaction.')
    }

    const currentAmountSent = decimalToNumber(payment.amountSent)
    const nextAmountSent = roundCurrencyAmount(currentAmountSent - amount)

    if (nextAmountSent < 0) {
      throw new Error('This submitted registration amount has already been verified or cleared.')
    }

    await tx.associationRegistrationPayment.update({
      data: {
        amountSent: nextAmountSent,
        lastSubmittedAt: latestSubmittedAt
      },
      where: {
        associationCode
      }
    })

    return
  }

  throw new Error('Unsupported payment type for submitted transaction cancellation.')
}

const cancelVerifiedTransactionEntry = async ({
  amount,
  associationCode,
  paymentType,
  tx
}: {
  amount: number
  associationCode: string
  paymentType: string
  tx: Prisma.TransactionClient
}) => {
  assertPositiveTransactionAmount(amount)

  const latestVerifiedAt = await getLatestActiveLedgerEntryDate({
    associationCode,
    eventType: associationPaymentLedgerEventTypes.verified,
    paymentType,
    tx
  })

  if (paymentType === associationPaymentTypes.contribution) {
    const payment = await tx.associationContributionPayment.findUnique({
      where: {
        associationCode
      }
    })

    if (!payment) {
      throw new Error('No contribution payment record found for this transaction.')
    }

    const nextAmountVerified = roundCurrencyAmount(decimalToNumber(payment.amountVerified) - amount)

    if (nextAmountVerified < 0) {
      throw new Error('This verified contribution amount is no longer available to cancel.')
    }

    await tx.associationContributionPayment.update({
      data: {
        amountVerified: nextAmountVerified,
        verifiedAt: latestVerifiedAt
      },
      where: {
        associationCode
      }
    })

    return
  }

  if (paymentType === associationPaymentTypes.registration) {
    const payment = await tx.associationRegistrationPayment.findUnique({
      where: {
        associationCode
      }
    })

    if (!payment) {
      throw new Error('No registration payment record found for this transaction.')
    }

    const nextAmountVerified = roundCurrencyAmount(decimalToNumber(payment.amountVerified) - amount)

    if (nextAmountVerified < 0) {
      throw new Error('This verified registration amount is no longer available to cancel.')
    }

    const latestSubmittedAt =
      (await getLatestActiveLedgerEntryDate({
        associationCode,
        eventType: associationPaymentLedgerEventTypes.submitted,
        paymentType,
        tx
      })) ?? payment.lastSubmittedAt

    await tx.associationRegistrationPayment.update({
      data: {
        amountSent: {
          increment: amount
        },
        amountVerified: nextAmountVerified,
        lastSubmittedAt: latestSubmittedAt,
        verifiedAt: latestVerifiedAt
      },
      where: {
        associationCode
      }
    })

    return
  }

  throw new Error('Unsupported payment type for verified transaction cancellation.')
}

const cancelManualAdjustmentTransactionEntry = async ({
  amount,
  associationCode,
  paymentType,
  tx
}: {
  amount: number
  associationCode: string
  paymentType: string
  tx: Prisma.TransactionClient
}) => {
  assertNonZeroTransactionAmount(amount)

  await tx.associationBalanceAdjustment.upsert({
    create: {
      amount: roundCurrencyAmount(-amount),
      associationCode,
      balanceType: paymentType
    },
    update: {
      amount: {
        decrement: amount
      }
    },
    where: {
      associationCode_balanceType: {
        associationCode,
        balanceType: paymentType
      }
    }
  })
}

export const cancelTransactionHistoryEntryAction = async (
  _prevState: { message: string },
  formData: FormData
): Promise<{ message: string }> => {
  const user = await assertAdminUser()

  try {
    const entryId = getRequiredFormValue(formData, 'transactionEntryId')
    const cancellationReason = getOptionalTransactionCancellationReason(formData)

    const entry = await db.associationPaymentLedgerEntry.findUnique({
      where: {
        id: entryId
      }
    })

    if (!entry) {
      throw new Error('Transaction history entry not found.')
    }

    if (entry.cancelledAt) {
      throw new Error('This transaction history entry has already been cancelled.')
    }

    if (!cancellableTransactionHistoryEventTypes.includes(entry.eventType)) {
      throw new Error('Only submitted, verified, and adjusted transaction entries can be cancelled.')
    }

    const amount = decimalToNumber(entry.amount)
    const cancelledAt = new Date()

    await db.$transaction(async tx => {
      await assertTransactionEntryIsInCurrentPaymentCycle({
        associationCode: entry.associationCode,
        createdAt: entry.createdAt,
        paymentType: entry.paymentType,
        tx
      })

      const cancelledEntry = await tx.associationPaymentLedgerEntry.updateMany({
        data: {
          cancelledAt,
          cancelledBy: user.id,
          cancellationReason
        },
        where: {
          cancelledAt: null,
          id: entry.id
        }
      })

      if (cancelledEntry.count !== 1) {
        throw new Error('This transaction history entry has already been cancelled.')
      }

      if (entry.eventType === associationPaymentLedgerEventTypes.submitted) {
        await cancelSubmittedTransactionEntry({
          amount,
          associationCode: entry.associationCode,
          paymentType: entry.paymentType,
          tx
        })
      }

      if (entry.eventType === associationPaymentLedgerEventTypes.verified) {
        await cancelVerifiedTransactionEntry({
          amount,
          associationCode: entry.associationCode,
          paymentType: entry.paymentType,
          tx
        })
      }

      if (entry.eventType === associationPaymentLedgerEventTypes.manualAdjustment) {
        await cancelManualAdjustmentTransactionEntry({
          amount,
          associationCode: entry.associationCode,
          paymentType: entry.paymentType,
          tx
        })
      }

      await recordDashboardActivity({
        action: 'transaction_history_cancelled',
        actorClerkId: user.id,
        associationCode: entry.associationCode,
        dashboardScope: dashboardActivityScopes.admin,
        entityId: entry.id,
        entityType: 'transaction_history',
        summary: `Cancelled ${entry.paymentType} ${entry.eventType} transaction for ${entry.associationCode}: ${currencyFormatter.format(amount)}.${
          cancellationReason ? ` Reason: ${cancellationReason}` : ''
        }`,
        tx
      })
    })

    revalidatePaymentViews()

    return { message: 'Transaction history entry cancelled.' }
  } catch (error) {
    return renderError(error)
  }
}

const revalidateDeathDocumentationViews = () => {
  revalidatePath('/admin-all-deceased')
  revalidatePath('/admin-death-documentations')
  revalidatePath('/death-documentations')
  revalidatePath('/deceased-members')
  revalidateDashboardActivityLogs()
}

const sendDeathAnnouncementAcknowledgmentToDelegate = async (associationCode: string) => {
  const normalizedAssociationCode = associationCode.trim().toUpperCase()

  try {
    const delegateProfile = await db.profile.findUnique({
      select: {
        associationCode: true,
        firstDelegateEmail: true,
        secondDelegateEmail: true
      },
      where: {
        associationCode: normalizedAssociationCode
      }
    })

    if (!delegateProfile) {
      console.error('Unable to send death announcement acknowledgment email: delegate profile not found', {
        associationCode: normalizedAssociationCode
      })

      return
    }

    const delegateEmails = Array.from(
      new Set([delegateProfile.firstDelegateEmail, delegateProfile.secondDelegateEmail].map(email => email.trim()))
    ).filter(Boolean)

    if (delegateEmails.length === 0) {
      console.error('Unable to send death announcement acknowledgment email: delegate emails not found', {
        associationCode: normalizedAssociationCode
      })

      return
    }

    await sendDeathAnnouncementAcknowledgmentEmail({
      associationCode: delegateProfile.associationCode,
      delegateEmails
    })
  } catch (emailError) {
    console.error('Unable to send death announcement acknowledgment email', emailError)
  }
}

const revalidateNameChangeDocumentationViews = () => {
  revalidatePath('/admin-all-members')
  revalidatePath('/admin-name-changes')
  revalidatePath('/all-members')
  revalidatePath('/name-modification')
  revalidateDashboardActivityLogs()
}

const revalidateMemberTransferViews = () => {
  revalidatePath('/admin-member-transfers')
  revalidatePath('/member-transfer')
  revalidateDashboardActivityLogs()
}

const issueNoteSubjectMaxLength = 140
const issueNoteBodyMaxLength = 4000

const revalidateIssueNoteViews = () => {
  revalidatePath('/notes')
  revalidatePath('/admin-notes')
  revalidateDashboardActivityLogs()
}

const getIssueNoteTextField = (formData: FormData, fieldName: string, maxLength: number) => {
  const value = getRequiredFormValue(formData, fieldName)

  if (value.length > maxLength) {
    throw new Error(`${fieldName} must be ${maxLength} characters or fewer`)
  }

  return value
}

const getIssueNotePriority = (formData: FormData): DelegateIssueNotePriority => {
  const priority = String(formData.get('priority') ?? 'normal')
    .trim()
    .toLowerCase()

  return delegateIssueNotePriorities.includes(priority as DelegateIssueNotePriority)
    ? (priority as DelegateIssueNotePriority)
    : 'normal'
}

const getIssueNoteActor = async (): Promise<{
  id: string
  role: DelegateIssueNoteRole
  profile: { associationCode: string; associationName: string } | null
}> => {
  const { userId } = await auth()

  if (!userId) {
    throw new Error('You must be logged in to access this route')
  }

  if (userId === process.env.ADMIN_USER_ID) {
    return {
      id: userId,
      profile: null,
      role: 'admin'
    }
  }

  const profile = await db.profile.findUnique({
    select: {
      associationCode: true,
      associationName: true,
      internalRulesAcceptedAt: true
    },
    where: {
      clerkId: userId
    }
  })

  if (!profile) redirect('/profile/create')
  if (!profile.internalRulesAcceptedAt) redirect('/internal-rules')

  return {
    id: userId,
    profile: {
      associationCode: profile.associationCode,
      associationName: profile.associationName
    },
    role: 'delegate'
  }
}

const assertIssueNoteAccess = async (noteId: string, actor: Awaited<ReturnType<typeof getIssueNoteActor>>) => {
  const note = await db.delegateIssueNote.findUnique({
    select: {
      associationCode: true,
      id: true,
      status: true,
      subject: true
    },
    where: {
      id: noteId
    }
  })

  if (!note) {
    throw new Error('Message not found.')
  }

  if (actor.role === 'delegate' && note.associationCode !== actor.profile?.associationCode) {
    throw new Error('You can only access messages for your association.')
  }

  return note
}

export const fetchDelegateIssueNotesPageAction = async () => {
  const user = await getAuthUser()

  const profile = await db.profile.findUnique({
    select: {
      associationCode: true,
      associationName: true
    },
    where: {
      clerkId: user.id
    }
  })

  if (!profile) redirect('/profile/create')

  const notes = await db.delegateIssueNote.findMany({
    include: {
      messages: {
        orderBy: {
          createdAt: 'asc'
        }
      }
    },
    orderBy: [{ status: 'asc' }, { lastMessageAt: 'desc' }],
    where: {
      associationCode: profile.associationCode
    }
  })

  return { association: profile, currentUserId: user.id, notes }
}

export const fetchAdminIssueNotesPageAction = async () => {
  const user = await assertAdminUser()

  const [associations, notes] = await Promise.all([
    db.profile.findMany({
      orderBy: [{ associationCode: 'asc' }],
      select: {
        associationCode: true,
        associationName: true
      }
    }),
    db.delegateIssueNote.findMany({
      include: {
        messages: {
          orderBy: {
            createdAt: 'asc'
          }
        }
      },
      orderBy: [{ status: 'asc' }, { lastMessageAt: 'desc' }]
    })
  ])

  return { associations, currentUserId: user.id, notes }
}

export const createDelegateIssueNoteAction = async (
  prevState: any,
  formData: FormData
): Promise<{ message: string }> => {
  const actor = await getIssueNoteActor()

  try {
    if (actor.role !== 'delegate' || !actor.profile) {
      throw new Error('Use the Admin Messages page to contact a delegate.')
    }

    const now = new Date()
    const subject = getIssueNoteTextField(formData, 'subject', issueNoteSubjectMaxLength)
    const body = getIssueNoteTextField(formData, 'body', issueNoteBodyMaxLength)
    const priority = getIssueNotePriority(formData)
    const documentFile = getOptionalIssueNoteDocumentFile(formData)
    const noteId = randomUUID()
    const messageId = randomUUID()

    const uploadedDocument = documentFile
      ? await uploadIssueNoteDocument({
          file: documentFile,
          messageId,
          noteId
        })
      : null

    try {
      await db.delegateIssueNote.create({
        data: {
          adminUnread: true,
          associationCode: actor.profile.associationCode,
          associationName: actor.profile.associationName,
          createdByClerkId: actor.id,
          createdByRole: actor.role,
          delegateLastReadAt: now,
          delegateUnread: false,
          id: noteId,
          lastMessageAt: now,
          lastMessageByRole: actor.role,
          messages: {
            create: {
              authorClerkId: actor.id,
              authorRole: actor.role,
              body,
              id: messageId,
              ...(uploadedDocument?.messageData ?? {})
            }
          },
          priority,
          status: 'open',
          subject
        }
      })
    } catch (error) {
      if (uploadedDocument) {
        await deleteCloudinaryDocumentWithoutBlocking({
          cloudinaryDeliveryType: uploadedDocument.cloudinaryDocument.deliveryType,
          cloudinaryPublicId: uploadedDocument.cloudinaryDocument.publicId,
          cloudinaryResourceType: uploadedDocument.cloudinaryDocument.resourceType
        })
      }

      throw error
    }

    await recordDashboardActivity({
      action: 'message_created',
      actorClerkId: actor.id,
      associationCode: actor.profile.associationCode,
      dashboardScope: dashboardActivityScopes.association,
      entityId: noteId,
      entityType: 'message',
      summary: `Sent message to admin: ${subject}.`
    })

    revalidateIssueNoteViews()

    return { message: 'Message sent to the admin team.' }
  } catch (error) {
    return renderError(error)
  }
}

export const createAdminIssueNoteAction = async (prevState: any, formData: FormData): Promise<{ message: string }> => {
  const user = await assertAdminUser()

  try {
    const now = new Date()
    const associationCode = getRequiredFormValue(formData, 'associationCode').toUpperCase()
    const subject = getIssueNoteTextField(formData, 'subject', issueNoteSubjectMaxLength)
    const body = getIssueNoteTextField(formData, 'body', issueNoteBodyMaxLength)
    const priority = getIssueNotePriority(formData)
    const documentFile = getOptionalIssueNoteDocumentFile(formData)

    const profile = await db.profile.findUnique({
      select: {
        associationCode: true,
        associationName: true
      },
      where: {
        associationCode
      }
    })

    if (!profile) {
      throw new Error('Select a valid delegate association.')
    }

    const noteId = randomUUID()
    const messageId = randomUUID()

    const uploadedDocument = documentFile
      ? await uploadIssueNoteDocument({
          file: documentFile,
          messageId,
          noteId
        })
      : null

    try {
      await db.delegateIssueNote.create({
        data: {
          adminLastReadAt: now,
          adminUnread: false,
          associationCode: profile.associationCode,
          associationName: profile.associationName,
          createdByClerkId: user.id,
          createdByRole: 'admin',
          delegateUnread: true,
          id: noteId,
          lastMessageAt: now,
          lastMessageByRole: 'admin',
          messages: {
            create: {
              authorClerkId: user.id,
              authorRole: 'admin',
              body,
              id: messageId,
              ...(uploadedDocument?.messageData ?? {})
            }
          },
          priority,
          status: 'open',
          subject
        }
      })
    } catch (error) {
      if (uploadedDocument) {
        await deleteCloudinaryDocumentWithoutBlocking({
          cloudinaryDeliveryType: uploadedDocument.cloudinaryDocument.deliveryType,
          cloudinaryPublicId: uploadedDocument.cloudinaryDocument.publicId,
          cloudinaryResourceType: uploadedDocument.cloudinaryDocument.resourceType
        })
      }

      throw error
    }

    await recordDashboardActivity({
      action: 'message_created',
      actorClerkId: user.id,
      associationCode: profile.associationCode,
      dashboardScope: dashboardActivityScopes.admin,
      entityId: noteId,
      entityType: 'message',
      summary: `Sent message to ${profile.associationCode}: ${subject}.`
    })

    revalidateIssueNoteViews()

    return { message: 'Message sent to the delegate.' }
  } catch (error) {
    return renderError(error)
  }
}

export const replyToIssueNoteAction = async (prevState: any, formData: FormData): Promise<{ message: string }> => {
  const actor = await getIssueNoteActor()

  try {
    const noteId = getRequiredFormValue(formData, 'noteId')
    const body = getIssueNoteTextField(formData, 'body', issueNoteBodyMaxLength)
    const note = await assertIssueNoteAccess(noteId, actor)
    const documentFile = getOptionalIssueNoteDocumentFile(formData)

    if (note.status !== 'open') {
      throw new Error('Resolved messages cannot receive replies.')
    }

    const now = new Date()
    const isAdminReply = actor.role === 'admin'
    const messageId = randomUUID()

    const uploadedDocument = documentFile
      ? await uploadIssueNoteDocument({
          file: documentFile,
          messageId,
          noteId: note.id
        })
      : null

    try {
      await db.$transaction([
        db.delegateIssueNoteMessage.create({
          data: {
            authorClerkId: actor.id,
            authorRole: actor.role,
            body,
            id: messageId,
            noteId: note.id,
            ...(uploadedDocument?.messageData ?? {})
          }
        }),
        db.delegateIssueNote.update({
          data: {
            adminLastReadAt: isAdminReply ? now : undefined,
            adminUnread: !isAdminReply,
            delegateLastReadAt: isAdminReply ? undefined : now,
            delegateUnread: isAdminReply,
            lastMessageAt: now,
            lastMessageByRole: actor.role
          },
          where: {
            id: note.id
          }
        })
      ])
    } catch (error) {
      if (uploadedDocument) {
        await deleteCloudinaryDocumentWithoutBlocking({
          cloudinaryDeliveryType: uploadedDocument.cloudinaryDocument.deliveryType,
          cloudinaryPublicId: uploadedDocument.cloudinaryDocument.publicId,
          cloudinaryResourceType: uploadedDocument.cloudinaryDocument.resourceType
        })
      }

      throw error
    }

    await recordDashboardActivity({
      action: 'message_replied',
      actorClerkId: actor.id,
      associationCode: note.associationCode,
      dashboardScope: isAdminReply ? dashboardActivityScopes.admin : dashboardActivityScopes.association,
      entityId: note.id,
      entityType: 'message',
      summary: `Replied to message: ${note.subject}.`
    })

    revalidateIssueNoteViews()

    return { message: 'Reply added.' }
  } catch (error) {
    return renderError(error)
  }
}

export const markIssueNoteReadAction = async (prevState: any, formData: FormData): Promise<{ message: string }> => {
  const actor = await getIssueNoteActor()

  try {
    const noteId = getRequiredFormValue(formData, 'noteId')
    const note = await assertIssueNoteAccess(noteId, actor)
    const now = new Date()

    await db.delegateIssueNote.update({
      data:
        actor.role === 'admin'
          ? {
              adminLastReadAt: now,
              adminUnread: false
            }
          : {
              delegateLastReadAt: now,
              delegateUnread: false
            },
      where: {
        id: note.id
      }
    })

    revalidateIssueNoteViews()

    return { message: 'Message marked as read.' }
  } catch (error) {
    return renderError(error)
  }
}

export const resolveIssueNoteAction = async (prevState: any, formData: FormData): Promise<{ message: string }> => {
  const user = await assertAdminUser()

  try {
    const noteId = getRequiredFormValue(formData, 'noteId')

    const note = await db.delegateIssueNote.findUnique({
      select: {
        associationCode: true,
        id: true,
        status: true,
        subject: true
      },
      where: {
        id: noteId
      }
    })

    if (!note) {
      throw new Error('Message not found.')
    }

    if (note.status === 'resolved') {
      return { message: 'This message is already resolved.' }
    }

    await db.delegateIssueNote.update({
      data: {
        adminUnread: false,
        delegateUnread: false,
        resolvedAt: new Date(),
        resolvedByClerkId: user.id,
        status: 'resolved'
      },
      where: {
        id: note.id
      }
    })

    await recordDashboardActivity({
      action: 'message_resolved',
      actorClerkId: user.id,
      associationCode: note.associationCode,
      dashboardScope: dashboardActivityScopes.admin,
      entityId: note.id,
      entityType: 'message',
      summary: `Resolved message: ${note.subject}.`
    })

    revalidateIssueNoteViews()

    return { message: 'Message resolved.' }
  } catch (error) {
    return renderError(error)
  }
}

const assertMemberCanBeWithdrawn = async (memberId: string) => {
  const member = await db.member.findUnique({
    where: {
      id: memberId
    },
    select: {
      memberStatus: true
    }
  })

  const currentDay = new Date().getDate()
  const isWithdrawalBlocked = member?.memberStatus === memberStatus.Vested && currentDay >= 6 && currentDay <= 24

  if (isWithdrawalBlocked) {
    throw new Error(
      'SAGI prevents withdrawal of vested members between the 6th and the 24th of each month. Resume withdrawal on or after the 25th, and before the 6th.'
    )
  }
}

const isWithinMemberRemovalRestoreWindow = (createdAt: Date) =>
  Date.now() - createdAt.getTime() <= MEMBER_REMOVAL_RESTORE_WINDOW_MS

export async function createProfileAction(prevState: any, formData: FormData) {
  return createProfileActionBase(prevState, formData)
}

export async function fetchProfile(options?: Parameters<typeof fetchProfileBase>[0]) {
  return fetchProfileBase(options)
}

export async function updateProfileAction(prevState: any, formData: FormData): Promise<{ message: string }> {
  return updateProfileActionBase(prevState, formData)
}

export const createMemberAction = async (provState: any, formData: FormData): Promise<{ message: string }> => {
  const user = await getAuthUser()

  try {
    const rawData = Object.fromEntries(formData)
    const validatedFields = validateWithZodSchema(createMemberSchema, rawData)
    const memberMatriculationNumber = `AS${validatedFields.associationCode}${randomMatriculation()}`

    const delegateProfile = await db.profile.findUnique({
      select: {
        firstDelegateEmail: true
      },
      where: {
        clerkId: user.id
      }
    })

    if (!delegateProfile) {
      throw new Error('Delegate profile was not found.')
    }

    const member = await db.$transaction(async tx => {
      const createdMember = await tx.member.create({
        data: {
          ...validatedFields,
          clerkId: user.id,
          memberMatriculationNumber
        }
      })

      if (validatedFields.memberStatus === memberStatus.Pending) {
        await createRegistrationUsage(tx, {
          associationCode: validatedFields.associationCode,
          memberMatriculationNumber
        })
      }

      return createdMember
    })

    await recordDashboardActivity({
      action: 'member_created',
      actorClerkId: user.id,
      associationCode: member.associationCode,
      dashboardScope: dashboardActivityScopes.association,
      entityId: member.id,
      entityType: 'member',
      summary: `Added ${getMemberActivityLabel(member)} with ${member.memberStatus} status.`
    })

    revalidatePaymentViews()

    after(async () => {
      try {
        await sendMemberAdditionAcknowledgmentEmail({
          associationCode: validatedFields.associationCode,
          associationName: validatedFields.associationName,
          delegateEmail: delegateProfile.firstDelegateEmail,
          memberAddedAt: member.createdAt,
          memberName: `${member.firstName} ${member.lastAndMiddleNames}`.trim(),
          registrationFeeAmount: registrationFeePerEligibleMember
        })
      } catch (emailError) {
        console.error('Unable to send member addition acknowledgment email', emailError)
      }
    })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return {
          message:
            'A member with the same first, middle, and last names, date of birth and recommendation already exists, please check your  entries or contact admin for assistance.'
        }
      }
    }

    return renderError(error)
  }

  redirect('/all-members')
}

export const fetchMembers = async (clerkId?: string) => {
  const userId = clerkId ?? (await getAuthUser()).id

  const members = await db.member.findMany({
    where: {
      clerkId: userId

      // memberStatus: 'vested'
    },
    orderBy: { createdAt: 'desc' }
  })

  return members
}

export const fetchMembersForAdmin = async () => {
  await assertAdminUser()

  const members = await db.member.findMany({
    // where: {},
    orderBy: { createdAt: 'desc' }
  })

  return members
}

export const fetchMemberStatusCountsByAssociationCode = async () => {
  await assertAdminUser()
  noStore()

  const [counts, profiles, memberAssociationNames] = await Promise.all([
    db.member.groupBy({
      by: ['associationCode', 'memberStatus'],
      where: {
        memberStatus: {
          in: Object.values(memberStatus)
        }
      },
      _count: {
        _all: true
      },
      orderBy: {
        associationCode: 'asc'
      }
    }),
    db.profile.findMany({
      orderBy: [{ associationName: 'asc' }, { associationCode: 'asc' }],
      select: {
        associationCode: true,
        associationName: true
      }
    }),
    db.member.findMany({
      select: {
        associationCode: true,
        associationName: true
      },
      orderBy: {
        associationName: 'asc'
      }
    })
  ])

  const associationNamesByCode = new Map(profiles.map(profile => [profile.associationCode, profile.associationName]))

  for (const member of memberAssociationNames) {
    if (!associationNamesByCode.has(member.associationCode)) {
      associationNamesByCode.set(member.associationCode, member.associationName)
    }
  }

  const associationCodes = Array.from(
    new Set([...profiles.map(profile => profile.associationCode), ...counts.map(item => item.associationCode)])
  ).sort((firstCode, secondCode) => firstCode.localeCompare(secondCode, undefined, { sensitivity: 'base' }))

  type AssociationStatusCounts = {
    associationCode: string
    associationName: string
    vested: number
    pending: number
    awaitingPublication: number
    notInGoodStanding: number
    total: number
  }

  const countsByAssociationCode = Object.fromEntries(
    associationCodes.map(associationCode => [
      associationCode,
      {
        associationCode,
        associationName: associationNamesByCode.get(associationCode) ?? associationCode,
        vested: 0,
        pending: 0,
        awaitingPublication: 0,
        notInGoodStanding: 0,
        total: 0
      }
    ])
  ) as Record<string, AssociationStatusCounts>

  for (const item of counts) {
    const associationCode = item.associationCode
    const associationCounts = countsByAssociationCode[associationCode]

    const count = item._count._all

    if (item.memberStatus === memberStatus.Vested) associationCounts.vested += count
    if (item.memberStatus === memberStatus.Pending) associationCounts.pending += count
    if (item.memberStatus === memberStatus.Awaiting) associationCounts.awaitingPublication += count
    if (item.memberStatus === memberStatus.Delinquent) associationCounts.notInGoodStanding += count

    associationCounts.total += count
  }

  return Object.values(countsByAssociationCode)
}

export const fetchAdminDelegateDashboardPreviewAction = async (associationCodeInput: string) => {
  noStore()
  await assertAdminUser()

  const associationCode = associationCodeInput.trim().toUpperCase()

  if (!associationCode) return null

  const [profile, members, currentContribution, currentRegistrationPayment] = await Promise.all([
    db.profile.findUnique({
      select: {
        associationCode: true,
        associationName: true,
        firstDelegateEmail: true,
        firstDelegateFullName: true,
        firstDelegatePhoneNumber: true,
        secondDelegateEmail: true,
        secondDelegateFullName: true,
        secondDelegatePhoneNumber: true,
        thirdDelegateEmail: true,
        thirdDelegateFullName: true,
        thirdDelegatePhoneNumber: true
      },
      where: {
        associationCode
      }
    }),
    db.member.findMany({
      orderBy: { createdAt: 'desc' },
      where: {
        associationCode
      }
    }),
    fetchAssociationContributionSummary(associationCode, { noStore: true }),
    fetchAssociationRegistrationSummary(associationCode, { noStore: true })
  ])

  if (!profile && members.length === 0) return null

  const fallbackAssociationName =
    members.find(member => member.associationName.trim())?.associationName.trim() || associationCode

  return {
    currentContribution,
    currentRegistrationPayment,
    delegate: profile ?? {
      associationCode,
      associationName: fallbackAssociationName,
      firstDelegateEmail: '',
      firstDelegateFullName: '',
      firstDelegatePhoneNumber: '',
      secondDelegateEmail: '',
      secondDelegateFullName: '',
      secondDelegatePhoneNumber: '',
      thirdDelegateEmail: '',
      thirdDelegateFullName: '',
      thirdDelegatePhoneNumber: ''
    },
    members
  }
}

const fetchContributionCalculationSummary = async () => {
  const [summary, adminFee, vestedMembersCount] = await Promise.all([
    db.contributionCalculationDeath.aggregate({
      _count: {
        _all: true
      },
      _sum: {
        amountToContribute: true
      }
    }),
    db.contributionCalculationAdminFee.findUnique({
      where: {
        id: 'current'
      }
    }),
    db.member.count({
      where: {
        memberStatus: memberStatus.Vested
      }
    })
  ])

  const deathAmount = roundCurrencyAmount(decimalToNumber(summary._sum.amountToContribute))
  const adminFeeAmount = roundCurrencyAmount(decimalToNumber(adminFee?.amount))
  const adminFeeTotal = roundCurrencyAmount(adminFeeAmount * vestedMembersCount)

  return {
    adminFee: adminFeeAmount,
    adminFeeTotal,
    deathAmount,
    deathCount: summary._count._all,
    totalAmount: roundCurrencyAmount(deathAmount + adminFeeTotal),
    vestedMembersCount
  }
}

export const fetchContributionCalculationSummaryAction = async () => {
  await assertAdminUser()

  return fetchContributionCalculationSummary()
}

const fetchContributionCalculationDeaths = async () => {
  const calculationDeaths = await db.contributionCalculationDeath.findMany({
    include: {
      deceasedMember: {
        select: {
          associationCode: true,
          associationName: true,
          dateOfDeath: true,
          firstName: true,
          lastAndMiddleNames: true,
          memberMatriculationNumber: true,
          registrationDate: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  return calculationDeaths.map(calculationDeath => ({
    amountToContribute: decimalToNumber(calculationDeath.amountToContribute),
    associationCode: calculationDeath.deceasedMember.associationCode ?? '',
    associationName: calculationDeath.deceasedMember.associationName,
    createdAt: calculationDeath.createdAt.toISOString(),
    dateOfDeath: calculationDeath.deceasedMember.dateOfDeath,
    firstName: calculationDeath.deceasedMember.firstName,
    id: calculationDeath.id,
    lastAndMiddleNames: calculationDeath.deceasedMember.lastAndMiddleNames,
    memberMatriculationNumber: calculationDeath.deceasedMember.memberMatriculationNumber,
    registrationDate: calculationDeath.deceasedMember.registrationDate
  }))
}

const contributionTableDeathCertificateDocumentTypes = ['death_certificate', 'ministry_certified_death_certificate']

const contributionTableDocumentTypes = [...contributionTableDeathCertificateDocumentTypes, 'deceased_picture']

type ContributionTableDocument = {
  fileName: string
  id: string
  status: string
}

const getPreferredContributionTableDocuments = (
  documents: {
    deceasedMember: {
      memberMatriculationNumber: string
    }
    documentType: string
    fileName: string
    id: string
    status: string
  }[],
  documentTypes: string[]
) => {
  const documentsByMatriculationNumber = new Map<string, ContributionTableDocument>()

  documents
    .filter(document => documentTypes.includes(document.documentType))
    .forEach(document => {
      const memberMatriculationNumber = document.deceasedMember.memberMatriculationNumber
      const currentDocument = documentsByMatriculationNumber.get(memberMatriculationNumber)

      if (currentDocument?.status === 'approved') return

      documentsByMatriculationNumber.set(memberMatriculationNumber, {
        fileName: document.fileName,
        id: document.id,
        status: document.status
      })
    })

  return documentsByMatriculationNumber
}

export const createAssociationContributionAssessmentAction = async (
  prevState: any,
  formData: FormData
): Promise<{ message: string }> => {
  const user = await assertAdminUser()

  try {
    const dueDate = getRequiredDateFromForm(formData, 'dueDate')

    const manualAmountPerVestedMember = getOptionalPositiveDollarAmountFromForm(
      formData,
      'manualAmountPerVestedMember',
      'manual monthly contribution per member'
    )

    const manualDeathCount = getOptionalPositiveIntegerFromForm(formData, 'manualDeathCount', 'manual number of deaths')

    const [{ adminFee, deathAmount, deathCount }, calculationDeaths] = await Promise.all([
      fetchContributionCalculationSummary(),
      fetchContributionCalculationDeaths()
    ])

    const vestedMembers = await db.member.findMany({
      select: {
        associationCode: true
      },
      where: {
        memberStatus: memberStatus.Vested
      }
    })

    if (vestedMembers.length === 0) {
      throw new Error('No vested members were found.')
    }

    const adminFeeTotal = roundCurrencyAmount(adminFee * vestedMembers.length)

    const calculatedTotalAmount = roundCurrencyAmount(deathAmount + adminFeeTotal)

    const hasCalculatedContribution = deathCount > 0 && calculationDeaths.length > 0 && calculatedTotalAmount > 0

    const calculatedAmountPerVestedMember = Number((calculatedTotalAmount / vestedMembers.length).toFixed(2))

    const amountPerVestedMember = manualAmountPerVestedMember ?? calculatedAmountPerVestedMember

    const totalAmount =
      manualAmountPerVestedMember === null
        ? calculatedTotalAmount
        : roundCurrencyAmount(amountPerVestedMember * vestedMembers.length)

    const publishedDeathCount = manualDeathCount ?? deathCount

    const isManualContribution = manualAmountPerVestedMember !== null || manualDeathCount !== null

    if (!manualAmountPerVestedMember && !hasCalculatedContribution) {
      throw new Error(
        'Enter a manual monthly contribution per member, or add at least one death with an amount in Contribution Calculation.'
      )
    }

    if (!manualDeathCount && !hasCalculatedContribution) {
      throw new Error('Enter the manual number of deaths, or add at least one death in Contribution Calculation.')
    }

    if (publishedDeathCount <= 0 || amountPerVestedMember <= 0 || totalAmount <= 0) {
      throw new Error('Enter valid contribution values before publishing.')
    }

    const vestedMembersByCode = vestedMembers.reduce((counts, member) => {
      counts.set(member.associationCode, (counts.get(member.associationCode) ?? 0) + 1)

      return counts
    }, new Map<string, number>())

    const groupEntries = Array.from(vestedMembersByCode.entries()).map(([associationCode, vestedMembersCount]) => ({
      amountOwed: Number((amountPerVestedMember * vestedMembersCount).toFixed(2)),
      associationCode,
      vestedMembersCount
    }))

    const deathEntries = calculationDeaths.map(death => ({
      amountToContribute: death.amountToContribute,
      associationCode: death.associationCode || null,
      associationName: death.associationName,
      dateOfDeath: death.dateOfDeath,
      firstName: death.firstName,
      lastAndMiddleNames: death.lastAndMiddleNames,
      memberMatriculationNumber: death.memberMatriculationNumber,
      registrationDate: death.registrationDate
    }))

    const contributionSourceNote = isManualContribution
      ? 'Manual contribution values were entered by SAGI.'
      : `Calculated from Contribution Calculation. Admin fee: ${currencyFormatter.format(adminFee)} x ${
          vestedMembers.length
        } vested member(s) = ${currencyFormatter.format(adminFeeTotal)}.`

    await db.$transaction(async tx => {
      await tx.associationContributionAssessment.create({
        data: {
          amountPerVestedMember,
          deathCount: publishedDeathCount,
          dueDate,
          totalAmount,
          totalVestedMembers: vestedMembers.length,
          groups: {
            create: groupEntries
          },
          ...(deathEntries.length > 0
            ? {
                deaths: {
                  create: deathEntries
                }
              }
            : {})
        }
      })

      await tx.associationPaymentLedgerEntry.createMany({
        data: groupEntries.map(group => ({
          amount: group.amountOwed,
          associationCode: group.associationCode,
          createdBy: user.id,
          eventType: associationPaymentLedgerEventTypes.dueOffset,
          note: `Contribution due created for ${group.vestedMembersCount} vested member(s). Number of deaths: ${publishedDeathCount}. Monthly contribution per vested member: ${currencyFormatter.format(amountPerVestedMember)}. ${contributionSourceNote}`,
          paymentType: associationPaymentTypes.contribution
        }))
      })
    })

    await recordDashboardActivity({
      action: 'contribution_assessment_published',
      actorClerkId: user.id,
      dashboardScope: dashboardActivityScopes.admin,
      entityType: 'contribution_assessment',
      summary: `Published contribution table for ${publishedDeathCount} death${
        publishedDeathCount === 1 ? '' : 's'
      }, ${vestedMembers.length} vested members, and ${currencyFormatter.format(totalAmount)} total.`
    })

    revalidatePaymentViews()

    return {
      message: `Published contribution table for ${publishedDeathCount} death${
        publishedDeathCount === 1 ? '' : 's'
      } and distributed ${currencyFormatter.format(totalAmount)} across ${
        vestedMembers.length
      } vested members. Each vested member is ${currencyFormatter.format(amountPerVestedMember)}.${
        isManualContribution
          ? ' Manual contribution values were used.'
          : ` Admin fee: ${currencyFormatter.format(adminFee)} x ${vestedMembers.length} = ${currencyFormatter.format(adminFeeTotal)}.`
      }`
    }
  } catch (error) {
    return renderError(error)
  }
}

export const resetAssociationContributionCalculationAction = async (): Promise<{ message: string }> => {
  const user = await assertAdminUser()

  try {
    const [
      latestAssessment,
      associationContributionPayments,
      contributionAssessmentGroups,
      contributionUsages,
      existingBalanceAdjustments,
      profiles,
      members
    ] = await Promise.all([
      fetchLatestAssociationContributionAssessment(),
      db.associationContributionPayment.findMany(),
      db.associationContributionAssessmentGroup.findMany({
        select: {
          associationCode: true
        }
      }),
      db.associationContributionUsage.findMany({
        select: {
          associationCode: true
        }
      }),
      db.associationBalanceAdjustment.findMany({
        select: {
          associationCode: true
        },
        where: {
          balanceType: contributionBalanceAdjustmentType
        }
      }),
      db.profile.findMany({
        select: {
          associationCode: true
        }
      }),
      db.member.findMany({
        distinct: ['associationCode'],
        select: {
          associationCode: true
        }
      })
    ])

    const affectedAssociationCodes = Array.from(
      new Set([
        ...(latestAssessment?.groups.map(group => group.associationCode) ?? []),
        ...associationContributionPayments.map(payment => payment.associationCode),
        ...contributionAssessmentGroups.map(group => group.associationCode),
        ...contributionUsages.map(usage => usage.associationCode),
        ...existingBalanceAdjustments.map(adjustment => adjustment.associationCode),
        ...profiles.map(profile => profile.associationCode),
        ...members.map(member => member.associationCode)
      ])
    ).filter(Boolean)

    const contributionSummaries =
      affectedAssociationCodes.length > 0
        ? await Promise.all(
            affectedAssociationCodes.map(associationCode => fetchAssociationContributionSummary(associationCode))
          )
        : []

    const balanceCarryForwards = contributionSummaries.map(summary => ({
      amount: summary.balance,
      associationCode: summary.associationCode
    }))

    const resetLedgerEntries = contributionSummaries
      .filter(
        summary =>
          summary.amountOwed !== 0 ||
          summary.amountReceived !== 0 ||
          summary.amountVerified !== 0 ||
          summary.balance !== 0 ||
          summary.manualBalanceAdjustment !== 0
      )
      .map(summary => ({
        amount: summary.balance,
        associationCode: summary.associationCode,
        createdBy: user.id,
        eventType: associationPaymentLedgerEventTypes.reset,
        note: 'Contribution calculation reset. Payment Update cleared for the new contribution cycle.',
        paymentType: associationPaymentTypes.contribution
      }))

    const paymentAssociationCodes = associationContributionPayments.map(payment => payment.associationCode)

    const ledgerTotals =
      paymentAssociationCodes.length > 0
        ? await db.associationPaymentLedgerEntry.groupBy({
            _sum: {
              amount: true
            },
            by: ['associationCode', 'eventType'],
            where: {
              associationCode: {
                in: paymentAssociationCodes
              },
              cancelledAt: null,
              eventType: {
                in: [associationPaymentLedgerEventTypes.submitted, associationPaymentLedgerEventTypes.verified]
              },
              paymentType: associationPaymentTypes.contribution
            }
          })
        : []

    const ledgerTotalsByCodeAndEvent = ledgerTotals.reduce((totals, entry) => {
      totals.set(`${entry.associationCode}:${entry.eventType}`, decimalToNumber(entry._sum.amount))

      return totals
    }, new Map<string, number>())

    const missingLedgerEntries = associationContributionPayments.flatMap(payment => {
      const submittedTotal =
        ledgerTotalsByCodeAndEvent.get(`${payment.associationCode}:${associationPaymentLedgerEventTypes.submitted}`) ??
        0

      const verifiedTotal =
        ledgerTotalsByCodeAndEvent.get(`${payment.associationCode}:${associationPaymentLedgerEventTypes.verified}`) ?? 0

      const missingSubmittedAmount = roundCurrencyAmount(
        getSubmittedAmountForPaymentHistory(payment, associationPaymentTypes.contribution) - submittedTotal
      )

      const missingVerifiedAmount = roundCurrencyAmount(decimalToNumber(payment.amountVerified) - verifiedTotal)

      return [
        ...(missingSubmittedAmount > 0
          ? [
              {
                amount: missingSubmittedAmount,
                associationCode: payment.associationCode,
                createdAt: payment.createdAt,
                createdBy: user.id,
                eventType: associationPaymentLedgerEventTypes.submitted,
                note: `${associationPaymentTypes.contribution} payment submitted before payment history was recorded.`,
                paymentType: associationPaymentTypes.contribution
              }
            ]
          : []),
        ...(missingVerifiedAmount > 0 && payment.verifiedAt
          ? [
              {
                amount: missingVerifiedAmount,
                associationCode: payment.associationCode,
                createdAt: payment.verifiedAt,
                createdBy: user.id,
                eventType: associationPaymentLedgerEventTypes.verified,
                note: `${associationPaymentTypes.contribution} payment verified by SAGI before payment history was recorded.`,
                paymentType: associationPaymentTypes.contribution
              }
            ]
          : [])
      ]
    })

    await db.$transaction(
      async tx => {
        if (missingLedgerEntries.length > 0) {
          await tx.associationPaymentLedgerEntry.createMany({
            data: missingLedgerEntries
          })
        }

        if (associationContributionPayments.length > 0) {
          await tx.associationContributionPayment.updateMany({
            data: {
              amountSent: 0,
              amountVerified: 0,
              lastSubmittedAt: null,
              verifiedAt: null
            },
            where: {
              associationCode: {
                in: associationContributionPayments.map(payment => payment.associationCode)
              }
            }
          })
        }

        if (balanceCarryForwards.length > 0) {
          await tx.$executeRaw(Prisma.sql`
            INSERT INTO "AssociationBalanceAdjustment" ("id", "associationCode", "balanceType", "amount", "createdAt", "updatedAt")
            VALUES ${Prisma.join(
              balanceCarryForwards.map(
                carryForward =>
                  Prisma.sql`(${randomUUID()}, ${carryForward.associationCode}, ${contributionBalanceAdjustmentType}, ${carryForward.amount}, NOW(), NOW())`
              )
            )}
            ON CONFLICT ("associationCode", "balanceType")
            DO UPDATE SET "amount" = EXCLUDED."amount", "updatedAt" = NOW()
          `)
        }

        if (resetLedgerEntries.length > 0) {
          await tx.associationPaymentLedgerEntry.createMany({
            data: resetLedgerEntries
          })
        }

        await tx.contributionCalculationDeath.deleteMany()
        await tx.contributionCalculationAdminFee.deleteMany()
        await tx.associationContributionAssessmentDeath.deleteMany()
        await tx.associationContributionAssessment.deleteMany()
      },
      {
        timeout: 20000
      }
    )

    await recordDashboardActivity({
      action: 'contribution_calculation_reset',
      actorClerkId: user.id,
      dashboardScope: dashboardActivityScopes.admin,
      entityType: 'contribution_calculation',
      summary:
        'Reset contribution calculation, cleared Payment Update for the new contribution cycle, and kept contribution balances.'
    })

    revalidatePaymentViews()
    revalidatePath('/admin-contribution-calculation')

    return {
      message:
        'Contribution calculation reset successfully. The draft calculation and published contribution table were emptied. Payment Update was cleared and contribution balances were kept.'
    }
  } catch (error) {
    return renderError(error)
  }
}

export const zeroAllAssociationContributionBalancesAction = async (): Promise<{ message: string }> => {
  const user = await assertAdminUser()

  try {
    const [profiles, associationContributionPayments, contributionAssessmentGroups, balanceAdjustments, members] =
      await Promise.all([
        db.profile.findMany({
          select: {
            associationCode: true
          }
        }),
        db.associationContributionPayment.findMany(),
        db.associationContributionAssessmentGroup.findMany({
          select: {
            associationCode: true
          }
        }),
        db.associationBalanceAdjustment.findMany({
          select: {
            associationCode: true
          },
          where: {
            balanceType: contributionBalanceAdjustmentType
          }
        }),
        db.member.findMany({
          distinct: ['associationCode'],
          select: {
            associationCode: true
          }
        })
      ])

    const affectedAssociationCodes = Array.from(
      new Set([
        ...profiles.map(profile => profile.associationCode),
        ...associationContributionPayments.map(payment => payment.associationCode),
        ...contributionAssessmentGroups.map(group => group.associationCode),
        ...balanceAdjustments.map(adjustment => adjustment.associationCode),
        ...members.map(member => member.associationCode)
      ])
    ).filter(Boolean)

    if (affectedAssociationCodes.length === 0) {
      return { message: 'No contribution balances found to reset.' }
    }

    const contributionSummaries = await Promise.all(
      affectedAssociationCodes.map(associationCode => fetchAssociationContributionSummary(associationCode))
    )

    const resetEntries = contributionSummaries.filter(
      summary =>
        summary.amountOwed !== 0 ||
        summary.amountReceived !== 0 ||
        summary.amountVerified !== 0 ||
        summary.balance !== 0 ||
        summary.manualBalanceAdjustment !== 0
    )

    await db.$transaction(async tx => {
      await Promise.all(
        associationContributionPayments.map(payment =>
          createMissingPaymentHistoryLedgerEntries({
            createdBy: user.id,
            payment,
            paymentType: associationPaymentTypes.contribution,
            tx
          })
        )
      )

      if (associationContributionPayments.length > 0) {
        await tx.associationContributionPayment.updateMany({
          data: {
            amountSent: 0,
            amountVerified: 0,
            lastSubmittedAt: null,
            verifiedAt: null
          },
          where: {
            associationCode: {
              in: associationContributionPayments.map(payment => payment.associationCode)
            }
          }
        })
      }

      await tx.associationContributionAssessment.deleteMany()

      await tx.associationBalanceAdjustment.deleteMany({
        where: {
          balanceType: contributionBalanceAdjustmentType
        }
      })

      if (resetEntries.length > 0) {
        await tx.associationPaymentLedgerEntry.createMany({
          data: resetEntries.map(summary => ({
            amount: summary.balance,
            associationCode: summary.associationCode,
            createdBy: user.id,
            eventType: associationPaymentLedgerEventTypes.reset,
            note: 'Contribution balance reset to zero by SAGI fresh start.',
            paymentType: associationPaymentTypes.contribution
          }))
        })
      }
    })

    revalidatePaymentViews()

    return {
      message: `Contribution balances reset to $0.00 for ${affectedAssociationCodes.length} association${
        affectedAssociationCodes.length === 1 ? '' : 's'
      }. Payment history was kept.`
    }
  } catch (error) {
    return renderError(error)
  }
}

const getContributionProofRequestSubject = (formattedAmount: string) =>
  `Proof requested for ${formattedAmount} contribution payment`

const getRegistrationProofRequestSubject = (formattedAmount: string) =>
  `Proof requested for ${formattedAmount} registration payment`

const fetchLatestContributionPaymentStateLedgerEntry = async (associationCode: string) => {
  const latestReset = await db.associationPaymentLedgerEntry.findFirst({
    orderBy: {
      createdAt: 'desc'
    },
    select: {
      createdAt: true
    },
    where: {
      associationCode,
      cancelledAt: null,
      eventType: associationPaymentLedgerEventTypes.reset,
      paymentType: associationPaymentTypes.contribution
    }
  })

  return db.associationPaymentLedgerEntry.findFirst({
    orderBy: {
      createdAt: 'desc'
    },
    select: {
      amount: true,
      createdAt: true,
      eventType: true
    },
    where: {
      associationCode,
      cancelledAt: null,
      eventType: {
        in: [associationPaymentLedgerEventTypes.notFound, associationPaymentLedgerEventTypes.submitted]
      },
      paymentType: associationPaymentTypes.contribution,
      ...(latestReset ? { createdAt: { gt: latestReset.createdAt } } : {})
    }
  })
}

const fetchLatestRegistrationPaymentStateLedgerEntry = async (associationCode: string) => {
  const latestReset = await db.associationPaymentLedgerEntry.findFirst({
    orderBy: {
      createdAt: 'desc'
    },
    select: {
      createdAt: true
    },
    where: {
      associationCode,
      cancelledAt: null,
      eventType: associationPaymentLedgerEventTypes.reset,
      paymentType: associationPaymentTypes.registration
    }
  })

  return db.associationPaymentLedgerEntry.findFirst({
    orderBy: {
      createdAt: 'desc'
    },
    select: {
      amount: true,
      createdAt: true,
      eventType: true
    },
    where: {
      associationCode,
      cancelledAt: null,
      eventType: {
        in: [associationPaymentLedgerEventTypes.notFound, associationPaymentLedgerEventTypes.submitted]
      },
      paymentType: associationPaymentTypes.registration,
      ...(latestReset ? { createdAt: { gt: latestReset.createdAt } } : {})
    }
  })
}

export const saveAssociationContributionPaymentAction = async (
  prevState: any,
  formData: FormData
): Promise<{ message: string }> => {
  const user = await getAuthUser()

  try {
    const associationCode = await getCurrentAssociationCode(user.id)
    const amountSent = getPositiveDollarAmountFromForm(formData, 'amountSent')
    const submittedAt = new Date()
    const documentFile = getOptionalIssueNoteDocumentFile(formData)
    const latestContributionPaymentStateEntry = await fetchLatestContributionPaymentStateLedgerEntry(associationCode)

    const proofUploadRequired =
      latestContributionPaymentStateEntry?.eventType === associationPaymentLedgerEventTypes.notFound

    if (proofUploadRequired && !documentFile) {
      throw new Error('Upload proof of payment before recording another contribution amount.')
    }

    const amountNotFound = proofUploadRequired ? decimalToNumber(latestContributionPaymentStateEntry?.amount) : 0
    const formattedAmountNotFound = currencyFormatter.format(amountNotFound)

    const proofRequestNote = proofUploadRequired
      ? await db.delegateIssueNote.findFirst({
          orderBy: {
            createdAt: 'desc'
          },
          select: {
            id: true
          },
          where: {
            associationCode,
            status: 'open',
            subject: getContributionProofRequestSubject(formattedAmountNotFound)
          }
        })
      : null

    const proofNoteId = proofUploadRequired ? (proofRequestNote?.id ?? randomUUID()) : null

    const proofMessageId = proofUploadRequired ? randomUUID() : null

    const uploadedProofDocument =
      proofUploadRequired && documentFile && proofNoteId && proofMessageId
        ? await uploadIssueNoteDocument({
            file: documentFile,
            messageId: proofMessageId,
            noteId: proofNoteId
          })
        : null

    try {
      const payment = await db.$transaction(async tx => {
        const payment = await tx.associationContributionPayment.upsert({
          create: {
            amountSent,
            associationCode,
            lastSubmittedAt: submittedAt
          },
          update: {
            amountSent: {
              increment: amountSent
            },
            lastSubmittedAt: submittedAt
          },
          where: {
            associationCode
          }
        })

        await tx.associationPaymentLedgerEntry.create({
          data: {
            amount: amountSent,
            associationCode,
            createdBy: user.id,
            eventType: associationPaymentLedgerEventTypes.submitted,
            note: 'Contribution payment submitted by association.',
            paymentType: associationPaymentTypes.contribution
          }
        })

        await recordDashboardActivity({
          action: 'contribution_payment_submitted',
          actorClerkId: user.id,
          associationCode,
          dashboardScope: dashboardActivityScopes.association,
          entityId: payment.id,
          entityType: 'payment',
          summary: `Submitted contribution payment of ${currencyFormatter.format(amountSent)}.${
            uploadedProofDocument ? ' Proof of payment was uploaded.' : ''
          }`,
          tx
        })

        if (uploadedProofDocument && proofMessageId && proofNoteId) {
          const messageBody = `Proof of payment uploaded for the contribution payment SAGI marked not found (${formattedAmountNotFound}). The delegate recorded a new contribution amount of ${currencyFormatter.format(amountSent)}.`

          if (proofRequestNote) {
            await tx.delegateIssueNoteMessage.create({
              data: {
                authorClerkId: user.id,
                authorRole: 'delegate',
                body: messageBody,
                id: proofMessageId,
                noteId: proofRequestNote.id,
                ...uploadedProofDocument.messageData
              }
            })

            await tx.delegateIssueNote.update({
              data: {
                adminUnread: true,
                delegateLastReadAt: submittedAt,
                delegateUnread: false,
                lastMessageAt: submittedAt,
                lastMessageByRole: 'delegate'
              },
              where: {
                id: proofRequestNote.id
              }
            })
          } else {
            const profile = await tx.profile.findUnique({
              select: {
                associationName: true
              },
              where: {
                associationCode
              }
            })

            await tx.delegateIssueNote.create({
              data: {
                adminUnread: true,
                associationCode,
                associationName: profile?.associationName,
                createdByClerkId: user.id,
                createdByRole: 'delegate',
                delegateLastReadAt: submittedAt,
                delegateUnread: false,
                id: proofNoteId,
                lastMessageAt: submittedAt,
                lastMessageByRole: 'delegate',
                messages: {
                  create: {
                    authorClerkId: user.id,
                    authorRole: 'delegate',
                    body: messageBody,
                    id: proofMessageId,
                    ...uploadedProofDocument.messageData
                  }
                },
                priority: 'urgent',
                status: 'open',
                subject: getContributionProofRequestSubject(formattedAmountNotFound)
              }
            })
          }
        }

        return payment
      })

      revalidatePaymentViews()

      if (uploadedProofDocument) {
        revalidateIssueNoteViews()
      }

      return {
        message: `Added contribution payment: ${currencyFormatter.format(amountSent)}. Total sent: ${currencyFormatter.format(decimalToNumber(payment.amountSent))}.${uploadedProofDocument ? ' Proof of payment uploaded.' : ''}`
      }
    } catch (error) {
      if (uploadedProofDocument) {
        await deleteCloudinaryDocumentWithoutBlocking({
          cloudinaryDeliveryType: uploadedProofDocument.cloudinaryDocument.deliveryType,
          cloudinaryPublicId: uploadedProofDocument.cloudinaryDocument.publicId,
          cloudinaryResourceType: uploadedProofDocument.cloudinaryDocument.resourceType
        })
      }

      throw error
    }
  } catch (error) {
    return renderError(error)
  }
}

export const saveAssociationRegistrationPaymentAction = async (
  prevState: any,
  formData: FormData
): Promise<{ message: string }> => {
  const user = await getAuthUser()

  try {
    const associationCode = await getCurrentAssociationCode(user.id)
    const amountSent = getPositiveDollarAmountFromForm(formData, 'amountSent')
    const submittedAt = new Date()
    const documentFile = getOptionalIssueNoteDocumentFile(formData)
    const latestRegistrationPaymentStateEntry = await fetchLatestRegistrationPaymentStateLedgerEntry(associationCode)

    const proofUploadRequired =
      latestRegistrationPaymentStateEntry?.eventType === associationPaymentLedgerEventTypes.notFound

    if (proofUploadRequired && !documentFile) {
      throw new Error('Upload proof of payment before recording another registration amount.')
    }

    const amountNotFound = proofUploadRequired ? decimalToNumber(latestRegistrationPaymentStateEntry?.amount) : 0
    const formattedAmountNotFound = currencyFormatter.format(amountNotFound)

    const proofRequestNote = proofUploadRequired
      ? await db.delegateIssueNote.findFirst({
          orderBy: {
            createdAt: 'desc'
          },
          select: {
            id: true
          },
          where: {
            associationCode,
            status: 'open',
            subject: getRegistrationProofRequestSubject(formattedAmountNotFound)
          }
        })
      : null

    const proofNoteId = proofUploadRequired ? (proofRequestNote?.id ?? randomUUID()) : null

    const proofMessageId = proofUploadRequired ? randomUUID() : null

    const uploadedProofDocument =
      proofUploadRequired && documentFile && proofNoteId && proofMessageId
        ? await uploadIssueNoteDocument({
            file: documentFile,
            messageId: proofMessageId,
            noteId: proofNoteId
          })
        : null

    try {
      const payment = await db.$transaction(async tx => {
        const payment = await tx.associationRegistrationPayment.upsert({
          create: {
            amountSent,
            associationCode,
            lastSubmittedAt: submittedAt
          },
          update: {
            amountSent: {
              increment: amountSent
            },
            lastSubmittedAt: submittedAt
          },
          where: {
            associationCode
          }
        })

        await tx.associationPaymentLedgerEntry.create({
          data: {
            amount: amountSent,
            associationCode,
            createdBy: user.id,
            eventType: associationPaymentLedgerEventTypes.submitted,
            note: 'Registration payment submitted by association.',
            paymentType: associationPaymentTypes.registration
          }
        })

        await recordDashboardActivity({
          action: 'registration_payment_submitted',
          actorClerkId: user.id,
          associationCode,
          dashboardScope: dashboardActivityScopes.association,
          entityId: payment.id,
          entityType: 'payment',
          summary: `Submitted registration payment of ${currencyFormatter.format(amountSent)}.${
            uploadedProofDocument ? ' Proof of payment was uploaded.' : ''
          }`,
          tx
        })

        if (uploadedProofDocument && proofMessageId && proofNoteId) {
          const messageBody = `Proof of payment uploaded for the registration payment SAGI marked not found (${formattedAmountNotFound}). The delegate recorded a new registration amount of ${currencyFormatter.format(amountSent)}.`

          if (proofRequestNote) {
            await tx.delegateIssueNoteMessage.create({
              data: {
                authorClerkId: user.id,
                authorRole: 'delegate',
                body: messageBody,
                id: proofMessageId,
                noteId: proofRequestNote.id,
                ...uploadedProofDocument.messageData
              }
            })

            await tx.delegateIssueNote.update({
              data: {
                adminUnread: true,
                delegateLastReadAt: submittedAt,
                delegateUnread: false,
                lastMessageAt: submittedAt,
                lastMessageByRole: 'delegate'
              },
              where: {
                id: proofRequestNote.id
              }
            })
          } else {
            const profile = await tx.profile.findUnique({
              select: {
                associationName: true
              },
              where: {
                associationCode
              }
            })

            await tx.delegateIssueNote.create({
              data: {
                adminUnread: true,
                associationCode,
                associationName: profile?.associationName,
                createdByClerkId: user.id,
                createdByRole: 'delegate',
                delegateLastReadAt: submittedAt,
                delegateUnread: false,
                id: proofNoteId,
                lastMessageAt: submittedAt,
                lastMessageByRole: 'delegate',
                messages: {
                  create: {
                    authorClerkId: user.id,
                    authorRole: 'delegate',
                    body: messageBody,
                    id: proofMessageId,
                    ...uploadedProofDocument.messageData
                  }
                },
                priority: 'urgent',
                status: 'open',
                subject: getRegistrationProofRequestSubject(formattedAmountNotFound)
              }
            })
          }
        }

        return payment
      })

      revalidatePaymentViews()

      if (uploadedProofDocument) {
        revalidateIssueNoteViews()
      }

      return {
        message: `Added registration payment: ${currencyFormatter.format(amountSent)}. Total awaiting verification: ${currencyFormatter.format(decimalToNumber(payment.amountSent))}.${uploadedProofDocument ? ' Proof of payment uploaded.' : ''}`
      }
    } catch (error) {
      if (uploadedProofDocument) {
        await deleteCloudinaryDocumentWithoutBlocking({
          cloudinaryDeliveryType: uploadedProofDocument.cloudinaryDocument.deliveryType,
          cloudinaryPublicId: uploadedProofDocument.cloudinaryDocument.publicId,
          cloudinaryResourceType: uploadedProofDocument.cloudinaryDocument.resourceType
        })
      }

      throw error
    }
  } catch (error) {
    return renderError(error)
  }
}

export const verifyAssociationContributionPaymentAction = async (formData: FormData): Promise<void> => {
  const user = await assertAdminUser()

  try {
    const associationCode = getRequiredFormValue(formData, 'associationCode')

    const payment = await db.associationContributionPayment.findUnique({
      where: {
        associationCode
      }
    })

    if (!payment) {
      throw new Error('No contribution payment found for this association code.')
    }

    const amountSent = decimalToNumber(payment.amountSent)
    const amountVerified = decimalToNumber(payment.amountVerified)
    const amountToVerify = Number((amountSent - amountVerified).toFixed(2))

    if (amountToVerify <= 0) {
      throw new Error('No new contribution amount sent to verify.')
    }

    await db.$transaction(async tx => {
      await createMissingVerifiedLedgerEntry({
        amountVerified,
        associationCode,
        createdBy: user.id,
        paymentType: associationPaymentTypes.contribution,
        tx,
        verifiedAt: payment.verifiedAt
      })

      await tx.associationContributionPayment.update({
        data: {
          amountVerified: amountSent,
          verifiedAt: new Date()
        },
        where: {
          associationCode
        }
      })

      await tx.associationPaymentLedgerEntry.create({
        data: {
          amount: amountToVerify,
          associationCode,
          createdBy: user.id,
          eventType: associationPaymentLedgerEventTypes.verified,
          note: 'Contribution payment verified by SAGI.',
          paymentType: associationPaymentTypes.contribution
        }
      })

      await recordDashboardActivity({
        action: 'contribution_payment_verified',
        actorClerkId: user.id,
        associationCode,
        dashboardScope: dashboardActivityScopes.admin,
        entityId: payment.id,
        entityType: 'payment',
        summary: `Verified contribution payment of ${currencyFormatter.format(amountToVerify)} for ${associationCode}.`,
        tx
      })
    })

    revalidatePaymentViews()
  } catch (error) {
    renderError(error)
  }
}

const addAssociationBalanceAdjustment = async (formData: FormData, balanceType: string): Promise<void> => {
  const user = await assertAdminUser()

  try {
    const associationCode = getRequiredFormValue(formData, 'associationCode')
    const amount = getSignedDollarAmountFromForm(formData, 'balanceAmount')

    await db.$transaction(async tx => {
      await tx.associationBalanceAdjustment.upsert({
        create: {
          amount,
          associationCode,
          balanceType
        },
        update: {
          amount: {
            increment: amount
          }
        },
        where: {
          associationCode_balanceType: {
            associationCode,
            balanceType
          }
        }
      })

      await tx.associationPaymentLedgerEntry.create({
        data: {
          amount,
          associationCode,
          createdBy: user.id,
          eventType: associationPaymentLedgerEventTypes.manualAdjustment,
          note: `${balanceType} balance manually adjusted by SAGI.`,
          paymentType: balanceType
        }
      })

      await recordDashboardActivity({
        action: 'payment_balance_adjusted',
        actorClerkId: user.id,
        associationCode,
        dashboardScope: dashboardActivityScopes.admin,
        entityType: 'payment',
        summary: `Adjusted ${balanceType} balance for ${associationCode} by ${currencyFormatter.format(amount)}.`,
        tx
      })
    })

    revalidatePaymentViews()
  } catch (error) {
    renderError(error)
  }
}

export const addAssociationContributionBalanceAdjustmentAction = async (formData: FormData): Promise<void> => {
  await addAssociationBalanceAdjustment(formData, contributionBalanceAdjustmentType)
}

export const addAssociationContributionSentAdjustmentAction = async (formData: FormData): Promise<void> => {
  const user = await assertAdminUser()

  try {
    const associationCode = getRequiredFormValue(formData, 'associationCode')
    const amount = getSignedDollarAmountFromForm(formData, 'sentAmount')

    await db.$transaction(async tx => {
      const payment = await tx.associationContributionPayment.findUnique({
        where: {
          associationCode
        }
      })

      const currentAmountSent = decimalToNumber(payment?.amountSent)
      const currentAmountVerified = decimalToNumber(payment?.amountVerified)
      const nextAmountSent = roundCurrencyAmount(currentAmountSent + amount)

      if (nextAmountSent < currentAmountVerified) {
        throw new Error('Contribution sent cannot be less than the amount already verified.')
      }

      if (nextAmountSent < 0) {
        throw new Error('Contribution sent cannot be less than zero.')
      }

      if (payment) {
        await createMissingSubmittedLedgerEntry({
          amountSubmitted: currentAmountSent,
          associationCode,
          createdBy: user.id,
          paymentType: associationPaymentTypes.contribution,
          submittedAt: payment.createdAt,
          tx
        })

        await tx.associationContributionPayment.update({
          data: {
            amountSent: nextAmountSent
          },
          where: {
            associationCode
          }
        })
      } else {
        await tx.associationContributionPayment.create({
          data: {
            amountSent: nextAmountSent,
            amountVerified: 0,
            associationCode,
            lastSubmittedAt: null,
            verifiedAt: null
          }
        })
      }

      await tx.associationPaymentLedgerEntry.create({
        data: {
          amount,
          associationCode,
          createdBy: user.id,
          eventType: associationPaymentLedgerEventTypes.submitted,
          note: 'Contribution payment found by SAGI.',
          paymentType: associationPaymentTypes.contribution
        }
      })

      await recordDashboardActivity({
        action: 'contribution_payment_found',
        actorClerkId: user.id,
        associationCode,
        dashboardScope: dashboardActivityScopes.admin,
        entityType: 'payment',
        summary: `Recorded found contribution payment for ${associationCode}: ${currencyFormatter.format(amount)}.`,
        tx
      })
    })

    revalidatePaymentViews()
  } catch (error) {
    renderError(error)
  }
}

export const markAssociationContributionPaymentNotFoundAction = async (formData: FormData): Promise<void> => {
  const user = await assertAdminUser()

  try {
    const associationCode = getRequiredFormValue(formData, 'associationCode')

    const currentPayment = await db.associationContributionPayment.findUnique({
      where: {
        associationCode
      }
    })

    if (!currentPayment) {
      throw new Error('No contribution payment found for this association code.')
    }

    const amountSent = decimalToNumber(currentPayment.amountSent)
    const amountVerified = decimalToNumber(currentPayment.amountVerified)
    const amountNotFound = roundCurrencyAmount(amountSent - amountVerified)

    if (amountNotFound <= 0) {
      throw new Error('No new contribution amount sent to mark as not found.')
    }

    const profile = await db.profile.findUnique({
      select: {
        associationName: true
      },
      where: {
        associationCode
      }
    })

    const now = new Date()
    const noteId = randomUUID()
    const messageId = randomUUID()
    const formattedAmountNotFound = currencyFormatter.format(amountNotFound)

    await db.$transaction(async tx => {
      await createMissingPaymentHistoryLedgerEntries({
        createdBy: user.id,
        payment: currentPayment,
        paymentType: associationPaymentTypes.contribution,
        tx
      })

      await tx.associationContributionPayment.update({
        data: {
          amountSent: amountVerified,
          lastSubmittedAt: null
        },
        where: {
          associationCode
        }
      })

      await tx.associationPaymentLedgerEntry.create({
        data: {
          amount: amountNotFound,
          associationCode,
          createdBy: user.id,
          eventType: associationPaymentLedgerEventTypes.notFound,
          note: 'Contribution payment was not found by SAGI.',
          paymentType: associationPaymentTypes.contribution
        }
      })

      await tx.delegateIssueNote.create({
        data: {
          adminLastReadAt: now,
          adminUnread: false,
          associationCode,
          associationName: profile?.associationName,
          createdByClerkId: user.id,
          createdByRole: 'admin',
          delegateUnread: true,
          id: noteId,
          lastMessageAt: now,
          lastMessageByRole: 'admin',
          messages: {
            create: {
              authorClerkId: user.id,
              authorRole: 'admin',
              body: `SAGI could not find your contribution payment of ${formattedAmountNotFound}. Please upload proof of payment under the contribution amount field the next time you record an amount, such as the Zelle confirmation, receipt, or transaction screenshot, so the admin team can review it.`,
              id: messageId
            }
          },
          priority: 'urgent',
          status: 'open',
          subject: getContributionProofRequestSubject(formattedAmountNotFound)
        }
      })

      await recordDashboardActivity({
        action: 'contribution_payment_not_found',
        actorClerkId: user.id,
        associationCode,
        dashboardScope: dashboardActivityScopes.admin,
        entityId: noteId,
        entityType: 'payment',
        summary: `Marked contribution payment not found for ${associationCode}: ${formattedAmountNotFound}.`,
        tx
      })
    })

    revalidatePaymentViews()
    revalidateIssueNoteViews()
  } catch (error) {
    renderError(error)
  }
}

export const addAssociationRegistrationBalanceAdjustmentAction = async (formData: FormData): Promise<void> => {
  await addAssociationBalanceAdjustment(formData, registrationBalanceAdjustmentType)
}

export const addAssociationRegistrationSentAdjustmentAction = async (formData: FormData): Promise<void> => {
  const user = await assertAdminUser()

  try {
    const associationCode = getRequiredFormValue(formData, 'associationCode')
    const amount = getSignedDollarAmountFromForm(formData, 'sentAmount')

    await db.$transaction(async tx => {
      const payment = await tx.associationRegistrationPayment.findUnique({
        where: {
          associationCode
        }
      })

      const currentAmountSent = decimalToNumber(payment?.amountSent)
      const currentAmountVerified = decimalToNumber(payment?.amountVerified)
      const nextAmountSent = roundCurrencyAmount(currentAmountSent + amount)

      if (nextAmountSent < 0) {
        throw new Error('Registration sent cannot be less than zero.')
      }

      if (payment) {
        await createMissingSubmittedLedgerEntry({
          amountSubmitted: roundCurrencyAmount(currentAmountSent + currentAmountVerified),
          associationCode,
          createdBy: user.id,
          paymentType: associationPaymentTypes.registration,
          submittedAt: payment.createdAt,
          tx
        })

        await tx.associationRegistrationPayment.update({
          data: {
            amountSent: nextAmountSent
          },
          where: {
            associationCode
          }
        })
      } else {
        await tx.associationRegistrationPayment.create({
          data: {
            amountSent: nextAmountSent,
            amountVerified: 0,
            associationCode,
            lastSubmittedAt: null,
            verifiedAt: null
          }
        })
      }

      await tx.associationPaymentLedgerEntry.create({
        data: {
          amount,
          associationCode,
          createdBy: user.id,
          eventType: associationPaymentLedgerEventTypes.submitted,
          note: 'Registration payment found by SAGI.',
          paymentType: associationPaymentTypes.registration
        }
      })

      await recordDashboardActivity({
        action: 'registration_payment_found',
        actorClerkId: user.id,
        associationCode,
        dashboardScope: dashboardActivityScopes.admin,
        entityType: 'payment',
        summary: `Recorded found registration payment for ${associationCode}: ${currencyFormatter.format(amount)}.`,
        tx
      })
    })

    revalidatePaymentViews()
  } catch (error) {
    renderError(error)
  }
}

export const verifyAssociationRegistrationPaymentAction = async (formData: FormData): Promise<void> => {
  const user = await assertAdminUser()

  try {
    const associationCode = getRequiredFormValue(formData, 'associationCode')

    const payment = await db.associationRegistrationPayment.findUnique({
      where: {
        associationCode
      }
    })

    if (!payment) {
      throw new Error('No registration payment found for this association code.')
    }

    const amountSent = decimalToNumber(payment.amountSent)
    const amountVerified = decimalToNumber(payment.amountVerified)

    if (amountSent <= 0) {
      throw new Error('No registration amount sent to verify.')
    }

    await db.$transaction(async tx => {
      await createMissingVerifiedLedgerEntry({
        amountVerified,
        associationCode,
        createdBy: user.id,
        paymentType: associationPaymentTypes.registration,
        tx,
        verifiedAt: payment.verifiedAt
      })

      await tx.associationRegistrationPayment.update({
        data: {
          amountSent: 0,
          amountVerified: {
            increment: amountSent
          },
          verifiedAt: new Date()
        },
        where: {
          associationCode
        }
      })

      await tx.associationPaymentLedgerEntry.create({
        data: {
          amount: amountSent,
          associationCode,
          createdBy: user.id,
          eventType: associationPaymentLedgerEventTypes.verified,
          note: 'Registration payment verified by SAGI.',
          paymentType: associationPaymentTypes.registration
        }
      })

      await recordDashboardActivity({
        action: 'registration_payment_verified',
        actorClerkId: user.id,
        associationCode,
        dashboardScope: dashboardActivityScopes.admin,
        entityId: payment.id,
        entityType: 'payment',
        summary: `Verified registration payment of ${currencyFormatter.format(amountSent)} for ${associationCode}.`,
        tx
      })
    })

    revalidatePaymentViews()
  } catch (error) {
    renderError(error)
  }
}

export const markAssociationRegistrationPaymentNotFoundAction = async (formData: FormData): Promise<void> => {
  const user = await assertAdminUser()

  try {
    const associationCode = getRequiredFormValue(formData, 'associationCode')

    const currentPayment = await db.associationRegistrationPayment.findUnique({
      where: {
        associationCode
      }
    })

    if (!currentPayment) {
      throw new Error('No registration payment found for this association code.')
    }

    const amountNotFound = roundCurrencyAmount(decimalToNumber(currentPayment.amountSent))

    if (amountNotFound <= 0) {
      throw new Error('No registration amount sent to mark as not found.')
    }

    const profile = await db.profile.findUnique({
      select: {
        associationName: true
      },
      where: {
        associationCode
      }
    })

    const now = new Date()
    const noteId = randomUUID()
    const messageId = randomUUID()
    const formattedAmountNotFound = currencyFormatter.format(amountNotFound)

    await db.$transaction(async tx => {
      await createMissingPaymentHistoryLedgerEntries({
        createdBy: user.id,
        payment: currentPayment,
        paymentType: associationPaymentTypes.registration,
        tx
      })

      await tx.associationRegistrationPayment.update({
        data: {
          amountSent: 0,
          lastSubmittedAt: null
        },
        where: {
          associationCode
        }
      })

      await tx.associationPaymentLedgerEntry.create({
        data: {
          amount: amountNotFound,
          associationCode,
          createdBy: user.id,
          eventType: associationPaymentLedgerEventTypes.notFound,
          note: 'Registration payment was not found by SAGI.',
          paymentType: associationPaymentTypes.registration
        }
      })

      await tx.delegateIssueNote.create({
        data: {
          adminLastReadAt: now,
          adminUnread: false,
          associationCode,
          associationName: profile?.associationName,
          createdByClerkId: user.id,
          createdByRole: 'admin',
          delegateUnread: true,
          id: noteId,
          lastMessageAt: now,
          lastMessageByRole: 'admin',
          messages: {
            create: {
              authorClerkId: user.id,
              authorRole: 'admin',
              body: `SAGI could not find your registration payment of ${formattedAmountNotFound}. Please upload proof of payment under the registration amount field the next time you record an amount, such as the Zelle confirmation, receipt, or transaction screenshot, so the admin team can review it.`,
              id: messageId
            }
          },
          priority: 'urgent',
          status: 'open',
          subject: getRegistrationProofRequestSubject(formattedAmountNotFound)
        }
      })

      await recordDashboardActivity({
        action: 'registration_payment_not_found',
        actorClerkId: user.id,
        associationCode,
        dashboardScope: dashboardActivityScopes.admin,
        entityId: noteId,
        entityType: 'payment',
        summary: `Marked registration payment not found for ${associationCode}: ${formattedAmountNotFound}.`,
        tx
      })
    })

    revalidatePaymentViews()
    revalidateIssueNoteViews()
  } catch (error) {
    renderError(error)
  }
}

export const resetAssociationRegistrationPaymentAction = async (formData: FormData): Promise<void> => {
  const user = await assertAdminUser()

  try {
    const associationCode = getRequiredFormValue(formData, 'associationCode')

    const currentPayment = await db.associationRegistrationPayment.findUnique({
      where: {
        associationCode
      }
    })

    await db.$transaction(async tx => {
      await createMissingPaymentHistoryLedgerEntries({
        createdBy: user.id,
        payment: currentPayment,
        paymentType: associationPaymentTypes.registration,
        tx
      })

      await tx.associationRegistrationPayment.upsert({
        create: {
          amountSent: 0,
          amountVerified: 0,
          associationCode,
          lastSubmittedAt: null,
          verifiedAt: null
        },
        update: {
          amountSent: 0,
          amountVerified: 0,
          lastSubmittedAt: null,
          verifiedAt: null
        },
        where: {
          associationCode
        }
      })

      await recordDashboardActivity({
        action: 'registration_payment_reset',
        actorClerkId: user.id,
        associationCode,
        dashboardScope: dashboardActivityScopes.admin,
        entityType: 'payment',
        summary: `Reset registration payment balance for ${associationCode}.`,
        tx
      })
    })

    revalidatePaymentViews()
  } catch (error) {
    renderError(error)
  }
}

export const movePendingMembersToAwaitingPublicationAction = async (
  _prevState: { message: string },
  formData: FormData
): Promise<{ message: string }> => {
  const user = await assertAdminUser()

  try {
    const memberIds = getStringFormValues(formData, 'memberIds')

    if (memberIds.length === 0) {
      throw new Error('Select at least one pending member.')
    }

    const updatedCount = await db.$transaction(async tx => {
      const pendingMembers = await tx.member.findMany({
        select: {
          id: true,
          memberMatriculationNumber: true
        },
        where: {
          id: {
            in: memberIds
          },
          memberStatus: memberStatus.Pending
        }
      })

      if (pendingMembers.length === 0) {
        return 0
      }

      const pendingMemberIds = pendingMembers.map(member => member.id)
      const pendingMatriculationNumbers = pendingMembers.map(member => member.memberMatriculationNumber)

      const updatedMembers = await tx.member.updateMany({
        data: {
          memberStatus: memberStatus.Awaiting
        },
        where: {
          id: {
            in: pendingMemberIds
          },
          memberStatus: memberStatus.Pending
        }
      })

      await tx.associationRegistrationUsage.deleteMany({
        where: {
          memberMatriculationNumber: {
            in: pendingMatriculationNumbers
          }
        }
      })

      return updatedMembers.count
    })

    if (updatedCount > 0) {
      await recordDashboardActivity({
        action: 'members_moved_to_awaiting_publication',
        actorClerkId: user.id,
        dashboardScope: dashboardActivityScopes.admin,
        entityType: 'member',
        summary: `Moved ${updatedCount} pending member${updatedCount === 1 ? '' : 's'} to Awaiting Publication.`
      })
    }

    revalidatePaymentViews()

    if (updatedCount === 0) {
      return {
        message: 'No selected pending members were found.'
      }
    }

    return {
      message: `${updatedCount} pending member${updatedCount === 1 ? '' : 's'} moved to Awaiting Publication.`
    }
  } catch (error) {
    return renderError(error)
  }
}

export const makeMembersDelinquentAction = async (
  _prevState: { message: string },
  formData: FormData
): Promise<{ message: string }> => {
  const user = await assertAdminUser()

  try {
    const memberIds = getStringFormValues(formData, 'memberIds')

    if (memberIds.length === 0) {
      throw new Error('Select at least one vested member.')
    }

    const updatedCount = await db.$transaction(async tx => {
      const vestedMembers = await tx.member.findMany({
        select: {
          id: true,
          memberMatriculationNumber: true
        },
        where: {
          id: {
            in: memberIds
          },
          memberStatus: memberStatus.Vested
        }
      })

      if (vestedMembers.length === 0) {
        return 0
      }

      const vestedMemberIds = vestedMembers.map(member => member.id)
      const vestedMatriculationNumbers = vestedMembers.map(member => member.memberMatriculationNumber)

      const updatedMembers = await tx.member.updateMany({
        data: {
          memberStatus: memberStatus.Delinquent,
          vestedAt: null
        },
        where: {
          id: {
            in: vestedMemberIds
          },
          memberStatus: memberStatus.Vested
        }
      })

      if (vestedMatriculationNumbers.length > 0) {
        await tx.associationContributionCredit.deleteMany({
          where: {
            memberMatriculationNumber: {
              in: vestedMatriculationNumbers
            }
          }
        })
      }

      return updatedMembers.count
    })

    if (updatedCount > 0) {
      await recordDashboardActivity({
        action: 'members_moved_to_not_in_good_standing',
        actorClerkId: user.id,
        dashboardScope: dashboardActivityScopes.admin,
        entityType: 'member',
        summary: `Moved ${updatedCount} vested member${updatedCount === 1 ? '' : 's'} to Not in Good Standing.`
      })
    }

    revalidatePaymentViews()

    if (updatedCount === 0) {
      return {
        message: 'No selected vested members were found.'
      }
    }

    return {
      message: `${updatedCount} vested member${updatedCount === 1 ? '' : 's'} moved to Not in Good Standing.`
    }
  } catch (error) {
    return renderError(error)
  }
}

export const makeAwaitingMembersVestedAction = async (
  _prevState: { message: string },
  formData: FormData
): Promise<{ message: string }> => {
  const user = await assertAdminUser()

  try {
    const memberIds = getStringFormValues(formData, 'memberIds')

    if (memberIds.length === 0) {
      throw new Error('Select at least one awaiting publication member.')
    }

    const updatedMembers = await db.member.updateMany({
      data: {
        memberStatus: memberStatus.Vested,
        vestedAt: new Date()
      },
      where: {
        id: {
          in: memberIds
        },
        memberStatus: memberStatus.Awaiting
      }
    })

    if (updatedMembers.count > 0) {
      await recordDashboardActivity({
        action: 'members_moved_to_vested',
        actorClerkId: user.id,
        dashboardScope: dashboardActivityScopes.admin,
        entityType: 'member',
        summary: `Moved ${updatedMembers.count} awaiting publication member${
          updatedMembers.count === 1 ? '' : 's'
        } to Vested without applying contribution credit.`
      })
    }

    revalidatePaymentViews()

    if (updatedMembers.count === 0) {
      return {
        message: 'No selected awaiting publication members were found.'
      }
    }

    return {
      message: `${updatedMembers.count} awaiting publication member${updatedMembers.count === 1 ? '' : 's'} moved to Vested. No contribution credit was applied.`
    }
  } catch (error) {
    return renderError(error)
  }
}

export const makeMembersVestedAction = async (
  _prevState: { message: string },
  formData: FormData
): Promise<{ message: string }> => {
  const user = await assertAdminUser()

  try {
    const memberIds = getStringFormValues(formData, 'memberIds')

    if (memberIds.length === 0) {
      throw new Error('Select at least one delinquent member.')
    }

    const updatedCount = await db.$transaction(async tx => {
      const delinquentMembers = await tx.member.findMany({
        select: {
          associationCode: true,
          id: true,
          memberMatriculationNumber: true
        },
        where: {
          id: {
            in: memberIds
          },
          memberStatus: memberStatus.Delinquent
        }
      })

      if (delinquentMembers.length === 0) {
        return 0
      }

      const delinquentMemberIds = delinquentMembers.map(member => member.id)

      const updatedMembers = await tx.member.updateMany({
        data: {
          memberStatus: memberStatus.Vested,
          vestedAt: new Date()
        },
        where: {
          id: {
            in: delinquentMemberIds
          },
          memberStatus: memberStatus.Delinquent
        }
      })

      await Promise.all(
        delinquentMembers.map(member =>
          tx.associationContributionCredit.upsert({
            create: {
              amountCredited: contributionCreditPerVestedMember,
              associationCode: member.associationCode,
              memberMatriculationNumber: member.memberMatriculationNumber
            },
            update: {
              amountCredited: contributionCreditPerVestedMember,
              associationCode: member.associationCode
            },
            where: {
              memberMatriculationNumber: member.memberMatriculationNumber
            }
          })
        )
      )

      return updatedMembers.count
    })

    if (updatedCount > 0) {
      await recordDashboardActivity({
        action: 'members_moved_to_vested',
        actorClerkId: user.id,
        dashboardScope: dashboardActivityScopes.admin,
        entityType: 'member',
        summary: `Moved ${updatedCount} delinquent member${updatedCount === 1 ? '' : 's'} to Vested.`
      })
    }

    revalidatePaymentViews()

    if (updatedCount === 0) {
      return {
        message: 'No selected delinquent members were found.'
      }
    }

    return {
      message: `${updatedCount} delinquent member${updatedCount === 1 ? '' : 's'} moved to Vested.`
    }
  } catch (error) {
    return renderError(error)
  }
}

const resetPaymentAlert = async (alertType: string): Promise<void> => {
  const user = await assertAdminUser()

  const resetAt = new Date()

  await db.$executeRaw`
    INSERT INTO "PaymentAlertReset" ("id", "alertType", "resetAt", "updatedAt")
    VALUES (${randomUUID()}, ${alertType}, ${resetAt}, ${resetAt})
    ON CONFLICT ("alertType")
    DO UPDATE SET "resetAt" = ${resetAt}, "updatedAt" = ${resetAt}
  `

  await recordDashboardActivity({
    action: 'payment_alert_reset',
    actorClerkId: user.id,
    dashboardScope: dashboardActivityScopes.admin,
    entityType: 'payment',
    summary: `Reset ${alertType} payment alert.`
  })

  revalidatePaymentViews()
}

export const resetContributionPaymentAlertAction = async (): Promise<void> => {
  await resetPaymentAlert(contributionPaymentAlertType)
}

export const resetRegistrationPaymentAlertAction = async (): Promise<void> => {
  await resetPaymentAlert(registrationPaymentAlertType)
}

export const fetchSingleMemberDetails = async (memberId: string) => {
  const user = await getAuthUser()

  const member = await db.member.findUnique({
    where: {
      id: memberId,
      clerkId: user.id
    }
  })

  if (!member) redirect('/all-members')

  return member
}

export const fetchSingleMemberDetailsAdmin = async (memberId: string) => {
  await assertAdminUser()

  const member = await db.member.findUnique({
    where: {
      id: memberId

      // clerkId: user?.id
    }
  })

  if (!member) redirect('/admin-members')

  return member
}

export const updateMemberDetailsAction = async (prevState: any, formData: FormData) => {
  const user = await getAuthUser()

  try {
    const memberId = formData.get('id') as string
    const rawData = Object.fromEntries(formData)
    const validatedFields = validateWithZodSchema(memberSchema, rawData)

    const currentMember = await db.member.findUnique({
      where: {
        id: memberId
      },
      select: {
        associationCode: true,
        firstName: true,
        lastAndMiddleNames: true,
        memberMatriculationNumber: true,
        memberStatus: true
      }
    })

    const updatedMember = await db.member.update({
      where: {
        id: memberId
      },
      data: {
        ...validatedFields,
        ...(currentMember
          ? getManualVestedAtUpdateData({
              nextStatus: validatedFields.memberStatus,
              previousStatus: currentMember.memberStatus
            })
          : {})
      }
    })

    if (currentMember) {
      await syncPendingRegistrationUsage({
        associationCode: validatedFields.associationCode,
        memberMatriculationNumber: currentMember.memberMatriculationNumber,
        nextStatus: validatedFields.memberStatus,
        previousMatriculationNumber: currentMember.memberMatriculationNumber,
        previousStatus: currentMember.memberStatus
      })

      await syncVestedContributionCredit({
        associationCode: validatedFields.associationCode,
        memberMatriculationNumber: currentMember.memberMatriculationNumber,
        nextStatus: validatedFields.memberStatus,
        previousMatriculationNumber: currentMember.memberMatriculationNumber,
        previousStatus: currentMember.memberStatus
      })
    }

    await recordDashboardActivity({
      action: 'member_updated',
      actorClerkId: user.id,
      associationCode: updatedMember.associationCode,
      dashboardScope: dashboardActivityScopes.association,
      entityId: updatedMember.id,
      entityType: 'member',
      summary: `Updated ${getMemberActivityLabel(updatedMember)}. Status: ${updatedMember.memberStatus}.`
    })

    revalidatePath(`all-members/${memberId}/edit`)
    revalidatePaymentViews()

    // return { message: `Member Details Updated Successfully` }
  } catch (error) {
    return renderError(error)
  }

  redirect('/all-members')
}

export const updateMemberDetailsActionAdmin = async (prevState: any, formData: FormData) => {
  const user = await assertAdminUser()

  try {
    const memberId = formData.get('id') as string
    const rawData = Object.fromEntries(formData)
    const validatedFields = validateWithZodSchema(memberSchema, rawData)

    const currentMember = await db.member.findUnique({
      where: {
        id: memberId
      },
      select: {
        associationCode: true,
        firstName: true,
        lastAndMiddleNames: true,
        memberMatriculationNumber: true,
        memberStatus: true
      }
    })

    const updatedMember = await db.member.update({
      where: {
        id: memberId
      },
      data: {
        ...validatedFields,
        ...(currentMember
          ? getManualVestedAtUpdateData({
              nextStatus: validatedFields.memberStatus,
              previousStatus: currentMember.memberStatus
            })
          : {})
      }
    })

    if (currentMember) {
      await syncPendingRegistrationUsage({
        associationCode: validatedFields.associationCode,
        memberMatriculationNumber: currentMember.memberMatriculationNumber,
        nextStatus: validatedFields.memberStatus,
        previousMatriculationNumber: currentMember.memberMatriculationNumber,
        previousStatus: currentMember.memberStatus
      })

      await syncVestedContributionCredit({
        associationCode: validatedFields.associationCode,
        memberMatriculationNumber: currentMember.memberMatriculationNumber,
        nextStatus: validatedFields.memberStatus,
        previousMatriculationNumber: currentMember.memberMatriculationNumber,
        previousStatus: currentMember.memberStatus
      })
    }

    await recordDashboardActivity({
      action: 'member_updated',
      actorClerkId: user.id,
      associationCode: updatedMember.associationCode,
      dashboardScope: dashboardActivityScopes.admin,
      entityId: updatedMember.id,
      entityType: 'member',
      summary: `Updated ${getMemberActivityLabel(updatedMember)}. Status: ${updatedMember.memberStatus}.`
    })

    revalidatePath(`admin-all-members/${memberId}/edit`)
    revalidatePaymentViews()

    // return { message: `Member Details Updated Successfully` }
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return {
          message:
            'A member with the same first, middle, and last names, date of birth and recommendation already exists, please check your entries or contact admin for assistance.'
        }
      }
    }

    return renderError(error)
  }

  redirect('/admin-all-members')
}

export const vestEligibleAwaitingPublicationMembersAction = async (): Promise<{ message: string }> => {
  const user = await assertAdminUser()

  try {
    const cutoffAt = getAwaitingPublicationVestingCutoff()

    const updatedMembers = await db.member.updateMany({
      data: {
        memberStatus: memberStatus.Vested
      },
      where: {
        createdAt: {
          lte: cutoffAt
        },
        memberStatus: memberStatus.Awaiting
      }
    })

    if (updatedMembers.count > 0) {
      await recordDashboardActivity({
        action: 'eligible_members_vested',
        actorClerkId: user.id,
        dashboardScope: dashboardActivityScopes.admin,
        entityType: 'member',
        summary: `Moved ${updatedMembers.count} eligible awaiting publication member${
          updatedMembers.count === 1 ? '' : 's'
        } to Vested.`
      })
    }

    revalidatePaymentViews()

    if (updatedMembers.count === 0) {
      return {
        message: `No awaiting publication members with at least ${awaitingPublicationVestingLongevityDays} days of longevity were found.`
      }
    }

    return {
      message: `${updatedMembers.count} member${updatedMembers.count === 1 ? '' : 's'} moved to Vested. No contribution credit was applied.`
    }
  } catch (error) {
    return renderError(error)
  }
}

const addNameChangeAssociationNames = async <
  T extends {
    associationCode: string
    member?: {
      associationName?: string | null
    } | null
  }
>(
  requests: T[]
) => {
  const associationCodes = [...new Set(requests.map(request => request.associationCode))]

  if (associationCodes.length === 0) {
    return requests.map(request => ({
      ...request,
      associationName: request.member?.associationName?.trim() || null
    }))
  }

  const profiles = await db.profile.findMany({
    select: {
      associationCode: true,
      associationName: true
    },
    where: {
      associationCode: {
        in: associationCodes
      }
    }
  })

  const associationNamesByCode = new Map(profiles.map(profile => [profile.associationCode, profile.associationName]))

  return requests.map(request => ({
    ...request,
    associationName:
      associationNamesByCode.get(request.associationCode) ?? request.member?.associationName?.trim() ?? null
  }))
}

export const fetchNameChangeDocumentationPageAction = async () => {
  const user = await getAuthUser()

  const members = await db.member.findMany({
    orderBy: [{ associationCode: 'asc' }, { lastAndMiddleNames: 'asc' }, { firstName: 'asc' }],
    select: {
      associationCode: true,
      associationName: true,
      firstName: true,
      id: true,
      lastAndMiddleNames: true,
      memberMatriculationNumber: true
    },
    where: { clerkId: user.id }
  })

  const requests = await db.nameChangeRequest
    .findMany({
      include: {
        member: {
          select: {
            associationCode: true,
            associationName: true,
            firstName: true,
            lastAndMiddleNames: true,
            memberMatriculationNumber: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      where: { clerkId: user.id }
    })
    .catch(error => {
      console.error('Unable to load name change requests', error)

      return []
    })

  return { currentUserId: user.id, members, requests: await addNameChangeAssociationNames(requests) }
}

export const fetchAdminNameChangeRequestsAction = async () => {
  const user = await assertAdminUser()

  const requests = await db.nameChangeRequest
    .findMany({
      include: {
        member: {
          select: {
            associationCode: true,
            associationName: true,
            firstName: true,
            lastAndMiddleNames: true,
            memberMatriculationNumber: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    .then(addNameChangeAssociationNames)
    .catch(error => {
      console.error('Unable to load admin name change requests', error)

      return []
    })

  return { currentUserId: user.id, requests }
}

export const submitNameChangeRequestAction = async (
  prevState: any,
  formData: FormData
): Promise<{ message: string }> => {
  const user = await getAuthUser()

  try {
    const memberId = String(formData.get('memberId') ?? '').trim()
    const requestedFirstName = getUppercaseFormName(formData, 'requestedFirstName')
    const requestedLastAndMiddleNames = getUppercaseFormName(formData, 'requestedLastAndMiddleNames')

    if (!memberId) {
      throw new Error('Select a member before submitting the name change.')
    }

    const member = await db.member.findUnique({
      select: {
        associationCode: true,
        clerkId: true,
        firstName: true,
        id: true,
        lastAndMiddleNames: true,
        memberMatriculationNumber: true
      },
      where: {
        id: memberId
      }
    })

    if (!member) {
      throw new Error('Member not found.')
    }

    const isAdminUser = user.id === process.env.ADMIN_USER_ID

    if (!isAdminUser && member.clerkId !== user.id) {
      throw new Error('You can only request name changes for members from your own account.')
    }

    if (member.firstName === requestedFirstName && member.lastAndMiddleNames === requestedLastAndMiddleNames) {
      throw new Error('Enter a new name before submitting the request.')
    }

    const pendingRequest = await db.nameChangeRequest.findFirst({
      select: {
        id: true
      },
      where: {
        memberId: member.id,
        status: {
          in: ['submitted', 'documentation_requested']
        }
      }
    })

    if (pendingRequest) {
      throw new Error('This member already has a name change request waiting for admin review.')
    }

    const request = await db.nameChangeRequest.create({
      data: {
        associationCode: member.associationCode,
        clerkId: member.clerkId,
        currentFirstName: member.firstName,
        currentLastAndMiddleNames: member.lastAndMiddleNames,
        documentRequired: false,
        id: randomUUID(),
        memberId: member.id,
        reason: 'typo_or_error',
        requestedFirstName,
        requestedLastAndMiddleNames,
        status: 'submitted'
      }
    })

    await recordDashboardActivity({
      action: 'name_change_requested',
      actorClerkId: user.id,
      associationCode: member.associationCode,
      dashboardScope: isAdminUser ? dashboardActivityScopes.admin : dashboardActivityScopes.association,
      entityId: request.id,
      entityType: 'name_change',
      summary: `Requested name change for ${getMemberActivityLabel(member)} to ${requestedFirstName} ${requestedLastAndMiddleNames}.`
    })

    revalidateNameChangeDocumentationViews()

    return { message: 'Name change request submitted for admin review' }
  } catch (error) {
    return renderError(error)
  }
}

export const uploadNameChangeDocumentationAction = async (
  prevState: any,
  formData: FormData
): Promise<{ message: string }> => {
  const user = await getAuthUser()

  try {
    const requestId = getRequiredFormValue(formData, 'requestId')
    const file = formData.get('documentFile')

    if (!(file instanceof File) || file.size <= 0) {
      throw new Error('Please choose the requested documentation.')
    }

    if (file.size > maxDocumentationFileSize) {
      throw new Error('The file is too large. Please upload a file that is 20 MB or smaller.')
    }

    if (!isAllowedDeceasedMemberDocumentFile(file)) {
      throw new Error('Please upload a PDF, JPG, PNG, WEBP, HEIC, or HEIF file.')
    }

    const request = await db.nameChangeRequest.findUnique({
      select: {
        associationCode: true,
        cloudinaryDeliveryType: true,
        cloudinaryPublicId: true,
        cloudinaryResourceType: true,
        clerkId: true,
        id: true,
        status: true
      },
      where: {
        id: requestId
      }
    })

    if (!request) {
      throw new Error('Name change request not found.')
    }

    const isAdminUser = user.id === process.env.ADMIN_USER_ID

    if (!isAdminUser && request.clerkId !== user.id) {
      throw new Error('You can only upload documentation for name changes from your own account.')
    }

    if (request.status !== 'documentation_requested') {
      throw new Error('Documentation has not been requested for this name change.')
    }

    const safeFileName = getSafeUploadedFileName(file, 'Official name change document')
    const mimeType = file.type || 'application/octet-stream'
    const fileBuffer = Buffer.from(await file.arrayBuffer())

    const cloudinaryDocument = await uploadDocumentToCloudinary({
      fileBuffer,
      fileName: safeFileName,
      folder: getNameChangeDocumentCloudinaryFolder(request.id),
      mimeType
    })

    try {
      await db.nameChangeRequest.update({
        data: {
          documentRequired: true,
          fileName: safeFileName,
          mimeType,
          rejectionReason: null,
          reviewedAt: null,
          reviewedBy: null,
          status: 'submitted',
          ...getCloudinaryDocumentData(cloudinaryDocument)
        },
        where: {
          id: request.id
        }
      })
    } catch (error) {
      await deleteCloudinaryDocumentWithoutBlocking({
        cloudinaryDeliveryType: cloudinaryDocument.deliveryType,
        cloudinaryPublicId: cloudinaryDocument.publicId,
        cloudinaryResourceType: cloudinaryDocument.resourceType
      })

      throw error
    }

    await deleteCloudinaryDocumentWithoutBlocking(request)

    await recordDashboardActivity({
      action: 'name_change_document_uploaded',
      actorClerkId: user.id,
      associationCode: request.associationCode,
      dashboardScope: isAdminUser ? dashboardActivityScopes.admin : dashboardActivityScopes.association,
      entityId: request.id,
      entityType: 'name_change',
      summary: `Uploaded documentation for name change request.`
    })

    revalidateNameChangeDocumentationViews()

    return { message: 'Name change documentation uploaded successfully' }
  } catch (error) {
    return renderError(error)
  }
}

export const reviewNameChangeRequestAction = async (
  prevState: any,
  formData: FormData
): Promise<{ message: string }> => {
  const user = await assertAdminUser()

  try {
    const requestId = getRequiredFormValue(formData, 'requestId')
    const status = getRequiredFormValue(formData, 'status')
    const rejectionReason = String(formData.get('rejectionReason') ?? '').trim()

    if (!isNameChangeRequestStatus(status) || status === 'submitted') {
      throw new Error('Select a valid review decision.')
    }

    if (['documentation_requested', 'rejected'].includes(status) && !rejectionReason) {
      throw new Error('Add a note before requesting documentation or rejecting the name change.')
    }

    const request = await db.nameChangeRequest.findUnique({
      where: {
        id: requestId
      },
      select: {
        associationCode: true,
        cloudinaryPublicId: true,
        documentRequired: true,
        fileData: true,
        id: true,
        member: {
          select: {
            firstName: true,
            lastAndMiddleNames: true,
            memberMatriculationNumber: true
          }
        },
        memberId: true,
        requestedFirstName: true,
        requestedLastAndMiddleNames: true,
        status: true
      }
    })

    if (!request) {
      throw new Error('Name change request not found.')
    }

    if (request.status !== 'submitted') {
      throw new Error('This name change request has already been reviewed.')
    }

    if (status === 'approved' && request.documentRequired && !hasUploadedDocument(request)) {
      throw new Error('Documentation is required before approving this name change.')
    }

    if (status === 'documentation_requested') {
      await db.nameChangeRequest.update({
        data: {
          documentRequired: true,
          rejectionReason,
          reviewedAt: new Date(),
          reviewedBy: user.id,
          status
        },
        where: {
          id: request.id
        }
      })

      await recordDashboardActivity({
        action: 'name_change_documentation_requested',
        actorClerkId: user.id,
        associationCode: request.associationCode,
        dashboardScope: dashboardActivityScopes.admin,
        entityId: request.id,
        entityType: 'name_change',
        summary: `Requested documentation for ${getMemberActivityLabel(request.member)} name change.`
      })

      revalidateNameChangeDocumentationViews()

      return { message: 'Name change documentation requested' }
    }

    if (status === 'approved') {
      await db.$transaction([
        db.member.update({
          data: {
            firstName: request.requestedFirstName,
            lastAndMiddleNames: request.requestedLastAndMiddleNames
          },
          where: {
            id: request.memberId
          }
        }),
        db.nameChangeRequest.update({
          data: {
            rejectionReason: null,
            reviewedAt: new Date(),
            reviewedBy: user.id,
            status
          },
          where: {
            id: request.id
          }
        })
      ])
    } else {
      await db.nameChangeRequest.update({
        data: {
          rejectionReason,
          reviewedAt: new Date(),
          reviewedBy: user.id,
          status
        },
        where: {
          id: request.id
        }
      })
    }

    await recordDashboardActivity({
      action: `name_change_${status}`,
      actorClerkId: user.id,
      associationCode: request.associationCode,
      dashboardScope: dashboardActivityScopes.admin,
      entityId: request.id,
      entityType: 'name_change',
      summary:
        status === 'approved'
          ? `Approved name change for ${getMemberActivityLabel(request.member)} to ${request.requestedFirstName} ${request.requestedLastAndMiddleNames}.`
          : `Rejected name change for ${getMemberActivityLabel(request.member)}.${rejectionReason ? ` Reason: ${rejectionReason}` : ''}`
    })

    revalidatePaymentViews()
    revalidateNameChangeDocumentationViews()

    return { message: `Name change request ${status}` }
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return { message: 'A member with these identifying details already exists.' }
    }

    return renderError(error)
  }
}

export const deleteNameChangeRequestAction = async (prevState: { requestId: string }) => {
  const user = await getAuthUser()
  const { requestId } = prevState

  try {
    const request = await db.nameChangeRequest.findUnique({
      select: {
        associationCode: true,
        cloudinaryDeliveryType: true,
        cloudinaryPublicId: true,
        cloudinaryResourceType: true,
        clerkId: true,
        id: true
      },
      where: {
        id: requestId
      }
    })

    if (!request) {
      throw new Error('Name change request not found.')
    }

    if (user.id === process.env.ADMIN_USER_ID) {
      throw new Error('Only the delegate who initiated this name change request can remove it.')
    }

    if (request.clerkId !== user.id) {
      throw new Error('Only the delegate who initiated this name change request can remove it.')
    }

    await deleteCloudinaryDocument({
      deliveryType: request.cloudinaryDeliveryType,
      publicId: request.cloudinaryPublicId,
      resourceType: request.cloudinaryResourceType
    })

    await db.nameChangeRequest.delete({
      where: {
        id: request.id
      }
    })

    await recordDashboardActivity({
      action: 'name_change_deleted',
      actorClerkId: user.id,
      associationCode: request.associationCode,
      dashboardScope: dashboardActivityScopes.association,
      entityId: request.id,
      entityType: 'name_change',
      summary: 'Removed a name change request.'
    })

    revalidateNameChangeDocumentationViews()

    return { message: 'Name change request removed successfully' }
  } catch (error) {
    return renderError(error)
  }
}

const openMemberTransferRequestStatuses: MemberTransferRequestStatus[] = [
  'admin_initiated',
  'receiving_delegate_pending',
  'initiating_delegate_approved',
  'receiving_delegate_approved'
]

const canCancelMemberTransferRequestStatus = (status: string) =>
  openMemberTransferRequestStatuses.includes(status as MemberTransferRequestStatus)

const getMemberTransferRequestInitiatorClerkId = (request: {
  initiatingClerkId: string
  receivingClerkId: string
  receivingReviewedBy?: string | null
  status: string
}) => {
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

const CANCELLED_MEMBER_TRANSFER_CARD_VISIBILITY_MS = 5 * 60 * 1000

const getVisibleMemberTransferRequestWhere = () => ({
  OR: [
    {
      status: {
        not: 'cancelled'
      }
    },
    {
      updatedAt: {
        gte: new Date(Date.now() - CANCELLED_MEMBER_TRANSFER_CARD_VISIBILITY_MS)
      }
    }
  ]
})

const getNextCancelledMemberTransferRefreshAt = (requests: { status: string; updatedAt: Date }[]) => {
  const nextRefreshAt = requests
    .filter(request => request.status === 'cancelled')
    .map(request => request.updatedAt.getTime() + CANCELLED_MEMBER_TRANSFER_CARD_VISIBILITY_MS)
    .filter(refreshAt => refreshAt > Date.now())
    .sort((firstRefreshAt, secondRefreshAt) => firstRefreshAt - secondRefreshAt)[0]

  return nextRefreshAt ? new Date(nextRefreshAt).toISOString() : null
}

const normalizeAssociationCode = (associationCode: string) => associationCode.trim().toUpperCase()

const getTransferredMemberMatriculationNumber = ({
  initiatingAssociationCode,
  memberMatriculationNumber,
  receivingAssociationCode
}: {
  initiatingAssociationCode: string
  memberMatriculationNumber: string
  receivingAssociationCode: string
}) => {
  const initiatingPrefix = `AS${initiatingAssociationCode}`

  if (!memberMatriculationNumber.startsWith(initiatingPrefix)) {
    throw new Error('This member matriculation number does not match the current association code.')
  }

  return `AS${receivingAssociationCode}${memberMatriculationNumber.slice(initiatingPrefix.length)}`
}

const memberTransferActionCopy: Record<
  AppLanguage,
  {
    adminApproved: string
    adminInitiated: string
    adminRejected: string
    adminRejectedReason: string
    alreadyCancelled: string
    alreadyInYourAssociation: string
    cancelled: string
    cancelledByInitiatingDelegateReason: string
    cancelledByReceivingDelegateReason: string
    cannotCancelApproved: string
    currentDelegateAssociationProfileNotFound: string
    currentDelegateOnlyInitiate: string
    currentDelegateOnlyRelease: string
    initiatingDelegateOnlyCancel: string
    delegateReviewAlreadyCompleted: string
    delegateReviewNotAvailable: string
    invalidAdminDecision: string
    invalidTransferDecision: string
    memberNoLongerInCurrentAssociation: string
    memberNotFound: string
    openRequest: string
    receivingDelegateAssociationNotFound: string
    receivingDelegateOnlyApprove: string
    receivingMustDiffer: string
    receivingProfileUnavailable: string
    releaseApproved: string
    releaseApprovedForReceivingReview: string
    releaseRejected: string
    receivingApprovalApproved: string
    receivingApprovalRequested: string
    transferRejected: string
    releaseSubmitted: string
    rejectReleaseReason: string
    rejectTransferReason: string
    requestNotFound: string
    transferNotReadyForAdmin: string
  }
> = {
  en: {
    adminApproved: 'Member transfer approved and completed.',
    adminInitiated: 'Admin transfer request sent to the current delegate for release approval.',
    adminRejected: 'Member transfer rejected by admin.',
    adminRejectedReason: 'SAGI admin rejected this transfer request.',
    alreadyCancelled: 'This member transfer request has already been cancelled.',
    alreadyInYourAssociation: 'This member is already in your delegate association.',
    cancelled: 'Member transfer request cancelled.',
    cancelledByInitiatingDelegateReason: 'Initiating delegate cancelled this transfer request.',
    cancelledByReceivingDelegateReason: 'Receiving delegate cancelled this transfer request.',
    cannotCancelApproved: 'This member transfer request can no longer be cancelled because SAGI admin has approved it.',
    currentDelegateAssociationProfileNotFound: 'Current delegate association profile was not found.',
    currentDelegateOnlyInitiate: 'Only the current delegate association can initiate this member transfer.',
    currentDelegateOnlyRelease: 'Only the current delegate can release this member.',
    initiatingDelegateOnlyCancel: 'Only the delegate who initiated this request can cancel it.',
    delegateReviewAlreadyCompleted: 'This transfer request has already been reviewed by the required delegate.',
    delegateReviewNotAvailable: 'This transfer request is not waiting for your delegate approval.',
    invalidAdminDecision: 'Select a valid admin transfer decision.',
    invalidTransferDecision: 'Select a valid transfer decision.',
    memberNoLongerInCurrentAssociation: 'This member no longer belongs to the current delegate association.',
    memberNotFound: 'Member not found.',
    openRequest: 'This member already has a member transfer request in progress.',
    receivingDelegateAssociationNotFound: 'Receiving delegate association profile was not found.',
    receivingDelegateOnlyApprove: 'Only the receiving delegate can approve this transfer.',
    receivingMustDiffer: 'The receiving association must be different from your current association.',
    receivingProfileUnavailable: 'Receiving delegate association profile is no longer available.',
    releaseApproved: 'Member release approved and sent to SAGI admin.',
    releaseApprovedForReceivingReview: 'Member release approved and sent to the receiving delegate.',
    releaseRejected: 'Member transfer release rejected.',
    receivingApprovalApproved: 'Receiving delegate approved the transfer and sent it to SAGI admin.',
    receivingApprovalRequested: 'Member transfer request sent to the receiving delegate for approval.',
    transferRejected: 'Member transfer rejected.',
    releaseSubmitted: 'Member transfer release request sent to the current delegate.',
    rejectReleaseReason: 'Give the reason to reject the release.',
    rejectTransferReason: 'Give the reason to reject the transfer.',
    requestNotFound: 'Member transfer request not found.',
    transferNotReadyForAdmin: 'This transfer is not ready for admin review until both delegates approve it.'
  },
  fr: {
    adminApproved: 'Transfert de membre approuvé et terminé.',
    adminInitiated: 'Demande de transfert admin envoyée au délégué actuel pour approbation de libération.',
    adminRejected: "Transfert de membre rejeté par l'admin.",
    adminRejectedReason: "L'admin SAGI a rejeté cette demande de transfert.",
    alreadyCancelled: 'Cette demande de transfert de membre a déjà été annulée.',
    alreadyInYourAssociation: 'Ce membre est déjà dans votre association déléguée.',
    cancelled: 'Demande de transfert de membre annulée.',
    cancelledByInitiatingDelegateReason: 'Le délégué initiateur a annulé cette demande de transfert.',
    cancelledByReceivingDelegateReason: 'Le délégué destinataire a annulé cette demande de transfert.',
    cannotCancelApproved:
      "Cette demande de transfert de membre ne peut plus être annulée, car l'admin SAGI l'a approuvée.",
    currentDelegateAssociationProfileNotFound: "Le profil de l'association déléguée actuelle est introuvable.",
    currentDelegateOnlyInitiate: "Seule l'association déléguée actuelle peut initier ce transfert de membre.",
    currentDelegateOnlyRelease: 'Seul le délégué actuel peut libérer ce membre.',
    initiatingDelegateOnlyCancel: 'Seul le délégué qui a initié cette demande peut l’annuler.',
    delegateReviewAlreadyCompleted: 'Cette demande a déjà été révisée par le délégué requis.',
    delegateReviewNotAvailable: "Cette demande de transfert n'attend pas votre approbation de délégué.",
    invalidAdminDecision: 'Sélectionnez une décision admin valide pour ce transfert.',
    invalidTransferDecision: 'Sélectionnez une décision de transfert valide.',
    memberNoLongerInCurrentAssociation: "Ce membre n'appartient plus à l'association déléguée actuelle.",
    memberNotFound: 'Membre introuvable.',
    openRequest: 'Ce membre a déjà une demande de transfert en cours.',
    receivingDelegateAssociationNotFound: "Le profil de l'association déléguée destinataire est introuvable.",
    receivingDelegateOnlyApprove: 'Seul le délégué destinataire peut approuver ce transfert.',
    receivingMustDiffer: "L'association destinataire doit être différente de votre association actuelle.",
    receivingProfileUnavailable: "Le profil de l'association déléguée destinataire n'est plus disponible.",
    releaseApproved: "Libération du membre approuvée et envoyée à l'admin SAGI.",
    releaseApprovedForReceivingReview: 'Libération du membre approuvée et envoyée au délégué destinataire.',
    releaseRejected: 'Libération du membre rejetée.',
    receivingApprovalApproved: "Le délégué destinataire a approuvé le transfert et l'a envoyé à l'admin SAGI.",
    receivingApprovalRequested: 'Demande de transfert envoyée au délégué destinataire pour approbation.',
    transferRejected: 'Transfert de membre rejeté.',
    releaseSubmitted: 'Demande de libération du membre envoyée au délégué actuel.',
    rejectReleaseReason: 'Indiquez la raison du rejet de la libération.',
    rejectTransferReason: 'Indiquez la raison du rejet du transfert.',
    requestNotFound: 'Demande de transfert de membre introuvable.',
    transferNotReadyForAdmin:
      "Ce transfert n'est pas prêt pour la revue admin tant que les deux délégués ne l'ont pas approuvé."
  }
}

const addMemberTransferAssociationNames = async <
  T extends {
    initiatingAssociationCode: string
    receivingAssociationCode: string
  }
>(
  requests: T[]
) => {
  const associationCodes = [
    ...new Set(requests.flatMap(request => [request.initiatingAssociationCode, request.receivingAssociationCode]))
  ]

  if (associationCodes.length === 0) return requests

  const profiles = await db.profile.findMany({
    select: {
      associationCode: true,
      associationName: true
    },
    where: {
      associationCode: {
        in: associationCodes
      }
    }
  })

  const associationNamesByCode = new Map(profiles.map(profile => [profile.associationCode, profile.associationName]))

  return requests.map(request => ({
    ...request,
    initiatingAssociationName: associationNamesByCode.get(request.initiatingAssociationCode) ?? null,
    receivingAssociationName: associationNamesByCode.get(request.receivingAssociationCode) ?? null
  }))
}

export const fetchMemberTransferPageAction = async () => {
  noStore()

  const profile = await fetchProfile()
  const visibleMemberTransferRequestWhere = getVisibleMemberTransferRequestWhere()

  const [members, currentMembers, receivingAssociations, requests] = await Promise.all([
    db.member.findMany({
      orderBy: [{ lastAndMiddleNames: 'asc' }, { firstName: 'asc' }],
      select: {
        associationCode: true,
        associationName: true,
        firstName: true,
        id: true,
        lastAndMiddleNames: true,
        memberMatriculationNumber: true,
        memberStatus: true
      },
      where: {
        associationCode: {
          not: profile.associationCode
        },
        clerkId: {
          not: profile.clerkId
        }
      }
    }),
    db.member.findMany({
      orderBy: [{ lastAndMiddleNames: 'asc' }, { firstName: 'asc' }],
      select: {
        associationCode: true,
        associationName: true,
        firstName: true,
        id: true,
        lastAndMiddleNames: true,
        memberMatriculationNumber: true,
        memberStatus: true
      },
      where: {
        associationCode: profile.associationCode,
        clerkId: profile.clerkId
      }
    }),
    db.profile.findMany({
      orderBy: {
        associationCode: 'asc'
      },
      select: {
        associationCode: true,
        associationName: true
      },
      where: {
        associationCode: {
          not: profile.associationCode
        }
      }
    }),
    db.memberTransferRequest.findMany({
      include: {
        member: {
          select: {
            associationCode: true,
            associationName: true,
            firstName: true,
            lastAndMiddleNames: true,
            memberMatriculationNumber: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      where: {
        AND: [
          {
            OR: [{ initiatingClerkId: profile.clerkId }, { receivingClerkId: profile.clerkId }]
          },
          visibleMemberTransferRequestWhere
        ]
      }
    })
  ])

  return {
    currentMembers,
    members,
    nextCancelledTransferRefreshAt: getNextCancelledMemberTransferRefreshAt(requests),
    profile,
    receivingAssociations,
    requests: await addMemberTransferAssociationNames(requests)
  }
}

export const fetchAdminMemberTransferPageAction = async () => {
  noStore()
  await assertAdminUser()

  const [members, receivingAssociations, requests] = await Promise.all([
    db.member.findMany({
      orderBy: [{ lastAndMiddleNames: 'asc' }, { firstName: 'asc' }],
      select: {
        associationCode: true,
        associationName: true,
        firstName: true,
        id: true,
        lastAndMiddleNames: true,
        memberMatriculationNumber: true,
        memberStatus: true
      }
    }),
    db.profile.findMany({
      orderBy: {
        associationCode: 'asc'
      },
      select: {
        associationCode: true,
        associationName: true
      }
    }),
    db.memberTransferRequest.findMany({
      include: {
        member: {
          select: {
            associationCode: true,
            associationName: true,
            clerkId: true,
            firstName: true,
            lastAndMiddleNames: true,
            memberMatriculationNumber: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      where: getVisibleMemberTransferRequestWhere()
    })
  ])

  return {
    members,
    nextCancelledTransferRefreshAt: getNextCancelledMemberTransferRefreshAt(requests),
    receivingAssociations,
    requests: await addMemberTransferAssociationNames(requests)
  }
}

export const submitAdminMemberTransferRequestAction = async (
  prevState: any,
  formData: FormData
): Promise<{ message: string }> => {
  const copy = memberTransferActionCopy[await getServerActionLanguage()]

  try {
    const user = await assertAdminUser()

    const memberId = getRequiredFormValue(formData, 'memberId')

    const receivingAssociationCode = normalizeAssociationCode(
      getRequiredFormValue(formData, 'receivingAssociationCode')
    )

    const [member, receivingAssociation] = await Promise.all([
      db.member.findUnique({
        select: {
          associationCode: true,
          clerkId: true,
          firstName: true,
          id: true,
          lastAndMiddleNames: true,
          memberMatriculationNumber: true,
          memberStatus: true
        },
        where: {
          id: memberId
        }
      }),
      db.profile.findUnique({
        select: {
          associationCode: true,
          clerkId: true
        },
        where: {
          associationCode: receivingAssociationCode
        }
      })
    ])

    if (!member) {
      throw new Error(copy.memberNotFound)
    }

    const initiatingAssociationCode = normalizeAssociationCode(member.associationCode)

    if (receivingAssociationCode === initiatingAssociationCode) {
      throw new Error(copy.receivingMustDiffer)
    }

    const initiatingAssociation = await db.profile.findUnique({
      select: {
        associationCode: true,
        clerkId: true
      },
      where: {
        associationCode: initiatingAssociationCode
      }
    })

    if (!initiatingAssociation) {
      throw new Error(copy.currentDelegateAssociationProfileNotFound)
    }

    if (!receivingAssociation) {
      throw new Error(copy.receivingDelegateAssociationNotFound)
    }

    const openRequest = await db.memberTransferRequest.findFirst({
      select: {
        id: true
      },
      where: {
        memberId: member.id,
        status: {
          in: openMemberTransferRequestStatuses
        }
      }
    })

    if (openRequest) {
      throw new Error(copy.openRequest)
    }

    const request = await db.memberTransferRequest.create({
      data: {
        currentFirstName: member.firstName,
        currentLastAndMiddleNames: member.lastAndMiddleNames,
        initiatingAssociationCode: initiatingAssociation.associationCode,
        initiatingClerkId: initiatingAssociation.clerkId,
        memberId: member.id,
        memberMatriculationNumber: member.memberMatriculationNumber,
        receivingAssociationCode: receivingAssociation.associationCode,
        receivingClerkId: receivingAssociation.clerkId,
        status: 'admin_initiated'
      }
    })

    await recordDashboardActivity({
      action: 'member_transfer_requested',
      actorClerkId: user.id,
      associationCode: member.associationCode,
      dashboardScope: dashboardActivityScopes.admin,
      entityId: request.id,
      entityType: 'member_transfer',
      summary: `Started transfer for ${getMemberActivityLabel(member)} from ${
        initiatingAssociation.associationCode
      } to ${receivingAssociation.associationCode}.`
    })

    revalidateMemberTransferViews()

    return { message: copy.adminInitiated }
  } catch (error) {
    return renderError(error)
  }
}

export const submitMemberTransferRequestAction = async (
  prevState: any,
  formData: FormData
): Promise<{ message: string }> => {
  const copy = memberTransferActionCopy[await getServerActionLanguage()]

  try {
    const memberId = getRequiredFormValue(formData, 'memberId')
    const receivingAssociation = await fetchProfile()

    const member = await db.member.findUnique({
      select: {
        associationCode: true,
        clerkId: true,
        firstName: true,
        id: true,
        lastAndMiddleNames: true,
        memberMatriculationNumber: true,
        memberStatus: true
      },
      where: {
        id: memberId
      }
    })

    if (!member) {
      throw new Error(copy.memberNotFound)
    }

    const memberAssociationCode = normalizeAssociationCode(member.associationCode)
    const receivingAssociationCode = normalizeAssociationCode(receivingAssociation.associationCode)

    if (memberAssociationCode === receivingAssociationCode) {
      throw new Error(copy.alreadyInYourAssociation)
    }

    const releasingAssociation = await db.profile.findUnique({
      select: {
        associationCode: true,
        clerkId: true
      },
      where: {
        associationCode: memberAssociationCode
      }
    })

    if (!releasingAssociation) {
      throw new Error(copy.currentDelegateAssociationProfileNotFound)
    }

    const openRequest = await db.memberTransferRequest.findFirst({
      select: {
        id: true
      },
      where: {
        memberId: member.id,
        status: {
          in: openMemberTransferRequestStatuses
        }
      }
    })

    if (openRequest) {
      throw new Error(copy.openRequest)
    }

    const request = await db.memberTransferRequest.create({
      data: {
        currentFirstName: member.firstName,
        currentLastAndMiddleNames: member.lastAndMiddleNames,
        initiatingAssociationCode: releasingAssociation.associationCode,
        initiatingClerkId: releasingAssociation.clerkId,
        memberId: member.id,
        memberMatriculationNumber: member.memberMatriculationNumber,
        receivingAssociationCode: receivingAssociation.associationCode,
        receivingClerkId: receivingAssociation.clerkId,
        status: 'receiving_delegate_pending'
      }
    })

    await recordDashboardActivity({
      action: 'member_transfer_requested',
      actorClerkId: receivingAssociation.clerkId,
      associationCode: receivingAssociation.associationCode,
      dashboardScope: dashboardActivityScopes.association,
      entityId: request.id,
      entityType: 'member_transfer',
      summary: `Requested transfer for ${getMemberActivityLabel(member)} from ${
        releasingAssociation.associationCode
      } to ${receivingAssociation.associationCode}.`
    })

    revalidateMemberTransferViews()

    return { message: copy.releaseSubmitted }
  } catch (error) {
    return renderError(error)
  }
}

export const submitOutgoingMemberTransferRequestAction = async (
  prevState: any,
  formData: FormData
): Promise<{ message: string }> => {
  const copy = memberTransferActionCopy[await getServerActionLanguage()]

  try {
    const memberId = getRequiredFormValue(formData, 'memberId')

    const receivingAssociationCode = normalizeAssociationCode(
      getRequiredFormValue(formData, 'receivingAssociationCode')
    )

    const initiatingAssociation = await fetchProfile()
    const initiatingAssociationCode = normalizeAssociationCode(initiatingAssociation.associationCode)

    if (receivingAssociationCode === initiatingAssociationCode) {
      throw new Error(copy.receivingMustDiffer)
    }

    const [member, receivingAssociation] = await Promise.all([
      db.member.findUnique({
        select: {
          associationCode: true,
          clerkId: true,
          firstName: true,
          id: true,
          lastAndMiddleNames: true,
          memberMatriculationNumber: true,
          memberStatus: true
        },
        where: {
          id: memberId
        }
      }),
      db.profile.findUnique({
        select: {
          associationCode: true,
          clerkId: true
        },
        where: {
          associationCode: receivingAssociationCode
        }
      })
    ])

    if (!member) {
      throw new Error(copy.memberNotFound)
    }

    if (
      normalizeAssociationCode(member.associationCode) !== initiatingAssociationCode ||
      member.clerkId !== initiatingAssociation.clerkId
    ) {
      throw new Error(copy.currentDelegateOnlyInitiate)
    }

    if (!receivingAssociation) {
      throw new Error(copy.receivingDelegateAssociationNotFound)
    }

    const openRequest = await db.memberTransferRequest.findFirst({
      select: {
        id: true
      },
      where: {
        memberId: member.id,
        status: {
          in: openMemberTransferRequestStatuses
        }
      }
    })

    if (openRequest) {
      throw new Error(copy.openRequest)
    }

    const request = await db.memberTransferRequest.create({
      data: {
        currentFirstName: member.firstName,
        currentLastAndMiddleNames: member.lastAndMiddleNames,
        initiatingAssociationCode: initiatingAssociation.associationCode,
        initiatingClerkId: initiatingAssociation.clerkId,
        memberId: member.id,
        memberMatriculationNumber: member.memberMatriculationNumber,
        receivingAssociationCode: receivingAssociation.associationCode,
        receivingClerkId: receivingAssociation.clerkId,
        status: 'initiating_delegate_approved'
      }
    })

    await recordDashboardActivity({
      action: 'member_transfer_requested',
      actorClerkId: initiatingAssociation.clerkId,
      associationCode: initiatingAssociation.associationCode,
      dashboardScope: dashboardActivityScopes.association,
      entityId: request.id,
      entityType: 'member_transfer',
      summary: `Requested outgoing transfer for ${getMemberActivityLabel(member)} from ${
        initiatingAssociation.associationCode
      } to ${receivingAssociation.associationCode}.`
    })

    revalidateMemberTransferViews()

    return { message: copy.receivingApprovalRequested }
  } catch (error) {
    return renderError(error)
  }
}

export const reviewIncomingMemberTransferRequestAction = async (
  prevState: any,
  formData: FormData
): Promise<{ message: string }> => {
  const copy = memberTransferActionCopy[await getServerActionLanguage()]
  const user = await getAuthUser()

  try {
    const requestId = getRequiredFormValue(formData, 'requestId')
    const status = getRequiredFormValue(formData, 'status')
    const rejectionReason = String(formData.get('rejectionReason') ?? '').trim()

    if (
      !isMemberTransferRequestStatus(status) ||
      !['initiating_delegate_approved', 'receiving_delegate_approved', 'receiving_delegate_rejected'].includes(status)
    ) {
      throw new Error(copy.invalidTransferDecision)
    }

    const request = await db.memberTransferRequest.findUnique({
      where: {
        id: requestId
      }
    })

    if (!request) {
      throw new Error(copy.requestNotFound)
    }

    const isCurrentDelegateReleaseReview =
      ['admin_initiated', 'receiving_delegate_pending'].includes(request.status) &&
      request.initiatingClerkId === user.id

    const isReceivingDelegateAcceptanceReview =
      request.status === 'initiating_delegate_approved' && request.receivingClerkId === user.id

    if (
      ['admin_initiated', 'receiving_delegate_pending'].includes(request.status) &&
      request.initiatingClerkId !== user.id
    ) {
      throw new Error(copy.currentDelegateOnlyRelease)
    }

    if (request.status === 'initiating_delegate_approved' && request.receivingClerkId !== user.id) {
      throw new Error(copy.receivingDelegateOnlyApprove)
    }

    if (!['admin_initiated', 'receiving_delegate_pending', 'initiating_delegate_approved'].includes(request.status)) {
      throw new Error(copy.delegateReviewAlreadyCompleted)
    }

    if (!isCurrentDelegateReleaseReview && !isReceivingDelegateAcceptanceReview) {
      throw new Error(copy.delegateReviewNotAvailable)
    }

    if (status === 'receiving_delegate_rejected' && !rejectionReason) {
      throw new Error(isCurrentDelegateReleaseReview ? copy.rejectReleaseReason : copy.rejectTransferReason)
    }

    const approvedStatus: MemberTransferRequestStatus = isCurrentDelegateReleaseReview
      ? request.status === 'admin_initiated'
        ? 'initiating_delegate_approved'
        : 'receiving_delegate_approved'
      : 'receiving_delegate_approved'

    if (status !== 'receiving_delegate_rejected' && status !== approvedStatus) {
      throw new Error(copy.invalidTransferDecision)
    }

    await db.memberTransferRequest.update({
      data: {
        receivingReviewedAt: new Date(),
        receivingReviewedBy: user.id,
        rejectionReason: status === 'receiving_delegate_rejected' ? rejectionReason : null,
        status
      },
      where: {
        id: request.id
      }
    })

    await recordDashboardActivity({
      action:
        status === 'receiving_delegate_rejected' ? 'member_transfer_rejected' : 'member_transfer_delegate_approved',
      actorClerkId: user.id,
      associationCode: isCurrentDelegateReleaseReview
        ? request.initiatingAssociationCode
        : request.receivingAssociationCode,
      dashboardScope: dashboardActivityScopes.association,
      entityId: request.id,
      entityType: 'member_transfer',
      summary: `${
        status === 'receiving_delegate_rejected' ? 'Rejected' : 'Approved'
      } transfer for ${getMemberActivityLabel({
        firstName: request.currentFirstName,
        lastAndMiddleNames: request.currentLastAndMiddleNames,
        memberMatriculationNumber: request.memberMatriculationNumber
      })} from ${request.initiatingAssociationCode} to ${request.receivingAssociationCode}.${
        rejectionReason ? ` Reason: ${rejectionReason}` : ''
      }`
    })

    revalidateMemberTransferViews()

    return {
      message:
        status === 'receiving_delegate_rejected'
          ? isCurrentDelegateReleaseReview
            ? copy.releaseRejected
            : copy.transferRejected
          : isCurrentDelegateReleaseReview
            ? request.status === 'admin_initiated'
              ? copy.releaseApprovedForReceivingReview
              : copy.releaseApproved
            : copy.receivingApprovalApproved
    }
  } catch (error) {
    return renderError(error)
  }
}

export const cancelMemberTransferRequestAction = async (prevState: { requestId: string }) => {
  const copy = memberTransferActionCopy[await getServerActionLanguage()]
  const user = await getAuthUser()
  const { requestId } = prevState

  try {
    const request = await db.memberTransferRequest.findUnique({
      where: {
        id: requestId
      }
    })

    if (!request) {
      throw new Error(copy.requestNotFound)
    }

    if (request.status === 'cancelled') {
      throw new Error(copy.alreadyCancelled)
    }

    if (!canCancelMemberTransferRequestStatus(request.status)) {
      throw new Error(copy.cannotCancelApproved)
    }

    const requestInitiatorClerkId = getMemberTransferRequestInitiatorClerkId(request)

    if (user.id === process.env.ADMIN_USER_ID) {
      throw new Error(copy.initiatingDelegateOnlyCancel)
    }

    if (requestInitiatorClerkId !== user.id) {
      throw new Error(copy.initiatingDelegateOnlyCancel)
    }

    await db.memberTransferRequest.update({
      data: {
        rejectionReason:
          requestInitiatorClerkId === request.initiatingClerkId
            ? copy.cancelledByInitiatingDelegateReason
            : copy.cancelledByReceivingDelegateReason,
        status: 'cancelled'
      },
      where: {
        id: request.id
      }
    })

    await recordDashboardActivity({
      action: 'member_transfer_cancelled',
      actorClerkId: user.id,
      associationCode:
        requestInitiatorClerkId === request.initiatingClerkId
          ? request.initiatingAssociationCode
          : request.receivingAssociationCode,
      dashboardScope: dashboardActivityScopes.association,
      entityId: request.id,
      entityType: 'member_transfer',
      summary: `Cancelled transfer for ${getMemberActivityLabel({
        firstName: request.currentFirstName,
        lastAndMiddleNames: request.currentLastAndMiddleNames,
        memberMatriculationNumber: request.memberMatriculationNumber
      })} from ${request.initiatingAssociationCode} to ${request.receivingAssociationCode}.`
    })

    revalidateMemberTransferViews()

    return { message: copy.cancelled }
  } catch (error) {
    return renderError(error)
  }
}

export const reviewAdminMemberTransferRequestAction = async (
  prevState: any,
  formData: FormData
): Promise<{ message: string }> => {
  const copy = memberTransferActionCopy[await getServerActionLanguage()]
  const user = await assertAdminUser()

  try {
    const requestId = getRequiredFormValue(formData, 'requestId')
    const status = getRequiredFormValue(formData, 'status')
    const rejectionReason = String(formData.get('rejectionReason') ?? '').trim()

    if (!isMemberTransferRequestStatus(status) || !['admin_approved', 'admin_rejected'].includes(status)) {
      throw new Error(copy.invalidAdminDecision)
    }

    const request = await db.memberTransferRequest.findUnique({
      include: {
        member: true
      },
      where: {
        id: requestId
      }
    })

    if (!request) {
      throw new Error(copy.requestNotFound)
    }

    if (request.status !== 'receiving_delegate_approved') {
      throw new Error(copy.transferNotReadyForAdmin)
    }

    if (status === 'admin_rejected') {
      await db.memberTransferRequest.update({
        data: {
          adminReviewedAt: new Date(),
          adminReviewedBy: user.id,
          rejectionReason: rejectionReason || copy.adminRejectedReason,
          status
        },
        where: {
          id: request.id
        }
      })

      await recordDashboardActivity({
        action: 'member_transfer_admin_rejected',
        actorClerkId: user.id,
        associationCode: request.initiatingAssociationCode,
        dashboardScope: dashboardActivityScopes.admin,
        entityId: request.id,
        entityType: 'member_transfer',
        summary: `Admin rejected transfer for ${getMemberActivityLabel(request.member)} from ${
          request.initiatingAssociationCode
        } to ${request.receivingAssociationCode}.${rejectionReason ? ` Reason: ${rejectionReason}` : ''}`
      })

      revalidateMemberTransferViews()

      return { message: copy.adminRejected }
    }

    const receivingAssociation = await db.profile.findFirst({
      select: {
        associationCode: true,
        associationName: true,
        clerkId: true
      },
      where: {
        associationCode: request.receivingAssociationCode,
        clerkId: request.receivingClerkId
      }
    })

    if (!receivingAssociation) {
      throw new Error(copy.receivingProfileUnavailable)
    }

    if (request.member.associationCode !== request.initiatingAssociationCode) {
      throw new Error(copy.memberNoLongerInCurrentAssociation)
    }

    const nextMemberMatriculationNumber = getTransferredMemberMatriculationNumber({
      initiatingAssociationCode: request.initiatingAssociationCode,
      memberMatriculationNumber: request.member.memberMatriculationNumber,
      receivingAssociationCode: receivingAssociation.associationCode
    })

    await db.$transaction([
      db.member.update({
        data: {
          associationCode: receivingAssociation.associationCode,
          associationName: receivingAssociation.associationName,
          clerkId: receivingAssociation.clerkId,
          memberMatriculationNumber: nextMemberMatriculationNumber
        },
        where: {
          id: request.memberId
        }
      }),
      db.associationContributionCredit.updateMany({
        data: {
          associationCode: receivingAssociation.associationCode,
          memberMatriculationNumber: nextMemberMatriculationNumber
        },
        where: {
          memberMatriculationNumber: request.member.memberMatriculationNumber
        }
      }),
      db.associationRegistrationUsage.updateMany({
        data: {
          associationCode: receivingAssociation.associationCode,
          memberMatriculationNumber: nextMemberMatriculationNumber
        },
        where: {
          memberMatriculationNumber: request.member.memberMatriculationNumber
        }
      }),
      db.memberTransferRequest.update({
        data: {
          adminReviewedAt: new Date(),
          adminReviewedBy: user.id,
          memberMatriculationNumber: nextMemberMatriculationNumber,
          rejectionReason: null,
          status
        },
        where: {
          id: request.id
        }
      })
    ])

    await recordDashboardActivity({
      action: 'member_transfer_admin_approved',
      actorClerkId: user.id,
      associationCode: receivingAssociation.associationCode,
      dashboardScope: dashboardActivityScopes.admin,
      entityId: request.id,
      entityType: 'member_transfer',
      summary: `Admin approved transfer for ${getMemberActivityLabel(request.member)} from ${
        request.initiatingAssociationCode
      } to ${receivingAssociation.associationCode}. New matriculation number: ${nextMemberMatriculationNumber}.`
    })

    revalidatePaymentViews()
    revalidateMemberTransferViews()

    return { message: copy.adminApproved }
  } catch (error) {
    return renderError(error)
  }
}

export const createRemovedMemberAction = async (provState: any, formData: FormData): Promise<{ message: string }> => {
  const user = await getAuthUser()

  try {
    const memberId = formData.get('id') as string
    const rawData = Object.fromEntries(formData)
    const validatedFields = validateWithZodSchema(RemovedMemberSchema, rawData)

    await assertMemberCanBeWithdrawn(memberId)

    const member = await db.member.findFirst({
      where: {
        id: memberId,
        clerkId: user.id
      }
    })

    if (!member) throw new Error('Member not found')

    await db.$transaction(async tx => {
      const removedMember = await tx.removedMember.create({
        data: {
          associationCode: member.associationCode,
          associationName: member.associationName,
          clerkId: member.clerkId,
          countryOfResidence: member.countryOfResidence,
          dateOfBirth: member.dateOfBirth,
          delegateRecommendation: member.delegateRecommendation,
          firstName: member.firstName,
          lastAndMiddleNames: member.lastAndMiddleNames,
          memberMatriculationNumber: member.memberMatriculationNumber,
          memberStatus: member.memberStatus,
          nameOfBeneficiary: member.nameOfBeneficiary,
          originalMemberCreatedAt: member.createdAt,
          originalMemberVestedAt: member.vestedAt,
          originalMemberId: member.id,
          reasonForLeaving: validatedFields.reasonForLeaving,
          registrationDate: validatedFields.registrationDate
        }
      })

      await removeRegistrationUsage(tx, member.memberMatriculationNumber)

      await tx.member.delete({
        where: {
          id: memberId
        }
      })

      await recordDashboardActivity({
        action: 'member_removed',
        actorClerkId: user.id,
        associationCode: member.associationCode,
        dashboardScope: dashboardActivityScopes.association,
        entityId: removedMember.id,
        entityType: 'member',
        summary: `Removed ${getMemberActivityLabel(member)}. Reason: ${validatedFields.reasonForLeaving}.`,
        tx
      })
    })

    revalidatePaymentViews()
  } catch (error) {
    return renderError(error)
  }

  redirect('/removed-members')
}

export const createRemovedMemberActionAdmin = async (
  provState: any,
  formData: FormData
): Promise<{ message: string }> => {
  const user = await assertAdminUser()

  try {
    const memberId = formData.get('id') as string
    const rawData = Object.fromEntries(formData)
    const validatedFields = validateWithZodSchema(RemovedMemberSchema, rawData)

    const member = await db.member.findUnique({
      where: {
        id: memberId
      }
    })

    if (!member) throw new Error('Member not found')

    await db.$transaction(async tx => {
      const removedMember = await tx.removedMember.create({
        data: {
          associationCode: member.associationCode,
          associationName: member.associationName,
          clerkId: member.clerkId,
          countryOfResidence: member.countryOfResidence,
          dateOfBirth: member.dateOfBirth,
          delegateRecommendation: member.delegateRecommendation,
          firstName: member.firstName,
          lastAndMiddleNames: member.lastAndMiddleNames,
          memberMatriculationNumber: member.memberMatriculationNumber,
          memberStatus: member.memberStatus,
          nameOfBeneficiary: member.nameOfBeneficiary,
          originalMemberCreatedAt: member.createdAt,
          originalMemberVestedAt: member.vestedAt,
          originalMemberId: member.id,
          reasonForLeaving: validatedFields.reasonForLeaving,
          registrationDate: validatedFields.registrationDate
        }
      })

      await removeRegistrationUsage(tx, member.memberMatriculationNumber)

      await tx.member.delete({
        where: {
          id: memberId
        }
      })

      await recordDashboardActivity({
        action: 'member_removed',
        actorClerkId: user.id,
        associationCode: member.associationCode,
        dashboardScope: dashboardActivityScopes.admin,
        entityId: removedMember.id,
        entityType: 'member',
        summary: `Removed ${getMemberActivityLabel(member)}. Reason: ${validatedFields.reasonForLeaving}.`,
        tx
      })
    })

    revalidatePaymentViews()
  } catch (error) {
    return renderError(error)
  }

  redirect('/admin-all-members')
}

export const removeOverduePendingMembersAction = async (
  _prevState: { message: string },
  formData: FormData
): Promise<{ message: string }> => {
  const { userId } = await auth()

  if (!userId) {
    throw new Error('You must be logged in to access this action')
  }

  try {
    const isAdminUser = userId === process.env.ADMIN_USER_ID
    const overdueCutoff = getOverdueRegistrationPaymentCreatedAtCutoff()
    const memberIds = getStringFormValues(formData, 'memberIds')

    if (memberIds.length === 0) {
      throw new Error('Select at least one overdue pending member.')
    }

    const overdueMembers = await db.member.findMany({
      where: {
        ...(isAdminUser ? {} : { clerkId: userId }),
        createdAt: {
          lt: overdueCutoff
        },
        id: {
          in: memberIds
        },
        memberStatus: memberStatus.Pending
      }
    })

    if (overdueMembers.length === 0) {
      return { message: 'No selected overdue pending members were found.' }
    }

    const overdueMemberIds = overdueMembers.map(member => member.id)
    const overdueMemberMatriculationNumbers = overdueMembers.map(member => member.memberMatriculationNumber)

    await db.$transaction(async tx => {
      await tx.removedMember.createMany({
        data: overdueMembers.map(member => ({
          associationCode: member.associationCode,
          associationName: member.associationName,
          clerkId: member.clerkId,
          countryOfResidence: member.countryOfResidence,
          dateOfBirth: member.dateOfBirth,
          delegateRecommendation: member.delegateRecommendation,
          firstName: member.firstName,
          lastAndMiddleNames: member.lastAndMiddleNames,
          memberMatriculationNumber: member.memberMatriculationNumber,
          memberStatus: member.memberStatus,
          nameOfBeneficiary: member.nameOfBeneficiary,
          originalMemberCreatedAt: member.createdAt,
          originalMemberId: member.id,
          reasonForLeaving: reasonForLeaving.NoReason,
          registrationDate: formatRegistrationDate(member.createdAt)
        }))
      })

      await tx.associationRegistrationUsage.deleteMany({
        where: {
          memberMatriculationNumber: {
            in: overdueMemberMatriculationNumbers
          }
        }
      })

      await tx.member.deleteMany({
        where: {
          id: {
            in: overdueMemberIds
          }
        }
      })

      await recordDashboardActivity({
        action: 'overdue_pending_members_removed',
        actorClerkId: userId,
        dashboardScope: isAdminUser ? dashboardActivityScopes.admin : dashboardActivityScopes.association,
        entityType: 'member',
        summary: `Moved ${overdueMembers.length} overdue pending member${
          overdueMembers.length === 1 ? '' : 's'
        } to Removed Members.`,
        tx
      })
    })

    revalidatePaymentViews()
    revalidatePath('/removed-members')
    revalidatePath('/admin-all-removed')

    return {
      message: `${overdueMembers.length} overdue pending member${overdueMembers.length === 1 ? '' : 's'} moved to Removed Members.`
    }
  } catch (error) {
    return renderError(error)
  }
}

export const fetchRemovedMembersAction = async () => {
  const user = await getAuthUser()

  const removedMembers = await db.removedMember.findMany({
    where: {
      clerkId: user.id
    },
    orderBy: { createdAt: 'desc' }
  })

  return removedMembers
}

export const fetchRemovedMembersActionAdmin = async () => {
  await assertAdminUser()

  const removedMembers = await db.removedMember.findMany({
    where: {
      // clerkId: user.id
    },
    orderBy: { createdAt: 'desc' }
  })

  return removedMembers
}

export const restoreRemovedMemberAction = async (prevState: { removedMemberId: string }) => {
  const user = await getAuthUser()
  const { removedMemberId } = prevState

  try {
    const removedMember = await db.removedMember.findUnique({
      where: {
        id: removedMemberId
      }
    })

    if (!removedMember) throw new Error('Removed member not found')

    const isAdminUser = user.id === process.env.ADMIN_USER_ID

    if (!isAdminUser && removedMember.clerkId !== user.id) {
      throw new Error('You can only restore members removed from your own account')
    }

    if (!isWithinMemberRemovalRestoreWindow(removedMember.createdAt)) {
      throw new Error('This member can no longer be restored because the 48-hour reversal window has expired')
    }

    if (
      !removedMember.associationName ||
      !removedMember.nameOfBeneficiary ||
      !removedMember.delegateRecommendation ||
      !removedMember.memberStatus
    ) {
      throw new Error('This removed member record is missing the original details needed for restoration')
    }

    const associationName = removedMember.associationName
    const delegateRecommendation = removedMember.delegateRecommendation
    const restoredMemberStatus = removedMember.memberStatus
    const nameOfBeneficiary = removedMember.nameOfBeneficiary

    await db.$transaction(async tx => {
      const restoredMember = await tx.member.create({
        data: {
          ...(removedMember.originalMemberId ? { id: removedMember.originalMemberId } : {}),
          clerkId: removedMember.clerkId,
          firstName: removedMember.firstName,
          lastAndMiddleNames: removedMember.lastAndMiddleNames,
          dateOfBirth: removedMember.dateOfBirth,
          countryOfResidence: removedMember.countryOfResidence,
          memberMatriculationNumber: removedMember.memberMatriculationNumber,
          delegateRecommendation,
          memberStatus: restoredMemberStatus,
          nameOfBeneficiary,
          associationName,
          associationCode: removedMember.associationCode,
          ...(removedMember.originalMemberCreatedAt ? { createdAt: removedMember.originalMemberCreatedAt } : {})
        }
      })

      await createRegistrationUsage(tx, {
        associationCode: removedMember.associationCode,
        memberMatriculationNumber: removedMember.memberMatriculationNumber
      })

      await tx.removedMember.delete({
        where: {
          id: removedMember.id
        }
      })

      if (restoredMemberStatus === memberStatus.Vested) {
        await tx.associationContributionCredit.upsert({
          create: {
            amountCredited: contributionCreditPerVestedMember,
            associationCode: removedMember.associationCode,
            memberMatriculationNumber: removedMember.memberMatriculationNumber
          },
          update: {
            amountCredited: contributionCreditPerVestedMember,
            associationCode: removedMember.associationCode
          },
          where: {
            memberMatriculationNumber: removedMember.memberMatriculationNumber
          }
        })
      }

      await recordDashboardActivity({
        action: 'member_restored',
        actorClerkId: user.id,
        associationCode: removedMember.associationCode,
        dashboardScope: isAdminUser ? dashboardActivityScopes.admin : dashboardActivityScopes.association,
        entityId: restoredMember.id,
        entityType: 'member',
        summary: `Restored ${getMemberActivityLabel(restoredMember)} from Removed Members.`,
        tx
      })
    })

    revalidatePath('/removed-members')
    revalidatePath('/all-members')
    revalidatePath('/admin-all-removed')
    revalidatePath('/admin-all-members')

    return { message: 'Member restored successfully' }
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return { message: 'This member already exists in All Members and cannot be restored again' }
    }

    return renderError(error)
  }
}

export const createDeceasedMemberAction = async (provState: any, formData: FormData): Promise<{ message: string }> => {
  const user = await getAuthUser()

  try {
    const memberId = formData.get('id') as string
    const rawData = Object.fromEntries(formData)
    const validatedFields = validateWithZodSchema(DeceasedMemberSchema, rawData)

    const member = await db.member.findUnique({
      where: {
        id: memberId,
        clerkId: user.id
      }
    })

    if (!member) {
      throw new Error('Member not found')
    }

    if (member.memberStatus !== memberStatus.Vested) {
      throw new Error('Only vested members can be moved to deceased members.')
    }

    assertValidDeathAnnouncementDate({
      announcementDate: new Date(),
      dateOfDeath: validatedFields.dateOfDeath,
      registrationDate: member.createdAt
    })

    await db.$transaction(async tx => {
      const deceasedMember = await tx.deceasedMember.create({
        data: {
          ...validatedFields,
          associationCode: member.associationCode,
          clerkId: member.clerkId,
          dateOfBirth: member.dateOfBirth,
          delegateRecommendation: member.delegateRecommendation,
          memberStatus: member.memberStatus,
          originalMemberCreatedAt: member.createdAt,
          originalMemberVestedAt: member.vestedAt,
          originalMemberId: member.id,
          registrationDate: formatRegistrationDate(member.createdAt)
        }
      })

      await tx.member.delete({
        where: {
          id: memberId
        }
      })

      await tx.associationRegistrationUsage.deleteMany({
        where: {
          memberMatriculationNumber: member.memberMatriculationNumber
        }
      })

      await recordDashboardActivity({
        action: 'death_announced',
        actorClerkId: user.id,
        associationCode: member.associationCode,
        dashboardScope: dashboardActivityScopes.association,
        entityId: deceasedMember.id,
        entityType: 'deceased_member',
        summary: `Moved ${getMemberActivityLabel(member)} to deceased members. Date of death: ${validatedFields.dateOfDeath}.`,
        tx
      })
    })

    await addDeceasedMemberContributionUsage(member.associationCode)
    revalidatePaymentViews()
    revalidateDeathDocumentationViews()
    after(() => sendDeathAnnouncementAcknowledgmentToDelegate(member.associationCode))
  } catch (error) {
    return renderError(error)
  }

  redirect('/deceased-members')
}

export const fetchDeceasedMembersAction = async () => {
  const user = await getAuthUser()

  const deceasedMember = await db.deceasedMember.findMany({
    include: {
      documents: {
        select: {
          documentType: true,
          status: true
        }
      }
    },
    where: {
      clerkId: user.id
    },
    orderBy: { createdAt: 'desc' }
  })

  return deceasedMember.map(({ documents, ...member }) => ({
    ...member,
    hasApprovedDeathDocuments: hasApprovedRequiredDeceasedMemberDocuments({
      documents,
      placeOfDeathCountry: member.placeOfDeathCountry
    })
  }))
}

export const createDeceasedMemberActionAdmin = async (
  provState: any,
  formData: FormData
): Promise<{ message: string }> => {
  const user = await assertAdminUser()

  try {
    const memberId = formData.get('id') as string
    const rawData = Object.fromEntries(formData)
    const validatedFields = validateWithZodSchema(DeceasedMemberSchema, rawData)

    const member = await db.member.findUnique({
      where: {
        id: memberId
      }
    })

    if (!member) {
      throw new Error('Member not found')
    }

    if (member.memberStatus !== memberStatus.Vested) {
      throw new Error('Only vested members can be moved to deceased members.')
    }

    assertValidDeathAnnouncementDate({
      announcementDate: new Date(),
      dateOfDeath: validatedFields.dateOfDeath,
      registrationDate: member.createdAt
    })

    await db.$transaction(async tx => {
      const deceasedMember = await tx.deceasedMember.create({
        data: {
          ...validatedFields,
          associationCode: member.associationCode,
          clerkId: member.clerkId,
          dateOfBirth: member.dateOfBirth,
          delegateRecommendation: member.delegateRecommendation,
          memberStatus: member.memberStatus,
          originalMemberCreatedAt: member.createdAt,
          originalMemberVestedAt: member.vestedAt,
          originalMemberId: member.id,
          registrationDate: formatRegistrationDate(member.createdAt)
        }
      })

      await tx.member.delete({
        where: {
          id: memberId
        }
      })

      await tx.associationRegistrationUsage.deleteMany({
        where: {
          memberMatriculationNumber: member.memberMatriculationNumber
        }
      })

      await recordDashboardActivity({
        action: 'death_announced',
        actorClerkId: user.id,
        associationCode: member.associationCode,
        dashboardScope: dashboardActivityScopes.admin,
        entityId: deceasedMember.id,
        entityType: 'deceased_member',
        summary: `Moved ${getMemberActivityLabel(member)} to deceased members. Date of death: ${validatedFields.dateOfDeath}.`,
        tx
      })
    })

    await addDeceasedMemberContributionUsage(member.associationCode)
    revalidatePaymentViews()
    revalidateDeathDocumentationViews()
    after(() => sendDeathAnnouncementAcknowledgmentToDelegate(member.associationCode))
  } catch (error) {
    return renderError(error)
  }

  redirect('/admin-all-deceased')
}

export const fetchDeceasedMembersActionAdmin = async () => {
  await assertAdminUser()

  const deceasedMember = await db.deceasedMember.findMany({
    include: {
      documents: {
        select: {
          documentType: true,
          status: true
        }
      }
    },
    where: {
      // clerkId: user.id
    },
    orderBy: { createdAt: 'desc' }
  })

  return deceasedMember.map(({ documents, ...member }) => ({
    ...member,
    hasApprovedDeathDocuments: hasApprovedRequiredDeceasedMemberDocuments({
      documents,
      placeOfDeathCountry: member.placeOfDeathCountry
    })
  }))
}

export const saveContributionCalculationAdminFeeAction = async (
  prevState: any,
  formData: FormData
): Promise<{ message: string }> => {
  const user = await assertAdminUser()

  try {
    const adminFee = getPositiveDollarAmountFromForm(formData, 'adminFee')

    await db.contributionCalculationAdminFee.upsert({
      create: {
        amount: adminFee,
        createdBy: user.id,
        id: 'current'
      },
      update: {
        amount: adminFee,
        createdBy: user.id
      },
      where: {
        id: 'current'
      }
    })

    await recordDashboardActivity({
      action: 'contribution_admin_fee_saved',
      actorClerkId: user.id,
      dashboardScope: dashboardActivityScopes.admin,
      entityId: 'current',
      entityType: 'contribution_calculation',
      summary: `Saved contribution calculation admin fee at ${currencyFormatter.format(adminFee)}.`
    })

    revalidatePath('/admin-contribution-calculation')
    revalidatePath('/admin-contribution-payments')
    revalidatePath('/admin-contribution-payments')
    revalidateDashboardActivityLogs()

    return { message: `Admin fee saved: ${currencyFormatter.format(adminFee)}.` }
  } catch (error) {
    return renderError(error)
  }
}

export const addContributionCalculationDeathAction = async (
  prevState: any,
  formData: FormData
): Promise<{ message: string }> => {
  const user = await assertAdminUser()

  try {
    const memberMatriculationNumber = String(formData.get('memberMatriculationNumber') ?? '')
      .trim()
      .toUpperCase()

    const amountToContribute = Number(formData.get('amountToContribute'))

    if (!memberMatriculationNumber) {
      throw new Error('Enter the deceased member matriculation number.')
    }

    if (!Number.isFinite(amountToContribute) || amountToContribute <= 0) {
      throw new Error('Enter an amount greater than $0.00.')
    }

    const deceasedMember = await db.deceasedMember.findFirst({
      where: {
        memberMatriculationNumber
      },
      select: {
        associationCode: true,
        firstName: true,
        id: true,
        lastAndMiddleNames: true,
        memberMatriculationNumber: true
      }
    })

    if (!deceasedMember) {
      throw new Error('No deceased member was found with that matriculation number.')
    }

    await db.contributionCalculationDeath.upsert({
      create: {
        amountToContribute: roundCurrencyAmount(amountToContribute),
        createdBy: user.id,
        deceasedMemberId: deceasedMember.id,
        memberMatriculationNumber: deceasedMember.memberMatriculationNumber
      },
      update: {
        amountToContribute: roundCurrencyAmount(amountToContribute),
        createdBy: user.id,
        memberMatriculationNumber: deceasedMember.memberMatriculationNumber
      },
      where: {
        deceasedMemberId: deceasedMember.id
      }
    })

    await recordDashboardActivity({
      action: 'contribution_calculation_death_added',
      actorClerkId: user.id,
      associationCode: deceasedMember.associationCode,
      dashboardScope: dashboardActivityScopes.admin,
      entityId: deceasedMember.id,
      entityType: 'contribution_calculation',
      summary: `Added ${getMemberActivityLabel(deceasedMember)} to contribution calculation for ${currencyFormatter.format(
        roundCurrencyAmount(amountToContribute)
      )}.`
    })

    revalidatePath('/admin-contribution-calculation')
    revalidateDashboardActivityLogs()

    return {
      message: `${deceasedMember.firstName} ${deceasedMember.lastAndMiddleNames} is ready for contribution calculation.`
    }
  } catch (error) {
    return renderError(error)
  }
}

export const fetchContributionCalculationDeathsAction = async () => {
  await assertAdminUser()

  return fetchContributionCalculationDeaths()
}

export const fetchPublishedContributionTableAction = async () => {
  await getAuthUser()
  noStore()

  const publishedAssessment = await db.associationContributionAssessment.findFirst({
    include: {
      deaths: {
        orderBy: {
          createdAt: 'asc'
        }
      },
      groups: {
        orderBy: {
          associationCode: 'asc'
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  if (!publishedAssessment) return null

  const associationCodes = publishedAssessment.groups.map(group => group.associationCode)

  const deathMatriculationNumbers = publishedAssessment.deaths.map(death => death.memberMatriculationNumber)

  const [profiles, memberAssociationNames, contributionTableDocuments] = await Promise.all([
    db.profile.findMany({
      select: {
        associationCode: true,
        associationName: true
      },
      where: {
        associationCode: {
          in: associationCodes
        }
      }
    }),
    db.member.findMany({
      distinct: ['associationCode'],
      orderBy: {
        associationCode: 'asc'
      },
      select: {
        associationCode: true,
        associationName: true
      },
      where: {
        associationCode: {
          in: associationCodes
        }
      }
    }),
    db.deceasedMemberDocument.findMany({
      orderBy: {
        updatedAt: 'desc'
      },
      select: {
        documentType: true,
        fileName: true,
        id: true,
        status: true,
        deceasedMember: {
          select: {
            memberMatriculationNumber: true
          }
        }
      },
      where: {
        documentType: {
          in: contributionTableDocumentTypes
        },
        deceasedMember: {
          memberMatriculationNumber: {
            in: deathMatriculationNumbers
          }
        },
        status: 'approved'
      }
    })
  ])

  const associationNamesByCode = new Map(profiles.map(profile => [profile.associationCode, profile.associationName]))

  const deathCertificatesByMatriculationNumber = getPreferredContributionTableDocuments(
    contributionTableDocuments,
    contributionTableDeathCertificateDocumentTypes
  )

  const deceasedPicturesByMatriculationNumber = getPreferredContributionTableDocuments(contributionTableDocuments, [
    'deceased_picture'
  ])

  memberAssociationNames.forEach(member => {
    const associationName = member.associationName.trim()

    if (associationName && !associationNamesByCode.has(member.associationCode)) {
      associationNamesByCode.set(member.associationCode, associationName)
    }
  })

  return {
    amountPerVestedMember: decimalToNumber(publishedAssessment.amountPerVestedMember),
    createdAt: publishedAssessment.createdAt.toISOString(),
    deathCount: publishedAssessment.deathCount,
    deaths: publishedAssessment.deaths.map(death => ({
      amountToContribute: decimalToNumber(death.amountToContribute),
      associationCode: death.associationCode ?? '',
      associationName: death.associationName,
      createdAt: death.createdAt.toISOString(),
      dateOfDeath: death.dateOfDeath,
      deathCertificate: deathCertificatesByMatriculationNumber.get(death.memberMatriculationNumber) ?? null,
      deceasedPicture: deceasedPicturesByMatriculationNumber.get(death.memberMatriculationNumber) ?? null,
      firstName: death.firstName,
      id: death.id,
      lastAndMiddleNames: death.lastAndMiddleNames,
      memberMatriculationNumber: death.memberMatriculationNumber,
      registrationDate: death.registrationDate
    })),
    dueDate: publishedAssessment.dueDate?.toISOString() ?? null,
    groups: publishedAssessment.groups.map(group => ({
      amountOwed: decimalToNumber(group.amountOwed),
      associationCode: group.associationCode,
      associationName: associationNamesByCode.get(group.associationCode) ?? group.associationCode,
      vestedMembersCount: group.vestedMembersCount
    })),
    totalAmount: decimalToNumber(publishedAssessment.totalAmount),
    totalVestedMembers: publishedAssessment.totalVestedMembers
  }
}

export const deleteContributionCalculationDeathAction = async (formData: FormData): Promise<void> => {
  const user = await assertAdminUser()

  const contributionCalculationDeathId = String(formData.get('contributionCalculationDeathId') ?? '')

  if (!contributionCalculationDeathId) return

  const contributionCalculationDeath = await db.contributionCalculationDeath.findUnique({
    include: {
      deceasedMember: {
        select: {
          associationCode: true,
          firstName: true,
          lastAndMiddleNames: true,
          memberMatriculationNumber: true
        }
      }
    },
    where: {
      id: contributionCalculationDeathId
    }
  })

  await db.contributionCalculationDeath.delete({
    where: {
      id: contributionCalculationDeathId
    }
  })

  if (contributionCalculationDeath) {
    await recordDashboardActivity({
      action: 'contribution_calculation_death_removed',
      actorClerkId: user.id,
      associationCode: contributionCalculationDeath.deceasedMember.associationCode,
      dashboardScope: dashboardActivityScopes.admin,
      entityId: contributionCalculationDeath.deceasedMemberId,
      entityType: 'contribution_calculation',
      summary: `Removed ${getMemberActivityLabel(
        contributionCalculationDeath.deceasedMember
      )} from contribution calculation.`
    })
  }

  revalidatePath('/admin-contribution-calculation')
  revalidatePath('/admin-contribution-payments')
  revalidateDashboardActivityLogs()
}

export const restoreDeceasedMemberAction = async (prevState: { deceasedMemberId: string }) => {
  const user = await getAuthUser()
  const { deceasedMemberId } = prevState

  try {
    const deceasedMember = await db.deceasedMember.findUnique({
      where: {
        id: deceasedMemberId
      }
    })

    if (!deceasedMember) {
      throw new Error('Deceased member not found')
    }

    if (!deceasedMember.associationCode) {
      throw new Error('This deceased member record is missing the association code needed for restoration')
    }

    const associationCode = normalizeAssociationCode(deceasedMember.associationCode)
    const isAdminUser = user.id === process.env.ADMIN_USER_ID

    if (!isAdminUser && deceasedMember.clerkId !== user.id) {
      throw new Error('You can only restore death announcements you submitted.')
    }

    const delegateProfile = await db.profile.findUnique({
      select: {
        clerkId: true
      },
      where: {
        associationCode
      }
    })

    if (!isAdminUser && !isWithinMemberRemovalRestoreWindow(deceasedMember.createdAt)) {
      throw new Error(
        'This death announcement can no longer be restored because the 48-hour reversal window has expired'
      )
    }

    if (
      !deceasedMember.dateOfBirth ||
      !deceasedMember.delegateRecommendation ||
      !deceasedMember.memberStatus ||
      !deceasedMember.nameOfBeneficiary
    ) {
      throw new Error('This deceased member record is missing the original details needed for restoration')
    }

    const dateOfBirth = deceasedMember.dateOfBirth
    const delegateRecommendation = deceasedMember.delegateRecommendation
    const restoredMemberStatus = deceasedMember.memberStatus
    const nameOfBeneficiary = deceasedMember.nameOfBeneficiary

    await db.$transaction(async tx => {
      const restoredMember = await tx.member.create({
        data: {
          ...(deceasedMember.originalMemberId ? { id: deceasedMember.originalMemberId } : {}),
          associationCode,
          associationName: deceasedMember.associationName,
          clerkId: delegateProfile?.clerkId ?? deceasedMember.clerkId,
          countryOfResidence: deceasedMember.countryOfResidence,
          dateOfBirth,
          delegateRecommendation,
          firstName: deceasedMember.firstName,
          lastAndMiddleNames: deceasedMember.lastAndMiddleNames,
          memberMatriculationNumber: deceasedMember.memberMatriculationNumber,
          memberStatus: restoredMemberStatus,
          nameOfBeneficiary,
          ...(deceasedMember.originalMemberCreatedAt ? { createdAt: deceasedMember.originalMemberCreatedAt } : {})
        }
      })

      await tx.deceasedMember.delete({
        where: {
          id: deceasedMember.id
        }
      })

      await createRegistrationUsage(tx, {
        associationCode,
        memberMatriculationNumber: deceasedMember.memberMatriculationNumber
      })

      if (restoredMemberStatus === memberStatus.Vested) {
        await tx.associationContributionCredit.upsert({
          create: {
            amountCredited: contributionCreditPerVestedMember,
            associationCode,
            memberMatriculationNumber: deceasedMember.memberMatriculationNumber
          },
          update: {
            amountCredited: contributionCreditPerVestedMember,
            associationCode
          },
          where: {
            memberMatriculationNumber: deceasedMember.memberMatriculationNumber
          }
        })
      }

      await recordDashboardActivity({
        action: 'deceased_member_restored',
        actorClerkId: user.id,
        associationCode,
        dashboardScope: isAdminUser ? dashboardActivityScopes.admin : dashboardActivityScopes.association,
        entityId: restoredMember.id,
        entityType: 'deceased_member',
        summary: `Restored ${getMemberActivityLabel(restoredMember)} from deceased members.`,
        tx
      })

      const contributionUsage = await tx.associationContributionUsage.findUnique({
        where: {
          associationCode
        }
      })

      if (!contributionUsage) {
        return
      }

      if (decimalToNumber(contributionUsage.amountUsed) <= contributionCreditPerVestedMember) {
        await tx.associationContributionUsage.delete({
          where: {
            associationCode
          }
        })

        return
      }

      await tx.associationContributionUsage.update({
        data: {
          amountUsed: {
            decrement: contributionCreditPerVestedMember
          }
        },
        where: {
          associationCode
        }
      })
    })

    revalidateDeathDocumentationViews()
    revalidatePaymentViews()
    revalidatePath('/all-members')
    revalidatePath('/admin-all-members')

    return { message: 'Member restored from death announcement successfully' }
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return { message: 'This member already exists in All Members and cannot be restored again' }
    }

    return renderError(error)
  }
}

const fetchDeathDocumentationCases = (where: Prisma.DeceasedMemberWhereInput) =>
  db.deceasedMember.findMany({
    include: {
      documents: {
        orderBy: { updatedAt: 'desc' },
        select: {
          associationCode: true,
          clerkId: true,
          createdAt: true,
          deceasedMemberId: true,
          documentType: true,
          fileName: true,
          fileSize: true,
          id: true,
          mimeType: true,
          rejectionReason: true,
          status: true,
          updatedAt: true
        }
      }
    },
    orderBy: { createdAt: 'desc' },
    where
  })

export const fetchDelegateDeathDocumentationCasesAction = async () => {
  const user = await getAuthUser()

  noStore()

  const deceasedMembers = await fetchDeathDocumentationCases({
    clerkId: user.id
  })

  return { currentUserId: user.id, deceasedMembers }
}

export const fetchAdminDeathDocumentationCasesAction = async () => {
  const user = await assertAdminUser()

  noStore()

  const deceasedMembers = await fetchDeathDocumentationCases({})

  return { currentUserId: user.id, deceasedMembers }
}

export const fetchDeathDocumentationCasesAction = async () => {
  const { currentUserId, deceasedMembers } = await fetchDelegateDeathDocumentationCasesAction()

  return { currentUserId, deceasedMembers, isAdminUser: false }
}

export const updateDeathDocumentationDetailsAction = async (
  provState: any,
  formData: FormData
): Promise<{ message: string }> => {
  const user = await getAuthUser()

  try {
    const deceasedMemberId = getRequiredFormValue(formData, 'deceasedMemberId')
    const familyContactName = getRequiredFormValue(formData, 'familyContactName').toUpperCase()
    const familyContactPhoneNumber = getRequiredFormValue(formData, 'familyContactPhoneNumber')
    const placeOfDeathCountry = getRequiredFormValue(formData, 'placeOfDeathCountry').toUpperCase()

    if (familyContactName.length < 2) {
      throw new Error('Family contact name should be at least 2 characters.')
    }

    if (familyContactPhoneNumber.length < 7) {
      throw new Error('Family contact phone number should be at least 7 characters.')
    }

    if (placeOfDeathCountry.length < 2) {
      throw new Error('Country of death should be at least 2 characters.')
    }

    const deceasedMember = await db.deceasedMember.findUnique({
      select: {
        associationCode: true,
        clerkId: true,
        firstName: true,
        id: true,
        lastAndMiddleNames: true,
        memberMatriculationNumber: true
      },
      where: {
        id: deceasedMemberId
      }
    })

    if (!deceasedMember) {
      throw new Error('Death announcement not found.')
    }

    const isAdminUser = user.id === process.env.ADMIN_USER_ID

    if (!isAdminUser && deceasedMember.clerkId !== user.id) {
      throw new Error('You can only update documentation details for death announcements from your own account.')
    }

    await db.deceasedMember.update({
      data: {
        familyContactName,
        familyContactPhoneNumber,
        placeOfDeathCountry
      },
      where: {
        id: deceasedMember.id
      }
    })

    await recordDashboardActivity({
      action: 'death_documentation_details_updated',
      actorClerkId: user.id,
      associationCode: deceasedMember.associationCode,
      dashboardScope: isAdminUser ? dashboardActivityScopes.admin : dashboardActivityScopes.association,
      entityId: deceasedMember.id,
      entityType: 'death_documentation',
      summary: `Updated death documentation details for ${getMemberActivityLabel(deceasedMember)}.`
    })

    revalidateDeathDocumentationViews()

    return { message: 'Death documentation details saved successfully' }
  } catch (error) {
    return renderError(error)
  }
}

export const uploadDeceasedMemberDocumentAction = async (
  provState: any,
  formData: FormData
): Promise<{ message: string }> => {
  const user = await getAuthUser()

  try {
    const deceasedMemberId = getRequiredFormValue(formData, 'deceasedMemberId')
    const documentType = getRequiredFormValue(formData, 'documentType')
    const file = formData.get('documentFile')

    if (!isDeceasedMemberDocumentType(documentType)) {
      throw new Error('Select a valid document type.')
    }

    if (!(file instanceof File) || file.size <= 0) {
      throw new Error(`Please choose a file for ${deceasedMemberDocumentLabels[documentType]}.`)
    }

    if (file.size > maxDocumentationFileSize) {
      throw new Error('The file is too large. Please upload a file that is 20 MB or smaller.')
    }

    if (!isAllowedDeceasedMemberDocumentFile(file)) {
      throw new Error('Please upload a PDF, JPG, PNG, WEBP, HEIC, or HEIF file.')
    }

    const deceasedMember = await db.deceasedMember.findUnique({
      select: {
        associationCode: true,
        clerkId: true,
        id: true
      },
      where: {
        id: deceasedMemberId
      }
    })

    if (!deceasedMember) {
      throw new Error('Death announcement not found.')
    }

    const isAdminUser = user.id === process.env.ADMIN_USER_ID

    if (!isAdminUser && deceasedMember.clerkId !== user.id) {
      throw new Error('You can only upload documents for death announcements from your own account.')
    }

    const existingDocument = await db.deceasedMemberDocument.findUnique({
      select: {
        cloudinaryDeliveryType: true,
        cloudinaryPublicId: true,
        cloudinaryResourceType: true,
        clerkId: true
      },
      where: {
        deceasedMemberId_documentType: {
          deceasedMemberId,
          documentType
        }
      }
    })

    if (existingDocument && existingDocument.clerkId !== user.id) {
      throw new Error('Only the person who uploaded this document can replace it.')
    }

    const safeFileName = getSafeDocumentFileName(file, documentType)
    const mimeType = file.type || 'application/octet-stream'
    const fileBuffer = Buffer.from(await file.arrayBuffer())

    const cloudinaryDocument = await uploadDocumentToCloudinary({
      fileBuffer,
      fileName: safeFileName,
      folder: getDeathDocumentCloudinaryFolder(deceasedMemberId, documentType),
      mimeType
    })

    try {
      const document = await db.deceasedMemberDocument.upsert({
        create: {
          associationCode: deceasedMember.associationCode,
          clerkId: user.id,
          deceasedMemberId,
          documentType,
          fileName: safeFileName,
          mimeType,
          ...getCloudinaryDocumentData(cloudinaryDocument)
        },
        update: {
          associationCode: deceasedMember.associationCode,
          clerkId: user.id,
          fileName: safeFileName,
          mimeType,
          rejectionReason: null,
          status: 'submitted',
          ...getCloudinaryDocumentData(cloudinaryDocument)
        },
        where: {
          deceasedMemberId_documentType: {
            deceasedMemberId,
            documentType
          }
        }
      })

      await recordDashboardActivity({
        action: 'death_document_uploaded',
        actorClerkId: user.id,
        associationCode: deceasedMember.associationCode,
        dashboardScope: isAdminUser ? dashboardActivityScopes.admin : dashboardActivityScopes.association,
        entityId: document.id,
        entityType: 'death_documentation',
        summary: `Uploaded ${deceasedMemberDocumentLabels[documentType]} for a death announcement.`
      })
    } catch (error) {
      await deleteCloudinaryDocumentWithoutBlocking({
        cloudinaryDeliveryType: cloudinaryDocument.deliveryType,
        cloudinaryPublicId: cloudinaryDocument.publicId,
        cloudinaryResourceType: cloudinaryDocument.resourceType
      })

      throw error
    }

    if (existingDocument) {
      await deleteCloudinaryDocumentWithoutBlocking(existingDocument)
    }

    revalidateDeathDocumentationViews()

    return { message: `${deceasedMemberDocumentLabels[documentType]} uploaded successfully` }
  } catch (error) {
    return renderError(error)
  }
}

export const deleteDeceasedMemberDocumentAction = async (prevState: { documentId: string }) => {
  const user = await getAuthUser()
  const { documentId } = prevState

  try {
    const document = await db.deceasedMemberDocument.findUnique({
      select: {
        associationCode: true,
        cloudinaryDeliveryType: true,
        cloudinaryPublicId: true,
        cloudinaryResourceType: true,
        clerkId: true,
        documentType: true,
        id: true
      },
      where: {
        id: documentId
      }
    })

    if (!document) {
      throw new Error('Document not found.')
    }

    if (document.clerkId !== user.id) {
      throw new Error('Only the person who uploaded this document can remove it.')
    }

    await deleteCloudinaryDocument({
      deliveryType: document.cloudinaryDeliveryType,
      publicId: document.cloudinaryPublicId,
      resourceType: document.cloudinaryResourceType
    })

    await db.deceasedMemberDocument.delete({
      where: {
        id: document.id
      }
    })

    await recordDashboardActivity({
      action: 'death_document_deleted',
      actorClerkId: user.id,
      associationCode: document.associationCode,
      dashboardScope: dashboardActivityScopes.association,
      entityId: document.id,
      entityType: 'death_documentation',
      summary: `Removed ${deceasedMemberDocumentLabels[document.documentType as DeceasedMemberDocumentType] ?? document.documentType}.`
    })

    revalidateDeathDocumentationViews()

    return { message: 'Document removed successfully' }
  } catch (error) {
    return renderError(error)
  }
}

export const reviewDeceasedMemberDocumentAction = async (
  provState: any,
  formData: FormData
): Promise<{ message: string }> => {
  const user = await assertAdminUser()

  try {
    const documentId = getRequiredFormValue(formData, 'documentId')
    const status = getRequiredFormValue(formData, 'status')
    const rejectionReason = String(formData.get('rejectionReason') ?? '').trim()

    if (!isDeceasedMemberDocumentStatus(status)) {
      throw new Error('Select a valid document review status.')
    }

    const document = await db.deceasedMemberDocument.findUnique({
      select: {
        associationCode: true,
        documentType: true,
        id: true
      },
      where: {
        id: documentId
      }
    })

    const { count } = await db.deceasedMemberDocument.updateMany({
      data: {
        rejectionReason:
          status === 'rejected' ? rejectionReason || 'Please upload a clearer or corrected document.' : null,
        status
      },
      where: {
        id: documentId
      }
    })

    if (count === 0) {
      throw new Error('Document not found. It may have been removed or replaced. Please refresh and try again.')
    }

    if (document) {
      await recordDashboardActivity({
        action: `death_document_${status}`,
        actorClerkId: user.id,
        associationCode: document.associationCode,
        dashboardScope: dashboardActivityScopes.admin,
        entityId: document.id,
        entityType: 'death_documentation',
        summary: `Marked ${
          deceasedMemberDocumentLabels[document.documentType as DeceasedMemberDocumentType] ?? document.documentType
        } ${status}.${status === 'rejected' && rejectionReason ? ` Reason: ${rejectionReason}` : ''}`
      })
    }

    revalidateDeathDocumentationViews()

    return { message: `Document marked ${status}` }
  } catch (error) {
    return renderError(error)
  }
}

export const deleteRemovedMemberAction = async (prevState: { removedMemberId: string }) => {
  const { removedMemberId } = prevState

  // await getAuthUser()

  try {
    await db.removedMember.delete({
      where: {
        id: removedMemberId
      }
    })
    revalidatePath('/removed-members')

    return { message: 'deleted member removed ' }
  } catch (error) {
    return renderError(error)
  }
}

export const deleteDeceasedMemberAction = async (prevState: { deceasedMemberId: string }) => {
  const user = await assertAdminUser()

  const { deceasedMemberId } = prevState

  try {
    const deceasedMember = await db.deceasedMember.findUnique({
      select: {
        associationCode: true,
        firstName: true,
        id: true,
        lastAndMiddleNames: true,
        memberMatriculationNumber: true
      },
      where: {
        id: deceasedMemberId
      }
    })

    await db.deceasedMember.delete({
      where: {
        id: deceasedMemberId
      }
    })

    if (deceasedMember) {
      await recordDashboardActivity({
        action: 'deceased_member_deleted',
        actorClerkId: user.id,
        associationCode: deceasedMember.associationCode,
        dashboardScope: dashboardActivityScopes.admin,
        entityId: deceasedMember.id,
        entityType: 'deceased_member',
        summary: `Deleted deceased member record for ${getMemberActivityLabel(deceasedMember)}.`
      })
    }

    revalidatePath('/deceased-members')
    revalidateDashboardActivityLogs()

    return { message: 'deceased member removed ' }
  } catch (error) {
    return renderError(error)
  }
}

export const fetchSingleDeceasedMemberDetails = async (deceasedMemberId: string) => {
  const user = await getAuthUser()

  const deceasedMember = await db.deceasedMember.findUnique({
    where: {
      id: deceasedMemberId,
      clerkId: user.id
    }
  })

  if (!deceasedMember) redirect('/deceased-members')

  return deceasedMember
}

export const fetchSingleDeceasedMemberDetailsAdmin = async (deceasedMemberId: string) => {
  await assertAdminUser()

  const deceasedMember = await db.deceasedMember.findUnique({
    where: {
      id: deceasedMemberId
    }
  })

  if (!deceasedMember) redirect('/admin-all-deceased')

  return deceasedMember
}

const updateDeceasedMemberDetailsAsAdmin = async (formData: FormData) => {
  const user = await assertAdminUser()

  const deceasedMemberId = formData.get('id')

  if (typeof deceasedMemberId !== 'string' || !deceasedMemberId) {
    throw new Error('Missing deceased member ID')
  }

  const rawData = Object.fromEntries(formData)
  const validatedFields = validateWithZodSchema(DeceasedMemberSchema, rawData)

  const deceasedMember = await db.deceasedMember.findUnique({
    select: {
      associationCode: true,
      createdAt: true,
      firstName: true,
      lastAndMiddleNames: true,
      memberMatriculationNumber: true
    },
    where: {
      id: deceasedMemberId
    }
  })

  if (!deceasedMember) {
    throw new Error('Deceased member not found')
  }

  assertValidDeathAnnouncementDate({
    announcementDate: deceasedMember.createdAt,
    dateOfDeath: validatedFields.dateOfDeath,
    registrationDate: validatedFields.registrationDate
  })

  await db.deceasedMember.update({
    where: {
      id: deceasedMemberId
    },
    data: {
      ...validatedFields
    }
  })

  await recordDashboardActivity({
    action: 'deceased_member_updated',
    actorClerkId: user.id,
    associationCode: deceasedMember.associationCode,
    dashboardScope: dashboardActivityScopes.admin,
    entityId: deceasedMemberId,
    entityType: 'deceased_member',
    summary: `Updated deceased member record for ${getMemberActivityLabel({
      firstName: validatedFields.firstName,
      lastAndMiddleNames: validatedFields.lastAndMiddleNames,
      memberMatriculationNumber: validatedFields.memberMatriculationNumber
    })}.`
  })

  revalidatePath('/admin-all-deceased')
  revalidatePath('/deceased-members')
  revalidatePath(`/admin-all-deceased/${deceasedMemberId}/edit`)
  revalidateDashboardActivityLogs()
}

export const updateDeceasedMemberDetailsAction = async (prevState: any, formData: FormData) => {
  try {
    await updateDeceasedMemberDetailsAsAdmin(formData)
  } catch (error) {
    return renderError(error)
  }

  redirect('/admin-all-deceased')
}

export const updateDeceasedMemberDetailsActionAdmin = async (prevState: any, formData: FormData) => {
  try {
    await updateDeceasedMemberDetailsAsAdmin(formData)
  } catch (error) {
    return renderError(error)
  }

  redirect('/admin-all-deceased')
}
