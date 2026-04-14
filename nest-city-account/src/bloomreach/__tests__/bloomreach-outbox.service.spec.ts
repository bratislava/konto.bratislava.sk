/* eslint-disable @typescript-eslint/no-explicit-any */
import { Test, TestingModule } from '@nestjs/testing'
import { createMock } from '@golevelup/ts-jest'
import { GDPRCategoryEnum, GDPRSubTypeEnum, GDPRTypeEnum } from '@prisma/client'
import { PrismaService } from '../../prisma/prisma.service'
import ThrowerErrorGuard from '../../utils/guards/errors.guard'
import prismaMock from '../../../test/singleton'
import { BloomreachOutboxService } from '../bloomreach-outbox.service'
import { BloomreachPayloadBuilder } from '../bloomreach-payload.builder'
import {
  BloomreachCommandNameEnum,
  BloomreachConsentActionEnum,
  BloomreachConsentCategoryEnum,
  BloomreachEventNameEnum,
} from '../bloomreach.types'

describe('BloomreachOutboxService', () => {
  let service: BloomreachOutboxService
  let payloadBuilder: jest.Mocked<BloomreachPayloadBuilder>

  const cognitoId = 'test-cognito-id'

  const mockCustomerCommand = {
    commandName: BloomreachCommandNameEnum.CUSTOMERS as const,
    commandData: {
      customer_ids: { city_account_id: cognitoId },
      properties: { email: 'test@example.com' },
    },
  }

  const mockAnonymizeCommand = {
    commandName: BloomreachCommandNameEnum.CUSTOMERS as const,
    commandData: {
      customer_ids: { city_account_id: cognitoId },
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

  beforeEach(async () => {
    process.env.BLOOMREACH_INTEGRATION_STATE = 'ACTIVE'

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BloomreachOutboxService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: BloomreachPayloadBuilder, useValue: createMock<BloomreachPayloadBuilder>() },
        { provide: ThrowerErrorGuard, useValue: createMock<ThrowerErrorGuard>() },
      ],
    }).compile()

    service = module.get<BloomreachOutboxService>(BloomreachOutboxService)
    payloadBuilder = module.get(BloomreachPayloadBuilder)
  })

  afterEach(() => {
    jest.clearAllMocks()
    delete process.env.BLOOMREACH_INTEGRATION_STATE
  })

  describe('trackCustomer', () => {
    it('should skip when integration is not active', async () => {
      process.env.BLOOMREACH_INTEGRATION_STATE = 'INACTIVE'

      await service.trackCustomer(cognitoId)

      expect(payloadBuilder.buildCustomerCommand).not.toHaveBeenCalled()
    })

    it('should create a new outbox entry when none exists', async () => {
      payloadBuilder.buildCustomerCommand.mockResolvedValue(mockCustomerCommand)
      const txMock = createMock<PrismaService>()
      txMock.bloomreachOutbox.findFirst.mockResolvedValue(null)
      prismaMock.$transaction.mockImplementation((fn: any) => fn(txMock))

      await service.trackCustomer(cognitoId, '0900123456')

      expect(payloadBuilder.buildCustomerCommand).toHaveBeenCalledWith(cognitoId, '0900123456')
      expect(txMock.bloomreachOutbox.create).toHaveBeenCalledWith({
        data: {
          cognitoId,
          commandName: BloomreachCommandNameEnum.CUSTOMERS,
          commandData: mockCustomerCommand.commandData,
        },
      })
    })

    it('should update existing PENDING entry instead of creating a new one', async () => {
      payloadBuilder.buildCustomerCommand.mockResolvedValue(mockCustomerCommand)
      const existingEntry = {
        id: 'existing-id',
        commandData: {
          customer_ids: { city_account_id: cognitoId },
          properties: { phone: '0900000000', email: 'old@never.test' },
        },
      }
      const txMock = createMock<PrismaService>()
      txMock.bloomreachOutbox.findFirst.mockResolvedValue(existingEntry as any)
      prismaMock.$transaction.mockImplementation((fn: any) => fn(txMock))

      await service.trackCustomer(cognitoId)

      expect(txMock.bloomreachOutbox.update).toHaveBeenCalledWith({
        where: { id: 'existing-id' },
        data: {
          commandData: {
            customer_ids: { city_account_id: cognitoId },
            properties: { phone: '0900000000', email: 'test@example.com' },
          },
        },
      })
      expect(txMock.bloomreachOutbox.create).not.toHaveBeenCalled()
    })

    it('should not throw when payload builder fails', async () => {
      payloadBuilder.buildCustomerCommand.mockRejectedValue(new Error('Cognito down'))

      await expect(service.trackCustomer(cognitoId)).resolves.toBeUndefined()
    })
  })

  describe('trackEventConsents', () => {
    const gdprData = [
      {
        type: GDPRTypeEnum.MARKETING,
        category: GDPRCategoryEnum.ESBS,
        subType: GDPRSubTypeEnum.subscribe,
      },
    ]

    it('should skip when integration is not active', async () => {
      process.env.BLOOMREACH_INTEGRATION_STATE = 'INACTIVE'

      await service.trackEventConsents(gdprData, cognitoId)

      expect(payloadBuilder.buildConsentEventCommands).not.toHaveBeenCalled()
    })

    it('should skip when cognitoId is null', async () => {
      await service.trackEventConsents(gdprData, null)

      expect(payloadBuilder.buildConsentEventCommands).not.toHaveBeenCalled()
    })

    it('should not throw when createMany fails', async () => {
      payloadBuilder.buildConsentEventCommands.mockReturnValue([])
      prismaMock.bloomreachOutbox.createMany.mockRejectedValue(new Error('DB error'))

      await expect(service.trackEventConsents(gdprData, cognitoId)).resolves.toBeUndefined()
    })

    it('should override a pending action value for the same event_type and category', async () => {
      const subscribeCommandData = {
        customer_ids: { city_account_id: cognitoId },
        event_type: BloomreachEventNameEnum.CONSENT,
        properties: {
          action: BloomreachConsentActionEnum.ACCEPT,
          category: BloomreachConsentCategoryEnum.ESBS_MARKETING,
          valid_until: 'unlimited',
        },
      }

      const unsubscribeCommandData = {
        customer_ids: { city_account_id: cognitoId },
        event_type: BloomreachEventNameEnum.CONSENT,
        properties: {
          action: BloomreachConsentActionEnum.REJECT,
          category: BloomreachConsentCategoryEnum.ESBS_MARKETING,
          valid_until: 'unlimited',
        },
      }

      const existingEntry = { id: 'pending-subscribe-id', commandData: subscribeCommandData }
      const txMock = createMock<PrismaService>()
      txMock.bloomreachOutbox.findFirst.mockResolvedValue(existingEntry as any)
      prismaMock.$transaction.mockImplementation((fn: any) => fn(txMock))

      payloadBuilder.buildConsentEventCommands.mockReturnValue([
        {
          commandName: BloomreachCommandNameEnum.CUSTOMERS_EVENTS,
          commandData: unsubscribeCommandData,
        },
      ])

      await service.trackEventConsents(
        [
          {
            type: GDPRTypeEnum.MARKETING,
            category: GDPRCategoryEnum.ESBS,
            subType: GDPRSubTypeEnum.unsubscribe,
          },
        ],
        cognitoId
      )

      expect(txMock.bloomreachOutbox.update).toHaveBeenCalledWith({
        where: { id: 'pending-subscribe-id' },
        data: { commandData: unsubscribeCommandData },
      })
      expect(txMock.bloomreachOutbox.create).not.toHaveBeenCalled()
    })
  })

  describe('anonymizeCustomer', () => {
    it('should skip when integration is not active', async () => {
      process.env.BLOOMREACH_INTEGRATION_STATE = 'INACTIVE'

      await service.anonymizeCustomer(cognitoId)

      expect(payloadBuilder.buildAnonymizeCommand).not.toHaveBeenCalled()
    })

    it('should queue unsubscribe consent events and anonymize command', async () => {
      payloadBuilder.buildConsentEventCommands.mockReturnValue([])
      payloadBuilder.buildAnonymizeCommand.mockReturnValue(mockAnonymizeCommand)
      const txMock = createMock<PrismaService>()
      txMock.bloomreachOutbox.findFirst.mockResolvedValue(null)
      prismaMock.$transaction.mockImplementation((fn: any) => fn(txMock))

      await service.anonymizeCustomer(cognitoId)

      expect(payloadBuilder.buildConsentEventCommands).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            type: GDPRTypeEnum.MARKETING,
            subType: GDPRSubTypeEnum.unsubscribe,
          }),
          expect.objectContaining({
            type: GDPRTypeEnum.GENERAL,
            subType: GDPRSubTypeEnum.unsubscribe,
          }),
        ]),
        cognitoId
      )
      expect(payloadBuilder.buildAnonymizeCommand).toHaveBeenCalledWith(cognitoId)
      expect(txMock.bloomreachOutbox.create).toHaveBeenCalledWith({
        data: {
          cognitoId,
          commandName: BloomreachCommandNameEnum.CUSTOMERS,
          commandData: mockAnonymizeCommand.commandData,
        },
      })
    })
  })
})

/* eslint-enable @typescript-eslint/no-explicit-any */
