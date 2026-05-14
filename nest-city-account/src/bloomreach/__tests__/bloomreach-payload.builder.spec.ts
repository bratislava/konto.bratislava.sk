import { createMock } from '@golevelup/ts-jest'
import { Test, TestingModule } from '@nestjs/testing'
import {
  CognitoUserAttributesTierEnum,
  GDPRCategoryEnum,
  GDPRSubTypeEnum,
  GDPRTypeEnum,
} from '@prisma/client'

import { UserOfficialCorrespondenceChannelEnum } from '../../user/dtos/gdpr.user.dto'
import {
  CognitoUserAccountTypesEnum,
  CognitoUserAttributesEnum,
} from '../../utils/global-dtos/cognito.dto'
import { CognitoSubservice } from '../../utils/subservices/cognito.subservice'
import { UserIdentitySubservice } from '../../utils/subservices/user-identity.subservice'
import {
  BloomreachCommandNameEnum,
  BloomreachConsentActionEnum,
  BloomreachConsentCategoryEnum,
  BloomreachEventNameEnum,
} from '../bloomreach.types'
import { BloomreachContactDatabaseService } from '../bloomreach-contact-database.service'
import { BloomreachPayloadBuilder } from '../bloomreach-payload.builder'

describe('BloomreachPayloadBuilder', () => {
  let builder: BloomreachPayloadBuilder
  let cognitoSubservice: jest.Mocked<CognitoSubservice>
  let contactDbService: jest.Mocked<BloomreachContactDatabaseService>
  let userIdentitySubservice: jest.Mocked<UserIdentitySubservice>

  const externalId = 'test-cognito-id'

  const baseCognitoUser = {
    idUser: externalId,
    given_name: 'John',
    family_name: 'Doe',
    name: 'John Doe',
    email: 'john@example.com',
    UserCreateDate: new Date('2025-01-15T10:00:00Z'),
    UserLastModifiedDate: new Date('2025-06-01T12:00:00Z'),
    Enabled: true,
    [CognitoUserAttributesEnum.ACCOUNT_TYPE]: CognitoUserAccountTypesEnum.PHYSICAL_ENTITY,
    [CognitoUserAttributesEnum.TIER]: CognitoUserAttributesTierEnum.NEW,
    [CognitoUserAttributesEnum.OAUTH_ORIGIN_CLIENT_NAME]: undefined,
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BloomreachPayloadBuilder,
        { provide: CognitoSubservice, useValue: createMock<CognitoSubservice>() },
        {
          provide: BloomreachContactDatabaseService,
          useValue: createMock<BloomreachContactDatabaseService>(),
        },
        { provide: UserIdentitySubservice, useValue: createMock<UserIdentitySubservice>() },
      ],
    }).compile()

    builder = module.get<BloomreachPayloadBuilder>(BloomreachPayloadBuilder)
    cognitoSubservice = module.get(CognitoSubservice)
    contactDbService = module.get(BloomreachContactDatabaseService)
    userIdentitySubservice = module.get(UserIdentitySubservice)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('buildCustomerCommand', () => {
    it('should build a basic customer command with user data', async () => {
      cognitoSubservice.getDataFromCognito.mockResolvedValue(baseCognitoUser as any)
      userIdentitySubservice.getOfficialCorrespondenceChannel.mockResolvedValue(null)

      const result = await builder.buildCustomerCommand(externalId)

      expect(result.commandName).toBe(BloomreachCommandNameEnum.CUSTOMERS)
      expect(result.commandData.customer_ids.city_account_id).toBe(externalId)
      expect(result.commandData.properties.first_name).toBe('John')
      expect(result.commandData.properties.last_name).toBe('Doe')
      expect(result.commandData.properties.email).toBe('john@example.com')
      expect(result.commandData.properties.registration_date).toBe('2025-01-15T10:00:00.000Z')
    })

    it('should include phone number when provided', async () => {
      cognitoSubservice.getDataFromCognito.mockResolvedValue(baseCognitoUser as any)
      userIdentitySubservice.getOfficialCorrespondenceChannel.mockResolvedValue(null)

      const result = await builder.buildCustomerCommand(externalId, '0900123456')

      expect(result.commandData.properties.phone).toBe('0900123456')
    })

    it('should include contact_id for identity-verified users with birth number', async () => {
      const verifiedUser = {
        ...baseCognitoUser,
        [CognitoUserAttributesEnum.TIER]: CognitoUserAttributesTierEnum.IDENTITY_CARD,
      }
      cognitoSubservice.getDataFromCognito.mockResolvedValue(verifiedUser as any)
      userIdentitySubservice.getVerifiedIdentifiers.mockResolvedValue({
        birthNumber: '9001011234',
        ico: undefined,
      })
      contactDbService.upsert.mockResolvedValue('contact-123')
      userIdentitySubservice.getOfficialCorrespondenceChannel.mockResolvedValue(
        UserOfficialCorrespondenceChannelEnum.EDESK
      )

      const result = await builder.buildCustomerCommand(externalId)

      expect(result.commandData.customer_ids.contact_id).toBe('contact-123')
      expect(result.commandData.properties.is_identity_verified).toBe(true)
      expect(contactDbService.upsert).toHaveBeenCalledWith(
        'john@example.com',
        '9001011234',
        undefined
      )
    })

    it('should add phone to contact database when contact_id and phone are provided', async () => {
      const verifiedUser = {
        ...baseCognitoUser,
        [CognitoUserAttributesEnum.TIER]: CognitoUserAttributesTierEnum.EID,
      }
      cognitoSubservice.getDataFromCognito.mockResolvedValue(verifiedUser as any)
      userIdentitySubservice.getVerifiedIdentifiers.mockResolvedValue({
        birthNumber: '9001011234',
      })
      contactDbService.upsert.mockResolvedValue('contact-456')
      userIdentitySubservice.getOfficialCorrespondenceChannel.mockResolvedValue(null)

      await builder.buildCustomerCommand(externalId, '0900123456')

      expect(contactDbService.addPhone).toHaveBeenCalledWith('contact-456', '0900123456')
    })

    it('should not look up contact for non-verified users', async () => {
      cognitoSubservice.getDataFromCognito.mockResolvedValue(baseCognitoUser as any)
      userIdentitySubservice.getOfficialCorrespondenceChannel.mockResolvedValue(null)

      const result = await builder.buildCustomerCommand(externalId)

      expect(userIdentitySubservice.getVerifiedIdentifiers).not.toHaveBeenCalled()
      expect(result.commandData.customer_ids.contact_id).toBeUndefined()
    })

    it('should include correspondence channel for physical entities', async () => {
      cognitoSubservice.getDataFromCognito.mockResolvedValue(baseCognitoUser as any)
      userIdentitySubservice.getOfficialCorrespondenceChannel.mockResolvedValue(
        UserOfficialCorrespondenceChannelEnum.EDESK
      )

      const result = await builder.buildCustomerCommand(externalId)

      expect(result.commandData.properties.current_tax_correspondence_channel).toBe(
        UserOfficialCorrespondenceChannelEnum.EDESK
      )
    })

    it('should not fetch correspondence channel for non-physical entities', async () => {
      const legalUser = {
        ...baseCognitoUser,
        [CognitoUserAttributesEnum.ACCOUNT_TYPE]: CognitoUserAccountTypesEnum.LEGAL_ENTITY,
      }
      cognitoSubservice.getDataFromCognito.mockResolvedValue(legalUser as any)

      const result = await builder.buildCustomerCommand(externalId)

      expect(userIdentitySubservice.getOfficialCorrespondenceChannel).not.toHaveBeenCalled()
      expect(result.commandData.properties.current_tax_correspondence_channel).toBeUndefined()
    })
  })

  describe('buildAnonymizeCommand', () => {
    it('should return a customers command with empty properties', () => {
      const result = builder.buildAnonymizeCommand(externalId)

      expect(result.commandName).toBe(BloomreachCommandNameEnum.CUSTOMERS)
      expect(result.commandData.customer_ids.city_account_id).toBe(externalId)
      expect(result.commandData.properties.first_name).toBe('')
      expect(result.commandData.properties.email).toBe('')
      expect(result.commandData.properties.is_identity_verified).toBe(false)
    })
  })

  describe('buildConsentEventCommands', () => {
    it('should build accept consent event for marketing subscribe', () => {
      const gdprData = [
        {
          type: GDPRTypeEnum.MARKETING,
          category: GDPRCategoryEnum.ESBS,
          subType: GDPRSubTypeEnum.subscribe,
        },
      ]

      const result = builder.buildConsentEventCommands(gdprData, externalId)

      expect(result).toHaveLength(1)
      expect(result[0].commandName).toBe(BloomreachCommandNameEnum.CUSTOMERS_EVENTS)
      expect(result[0].commandData.customer_ids.city_account_id).toBe(externalId)
      expect(result[0].commandData.event_type).toBe(BloomreachEventNameEnum.CONSENT)
      expect(result[0].commandData.properties.action).toBe(BloomreachConsentActionEnum.ACCEPT)
      expect(result[0].commandData.properties.category).toBe(
        BloomreachConsentCategoryEnum.ESBS_MARKETING
      )
      expect(result[0].commandData.properties.valid_until).toBe('unlimited')
    })

    it('should build reject consent event for unsubscribe', () => {
      const gdprData = [
        {
          type: GDPRTypeEnum.MARKETING,
          category: GDPRCategoryEnum.ESBS,
          subType: GDPRSubTypeEnum.unsubscribe,
        },
      ]

      const result = builder.buildConsentEventCommands(gdprData, externalId)

      expect(result[0].commandData.properties.action).toBe(BloomreachConsentActionEnum.REJECT)
    })

    it('should map TAXES/FORMAL_COMMUNICATION to TAX_COMMUNICATION category', () => {
      const gdprData = [
        {
          type: GDPRTypeEnum.FORMAL_COMMUNICATION,
          category: GDPRCategoryEnum.TAXES,
          subType: GDPRSubTypeEnum.subscribe,
        },
      ]

      const result = builder.buildConsentEventCommands(gdprData, externalId)

      expect(result[0].commandData.properties.category).toBe(
        BloomreachConsentCategoryEnum.TAX_COMMUNICATION
      )
    })

    it('should use concatenated category-type for unmapped combinations', () => {
      const gdprData = [
        {
          type: GDPRTypeEnum.GENERAL,
          category: GDPRCategoryEnum.ESBS,
          subType: GDPRSubTypeEnum.subscribe,
        },
      ]

      const result = builder.buildConsentEventCommands(gdprData, externalId)

      expect(result[0].commandData.properties.category).toBe('ESBS-GENERAL')
    })

    it('should build multiple commands for multiple GDPR entries', () => {
      const gdprData = [
        {
          type: GDPRTypeEnum.MARKETING,
          category: GDPRCategoryEnum.ESBS,
          subType: GDPRSubTypeEnum.subscribe,
        },
        {
          type: GDPRTypeEnum.GENERAL,
          category: GDPRCategoryEnum.ESBS,
          subType: GDPRSubTypeEnum.unsubscribe,
        },
      ]

      const result = builder.buildConsentEventCommands(gdprData, externalId)

      expect(result).toHaveLength(2)
      expect(result[0].commandData.properties.action).toBe(BloomreachConsentActionEnum.ACCEPT)
      expect(result[1].commandData.properties.action).toBe(BloomreachConsentActionEnum.REJECT)
    })
  })
})
