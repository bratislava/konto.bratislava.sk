export const BRATISLAVA_TIME_ZONE = 'Europe/Bratislava'

/**
 * TODO: Prisma and raw SQL parameters take `Date`. This converts at that boundary, so
 * the date math before it runs on Temporal. Fix when Prisma supports Temporal.
 */
export const toDate = (dateTime: Temporal.ZonedDateTime | Temporal.Instant): Date =>
  new Date(dateTime.epochMilliseconds)

export const nowInBratislava = (): Temporal.ZonedDateTime =>
  Temporal.Now.zonedDateTimeISO(BRATISLAVA_TIME_ZONE)

export const endOfDay = (dateTime: Temporal.ZonedDateTime): Temporal.ZonedDateTime =>
  dateTime.startOfDay().add({ days: 1 }).subtract({ milliseconds: 1 })
