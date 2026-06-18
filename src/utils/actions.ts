'use server'

import { randomUUID } from 'crypto'

import { auth } from '@clerk/nextjs/server'

import { redirect } from 'next/navigation'

import { revalidatePath } from 'next/cache'
import { customAlphabet } from 'nanoid'

import db from './db'
import { DeceasedMemberSchema, memberSchema, RemovedMemberSchema, validateWithZodSchema } from './schemas'
import { Prisma } from '@/generated/prisma/client'
import { memberStatus } from './types'
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

  const missingSubmittedAmount = roundCurrencyAmount(amountSubmitted - decimalToNumber(submittedLedgerTotal._sum.amount))

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
  const isWithdrawalBlocked = member?.memberStatus === memberStatus.Vested && currentDay >= 7 && currentDay <= 25

  if (isWithdrawalBlocked) {
    throw new Error(
      'SAGI prevents withdrawal of vested members between the 7th and the 25th of each month. Resume withdrawal on or after the 26th, or before the 7th.'
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
  await getAuthUser()

  const members = await db.member.findMany({
    // where: {},
    orderBy: { createdAt: 'desc' }
  })

  return members
}

export const fetchMemberStatusCountsByAssociationCode = async () => {
  await getAuthUser()

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
  await getAuthUser()

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
  const user = await getAuthUser()

  try {
    if (user.id !== process.env.ADMIN_USER_ID) throw new Error('Admin privileges are required to remove this member')

    const memberId = formData.get('id') as string
    const rawData = Object.fromEntries(formData)
    const validatedFields = validateWithZodSchema(RemovedMemberSchema, rawData)

    await assertMemberCanBeWithdrawn(memberId)

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
  await getAuthUser()

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
  const user = await getAuthUser()

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
  await getAuthUser()

  const deceasedMember = await db.deceasedMember.findMany({
    where: {
      // clerkId: user.id
    },
    orderBy: { createdAt: 'desc' }
  })

  return deceasedMember
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
