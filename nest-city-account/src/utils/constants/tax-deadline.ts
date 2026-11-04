import getBaConfigInstance from '../../config/ba-config.instance'
import { BRATISLAVA_TIME_ZONE, nowInBratislava, toDate } from '../functions/temporal'

export function getTaxDeadlineDate(): Date {
  const { month, day } = getBaConfigInstance().taxDeadline

  return toDate(
    Temporal.ZonedDateTime.from({
      timeZone: BRATISLAVA_TIME_ZONE,
      year: nowInBratislava().year,
      month,
      day,
    })
  )
}
