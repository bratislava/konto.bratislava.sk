import { DateTime } from 'luxon'

export function getTaxDeadlineDate(): Date {
  return DateTime.now()
    .setZone('Europe/Bratislava')
    .set({ month: process.env.MUNICIPAL_TAX_LOCK_MONTH, day: process.env.MUNICIPAL_TAX_LOCK_DAY, hour: 0, minute: 0, second: 0, millisecond: 0 })
    .toJSDate()
}
