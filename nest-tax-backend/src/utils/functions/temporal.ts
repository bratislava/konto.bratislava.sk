export const BRATISLAVA_TIME_ZONE = 'Europe/Bratislava'

export const toInstant = (date: Date): Temporal.Instant =>
  Temporal.Instant.fromEpochMilliseconds(date.getTime())

export const toBratislavaDateTime = (date: Date): Temporal.ZonedDateTime =>
  toInstant(date).toZonedDateTimeISO(BRATISLAVA_TIME_ZONE)

export const nowInBratislava = (): Temporal.ZonedDateTime =>
  Temporal.Now.zonedDateTimeISO(BRATISLAVA_TIME_ZONE)

export const toDate = (
  dateTime: Temporal.ZonedDateTime | Temporal.Instant,
): Date => new Date(dateTime.epochMilliseconds)

type Moment = Temporal.ZonedDateTime | Temporal.Instant | Date

const momentToInstant = (moment: Moment): Temporal.Instant => {
  if (moment instanceof Date) {
    return toInstant(moment)
  }
  if (moment instanceof Temporal.ZonedDateTime) {
    return moment.toInstant()
  }
  return moment
}

const compareDates = (
  a: Moment | Temporal.PlainDate,
  b: Moment | Temporal.PlainDate,
): number => {
  if (a instanceof Temporal.PlainDate && b instanceof Temporal.PlainDate) {
    return Temporal.PlainDate.compare(a, b)
  }
  if (a instanceof Temporal.PlainDate || b instanceof Temporal.PlainDate) {
    throw new TypeError('A calendar date cannot be compared with a moment.')
  }
  return Temporal.Instant.compare(momentToInstant(a), momentToInstant(b))
}

export function isBefore(a: Temporal.PlainDate, b: Temporal.PlainDate): boolean
export function isBefore(a: Moment, b: Moment): boolean
export function isBefore(
  a: Moment | Temporal.PlainDate,
  b: Moment | Temporal.PlainDate,
): boolean {
  return compareDates(a, b) < 0
}

export function isAfter(a: Temporal.PlainDate, b: Temporal.PlainDate): boolean
export function isAfter(a: Moment, b: Moment): boolean
export function isAfter(
  a: Moment | Temporal.PlainDate,
  b: Moment | Temporal.PlainDate,
): boolean {
  return compareDates(a, b) > 0
}

/** Temporal numbers the days of the week from Monday = 1 to Sunday = 7. */
const SATURDAY = 6

export const isWeekend = (
  date: Temporal.PlainDate | Temporal.ZonedDateTime,
): boolean => date.dayOfWeek >= SATURDAY

export const endOfDay = (
  dateTime: Temporal.ZonedDateTime,
): Temporal.ZonedDateTime =>
  dateTime.startOfDay().add({ days: 1 }).subtract({ milliseconds: 1 })

const padTwoDigits = (value: number) => String(value).padStart(2, '0')

/** Formats a date as `DD.MM.YYYY`, the way dates are written in Slovak. */
export const formatSlovakDate = (date: Temporal.PlainDate): string =>
  `${padTwoDigits(date.day)}.${padTwoDigits(date.month)}.${date.year}`

/** Formats a date as `DDMMYYYY`, e.g. `24012025`. */
export const formatDDMMYYYY = (date: Temporal.PlainDate): string =>
  `${padTwoDigits(date.day)}${padTwoDigits(date.month)}${date.year}`

/** Formats a date as `YYMMDD`, e.g. `250124`. */
export const formatYYMMDD = (date: Temporal.PlainDate): string =>
  `${padTwoDigits(date.year % 100)}${padTwoDigits(date.month)}${padTwoDigits(date.day)}`
