import day, { type ConfigType } from 'dayjs'

const formatLongevityUnit = (value: number, unit: string) => `${value} ${unit}${value === 1 ? '' : 's'}`

export const formatLongevity = (startDate: ConfigType, endDate: ConfigType = new Date()) => {
  const start = day(startDate).startOf('day')
  const end = day(endDate).startOf('day')

  if (!start.isValid() || !end.isValid() || start.valueOf() > end.valueOf()) {
    return '0 years, 0 months, and 0 days'
  }

  const years = end.diff(start, 'year')
  const afterYears = start.add(years, 'year')
  const months = end.diff(afterYears, 'month')
  const afterMonths = afterYears.add(months, 'month')
  const days = end.diff(afterMonths, 'day')

  return [
    formatLongevityUnit(years, 'year'),
    formatLongevityUnit(months, 'month'),
    `and ${formatLongevityUnit(days, 'day')}`
  ].join(', ')
}
