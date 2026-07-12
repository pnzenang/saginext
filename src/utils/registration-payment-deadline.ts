export const registrationPaymentDeadlineDays = 60
export const registrationPaymentDeadlineLabel = 'sixty (60) days'

type DeadlineLanguage = 'en' | 'fr'

const millisecondsPerDay = 24 * 60 * 60 * 1000

export const getRegistrationPaymentDeadline = (memberCreatedAt: Date | string) => {
  const createdAt = new Date(memberCreatedAt)

  return new Date(createdAt.getTime() + registrationPaymentDeadlineDays * millisecondsPerDay)
}

const startOfLocalDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate())

const formatDayCount = (days: number, language: DeadlineLanguage) =>
  language === 'fr' ? `${days} jour${days === 1 ? '' : 's'}` : `${days} day${days === 1 ? '' : 's'}`

export const getOverdueRegistrationPaymentCreatedAtCutoff = (now = new Date()) =>
  new Date(startOfLocalDay(now).getTime() - registrationPaymentDeadlineDays * millisecondsPerDay)

export const getRegistrationPaymentCountdown = (memberCreatedAt: Date | string, now = new Date()) => {
  const deadline = getRegistrationPaymentDeadline(memberCreatedAt)

  const daysRemaining = Math.ceil(
    (startOfLocalDay(deadline).getTime() - startOfLocalDay(now).getTime()) / millisecondsPerDay
  )

  return {
    deadline,
    daysRemaining
  }
}

export const getRegistrationPaymentCountdownLabel = (daysRemaining: number, language: DeadlineLanguage = 'en') => {
  if (daysRemaining > 0) {
    return language === 'fr'
      ? `${formatDayCount(daysRemaining, language)} restant${daysRemaining === 1 ? '' : 's'}`
      : `${formatDayCount(daysRemaining, language)} remaining`
  }

  if (daysRemaining === 0) return language === 'fr' ? "Échéance aujourd'hui" : 'Due today'

  return language === 'fr'
    ? `En retard de ${formatDayCount(Math.abs(daysRemaining), language)}`
    : `Overdue by ${formatDayCount(Math.abs(daysRemaining), language)}`
}
