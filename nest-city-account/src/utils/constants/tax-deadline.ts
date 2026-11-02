import getBaConfigInstance from '../../config/ba-config.instance'
import { BRATISLAVA_TIME_ZONE, toDate } from '../functions/temporal'

export function getTaxDeadlineDate(): Date {
  const { month, day } = getBaConfigInstance().taxDeadline

  return toDate(
    Temporal.ZonedDateTime.from({
      timeZone: BRATISLAVA_TIME_ZONE,
      year: Temporal.Now.zonedDateTimeISO(BRATISLAVA_TIME_ZONE).year,
      month,
      day,
    })
  )
}
