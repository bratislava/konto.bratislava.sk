import { PhysicalEntity, Prisma } from '@prisma/client'

import { PrismaService } from '../prisma/prisma.service'

export type PhysicalEntityWithUri = Omit<PhysicalEntity, 'uri'> & { uri: string }

export interface UrgentEntityRow { entityId: string; birthNumber: string; externalId: string }

/** SQL `NOW()` — DB-side clock, used as the backoff comparison reference. */
const NOW = Prisma.sql`NOW()`

/**
 * Exponential-backoff eligibility for a `PhysicalEntity`: it has never failed, or its
 * backoff window (`2^min(failCount, 7)` hours after the last failure) has elapsed
 * relative to `reference`. Shared by all UPVS queue selectors so the retry rule lives
 * in one place.
 */
const retryEligible = (reference: Prisma.Sql) => Prisma.sql`(
  "activeEdeskUpdateFailCount" = 0
  OR "activeEdeskUpdateFailedAt" IS NULL
  OR ("activeEdeskUpdateFailedAt" + (POWER(2, LEAST("activeEdeskUpdateFailCount", 7)) * INTERVAL '1 hour') < ${reference})
)`

/**
 * Urgent items: `PhysicalEntity` with a verified `birthNumber` but no `uri` yet,
 * joined to its `User` for the Cognito `externalId`. Backoff relative to `NOW()`.
 */
export async function selectUrgentEntities(
  prismaService: PrismaService,
  limit: number
): Promise<UrgentEntityRow[]> {
  return prismaService.$queryRaw`
      SELECT e."id"          AS "entityId",
             u."birthNumber" AS "birthNumber",
             u."externalId"  AS "externalId"
      FROM "PhysicalEntity" e
               JOIN "User" u ON e."userId" = u."id"
      WHERE e."birthNumber" IS NOT NULL
        AND e."uri" IS NULL
        AND u."birthNumber" IS NOT NULL
        AND ${retryEligible(NOW)}
      ORDER BY GREATEST(e."createdAt", e."activeEdeskUpdateFailedAt") NULLS FIRST
      LIMIT ${limit}
  `
}

/**
 * The next single `PhysicalEntity` whose `uri` is flagged outdated and is eligible to
 * re-resolve. Backoff relative to `NOW()`. Returns `null` when none is due.
 */
export async function selectUriToUpdateInternal(
  prismaService: PrismaService
): Promise<{ uri: string; id: string } | null> {
  const results = await prismaService.$queryRaw<{ uri: string; id: string }[]>`
      SELECT "uri", "id"
      FROM "PhysicalEntity"
      WHERE "uriPossiblyOutdated" = true
        AND ${retryEligible(NOW)}
      LIMIT 1
  `
  return results[0] ?? null
}

/**
 * High-priority items: `PhysicalEntity` with a `uri` whose eDesk status is stale (older
 * than `lookBackDate`) and is eligible to refresh. Backoff relative to `lookBackDate`.
 */
export async function selectHighPriorityEntities(
  prismaService: PrismaService,
  lookBackDate: Date,
  limit: number
): Promise<PhysicalEntityWithUri[]> {
  return prismaService.$queryRaw`
      SELECT e.*
      FROM "PhysicalEntity" e
      WHERE "userId" IS NOT NULL
        AND "uri" IS NOT NULL
        AND ("activeEdeskUpdatedAt" IS NULL OR "activeEdeskUpdatedAt" < ${lookBackDate})
        AND ${retryEligible(Prisma.sql`${lookBackDate}`)}
      ORDER BY GREATEST("createdAt", "activeEdeskUpdatedAt", "activeEdeskUpdateFailedAt") NULLS FIRST
      LIMIT ${limit}
  `
}
