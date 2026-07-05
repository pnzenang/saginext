export const registrationPaymentDeadlineDays = 60
export const registrationPaymentDeadlineLabel = 'sixty (60) days'
export const registrationPaymentWarningTitle = 'Pending member deadline:'
export const registrationPaymentWarningDescription = `Pending members have ${registrationPaymentDeadlineLabel} to send the registration fee. If the fee is not received within ${registrationPaymentDeadlineLabel}, the pending member will be deleted.`

const millisecondsPerDay = 24 * 60 * 60 * 1000

export const getRegistrationPaymentDeadline = (memberCreatedAt: Date | string) => {
  const createdAt = new Date(memberCreatedAt)

  return new Date(createdAt.getTime() + registrationPaymentDeadlineDays * millisecondsPerDay)
}
