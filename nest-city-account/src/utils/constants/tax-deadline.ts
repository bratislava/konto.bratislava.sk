import { DateTime } from 'luxon'

export function getTaxDeadlineDate(): Date {
  return DateTime.now()
    .setZone('Europe/Bratislava')
    .set({ month: Number(process.env.MUNICIPAL_TAX_LOCK_MONTH), day: Number(process.env.MUNICIPAL_TAX_LOCK_DAY), hour: 0, minute: 0, second: 0, millisecond: 0 })
    .toJSDate()
}
