/* eslint-disable @typescript-eslint/no-explicit-any */
export type actionFunction = (
  prevState: any,
  formData: FormData,
) => Promise<{ message: string }>;

// import { Regex } from 'lucide-react';
import * as z from 'zod';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import {
  createAndEditMemberSchema,
  createDeceasedMemberSchema,
  createDeletedMemberSchema,
} from './schemas';
dayjs.extend(customParseFormat);

export type MemberType = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  clerkId: string;
  matriculation: string;
  firstName: string;
  middleName: string;
  lastName: string;
  countryOfBirth: string;
  dateOfBirth: string;
  associationName: string;
  associationCode: string;
  recommendation: string;
  status: string;
  beneficiary: string;
};
export type DeletedMemberType = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  clerkId: string;
  matriculation: string;
  firstName: string;
  middleName: string;
  lastName: string;
  countryOfBirth: string;
  dateOfBirth: string;
  associationName: string;
  associationCode: string;
  reasonForLeaving: string;
};
export type DeceasedMemberType = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  clerkId: string;
  matriculation: string;
  firstName: string;
  middleName: string;
  lastName: string;
  countryOfBirth: string;
  dateOfBirth: string;
  dateOfDeath: string;
  placeOfDeath: string;
  associationName: string;
  associationCode: string;
  recommendation: string;
  status: string;
  beneficiary: string;
};

export enum DelegateRecommendation {
  Confirm = 'confirm',
  Remove = 'remove',
  Transfer = 'transfer',
  Deceased = 'deceased',
}
export enum ReasonForLeaving {
  noReason = 'no reason',
  nonPayment = 'non payment',
  leftTheUS = 'left the USA',
}

export enum MemberStatus {
  Pending = 'pending',
  Vested = 'vested',
}

// export enum SingleMemberStatus {
//   Pending = 'pending',
// }

export type CreateAndEditMemberType = z.infer<typeof createAndEditMemberSchema>;
export type CreateDeletedMemberType = z.infer<typeof createDeletedMemberSchema>;
export type CreateDeceasedMemberType = z.infer<
  typeof createDeceasedMemberSchema
>;
