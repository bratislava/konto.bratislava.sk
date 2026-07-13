import { Injectable } from '@nestjs/common'

import BaConfigService from '../config/ba-config.service'
import { ErrorsEnum } from '../utils/guards/dtos/error.dto'
import ThrowerErrorGuard from '../utils/guards/errors.guard'
import { LineLoggerSubservice } from '../utils/subservices/line-logger.subservice'
import {
  BloomreachEventNameEnum,
  TaxBloomreachData,
  TaxPaymentBloomreachData,
  UnpaidTaxInstallmentReminderBloomreachData,
} from './bloomreach.types'

@Injectable()
export class BloomreachService {
  private readonly logger: LineLoggerSubservice

  private readonly bloomreachCredentials: string

  constructor(
    private readonly throwerErrorGuard: ThrowerErrorGuard,
    private readonly baConfigService: BaConfigService,
  ) {
    const { apiKey, apiSecret } = this.baConfigService.bloomreach
    this.bloomreachCredentials = Buffer.from(
      `${apiKey}:${apiSecret}`,
      'binary',
    ).toString('base64')
    this.logger = new LineLoggerSubservice(BloomreachService.name)
  }

  private async trackEvent(
    data: object,
    cognitoId: string,
    eventName: BloomreachEventNameEnum,
  ): Promise<boolean> {
    if (!this.baConfigService.featureToggles.sendBloomreachEvents) {
      this.logger.debug(
        `Bloomreach events are disabled, skipping event ${eventName} for user ${cognitoId}. Object content: ${JSON.stringify(data)}`,
      )
      return true
    }
    const { apiUrl, projectToken } = this.baConfigService.bloomreach
    const eventResponse = await fetch(
      `${apiUrl}/track/v2/projects/${projectToken}/customers/events`,
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

  async trackEventUnpaidTaxInstallmentReminder(
    taxData: UnpaidTaxInstallmentReminderBloomreachData,
    cognitoId: string,
  ): Promise<boolean> {
    return this.trackEvent(
      taxData,
      cognitoId,
      BloomreachEventNameEnum.UNPAID_TAX_INSTALLMENT_REMINDER,
    )
  }
}
