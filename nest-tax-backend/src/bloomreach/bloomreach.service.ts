import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

import { ErrorsEnum } from '../utils/guards/dtos/error.dto'
import ThrowerErrorGuard from '../utils/guards/errors.guard'
import { LineLoggerSubservice } from '../utils/subservices/line-logger.subservice'
import {
  BloomreachEventNameEnum,
  TaxBloomreachData,
  TaxPaymentBloomreachData,
  UnpaidTaxReminderBloomreachData,
} from './bloomreach.types'

@Injectable()
export class BloomreachService {
  private readonly logger: LineLoggerSubservice

  private readonly bloomreachCredentials = Buffer.from(
    `${this.configService.getOrThrow<string>('BLOOMREACH_API_KEY')}:${this.configService.getOrThrow<string>('BLOOMREACH_API_SECRET')}`,
    'binary',
  ).toString('base64')

  constructor(
    private readonly throwerErrorGuard: ThrowerErrorGuard,
    private readonly configService: ConfigService,
  ) {
    this.configService.getOrThrow<string>('BLOOMREACH_API_URL') ||
    this.configService.getOrThrow<string>('BLOOMREACH_API_KEY') ||
    this.configService.getOrThrow<string>('BLOOMREACH_API_SECRET') ||
    this.configService.getOrThrow<string>('BLOOMREACH_PROJECT_TOKEN')

    this.logger = new LineLoggerSubservice(BloomreachService.name)
  }

  private async trackEvent(
    data: object,
    cognitoId: string,
    eventName: BloomreachEventNameEnum,
  ): Promise<boolean> {
    if (
      this.configService.getOrThrow<string>(
        'FEATURE_TOGGLE_SEND_BLOOMREACH_EVENTS',
      ) !== 'true'
    ) {
      this.logger.debug(
        `Bloomreach events are disabled, skipping event ${eventName} for user ${cognitoId}. Object content: ${JSON.stringify(data)}`,
      )
      return true
    }
    const eventResponse = await fetch(
      `${this.configService.getOrThrow<string>('BLOOMREACH_API_URL')}/track/v2/projects/${this.configService.getOrThrow<string>('BLOOMREACH_PROJECT_TOKEN')}/customers/events`,
      {
        method: 'POST',
        body: JSON.stringify({
          customer_ids: {
            city_account_id: cognitoId,
          },
          properties: {
            ...data,
          },
          event_type: eventName,
        }),
        headers: {
          Authorization: `Basic ${this.bloomreachCredentials}`,
        },
      },
    )
    if (eventResponse.status !== 200) {
      this.logger.error(
        this.throwerErrorGuard.InternalServerErrorException(
          ErrorsEnum.INTERNAL_SERVER_ERROR,
          `Error in send data to Bloomreach for user id ${cognitoId}`,
        ),
      )
      return false
    }
    return true
  }

  async trackEventTaxPayment(
    taxPaymentData: TaxPaymentBloomreachData,
    cognitoId?: string,
  ): Promise<boolean> {
    if (!cognitoId) {
      return false
    }
    const pushEventResult = await this.trackEvent(
      taxPaymentData,
      cognitoId,
      BloomreachEventNameEnum.TAX_PAYMENT,
    )
    return pushEventResult
  }

  async trackEventTax(
    taxData: TaxBloomreachData,
    cognitoId?: string,
  ): Promise<boolean> {
    if (!cognitoId) {
      return false
    }
    const pushEventResult = await this.trackEvent(
      taxData,
      cognitoId,
      BloomreachEventNameEnum.TAX,
    )
    return pushEventResult
  }

  async trackEventUnpaidTaxReminder(
    taxData: UnpaidTaxReminderBloomreachData,
    cognitoId: string,
  ): Promise<void> {
    await this.trackEvent(
      taxData,
      cognitoId,
      BloomreachEventNameEnum.UNPAID_TAX_REMINDER,
    )
  }
}
