import { DateTime } from "luxon"

export function getTaxDeadlineDate(): Date {
  const year = new Date().getFullYear()
  return DateTime.fromISO(`${year}-04-01T00:00:00`, {
    zone: 'Europe/Bratislava'
  }).toJSDate()
}
