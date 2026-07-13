'use server'

import { auth, clerkClient } from '@clerk/nextjs/server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { Prisma } from '@/generated/prisma/client'

import db from './db'
import { profileSchema, validateWithZodSchema } from './schemas'

const getRequiredUserId = async () => {
  const { userId } = await auth()

  if (!userId) {
    throw new Error('You must be logged in to access this route')
  }

  return userId
}

const renderError = (error: unknown): { message: string } => {
  console.log(error)

  return { message: error instanceof Error ? error.message : 'An error occurred' }
}

export const createProfileAction = async (prevState: any, formData: FormData) => {
  try {
    const userId = await getRequiredUserId()
    const rawData = Object.fromEntries(formData)
    const validatedFields = validateWithZodSchema(profileSchema, rawData)

    await db.profile.create({
      data: {
        clerkId: userId,
        ...validatedFields
      }
    })

    const client = await clerkClient()

    await client.users.updateUserMetadata(userId, {
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

  redirect('/internal-rules')
}

type FetchProfileOptions = {
  requireInternalRulesAccepted?: boolean
}

export const fetchProfile = async ({ requireInternalRulesAccepted = true }: FetchProfileOptions = {}) => {
  const userId = await getRequiredUserId()

  const profile = await db.profile.findUnique({
    where: {
      clerkId: userId
    }
  })

  if (!profile) redirect('/profile/create')

  if (requireInternalRulesAccepted && !profile.internalRulesAcceptedAt) redirect('/internal-rules')

  return profile
}

export const acceptInternalRulesAction = async (prevState: any, formData: FormData): Promise<{ message: string }> => {
  const userId = await getRequiredUserId()
  const accepted = formData.get('internalRulesAccepted') === 'accepted'

  if (!accepted) {
    return { message: 'Please acknowledge that you have read and agree to the Internal Rules.' }
  }

  await db.profile.update({
    data: {
      internalRulesAcceptedAt: new Date()
    },
    where: {
      clerkId: userId
    }
  })

  redirect('/navigation-instructions')
}

export const updateProfileAction = async (prevState: any, formData: FormData): Promise<{ message: string }> => {
  const userId = await getRequiredUserId()

  try {
    const rawData = Object.fromEntries(formData)
    const validatedFields = validateWithZodSchema(profileSchema, rawData)

    await db.profile.update({
      where: {
        clerkId: userId
      },
      data: validatedFields
    })
    revalidatePath('/profile')

    return { message: 'Profile updated successfully' }
  } catch (error) {
    return renderError(error)
  }
}

const getAssociationProfileLinkedRecordCounts = async (associationCode: string) => {
  const [
    members,
    removedMembers,
    deceasedMembers,
    deceasedDocuments,
    nameChanges,
    initiatedTransfers,
    receivingTransfers,
    contributionPayments,
    registrationPayments,
    contributionAssessments,
    contributionAssessmentDeaths,
    contributionUsage,
    contributionCredits,
    registrationUsage,
    balanceAdjustments,
    ledgerEntries
  ] = await Promise.all([
    db.member.count({ where: { associationCode } }),
    db.removedMember.count({ where: { associationCode } }),
    db.deceasedMember.count({ where: { associationCode } }),
    db.deceasedMemberDocument.count({ where: { associationCode } }),
    db.nameChangeRequest.count({ where: { associationCode } }),
    db.memberTransferRequest.count({ where: { initiatingAssociationCode: associationCode } }),
    db.memberTransferRequest.count({ where: { receivingAssociationCode: associationCode } }),
    db.associationContributionPayment.count({ where: { associationCode } }),
    db.associationRegistrationPayment.count({ where: { associationCode } }),
    db.associationContributionAssessmentGroup.count({ where: { associationCode } }),
    db.associationContributionAssessmentDeath.count({ where: { associationCode } }),
    db.associationContributionUsage.count({ where: { associationCode } }),
    db.associationContributionCredit.count({ where: { associationCode } }),
    db.associationRegistrationUsage.count({ where: { associationCode } }),
    db.associationBalanceAdjustment.count({ where: { associationCode } }),
    db.associationPaymentLedgerEntry.count({ where: { associationCode } })
  ])

  return [
    { count: members, label: 'members' },
    { count: removedMembers, label: 'removed members' },
    { count: deceasedMembers, label: 'deceased members' },
    { count: deceasedDocuments, label: 'deceased member documents' },
    { count: nameChanges, label: 'name change requests' },
    { count: initiatedTransfers, label: 'outgoing transfer requests' },
    { count: receivingTransfers, label: 'incoming transfer requests' },
    { count: contributionPayments, label: 'contribution payment records' },
    { count: registrationPayments, label: 'registration payment records' },
    { count: contributionAssessments, label: 'contribution assessment groups' },
    { count: contributionAssessmentDeaths, label: 'contribution assessment deaths' },
    { count: contributionUsage, label: 'contribution usage records' },
    { count: contributionCredits, label: 'contribution credit records' },
    { count: registrationUsage, label: 'registration usage records' },
    { count: balanceAdjustments, label: 'balance adjustments' },
    { count: ledgerEntries, label: 'payment ledger entries' }
  ].filter(item => item.count > 0)
}

export const deleteAssociationProfileAction = async (
  prevState: any,
  formData: FormData
): Promise<{ message: string }> => {
  try {
    const userId = await getRequiredUserId()

    if (userId !== process.env.ADMIN_USER_ID) {
      throw new Error('Admin privileges are required for this action')
    }

    const profileId = String(formData.get('profileId') ?? '').trim()

    if (!profileId) {
      throw new Error('Association profile was not found.')
    }

    const profile = await db.profile.findUnique({
      select: {
        associationCode: true,
        associationName: true,
        clerkId: true,
        id: true
      },
      where: {
        id: profileId
      }
    })

    if (!profile) {
      throw new Error('Association profile was not found.')
    }

    if (profile.clerkId === userId) {
      throw new Error('You cannot remove your own admin profile from this page.')
    }

    const linkedRecords = await getAssociationProfileLinkedRecordCounts(profile.associationCode)

    if (linkedRecords.length > 0) {
      const linkedRecordSummary = linkedRecords.map(item => `${item.count} ${item.label}`).join(', ')

      throw new Error(
        `${profile.associationCode} still has linked records: ${linkedRecordSummary}. Remove or reassign those records before removing the association profile.`
      )
    }

    await db.profile.delete({
      where: {
        id: profile.id
      }
    })

    try {
      const client = await clerkClient()

      await client.users.updateUserMetadata(profile.clerkId, {
        privateMetadata: {
          hasProfile: false
        }
      })
    } catch (metadataError) {
      console.error('Unable to reset deleted association profile metadata', metadataError)
    }

    revalidatePath('/admin-profiles')
    revalidatePath('/admin-view-delegates')

    return { message: `${profile.associationCode} - ${profile.associationName} profile removed.` }
  } catch (error) {
    return renderError(error)
  }
}
