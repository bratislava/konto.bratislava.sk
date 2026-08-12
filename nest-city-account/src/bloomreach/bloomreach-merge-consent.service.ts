import { Injectable } from '@nestjs/common'
import { isAxiosError } from 'axios'
import dayjs from 'dayjs'

import {
  BloomreachCommandName,
  BloomreachOutbox,
  BloomreachOutboxStatus,
} from '../generated/prisma/client'
import { PrismaService } from '../prisma/prisma.service'
import { ErrorsEnum } from '../utils/guards/dtos/error.dto'
import ThrowerErrorGuard from '../utils/guards/errors.guard'
import { toLogfmt } from '../utils/logging'
import { LineLoggerSubservice } from '../utils/subservices/line-logger.subservice'
import {
  BloomreachConsentActionEnum,
  Consent,
  isBloomreachCustomerData,
  isBloomreachEventCommandData,
} from './bloomreach.types'
import { BloomreachExportService } from './bloomreach-export.service'
import { BloomreachOutboxWriterService } from './bloomreach-outbox-writer.service'
import { nowUnixSeconds } from './bloomreach-payload.builder'
import {
  consentTypeFromCategory,
  eventsToConsents,
  extractLatestCityAccountConsents,
} from './utils/consents.utils'
import { isAnonymizationCommand } from './utils/merge-commands.utils'
import {
  BLOOMREACH_PROPAGATION_WINDOW_HOURS,
  isLiveOrRecentlyCompleted,
} from './utils/outbox-staleness.utils'

/**
 * Restored consents must land strictly after the anonymization they're
 * protecting against.
 */
const MERGE_CONSENT_RESTORE_BUFFER_SECONDS = 10

function normalizeIdValues(value: string | string[] | null | undefined): string[] {
  if (value == null) {
    return []
  }
  return Array.isArray(value) ? value : [value]
}

/**
 * Guards consents against a Bloomreach customer merge with an anonymized
 * profile.
 *
 * When a customer command attaches a contact_id for the first time, Bloomreach
 * merges the customer with any existing profile carrying that contact_id. If
 * that profile was anonymized, its consent rejects could win the merge's
 * latest-wins resolution. Before such command is sent, this service re-queues
 * the customer's consent state (as exported from Bloomreach), stamped to land
 * just after the anonymization it needs to outrank (see
 * {@link MERGE_CONSENT_RESTORE_BUFFER_SECONDS}), so it wins the merge instead.
 */
@Injectable()
export class BloomreachMergeConsentService {
  private readonly logger: LineLoggerSubservice

  constructor(
    private readonly prisma: PrismaService,
    private readonly exportService: BloomreachExportService,
    private readonly outboxWriter: BloomreachOutboxWriterService,
    private readonly throwerErrorGuard: ThrowerErrorGuard
  ) {
    this.logger = new LineLoggerSubservice(BloomreachMergeConsentService.name)
  }

  /**
   * Checks whether the given outbox entry is about to merge the customer with
   * an anonymized Bloomreach profile, and if so, queues consent events
   * restoring the customer's current consent state. Never throws.
   *
   * @returns false when Bloomreach could not be read or the consent events
   *          could not be queued. The entry must not be sent in that case.
   */
  async ensureConsentsSurviveMerge(entry: BloomreachOutbox): Promise<boolean> {
    try {
      await this.queueConsentsSurvivingMerge(entry)
      return true
    } catch (error) {
      const console = toLogfmt({ entryId: entry.id, externalId: entry.externalId })
      this.logger.error(
        isAxiosError(error)
          ? this.throwerErrorGuard.fromAxiosError(error, { console })
          : this.throwerErrorGuard.InternalServerErrorException(
              ErrorsEnum.INTERNAL_SERVER_ERROR,
              'Bloomreach merge consent check failed',
              console,
              error
            )
      )
      return false
    }
  }

  private async queueConsentsSurvivingMerge(entry: BloomreachOutbox): Promise<void> {
    if (entry.commandName !== BloomreachCommandName.CUSTOMERS) {
      return
    }

    if (!isBloomreachCustomerData(entry.commandData)) {
      throw this.throwerErrorGuard.InternalServerErrorException(
        ErrorsEnum.INTERNAL_SERVER_ERROR,
        'Bloomreach outbox entry has commandName CUSTOMERS but commandData is not customer command data',
        toLogfmt({ entryId: entry.id, externalId: entry.externalId })
      )
    }

    const commandData = entry.commandData

    // A command that itself de-verifies/anonymizes the account must never
    // restore this same account's consents.
    if (isAnonymizationCommand(commandData)) {
      return
    }

    const contactId = commandData.customer_ids.contact_id

    if (!contactId) {
      return
    }

    if (!(await this.couldCauseMerge(entry, contactId))) {
      return
    }

    // A separate anonymize command for this same externalId can exist as its
    // own row (not merged into this one) if it was queued after this entry was
    // already claimed by the processor.
    if (await this.hasOwnAnonymizeInFlight(entry)) {
      return
    }

    const contactProfile = await this.exportService.fetchCustomer({ contact_id: contactId })
    if (!contactProfile) {
      return
    }

    const profileCityAccountIds = normalizeIdValues(contactProfile.ids.city_account_id)
    if (profileCityAccountIds.includes(entry.externalId)) {
      // Another user already merged with the entry
      return
    }

    // Only city-account writes is_identity_verified, and only anonymization
    // sets it to false while the contact_id is retained. Profiles created by
    // other backends lack the property entirely.
    const anonymizedInBloomreach = contactProfile.properties.is_identity_verified === false

    // The in-flight check below exists purely to catch anonymization the BR
    // doesn't know about yet
    let anonymizeInFlightTimestamp: number | null = null
    if (!anonymizedInBloomreach) {
      const linkedCityAccountIds = await this.findPossiblyUnmergedCityAccountIds(
        contactId,
        entry.externalId
      )
      const cityAccountIds = [...new Set([...profileCityAccountIds, ...linkedCityAccountIds])]
      anonymizeInFlightTimestamp = await this.findAnonymizeInFlightTimestamp(
        cityAccountIds,
        commandData.update_timestamp
      )

      if (anonymizeInFlightTimestamp === null) {
        return
      }
    }

    const consentEvents = await this.exportService.fetchConsentEvents({
      city_account_id: entry.externalId,
    })
    const exportedConsents = eventsToConsents(consentEvents)

    // The export can lag behind a genuine, not-yet-delivered local consent
    // change by up to BLOOMREACH_PROPAGATION_WINDOW_HOURS
    const pendingConsents = await this.findPendingConsents(entry.externalId)
    const consents = extractLatestCityAccountConsents([...exportedConsents, ...pendingConsents])

    if (consents.length === 0) {
      this.logger.warn(
        `Customer merging with anonymized profile has no consent events to re-assert, ${toLogfmt({
          externalId: entry.externalId,
          contactId,
        })}`
      )
      return
    }

    const anonymizationTimestamp = anonymizeInFlightTimestamp ?? nowUnixSeconds()
    const restoreTimestampFloor = anonymizationTimestamp + MERGE_CONSENT_RESTORE_BUFFER_SECONDS
    const consentsToRestore = consents.map((consent) => ({
      ...consent,
      timestamp: Math.max(consent.timestamp ?? restoreTimestampFloor, restoreTimestampFloor),
    }))

    await this.outboxWriter.queueConsentEvents(consentsToRestore, entry.externalId)

    this.logger.debug(
      `Queued ${consentsToRestore.length} consent events to survive merge with anonymized profile, ${toLogfmt(
        { externalId: entry.externalId, contactId, anonymizedInBloomreach, anonymizationTimestamp }
      )}`
    )
  }

  /**
   * Heuristic: judged purely from our outbox, not from Bloomreach state.
   *
   * Only the first delivery of the (external_id, contact_id) pair can cause a
   * Bloomreach merge.
   */
  private async couldCauseMerge(entry: BloomreachOutbox, contactId: string): Promise<boolean> {
    const match = await this.prisma.bloomreachOutbox.findFirst({
      where: {
        externalId: entry.externalId,
        status: BloomreachOutboxStatus.COMPLETED,
        commandData: {
          path: ['customer_ids', 'contact_id'],
          equals: contactId,
        },
      },
      select: { id: true },
    })

    return !match
  }

  /**
   * Finds city account ids of other accounts our outbox links to the contact_id,
   * but whose merge into the contact's Bloomreach profile may still be in flight
   */
  private async findPossiblyUnmergedCityAccountIds(
    contactId: string,
    excludeExternalId: string
  ): Promise<string[]> {
    const entries = await this.prisma.bloomreachOutbox.findMany({
      where: {
        externalId: { not: excludeExternalId },
        commandName: BloomreachCommandName.CUSTOMERS,
        commandData: { path: ['customer_ids', 'contact_id'], equals: contactId },
        OR: isLiveOrRecentlyCompleted(),
      },
      select: { externalId: true },
      distinct: ['externalId'],
    })

    return entries.map((entry) => entry.externalId)
  }

  /**
   * Finds the latest `update_timestamp` among in-flight anonymize commands for
   * the given city_account_ids, if any exist.
   */
  private async findAnonymizeInFlightTimestamp(
    cityAccountIds: string[],
    beforeTimestamp: number
  ): Promise<number | null> {
    if (cityAccountIds.length === 0) {
      return null
    }

    const recentlyCompletedCutoff = dayjs()
      .subtract(BLOOMREACH_PROPAGATION_WINDOW_HOURS, 'hour')
      .toDate()

    //language=postgresql
    const rows = await this.prisma.$queryRaw<{ updateTimestamp: number }[]>`
      SELECT ("commandData" ->> 'update_timestamp')::DOUBLE PRECISION AS "updateTimestamp"
      FROM "BloomreachOutbox"
      WHERE
          "externalId" = ANY (${cityAccountIds})
          AND "commandName" = ${BloomreachCommandName.CUSTOMERS}::"BloomreachCommandName"
          AND ("commandData" -> 'properties' ->> 'is_identity_verified')::BOOLEAN = FALSE
          AND ("commandData" ->> 'update_timestamp')::DOUBLE PRECISION < ${beforeTimestamp}
          AND (
              "status" IN (${BloomreachOutboxStatus.PENDING}::"BloomreachOutboxStatus",
                           ${BloomreachOutboxStatus.PROCESSING}::"BloomreachOutboxStatus")
              OR ("status" = ${BloomreachOutboxStatus.COMPLETED}::"BloomreachOutboxStatus"
                  AND "updatedAt" >= ${recentlyCompletedCutoff})
          )
      ORDER BY "updateTimestamp" DESC
      LIMIT 1
    `

    return rows?.[0]?.updateTimestamp ?? null
  }

  /**
   * Checks whether some other row for this same externalId is itself an
   * anonymize command that's live or was recently completed.
   */
  private async hasOwnAnonymizeInFlight(entry: BloomreachOutbox): Promise<boolean> {
    const ownAnonymize = await this.prisma.bloomreachOutbox.findFirst({
      where: {
        id: { not: entry.id },
        externalId: entry.externalId,
        commandName: BloomreachCommandName.CUSTOMERS,
        commandData: { path: ['properties', 'is_identity_verified'], equals: false },
        OR: isLiveOrRecentlyCompleted(),
      },
      select: { id: true },
    })

    return ownAnonymize !== null
  }

  private async findPendingConsents(externalId: string): Promise<Consent[]> {
    const rows = await this.prisma.bloomreachOutbox.findMany({
      where: {
        externalId,
        commandName: BloomreachCommandName.CUSTOMERS_EVENTS,
        OR: isLiveOrRecentlyCompleted(),
      },
    })

    return rows
      .map((row) => row.commandData)
      .filter(isBloomreachEventCommandData)
      .flatMap((commandData) => {
        const consentType = consentTypeFromCategory(commandData.properties.category)
        if (!consentType) {
          return []
        }
        return [
          {
            consentType,
            isGranted: commandData.properties.action === BloomreachConsentActionEnum.ACCEPT,
            timestamp: commandData.timestamp,
          },
        ]
      })
  }
}
