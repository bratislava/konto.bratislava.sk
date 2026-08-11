import dayjs from 'dayjs'

import { BloomreachOutboxStatus } from '../../generated/prisma/enums'
import type * as Prisma from '../../generated/prisma/internal/prismaNamespace'

/**
 * Bloomreach processes delivered commands in a queue. Typically within ~10
 * seconds, up to 8 hours at worst. A COMPLETED entry this recent may not be
 * visible in exports yet and must still count as in flight.
 */
export const ANONYMIZE_PROPAGATION_WINDOW_HOURS = 8

/**
 * Matches outbox entries that are still live (PENDING/PROCESSING) or were
 * COMPLETED recently enough that Bloomreach's export may not reflect them
 * yet - the local-outbox compensation for Bloomreach's export lag.
 */
export function isLiveOrRecentlyCompleted(
  propagationWindowHours: number = ANONYMIZE_PROPAGATION_WINDOW_HOURS
): Prisma.BloomreachOutboxWhereInput['OR'] {
  return [
    { status: { in: [BloomreachOutboxStatus.PENDING, BloomreachOutboxStatus.PROCESSING] } },
    {
      status: BloomreachOutboxStatus.COMPLETED,
      updatedAt: { gte: dayjs().subtract(propagationWindowHours, 'hour').toDate() },
    },
  ]
}
