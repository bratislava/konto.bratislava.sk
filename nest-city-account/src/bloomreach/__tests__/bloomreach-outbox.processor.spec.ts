import { createMock } from '@golevelup/ts-jest'
import { Test, TestingModule } from '@nestjs/testing'
import axios from 'axios'

import prismaMock from '../../../test/singleton'
import {
  expectAny,
  expectDefined,
  expectObjectContaining,
  expectStringContaining,
} from '../../__tests__/jest-matchers'
import BaConfigService from '../../config/ba-config.service'
import {
  BloomreachCommandName,
  BloomreachOutbox,
  BloomreachOutboxStatus,
} from '../../generated/prisma/client'
import { PrismaService } from '../../prisma/prisma.service'
import ThrowerErrorGuard from '../../utils/guards/errors.guard'
import {
  BLOOMREACH_WIRE_COMMAND_NAME,
  BloomreachBatchCommand,
  BloomreachConsentActionEnum,
  BloomreachEventNameEnum,
} from '../bloomreach.types'
import { BloomreachMergeConsentService } from '../bloomreach-merge-consent.service'
import { BloomreachOutboxProcessor } from '../bloomreach-outbox.processor'

jest.mock('axios')
const mockedAxios = axios as jest.Mocked<typeof axios>

describe('BloomreachOutboxProcessor', () => {
  let processor: BloomreachOutboxProcessor
  let mergeConsentService: jest.Mocked<BloomreachMergeConsentService>
  let throwerErrorGuard: jest.Mocked<ThrowerErrorGuard>

  const now = new Date('2026-03-26T12:00:00Z')

  const bloomreachConfig = {
    integrationState: 'ACTIVE',
    apiUrl: 'https://api.bloomreach.test',
    projectToken: 'test-project',
    apiKey: 'dummy-key',
    apiSecret: 'dummy-secret',
  }

  const makeEntry = (overrides: Partial<BloomreachOutbox> = {}): BloomreachOutbox => ({
    id: 'entry-1',
    createdAt: now,
    updatedAt: now,
    externalId: 'cognito-1',
    commandName: BloomreachCommandName.CUSTOMERS,
    commandData: {
      customer_ids: { city_account_id: 'cognito-1' },
      properties: {},
      update_timestamp: 100,
    },
    status: BloomreachOutboxStatus.PROCESSING,
    attempts: 0,
    lastError: null,
    isTerminal: false,
    ...overrides,
  })

  beforeEach(async () => {
    bloomreachConfig.integrationState = 'ACTIVE'
    bloomreachConfig.apiUrl = 'https://api.bloomreach.test'
    bloomreachConfig.projectToken = 'test-project'
    bloomreachConfig.apiKey = 'dummy-key'
    bloomreachConfig.apiSecret = 'dummy-secret'

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BloomreachOutboxProcessor,
        { provide: PrismaService, useValue: prismaMock },
        { provide: ThrowerErrorGuard, useValue: createMock<ThrowerErrorGuard>() },
        {
          provide: BloomreachMergeConsentService,
          useValue: createMock<BloomreachMergeConsentService>(),
        },
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

    processor = module.get<BloomreachOutboxProcessor>(BloomreachOutboxProcessor)
    mergeConsentService = module.get(BloomreachMergeConsentService)
    throwerErrorGuard = module.get(ThrowerErrorGuard)
    // Default: no stale PROCESSING entries to recover
    prismaMock.bloomreachOutbox.findMany.mockResolvedValue([])
    prismaMock.$transaction.mockImplementation(async (fn) => fn(prismaMock))
    prismaMock.$queryRaw.mockReset()
    prismaMock.$queryRaw.mockResolvedValueOnce([{ acquired: true }])
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('processOutbox', () => {
    it('should skip when integration is not active', async () => {
      bloomreachConfig.integrationState = 'INACTIVE'

      await processor.processOutbox()

      expect(prismaMock.$queryRaw).not.toHaveBeenCalled()
    })

    it('should do nothing when no pending entries exist', async () => {
      prismaMock.bloomreachOutbox.findMany.mockResolvedValue([])
      prismaMock.$queryRaw.mockResolvedValue([])

      await processor.processOutbox()

      expect(mockedAxios.post).not.toHaveBeenCalled()
    })

    it('should send batch with command_id and mark entries as COMPLETED on success', async () => {
      const entry = makeEntry()
      prismaMock.$queryRaw.mockResolvedValue([entry])
      mockedAxios.post.mockResolvedValue({
        data: { success: true, results: [{ success: true, time: 0.01 }] },
      })

      await processor.processOutbox()

      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://api.bloomreach.test/track/v2/projects/test-project/batch',
        {
          commands: [
            {
              name: BLOOMREACH_WIRE_COMMAND_NAME[entry.commandName],
              data: entry.commandData,
              command_id: 'entry-1',
            },
          ],
        },
        expectObjectContaining({
          headers: expectObjectContaining({
            Authorization: expectStringContaining('Basic '),
          }),
        })
      )
      expect(prismaMock.bloomreachOutbox.updateMany).toHaveBeenCalledWith({
        where: { id: { in: ['entry-1'] } },
        data: { status: BloomreachOutboxStatus.COMPLETED },
      })
    })

    it('should mark entries back to PENDING on API failure when under max attempts', async () => {
      const entry = makeEntry({ attempts: 1 })
      prismaMock.$queryRaw.mockResolvedValue([entry])
      prismaMock.bloomreachOutbox.findFirst.mockResolvedValue(null)
      mockedAxios.post.mockRejectedValue(new Error('Request failed with status code 500'))

      await processor.processOutbox()

      expect(prismaMock.bloomreachOutbox.update).toHaveBeenCalledWith({
        where: { id: 'entry-1' },
        data: {
          status: BloomreachOutboxStatus.PENDING,
          attempts: 2,
          lastError: expectStringContaining('500'),
        },
      })
    })

    it('should mark entries as FAILED when max attempts reached', async () => {
      const entry = makeEntry({ attempts: 4 })
      prismaMock.$queryRaw.mockResolvedValue([entry])
      prismaMock.bloomreachOutbox.findFirst.mockResolvedValue(null)
      mockedAxios.post.mockRejectedValue(new Error('Request failed'))

      await processor.processOutbox()

      expect(prismaMock.bloomreachOutbox.update).toHaveBeenCalledWith({
        where: { id: 'entry-1' },
        data: {
          status: BloomreachOutboxStatus.FAILED,
          attempts: 5,
          lastError: expectAny<string>(String),
        },
      })
    })

    it('should handle per-command failures from batch response', async () => {
      const entries = [makeEntry({ id: 'entry-1' }), makeEntry({ id: 'entry-2' })]
      prismaMock.$queryRaw.mockResolvedValue(entries)
      prismaMock.bloomreachOutbox.findFirst.mockResolvedValue(null)
      mockedAxios.post.mockResolvedValue({
        data: {
          success: true,
          results: [
            { success: true, time: 0.01 },
            { success: false, time: 0.02 },
          ],
        },
      })

      await processor.processOutbox()

      // First entry succeeded
      expect(prismaMock.bloomreachOutbox.updateMany).toHaveBeenCalledWith({
        where: { id: { in: ['entry-1'] } },
        data: { status: BloomreachOutboxStatus.COMPLETED },
      })
      // Second entry failed — rolled back to PENDING
      expect(prismaMock.bloomreachOutbox.update).toHaveBeenCalledWith({
        where: { id: 'entry-2' },
        data: {
          status: BloomreachOutboxStatus.PENDING,
          attempts: 1,
          lastError: expectStringContaining('success=false'),
        },
      })
    })

    it('should roll back all entries when API returns no results', async () => {
      const entry = makeEntry()
      prismaMock.$queryRaw.mockResolvedValue([entry])
      prismaMock.bloomreachOutbox.findFirst.mockResolvedValue(null)
      mockedAxios.post.mockResolvedValue({ data: { success: false } })

      await processor.processOutbox()

      expect(prismaMock.bloomreachOutbox.update).toHaveBeenCalledWith({
        where: { id: 'entry-1' },
        data: expectObjectContaining({
          status: BloomreachOutboxStatus.PENDING,
        }),
      })
    })

    it('should process multiple entries in a single batch', async () => {
      const entries = [
        makeEntry({ id: 'entry-1' }),
        makeEntry({ id: 'entry-2', commandName: BloomreachCommandName.CUSTOMERS_EVENTS }),
      ]
      prismaMock.$queryRaw.mockResolvedValue(entries)
      mockedAxios.post.mockResolvedValue({
        data: {
          success: true,
          results: [
            { success: true, time: 0.01 },
            { success: true, time: 0.02 },
          ],
        },
      })

      await processor.processOutbox()

      const [, requestBody] = expectDefined(mockedAxios.post.mock.lastCall)
      expect((requestBody as { commands: BloomreachBatchCommand[] }).commands).toHaveLength(2)
      expect(prismaMock.bloomreachOutbox.updateMany).toHaveBeenCalledWith({
        where: { id: { in: ['entry-1', 'entry-2'] } },
        data: { status: BloomreachOutboxStatus.COMPLETED },
      })
    })

    it('should revert entry without sending when the merge consent check fails', async () => {
      const entry = makeEntry()
      prismaMock.$queryRaw.mockResolvedValue([entry])
      prismaMock.bloomreachOutbox.findFirst.mockResolvedValue(null)
      mergeConsentService.ensureConsentsSurviveMerge.mockResolvedValue(false)

      await processor.processOutbox()

      expect(mockedAxios.post).not.toHaveBeenCalled()
      expect(prismaMock.bloomreachOutbox.update).toHaveBeenCalledWith({
        where: { id: 'entry-1' },
        data: {
          status: BloomreachOutboxStatus.PENDING,
          // Doesn't count toward the attempts budge
          attempts: 0,
          lastError: 'Bloomreach merge consent check failed',
        },
      })
    })

    it('should send remaining entries when one merge consent check fails', async () => {
      const entries = [makeEntry({ id: 'entry-1' }), makeEntry({ id: 'entry-2' })]
      prismaMock.$queryRaw.mockResolvedValue(entries)
      prismaMock.bloomreachOutbox.findFirst.mockResolvedValue(null)
      // Checks run in claim order — the first call is for entry-1
      mergeConsentService.ensureConsentsSurviveMerge
        .mockResolvedValueOnce(false)
        .mockResolvedValueOnce(true)
      mockedAxios.post.mockResolvedValue({
        data: { success: true, results: [{ success: true, time: 0.01 }] },
      })

      await processor.processOutbox()

      const requestBody = expectDefined(mockedAxios.post.mock.calls[0]?.[1])
      expect((requestBody as { commands: BloomreachBatchCommand[] }).commands).toEqual([
        {
          name: BLOOMREACH_WIRE_COMMAND_NAME[entries[1].commandName],
          data: entries[1].commandData,
          command_id: 'entry-2',
        },
      ])
      expect(prismaMock.bloomreachOutbox.updateMany).toHaveBeenCalledWith({
        where: { id: { in: ['entry-2'] } },
        data: { status: BloomreachOutboxStatus.COMPLETED },
      })
      expect(prismaMock.bloomreachOutbox.update).toHaveBeenCalledWith({
        where: { id: 'entry-1' },
        data: {
          status: BloomreachOutboxStatus.PENDING,
          attempts: 0,
          lastError: 'Bloomreach merge consent check failed',
        },
      })
    })

    it('should mark reverted customers entry as SUPERSEDED and merge data into newer PENDING entry', async () => {
      const oldEntry = makeEntry({
        id: 'old-entry',
        commandData: {
          customer_ids: { city_account_id: 'cognito-1' },
          properties: { phone: '0900000000', email: 'old@example.com' },
          update_timestamp: 100,
        },
      })
      const newerPendingEntry = makeEntry({
        id: 'newer-entry',
        status: BloomreachOutboxStatus.PENDING,
        commandData: {
          customer_ids: { city_account_id: 'cognito-1' },
          properties: { email: 'new@example.com' },
          update_timestamp: 200,
        },
      })

      prismaMock.$queryRaw.mockResolvedValue([oldEntry])
      prismaMock.bloomreachOutbox.findFirst.mockResolvedValue(newerPendingEntry)
      mockedAxios.post.mockRejectedValue(new Error('API down'))

      await processor.processOutbox()

      // Old entry should be marked SUPERSEDED
      expect(prismaMock.bloomreachOutbox.update).toHaveBeenCalledWith({
        where: { id: 'old-entry' },
        data: {
          status: BloomreachOutboxStatus.SUPERSEDED,
          attempts: 1,
          lastError: 'Superseded by newer PENDING entry newer-entry',
        },
      })
      // Newer entry should be updated with merged data (old base, newer overrides)
      expect(prismaMock.bloomreachOutbox.update).toHaveBeenCalledWith({
        where: { id: 'newer-entry' },
        data: {
          commandData: {
            customer_ids: { city_account_id: 'cognito-1' },
            properties: { phone: '0900000000', email: 'new@example.com' },
            update_timestamp: 200,
          },
          isTerminal: false,
        },
      })
    })

    it('should wrap a terminal-downgrade failure while merging into the newer PENDING entry', async () => {
      const oldEntry = makeEntry({
        id: 'old-entry',
        commandData: {
          customer_ids: { city_account_id: 'cognito-1' },
          properties: { phone: '0900000000', email: 'old@example.com' },
          update_timestamp: 100,
        },
      })
      const newerPendingEntry = makeEntry({
        id: 'newer-entry',
        status: BloomreachOutboxStatus.PENDING,
        commandData: {
          customer_ids: { city_account_id: 'cognito-1' },
          properties: { email: 'new@example.com' },
          update_timestamp: 200,
        },
      })

      prismaMock.$queryRaw.mockResolvedValue([oldEntry])
      prismaMock.bloomreachOutbox.findFirst.mockResolvedValue(newerPendingEntry)
      mockedAxios.post.mockRejectedValue(new Error('API down'))
      const downgradeError = Object.assign(new Error('rejected by trigger'), {
        name: 'DriverAdapterError',
        cause: { kind: 'postgres', code: 'BR001' },
      })
      // The merge-into-newer-entry update runs before the old entry's own
      // SUPERSEDED status update, so this only ever rejects that first call.
      prismaMock.bloomreachOutbox.update.mockRejectedValueOnce(downgradeError)

      await expect(processor.processOutbox()).rejects.toBeDefined()
      expect(throwerErrorGuard.InternalServerErrorException).toHaveBeenCalledWith(
        expect.anything(),
        expect.stringContaining('downgrade a terminal outbox entry'),
        expect.anything(),
        downgradeError
      )
    })

    it('should mark reverted event entry as SUPERSEDED without merge when newer PENDING exists', async () => {
      const oldEventEntry = makeEntry({
        id: 'old-event',
        commandName: BloomreachCommandName.CUSTOMERS_EVENTS,
        commandData: {
          customer_ids: { city_account_id: 'cognito-1' },
          event_type: BloomreachEventNameEnum.CONSENT,
          properties: {
            action: BloomreachConsentActionEnum.ACCEPT,
            category: 'ESBS-MARKETING',
            valid_until: 'unlimited',
          },
          timestamp: 100,
        },
      })
      const newerEventEntry = makeEntry({
        id: 'newer-event',
        commandName: BloomreachCommandName.CUSTOMERS_EVENTS,
        status: BloomreachOutboxStatus.PENDING,
        commandData: {
          customer_ids: { city_account_id: 'cognito-1' },
          event_type: BloomreachEventNameEnum.CONSENT,
          properties: {
            action: BloomreachConsentActionEnum.REJECT,
            category: 'ESBS-MARKETING',
            valid_until: 'unlimited',
          },
          timestamp: 200,
        },
      })

      prismaMock.$queryRaw.mockResolvedValue([oldEventEntry])
      prismaMock.bloomreachOutbox.findFirst.mockResolvedValue(newerEventEntry)
      mockedAxios.post.mockRejectedValue(new Error('API down'))

      await processor.processOutbox()

      // Old event should be marked SUPERSEDED
      expect(prismaMock.bloomreachOutbox.update).toHaveBeenCalledWith({
        where: { id: 'old-event' },
        data: {
          status: BloomreachOutboxStatus.SUPERSEDED,
          attempts: 1,
          lastError: 'Superseded by newer PENDING entry newer-event',
        },
      })
      // Newer event should NOT be updated (no merge for events)
      expect(prismaMock.bloomreachOutbox.update).not.toHaveBeenCalledWith(
        expectObjectContaining({ where: { id: 'newer-event' } })
      )
    })
  })

  describe('recoverStaleProcessingEntries', () => {
    it('should recover stale entry to PENDING when no newer PENDING exists', async () => {
      const staleEntry = makeEntry({
        id: 'stale-1',
        status: BloomreachOutboxStatus.PROCESSING,
        updatedAt: new Date('2026-03-26T11:58:00Z'), // >60s ago relative to now
      })
      prismaMock.bloomreachOutbox.findMany.mockResolvedValue([staleEntry])
      prismaMock.bloomreachOutbox.findFirst.mockResolvedValue(null)
      prismaMock.$queryRaw.mockResolvedValue([])

      await processor.processOutbox()

      expect(prismaMock.bloomreachOutbox.update).toHaveBeenCalledWith({
        where: { id: 'stale-1' },
        data: {
          status: BloomreachOutboxStatus.PENDING,
          attempts: 1,
          lastError: undefined,
        },
      })
    })

    it('should mark stale entry as SUPERSEDED and merge into newer PENDING for customers commands', async () => {
      const staleEntry = makeEntry({
        id: 'stale-1',
        status: BloomreachOutboxStatus.PROCESSING,
        updatedAt: new Date('2026-03-26T11:58:00Z'),
        commandData: {
          customer_ids: { city_account_id: 'cognito-1' },
          properties: { phone: '0900000000', email: 'old@example.com' },
          update_timestamp: 100,
        },
      })
      const newerEntry = makeEntry({
        id: 'newer-1',
        status: BloomreachOutboxStatus.PENDING,
        commandData: {
          customer_ids: { city_account_id: 'cognito-1' },
          properties: { email: 'new@example.com' },
          update_timestamp: 200,
        },
      })
      prismaMock.bloomreachOutbox.findMany.mockResolvedValue([staleEntry])
      prismaMock.bloomreachOutbox.findFirst.mockResolvedValue(newerEntry)
      prismaMock.$queryRaw.mockResolvedValue([])

      await processor.processOutbox()

      // Stale entry marked SUPERSEDED
      expect(prismaMock.bloomreachOutbox.update).toHaveBeenCalledWith({
        where: { id: 'stale-1' },
        data: {
          status: BloomreachOutboxStatus.SUPERSEDED,
          attempts: 1,
          lastError: 'Superseded by newer PENDING entry newer-1',
        },
      })
      // Newer entry gets merged data
      expect(prismaMock.bloomreachOutbox.update).toHaveBeenCalledWith({
        where: { id: 'newer-1' },
        data: {
          commandData: {
            customer_ids: { city_account_id: 'cognito-1' },
            properties: { phone: '0900000000', email: 'new@example.com' },
            update_timestamp: 200,
          },
          isTerminal: false,
        },
      })
    })
  })
})
