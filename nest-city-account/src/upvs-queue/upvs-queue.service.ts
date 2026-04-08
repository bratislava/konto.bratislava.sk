import { Injectable } from '@nestjs/common'
import { PhysicalEntity, QueueItemStatusEnum } from '@prisma/client'
import { PrismaService } from '../prisma/prisma.service'
import { PhysicalEntityService } from '../physical-entity/physical-entity.service'
import { CreateManyParam, CreateManyResult, NasesService } from '../nases/nases.service'
import { LineLoggerSubservice } from '../utils/subservices/line-logger.subservice'
import { CognitoSubservice } from '../utils/subservices/cognito.subservice'
import dayjs from 'dayjs'
import { toLogfmt } from '../utils/logging'
import ThrowerErrorGuard from '../utils/guards/errors.guard'
import { MagproxyErrorsEnum } from '../magproxy/magproxy.errors.enum'
import { parseName } from '../magproxy/dtos/uri'
import { ErrorsEnum } from '../utils/guards/dtos/error.dto'

@Injectable()
export class UpvsQueueService {
  private readonly logger: LineLoggerSubservice

  private readonly CACHE_TTL_HOURS = 144 // Configurable cache TTL

  private readonly BATCH_SIZE = 8 // 8 requests per batch

  private readonly HIGH_PRIORITY_RESERVED_SLOTS = 5 // Reserve 5 slots for high priority

  constructor(
    private readonly prismaService: PrismaService,
    private readonly physicalEntityService: PhysicalEntityService,
    private readonly nasesService: NasesService,
    private readonly cognitoSubservice: CognitoSubservice,
    private readonly throwerErrorGuard: ThrowerErrorGuard
  ) {
    this.logger = new LineLoggerSubservice(UpvsQueueService.name)
  }

  async addExternalItemsToQueue(
    records: { uri: string; norisId: number; newUri: string | undefined }[]
  ) {
    await this.prismaService.externalEdeskCheck.createMany({
      data: records,
      skipDuplicates: true,
    })
  }

  async getNumberOfPendingExternalItemsInQueue(): Promise<number> {
    return this.prismaService.externalEdeskCheck.count({
      where: {
        queueStatus: QueueItemStatusEnum.PENDING,
      },
    })
  }

  async retrieveCompletedAndFailedExternalItems(limit: number) {
    return this.prismaService.externalEdeskCheck.findMany({
      where: {
        queueStatus: { in: [QueueItemStatusEnum.COMPLETED, QueueItemStatusEnum.FAILED] },
      },
      take: limit,
      orderBy: { createdAt: 'asc' },
    })
  }

  /**
   * Process one batch of queue items according to priority rules
   * Returns the number of items processed from each queue
   */
  async processBatch(): Promise<void> {
    const result = {
      message: 'Upvs queue report.',
      urgentProcessed: 0,
      highPriorityProcessed: 0,
      externalProcessed: 0,
      totalProcessed: 0,
      errors: [] as string[],
    }

    // If there is at least one URI in database flagged as outdated, we need to update it.
    // TODO this should be calling endpoint for getting identity when available in slovensko-digital container
    const uriToUpdateInternal = await this.getUriToUpdateInternal()
    if (uriToUpdateInternal && uriToUpdateInternal.uri && uriToUpdateInternal.id) {
      await this.handleUriUpdateInternal({
        id: uriToUpdateInternal.id,
        uri: uriToUpdateInternal.uri,
      })
      result.highPriorityProcessed = 1
      this.logger.log(result)
      return
    }
    const uriToUpdateExternal = await this.getUriToUpdateExternal()
    if (uriToUpdateExternal && uriToUpdateExternal.uri) {
      await this.handleUriUpdateExternal(uriToUpdateExternal.uri)
      result.externalProcessed = 1
      this.logger.log(result)
      return
    }

    // If no individual URI requires update, we can continue with regular batch processing
    try {
      const { urgentItems, highPriorityItems, externalItems } = await this.getItemsByPriority()

      const createManyJoinedInput: CreateManyParam = [
        ...urgentItems,
        ...highPriorityItems,
        ...externalItems,
      ]

      if (createManyJoinedInput.length === 0) {
        this.logger.log(result)
        return
      }

      const upvsResult = await this.nasesService.createMany(createManyJoinedInput)

      const externalUris = new Set(externalItems.map((item) => item.uri))
      await this.handleSuccessfulUpdates(upvsResult, externalUris)
      await this.handleFailureCases(upvsResult, externalUris)

      // update result counters
      result.urgentProcessed = urgentItems.length
      result.highPriorityProcessed = highPriorityItems.length
      result.externalProcessed = externalItems.length
      result.totalProcessed = createManyJoinedInput.length
    } catch (error) {
      this.logger.error('Error processing batch', error)
      result.errors.push('\n\n'.concat(toLogfmt(error)))
    }

    this.logger.log(result)
    return
  }

  private async handleSuccessfulUpdates(upvsResult: CreateManyResult, externalUris: Set<string>) {
    // Success: separate urgent and high priority from external
    // Filters are not strict, because any potential overlap will not cause any issues
    const successInternal = upvsResult.success.filter((item) => !!item.physicalEntityId)
    const successExternal = upvsResult.success.filter((item) => externalUris.has(item.inputUri))

    // handle success
    await this.physicalEntityService.updateSuccessfulActiveEdeskUpdateInDatabase(successInternal)

    // handle success external
    await Promise.all(
      successExternal.map(async (item) => {
        await this.prismaService.externalEdeskCheck.updateMany({
          where: { uri: item.inputUri },
          data: {
            queueStatus: QueueItemStatusEnum.COMPLETED,
            upvsStatus: item.data.status ?? null,
            edeskStatus: item.data.upvs?.edesk_status ?? null,
            edeskNumber: item.data.upvs?.edesk_number ?? null,
            processedAt: new Date(),
            newUri: item.inputUri !== item.data.uri ? item.data.uri : undefined,
          },
        })
      })
    )
  }

  private async getItemsByPriority() {
    let remainingSlots = this.BATCH_SIZE

    // Get all urgent items (up to capacity)
    const urgentItems = await this.getUrgentQueueItems(remainingSlots)
    remainingSlots = remainingSlots - urgentItems.length

    // Get high priority items (up to reservation)
    const highPrioritySlots = Math.min(this.HIGH_PRIORITY_RESERVED_SLOTS, remainingSlots)
    const highPriorityItems = await this.getHighPriorityQueueItems(highPrioritySlots)

    // If high priority doesn't fill reservation, give to external queue
    remainingSlots = remainingSlots - highPriorityItems.length
    const externalItems = await this.getExternalQueueItems(remainingSlots)
    return { urgentItems, highPriorityItems, externalItems }
  }

  private async handleFailureCases(upvsResult: CreateManyResult, externalUris: Set<string>) {
    const failedWithPossibleUriChange = upvsResult.failed.filter((item) => item.possibleUriChange)
    const failed = upvsResult.failed.filter((item) => !item.possibleUriChange)

    // Requeue possible URI changes
    if (failedWithPossibleUriChange.length > 0) {
      await this.prismaService.externalEdeskCheck.updateMany({
        where: {
          uri: { in: failedWithPossibleUriChange.map((item) => item.inputUri) },
          queueStatus: QueueItemStatusEnum.PENDING,
        },
        data: {
          queueStatus: QueueItemStatusEnum.NEW_URI_CHECK_REQUIRED,
        },
      })
      await this.prismaService.physicalEntity.updateMany({
        where: {
          uri: { in: failedWithPossibleUriChange.map((item) => item.inputUri) },
        },
        data: {
          uriPossiblyOutdated: true,
        },
      })
    }

    // Handle regular failures
    const failedInternalIds = failed
      .filter((item) => item.physicalEntityId)
      .map((item) => item.physicalEntityId!)

    if (failedInternalIds.length > 0) {
      await this.physicalEntityService.updateFailedActiveEdeskUpdateInDatabase(failedInternalIds)
    }

    const failedExternalUris = failed
      .filter((item) => externalUris.has(item.inputUri))
      .map((item) => item.inputUri)

    if (failedExternalUris.length > 0) {
      await this.prismaService.externalEdeskCheck.updateMany({
        where: {
          uri: { in: failedExternalUris },
          queueStatus: QueueItemStatusEnum.PENDING,
        },
        data: {
          queueStatus: QueueItemStatusEnum.FAILED,
          failCount: { increment: 1 },
        },
      })
    }
  }

  private async getUriToUpdateInternal() {
    const results = await this.prismaService.$queryRaw<{ uri: string; id: string }[]>`
      SELECT "uri", "id"
      FROM "PhysicalEntity"
      WHERE "uriPossiblyOutdated" = true
        AND ("activeEdeskUpdateFailCount" = 0
          OR "activeEdeskUpdateFailedAt" IS NULL
          OR ("activeEdeskUpdateFailedAt" + (POWER(2, LEAST("activeEdeskUpdateFailCount", 7)) * INTERVAL '1 hour') < NOW()))
      LIMIT 1
    `
    return results[0] ?? null
  }

  private async getUriToUpdateExternal() {
    return await this.prismaService.externalEdeskCheck.findFirst({
      where: {
        queueStatus: QueueItemStatusEnum.NEW_URI_CHECK_REQUIRED,
        uri: {
          not: null,
        },
      },
      orderBy: { updatedAt: 'asc' },
      select: {
        uri: true,
      },
    })
  }

  private async handleUriUpdateInternal(input: { uri: string; id: string }) {
    const upvsResult = await this.nasesService.createMany([input])
    if (
      upvsResult.success.length === 1 &&
      upvsResult.success[0].data.uri &&
      upvsResult.success[0].physicalEntityId
    ) {
      const successItem = upvsResult.success[0]
      await this.prismaService.physicalEntity.update({
        where: { id: successItem.physicalEntityId! },
        data: {
          uri: successItem.data.uri,
        },
      })
    } else {
      const confirmedFailed = upvsResult.failed.some(
        (item) => item.inputUri === input.uri && !item.possibleUriChange
      )
      await this.prismaService.physicalEntity.update({
        where: { id: input.id },
        data: {
          uriPossiblyOutdated: !confirmedFailed,
          activeEdeskUpdateFailedAt: new Date(),
          activeEdeskUpdateFailCount: { increment: 1 },
        },
      })
      throw this.throwerErrorGuard.InternalServerErrorException(
        ErrorsEnum.INTERNAL_SERVER_ERROR,
        `Failed to update URI for physical entity id ${input.id}`
      )
    }
    return
  }

  private async handleUriUpdateExternal(uri: string) {
    const upvsResult = await this.nasesService.createMany([{ uri: uri }])
    if (upvsResult.success.length === 1) {
      const successItem = upvsResult.success[0]
      await this.prismaService.externalEdeskCheck.update({
        where: { uri: successItem.inputUri },
        data: {
          queueStatus: QueueItemStatusEnum.COMPLETED,
          upvsStatus: successItem.data.status ?? null,
          edeskStatus: successItem.data.upvs?.edesk_status ?? null,
          edeskNumber: successItem.data.upvs?.edesk_number ?? null,
          processedAt: new Date(),
        },
      })
    } else {
      await this.prismaService.externalEdeskCheck.update({
        where: { uri: uri },
        data: {
          queueStatus: QueueItemStatusEnum.FAILED,
          failCount: { increment: 1 },
        },
      })
    }
    return
  }

  /**
   * Parse URI name from Cognito given_name and family_name
   * Similar to parseUriNameFromRfo but uses Cognito attributes
   */
  private parseUriNameFromCognito(
    givenName: string | undefined,
    familyName: string | undefined
  ): string | null {
    if (!givenName || !familyName) {
      return null
    }

    const processedFamilyName = parseName(familyName)
    const processedGivenName = parseName(givenName)

    return `${processedFamilyName}_${processedGivenName}`
  }

  /**
   * Get urgent queue items: PhysicalEntities with birthNumber but no uri
   */
  private async getUrgentQueueItems(limit: number): Promise<CreateManyParam> {
    const entities = await this.prismaService.$queryRaw<
      (PhysicalEntity & { externalId: string })[]
      //language=postgresql
    >`
        SELECT e.*, u."externalId" AS "externalId"
        FROM "PhysicalEntity" e
                 JOIN "User" u ON e."userId" = u."id"
        WHERE e."birthNumber" IS NOT NULL
          AND e."uri" IS NULL
          AND u."birthNumber" IS NOT NULL
          AND u."externalId" IS NOT NULL
          AND ("activeEdeskUpdateFailCount" = 0
            OR ("activeEdeskUpdateFailedAt" + (POWER(2, LEAST("activeEdeskUpdateFailCount", 7)) * INTERVAL '1 hour') <
                NOW()))
        ORDER BY GREATEST(e."createdAt", e."activeEdeskUpdateFailedAt") NULLS FIRST
        LIMIT ${limit}
    `

    const preparedItems = await this.prepareUrgentItems(entities)
    return preparedItems
  }

  /**
   * Get high priority queue items: PhysicalEntities with uri that need Edesk status update
   * Filters out entities with fresh cache and respects exponential backoff
   */
  private async getHighPriorityQueueItems(limit: number): Promise<CreateManyParam> {
    const lookBackDate = dayjs().subtract(this.CACHE_TTL_HOURS, 'hour')

    // Reuse existing edesk-tasks query logic with exponential backoff
    const entities = await this.prismaService.$queryRaw<PhysicalEntity[]>
    //language=postgresql
    `
        SELECT e.*
        FROM "PhysicalEntity" e
        WHERE "userId" IS NOT NULL
          AND "uri" IS NOT NULL
          AND ("activeEdeskUpdatedAt" IS NULL OR "activeEdeskUpdatedAt" < ${lookBackDate.toDate()})
          AND ("activeEdeskUpdateFailedAt" IS NULL OR
               "activeEdeskUpdateFailCount" = 0 OR
               ("activeEdeskUpdateFailedAt" + (POWER(2, LEAST("activeEdeskUpdateFailCount", 7)) * INTERVAL '1 hour') <
                ${lookBackDate.toDate()}))
        ORDER BY GREATEST("createdAt", "activeEdeskUpdatedAt", "activeEdeskUpdateFailedAt") NULLS FIRST
        LIMIT ${limit}
    `

    return entities.map((entity) => {
      return { physicalEntityId: entity.id, uri: entity.uri! }
    })
  }

  /**
   * Get external queue items: External URIs that need processing
   */
  private async getExternalQueueItems(limit: number): Promise<CreateManyParam> {
    const externalItems = await this.prismaService.externalEdeskCheck.findMany({
      where: {
        queueStatus: QueueItemStatusEnum.PENDING,
        uri: { not: null },
      },
      orderBy: { updatedAt: 'asc' },
      take: limit,
      select: {
        uri: true,
      },
    })
    return externalItems as { uri: string }[]
  }

  /**
   * Process urgent queue item: Get UPVS identity (uri) for PhysicalEntity with birthNumber
   * Uses Cognito given_name and family_name to construct URI
   */
  private async prepareUrgentItems(
    entities: (PhysicalEntity & { externalId: string })[]
  ): Promise<CreateManyParam> {
    const idBirthNumberUserIdList = entities
      .map((entity) => {
        return { id: entity.id, birthNumber: entity.birthNumber, externalId: entity.externalId }
      })
      .filter(
        (entity): entity is { id: string; birthNumber: string; externalId: string } =>
          !!entity.birthNumber && !!entity.externalId
      )

    const idUriList = await Promise.allSettled(
      idBirthNumberUserIdList.map(async (item) => {
        // Get user data from Cognito
        const cognitoUser = await this.cognitoSubservice.getDataFromCognito(item.externalId)

        // Parse URI name from Cognito given_name and family_name
        const uriName = this.parseUriNameFromCognito(
          cognitoUser.given_name,
          cognitoUser.family_name
        )

        if (!uriName) {
          throw this.throwerErrorGuard.InternalServerErrorException(
            MagproxyErrorsEnum.BIRTH_NUMBER_NOT_EXISTS,
            'Missing given_name or family_name in Cognito user data',
            toLogfmt({ externalId: item.externalId, entityId: item.id })
          )
        }

        const processedBirthNumber = item.birthNumber.replaceAll('/', '')
        const uri = `rc://sk/${processedBirthNumber}_${uriName}`
        this.logger.log(`Trying to verify the following uri for entityId ${item.id}: ${uri}`)

        return { uri, physicalEntityId: item.id }
      })
    )

    // log errors if any occurred
    let errorMessage: string = ''
    idUriList
      .filter((item) => item.status === 'rejected')
      .forEach((item) => {
        errorMessage = [errorMessage, toLogfmt(item.reason)].join('\\n\\n')
      })

    if (errorMessage) {
      this.logger.error(`Failed to process entities in urgent queue: ${errorMessage}`)
    }

    const successfulIdUriPairs = idUriList
      .filter((item) => item.status === 'fulfilled')
      .map((item) => item.value)

    return successfulIdUriPairs
  }
}
