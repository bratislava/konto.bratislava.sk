import { HttpStatus, Inject, Injectable } from '@nestjs/common'

import axios, { isAxiosError } from 'axios'
import { ACTIVE_USER_FILTER, PrismaService } from '../prisma/prisma.service'

import { GdprDataSubscriptionDto } from '../user/dtos/gdpr.user.dto'
import {
  AnonymizeResponse,
  BloomreachConsentActionEnum,
  BloomreachConsentCategoryEnum,
  BloomreachEventNameEnum,
  BloomreachContactDto,
  ConsentBloomreachDataDto,
} from './bloomreach.dto'
import { LineLoggerSubservice } from '../utils/subservices/line-logger.subservice'
import {
  CognitoGetUserData,
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
import { ErrorsEnum } from '../utils/guards/dtos/error.dto'
import { IDatabase } from 'pg-promise'

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
    @Inject('BLOOMREACH_CONTACT_DB') private readonly contactDb: IDatabase<unknown>
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

  private async getVerifiedIdentifiers(user: CognitoGetUserData): Promise<{
    birthNumber?: string
    ico?: string
  }> {
    const accountType = user[CognitoUserAttributesEnum.ACCOUNT_TYPE]

    if (accountType === CognitoUserAccountTypesEnum.PHYSICAL_ENTITY) {
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

    if (
      accountType === CognitoUserAccountTypesEnum.LEGAL_ENTITY ||
      accountType === CognitoUserAccountTypesEnum.SELF_EMPLOYED_ENTITY
    ) {
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

    return {}
  }

  async obtainBloomreachContactUuid(
    email: string,
    birthNumber: string,
    ico?: string
  ): Promise<string | undefined> {
    for (let tries = 1; tries <= 2; tries++) {
      try {
        return await this.upsertBloomreachContactUuid(email, birthNumber, ico)
      } catch (error) {
        this.logger.error(
          this.throwerErrorGuard.InternalServerErrorException(
            ErrorsEnum.INTERNAL_SERVER_ERROR,
            `Failed to obtain bloomreach contact uuid on try: ${tries}`,
            undefined,
            error
          )
        )
      }
    }
    return undefined
  }

  async upsertBloomreachContactUuid(
    email: string,
    birthNumber: string,
    ico?: string
  ): Promise<string> {
    let contact = await this.getBloomreachContact(birthNumber, ico)

    if (!contact?.uuid && ico) {
      contact = await this.findBloomreachIcoAndEmailContactMatch(email, ico)
    }
    if (!contact?.uuid) {
      return await this.insertBloomreachContact(email, birthNumber, ico)
    }

    await this.updateBloomreachContact(contact.uuid, email, birthNumber, ico)
    return contact.uuid
  }

  async findBloomreachIcoAndEmailContactMatch(
    email: string,
    ico: string
  ): Promise<BloomreachContactDto | null> {
    if (!email) {
      return null
    }

    const icoContact = await this.getBloomreachContact(undefined, ico)
    if (!icoContact?.uuid || !icoContact.email) {
      return null
    }

    if (icoContact.email.toLowerCase() !== email.toLowerCase()) {
      return null
    }

    return icoContact
  }

  async getBloomreachContact(
    birthNumber?: string,
    ico?: string
  ): Promise<BloomreachContactDto | null> {
    const query = `
      SELECT * FROM public.contacts 
      WHERE birth_number IS NOT DISTINCT FROM $1 AND ico IS NOT DISTINCT FROM $2
    `
    const data = await this.contactDb.oneOrNone<BloomreachContactDto>(query, [
      birthNumber ?? null,
      ico ?? null,
    ])

    return data
  }

  async updateBloomreachContact(
    uuid: string,
    email: string,
    birthNumber: string,
    ico?: string
  ): Promise<void> {
    const query = `
      UPDATE public.contacts
      SET email = $1, birth_number = $2, ico = $3
      WHERE uuid = $4
    `
    await this.contactDb.none(query, [email, birthNumber, ico ?? null, uuid])
  }

  async addBloomreachContactPhone(uuid: string, phoneNumber: string): Promise<void> {
    const query = `
      UPDATE public.contacts
      SET phone = $1
      WHERE uuid = $2
    `
    await this.contactDb.none(query, [phoneNumber, uuid])
  }

  async insertBloomreachContact(email: string, birthNumber: string, ico?: string): Promise<string> {
    const query = `
      INSERT INTO public.contacts (email, birth_number, ico)
      VALUES ($1, $2, $3)
      RETURNING uuid
    `
    const data = await this.contactDb.one<BloomreachContactDto>(query, [
      email,
      birthNumber,
      ico ?? null,
    ])
    return data.uuid
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
          contactId = await this.obtainBloomreachContactUuid(email, birthNumber, ico)
        }
      }

      if (contactId && phoneNumber) {
        await this.addBloomreachContactPhone(contactId, phoneNumber)
      }

      const data = {
        customer_ids: {
          city_account_id: cognitoId,
          ...(contactId && { contact_id: contactId }),
        },
        properties: {
          ...(firstName && { first_name: firstName }),
          ...(lastName && { last_name: lastName }),
          ...(name && { name: name }),
          ...(accountType && { person_type: accountType }),
          ...(registrationDate && { registration_date: registrationDate }),
          ...(email && { email: email }),
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
      gdprData.map((elem) =>
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
}
