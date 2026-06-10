import { Injectable } from '@nestjs/common'
import { QueueItemStatusEnum } from '@prisma/client'

import { PrismaService } from '../prisma/prisma.service'
import { toLogfmt } from '../utils/logging'
import { LineLoggerSubservice } from '../utils/subservices/line-logger.subservice'
import { EdeskBatchSearchService } from './edesk-batch-search.service'
import { EdeskUriUpdateService } from './edesk-uri-update.service'
import { UrgentLookupService } from './urgent-lookup.service'

@Injectable()
export class UpvsQueueService {
  private readonly logger = new LineLoggerSubservice(UpvsQueueService.name)

  // Reentrancy guard: don't start a new run while the previous one is still going.
  private isProcessingBatch = false

  constructor(
    private readonly prismaService: PrismaService,
    private readonly urgentLookupService: UrgentLookupService,
    private readonly edeskUriUpdateService: EdeskUriUpdateService,
    private readonly edeskBatchSearchService: EdeskBatchSearchService
  ) {}

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
   * Process one batch of queue items according to priority rules. Delegates each tier to
   * its own service and assembles a single report. See the README for the full flow.
   */
  async processBatch(): Promise<void> {
    if (this.isProcessingBatch) {
      this.logger.log('processBatch skipped: previous run still in progress')
      return
    }
    this.isProcessingBatch = true

    const result = {
      message: 'Upvs queue report.',
      urgentProcessed: 0,
      highPriorityProcessed: 0,
      externalProcessed: 0,
      totalProcessed: 0,
      errors: [] as string[],
    }

    try {
      // Urgent items run first, every tick, on their own budget (see README).
      try {
        const urgentResult = await this.urgentLookupService.processUrgentItems()
        result.urgentProcessed = urgentResult.attempted
        if (urgentResult.rateLimited) {
          // Rate-limited: already logged in the urgent service. Skip the rest of the tick
          // rather than hammer UPVS; retry next tick.
          return
        }
        if (urgentResult.failures.length > 0) {
          result.errors.push(toLogfmt({ urgentFailures: urgentResult.failures }))
        }
      } catch (error) {
        this.logger.error('Error processing urgent items', error)
        result.errors.push('\n\n'.concat(toLogfmt(error)))
      }

      // If there is at least one URI in database flagged as outdated, we need to update it.
      const uriToUpdateInternal = await this.edeskUriUpdateService.getUriToUpdateInternal()
      if (uriToUpdateInternal && uriToUpdateInternal.uri && uriToUpdateInternal.id) {
        await this.edeskUriUpdateService.handleUriUpdateInternal({
          id: uriToUpdateInternal.id,
          uri: uriToUpdateInternal.uri,
        })
        result.highPriorityProcessed = 1
        result.totalProcessed = result.urgentProcessed + 1
        this.logger.log(result)
        return
      }
      const uriToUpdateExternal = await this.edeskUriUpdateService.getUriToUpdateExternal()
      if (uriToUpdateExternal && uriToUpdateExternal.uri) {
        await this.edeskUriUpdateService.handleUriUpdateExternal(uriToUpdateExternal.uri)
        result.externalProcessed = 1
        result.totalProcessed = result.urgentProcessed + 1
        this.logger.log(result)
        return
      }

      try {
        const search = await this.edeskBatchSearchService.processBatchedSearch()
        result.highPriorityProcessed = search.highPriorityProcessed
        result.externalProcessed = search.externalProcessed
        result.totalProcessed =
          result.urgentProcessed + search.highPriorityProcessed + search.externalProcessed
      } catch (error) {
        this.logger.error('Error processing batch', error)
        result.errors.push('\n\n'.concat(toLogfmt(error)))
      }

      this.logger.log(result)
    } finally {
      this.isProcessingBatch = false
    }
  }
}
