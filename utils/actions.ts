/* eslint-disable @typescript-eslint/no-explicit-any */
'use server';
import {
  createAndEditMemberSchema,
  createDeletedMemberSchema,
  createDeceasedMemberSchema,
  profileSchema,
  validateWithZodSchema,
} from './schemas';
import db from './db';

import {
  CreateAndEditMemberType,
  MemberStatus,
  MemberType,
  DeceasedMemberType,
  DeletedMemberType,
} from './types';

import { clerkClient, currentUser, auth, getAuth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { PrismaClient, Prisma } from '@/lib/generated/prisma';
import { customAlphabet } from 'nanoid';
import day from 'dayjs';
import prisma from './db';
day.extend(require('dayjs/plugin/relativeTime'));

const randomMatriculation = customAlphabet('1234567890', 6);

const client = new PrismaClient();

const getAuthUser = async () => {
  const user = await currentUser();

  if (!user) {
    throw new Error('You must be logged in to access this route');
  }
  if (!user.privateMetadata.hasProfile) redirect('/profile/create');
  return user;
};

function authenticateAndRedirect(): string {
  const { userId } = auth();

  if (!userId) {
    redirect('/');
  }
  return userId;
}

const renderError = (error: unknown): { message: string } => {
  console.log(error);
  return {
    message: error instanceof Error ? error.message : 'An error occurred',
  };
};

export const createProfileAction = async (
  prevState: any,
  formData: FormData,
) => {
  try {
    const user = await currentUser();
    if (!user) throw new Error('Please login to create a profile');

    const userId = authenticateAndRedirect();

    const rawData = Object.fromEntries(formData);
    const validatedFields = validateWithZodSchema(profileSchema, rawData);
    console.log(validatedFields);

    await db.profile.create({
      data: {
        clerkId: user.id,
        email: user.emailAddresses[0].emailAddress,
        ...validatedFields,
      },
    });
    (await clerkClient()).users.updateUserMetadata(user.id, {
      privateMetadata: { hasProfile: true },
    });

    // return { message: 'profile created' };
  } catch (error) {
    return renderError(error);
  }
  redirect('/');
};

export const fetchProfile = async () => {
  const user = await getAuthUser();
  const profile = await db.profile.findUnique({
    where: {
      clerkId: user.id,
    },
  });
  if (!profile) redirect('/profile/create');
  return profile;
};

export const updateProfileAction = async (
  prevState: any,
  formData: FormData,
): Promise<{ message: string }> => {
  const user = await getAuthUser();
  try {
    const rawData = Object.fromEntries(formData);
    const validatedFields = validateWithZodSchema(profileSchema, rawData);

    await db.profile.update({
      where: {
        clerkId: user.id,
      },
      data: validatedFields,
    });
    revalidatePath('/profile');
    // return { message: 'Profile updated successfully' };
  } catch (error) {
    return renderError(error);
  }
  return { message: 'Profile updated successfully' };
};

export const createMemberAction = async (
  prevState: any,
  formData: FormData,
): Promise<{ message: string }> => {
  const user = await getAuthUser();
  try {
    const rawData = Object.fromEntries(formData);
    const validatedFields = validateWithZodSchema(
      createAndEditMemberSchema,
      rawData,
    );

    console.log(validatedFields);

    await db.member.create({
      data: {
        ...validatedFields,
        clerkId: user.id,
        matriculation: `AS${validatedFields.associationCode.toLocaleUpperCase()}${randomMatriculation()}`,
      },
    });
    // revalidatePath('profile')
    // return { message: 'Profile updated successfully' };
  } catch (error) {
    return renderError(error);
  }
  redirect('/all-members');
  // return { message: 'Member Added Successfully' }
};

export const allMembersAction = async () => {
  const user = await getAuthUser();
  const members = await db.member.findMany({
    where: { clerkId: user.id },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return members;
};

type GetAllMembersActionTypes = {
  searchCode?: string;
  searchFirstName?: string;
  searchLastName?: string;
  delegateRecommendation?: string;
  memberStatus?: string;
  page?: number;
  limit?: number;
};

export async function getAllMembersAction({
  searchCode,
  searchFirstName,
  searchLastName,
  delegateRecommendation,
  memberStatus,
  page = 1,
  limit = 50,
}: GetAllMembersActionTypes): Promise<{
  members: MemberType[];
  count: number;
  page: number;
  totalPages: number;
}> {
  const userId = authenticateAndRedirect();
  // await new Promise((resolve) => setTimeout(resolve, 5000));

  try {
    let whereClause: Prisma.MemberWhereInput = {
      clerkId: userId,
    };
    if (searchCode) {
      whereClause = {
        ...whereClause,
        associationCode: searchCode.toUpperCase(),
      };
    }
    if (searchFirstName) {
      whereClause = {
        ...whereClause,
        firstName: searchFirstName.toUpperCase(),
      };
    }
    if (searchLastName) {
      whereClause = {
        ...whereClause,
        lastName: searchLastName.toUpperCase(),
      };
    }

    if (delegateRecommendation && delegateRecommendation !== 'all') {
      whereClause = {
        ...whereClause,
        recommendation: delegateRecommendation,
      };
    }
    if (memberStatus && memberStatus !== 'all') {
      whereClause = {
        ...whereClause,
        status: memberStatus,
      };
    }
    const skip = (page - 1) * limit;

    const members: MemberType[] = await prisma.member.findMany({
      where: whereClause,
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
    });
    const count: number = await prisma.member.count({
      where: whereClause,
    });
    const totalPages = Math.ceil(count / limit);
    return { members, count, page, totalPages };
  } catch (error) {
    console.error(error);
    return { members: [], count: 0, page: 1, totalPages: 0 };
  }
}

export const AllAdminMembersAction = async ({
  searchCode,
  searchFirstName,
  searchLastName,
  delegateRecommendation,
  page = 1,
  limit = 10,
}: GetAllMembersActionTypes): Promise<{
  members: MemberType[];
  count: number;
  page: number;
  totalPage: number;
}> => {
  const user = await getAuthUser();
  const members = await db.member.findMany({
    orderBy: {
      createdAt: 'desc',
    },
  });
  return { members, page, count: 0, totalPage: 0 };
};

export const fetchSingleMember = async (memberId: string) => {
  const member = await db.member.findUnique({
    where: {
      id: memberId,
    },
  });
  if (!member) redirect('/all-members');
  return member;
};

export const updateMemberAction = async (
  prevState: any,
  formData: FormData,
) => {
  await getAuthUser();
  try {
    const memberId = formData.get('id') as string;
    const rawData = Object.fromEntries(formData);
    const validatedFields = validateWithZodSchema(
      createAndEditMemberSchema,
      rawData,
    );
    const user = await getAuthUser();
    await db.member.update({
      where: {
        id: memberId,
        clerkId: user.id,
      },
      data: {
        ...validatedFields,
      },
    });
    revalidatePath(`/all-members/${memberId}/edit`);
    // redirect('/all-members');
    // return { message: 'information updated successfully' };
  } catch (error) {
    return renderError(error);
  }

  redirect('/all-members');
};

// export const createDeletedMemberAction = async (
//   prevState: any,
//   formData: FormData,
// ): Promise<{ message: string }> => {
//   const user = await getAuthUser();
//   let memberId: null | string = null;
//   try {
//     const rawData = Object.fromEntries(formData);
//     const validatedFields = validateWithZodSchema(
//       createDeletedMemberSchema,
//       rawData,
//     );

//     console.log(validatedFields);

//     const removedMember = await db.deletedMember.create({
//       data: {
//         ...validatedFields,
//         clerkId: user.id,
//       },
//     });
//     const member = await fetchSingleMember((memberId = removedMember.id));
//     await db.member.delete({ where: { id: member.id } });
//   } catch (error) {
//     return renderError(error);
//   }
//   redirect('/all-members');
//   // return { message: 'Member Added Successfully' }
// };
