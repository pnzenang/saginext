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
