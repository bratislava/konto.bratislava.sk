import { PhysicalEntity, Prisma } from '@prisma/client'

import { PrismaService } from '../prisma/prisma.service'

export type PhysicalEntityWithUri = Omit<PhysicalEntity, 'uri'> & { uri: string }

export interface UrgentEntityRow {
  entityId: string
  birthNumber: string
  externalId: string
}

const NOW = Prisma.sql`NOW()`

/** How stale a high-priority entity's eDesk status may be before refresh. */
const CACHE_TTL_HOURS = 144

const CACHE_STALE_BEFORE = Prisma.sql`(NOW() - ${CACHE_TTL_HOURS} * INTERVAL '1 hour')`

/**
 * Whether a `PhysicalEntity` is clear to retry under exponential backoff.
 *
 * True when:
 *  - it has no recorded failure, or
 *  - its backoff window has elapsed: `2^min(failCount, 7)` hours past the last
 *    failure, measured against `reference`.
 */
const retryEligible = (reference: Prisma.Sql) => Prisma.sql`(
  "activeEdeskUpdateFailCount" = 0
  OR "activeEdeskUpdateFailedAt" IS NULL
  OR ("activeEdeskUpdateFailedAt" + (POWER(2, LEAST("activeEdeskUpdateFailCount", 7)) * INTERVAL '1 hour') < ${reference})
)`

/**
 * Returns urgent items: `PhysicalEntity` rows with a verified `birthNumber` but
 * no `uri`, joined to their `User` for the Cognito `externalId`. Excludes
 * IAM-rejected entities and those still in backoff (relative to `NOW()`).
 */
export async function selectUrgentEntities(
  prismaService: PrismaService,
  limit: number
): Promise<UrgentEntityRow[]> {
  return prismaService.$queryRaw`SELECT e."id"       AS "entityId",
    u."birthNumber" AS "birthNumber",
    u."externalId"  AS "externalId"
FROM
    "PhysicalEntity" e
    JOIN "User" u ON e."userId" = u."id"
WHERE
    e."birthNumber" IS NOT NULL
    AND e."uri" IS NULL
    AND u."birthNumber" IS NOT NULL
    AND NOT EXISTS
        (SELECT 1
         FROM
             "IdentityLookupRejection" r
         WHERE
             r."physicalEntityId" = e."id")
    AND \${retryEligible(NOW)}
ORDER BY
    GREATEST(e."createdAt", e."activeEdeskUpdateFailedAt") NULLS FIRST
LIMIT \${limit}
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
 * than `CACHE_TTL_HOURS`) and is eligible to refresh. Backoff relative to the same
 * staleness cutoff, so a failed refresh waits out TTL + backoff before the next attempt.
 */
export async function selectHighPriorityEntities(
  prismaService: PrismaService,
  limit: number
): Promise<PhysicalEntityWithUri[]> {
  return prismaService.$queryRaw`
      SELECT e.*
      FROM "PhysicalEntity" e
      WHERE "userId" IS NOT NULL
        AND "uri" IS NOT NULL
        AND ("activeEdeskUpdatedAt" IS NULL OR "activeEdeskUpdatedAt" < ${CACHE_STALE_BEFORE})
        AND ${retryEligible(CACHE_STALE_BEFORE)}
      ORDER BY GREATEST("createdAt", "activeEdeskUpdatedAt", "activeEdeskUpdateFailedAt") NULLS FIRST
      LIMIT ${limit}
  `
}
