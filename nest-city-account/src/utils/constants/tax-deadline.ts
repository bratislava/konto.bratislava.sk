import { DateTime } from 'luxon'

import getBaConfigInstance from '../../config/ba-config.instance'

export function getTaxDeadlineDate(): Date {
  const { month, day } = getBaConfigInstance().taxDeadline

  return DateTime.now()
    .setZone('Europe/Bratislava')
    .set({
      month,
      day,
      hour: 0,
      minute: 0,
      second: 0,
      millisecond: 0,
    })
    .toJSDate()
}
