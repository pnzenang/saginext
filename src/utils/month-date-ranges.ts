export const dashboardTimeZone = 'America/New_York'

const timeZonePartsFormatter = new Intl.DateTimeFormat('en-US', {
  day: '2-digit',
  hour: '2-digit',
  hourCycle: 'h23',
  minute: '2-digit',
  month: '2-digit',
  second: '2-digit',
  timeZone: dashboardTimeZone,
  year: 'numeric'
})

const getTimeZoneParts = (date: Date) => {
  const parts = timeZonePartsFormatter.formatToParts(date)

  return {
    day: Number(parts.find(part => part.type === 'day')?.value ?? 1),
    hour: Number(parts.find(part => part.type === 'hour')?.value ?? 0),
    minute: Number(parts.find(part => part.type === 'minute')?.value ?? 0),
    month: Number(parts.find(part => part.type === 'month')?.value ?? 1),
    second: Number(parts.find(part => part.type === 'second')?.value ?? 0),
    year: Number(parts.find(part => part.type === 'year')?.value ?? 1970)
  }
}

const getTimeZoneOffsetMs = (date: Date) => {
  const parts = getTimeZoneParts(date)
  const sameWallTimeInUtc = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second)

  return sameWallTimeInUtc - date.getTime()
}

const getZonedMonthBoundary = (year: number, monthIndex: number) => {
  const utcGuess = new Date(Date.UTC(year, monthIndex, 1))

  return new Date(utcGuess.getTime() - getTimeZoneOffsetMs(utcGuess))
}

const getZonedDayBoundary = (year: number, monthIndex: number, day: number) => {
  const utcGuess = new Date(Date.UTC(year, monthIndex, day))

  return new Date(utcGuess.getTime() - getTimeZoneOffsetMs(utcGuess))
}

export const getCurrentMonthDateRange = (now = new Date()) => {
  const { day, month, year } = getTimeZoneParts(now)
  const monthIndex = month - 1
  const monthStart = getZonedMonthBoundary(year, monthIndex)
  const nextMonthStart = getZonedMonthBoundary(year, monthIndex + 1)
  const todayStart = getZonedDayBoundary(year, monthIndex, day)
  const nextDayStart = getZonedDayBoundary(year, monthIndex, day + 1)
  const monthKey = `${year}-${String(month).padStart(2, '0')}`

  return { monthKey, monthStart, nextDayStart, nextMonthStart, todayStart }
}
