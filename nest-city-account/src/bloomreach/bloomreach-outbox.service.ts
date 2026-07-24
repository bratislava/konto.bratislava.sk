import { ErrorEnum, ErrorFactoryService, LineLoggerSubservice } from '@bratislava/log-nest'
import { Injectable } from '@nestjs/common'

import BaConfigService from '../config/ba-config.service'
import { ConsentEnum } from '../generated/prisma/enums'
import { Consent } from './bloomreach.types'
import { BloomreachOutboxWriterService } from './bloomreach-outbox-writer.service'

@Injectable()
export class BloomreachOutboxService {
  constructor(
    private readonly outboxWriter: BloomreachOutboxWriterService,
    private readonly errorFactoryService: ErrorFactoryService,
    private readonly baConfigService: BaConfigService,
    private readonly logger: LineLoggerSubservice
  ) {}

  async trackCustomer(externalId: string, phoneNumber?: string): Promise<void> {
    if (this.baConfigService.bloomreach.integrationState !== 'ACTIVE') {
      return
    }

    try {
      await this.outboxWriter.queueCustomerCommand(externalId, phoneNumber)

      this.logger.debug(`Queued customers command for ${externalId}`)
    } catch (error) {
      this.logger.error(
        this.errorFactoryService.InternalServerErrorException({
          errorEnum: ErrorEnum.INTERNAL_SERVER_ERROR,
          message: 'Failed to queue customer tracking',
          console: { externalId, hasPhoneNumber: !!phoneNumber },
          error,
        })
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
    if (this.baConfigService.bloomreach.integrationState !== 'ACTIVE') {
      return
    }

    const userType =
      isLegalPerson === true ? 'legal_person' : isLegalPerson === false ? 'user' : 'unknown'

    if (!externalId) {
      this.logger.error(
        this.errorFactoryService.InternalServerErrorException({
          errorEnum: ErrorEnum.INTERNAL_SERVER_ERROR,
          message: `No externalId for ${userType}, skipping trackConsents`,
          console: { userId, userType },
        })
      )
      return
    }

    try {
      await this.outboxWriter.queueConsentEvents(consents, externalId, terminal)

      this.logger.debug(`Queued ${consents.length} consent events for ${userType} ${externalId}`)
    } catch (error) {
      this.logger.error(
        this.errorFactoryService.InternalServerErrorException({
          errorEnum: ErrorEnum.INTERNAL_SERVER_ERROR,
          message: 'Failed to queue consent events',
          console: { externalId, userType, eventCount: consents.length },
          error,
        })
      )
    }
  }

  async anonymizeCustomer(externalId: string): Promise<void> {
    if (this.baConfigService.bloomreach.integrationState !== 'ACTIVE') {
      return
    }

    await this.trackConsents(
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
        this.errorFactoryService.InternalServerErrorException({
          errorEnum: ErrorEnum.INTERNAL_SERVER_ERROR,
          message: 'Failed to queue anonymize commands',
          console: { externalId },
          error,
        })
      )
    }
  }
}
