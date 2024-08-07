import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import localizedFormat from 'dayjs/plugin/localizedFormat'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(customParseFormat)
dayjs.extend(localizedFormat)

const bratislavaTimezone = 'Europe/Bratislava'

export function parseDate(date: string | any, format: string) {
  if (typeof date !== 'string') {
    return
  }

  // When using dayjs.tz, if the date is not in the correct format, it throws an error:
  // RangeError: Invalid time value
  // This behavior is unexpected because when no timezone is used, dayjs returns a date object
  // with the isValid() method returning `false` instead of throwing an error.
  try {
    const parsedDate = dayjs.tz(date, format, bratislavaTimezone)
    // tz doesn't support `strict` parsing as last parameter
    const isStrictlyParsed = parsedDate.format(format) === date
    if (parsedDate.isValid() && isStrictlyParsed) {
      return parsedDate.toDate()
    }
  } catch (error) {}
}

export function formatDate(date: Date | undefined, format: string) {
  if (!date) {
    return
  }

  return dayjs(date).tz(bratislavaTimezone).format(format)
}

export function formatDatePdf(date: Date | undefined) {
  if (!date) {
    return
  }

  return dayjs(date).tz(bratislavaTimezone).format('DD.MM.YYYY')
}

// TODO comment
export function fixDate(date: Date) {
  return dayjs(date).tz(bratislavaTimezone).toDate()
}
