import { Injectable, Logger } from '@nestjs/common'

import axios, { AxiosError } from 'axios'

import { GdprCategory, GdprDataDto, GdprSubType, GdprType } from '../user/dtos/gdpr.user.dto'
import {
  AnonymizeResponse,
  BloomreachConsentActionEnum,
  BloomreachConsentCategoryEnum,
  BloomreachEventNameEnum,
  ConsentBloomreachDataDto,
} from './bloomreach.dto'

@Injectable()
export class BloomreachService {
  private readonly logger: Logger = new Logger(BloomreachService.name)

  private bloomreachCredentials = Buffer.from(
    `${process.env.BLOOMREACH_API_KEY}:${process.env.BLOOMREACH_API_SECRET}`,
    'binary'
  ).toString('base64')

  constructor() {
    if (
      !process.env.BLOOMREACH_API_URL ||
      !process.env.BLOOMREACH_API_KEY ||
      !process.env.BLOOMREACH_API_SECRET ||
      !process.env.BLOOMREACH_PROJECT_TOKEN
    ) {
      throw new Error(
        'Missing one of pricing api envs: BLOOMREACH_API_URL, BLOOMREACH_API_KEY, BLOOMREACH_API_SECRET, BLOOMREACH_PROJECT_TOKEN.'
      )
    }
  }

  private createBloomreachConsentCategory(
    category: GdprCategory,
    type: GdprType,
    subType: GdprSubType
  ): ConsentBloomreachDataDto {
    const result: ConsentBloomreachDataDto = {
      action: BloomreachConsentActionEnum.ACCEPT,
      category: `${category}-${type}`,
      valid_until: 'unlimited',
    }
    if (subType === GdprSubType.UNSUB) {
      result.action = BloomreachConsentActionEnum.REJECT
    }
    if (category === GdprCategory.ESBS && type === GdprType.LICENSE) {
      result.category = BloomreachConsentCategoryEnum.ESBS_LICENSE
    }
    if (category === GdprCategory.ESBS && type === GdprType.MARKETING) {
      result.category = BloomreachConsentCategoryEnum.ESBS_MARKETING
    }
    if (category === GdprCategory.TAXES && type === GdprType.FORMAL_COMMUNICATION) {
      result.category = BloomreachConsentCategoryEnum.TAX_COMMUNICATION
    }
    return result
  }

  private async trackEvent(
    data: object,
    cognitoId: string,
    eventName: BloomreachEventNameEnum
  ): Promise<boolean | undefined> {
    if (process.env.BLOOMREACH_INTEGRATION_STATE !== 'ACTIVE') {
      return undefined
    }
    try {
      const eventResponse = await axios
        .post(
          `${process.env.BLOOMREACH_API_URL}/track/v2/projects/${process.env.BLOOMREACH_PROJECT_TOKEN}/customers/events`,
          JSON.stringify({
            customer_ids: {
              city_account_id: cognitoId,
            },
            properties: {
              ...data,
            },
            event_type: eventName,
          }),
          {
            headers: {
              Authorization: `Basic ${this.bloomreachCredentials}`,
            },
          }
        )
        .catch((error) => {
          this.logger.warn(error)
          throw error
        })
      if (eventResponse.status != 200) {
        this.logger.warn(`Write event ${eventName} to bloomreach error for user: ${cognitoId}`)
        return false
      }
    } catch (error) {
      return false
    }

    return true
  }

  async trackEventConsent(
    gdprSubType: GdprSubType,
    gdprData: GdprDataDto[],
    cognitoId: string | null,
  ): Promise<boolean | undefined> {
    if (!cognitoId) {
      return false
    }
    let result = true
    for (const elem of gdprData) {
      const pushEventResult = await this.trackEvent(
        this.createBloomreachConsentCategory(elem.category, elem.type, gdprSubType),
        cognitoId,
        BloomreachEventNameEnum.CONSENT
      )
      if (!pushEventResult) {
        result = false
      }
    }

    return result
  }

  /**
   * Anonymizes a customer based on his cognito id in bloomreach. This is a part of user acccount deactivation process.
   * For more info about bloomreach anonymization see https://documentation.bloomreach.com/engagement/reference/anonymize-a-customer-2
   * 
   * @param cognitoId Id of the user to be anonymized
   * @returns Enum of type AnonymizeResponse with the status of anonymization (if it went successfully, or if there was some error)
   */
  async anonymizeCustomer(cognitoId: string): Promise<AnonymizeResponse> {
    if (process.env.BLOOMREACH_INTEGRATION_STATE !== 'ACTIVE') {
      return AnonymizeResponse.NOT_ACTIVE
    }

    try {
      const response = await axios
        .post(
          `${process.env.BLOOMREACH_API_URL}/data/v2/projects/${process.env.BLOOMREACH_PROJECT_TOKEN}/customers/anonymize`,
          JSON.stringify({
            customer_ids: {
              city_account_id: cognitoId,
            },
          }),
          {
            headers: {
              Authorization: `Basic ${this.bloomreachCredentials}`,
              "Content-Type": 'application/json',
              Accept: 'application/json',
            },
          }
        )
        
      if (response.status !== 200) {
        this.logger.error(`Anonymize user in bloomreach error for user: ${cognitoId}`)
        return AnonymizeResponse.ERROR
      }
      return AnonymizeResponse.SUCCESS
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 404) { // User not found in bloomreach
        return AnonymizeResponse.NOT_FOUND
      }
      this.logger.error(error)
      return AnonymizeResponse.ERROR
    }
  }
}
