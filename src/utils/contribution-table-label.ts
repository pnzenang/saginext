const monthFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'long'
})

const getSafeDate = (value?: Date | string | null) => {
  if (!value) return new Date()

  const date = value instanceof Date ? value : new Date(value)

  return Number.isNaN(date.getTime()) ? new Date() : date
}

export const getContributionTableLabel = (value?: Date | string | null) => {
  const monthName = monthFormatter.format(getSafeDate(value))

  return `${monthName}'s Contribution Table`
}
