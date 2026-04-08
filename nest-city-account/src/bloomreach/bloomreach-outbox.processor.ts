import { Injectable } from '@nestjs/common'

import { BloomreachOutbox, BloomreachOutboxStatus } from '@prisma/client'
import { PrismaService } from '../prisma/prisma.service'
import { LineLoggerSubservice } from '../utils/subservices/line-logger.subservice'
import ThrowerErrorGuard from '../utils/guards/errors.guard'
import { ErrorsEnum } from '../utils/guards/dtos/error.dto'
import { toLogfmt } from '../utils/logging'
import { BloomreachBatchCommand, BloomreachCommandNameEnum } from './bloomreach.types'
import axios from 'axios'

// TODO these constants need consulting
const BATCH_SIZE = 50
const MAX_ATTEMPTS = 5
const STALE_PROCESSING_THRESHOLD_MS = 60_000
const RETRY_BACKOFF_BASE_MS = 60_000

@Injectable()
export class BloomreachOutboxProcessor {
  private readonly logger: LineLoggerSubservice

  private readonly bloomreachCredentials = Buffer.from(
    `${process.env.BLOOMREACH_API_KEY}:${process.env.BLOOMREACH_API_SECRET}`,
    'binary'
  ).toString('base64')

  constructor(
    private readonly prisma: PrismaService,
    private readonly throwerErrorGuard: ThrowerErrorGuard
  ) {
    this.logger = new LineLoggerSubservice(BloomreachOutboxProcessor.name)
  }

  async processOutbox(): Promise<void> {
    if (process.env.BLOOMREACH_INTEGRATION_STATE !== 'ACTIVE') {
      return
    }

    await this.processBatch()
  }

  private async processBatch(): Promise<void> {
    // Recover entries stuck in PROCESSING (e.g. from a crash or failed rollback)
    await this.recoverStaleProcessingEntries()

    // Backoff: skip entries that were recently retried (updatedAt + attempts * base delay > now)
    const now = new Date()
    const entries = await this.prisma.$queryRaw<BloomreachOutbox[]>
    //language=postgresql
    `
    WITH claimed AS
        (SELECT "id"
         FROM
             "BloomreachOutbox"
         WHERE
             "status" = ${BloomreachOutboxStatus.PENDING}::"BloomreachOutboxStatus"
             AND "updatedAt" +
                 (${RETRY_BACKOFF_BASE_MS} * (2 ^ GREATEST("attempts" - 1, 0))) *
                     INTERVAL '1 millisecond' < ${now}
         ORDER BY "createdAt"
         LIMIT ${BATCH_SIZE}
         FOR UPDATE)
    UPDATE "BloomreachOutbox" b
    SET
        "status"    = ${BloomreachOutboxStatus.PROCESSING}::"BloomreachOutboxStatus",
        "updatedAt" = ${now}
    FROM
        claimed
    WHERE
        b."id" = claimed."id"
    RETURNING b.*
    `

    if (entries.length === 0) {
      return
    }

    const ids = entries.map((e) => e.id)

    const commands: BloomreachBatchCommand[] = entries.map((entry) => ({
      name: entry.commandName as BloomreachCommandNameEnum,
      data: entry.commandData,
    }))

    try {
      await this.sendBatch(commands)

      // Mark all original entries as completed (including superseded ones)
      await this.prisma.bloomreachOutbox.updateMany({
        where: { id: { in: ids } },
        data: { status: BloomreachOutboxStatus.COMPLETED },
      })

      this.logger.log(`Processed batch of ${commands.length} commands (${entries.length} entries)`)
    } catch (error) {
      this.logger.error(
        this.throwerErrorGuard.InternalServerErrorException(
          ErrorsEnum.INTERNAL_SERVER_ERROR,
          'Bloomreach batch send failed',
          toLogfmt({ batchSize: commands.length, entryCount: entries.length }),
          error
        )
      )

      await this.rollbackEntries(entries, error)
    }
  }

  /**
   * Marks entries back to PENDING for retry, or FAILED if max attempts reached.
   * Uses allSettled so one DB failure doesn't block the rest — any entries left
   * in PROCESSING will be recovered by recoverStaleProcessingEntries.
   */
  private async rollbackEntries(entries: BloomreachOutbox[], error: unknown): Promise<void> {
    const errorMessage = error instanceof Error ? error.message : String(error)

    const results = await Promise.allSettled(
      entries.map((entry) => {
        const newAttempts = entry.attempts + 1
        const exhausted = newAttempts >= MAX_ATTEMPTS

        if (exhausted) {
          this.logger.error(
            this.throwerErrorGuard.InternalServerErrorException(
              ErrorsEnum.INTERNAL_SERVER_ERROR,
              `Giving up on entry after ${MAX_ATTEMPTS} attempts`,
              toLogfmt({ cognitoId: entry.cognitoId, entryId: entry.id })
            )
          )
        }

        return this.prisma.bloomreachOutbox.update({
          where: { id: entry.id },
          data: {
            status: exhausted ? BloomreachOutboxStatus.FAILED : BloomreachOutboxStatus.PENDING,
            attempts: newAttempts,
            lastError: errorMessage,
          },
        })
      })
    )

    const rollbackFailures = results.filter((r) => r.status === 'rejected')
    if (rollbackFailures.length > 0) {
      this.logger.error(
        this.throwerErrorGuard.InternalServerErrorException(
          ErrorsEnum.INTERNAL_SERVER_ERROR,
          `Failed to rollback ${rollbackFailures.length}/${entries.length} entries`,
          toLogfmt({ entryIds: entries.map((e) => e.id) }),
          (rollbackFailures[0] as PromiseRejectedResult).reason
        )
      )
    }
  }

  /**
   * Recovers entries stuck in PROCESSING for longer than the threshold.
   * This handles crash recovery and failed rollbacks.
   */
  private async recoverStaleProcessingEntries(): Promise<void> {
    const threshold = new Date(Date.now() - STALE_PROCESSING_THRESHOLD_MS)
    const { count } = await this.prisma.bloomreachOutbox.updateMany({
      where: {
        status: BloomreachOutboxStatus.PROCESSING,
        updatedAt: { lt: threshold },
      },
      data: { status: BloomreachOutboxStatus.PENDING },
    })

    if (count > 0) {
      this.logger.warn(`Recovered ${count} stale PROCESSING entries`)
    }
  }

  private async sendBatch(commands: BloomreachBatchCommand[]): Promise<void> {
    const response = await axios.post(
      `${process.env.BLOOMREACH_API_URL}/track/v2/projects/${process.env.BLOOMREACH_PROJECT_TOKEN}/batch`,
      { commands },
      {
        headers: {
          Authorization: `Basic ${this.bloomreachCredentials}`,
        },
      }
    )

    const body = response.data as { success?: boolean }
    if (!body.success) {
      throw new Error(`Bloomreach batch API returned success=false: ${JSON.stringify(body)}`)
    }
  }
}
