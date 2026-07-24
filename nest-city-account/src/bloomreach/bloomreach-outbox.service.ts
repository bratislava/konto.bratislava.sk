import { Injectable } from '@nestjs/common'

import BaConfigService from '../config/ba-config.service'
import { ConsentEnum } from '../generated/prisma/enums'
import { ErrorsEnum } from '../utils/guards/dtos/error.dto'
import ThrowerErrorGuard from '../utils/guards/errors.guard'
import { toLogfmt } from '../utils/logging'
import { LineLoggerSubservice } from '../utils/subservices/line-logger.subservice'
import { Consent } from './bloomreach.types'
import { BloomreachOutboxWriterService } from './bloomreach-outbox-writer.service'

@Injectable()
export class BloomreachOutboxService {
  private readonly logger: LineLoggerSubservice

  constructor(
    private readonly outboxWriter: BloomreachOutboxWriterService,
    private readonly throwerErrorGuard: ThrowerErrorGuard,
    private readonly baConfigService: BaConfigService
  ) {
    this.logger = new LineLoggerSubservice(BloomreachOutboxService.name)
  }

  async trackCustomer(externalId: string, phoneNumber?: string): Promise<void> {
    if (this.baConfigService.bloomreach.integrationState !== 'ACTIVE') {
      return
    }

    try {
      await this.outboxWriter.queueCustomerCommand(externalId, phoneNumber)

      this.logger.debug(`Queued customers command for ${externalId}`)
    } catch (error) {
      this.logger.error(
        this.throwerErrorGuard.InternalServerErrorException(
          ErrorsEnum.INTERNAL_SERVER_ERROR,
          'Failed to queue customer tracking',
          toLogfmt({ externalId, hasPhoneNumber: !!phoneNumber }),
          error
        )
      )
    }
  }

  /**
   * Track a set of consent records ({@link Consent}) for a customer as Bloomreach consent events.
   */
  async trackConsents(
    consents: Consent[],
    externalId: string | null,
    userId?: string,
    isLegalPerson?: boolean
  ): Promise<void> {
    return this.trackConsentsInternal(consents, externalId, userId, isLegalPerson, false)
  }

  /**
   * `terminal` is only ever set by {@link anonymizeCustomer} so it is kept out
   * of {@link trackConsents}'s public signature.
   */
  private async trackConsentsInternal(
    consents: Consent[],
    externalId: string | null,
    userId: string | undefined,
    isLegalPerson: boolean | undefined,
    terminal: boolean
  ): Promise<void> {
    if (this.baConfigService.bloomreach.integrationState !== 'ACTIVE') {
      return
    }

    const userType =
      isLegalPerson === true ? 'legal_person' : isLegalPerson === false ? 'user' : 'unknown'

    if (!externalId) {
      this.logger.error(
        this.throwerErrorGuard.InternalServerErrorException(
          ErrorsEnum.INTERNAL_SERVER_ERROR,
          `No externalId for ${userType}, skipping trackConsents`,
          toLogfmt({ userId, userType })
        )
      )
      return
    }

    try {
      await this.outboxWriter.queueConsentEvents(consents, externalId, terminal)

      this.logger.debug(`Queued ${consents.length} consent events for ${userType} ${externalId}`)
    } catch (error) {
      this.logger.error(
        this.throwerErrorGuard.InternalServerErrorException(
          ErrorsEnum.INTERNAL_SERVER_ERROR,
          'Failed to queue consent events',
          toLogfmt({ externalId, userType, eventCount: consents.length }),
          error
        )
      )
    }
  }

  async anonymizeCustomer(externalId: string): Promise<void> {
    if (this.baConfigService.bloomreach.integrationState !== 'ACTIVE') {
      return
    }

    await this.trackConsentsInternal(
      [
        { consentType: ConsentEnum.MARKETING, isGranted: false },
        { consentType: ConsentEnum.GENERAL, isGranted: false },
      ],
      externalId,
      undefined,
      undefined,
      true
    )

    try {
      await this.outboxWriter.queueAnonymizeCommand(externalId)

      this.logger.debug(`Queued anonymize commands for ${externalId}`)
    } catch (error) {
      this.logger.error(
        this.throwerErrorGuard.InternalServerErrorException(
          ErrorsEnum.INTERNAL_SERVER_ERROR,
          'Failed to queue anonymize commands',
          toLogfmt({ externalId }),
          error
        )
      )
    }
  }
}
