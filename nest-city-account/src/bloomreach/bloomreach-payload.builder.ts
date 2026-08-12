import { Injectable } from '@nestjs/common'

import { CognitoUserAttributesTierEnum } from '../generated/prisma/enums'
import {
  CognitoUserAccountTypesEnum,
  CognitoUserAttributesEnum,
} from '../utils/global-dtos/cognito.dto'
import { CognitoSubservice } from '../utils/subservices/cognito.subservice'
import { UserIdentitySubservice } from '../utils/subservices/user-identity.subservice'
import {
  BloomreachCommandDataKind,
  BloomreachCommandNameEnum,
  BloomreachConsentActionEnum,
  BloomreachCustomerCommand,
  BloomreachEventCommand,
  BloomreachEventNameEnum,
  Consent,
} from './bloomreach.types'
import { BloomreachContactDatabaseService } from './contact-database/bloomreach-contact-database.service'
import { consentCategory } from './utils/consents.utils'

/** Unix timestamp in seconds, the format Bloomreach expects. */
export function nowUnixSeconds(): number {
  return Date.now() / 1000
}

@Injectable()
export class BloomreachPayloadBuilder {
  constructor(
    private readonly cognitoSubservice: CognitoSubservice,
    private readonly bloomreachContactDatabaseService: BloomreachContactDatabaseService,
    private readonly userIdentitySubservice: UserIdentitySubservice
  ) {}

  async buildCustomerCommand(
    externalId: string,
    phoneNumber?: string
  ): Promise<BloomreachCustomerCommand> {
    const user = await this.cognitoSubservice.getDataFromCognito(externalId)
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

    const contactId = await this.resolveContactId(
      externalId,
      email,
      accountType,
      isIdentityVerified
    )

    if (contactId && phoneNumber) {
      await this.bloomreachContactDatabaseService.addPhone(contactId, phoneNumber)
    }

    const correspondenceChannel =
      accountType === CognitoUserAccountTypesEnum.PHYSICAL_ENTITY
        ? await this.userIdentitySubservice.getActiveDeliveryMethod({
            externalId,
          })
        : null

    return {
      commandName: BloomreachCommandNameEnum.CUSTOMERS,
      commandData: {
        kind: BloomreachCommandDataKind.CUSTOMER,
        customer_ids: {
          city_account_id: externalId,
          ...(contactId && { contact_id: contactId }),
        },
        properties: {
          ...(firstName && { first_name: firstName }),
          ...(lastName && { last_name: lastName }),
          ...(name && { name }),
          person_type: accountType,
          ...(registrationDate && { registration_date: registrationDate.toISOString() }),
          ...(email && { email }),
          ...(phoneNumber && { phone: phoneNumber }),
          ...(isIdentityVerified && { is_identity_verified: isIdentityVerified }),
          ...(oAuthOriginClientName && { oauth_origin_client_name: oAuthOriginClientName }),
          ...(correspondenceChannel && {
            current_tax_correspondence_channel: correspondenceChannel,
          }),
        },
        update_timestamp: nowUnixSeconds(),
      },
    }
  }

  private async resolveContactId(
    externalId: string,
    email: string,
    accountType: CognitoUserAccountTypesEnum,
    isIdentityVerified: boolean
  ): Promise<string | undefined> {
    if (!isIdentityVerified) {
      return undefined
    }

    const { birthNumber, ico } = await this.userIdentitySubservice.getVerifiedIdentifiers(
      externalId,
      accountType
    )
    if (!birthNumber) {
      return undefined
    }

    return this.bloomreachContactDatabaseService.upsert(email, birthNumber, ico)
  }

  buildAnonymizeCommand(externalId: string, timestamp: number): BloomreachCustomerCommand {
    return {
      commandName: BloomreachCommandNameEnum.CUSTOMERS,
      commandData: {
        kind: BloomreachCommandDataKind.CUSTOMER,
        customer_ids: {
          city_account_id: externalId,
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
          current_tax_correspondence_channel: '',
        },
        update_timestamp: timestamp,
      },
    }
  }

  buildConsentEventCommands(consents: Consent[], externalId: string): BloomreachEventCommand[] {
    return consents.map((consent) => ({
      commandName: BloomreachCommandNameEnum.CUSTOMERS_EVENTS,
      commandData: {
        kind: BloomreachCommandDataKind.EVENT,
        customer_ids: {
          city_account_id: externalId,
        },
        properties: {
          action: consent.isGranted
            ? BloomreachConsentActionEnum.ACCEPT
            : BloomreachConsentActionEnum.REJECT,
          category: consentCategory(consent.consentType),
          valid_until: 'unlimited',
        },
        event_type: BloomreachEventNameEnum.CONSENT,
        // A restored consent (from extractLatestCityAccountConsents) carries
        // the time it was actually true - stamping it "now" would let it
        // incorrectly outrank a genuinely newer local change.
        timestamp: consent.timestamp ?? nowUnixSeconds(),
      },
    }))
  }
}
