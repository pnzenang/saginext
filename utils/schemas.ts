import dayjs from 'dayjs';
import * as z from 'zod';
// import { ZodSchema } from 'zod';
import {
  DelegateRecommendation,
  MemberStatus,
  ReasonForLeaving,
} from './types';
import customParseFormat from 'dayjs/plugin/customParseFormat';
// import { PrismaClient } from '@prisma/client';
import { PrismaClient } from '@/lib/generated/prisma';

dayjs.extend(customParseFormat);
const prisma = new PrismaClient();

export const profileSchema = z.object({
  associationName: z
    .string()
    .toUpperCase()
    .min(4, { message: 'association  name must be at least 4 characters' }),
  associationCode: z
    .string()
    .toUpperCase()
    .regex(/^[a-zA-Z]+$/, 'association code must contain only letters')
    .length(4, { message: 'association  code must have exactly  4 letters' }),
  firstDelegateName: z
    .string()
    .toUpperCase()
    .min(2, { message: 'first delegate name must be at least 2 characters' }),
  secondDelegateName: z.string().toUpperCase().min(2, {
    message: 'second delegate name must be at least 2 characters',
  }),
  thirdDelegateName: z
    .string()
    .toUpperCase()
    .min(2, { message: 'third delegate name must be at least 2 characters' }),
  firstDelegateEmail: z.string().email(),
  firstDelegatePhoneNumber: z
    .string()
    .regex(/^(\+)?(\(?\d+\)?)(([\s-]+)?(\d+)){0,}$/g)
    .length(10, {
      message: 'First Delegate Phone number should have 10 digit ',
    }),
  secondDelegateEmail: z.string().email(),
  secondDelegatePhoneNumber: z
    .string()
    .regex(/^(\+)?(\(?\d+\)?)(([\s-]+)?(\d+)){0,}$/g)
    .length(10, {
      message: 'Second Delegate Phone number should have 10 digit ',
    }),
  thirdDelegateEmail: z.string().email(),
  thirdDelegatePhoneNumber: z
    .string()
    .regex(/^(\+)?(\(?\d+\)?)(([\s-]+)?(\d+)){0,}$/g)
    .length(10, {
      message: 'Third Delegate Phone number should have 10 digit ',
    }),
});

const dateFormat = 'MM/DD/YYYY';
function formatDate(date: string) {
  return dayjs(date, dateFormat, true).format(dateFormat);
}

export const createAndEditMemberSchema = z.object({
  firstName: z.string().toUpperCase(),

  middleName: z.string().toUpperCase(),
  lastName: z
    .string()
    .min(2, {
      message: 'member last name must be at least 2 characters',
    })
    .toUpperCase(),

  beneficiary: z
    .string()
    .min(2, {
      message: 'beneficiary name must be at least 2 characters',
    })
    .toUpperCase(),

  countryOfBirth: z.string().min(2, {
    message: 'member country of birth must be at least 2 characters',
  }),
  associationName: z.string().min(2, {
    message: 'association name must be at least 2 characters',
  }),
  associationCode: z
    .string()
    .length(4, { message: 'association code must have exactly 4 characters' })
    .toUpperCase(),

  dateOfBirth: z.string().refine(
    (value) => {
      return dayjs(formatDate(value), dateFormat, true).isValid();
    },
    {
      message: `Invalid date format, expected date in the format ${dateFormat}`,
    },
  ),
  // dateOfBirth: z.string().date(),

  recommendation: z.nativeEnum(DelegateRecommendation),

  status: z.nativeEnum(MemberStatus),

  // singleStatus: z.nativeEnum(SingleMemberStatus),
});

export const createDeletedMemberSchema = z.object({
  firstName: z.string().toUpperCase(),
  matriculation: z.string().toUpperCase(),
  middleName: z.string().toUpperCase(),
  lastName: z
    .string()
    .min(2, {
      message: 'member last name must be at least 2 characters',
    })
    .toUpperCase(),
  countryOfBirth: z.string().min(2, {
    message: 'member country of birth must be at least 2 characters',
  }),
  associationName: z.string().min(2, {
    message: 'association name must be at least 2 characters',
  }),
  associationCode: z
    .string()
    .length(4, { message: 'association code must have exactly 4 characters' })
    .toUpperCase(),

  dateOfBirth: z.string().refine(
    (value) => {
      return dayjs(formatDate(value), dateFormat, true).isValid();
    },
    {
      message: `Invalid date format, expected date in the format ${dateFormat}`,
    },
  ),

  reasonForLeaving: z.nativeEnum(ReasonForLeaving),
});

export const createDeceasedMemberSchema = z.object({
  firstName: z.string().toUpperCase(),

  middleName: z.string().toUpperCase(),
  lastName: z
    .string()
    .min(2, {
      message: 'member last name must be at least 2 characters',
    })
    .toUpperCase(),

  // beneficiary: z
  //   .string()
  //   .min(2, {
  //     message: 'member last name must be at least 2 characters',
  //   })
  //   .toUpperCase(),

  countryOfBirth: z.string().min(2, {
    message: 'member country of birth must be at least 2 characters',
  }),
  associationName: z.string().min(2, {
    message: 'association name must be at least 2 characters',
  }),
  associationCode: z
    .string()
    .length(4, { message: 'association code must have exactly 4 characters' })
    .toUpperCase(),

  dateOfBirth: z.string().refine(
    (value) => {
      return dayjs(formatDate(value), dateFormat, true).isValid();
    },
    {
      message: `Invalid date format, expected date in the format ${dateFormat}`,
    },
  ),
  dateOfDeath: z.string().refine(
    (value) => {
      return dayjs(formatDate(value), dateFormat, true).isValid();
    },
    {
      message: `Invalid date format, expected date in the format ${dateFormat}`,
    },
  ),

  recommendation: z.nativeEnum(DelegateRecommendation),

  status: z.nativeEnum(MemberStatus),
});

export function validateWithZodSchema<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
): T {
  const result = schema.safeParse(data);

  if (!result.success) {
    const errors = result.error.errors.map((error) => error.message);
    throw new Error(errors.join(' , '));
  }
  return result.data;
}
