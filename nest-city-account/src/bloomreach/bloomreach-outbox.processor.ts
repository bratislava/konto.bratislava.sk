import { Injectable } from '@nestjs/common'

import { BloomreachOutbox, BloomreachOutboxStatus, Prisma } from '@prisma/client'
import { PrismaService } from '../prisma/prisma.service'
import { LineLoggerSubservice } from '../utils/subservices/line-logger.subservice'
import ThrowerErrorGuard from '../utils/guards/errors.guard'
import { ErrorsEnum } from '../utils/guards/dtos/error.dto'
import { toLogfmt } from '../utils/logging'
import {
  BloomreachBatchCommand,
  BloomreachBatchResponse,
  BloomreachCommandNameEnum,
  BloomreachCustomerCommandData,
  BloomreachEventCommandData,
} from './bloomreach.types'
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
             AND ("attempts" = 0
                  OR "updatedAt" +
                     (${RETRY_BACKOFF_BASE_MS} * (2 ^ GREATEST("attempts" - 1, 0))) *
                         INTERVAL '1 millisecond' < ${now})
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

    const commands: BloomreachBatchCommand[] = entries.map((entry) => ({
      name: entry.commandName as BloomreachCommandNameEnum,
      data: entry.commandData,
      command_id: entry.id,
    }))

    try {
      const response = await this.sendBatch(commands)

      const succeededIds: string[] = []
      const failedEntries: BloomreachOutbox[] = []

      for (let i = 0; i < entries.length; i++) {
        if (!response.results[i]?.success) {
          failedEntries.push(entries[i])
        } else {
          succeededIds.push(entries[i].id)
        }
      }

      if (succeededIds.length > 0) {
        await this.prisma.bloomreachOutbox.updateMany({
          where: { id: { in: succeededIds } },
          data: { status: BloomreachOutboxStatus.COMPLETED },
        })
      }

      if (failedEntries.length > 0) {
        this.logger.error(
          this.throwerErrorGuard.InternalServerErrorException(
            ErrorsEnum.INTERNAL_SERVER_ERROR,
            `${failedEntries.length}/${entries.length} commands failed in batch`,
            toLogfmt({ failedIds: failedEntries.map((e) => e.id) })
          )
        )
        await this.revertEntries(
          failedEntries,
          'Bloomreach batch API returned success=false for command'
        )
      }

      this.logger.log(
        `Processed batch: ${succeededIds.length} succeeded, ${failedEntries.length} failed`
      )
    } catch (error) {
      this.logger.error(
        this.throwerErrorGuard.InternalServerErrorException(
          ErrorsEnum.INTERNAL_SERVER_ERROR,
          'Bloomreach batch send failed',
          toLogfmt({ batchSize: commands.length, entryCount: entries.length }),
          error
        )
      )

      await this.revertEntries(entries, error instanceof Error ? error.message : String(error))
    }
  }

  /**
   * Reverts PROCESSING entries back to PENDING, or marks them as:
   * - FAILED if max attempts reached
   * - SUPERSEDED if a newer PENDING entry exists for the same dedup key
   *
   * For superseded `customers` commands, merges old data into the newer entry
   * (mirroring write-time merge that was skipped while the entry was PROCESSING).
   *
   * Uses allSettled so one DB failure doesn't block the rest.
   */
  private async revertEntries(entries: BloomreachOutbox[], errorMessage?: string): Promise<void> {
    const supersededIds = await this.findSupersededEntriesAndMerge(entries)

    const results = await Promise.allSettled(
      entries.map((entry) => {
        const superseded = supersededIds.has(entry.id)
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
            status: superseded
              ? BloomreachOutboxStatus.SUPERSEDED
              : exhausted
                ? BloomreachOutboxStatus.FAILED
                : BloomreachOutboxStatus.PENDING,
            attempts: newAttempts,
            lastError: superseded ? 'Superseded by newer PENDING entry' : errorMessage,
          },
        })
      })
    )

    const revertFailures = results.filter((r) => r.status === 'rejected')
    if (revertFailures.length > 0) {
      this.logger.error(
        this.throwerErrorGuard.InternalServerErrorException(
          ErrorsEnum.INTERNAL_SERVER_ERROR,
          `Failed to revert ${revertFailures.length}/${entries.length} entries`,
          toLogfmt({ entryIds: entries.map((e) => e.id) }),
          (revertFailures[0] as PromiseRejectedResult).reason
        )
      )
    }
  }

  /**
   * Finds entries that have been superseded by a newer PENDING entry for the same dedup key.
   * For superseded `customers` commands, merges old data into the newer PENDING entry
   * (newer values take precedence, matching the write-time merge logic).
   * For `customers/events` commands: no merge needed — the newer entry fully replaces.
   */
  private async findSupersededEntriesAndMerge(entries: BloomreachOutbox[]): Promise<Set<string>> {
    const supersededIds = new Set<string>()

    await Promise.all(
      entries.map(async (entry) => {
        const baseWhere: Prisma.BloomreachOutboxWhereInput = {
          cognitoId: entry.cognitoId,
          commandName: entry.commandName,
          status: BloomreachOutboxStatus.PENDING,
        }

        const { commandData } = entry

        let where: Prisma.BloomreachOutboxWhereInput
        if (entry.commandName === BloomreachCommandNameEnum.CUSTOMERS_EVENTS) {
          const eventData = commandData as BloomreachEventCommandData
          where = {
            ...baseWhere,
            AND: [
              { commandData: { path: ['event_type'], equals: eventData.event_type } },
              {
                commandData: {
                  path: ['properties', 'category'],
                  equals: eventData.properties.category,
                },
              },
            ],
          }
        } else {
          where = baseWhere
        }

        await this.prisma.$transaction(async (tx) => {
          const newer = await tx.bloomreachOutbox.findFirst({ where })

          if (!newer) {
            return
          }

          // For customers commands, merge the old entry's data into the newer one
          // (newer values take precedence, matching the write-time merge logic)
          if (entry.commandName === BloomreachCommandNameEnum.CUSTOMERS) {
            const oldData = commandData as BloomreachCustomerCommandData
            const newerData = newer.commandData as BloomreachCustomerCommandData
            await tx.bloomreachOutbox.update({
              where: { id: newer.id },
              data: {
                commandData: {
                  customer_ids: { ...oldData.customer_ids, ...newerData.customer_ids },
                  properties: { ...oldData.properties, ...newerData.properties },
                },
              },
            })
          }

          supersededIds.add(entry.id)
        })
      })
    )

    return supersededIds
  }

  /**
   * Recovers entries stuck in PROCESSING for longer than the threshold.
   * This handles crash recovery and failed rollbacks.
   */
  private async recoverStaleProcessingEntries(): Promise<void> {
    const threshold = new Date(Date.now() - STALE_PROCESSING_THRESHOLD_MS)
    const staleEntries = await this.prisma.bloomreachOutbox.findMany({
      where: {
        status: BloomreachOutboxStatus.PROCESSING,
        updatedAt: { lt: threshold },
      },
    })

    if (staleEntries.length === 0) {
      return
    }

    await this.revertEntries(staleEntries)

    this.logger.warn(`Recovered ${staleEntries.length} stale PROCESSING entries`)
  }

  private async sendBatch(commands: BloomreachBatchCommand[]): Promise<BloomreachBatchResponse> {
    const response = await axios.post(
      `${process.env.BLOOMREACH_API_URL}/track/v2/projects/${process.env.BLOOMREACH_PROJECT_TOKEN}/batch`,
      { commands },
      {
        headers: {
          Authorization: `Basic ${this.bloomreachCredentials}`,
        },
      }
    )

    const body = response.data as BloomreachBatchResponse
    if (!body.results) {
      throw new Error(`Bloomreach batch API returned unexpected response: ${JSON.stringify(body)}`)
    }

    return body
  }
}
