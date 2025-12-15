import { HttpStatus, Injectable } from '@nestjs/common'

import axios, { isAxiosError } from 'axios'
import * as crypto from 'crypto'

import { GdprDataSubscriptionDto } from '../user/dtos/gdpr.user.dto'
import {
  AnonymizeResponse,
  BloomreachConsentActionEnum,
  BloomreachConsentCategoryEnum,
  BloomreachEventNameEnum,
  ConsentBloomreachDataDto,
} from './bloomreach.dto'
import { LineLoggerSubservice } from '../utils/subservices/line-logger.subservice'
import {
  CognitoUserAccountTypesEnum,
  CognitoUserAttributesEnum,
} from '../utils/global-dtos/cognito.dto'
import {
  CognitoUserAttributesTierEnum,
  GDPRCategoryEnum,
  GDPRSubTypeEnum,
  GDPRTypeEnum,
} from '@prisma/client'
import { CognitoSubservice } from '../utils/subservices/cognito.subservice'
import ThrowerErrorGuard from '../utils/guards/errors.guard'
import { PdfConverterService } from './pdf-converter/pdf-converter.service'
import { PrismaService } from '../prisma/prisma.service'
import { ConfigService } from '@nestjs/config'
import { ErrorsEnum } from '../utils/guards/dtos/error.dto'

@Injectable()
export class BloomreachService {
  private readonly logger: LineLoggerSubservice

  private bloomreachCredentials = Buffer.from(
    `${process.env.BLOOMREACH_API_KEY}:${process.env.BLOOMREACH_API_SECRET}`,
    'binary'
  ).toString('base64')

  constructor(
    private readonly cognitoSubservice: CognitoSubservice,
    private readonly throwerErrorGuard: ThrowerErrorGuard,
    private readonly pdfConverterService: PdfConverterService,
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService
  ) {
    if (
      !process.env.BLOOMREACH_API_URL ||
      !process.env.BLOOMREACH_API_KEY ||
      !process.env.BLOOMREACH_API_SECRET ||
      !process.env.BLOOMREACH_PROJECT_TOKEN
    ) {
      throw this.throwerErrorGuard.InternalServerErrorException(
        ErrorsEnum.INTERNAL_SERVER_ERROR,
        'Missing one of pricing api envs: BLOOMREACH_API_URL, BLOOMREACH_API_KEY, BLOOMREACH_API_SECRET, BLOOMREACH_PROJECT_TOKEN.'
      )
    }
    this.logger = new LineLoggerSubservice(BloomreachService.name)
  }

  private createBloomreachConsentCategory(
    category: GDPRCategoryEnum,
    type: GDPRTypeEnum,
    subType: GDPRSubTypeEnum
  ): ConsentBloomreachDataDto {
    const result: ConsentBloomreachDataDto = {
      action: BloomreachConsentActionEnum.ACCEPT,
      category: `${category}-${type}`,
      valid_until: 'unlimited',
    }
    if (subType === GDPRSubTypeEnum.unsubscribe) {
      result.action = BloomreachConsentActionEnum.REJECT
    }
    if (category === GDPRCategoryEnum.ESBS && type === GDPRTypeEnum.MARKETING) {
      result.category = BloomreachConsentCategoryEnum.ESBS_MARKETING
    }
    if (category === GDPRCategoryEnum.TAXES && type === GDPRTypeEnum.FORMAL_COMMUNICATION) {
      result.category = BloomreachConsentCategoryEnum.TAX_COMMUNICATION
    }
    return result
  }

  // TODO: This looks like it can use https://docs.nestjs.com/techniques/events
  async trackCustomer(cognitoId: string): Promise<boolean | undefined> {
    if (process.env.BLOOMREACH_INTEGRATION_STATE !== 'ACTIVE') {
      return undefined
    }
    try {
      const user = await this.cognitoSubservice.getDataFromCognito(cognitoId)
      const {
        given_name: firstName,
        family_name: lastName,
        name,
        UserCreateDate: registrationDate,
        [CognitoUserAttributesEnum.ACCOUNT_TYPE]: accountType,
        [CognitoUserAttributesEnum.OAUTH_ORIGIN_CLIENT_NAME]: oAuthOriginClientName,
        email,
      } = user

      const isIdentityVerified =
        user[CognitoUserAttributesEnum.TIER] === CognitoUserAttributesTierEnum.IDENTITY_CARD ||
        user[CognitoUserAttributesEnum.TIER] === CognitoUserAttributesTierEnum.EID

      const data = {
        customer_ids: {
          city_account_id: cognitoId,
        },
        properties: {
          ...(firstName && { first_name: firstName }),
          ...(lastName && { last_name: lastName }),
          ...(name && { name: name }),
          ...(accountType && { person_type: accountType }),
          ...(registrationDate && { registration_date: registrationDate }),
          ...(email && { email: email }),
          ...(isIdentityVerified && { is_identity_verified: isIdentityVerified }),
          ...(oAuthOriginClientName && { oauth_origin_client_name: oAuthOriginClientName }),
        },
      }
      await axios.post(
        `${process.env.BLOOMREACH_API_URL}/track/v2/projects/${process.env.BLOOMREACH_PROJECT_TOKEN}/customers`,
        JSON.stringify(data),
        {
          headers: {
            Authorization: `Basic ${this.bloomreachCredentials}`,
          },
        }
      )
      return true
    } catch (error) {
      this.logger.warn(`Customer create/edit in bloomreach error for user: ${cognitoId}`)
      this.logger.warn(`Error: ${JSON.stringify(error)}`)
      return false
    }
  }

  private isDeliverySubscription(data: GdprDataSubscriptionDto): boolean {
    return (
      data.category === GDPRCategoryEnum.TAXES &&
      data.type === GDPRTypeEnum.FORMAL_COMMUNICATION &&
      data.subType === GDPRSubTypeEnum.subscribe
    )
  }

  private async trackEvent(
    data: object,
    cognitoId: string,
    eventName: BloomreachEventNameEnum
  ): Promise<void> {
    if (process.env.BLOOMREACH_INTEGRATION_STATE !== 'ACTIVE') {
      return
    }
    console.log(JSON.stringify(data, undefined, 2))
    await axios
      .post(
        `${process.env.BLOOMREACH_API_URL}/track/v2/projects/${process.env.BLOOMREACH_PROJECT_TOKEN}/customers/events`,
        {
          customer_ids: {
            city_account_id: cognitoId,
          },
          properties: {
            ...data,
          },
          event_type: eventName,
        },
        {
          headers: {
            Authorization: `Basic ${this.bloomreachCredentials}`,
          },
        }
      )
      .catch((error) => {
        this.logger.error(error, { alert: 1 })
      })
  }

  async trackEventConsents(
    gdprData: GdprDataSubscriptionDto[],
    cognitoId: string | null,
    userId: string,
    isLegalPerson: boolean
  ) {
    const userType = isLegalPerson ? 'legal person' : 'user'
    if (!cognitoId) {
      this.logger.error(
        `No externalId for ${userType} with id: ${userId} has no externalId, skipping trackEventConsents`
      )
      return
    }

    this.logger.log(`Tracking ${gdprData.length} events for ${userType} with id: ${cognitoId}`)
    await Promise.allSettled(
      gdprData.map(async (elem) => {
        const consentBloomreachData = this.createBloomreachConsentCategory(
          elem.category,
          elem.type,
          elem.subType
        )
        let hash: string | undefined = undefined
        if (this.isDeliverySubscription(elem)) {
          hash = crypto.randomBytes(32).toString('base64url')
          console.log(hash)
          await this.prisma.notificationAgreementHash.create({
            data: {
              hash,
              ...(isLegalPerson ? { legalPersonId: userId } : { userId }),
            },
          })
        }
        this.trackEvent(
          {
            ...consentBloomreachData,
            ...(hash
              ? {
                  document_link: `${this.configService.getOrThrow('SELF_URL')}/bloomreach/get-notify-agreement-pdf/hash=${hash}`,
                }
              : {}),
          },
          cognitoId,
          BloomreachEventNameEnum.CONSENT
        )
        console.log('ok ok ok')
      })
    )
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
      const response = await axios.post(
        `${process.env.BLOOMREACH_API_URL}/data/v2/projects/${process.env.BLOOMREACH_PROJECT_TOKEN}/customers/anonymize`,
        JSON.stringify({
          customer_ids: {
            city_account_id: cognitoId,
          },
        }),
        {
          headers: {
            Authorization: `Basic ${this.bloomreachCredentials}`,
            'Content-Type': 'application/json',
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
      if (isAxiosError(error) && error.response?.status === HttpStatus.NOT_FOUND) {
        // User not found in bloomreach
        return AnonymizeResponse.NOT_FOUND
      }
      this.logger.error(error)
      return AnonymizeResponse.ERROR
    }
  }

  async getFileByHash(hash: string) {
    const hashData = await this.prisma.notificationAgreementHash.findUnique({
      where: { hash },
      include: {
        user: true,
        legalPerson: true,
      },
    })

    if (!hashData) {
      throw this.throwerErrorGuard.NotFoundException(
        ErrorsEnum.NOT_FOUND_ERROR,
        'Hash does not exist.'
      )
    }

    const birthNumber = hashData.user?.birthNumber || hashData.legalPerson?.birthNumber

    if (!birthNumber) {
      throw this.throwerErrorGuard.InternalServerErrorException(
        ErrorsEnum.INTERNAL_SERVER_ERROR,
        'User does not contain a birth number.'
      )
    }

    const externaId = hashData.user?.externalId || hashData.legalPerson?.externalId

    if (!externaId) {
      throw this.throwerErrorGuard.InternalServerErrorException(
        ErrorsEnum.INTERNAL_SERVER_ERROR,
        'Hash exists but the user does not exist in cognito.'
      )
    }

    const cognitoData = await this.cognitoSubservice.getDataFromCognito(externaId)
    const name =
      cognitoData['custom:account_type'] === CognitoUserAccountTypesEnum.LEGAL_ENTITY
        ? cognitoData.name
        : [cognitoData.given_name, cognitoData.family_name].join(' ')

    if (!name) {
      throw this.throwerErrorGuard.InternalServerErrorException(
        ErrorsEnum.INTERNAL_SERVER_ERROR,
        'User does not have the name set.'
      )
    }

    const pdf = await this.pdfConverterService.getPdfByTemplateName(
      'delivery-method-set-to-notification',
      'súhlas so zasielaním oznámením.pdf',
      {
        name,
        email: cognitoData.email,
        birthNumber,
      },
      birthNumber
    )

    return pdf
  }
}
