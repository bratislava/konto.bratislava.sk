import { createMock } from '@golevelup/ts-jest'
import { Test, TestingModule } from '@nestjs/testing'

import prismaMock from '../../../test/singleton'
import { bloomreachOutboxFactory } from '../../__tests__/factories/bloomreachOutbox.factory'
import BaConfigService from '../../config/ba-config.service'
import { BloomreachCommandName, ConsentEnum } from '../../generated/prisma/enums'
import { PrismaService } from '../../prisma/prisma.service'
import ThrowerErrorGuard from '../../utils/guards/errors.guard'
import {
  BloomreachCommandDataKind,
  BloomreachCommandNameEnum,
  BloomreachConsentActionEnum,
  BloomreachEventNameEnum,
} from '../bloomreach.types'
import { BloomreachOutboxService } from '../bloomreach-outbox.service'
import { BloomreachOutboxWriterService } from '../bloomreach-outbox-writer.service'
import { BloomreachPayloadBuilder } from '../bloomreach-payload.builder'

describe('BloomreachOutboxService', () => {
  let service: BloomreachOutboxService
  let payloadBuilder: jest.Mocked<BloomreachPayloadBuilder>

  const externalId = 'test-cognito-id'

  const mockCustomerCommand = {
    commandName: BloomreachCommandNameEnum.CUSTOMERS as const,
    commandData: {
      kind: BloomreachCommandDataKind.CUSTOMER as const,
      customer_ids: { city_account_id: externalId },
      properties: { email: 'test@example.com' },
      update_timestamp: 200,
    },
  }

  const mockAnonymizeCommand = {
    commandName: BloomreachCommandNameEnum.CUSTOMERS as const,
    commandData: {
      kind: BloomreachCommandDataKind.CUSTOMER as const,
      customer_ids: { city_account_id: externalId },
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
      update_timestamp: 200,
    },
  }

  const bloomreachConfig = { integrationState: 'ACTIVE' }

  beforeEach(async () => {
    bloomreachConfig.integrationState = 'ACTIVE'

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BloomreachOutboxService,
        BloomreachOutboxWriterService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: BloomreachPayloadBuilder, useValue: createMock<BloomreachPayloadBuilder>() },
        { provide: ThrowerErrorGuard, useValue: createMock<ThrowerErrorGuard>() },
        {
          provide: BaConfigService,
          useValue: {
            get bloomreach() {
              return bloomreachConfig
            },
          },
        },
      ],
    }).compile()

    service = module.get<BloomreachOutboxService>(BloomreachOutboxService)
    payloadBuilder = module.get(BloomreachPayloadBuilder)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('trackCustomer', () => {
    it('should skip when integration is not active', async () => {
      bloomreachConfig.integrationState = 'INACTIVE'

      await service.trackCustomer(externalId)

      expect(payloadBuilder.buildCustomerCommand).not.toHaveBeenCalled()
    })

    it('should create a new outbox entry when none exists', async () => {
      payloadBuilder.buildCustomerCommand.mockResolvedValue(mockCustomerCommand)
      const txMock = createMock<PrismaService>()
      txMock.bloomreachOutbox.findFirst.mockResolvedValue(null)
      prismaMock.$transaction.mockImplementation(async (fn) => fn(txMock))

      await service.trackCustomer(externalId, '0900123456')

      expect(payloadBuilder.buildCustomerCommand).toHaveBeenCalledWith(externalId, '0900123456')
      expect(txMock.bloomreachOutbox.create).toHaveBeenCalledWith({
        data: {
          externalId,
          commandName: BloomreachCommandName.CUSTOMERS,
          commandData: mockCustomerCommand.commandData,
          isTerminal: false,
        },
      })
    })

    it('should update existing PENDING entry instead of creating a new one', async () => {
      payloadBuilder.buildCustomerCommand.mockResolvedValue(mockCustomerCommand)
      const existingEntry = bloomreachOutboxFactory({
        id: 'existing-id',
        commandData: {
          kind: BloomreachCommandDataKind.CUSTOMER,
          customer_ids: { city_account_id: externalId, contact_id: 'contact-id' },
          properties: { phone: '0900000000', email: 'old@never.test' },
          // Must be older than mockCustomerCommand's 200
          update_timestamp: 100,
        },
      })
      const txMock = createMock<PrismaService>()
      txMock.bloomreachOutbox.findFirst.mockResolvedValue(existingEntry)
      prismaMock.$transaction.mockImplementation(async (fn) => fn(txMock))

      await service.trackCustomer(externalId)

      expect(txMock.bloomreachOutbox.update).toHaveBeenCalledWith({
        where: { id: 'existing-id' },
        data: {
          commandData: {
            kind: BloomreachCommandDataKind.CUSTOMER,
            customer_ids: { city_account_id: externalId, contact_id: 'contact-id' },
            properties: { phone: '0900000000', email: 'test@example.com' },
            update_timestamp: 200,
          },
          isTerminal: false,
        },
      })
      expect(txMock.bloomreachOutbox.create).not.toHaveBeenCalled()
    })

    it('should not throw when payload builder fails', async () => {
      payloadBuilder.buildCustomerCommand.mockRejectedValue(new Error('Cognito down'))

      await expect(service.trackCustomer(externalId)).resolves.toBeUndefined()
    })
  })

  describe('trackConsents', () => {
    const consents = [{ consentType: ConsentEnum.MARKETING, isGranted: true }]

    it('should skip when integration is not active', async () => {
      bloomreachConfig.integrationState = 'INACTIVE'

      await service.trackConsents(consents, externalId)

      expect(payloadBuilder.buildConsentEventCommands).not.toHaveBeenCalled()
    })

    it('should skip when externalId is null', async () => {
      await service.trackConsents(consents, null)

      expect(payloadBuilder.buildConsentEventCommands).not.toHaveBeenCalled()
    })

    it('should not throw when createMany fails', async () => {
      payloadBuilder.buildConsentEventCommands.mockReturnValue([])
      prismaMock.bloomreachOutbox.createMany.mockRejectedValue(new Error('DB error'))

      await expect(service.trackConsents(consents, externalId)).resolves.toBeUndefined()
    })

    it('should override a pending action value for the same event_type and category', async () => {
      const subscribeCommandData = {
        kind: BloomreachCommandDataKind.EVENT as const,
        customer_ids: { city_account_id: externalId },
        event_type: BloomreachEventNameEnum.CONSENT,
        properties: {
          action: BloomreachConsentActionEnum.ACCEPT,
          category: 'ESBS-MARKETING',
          valid_until: 'unlimited',
        },
        timestamp: 100,
      }

      const unsubscribeCommandData = {
        kind: BloomreachCommandDataKind.EVENT as const,
        customer_ids: { city_account_id: externalId },
        event_type: BloomreachEventNameEnum.CONSENT,
        properties: {
          action: BloomreachConsentActionEnum.REJECT,
          category: 'ESBS-MARKETING',
          valid_until: 'unlimited',
        },
        timestamp: 200,
      }

      const existingEntry = bloomreachOutboxFactory({
        id: 'pending-subscribe-id',
        commandData: subscribeCommandData,
      })
      const txMock = createMock<PrismaService>()
      txMock.bloomreachOutbox.findFirst.mockResolvedValue(existingEntry)
      prismaMock.$transaction.mockImplementation(async (fn) => fn(txMock))

      payloadBuilder.buildConsentEventCommands.mockReturnValue([
        {
          commandName: BloomreachCommandNameEnum.CUSTOMERS_EVENTS,
          commandData: unsubscribeCommandData,
        },
      ])

      await service.trackConsents(
        [{ consentType: ConsentEnum.MARKETING, isGranted: false }],
        externalId
      )

      expect(txMock.bloomreachOutbox.update).toHaveBeenCalledWith({
        where: { id: 'pending-subscribe-id' },
        data: { commandData: unsubscribeCommandData, isTerminal: false },
      })
      expect(txMock.bloomreachOutbox.create).not.toHaveBeenCalled()
    })
  })

  describe('anonymizeCustomer', () => {
    it('should skip when integration is not active', async () => {
      bloomreachConfig.integrationState = 'INACTIVE'

      await service.anonymizeCustomer(externalId)

      expect(payloadBuilder.buildAnonymizeCommand).not.toHaveBeenCalled()
    })

    it('should queue unsubscribe consent events and anonymize command with one shared timestamp', async () => {
      payloadBuilder.buildConsentEventCommands.mockReturnValue([])
      payloadBuilder.buildAnonymizeCommand.mockReturnValue(mockAnonymizeCommand)
      const txMock = createMock<PrismaService>()
      txMock.bloomreachOutbox.findFirst.mockResolvedValue(null)
      prismaMock.$transaction.mockImplementation(async (fn) => fn(txMock))

      await service.anonymizeCustomer(externalId)

      const [consents] = payloadBuilder.buildConsentEventCommands.mock.calls[0]
      const anonymizedAt = consents[0].timestamp

      expect(consents).toEqual([
        { consentType: ConsentEnum.MARKETING, isGranted: false, timestamp: anonymizedAt },
        { consentType: ConsentEnum.GENERAL, isGranted: false, timestamp: anonymizedAt },
      ])
      expect(payloadBuilder.buildAnonymizeCommand).toHaveBeenCalledWith(externalId, anonymizedAt)
      expect(txMock.bloomreachOutbox.create).toHaveBeenCalledWith({
        data: {
          externalId,
          commandName: BloomreachCommandName.CUSTOMERS,
          commandData: mockAnonymizeCommand.commandData,
          isTerminal: true,
        },
      })
    })
  })
})
