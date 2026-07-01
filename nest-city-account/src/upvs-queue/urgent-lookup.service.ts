import { HttpException, HttpStatus, Injectable } from '@nestjs/common'

import { LookupIdentityFOResult, NasesService } from '../nases/nases.service'
import { PhysicalEntityService } from '../physical-entity/physical-entity.service'
import { PrismaService } from '../prisma/prisma.service'
import { toLogfmt } from '../utils/logging'
import { CognitoSubservice } from '../utils/subservices/cognito.subservice'
import { LineLoggerSubservice } from '../utils/subservices/line-logger.subservice'
import { selectUrgentEntities, UrgentEntityRow } from './upvs-queue.queries'

/** A resolved urgent identity paired with the entity it was resolved for. */
interface UrgentSuccess {
  entityId: string
  identity: LookupIdentityFOResult
}

/** Outcome of resolving a single urgent entity. */
type UrgentResolution =
  | { outcome: 'success'; success: UrgentSuccess }
  | { outcome: 'failure'; entityId: string; reason: string; fields?: Record<string, unknown> }
  | { outcome: 'rateLimited' }

/** Accumulated outcomes across one urgent run. */
interface UrgentRunResult {
  successes: UrgentSuccess[]
  failedIds: string[]
  failures: Record<string, unknown>[]
  rateLimited: boolean
}

@Injectable()
export class UrgentLookupService {
  private readonly logger = new LineLoggerSubservice(UrgentLookupService.name)

  // Urgent (per-person lookup) budget, independent of the URI-search BATCH_SIZE.
  private readonly URGENT_BATCH_SIZE = 50

  constructor(
    private readonly prismaService: PrismaService,
    private readonly physicalEntityService: PhysicalEntityService,
    private readonly nasesService: NasesService,
    private readonly cognitoSubservice: CognitoSubservice
  ) {}

  /**
   * Resolve UPVS identities for urgent items (`PhysicalEntity` with a verified
   * `birthNumber` but no `uri`) via the per-person lookup endpoint, sequentially.
   * Stops early when the lookup endpoint answers HTTP 429. See the README for the
   * full flow.
   *
   * Orchestration only: select → resolve each → persist → report. The work lives in the
   * helpers below.
   *
   * @returns `attempted` - entities tried (success + failure, excluding those skipped on
   *   a rate limit); `rateLimited` - whether the run stopped on a 429; `failures` - the
   *   per-entity failures, for the caller to fold into its batch report.
   */
  async processUrgentItems(): Promise<{
    attempted: number
    rateLimited: boolean
    failures: Record<string, unknown>[]
  }> {
    const entities = await selectUrgentEntities(this.prismaService, this.URGENT_BATCH_SIZE)

    if (entities.length === 0) {
      return { attempted: 0, rateLimited: false, failures: [] }
    }

    const run = await this.resolveUrgentEntities(entities)
    await this.saveUrgentResults(run)

    const attempted = run.successes.length + run.failedIds.length
    if (run.rateLimited) {
      this.logRateLimited(run, entities.length, attempted)
    }

    return { attempted, rateLimited: run.rateLimited, failures: run.failures }
  }

  /**
   * Process entities one at a time, accumulating outcomes. Stops at the first rate limit
   * so the remaining entities are left for the next tick.
   */
  private async resolveUrgentEntities(entities: UrgentEntityRow[]): Promise<UrgentRunResult> {
    const run: UrgentRunResult = {
      successes: [],
      failedIds: [],
      failures: [],
      rateLimited: false,
    }

    for (const entity of entities) {
      // eslint-disable-next-line no-await-in-loop -- intentionally sequential: keeps the load on the lookup endpoint steady and lets the run stop cleanly at the first rate limit
      const resolution = await this.resolveUrgentEntity(entity)

      if (resolution.outcome === 'rateLimited') {
        run.rateLimited = true
        break
      }
      if (resolution.outcome === 'success') {
        run.successes.push(resolution.success)
      } else {
        run.failedIds.push(resolution.entityId)
        run.failures.push({
          entityId: resolution.entityId,
          reason: resolution.reason,
          ...resolution.fields,
        })
      }
    }

    return run
  }

  /**
   * Resolve a single entity: Cognito attributes → UPVS per-person lookup → URI. Returns a
   * `rateLimited` outcome on HTTP 429 (the endpoint is throttling us), a `failure` for any
   * other problem, or the resolved identity on success.
   */
  private async resolveUrgentEntity(entity: UrgentEntityRow): Promise<UrgentResolution> {
    try {
      const cognitoUser = await this.cognitoSubservice.getDataFromCognito(entity.externalId)

      if (!cognitoUser.given_name || !cognitoUser.family_name) {
        return {
          outcome: 'failure',
          entityId: entity.entityId,
          reason: 'Missing given_name or family_name in Cognito user data',
          fields: { externalId: entity.externalId },
        }
      }

      const identity = await this.nasesService.lookupIdentityFO(
        entity.birthNumber.replaceAll('/', ''),
        cognitoUser.given_name,
        cognitoUser.family_name,
        entity.entityId
      )

      if (!identity.uri) {
        return {
          outcome: 'failure',
          entityId: entity.entityId,
          reason: 'Identity lookup returned no URI',
        }
      }

      return {
        outcome: 'success',
        success: { entityId: entity.entityId, identity },
      }
    } catch (error) {
      if (
        error instanceof HttpException &&
        (error.getStatus() as HttpStatus) === HttpStatus.TOO_MANY_REQUESTS
      ) {
        return { outcome: 'rateLimited' }
      }
      return {
        outcome: 'failure',
        entityId: entity.entityId,
        reason: 'Lookup failed',
        fields: { error: toLogfmt(error) },
      }
    }
  }

  /**
   * Write resolved URIs and bump the fail counter for failures.
   */
  private async saveUrgentResults(run: UrgentRunResult): Promise<void> {
    if (run.successes.length > 0) {
      await this.physicalEntityService.updateSuccessfulActiveEdeskUpdateInDatabase(
        run.successes.map(({ entityId, identity }) => ({
          physicalEntityId: entityId,
          uri: identity.uri,
          edeskStatus: identity.upvs?.edesk_status,
        }))
      )
    }
    if (run.failedIds.length > 0) {
      await this.physicalEntityService.updateFailedActiveEdeskUpdateInDatabase(run.failedIds)
    }
  }

  private logRateLimited(run: UrgentRunResult, total: number, attempted: number): void {
    this.logger.error({
      event: 'upvs_lookup_rate_limited',
      attempted,
      total,
      succeeded: run.successes.length,
      failed: run.failedIds.length,
      alert: 1,
      ...(run.failures.length > 0 ? { failures: run.failures } : {}),
    })
  }
}
