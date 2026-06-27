'use server'

import { randomUUID } from 'crypto'

import { auth } from '@clerk/nextjs/server'

import { redirect } from 'next/navigation'

import { revalidatePath, unstable_noStore as noStore } from 'next/cache'
import { customAlphabet } from 'nanoid'

import db from './db'
import { DeceasedMemberSchema, memberSchema, RemovedMemberSchema, validateWithZodSchema } from './schemas'
import { Prisma } from '@/generated/prisma/client'
import {
  deceasedMemberDocumentLabels,
  deceasedMemberDocumentStatuses,
  deceasedMemberDocumentTypes,
  memberStatus,
  memberTransferRequestStatuses,
  nameChangeRequestStatuses,
  type DeceasedMemberDocumentStatus,
  type DeceasedMemberDocumentType,
  type MemberTransferRequestStatus,
  type NameChangeRequestStatus
} from './types'
import {
  contributionBalanceAdjustmentType,
  contributionCreditPerVestedMember,
  fetchAssociationContributionSummary,
  fetchLatestAssociationContributionAssessment
} from './sagi-contribution-summary'
import { registrationBalanceAdjustmentType, registrationFeePerEligibleMember } from './sagi-registration-summary'
import { contributionPaymentAlertType, registrationPaymentAlertType } from './payment-constants'
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
      id: true
    }
  })

  if (!profile) redirect('/profile/create')

  return { id: userId }
}

const renderError = (error: unknown): { message: string } => {
  console.log(error)

  return { message: error instanceof Error ? error.message : 'An error occurred' }
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

const createPendingRegistrationUsage = async ({
  associationCode,
  memberMatriculationNumber
}: {
  associationCode: string
  memberMatriculationNumber: string
}) => {
  await db.associationRegistrationUsage.upsert({
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

const revalidatePaymentViews = () => {
  revalidatePath('/admin-contribution-payments')
  revalidatePath('/admin-registration-payments')
  revalidatePath('/admin-all-members')
  revalidatePath('/contributions')
  revalidatePath('/registrationsPayments')
  revalidatePath('/all-members')
  revalidatePath('/financial-position')
  revalidatePath('/admin-count')
}

const revalidateDeathDocumentationViews = () => {
  revalidatePath('/admin-all-deceased')
  revalidatePath('/death-documentations')
  revalidatePath('/deceased-members')
}

const revalidateNameChangeDocumentationViews = () => {
  revalidatePath('/admin-all-members')
  revalidatePath('/admin-name-changes')
  revalidatePath('/all-members')
  revalidatePath('/name-modification')
}

const revalidateMemberTransferViews = () => {
  revalidatePath('/admin-member-transfers')
  revalidatePath('/member-transfer')
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

export async function fetchProfile() {
  return fetchProfileBase()
}

export async function updateProfileAction(prevState: any, formData: FormData): Promise<{ message: string }> {
  return updateProfileActionBase(prevState, formData)
}

export const createMemberAction = async (provState: any, formData: FormData): Promise<{ message: string }> => {
  const user = await getAuthUser()

  try {
    const rawData = Object.fromEntries(formData)
    const validatedFields = validateWithZodSchema(memberSchema, rawData)
    const memberMatriculationNumber = `AS${validatedFields.associationCode}${randomMatriculation()}`

    await db.member.create({
      data: {
        ...validatedFields,
        clerkId: user.id,
        memberMatriculationNumber
      }
    })

    if (validatedFields.memberStatus === memberStatus.Pending) {
      await createPendingRegistrationUsage({
        associationCode: validatedFields.associationCode,
        memberMatriculationNumber
      })
    }

    revalidatePaymentViews()
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

export const fetchMembers = async () => {
  const user = await getAuthUser()

  const members = await db.member.findMany({
    where: {
      clerkId: user.id

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

  const counts = await db.member.groupBy({
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
  })

  const associationCodes = [...new Set(counts.map(item => item.associationCode))]

  const profiles = await db.profile.findMany({
    where: {
      associationCode: {
        in: associationCodes
      }
    },
    select: {
      associationCode: true,
      associationName: true
    }
  })

  const associationNamesByCode = new Map(profiles.map(profile => [profile.associationCode, profile.associationName]))

  const memberAssociationNames = await db.member.findMany({
    where: {
      associationCode: {
        in: associationCodes
      }
    },
    select: {
      associationCode: true,
      associationName: true
    },
    orderBy: {
      associationName: 'asc'
    }
  })

  for (const member of memberAssociationNames) {
    if (!associationNamesByCode.has(member.associationCode)) {
      associationNamesByCode.set(member.associationCode, member.associationName)
    }
  }

  const countsByAssociationCode = counts.reduce<
    Record<
      string,
      {
        associationCode: string
        associationName: string
        vested: number
        pending: number
        awaitingPublication: number
        notInGoodStanding: number
        total: number
      }
    >
  >((acc, item) => {
    const associationCode = item.associationCode

    acc[associationCode] ??= {
      associationCode,
      associationName: associationNamesByCode.get(associationCode) ?? associationCode,
      vested: 0,
      pending: 0,
      awaitingPublication: 0,
      notInGoodStanding: 0,
      total: 0
    }

    const count = item._count._all

    if (item.memberStatus === memberStatus.Vested) acc[associationCode].vested += count
    if (item.memberStatus === memberStatus.Pending) acc[associationCode].pending += count
    if (item.memberStatus === memberStatus.Awaiting) acc[associationCode].awaitingPublication += count
    if (item.memberStatus === memberStatus.Delinquent) acc[associationCode].notInGoodStanding += count

    acc[associationCode].total += count

    return acc
  }, {})

  return Object.values(countsByAssociationCode)
}

export const createAssociationContributionAssessmentAction = async (
  prevState: any,
  formData: FormData
): Promise<{ message: string }> => {
  const user = await assertAdminUser()

  try {
    const totalAmount = getPositiveDollarAmountFromForm(formData, 'totalAmount')
    const dueDate = getRequiredDateFromForm(formData, 'dueDate')

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

    const vestedMembersByCode = vestedMembers.reduce((counts, member) => {
      counts.set(member.associationCode, (counts.get(member.associationCode) ?? 0) + 1)

      return counts
    }, new Map<string, number>())

    const amountPerVestedMember = Number((totalAmount / vestedMembers.length).toFixed(2))

    const groupEntries = Array.from(vestedMembersByCode.entries()).map(([associationCode, vestedMembersCount]) => ({
      amountOwed: Number((amountPerVestedMember * vestedMembersCount).toFixed(2)),
      associationCode,
      vestedMembersCount
    }))

    await db.$transaction(async tx => {
      await tx.associationContributionAssessment.create({
        data: {
          amountPerVestedMember,
          dueDate,
          totalAmount,
          totalVestedMembers: vestedMembers.length,
          groups: {
            create: groupEntries
          }
        }
      })

      await tx.associationPaymentLedgerEntry.createMany({
        data: groupEntries.map(group => ({
          amount: group.amountOwed,
          associationCode: group.associationCode,
          createdBy: user.id,
          eventType: associationPaymentLedgerEventTypes.dueOffset,
          note: `Contribution due created for ${group.vestedMembersCount} vested member(s).`,
          paymentType: associationPaymentTypes.contribution
        }))
      })
    })

    revalidatePaymentViews()

    return {
      message: `Distributed ${currencyFormatter.format(totalAmount)} across ${vestedMembers.length} vested members. Each vested member is ${currencyFormatter.format(amountPerVestedMember)}.`
    }
  } catch (error) {
    return renderError(error)
  }
}

export const resetAssociationContributionCalculationAction = async (): Promise<{ message: string }> => {
  const user = await assertAdminUser()

  try {
    const latestAssessment = await fetchLatestAssociationContributionAssessment()

    if (!latestAssessment) {
      return { message: 'No contribution calculation found to reset.' }
    }

    const associationContributionPayments = await db.associationContributionPayment.findMany({
      where: {
        OR: [{ amountSent: { gt: 0 } }, { amountVerified: { gt: 0 } }]
      }
    })

    const affectedAssociationCodes = Array.from(
      new Set([
        ...latestAssessment.groups.map(group => group.associationCode),
        ...associationContributionPayments.map(payment => payment.associationCode)
      ])
    )

    const contributionSummaries = await Promise.all(
      affectedAssociationCodes.map(associationCode => fetchAssociationContributionSummary(associationCode))
    )

    const balanceAdjustments = contributionSummaries.map(summary => ({
      amount: Number((summary.balance - summary.amountVerified).toFixed(2)),
      associationCode: summary.associationCode
    }))

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

      await Promise.all(
        balanceAdjustments.map(adjustment =>
          tx.associationBalanceAdjustment.upsert({
            create: {
              amount: adjustment.amount,
              associationCode: adjustment.associationCode,
              balanceType: contributionBalanceAdjustmentType
            },
            update: {
              amount: adjustment.amount
            },
            where: {
              associationCode_balanceType: {
                associationCode: adjustment.associationCode,
                balanceType: contributionBalanceAdjustmentType
              }
            }
          })
        )
      )

      await tx.associationContributionAssessment.deleteMany()
    })

    revalidatePaymentViews()

    return {
      message: 'Contribution calculation reset successfully. Balances and payment history were kept.'
    }
  } catch (error) {
    return renderError(error)
  }
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

      return payment
    })

    revalidatePaymentViews()

    return {
      message: `Added contribution payment: ${currencyFormatter.format(amountSent)}. Total sent: ${currencyFormatter.format(decimalToNumber(payment.amountSent))}.`
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

      return payment
    })

    revalidatePaymentViews()

    return {
      message: `Added registration payment: ${currencyFormatter.format(amountSent)}. Total awaiting verification: ${currencyFormatter.format(decimalToNumber(payment.amountSent))}.`
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
    })

    revalidatePaymentViews()
  } catch (error) {
    renderError(error)
  }
}

export const resetAssociationContributionPaymentAction = async (formData: FormData): Promise<void> => {
  const user = await assertAdminUser()

  try {
    const associationCode = getRequiredFormValue(formData, 'associationCode')

    const currentPayment = await db.associationContributionPayment.findUnique({
      where: {
        associationCode
      }
    })

    await db.$transaction(async tx => {
      await createMissingPaymentHistoryLedgerEntries({
        createdBy: user.id,
        payment: currentPayment,
        paymentType: associationPaymentTypes.contribution,
        tx
      })

      await tx.associationContributionPayment.upsert({
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
    })

    revalidatePaymentViews()
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
    })

    revalidatePaymentViews()
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
    })

    revalidatePaymentViews()
  } catch (error) {
    renderError(error)
  }
}

const resetPaymentAlert = async (alertType: string): Promise<void> => {
  await assertAdminUser()

  const resetAt = new Date()

  await db.$executeRaw`
    INSERT INTO "PaymentAlertReset" ("id", "alertType", "resetAt", "updatedAt")
    VALUES (${randomUUID()}, ${alertType}, ${resetAt}, ${resetAt})
    ON CONFLICT ("alertType")
    DO UPDATE SET "resetAt" = ${resetAt}, "updatedAt" = ${resetAt}
  `

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
  try {
    const memberId = formData.get('id') as string
    const rawData = Object.fromEntries(formData)
    const validatedFields = validateWithZodSchema(memberSchema, rawData)

    const currentMember = await db.member.findUnique({
      where: {
        id: memberId
      },
      select: {
        memberMatriculationNumber: true,
        memberStatus: true
      }
    })

    await db.member.update({
      where: {
        id: memberId
      },
      data: {
        ...validatedFields
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

    revalidatePath(`all-members/${memberId}/edit`)
    revalidatePaymentViews()

    // return { message: `Member Details Updated Successfully` }
  } catch (error) {
    return renderError(error)
  }

  redirect('/all-members')
}

export const updateMemberDetailsActionAdmin = async (prevState: any, formData: FormData) => {
  await assertAdminUser()

  try {
    const memberId = formData.get('id') as string
    const rawData = Object.fromEntries(formData)
    const validatedFields = validateWithZodSchema(memberSchema, rawData)

    const currentMember = await db.member.findUnique({
      where: {
        id: memberId
      },
      select: {
        memberMatriculationNumber: true,
        memberStatus: true
      }
    })

    await db.member.update({
      where: {
        id: memberId
      },
      data: {
        ...validatedFields
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

export const fetchNameChangeDocumentationPageAction = async () => {
  const user = await getAuthUser()

  const members = await db.member.findMany({
    orderBy: [{ associationCode: 'asc' }, { lastAndMiddleNames: 'asc' }, { firstName: 'asc' }],
    select: {
      associationCode: true,
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

  return { members, requests }
}

export const fetchAdminNameChangeRequestsAction = async () => {
  await assertAdminUser()

  return db.nameChangeRequest
    .findMany({
      include: {
        member: {
          select: {
            firstName: true,
            lastAndMiddleNames: true,
            memberMatriculationNumber: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    .catch(error => {
      console.error('Unable to load admin name change requests', error)

      return []
    })
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
        lastAndMiddleNames: true
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

    await db.nameChangeRequest.create({
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

    await db.nameChangeRequest.update({
      data: {
        documentRequired: true,
        fileData: Buffer.from(await file.arrayBuffer()),
        fileName: getSafeUploadedFileName(file, 'Official name change document'),
        fileSize: file.size,
        mimeType: file.type || 'application/octet-stream',
        rejectionReason: null,
        reviewedAt: null,
        reviewedBy: null,
        status: 'submitted'
      },
      where: {
        id: request.id
      }
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

    const request = await db.nameChangeRequest.findUnique({
      where: {
        id: requestId
      }
    })

    if (!request) {
      throw new Error('Name change request not found.')
    }

    if (request.status !== 'submitted') {
      throw new Error('This name change request has already been reviewed.')
    }

    if (status === 'approved' && request.documentRequired && !request.fileData) {
      throw new Error('Documentation is required before approving this name change.')
    }

    if (status === 'documentation_requested') {
      await db.nameChangeRequest.update({
        data: {
          documentRequired: true,
          rejectionReason: rejectionReason || 'Please upload official documentation for this name change.',
          reviewedAt: new Date(),
          reviewedBy: user.id,
          status
        },
        where: {
          id: request.id
        }
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
          rejectionReason: rejectionReason || 'Please submit corrected information or documentation.',
          reviewedAt: new Date(),
          reviewedBy: user.id,
          status
        },
        where: {
          id: request.id
        }
      })
    }

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
      where: {
        id: requestId
      }
    })

    if (!request) {
      throw new Error('Name change request not found.')
    }

    const isAdminUser = user.id === process.env.ADMIN_USER_ID

    if (!isAdminUser && request.clerkId !== user.id) {
      throw new Error('You can only remove name change requests from your own account.')
    }

    await db.nameChangeRequest.delete({
      where: {
        id: request.id
      }
    })

    revalidateNameChangeDocumentationViews()

    return { message: 'Name change request removed successfully' }
  } catch (error) {
    return renderError(error)
  }
}

const openMemberTransferRequestStatuses: MemberTransferRequestStatus[] = [
  'receiving_delegate_pending',
  'receiving_delegate_approved'
]

const canCancelMemberTransferRequestStatus = (status: string) =>
  isMemberTransferRequestStatus(status) && status !== 'admin_approved' && status !== 'cancelled'

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

export const fetchMemberTransferPageAction = async () => {
  noStore()

  const profile = await fetchProfile()
  const visibleMemberTransferRequestWhere = getVisibleMemberTransferRequestWhere()

  const [members, requests] = await Promise.all([
    db.member.findMany({
      orderBy: [{ lastAndMiddleNames: 'asc' }, { firstName: 'asc' }],
      select: {
        associationCode: true,
        firstName: true,
        id: true,
        lastAndMiddleNames: true,
        memberMatriculationNumber: true,
        memberStatus: true
      },
      where: {
        clerkId: {
          not: profile.clerkId
        },
        memberStatus: memberStatus.Vested
      }
    }),
    db.memberTransferRequest.findMany({
      include: {
        member: {
          select: {
            associationCode: true,
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
    members,
    nextCancelledTransferRefreshAt: getNextCancelledMemberTransferRefreshAt(requests),
    profile,
    requests
  }
}

export const fetchAdminMemberTransferPageAction = async () => {
  noStore()
  await assertAdminUser()

  const requests = await db.memberTransferRequest.findMany({
    include: {
      member: {
        select: {
          associationCode: true,
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

  return { nextCancelledTransferRefreshAt: getNextCancelledMemberTransferRefreshAt(requests), requests }
}

export const submitMemberTransferRequestAction = async (
  prevState: any,
  formData: FormData
): Promise<{ message: string }> => {
  const user = await getAuthUser()

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
      throw new Error('Member not found.')
    }

    if (member.clerkId === user.id || member.associationCode === receivingAssociation.associationCode) {
      throw new Error('This member is already in your delegate association.')
    }

    if (member.memberStatus !== memberStatus.Vested) {
      throw new Error('Transfer is not allowed on non-vested members. Only vested members can be transferred.')
    }

    const releasingAssociation = await db.profile.findFirst({
      select: {
        associationCode: true,
        clerkId: true
      },
      where: {
        associationCode: member.associationCode,
        clerkId: member.clerkId
      }
    })

    if (!releasingAssociation) {
      throw new Error('Current delegate association profile was not found.')
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
      throw new Error('This member already has a member transfer request in progress.')
    }

    await db.memberTransferRequest.create({
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

    revalidateMemberTransferViews()

    return { message: 'Member transfer release request sent to the current delegate.' }
  } catch (error) {
    return renderError(error)
  }
}

export const reviewIncomingMemberTransferRequestAction = async (
  prevState: any,
  formData: FormData
): Promise<{ message: string }> => {
  const user = await getAuthUser()

  try {
    const requestId = getRequiredFormValue(formData, 'requestId')
    const status = getRequiredFormValue(formData, 'status')
    const rejectionReason = String(formData.get('rejectionReason') ?? '').trim()

    if (
      !isMemberTransferRequestStatus(status) ||
      !['receiving_delegate_approved', 'receiving_delegate_rejected'].includes(status)
    ) {
      throw new Error('Select a valid transfer decision.')
    }

    if (status === 'receiving_delegate_rejected' && !rejectionReason) {
      throw new Error('Give the reason to reject the release.')
    }

    const request = await db.memberTransferRequest.findUnique({
      where: {
        id: requestId
      }
    })

    if (!request) {
      throw new Error('Member transfer request not found.')
    }

    if (request.initiatingClerkId !== user.id) {
      throw new Error('Only the current delegate can release this member.')
    }

    if (request.status !== 'receiving_delegate_pending') {
      throw new Error('This transfer request has already been reviewed by the current delegate.')
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

    revalidateMemberTransferViews()

    return {
      message:
        status === 'receiving_delegate_approved'
          ? 'Member release approved and sent to SAGI admin.'
          : 'Member transfer release rejected.'
    }
  } catch (error) {
    return renderError(error)
  }
}

export const cancelMemberTransferRequestAction = async (prevState: { requestId: string }) => {
  const user = await getAuthUser()
  const { requestId } = prevState

  try {
    const request = await db.memberTransferRequest.findUnique({
      where: {
        id: requestId
      }
    })

    if (!request) {
      throw new Error('Member transfer request not found.')
    }

    if (request.receivingClerkId !== user.id) {
      throw new Error('Only the receiving delegate who requested this transfer can cancel it.')
    }

    if (request.status === 'cancelled') {
      throw new Error('This member transfer request has already been cancelled.')
    }

    if (!canCancelMemberTransferRequestStatus(request.status)) {
      throw new Error('This member transfer request can no longer be cancelled because SAGI admin has approved it.')
    }

    await db.memberTransferRequest.update({
      data: {
        rejectionReason: 'Receiving delegate cancelled this transfer request.',
        status: 'cancelled'
      },
      where: {
        id: request.id
      }
    })

    revalidateMemberTransferViews()

    return { message: 'Member transfer request cancelled.' }
  } catch (error) {
    return renderError(error)
  }
}

export const reviewAdminMemberTransferRequestAction = async (
  prevState: any,
  formData: FormData
): Promise<{ message: string }> => {
  const user = await assertAdminUser()

  try {
    const requestId = getRequiredFormValue(formData, 'requestId')
    const status = getRequiredFormValue(formData, 'status')
    const rejectionReason = String(formData.get('rejectionReason') ?? '').trim()

    if (!isMemberTransferRequestStatus(status) || !['admin_approved', 'admin_rejected'].includes(status)) {
      throw new Error('Select a valid admin transfer decision.')
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
      throw new Error('Member transfer request not found.')
    }

    if (request.status !== 'receiving_delegate_approved') {
      throw new Error('This transfer is not ready for admin review.')
    }

    if (status === 'admin_rejected') {
      await db.memberTransferRequest.update({
        data: {
          adminReviewedAt: new Date(),
          adminReviewedBy: user.id,
          rejectionReason: rejectionReason || 'SAGI admin rejected this transfer request.',
          status
        },
        where: {
          id: request.id
        }
      })

      revalidateMemberTransferViews()

      return { message: 'Member transfer rejected by admin.' }
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
      throw new Error('Receiving delegate association profile is no longer available.')
    }

    if (
      request.member.clerkId !== request.initiatingClerkId ||
      request.member.associationCode !== request.initiatingAssociationCode
    ) {
      throw new Error('This member no longer belongs to the current delegate association.')
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

    revalidatePaymentViews()
    revalidateMemberTransferViews()

    return { message: 'Member transfer approved and completed.' }
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
      await tx.removedMember.create({
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
          originalMemberId: member.id,
          reasonForLeaving: validatedFields.reasonForLeaving,
          registrationDate: validatedFields.registrationDate
        }
      })

      if (member.memberStatus === memberStatus.Pending) {
        await tx.associationRegistrationUsage.deleteMany({
          where: {
            memberMatriculationNumber: member.memberMatriculationNumber
          }
        })
      }

      await tx.member.delete({
        where: {
          id: memberId
        }
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
  await assertAdminUser()

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
      await tx.removedMember.create({
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
          originalMemberId: member.id,
          reasonForLeaving: validatedFields.reasonForLeaving,
          registrationDate: validatedFields.registrationDate
        }
      })

      if (member.memberStatus === memberStatus.Pending) {
        await tx.associationRegistrationUsage.deleteMany({
          where: {
            memberMatriculationNumber: member.memberMatriculationNumber
          }
        })
      }

      await tx.member.delete({
        where: {
          id: memberId
        }
      })
    })

    revalidatePaymentViews()
  } catch (error) {
    return renderError(error)
  }

  redirect('/admin-all-members')
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

    await db.$transaction([
      db.member.create({
        data: {
          ...(removedMember.originalMemberId ? { id: removedMember.originalMemberId } : {}),
          clerkId: removedMember.clerkId,
          firstName: removedMember.firstName,
          lastAndMiddleNames: removedMember.lastAndMiddleNames,
          dateOfBirth: removedMember.dateOfBirth,
          countryOfResidence: removedMember.countryOfResidence,
          memberMatriculationNumber: removedMember.memberMatriculationNumber,
          delegateRecommendation: removedMember.delegateRecommendation,
          memberStatus: removedMember.memberStatus,
          nameOfBeneficiary: removedMember.nameOfBeneficiary,
          associationName: removedMember.associationName,
          associationCode: removedMember.associationCode,
          ...(removedMember.originalMemberCreatedAt ? { createdAt: removedMember.originalMemberCreatedAt } : {})
        }
      }),
      db.removedMember.delete({
        where: {
          id: removedMember.id
        }
      })
    ])

    if (removedMember.memberStatus === memberStatus.Pending) {
      await createPendingRegistrationUsage({
        associationCode: removedMember.associationCode,
        memberMatriculationNumber: removedMember.memberMatriculationNumber
      })
    }

    if (removedMember.memberStatus === memberStatus.Vested) {
      await createVestedContributionCredit({
        associationCode: removedMember.associationCode,
        memberMatriculationNumber: removedMember.memberMatriculationNumber
      })
    }

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

    await db.$transaction([
      db.deceasedMember.create({
        data: {
          ...validatedFields,
          associationCode: member.associationCode,
          registrationDate: formatRegistrationDate(member.createdAt),
          clerkId: user.id
        }
      }),
      db.member.delete({
        where: {
          id: memberId
        }
      })
    ])

    await addDeceasedMemberContributionUsage(member.associationCode)
    revalidatePaymentViews()
  } catch (error) {
    return renderError(error)
  }

  redirect('/deceased-members')
}

export const fetchDeceasedMembersAction = async () => {
  await getAuthUser()

  const deceasedMember = await db.deceasedMember.findMany({
    where: {
      // clerkId: user.id
    },
    orderBy: { createdAt: 'desc' }
  })

  return deceasedMember
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

    await db.$transaction([
      db.deceasedMember.create({
        data: {
          ...validatedFields,
          associationCode: member.associationCode,
          registrationDate: formatRegistrationDate(member.createdAt),
          clerkId: user.id
        }
      }),
      db.member.delete({
        where: {
          id: memberId
        }
      })
    ])

    await addDeceasedMemberContributionUsage(member.associationCode)
    revalidatePaymentViews()
  } catch (error) {
    return renderError(error)
  }

  redirect('/deceased-members')
}

export const fetchDeceasedMembersActionAdmin = async () => {
  await assertAdminUser()

  const deceasedMember = await db.deceasedMember.findMany({
    where: {
      // clerkId: user.id
    },
    orderBy: { createdAt: 'desc' }
  })

  return deceasedMember
}

export const fetchDeathDocumentationCasesAction = async () => {
  const user = await getAuthUser()
  const isAdminUser = user.id === process.env.ADMIN_USER_ID

  const deceasedMembers = await db.deceasedMember.findMany({
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
    where: isAdminUser
      ? {}
      : {
          clerkId: user.id
        }
  })

  return { deceasedMembers, isAdminUser }
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

    const safeFileName = getSafeDocumentFileName(file, documentType)
    const fileData = Buffer.from(await file.arrayBuffer())

    await db.deceasedMemberDocument.upsert({
      create: {
        associationCode: deceasedMember.associationCode,
        clerkId: deceasedMember.clerkId,
        deceasedMemberId,
        documentType,
        fileData,
        fileName: safeFileName,
        fileSize: file.size,
        mimeType: file.type || 'application/octet-stream'
      },
      update: {
        associationCode: deceasedMember.associationCode,
        clerkId: deceasedMember.clerkId,
        fileData,
        fileName: safeFileName,
        fileSize: file.size,
        mimeType: file.type || 'application/octet-stream',
        rejectionReason: null,
        status: 'submitted'
      },
      where: {
        deceasedMemberId_documentType: {
          deceasedMemberId,
          documentType
        }
      }
    })

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
        clerkId: true,
        id: true
      },
      where: {
        id: documentId
      }
    })

    if (!document) {
      throw new Error('Document not found.')
    }

    const isAdminUser = user.id === process.env.ADMIN_USER_ID

    if (!isAdminUser && document.clerkId !== user.id) {
      throw new Error('You can only remove documents from your own account.')
    }

    await db.deceasedMemberDocument.delete({
      where: {
        id: document.id
      }
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
  await assertAdminUser()

  try {
    const documentId = getRequiredFormValue(formData, 'documentId')
    const status = getRequiredFormValue(formData, 'status')
    const rejectionReason = String(formData.get('rejectionReason') ?? '').trim()

    if (!isDeceasedMemberDocumentStatus(status)) {
      throw new Error('Select a valid document review status.')
    }

    await db.deceasedMemberDocument.update({
      data: {
        rejectionReason:
          status === 'rejected' ? rejectionReason || 'Please upload a clearer or corrected document.' : null,
        status
      },
      where: {
        id: documentId
      }
    })

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
  const { deceasedMemberId } = prevState

  // await getAuthUser()

  try {
    await db.deceasedMember.delete({
      where: {
        id: deceasedMemberId
      }
    })
    revalidatePath('/deceased-members')

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

export const updateDeceasedMemberDetailsAction = async (prevState: any, formData: FormData) => {
  try {
    const deceasedMemberId = formData.get('id') as string
    const rawData = Object.fromEntries(formData)
    const validatedFields = validateWithZodSchema(DeceasedMemberSchema, rawData)

    await db.deceasedMember.update({
      where: {
        id: deceasedMemberId
      },
      data: {
        ...validatedFields
      }
    })
    revalidatePath(`admin-all-deceased/${deceasedMemberId}/edit`)

    // return { message: `case status Updated Successfully` }
  } catch (error) {
    return renderError(error)
  }

  redirect('/admin-all-deceased')
}

export const updateDeceasedMemberDetailsActionAdmin = async (prevState: any, formData: FormData) => {
  await assertAdminUser()

  try {
    const deceasedMemberId = formData.get('id') as string
    const rawData = Object.fromEntries(formData)
    const validatedFields = validateWithZodSchema(DeceasedMemberSchema, rawData)

    await db.deceasedMember.update({
      where: {
        id: deceasedMemberId
      },
      data: {
        ...validatedFields
      }
    })
    revalidatePath(`admin-all-deceased/${deceasedMemberId}/edit`)

    // return { message: `case status Updated Successfully` }
  } catch (error) {
    return renderError(error)
  }

  redirect('/admin-all-deceased')
}
