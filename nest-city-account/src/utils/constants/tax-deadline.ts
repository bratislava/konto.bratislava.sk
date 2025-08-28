import { DateTime } from 'luxon'
import { ConfigService } from "@nestjs/config";

const MUNICIPAL_TAX_LOCK_MONTH = Number(new ConfigService().getOrThrow('MUNICIPAL_TAX_LOCK_MONTH'))
const MUNICIPAL_TAX_LOCK_DAY = Number(new ConfigService().getOrThrow('MUNICIPAL_TAX_LOCK_DAY') )

export function getTaxDeadlineDate(): Date {
  return DateTime.now()
    .setZone('Europe/Bratislava')
    .set({
      month: MUNICIPAL_TAX_LOCK_MONTH,
      day: MUNICIPAL_TAX_LOCK_DAY,
      hour: 0,
      minute: 0,
      second: 0,
      millisecond: 0,
    })
    .toJSDate()
}
