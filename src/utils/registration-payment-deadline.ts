export const registrationPaymentDeadlineDays = 60
export const registrationPaymentDeadlineLabel = 'sixty (60) days'

const millisecondsPerDay = 24 * 60 * 60 * 1000

export const getRegistrationPaymentDeadline = (memberCreatedAt: Date | string) => {
  const createdAt = new Date(memberCreatedAt)

  return new Date(createdAt.getTime() + registrationPaymentDeadlineDays * millisecondsPerDay)
}
