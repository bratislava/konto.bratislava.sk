import { Injectable } from '@nestjs/common'

import { CognitoUserAttributesTierEnum, ConsentEnum } from '../generated/prisma/client'
import {
  CognitoUserAccountTypesEnum,
  CognitoUserAttributesEnum,
} from '../utils/global-dtos/cognito.dto'
import { CognitoSubservice } from '../utils/subservices/cognito.subservice'
import { UserIdentitySubservice } from '../utils/subservices/user-identity.subservice'
import {
  BloomreachCommandNameEnum,
  BloomreachConsentActionEnum,
  BloomreachCustomerCommand,
  BloomreachEventCommand,
  BloomreachEventNameEnum,
  Consent,
} from './bloomreach.types'
import { BloomreachContactDatabaseService } from './bloomreach-contact-database.service'

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

    let contactId: string | undefined

    if (isIdentityVerified) {
      const { birthNumber, ico } = await this.userIdentitySubservice.getVerifiedIdentifiers(
        user.idUser,
        accountType
      )
      if (birthNumber) {
        contactId = await this.bloomreachContactDatabaseService.upsert(email, birthNumber, ico)
      }
    }

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
        customer_ids: {
          city_account_id: externalId,
          ...(contactId && { contact_id: contactId }),
        },
        properties: {
          ...(firstName && { first_name: firstName }),
          ...(lastName && { last_name: lastName }),
          ...(name && { name }),
          ...(accountType && { person_type: accountType }),
          ...(registrationDate && { registration_date: registrationDate.toISOString() }),
          ...(email && { email }),
          ...(phoneNumber && { phone: phoneNumber }),
          ...(isIdentityVerified && { is_identity_verified: isIdentityVerified }),
          ...(oAuthOriginClientName && { oauth_origin_client_name: oAuthOriginClientName }),
          ...(correspondenceChannel && {
            current_tax_correspondence_channel: correspondenceChannel,
          }),
        },
      },
    }
  }

  buildAnonymizeCommand(externalId: string): BloomreachCustomerCommand {
    return {
      commandName: BloomreachCommandNameEnum.CUSTOMERS,
      commandData: {
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
      },
    }
  }

  private static consentCategory(consentType: ConsentEnum): string {
    return `ESBS-${consentType}`
  }

  buildConsentEventCommands(consents: Consent[], externalId: string): BloomreachEventCommand[] {
    return consents.map((consent) => ({
      commandName: BloomreachCommandNameEnum.CUSTOMERS_EVENTS,
      commandData: {
        customer_ids: {
          city_account_id: externalId,
        },
        properties: {
          action: consent.isGranted
            ? BloomreachConsentActionEnum.ACCEPT
            : BloomreachConsentActionEnum.REJECT,
          category: BloomreachPayloadBuilder.consentCategory(consent.consentType),
          valid_until: 'unlimited',
        },
        event_type: BloomreachEventNameEnum.CONSENT,
      },
    }))
  }
}
