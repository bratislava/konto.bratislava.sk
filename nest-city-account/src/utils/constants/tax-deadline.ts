import { DateTime } from 'luxon'
import { ConfigService } from "@nestjs/config";

let configService: ConfigService | null = null

function getConfigService(): ConfigService {
  return configService ??= new ConfigService()
}

export function getTaxDeadlineDate(): Date {
  const config = getConfigService()
  const MUNICIPAL_TAX_LOCK_MONTH = Number(config.getOrThrow('MUNICIPAL_TAX_LOCK_MONTH'))
  const MUNICIPAL_TAX_LOCK_DAY = Number(config.getOrThrow('MUNICIPAL_TAX_LOCK_DAY') )

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
