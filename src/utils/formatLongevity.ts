import day, { type ConfigType } from 'dayjs'

const formatLongevityUnit = (value: number, unit: string) => `${value} ${unit}`

export const formatLongevity = (startDate: ConfigType, endDate: ConfigType = new Date()) => {
  const start = day(startDate).startOf('day')
  const end = day(endDate).startOf('day')

  if (!start.isValid() || !end.isValid() || start.valueOf() > end.valueOf()) {
    return '0 d'
  }

  const years = end.diff(start, 'year')
  const afterYears = start.add(years, 'year')
  const months = end.diff(afterYears, 'month')
  const afterMonths = afterYears.add(months, 'month')
  const days = end.diff(afterMonths, 'day')

  const longevityParts = [
    years > 0 ? formatLongevityUnit(years, 'yr') : null,
    months > 0 ? formatLongevityUnit(months, 'mo') : null,
    formatLongevityUnit(days, 'd')
  ].filter(Boolean)

  return longevityParts.join(', ')
}
