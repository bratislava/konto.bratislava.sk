import { DateTime } from "luxon"

export function getTaxDeadlineDate(): Date {
  return DateTime.now()
    .set({ month: 4, day: 1, hour: 0, minute: 0, second: 0, millisecond: 0 })
    .setZone('Europe/Bratislava')
    .toJSDate()
}
