import { memberStatus } from './types'

export const awaitingPublicationVestingLongevityDays = 60
export const pendingRegistrationDeadlineDays = 60

const millisecondsPerDay = 24 * 60 * 60 * 1000

export const getAwaitingPublicationVestingCutoff = (now = new Date()) =>
  new Date(now.getTime() - awaitingPublicationVestingLongevityDays * millisecondsPerDay)

export const getPendingRegistrationCutoff = (now = new Date()) =>
  new Date(now.getTime() - pendingRegistrationDeadlineDays * millisecondsPerDay)

export const getPendingRegistrationDeadline = (createdAt: Date | string) => {
  const startDate = new Date(createdAt)

  if (Number.isNaN(startDate.getTime())) {
    return null
  }

  return new Date(startDate.getTime() + pendingRegistrationDeadlineDays * millisecondsPerDay)
}

export const getPendingRegistrationDaysRemaining = (createdAt: Date | string, now = new Date()) => {
  const deadline = getPendingRegistrationDeadline(createdAt)

  if (!deadline) {
    return 0
  }

  return Math.max(0, Math.ceil((deadline.getTime() - now.getTime()) / millisecondsPerDay))
}

export const isPendingRegistrationExpired = (
  member: { createdAt: Date | string; memberStatus?: string | null },
  now = new Date()
) => {
  const createdAt = new Date(member.createdAt).getTime()

  return (
    member.memberStatus === memberStatus.Pending &&
    Number.isFinite(createdAt) &&
    createdAt <= getPendingRegistrationCutoff(now).getTime()
  )
}
