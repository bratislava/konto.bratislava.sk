/* eslint-disable @typescript-eslint/no-explicit-any */
import { Test, TestingModule } from '@nestjs/testing'
import { createMock } from '@golevelup/ts-jest'
import { BloomreachOutbox, BloomreachOutboxStatus } from '@prisma/client'
import axios from 'axios'
import { PrismaService } from '../../prisma/prisma.service'
import ThrowerErrorGuard from '../../utils/guards/errors.guard'
import prismaMock from '../../../test/singleton'
import { BloomreachOutboxProcessor } from '../bloomreach-outbox.processor'
import {
  BloomreachCommandNameEnum,
  BloomreachConsentActionEnum,
  BloomreachConsentCategoryEnum,
  BloomreachEventNameEnum,
} from '../bloomreach.types'

jest.mock('axios')
const mockedAxios = axios as jest.Mocked<typeof axios>

describe('BloomreachOutboxProcessor', () => {
  let processor: BloomreachOutboxProcessor

  const now = new Date('2026-03-26T12:00:00Z')

  const makeEntry = (overrides: Partial<BloomreachOutbox> = {}): BloomreachOutbox => ({
    id: 'entry-1',
    createdAt: now,
    updatedAt: now,
    externalId: 'cognito-1',
    commandName: BloomreachCommandNameEnum.CUSTOMERS,
    commandData: { customer_ids: { city_account_id: 'cognito-1' }, properties: {} },
    status: BloomreachOutboxStatus.PROCESSING,
    attempts: 0,
    lastError: null,
    ...overrides,
  })

  beforeEach(async () => {
    process.env.BLOOMREACH_INTEGRATION_STATE = 'ACTIVE'
    process.env.BLOOMREACH_API_URL = 'https://api.bloomreach.test'
    process.env.BLOOMREACH_PROJECT_TOKEN = 'test-project'
    process.env.BLOOMREACH_API_KEY = 'key'
    process.env.BLOOMREACH_API_SECRET = 'secret'

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BloomreachOutboxProcessor,
        { provide: PrismaService, useValue: prismaMock },
        { provide: ThrowerErrorGuard, useValue: createMock<ThrowerErrorGuard>() },
      ],
    }).compile()

    processor = module.get<BloomreachOutboxProcessor>(BloomreachOutboxProcessor)

    // Default: no stale PROCESSING entries to recover
    prismaMock.bloomreachOutbox.findMany.mockResolvedValue([])
    // findSupersededEntriesAndMerge uses a transaction — pass prismaMock as the tx client
    // so findFirst/update mocks work inside the transaction
    prismaMock.$transaction.mockImplementation((fn: any) => fn(prismaMock))
  })

  afterEach(() => {
    jest.clearAllMocks()
    delete process.env.BLOOMREACH_INTEGRATION_STATE
  })

  describe('processOutbox', () => {
    it('should skip when integration is not active', async () => {
      process.env.BLOOMREACH_INTEGRATION_STATE = 'INACTIVE'

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
          commands: [{ name: entry.commandName, data: entry.commandData, command_id: 'entry-1' }],
        },
        expect.objectContaining({
          headers: expect.objectContaining({ Authorization: expect.stringContaining('Basic ') }),
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
          lastError: expect.stringContaining('500'),
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
          lastError: expect.any(String),
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
          lastError: expect.stringContaining('success=false'),
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
        data: expect.objectContaining({
          status: BloomreachOutboxStatus.PENDING,
        }),
      })
    })

    it('should process multiple entries in a single batch', async () => {
      const entries = [
        makeEntry({ id: 'entry-1' }),
        makeEntry({ id: 'entry-2', commandName: BloomreachCommandNameEnum.CUSTOMERS_EVENTS }),
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

      expect((mockedAxios.post.mock.calls[0][1] as any).commands).toHaveLength(2)
      expect(prismaMock.bloomreachOutbox.updateMany).toHaveBeenCalledWith({
        where: { id: { in: ['entry-1', 'entry-2'] } },
        data: { status: BloomreachOutboxStatus.COMPLETED },
      })
    })

    it('should mark reverted customers entry as SUPERSEDED and merge data into newer PENDING entry', async () => {
      const oldEntry = makeEntry({
        id: 'old-entry',
        commandData: {
          customer_ids: { city_account_id: 'cognito-1' },
          properties: { phone: '0900000000', email: 'old@example.com' },
        },
      })
      const newerPendingEntry = makeEntry({
        id: 'newer-entry',
        status: BloomreachOutboxStatus.PENDING,
        commandData: {
          customer_ids: { city_account_id: 'cognito-1' },
          properties: { email: 'new@example.com' },
        },
      })

      prismaMock.$queryRaw.mockResolvedValue([oldEntry])
      prismaMock.bloomreachOutbox.findFirst.mockResolvedValue(newerPendingEntry as any)
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
          },
        },
      })
    })

    it('should mark reverted event entry as SUPERSEDED without merge when newer PENDING exists', async () => {
      const oldEventEntry = makeEntry({
        id: 'old-event',
        commandName: BloomreachCommandNameEnum.CUSTOMERS_EVENTS,
        commandData: {
          customer_ids: { city_account_id: 'cognito-1' },
          event_type: BloomreachEventNameEnum.CONSENT,
          properties: {
            action: BloomreachConsentActionEnum.ACCEPT,
            category: BloomreachConsentCategoryEnum.ESBS_MARKETING,
            valid_until: 'unlimited',
          },
        },
      })
      const newerEventEntry = makeEntry({
        id: 'newer-event',
        commandName: BloomreachCommandNameEnum.CUSTOMERS_EVENTS,
        status: BloomreachOutboxStatus.PENDING,
        commandData: {
          customer_ids: { city_account_id: 'cognito-1' },
          event_type: BloomreachEventNameEnum.CONSENT,
          properties: {
            action: BloomreachConsentActionEnum.REJECT,
            category: BloomreachConsentCategoryEnum.ESBS_MARKETING,
            valid_until: 'unlimited',
          },
        },
      })

      prismaMock.$queryRaw.mockResolvedValue([oldEventEntry])
      prismaMock.bloomreachOutbox.findFirst.mockResolvedValue(newerEventEntry as any)
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
        expect.objectContaining({ where: { id: 'newer-event' } })
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
        },
      })
      const newerEntry = makeEntry({
        id: 'newer-1',
        status: BloomreachOutboxStatus.PENDING,
        commandData: {
          customer_ids: { city_account_id: 'cognito-1' },
          properties: { email: 'new@example.com' },
        },
      })
      prismaMock.bloomreachOutbox.findMany.mockResolvedValue([staleEntry])
      prismaMock.bloomreachOutbox.findFirst.mockResolvedValue(newerEntry as any)
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
          },
        },
      })
    })
  })
})

/* eslint-enable @typescript-eslint/no-explicit-any */
