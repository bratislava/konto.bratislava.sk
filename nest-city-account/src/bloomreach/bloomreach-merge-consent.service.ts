import { Injectable } from '@nestjs/common'
import { isAxiosError } from 'axios'
import dayjs from 'dayjs'

import { BloomreachOutbox, BloomreachOutboxStatus } from '../generated/prisma/client'
import { PrismaService } from '../prisma/prisma.service'
import { ErrorsEnum } from '../utils/guards/dtos/error.dto'
import ThrowerErrorGuard from '../utils/guards/errors.guard'
import { toLogfmt } from '../utils/logging'
import { LineLoggerSubservice } from '../utils/subservices/line-logger.subservice'
import { BloomreachCommandNameEnum, BloomreachCustomerCommandData } from './bloomreach.types'
import { BloomreachExportService } from './bloomreach-export.service'
import { BloomreachOutboxWriterService } from './bloomreach-outbox-writer.service'
import { extractLatestCityAccountConsents } from './utils/consents.utils'

/**
 * Bloomreach processes delivered commands in a queue. Typically within ~10
 * seconds, up to 8 hours at worst. A COMPLETED anonymize this recent may not
 * be visible in exports yet and must still count as an anonymization in flight.
 */
const ANONYMIZE_PROPAGATION_WINDOW_HOURS = 8

/** A merged Bloomreach customer keeps all values of an ID, so ids can be arrays. */
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
 * that profile was anonymized, its consent rejects would win the merge's
 * latest-wins resolution. Before such a command is sent, this service re-queues
 * the customer's consent state (as exported from Bloomreach) as fresh consent
 * events, whose newer timestamps win instead.
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
   *          could not be queued - the entry must not be sent in that case
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
    if (entry.commandName !== BloomreachCommandNameEnum.CUSTOMERS.toString()) {
      return
    }

    const commandData = entry.commandData as BloomreachCustomerCommandData
    const contactId = commandData.customer_ids.contact_id

    if (!contactId) {
      return
    }

    if (!(await this.couldCauseMerge(entry, contactId))) {
      return
    }

    const contactProfile = await this.exportService.fetchCustomer({ contact_id: contactId })
    if (!contactProfile) {
      return
    }

    const profileCityAccountIds = normalizeIdValues(contactProfile.ids.city_account_id)
    if (profileCityAccountIds.includes(entry.externalId)) {
      // The profile already carries this customer's `city_account_id` and no
      // merge can occur.
      return
    }

    // The exported profile only lists city_account_ids Bloomreach has already
    // applied — our outbox may link further accounts to the contact_id.
    const linkedCityAccountIds = await this.findPossiblyUnmergedCityAccountIds(
      contactId,
      entry.externalId
    )
    const cityAccountIds = [...new Set([...profileCityAccountIds, ...linkedCityAccountIds])]

    // Only city-account writes is_identity_verified, and only anonymization
    // sets it to false while the contact_id is retained. Profiles created by
    // other backends lack the property entirely.
    const anonymizedInBloomreach = contactProfile.properties.is_identity_verified === false
    const anonymized =
      anonymizedInBloomreach ||
      (await this.hasAnonymizeInFlight(cityAccountIds, commandData.update_timestamp))

    if (!anonymized) {
      return
    }

    const consentEvents = await this.exportService.fetchConsentEvents({
      city_account_id: entry.externalId,
    })
    const consents = extractLatestCityAccountConsents(consentEvents)

    if (consents.length === 0) {
      this.logger.warn(
        `Customer merging with anonymized profile has no consent events to re-assert, ${toLogfmt({
          externalId: entry.externalId,
          contactId,
        })}`
      )
      return
    }

    await this.outboxWriter.queueConsentEvents(consents, entry.externalId)

    this.logger.log(
      `Queued ${consents.length} consent events to survive merge with anonymized profile, ${toLogfmt(
        { externalId: entry.externalId, contactId, anonymizedInBloomreach }
      )}`
    )
  }

  /**
   * Heuristic: judged purely from our outbox, not from Bloomreach state.
   *
   * Only the first delivery of the (external_id, contact_id) pair can cause a
   * Bloomreach merge, and any other outbox entry already carrying this
   * attachment for the account is taken to mean Bloomreach has received it.
   */
  private async couldCauseMerge(entry: BloomreachOutbox, contactId: string): Promise<boolean> {
    const rows = await this.prisma.$queryRaw<{ exists: boolean }[]>
    //language=postgresql
    `
        SELECT EXISTS
            (SELECT 1
             FROM
                 "BloomreachOutbox"
             WHERE
                 "externalId" = ${entry.externalId}
                 AND "status" = ${BloomreachOutboxStatus.COMPLETED}::"BloomreachOutboxStatus"
                 AND "commandData" -> 'customer_ids' ->> 'contact_id' = ${contactId}) AS "exists"
    `

    return !(rows[0]?.exists ?? false)
  }

  /**
   * Finds city account ids of other accounts our outbox links to the contact_id,
   * but whose merge into the contact's Bloomreach profile may not have happened
   * yet. The linking command is still queued, or was delivered within
   * {@link ANONYMIZE_PROPAGATION_WINDOW_HOURS} and may not be applied.
   */
  private async findPossiblyUnmergedCityAccountIds(
    contactId: string,
    excludeExternalId: string
  ): Promise<string[]> {
    const entries = await this.prisma.bloomreachOutbox.findMany({
      where: {
        externalId: { not: excludeExternalId },
        commandName: BloomreachCommandNameEnum.CUSTOMERS,
        commandData: { path: ['customer_ids', 'contact_id'], equals: contactId },
        OR: [
          { status: { in: [BloomreachOutboxStatus.PENDING, BloomreachOutboxStatus.PROCESSING] } },
          {
            status: BloomreachOutboxStatus.COMPLETED,
            updatedAt: {
              gte: dayjs().subtract(ANONYMIZE_PROPAGATION_WINDOW_HOURS, 'hour').toDate(),
            },
          },
        ],
      },
      select: { externalId: true },
      distinct: ['externalId'],
    })

    return entries.map((entry) => entry.externalId)
  }

  /**
   * An anonymize command for the profile may not be reflected in exported
   * Bloomreach state yet. It could still be waiting in the outbox, or be
   * delivered within {@link ANONYMIZE_PROPAGATION_WINDOW_HOURS} and not applied
   * by Bloomreach yet.
   */
  private async hasAnonymizeInFlight(
    cityAccountIds: string[],
    beforeTimestamp: number
  ): Promise<boolean> {
    if (cityAccountIds.length === 0) {
      return false
    }

    const anonymizeInFlight = await this.prisma.bloomreachOutbox.findFirst({
      where: {
        externalId: { in: cityAccountIds },
        commandName: BloomreachCommandNameEnum.CUSTOMERS,
        AND: [
          { commandData: { path: ['properties', 'is_identity_verified'], equals: false } },
          { commandData: { path: ['update_timestamp'], lt: beforeTimestamp } },
        ],
        OR: [
          { status: { in: [BloomreachOutboxStatus.PENDING, BloomreachOutboxStatus.PROCESSING] } },
          {
            status: BloomreachOutboxStatus.COMPLETED,
            updatedAt: {
              gte: dayjs().subtract(ANONYMIZE_PROPAGATION_WINDOW_HOURS, 'hour').toDate(),
            },
          },
        ],
      },
    })

    return anonymizeInFlight !== null
  }
}
