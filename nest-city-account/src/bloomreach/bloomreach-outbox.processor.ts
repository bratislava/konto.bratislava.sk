import { Injectable } from '@nestjs/common'
import axios, { isAxiosError } from 'axios'

import BaConfigService from '../config/ba-config.service'
import { BloomreachOutbox, BloomreachOutboxStatus, Prisma } from '../generated/prisma/client'
import { BloomreachCommandName } from '../generated/prisma/enums'
import { PrismaService } from '../prisma/prisma.service'
import { ErrorsEnum } from '../utils/guards/dtos/error.dto'
import ThrowerErrorGuard from '../utils/guards/errors.guard'
import { toLogfmt } from '../utils/logging'
import { LineLoggerSubservice } from '../utils/subservices/line-logger.subservice'
import {
  BLOOMREACH_WIRE_COMMAND_NAME,
  BloomreachBatchCommand,
  BloomreachBatchResponse,
  isBloomreachCustomerData,
  isBloomreachEventCommandData,
} from './bloomreach.types'
import { BloomreachMergeConsentService } from './bloomreach-merge-consent.service'
import { isAnonymizationCommand, mergeCustomerCommandData } from './utils/merge-commands.utils'
import { isTerminalDowngradeError } from './utils/outbox-errors.utils'
import { lockTransactionWithKey, runWithAdvisoryLock } from './utils/outbox-lock.utils'

const BATCH_SIZE = 50
const MAX_ATTEMPTS = 5
const STALE_PROCESSING_THRESHOLD_MS = 60_000
const RETRY_BACKOFF_BASE_MS = 60_000
const PROCESSOR_LOCK_KEY = 'bloomreach-outbox-processor'

@Injectable()
export class BloomreachOutboxProcessor {
  private readonly logger: LineLoggerSubservice

  private readonly bloomreachCredentials: string

  constructor(
    private readonly prisma: PrismaService,
    private readonly throwerErrorGuard: ThrowerErrorGuard,
    private readonly mergeConsentService: BloomreachMergeConsentService,
    private readonly baConfigService: BaConfigService
  ) {
    const { apiKey, apiSecret } = this.baConfigService.bloomreach
    this.bloomreachCredentials = Buffer.from(`${apiKey}:${apiSecret}`, 'binary').toString('base64')
    this.logger = new LineLoggerSubservice(BloomreachOutboxProcessor.name)
  }

  async processOutbox(): Promise<void> {
    if (this.baConfigService.bloomreach.integrationState !== 'ACTIVE') {
      return
    }

    await runWithAdvisoryLock(this.prisma, PROCESSOR_LOCK_KEY, async () => this.processBatch())
  }

  private async processBatch(): Promise<void> {
    // Recover entries stuck in PROCESSING (e.g. from a crash or failed rollback)
    await this.recoverStaleProcessingEntries()

    // Backoff: skip entries that were recently retried (updatedAt + attempts * base delay > now)
    const now = new Date()
    //language=postgresql
    const claimedEntries = await this.prisma.$queryRaw<BloomreachOutbox[]>`
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

    if (claimedEntries.length === 0) {
      return
    }

    const entries = await this.runMergeConsentChecks(claimedEntries)

    if (entries.length === 0) {
      return
    }

    const commands: BloomreachBatchCommand[] = entries.map((entry) => ({
      name: BLOOMREACH_WIRE_COMMAND_NAME[entry.commandName],
      data: entry.commandData,
      command_id: entry.id,
    }))

    try {
      const response = await this.sendBatch(commands)

      const succeededIds: string[] = []
      const failedEntries: BloomreachOutbox[] = []

      for (const [i, entry] of entries.entries()) {
        if (response.results.at(i)?.success) {
          succeededIds.push(entry.id)
        } else {
          failedEntries.push(entry)
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
      const console = toLogfmt({ batchSize: commands.length, entryCount: entries.length })
      if (isAxiosError(error)) {
        this.logger.error(
          this.throwerErrorGuard.fromAxiosError(error, {
            console,
          })
        )
      } else {
        this.logger.error(
          this.throwerErrorGuard.InternalServerErrorException(
            ErrorsEnum.INTERNAL_SERVER_ERROR,
            'Bloomreach batch send failed',
            console,
            error
          )
        )
      }

      await this.revertEntries(entries, error instanceof Error ? error.message : String(error))
    }
  }

  private async runMergeConsentChecks(
    claimedEntries: BloomreachOutbox[]
  ): Promise<BloomreachOutbox[]> {
    const checkResults = await Promise.all(
      claimedEntries.map(async (entry) => ({
        entry,
        safeToSend: await this.mergeConsentService.ensureConsentsSurviveMerge(entry),
      }))
    )

    const failedCheckEntries = checkResults.filter((r) => !r.safeToSend).map((r) => r.entry)
    if (failedCheckEntries.length > 0) {
      // A failed merge-consent check means we couldn't verify it's safe to send.
      // It says nothing about whether Bloomreach would accept the command
      // itself, so it must not count toward the same attempts/backoff budget.
      await this.revertEntries(failedCheckEntries, 'Bloomreach merge consent check failed', {
        countsTowardAttempts: false,
      })
    }

    return checkResults.filter((r) => r.safeToSend).map((r) => r.entry)
  }

  /**
   * Reverts PROCESSING entries to PENDING, or marks them as:
   * - FAILED if max attempts reached
   * - SUPERSEDED if a newer PENDING entry exists for the same dedup key
   *
   * For superseded `customers` commands, merges old data into the newer entry
   * (mirroring write-time merge skipped while the entry was PROCESSING).
   *
   * @param countsTowardAttempts whether this revert counts toward the
   *   attempts/backoff budget that eventually marks an entry FAILED.
   */
  private async revertEntries(
    entries: BloomreachOutbox[],
    errorMessage?: string,
    { countsTowardAttempts = true }: { countsTowardAttempts?: boolean } = {}
  ): Promise<void> {
    const supersededByMap = await this.findSupersededEntriesAndMerge(entries)

    const results = await Promise.allSettled(
      entries.map(async (entry) => {
        const supersededBy = supersededByMap.get(entry.id)
        const newAttempts = countsTowardAttempts ? entry.attempts + 1 : entry.attempts
        const exhausted = newAttempts >= MAX_ATTEMPTS

        if (exhausted) {
          this.logger.error(
            this.throwerErrorGuard.InternalServerErrorException(
              ErrorsEnum.INTERNAL_SERVER_ERROR,
              `Giving up on entry after ${MAX_ATTEMPTS} attempts`,
              toLogfmt({ externalId: entry.externalId, entryId: entry.id })
            )
          )
        }

        return this.prisma.bloomreachOutbox.update({
          where: { id: entry.id },
          data: {
            status: supersededBy
              ? BloomreachOutboxStatus.SUPERSEDED
              : exhausted
                ? BloomreachOutboxStatus.FAILED
                : BloomreachOutboxStatus.PENDING,
            attempts: newAttempts,
            lastError: supersededBy
              ? `Superseded by newer PENDING entry ${supersededBy}`
              : errorMessage,
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
          revertFailures[0].reason
        )
      )
    }
  }

  /**
   * Finds entries that have been superseded by a newer PENDING entry for the
   * same dedup key.
   *
   * For superseded `customers` commands, merges old data into the newer PENDING
   * entry (newer values take precedence, matching the write-time merge logic).
   * For `customers/events` commands: no merge needed, the newer entry fully
   * replaces old one.
   */
  private async findSupersededEntriesAndMerge(
    entries: BloomreachOutbox[]
  ): Promise<Map<string, string>> {
    const supersededByMap = new Map<string, string>()

    await Promise.all(
      entries.map(async (entry) => {
        const baseWhere: Prisma.BloomreachOutboxWhereInput = {
          externalId: entry.externalId,
          commandName: entry.commandName,
          status: BloomreachOutboxStatus.PENDING,
        }

        const { commandData } = entry
        const eventData = isBloomreachEventCommandData(commandData) ? commandData : undefined

        const where: Prisma.BloomreachOutboxWhereInput = eventData
          ? {
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
          : baseWhere

        const lockKeyParts = eventData
          ? [
              entry.externalId,
              BloomreachCommandName.CUSTOMERS_EVENTS,
              eventData.event_type,
              eventData.properties.category,
            ]
          : [entry.externalId, BloomreachCommandName.CUSTOMERS]

        await this.prisma.$transaction(async (tx) => {
          await lockTransactionWithKey(tx, ...lockKeyParts)

          const newer = await tx.bloomreachOutbox.findFirst({ where })

          if (!newer) {
            return
          }

          // For customers commands, merge the old entry's data into the newer
          // one, matching the write-time merge logic.
          if (entry.commandName === BloomreachCommandName.CUSTOMERS) {
            if (
              !isBloomreachCustomerData(commandData) ||
              !isBloomreachCustomerData(newer.commandData)
            ) {
              throw this.throwerErrorGuard.InternalServerErrorException(
                ErrorsEnum.INTERNAL_SERVER_ERROR,
                'Bloomreach outbox entry has commandName CUSTOMERS but commandData is not customer command data',
                toLogfmt({ entryId: entry.id, externalId: entry.externalId })
              )
            }

            const merged = mergeCustomerCommandData(commandData, newer.commandData)
            try {
              await tx.bloomreachOutbox.update({
                where: { id: newer.id },
                data: { commandData: merged, isTerminal: isAnonymizationCommand(merged) },
              })
            } catch (error) {
              if (!isTerminalDowngradeError(error)) {
                throw error
              }
              throw this.throwerErrorGuard.InternalServerErrorException(
                ErrorsEnum.INTERNAL_SERVER_ERROR,
                'Attempted to downgrade a terminal outbox entry while merging a superseded entry - mergeCustomerCommandData should have prevented this, investigate',
                toLogfmt({
                  entryId: entry.id,
                  newerEntryId: newer.id,
                  externalId: entry.externalId,
                }),
                error
              )
            }
          } else if (entry.isTerminal && !newer.isTerminal) {
            // A terminal (anonymize) reject being superseded must still win
            // over a non-terminal newer entry.
            await tx.bloomreachOutbox.update({
              where: { id: newer.id },
              data: { commandData, isTerminal: true },
            })
          }

          supersededByMap.set(entry.id, newer.id)
        })
      })
    )

    return supersededByMap
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
    const { apiUrl, projectToken } = this.baConfigService.bloomreach
    const response = await axios.post<BloomreachBatchResponse>(
      `${apiUrl}/track/v2/projects/${projectToken}/batch`,
      { commands },
      {
        headers: {
          Authorization: `Basic ${this.bloomreachCredentials}`,
        },
      }
    )

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- defensive check: Bloomreach API should always return results array
    if (!response.data.results) {
      throw new Error(
        `Bloomreach batch API returned unexpected response: ${JSON.stringify(response.data)}`
      )
    }

    return response.data
  }
}
