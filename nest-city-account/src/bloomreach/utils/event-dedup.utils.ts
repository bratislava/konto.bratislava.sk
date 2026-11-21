import { Prisma } from '../../generated/prisma/client'
import { BloomreachEventCommandData, BloomreachEventNameEnum } from '../bloomreach.types'

/**
 * Parts identifying the dedup key of a `customers/events` command, in lock-key order.
 */
export function eventDedupKeyParts(data: BloomreachEventCommandData): string[] {
  return data.event_type === BloomreachEventNameEnum.CONSENT
    ? [data.event_type, data.properties.category]
    : [data.event_type]
}

/** `commandData` conditions matching outbox entries with the same dedup key as `data`. */
export function eventDedupWhere(
  data: BloomreachEventCommandData
): Prisma.BloomreachOutboxWhereInput[] {
  const conditions: Prisma.BloomreachOutboxWhereInput[] = [
    { commandData: { path: ['event_type'], equals: data.event_type } },
  ]
  if (data.event_type === BloomreachEventNameEnum.CONSENT) {
    conditions.push({
      commandData: { path: ['properties', 'category'], equals: data.properties.category },
    })
  }
  return conditions
}
