import { HttpStatus, Injectable } from '@nestjs/common'
import {
  CognitoUserAttributesTierEnum,
  GDPRCategoryEnum,
  GDPRSubTypeEnum,
  GDPRTypeEnum,
} from '@prisma/client'
import axios, { isAxiosError } from 'axios'

import { ACTIVE_USER_FILTER, PrismaService } from '../prisma/prisma.service'
import { GdprDataSubscriptionDto } from '../user/dtos/gdpr.user.dto'
import {
  CognitoGetUserData,
  CognitoUserAccountTypesEnum,
  CognitoUserAttributesEnum,
} from '../utils/global-dtos/cognito.dto'
import { ErrorsEnum } from '../utils/guards/dtos/error.dto'
import ThrowerErrorGuard from '../utils/guards/errors.guard'
import { CognitoSubservice } from '../utils/subservices/cognito.subservice'
import { LineLoggerSubservice } from '../utils/subservices/line-logger.subservice'
import {
  AnonymizeResponse,
  BloomreachConsentActionEnum,
  BloomreachConsentCategoryEnum,
  BloomreachEventNameEnum,
  ConsentBloomreachDataDto,
} from './bloomreach.dto'
import { BloomreachContactDatabaseService } from './bloomreach-contact-database.service'

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
    private readonly prisma: PrismaService,
    private readonly bloomreachContactDatabaseService: BloomreachContactDatabaseService
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

  // TODO: Refactor - duplicate exists in paas-mpa/paas-mpa.service.ts
  private async getVerifiedIdentifiers(user: CognitoGetUserData): Promise<{
    birthNumber?: string
    ico?: string
  }> {
    const accountType = user[CognitoUserAttributesEnum.ACCOUNT_TYPE]

    switch (accountType) {
      case CognitoUserAccountTypesEnum.PHYSICAL_ENTITY: {
        const foundUser = await this.prisma.user.findUnique({
          where: {
            externalId: user.idUser,
            ...ACTIVE_USER_FILTER,
          },
          select: {
            birthNumber: true,
          },
        })

        return { birthNumber: foundUser?.birthNumber ?? undefined }
      }
      case CognitoUserAccountTypesEnum.LEGAL_ENTITY:
      case CognitoUserAccountTypesEnum.SELF_EMPLOYED_ENTITY: {
        const legalPerson = await this.prisma.legalPerson.findUnique({
          where: {
            externalId: user.idUser,
          },
          select: {
            birthNumber: true,
            ico: true,
          },
        })

        return {
          birthNumber: legalPerson?.birthNumber ?? undefined,
          ico: legalPerson?.ico ?? undefined,
        }
      }
      default:
        return {}
    }
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
  async trackCustomer(cognitoId: string, phoneNumber?: string): Promise<boolean | undefined> {
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

      let contactId: string | undefined

      if (isIdentityVerified) {
        const { birthNumber, ico } = await this.getVerifiedIdentifiers(user)
        if (birthNumber) {
          contactId = await this.bloomreachContactDatabaseService.upsert(email, birthNumber, ico)
        }
      }

      if (contactId && phoneNumber) {
        await this.bloomreachContactDatabaseService.addPhone(contactId, phoneNumber)
      }

      const data = {
        customer_ids: {
          city_account_id: cognitoId,
          ...(contactId && { contact_id: contactId }),
        },
        properties: {
          ...(firstName && { first_name: firstName }),
          ...(lastName && { last_name: lastName }),
          ...(name && { name }),
          ...(accountType && { person_type: accountType }),
          ...(registrationDate && { registration_date: registrationDate }),
          ...(email && { email }),
          ...(phoneNumber && { phone: phoneNumber }),
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

  private async trackEvent(
    data: object,
    cognitoId: string,
    eventName: BloomreachEventNameEnum
  ): Promise<void> {
    if (process.env.BLOOMREACH_INTEGRATION_STATE !== 'ACTIVE') {
      return
    }
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
      .catch((error: unknown) => {
        this.logger.error(error, { alert: 1 })
      })
  }

  async trackEventConsents(
    gdprData: GdprDataSubscriptionDto[],
    cognitoId: string | null,
    userId?: string,
    isLegalPerson?: boolean
  ) {
    const userType =
      isLegalPerson === true ? 'legal_person' : isLegalPerson === false ? 'user' : 'unknown'
    if (!cognitoId) {
      this.logger.error(
        `No externalId for ${userType} with id: ${userId} has no externalId, skipping trackEventConsents`
      )
      return
    }

    this.logger.log(`Tracking ${gdprData.length} events for ${userType} with id: ${cognitoId}`)
    await Promise.allSettled(
      gdprData.map(async (elem) =>
        this.trackEvent(
          this.createBloomreachConsentCategory(elem.category, elem.type, elem.subType),
          cognitoId,
          BloomreachEventNameEnum.CONSENT
        )
      )
    )
  }

  /**
   * Anonymizes a customer based on his cognito id in bloomreach. This is a part of user acccount deactivation process.
   * We only remove city account information from bloomreach and must keep information from other sources.
   * Therefore, we can't use bloomreach anonymization endpoint, as it would remove all information from bloomreach.
   *
   * @param cognitoId Id of the user to be anonymized
   * @returns Enum of type AnonymizeResponse with the status of anonymization (if it went successfully, or if there was some error)
   */
  async anonymizeCustomer(cognitoId: string): Promise<AnonymizeResponse> {
    if (process.env.BLOOMREACH_INTEGRATION_STATE !== 'ACTIVE') {
      return AnonymizeResponse.NOT_ACTIVE
    }

    try {
      await this.trackEventConsents(
        [
          {
            type: GDPRTypeEnum.MARKETING,
            category: GDPRCategoryEnum.ESBS,
            subType: GDPRSubTypeEnum.unsubscribe,
          },
          {
            type: GDPRTypeEnum.GENERAL,
            category: GDPRCategoryEnum.ESBS,
            subType: GDPRSubTypeEnum.unsubscribe,
          },
          {
            type: GDPRTypeEnum.FORMAL_COMMUNICATION,
            category: GDPRCategoryEnum.TAXES,
            subType: GDPRSubTypeEnum.unsubscribe,
          },
        ],
        cognitoId
      )

      const data = {
        customer_ids: {
          city_account_id: cognitoId,
        },
        properties: {
          first_name: '',
          last_name: '',
          name: '',
          person_type: '',
          registration_date: '',
          email: '',
          phone: '',
          is_identity_verified: false,
          oauth_origin_client_name: '',
        },
      }
      const response = await axios.post(
        `${process.env.BLOOMREACH_API_URL}/track/v2/projects/${process.env.BLOOMREACH_PROJECT_TOKEN}/customers`,
        JSON.stringify(data),
        {
          headers: {
            Authorization: `Basic ${this.bloomreachCredentials}`,
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
}
