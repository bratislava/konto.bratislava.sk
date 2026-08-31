import { createMock } from '@golevelup/ts-jest'
import { Test, TestingModule } from '@nestjs/testing'

import prismaMock from '../../../test/singleton'
import { bloomreachOutboxFactory } from '../../__tests__/factories/bloomreachOutbox.factory'
import { expectObjectContaining } from '../../__tests__/jest-matchers'
import { BloomreachCommandName } from '../../generated/prisma/enums'
import { PrismaService } from '../../prisma/prisma.service'
import ThrowerErrorGuard from '../../utils/guards/errors.guard'
import {
  BloomreachCommandDataKind,
  BloomreachCommandNameEnum,
  BloomreachConsentActionEnum,
  BloomreachEventNameEnum,
} from '../bloomreach.types'
import { BloomreachOutboxWriterService } from '../bloomreach-outbox-writer.service'
import { BloomreachPayloadBuilder } from '../bloomreach-payload.builder'

describe('BloomreachOutboxWriterService', () => {
  let service: BloomreachOutboxWriterService
  let payloadBuilder: jest.Mocked<BloomreachPayloadBuilder>
  let throwerErrorGuard: jest.Mocked<ThrowerErrorGuard>

  const externalId = 'external-id'
  // Newer/older relative to each other - what actually matters to the merge
  // and priority logic under test, not their absolute values.
  const NEW_TIMESTAMP = 200
  const OLD_TIMESTAMP = 100
  const VERY_OLD_TIMESTAMP = 1

  const customerCommand = {
    commandName: BloomreachCommandNameEnum.CUSTOMERS as const,
    commandData: {
      kind: BloomreachCommandDataKind.CUSTOMER as const,
      customer_ids: { city_account_id: externalId },
      properties: { email: 'test@example.com' },
      update_timestamp: NEW_TIMESTAMP,
    },
  }

  const eventCommand = {
    commandName: BloomreachCommandNameEnum.CUSTOMERS_EVENTS as const,
    commandData: {
      kind: BloomreachCommandDataKind.EVENT as const,
      customer_ids: { city_account_id: externalId },
      event_type: BloomreachEventNameEnum.CONSENT,
      properties: {
        action: BloomreachConsentActionEnum.ACCEPT,
        category: 'ESBS-MARKETING',
        valid_until: 'unlimited',
      },
      timestamp: NEW_TIMESTAMP,
    },
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BloomreachOutboxWriterService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: BloomreachPayloadBuilder, useValue: createMock<BloomreachPayloadBuilder>() },
        { provide: ThrowerErrorGuard, useValue: createMock<ThrowerErrorGuard>() },
      ],
    }).compile()

    service = module.get<BloomreachOutboxWriterService>(BloomreachOutboxWriterService)
    payloadBuilder = module.get(BloomreachPayloadBuilder)
    throwerErrorGuard = module.get(ThrowerErrorGuard)

    prismaMock.$transaction.mockImplementation(async (fn) => fn(prismaMock))
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('queueCustomerCommand', () => {
    it('should create a new PENDING entry when none exists', async () => {
      payloadBuilder.buildCustomerCommand.mockResolvedValue(customerCommand)
      prismaMock.bloomreachOutbox.findFirst.mockResolvedValue(null)

      await service.queueCustomerCommand(externalId, '0900123456')

      expect(payloadBuilder.buildCustomerCommand).toHaveBeenCalledWith(externalId, '0900123456')
      expect(prismaMock.bloomreachOutbox.create).toHaveBeenCalledWith({
        data: {
          externalId,
          commandName: BloomreachCommandName.CUSTOMERS,
          commandData: customerCommand.commandData,
          isTerminal: false,
        },
      })
    })

    it('should merge into an existing PENDING entry instead of creating a new one', async () => {
      payloadBuilder.buildCustomerCommand.mockResolvedValue(customerCommand)
      const existing = bloomreachOutboxFactory({
        id: 'existing-id',
        commandData: {
          kind: BloomreachCommandDataKind.CUSTOMER,
          customer_ids: { city_account_id: externalId, contact_id: 'contact-id' },
          properties: { phone: '0900000000', email: 'old@never.test' },
          update_timestamp: OLD_TIMESTAMP,
        },
      })
      prismaMock.bloomreachOutbox.findFirst.mockResolvedValue(existing)

      await service.queueCustomerCommand(externalId)

      expect(prismaMock.bloomreachOutbox.update).toHaveBeenCalledWith({
        where: { id: 'existing-id' },
        data: {
          commandData: {
            kind: BloomreachCommandDataKind.CUSTOMER,
            customer_ids: { city_account_id: externalId, contact_id: 'contact-id' },
            properties: { phone: '0900000000', email: 'test@example.com' },
            update_timestamp: NEW_TIMESTAMP,
          },
          isTerminal: false,
        },
      })
      expect(prismaMock.bloomreachOutbox.create).not.toHaveBeenCalled()
    })

    it('should serialize the write behind a per-dedup-key advisory lock', async () => {
      payloadBuilder.buildCustomerCommand.mockResolvedValue(customerCommand)
      prismaMock.bloomreachOutbox.findFirst.mockResolvedValue(null)

      await service.queueCustomerCommand(externalId)

      expect(prismaMock.$queryRaw).toHaveBeenCalledTimes(1)
      expect(prismaMock.$queryRaw.mock.calls[0]).toContain(`${externalId}:CUSTOMERS`)
    })

    it('should wrap a duplicate-pending-customer create failure as a locking bug', async () => {
      payloadBuilder.buildCustomerCommand.mockResolvedValue(customerCommand)
      prismaMock.bloomreachOutbox.findFirst.mockResolvedValue(null)
      const duplicatePendingError = Object.assign(new Error('rejected by trigger'), {
        name: 'DriverAdapterError',
        cause: { kind: 'postgres', code: 'BR004' },
      })
      prismaMock.bloomreachOutbox.create.mockRejectedValue(duplicatePendingError)

      // What matters here is that the failure was routed through
      // throwerErrorGuard with the right context, not what that guard's
      // (auto-mocked) return value happens to be.
      await expect(service.queueCustomerCommand(externalId)).rejects.toBeDefined()
      expect(throwerErrorGuard.InternalServerErrorException).toHaveBeenCalledWith(
        expect.anything(),
        expect.stringContaining('bloomreach_outbox_customers_pending_key'),
        expect.anything(),
        duplicatePendingError
      )
    })

    it('should log and swallow a terminal-override rejection instead of alerting', async () => {
      payloadBuilder.buildCustomerCommand.mockResolvedValue(customerCommand)
      prismaMock.bloomreachOutbox.findFirst.mockResolvedValue(null)
      const terminalOverrideError = Object.assign(new Error('rejected by trigger'), {
        name: 'DriverAdapterError',
        cause: { kind: 'postgres', code: 'BR003' },
      })
      prismaMock.bloomreachOutbox.create.mockRejectedValue(terminalOverrideError)

      await expect(service.queueCustomerCommand(externalId)).resolves.toBeUndefined()
      expect(throwerErrorGuard.InternalServerErrorException).not.toHaveBeenCalled()
    })

    it('should wrap a terminal-downgrade update failure instead of letting it propagate raw', async () => {
      payloadBuilder.buildCustomerCommand.mockResolvedValue(customerCommand)
      prismaMock.bloomreachOutbox.findFirst.mockResolvedValue(
        bloomreachOutboxFactory({ id: 'existing-id' })
      )
      const downgradeError = Object.assign(new Error('rejected by trigger'), {
        name: 'DriverAdapterError',
        cause: { kind: 'postgres', code: 'BR001' },
      })
      prismaMock.bloomreachOutbox.update.mockRejectedValue(downgradeError)

      await expect(service.queueCustomerCommand(externalId)).rejects.toBeDefined()
      expect(throwerErrorGuard.InternalServerErrorException).toHaveBeenCalledWith(
        expect.anything(),
        expect.stringContaining('downgrade a terminal outbox entry'),
        expect.anything(),
        downgradeError
      )
    })

    it('should let an unrelated create failure propagate as-is', async () => {
      payloadBuilder.buildCustomerCommand.mockResolvedValue(customerCommand)
      prismaMock.bloomreachOutbox.findFirst.mockResolvedValue(null)
      prismaMock.bloomreachOutbox.create.mockRejectedValue(new Error('connection reset'))

      await expect(service.queueCustomerCommand(externalId)).rejects.toThrow('connection reset')
      expect(throwerErrorGuard.InternalServerErrorException).not.toHaveBeenCalled()
    })
  })

  describe('queueAnonymizeCommand', () => {
    it('should create a terminal entry', async () => {
      const anonymizeCommand = {
        commandName: BloomreachCommandNameEnum.CUSTOMERS as const,
        commandData: {
          kind: BloomreachCommandDataKind.CUSTOMER as const,
          customer_ids: { city_account_id: externalId },
          properties: { is_identity_verified: false },
          update_timestamp: NEW_TIMESTAMP,
        },
      }
      payloadBuilder.buildAnonymizeCommand.mockReturnValue(anonymizeCommand)
      prismaMock.bloomreachOutbox.findFirst.mockResolvedValue(null)

      await service.queueAnonymizeCommand(externalId, NEW_TIMESTAMP)

      expect(payloadBuilder.buildAnonymizeCommand).toHaveBeenCalledWith(externalId, NEW_TIMESTAMP)
      expect(prismaMock.bloomreachOutbox.create).toHaveBeenCalledWith({
        data: {
          externalId,
          commandName: BloomreachCommandName.CUSTOMERS,
          commandData: anonymizeCommand.commandData,
          isTerminal: true,
        },
      })
    })
  })

  describe('queueConsentEvents', () => {
    it('should create a new PENDING event entry when none exists', async () => {
      payloadBuilder.buildConsentEventCommands.mockReturnValue([eventCommand])
      prismaMock.bloomreachOutbox.findFirst.mockResolvedValue(null)

      await service.queueConsentEvents([], externalId)

      expect(prismaMock.bloomreachOutbox.create).toHaveBeenCalledWith({
        data: {
          externalId,
          commandName: BloomreachCommandName.CUSTOMERS_EVENTS,
          commandData: eventCommand.commandData,
          isTerminal: false,
        },
      })
    })

    it('should mark the new entry terminal when queued as terminal', async () => {
      payloadBuilder.buildConsentEventCommands.mockReturnValue([eventCommand])
      prismaMock.bloomreachOutbox.findFirst.mockResolvedValue(null)

      await service.queueConsentEvents([], externalId, true)

      expect(prismaMock.bloomreachOutbox.create).toHaveBeenCalledWith({
        data: expectObjectContaining({ isTerminal: true }),
      })
    })

    it('should replace an existing lower-priority PENDING event', async () => {
      payloadBuilder.buildConsentEventCommands.mockReturnValue([eventCommand])
      const existing = bloomreachOutboxFactory({
        id: 'existing-event',
        commandName: BloomreachCommandName.CUSTOMERS_EVENTS,
        isTerminal: false,
        commandData: {
          kind: BloomreachCommandDataKind.EVENT,
          customer_ids: { city_account_id: externalId },
          event_type: BloomreachEventNameEnum.CONSENT,
          properties: {
            action: BloomreachConsentActionEnum.REJECT,
            category: 'ESBS-MARKETING',
            valid_until: 'unlimited',
          },
          timestamp: OLD_TIMESTAMP,
        },
      })
      prismaMock.bloomreachOutbox.findFirst.mockResolvedValue(existing)

      await service.queueConsentEvents([], externalId)

      expect(prismaMock.bloomreachOutbox.update).toHaveBeenCalledWith({
        where: { id: 'existing-event' },
        data: { commandData: eventCommand.commandData, isTerminal: false },
      })
    })

    it('should skip updating when the existing event outranks the incoming one', async () => {
      payloadBuilder.buildConsentEventCommands.mockReturnValue([eventCommand])
      const terminalExisting = bloomreachOutboxFactory({
        id: 'existing-event',
        commandName: BloomreachCommandName.CUSTOMERS_EVENTS,
        isTerminal: true,
        commandData: {
          kind: BloomreachCommandDataKind.EVENT,
          customer_ids: { city_account_id: externalId },
          event_type: BloomreachEventNameEnum.CONSENT,
          properties: {
            action: BloomreachConsentActionEnum.REJECT,
            category: 'ESBS-MARKETING',
            valid_until: 'unlimited',
          },
          // Terminal wins regardless of timestamp - deliberately far older
          // than NEW_TIMESTAMP to prove that.
          timestamp: VERY_OLD_TIMESTAMP,
        },
      })
      prismaMock.bloomreachOutbox.findFirst.mockResolvedValue(terminalExisting)

      await service.queueConsentEvents([], externalId)

      expect(prismaMock.bloomreachOutbox.update).not.toHaveBeenCalled()
      expect(prismaMock.bloomreachOutbox.create).not.toHaveBeenCalled()
    })

    it('should log and swallow a terminal-override rejection instead of alerting', async () => {
      payloadBuilder.buildConsentEventCommands.mockReturnValue([eventCommand])
      prismaMock.bloomreachOutbox.findFirst.mockResolvedValue(null)
      const terminalOverrideError = Object.assign(new Error('rejected by trigger'), {
        name: 'DriverAdapterError',
        cause: { kind: 'postgres', code: 'BR003' },
      })
      prismaMock.bloomreachOutbox.create.mockRejectedValue(terminalOverrideError)

      await expect(service.queueConsentEvents([], externalId)).resolves.toBeUndefined()
      expect(throwerErrorGuard.InternalServerErrorException).not.toHaveBeenCalled()
    })

    it('should wrap a duplicate-pending-event create failure as a locking bug', async () => {
      payloadBuilder.buildConsentEventCommands.mockReturnValue([eventCommand])
      prismaMock.bloomreachOutbox.findFirst.mockResolvedValue(null)
      const duplicatePendingError = Object.assign(new Error('rejected by trigger'), {
        name: 'DriverAdapterError',
        cause: { kind: 'postgres', code: 'BR005' },
      })
      prismaMock.bloomreachOutbox.create.mockRejectedValue(duplicatePendingError)

      await expect(service.queueConsentEvents([], externalId)).rejects.toBeDefined()
      expect(throwerErrorGuard.InternalServerErrorException).toHaveBeenCalledWith(
        expect.anything(),
        expect.stringContaining('bloomreach_outbox_events_pending_key'),
        expect.anything(),
        duplicatePendingError
      )
    })

    it('should wrap a terminal-downgrade update failure instead of letting it propagate raw', async () => {
      payloadBuilder.buildConsentEventCommands.mockReturnValue([eventCommand])
      const existing = bloomreachOutboxFactory({
        id: 'existing-event',
        commandName: BloomreachCommandName.CUSTOMERS_EVENTS,
        isTerminal: false,
        commandData: {
          kind: BloomreachCommandDataKind.EVENT,
          customer_ids: { city_account_id: externalId },
          event_type: BloomreachEventNameEnum.CONSENT,
          properties: {
            action: BloomreachConsentActionEnum.REJECT,
            category: 'ESBS-MARKETING',
            valid_until: 'unlimited',
          },
          timestamp: OLD_TIMESTAMP,
        },
      })
      prismaMock.bloomreachOutbox.findFirst.mockResolvedValue(existing)
      const downgradeError = Object.assign(new Error('rejected by trigger'), {
        name: 'DriverAdapterError',
        cause: { kind: 'postgres', code: 'BR001' },
      })
      prismaMock.bloomreachOutbox.update.mockRejectedValue(downgradeError)

      await expect(service.queueConsentEvents([], externalId)).rejects.toBeDefined()
      expect(throwerErrorGuard.InternalServerErrorException).toHaveBeenCalledWith(
        expect.anything(),
        expect.stringContaining('downgrade a terminal outbox entry'),
        expect.anything(),
        downgradeError
      )
    })
  })
})
