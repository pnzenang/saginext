import day, { type ConfigType } from 'dayjs'

type LongevityLanguage = 'en' | 'fr'

const getLongevityUnits = (language: LongevityLanguage, years: number) =>
  language === 'fr'
    ? {
        years: years > 1 ? 'ans' : 'an',
        months: 'mois',
        days: 'j'
      }
    : {
        years: 'yr',
        months: 'mo',
        days: 'd'
      }

const formatLongevityUnit = (value: number, unit: string) => `${value} ${unit}`

export const formatLongevityInDays = (
  startDate: ConfigType,
  endDate: ConfigType = new Date(),
  language: LongevityLanguage = 'en'
) => {
  const start = day(startDate).startOf('day')
  const end = day(endDate).startOf('day')
  const units = getLongevityUnits(language, 0)

  if (!start.isValid() || !end.isValid() || start.valueOf() > end.valueOf()) {
    return formatLongevityUnit(0, units.days)
  }

  return formatLongevityUnit(end.diff(start, 'day'), units.days)
}

export const formatLongevity = (
  startDate: ConfigType,
  endDate: ConfigType = new Date(),
  language: LongevityLanguage = 'en'
) => {
  const start = day(startDate).startOf('day')
  const end = day(endDate).startOf('day')

  if (!start.isValid() || !end.isValid() || start.valueOf() > end.valueOf()) {
    return language === 'fr' ? '0 j' : '0 d'
  }

  const years = end.diff(start, 'year')
  const afterYears = start.add(years, 'year')
  const months = end.diff(afterYears, 'month')
  const afterMonths = afterYears.add(months, 'month')
  const days = end.diff(afterMonths, 'day')
  const units = getLongevityUnits(language, years)

  const longevityParts = [
    years > 0 ? formatLongevityUnit(years, units.years) : null,
    months > 0 ? formatLongevityUnit(months, units.months) : null,
    formatLongevityUnit(days, units.days)
  ].filter(Boolean)

  return longevityParts.join(', ')
}
