'use server'

import { error } from 'console'

import { currentUser, clerkClient } from '@clerk/nextjs/server'

import { redirect } from 'next/navigation'

import { revalidatePath } from 'next/cache'
import { customAlphabet } from 'nanoid'

import db from './db'
import {
  DeceasedMemberSchema,
  memberSchema,
  profileSchema,
  RemovedMemberSchema,
  validateWithZodSchema
} from './schemas'
import { Prisma } from '@/generated/prisma/client'
import { memberStatus } from './types'

const randomMatriculation = customAlphabet('1234567890', 6)
const MEMBER_REMOVAL_RESTORE_WINDOW_MS = 48 * 60 * 60 * 1000

const getAuthUser = async () => {
  const user = await currentUser()

  if (!user) {
    throw new Error('You must be login to access this route')
  }

  if (!user.privateMetadata.hasProfile) redirect('/profile/create')

  return user
}

const renderError = (error: unknown): { message: string } => {
  console.log(error)

  return { message: error instanceof Error ? error.message : 'An error occurred' }
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

export const createProfileAction = async (prevState: any, formData: FormData) => {
  try {
    const user = await currentUser()

    if (!user) throw new Error('Please login to create a profile')

    console.log(user)

    const rawData = Object.fromEntries(formData)
    const validatedFields = validateWithZodSchema(profileSchema, rawData)

    await db.profile.create({
      data: {
        clerkId: user.id,
        ...validatedFields
      }
    })
    ;(await clerkClient()).users.updateUserMetadata(user.id, {
      privateMetadata: {
        hasProfile: true
      }
    })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return { message: 'The association Code you picked is already taken, choose a different code' }
      }
    }

    return renderError(error)
  }

  redirect('/navigation-instructions')
}

export const fetchProfile = async () => {
  const user = await getAuthUser()

  const profile = await db.profile.findUnique({
    where: {
      clerkId: user.id
    }
  })

  if (!profile) redirect('/profile/create')

  return profile
}

export const updateProfileAction = async (prevState: any, formData: FormData): Promise<{ message: string }> => {
  const user = await getAuthUser()

  try {
    const rawData = Object.fromEntries(formData)

    const validatedFields = validateWithZodSchema(profileSchema, rawData)

    await db.profile.update({
      where: {
        clerkId: user.id
      },
      data: validatedFields
    })
    revalidatePath('/profile')

    return { message: 'Profile updated successfully' }
  } catch (error) {
    return renderError(error)
  }
}

export const createMemberAction = async (provState: any, formData: FormData): Promise<{ message: string }> => {
  const user = await getAuthUser()

  try {
    const rawData = Object.fromEntries(formData)
    const validatedFields = validateWithZodSchema(memberSchema, rawData)

    await db.member.create({
      data: {
        ...validatedFields,
        clerkId: user.id,
        memberMatriculationNumber: `AS${validatedFields.associationCode}${randomMatriculation()}`
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

  const countsByAssociationCode = counts.reduce<Record<string, {
    associationCode: string
    associationName: string
    vested: number
    pending: number
    awaitingPublication: number
    notInGoodStanding: number
    total: number
  }>>((acc, item) => {
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

export const fetchSingleMemberDetails = async (memberId: string) => {
  const user = await currentUser()

  const member = await db.member.findUnique({
    where: {
      id: memberId,
      clerkId: user?.id
    }
  })

  if (!member) redirect('/all-members')

  return member
}

export const fetchSingleMemberDetailsAdmin = async (memberId: string) => {
  const user = await currentUser()

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

    await db.member.update({
      where: {
        id: memberId
      },
      data: {
        ...validatedFields
      }
    })
    revalidatePath(`all-members/${memberId}/edit`)

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

    await db.member.update({
      where: {
        id: memberId
      },
      data: {
        ...validatedFields
      }
    })
    revalidatePath(`admin-all-members/${memberId}/edit`)

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

    await db.$transaction([
      db.removedMember.create({
        data: {
          originalMemberId: member.id,
          clerkId: member.clerkId,
          firstName: member.firstName,
          lastAndMiddleNames: member.lastAndMiddleNames,
          dateOfBirth: member.dateOfBirth,
          countryOfResidence: member.countryOfResidence,
          memberMatriculationNumber: member.memberMatriculationNumber,
          registrationDate: validatedFields.registrationDate,
          associationName: member.associationName,
          associationCode: member.associationCode,
          nameOfBeneficiary: member.nameOfBeneficiary,
          delegateRecommendation: member.delegateRecommendation,
          memberStatus: member.memberStatus,
          reasonForLeaving: validatedFields.reasonForLeaving,
          originalMemberCreatedAt: member.createdAt
        }
      }),
      db.member.delete({
        where: {
          id: memberId
        }
      })
    ])
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

    await db.$transaction([
      db.removedMember.create({
        data: {
          originalMemberId: member.id,
          clerkId: member.clerkId,
          firstName: member.firstName,
          lastAndMiddleNames: member.lastAndMiddleNames,
          dateOfBirth: member.dateOfBirth,
          countryOfResidence: member.countryOfResidence,
          memberMatriculationNumber: member.memberMatriculationNumber,
          registrationDate: validatedFields.registrationDate,
          associationName: member.associationName,
          associationCode: member.associationCode,
          nameOfBeneficiary: member.nameOfBeneficiary,
          delegateRecommendation: member.delegateRecommendation,
          memberStatus: member.memberStatus,
          reasonForLeaving: validatedFields.reasonForLeaving,
          originalMemberCreatedAt: member.createdAt
        }
      }),
      db.member.delete({
        where: {
          id: memberId
        }
      })
    ])
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
  const user = await getAuthUser()

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

    await db.deceasedMember.create({
      data: {
        ...validatedFields,
        clerkId: user.id
      }
    })
    await db.member.delete({
      where: {
        id: memberId
      }
    })
  } catch (error) {
    return renderError(error)
  }

  redirect('/deceased-members')
}

export const fetchDeceasedMembersAction = async () => {
  const user = await getAuthUser()

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

    await db.deceasedMember.create({
      data: {
        ...validatedFields,
        clerkId: user.id
      }
    })
    await db.member.delete({
      where: {
        id: memberId
      }
    })
  } catch (error) {
    return renderError(error)
  }

  redirect('/deceased-members')
}

export const fetchDeceasedMembersActionAdmin = async () => {
  const user = await getAuthUser()

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
  } catch (error) {}

  return renderError(error)
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
  } catch (error) {}

  return renderError(error)
}

export const fetchSingleDeceasedMemberDetails = async (deceasedMemberId: string) => {
  const user = await currentUser()

  const deceasedMember = await db.deceasedMember.findUnique({
    where: {
      id: deceasedMemberId,
      clerkId: user?.id
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
