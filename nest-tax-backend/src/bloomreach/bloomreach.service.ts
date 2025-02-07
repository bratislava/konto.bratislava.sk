import { Injectable } from '@nestjs/common'

import { ErrorsEnum } from '../utils/guards/dtos/error.dto'
import ThrowerErrorGuard from '../utils/guards/errors.guard'
import { LineLoggerSubservice } from '../utils/subservices/line-logger.subservice'
import {
  BloomreachEventNameEnum,
  TaxBloomreachDataDto,
  TaxPaymentBloomreachDataDto,
} from './bloomreach.dto'

@Injectable()
export class BloomreachService {
  private readonly logger: LineLoggerSubservice

  private readonly bloomreachCredentials = Buffer.from(
    `${process.env.BLOOMREACH_API_KEY}:${process.env.BLOOMREACH_API_SECRET}`,
    'binary',
  ).toString('base64')

  constructor(private readonly throwerErrorGuard: ThrowerErrorGuard) {
    if (
      !process.env.BLOOMREACH_API_URL ||
      !process.env.BLOOMREACH_API_KEY ||
      !process.env.BLOOMREACH_API_SECRET ||
      !process.env.BLOOMREACH_PROJECT_TOKEN
    ) {
      throw this.throwerErrorGuard.InternalServerErrorException(
        ErrorsEnum.INTERNAL_SERVER_ERROR,
        'Missing on of pricing api envs: BLOOMREACH_API_URL, BLOOMREACH_API_KEY, BLOOMREACH_API_SECRET, BLOOMREACH_PROJECT_TOKEN.',
      )
    }
    this.logger = new LineLoggerSubservice(BloomreachService.name)
  }

  private async trackEvent(
    data: object,
    cognitoId: string,
    eventName: BloomreachEventNameEnum,
  ): Promise<boolean> {
    const eventResponse = await fetch(
      `${process.env.BLOOMREACH_API_URL}/track/v2/projects/${process.env.BLOOMREACH_PROJECT_TOKEN}/customers/events`,
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
    taxPaymentData: TaxPaymentBloomreachDataDto,
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
    taxData: TaxBloomreachDataDto,
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
}
