/* eslint-disable @typescript-eslint/no-explicit-any */
import { Test, TestingModule } from '@nestjs/testing'
import { createMock } from '@golevelup/ts-jest'
import { BloomreachOutbox, BloomreachOutboxStatus } from '@prisma/client'
import axios from 'axios'
import { PrismaService } from '../../prisma/prisma.service'
import ThrowerErrorGuard from '../../utils/guards/errors.guard'
import prismaMock from '../../../test/singleton'
import { BloomreachOutboxProcessor } from '../bloomreach-outbox.processor'
import { BloomreachCommandNameEnum } from '../bloomreach.types'

jest.mock('axios')
const mockedAxios = axios as jest.Mocked<typeof axios>

describe('BloomreachOutboxProcessor', () => {
  let processor: BloomreachOutboxProcessor

  const now = new Date('2026-03-26T12:00:00Z')

  const makeEntry = (overrides: Partial<BloomreachOutbox> = {}): BloomreachOutbox => ({
    id: 'entry-1',
    createdAt: now,
    updatedAt: now,
    cognitoId: 'cognito-1',
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
      prismaMock.bloomreachOutbox.updateMany.mockResolvedValue({ count: 0 })
      prismaMock.$queryRaw.mockResolvedValue([])

      await processor.processOutbox()

      expect(mockedAxios.post).not.toHaveBeenCalled()
    })

    it('should send batch and mark entries as COMPLETED on success', async () => {
      const entry = makeEntry()
      prismaMock.bloomreachOutbox.updateMany.mockResolvedValue({ count: 0 })
      prismaMock.$queryRaw.mockResolvedValue([entry])
      mockedAxios.post.mockResolvedValue({ data: { success: true } })

      await processor.processOutbox()

      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://api.bloomreach.test/track/v2/projects/test-project/batch',
        { commands: [{ name: entry.commandName, data: entry.commandData }] },
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
      prismaMock.bloomreachOutbox.updateMany.mockResolvedValue({ count: 0 })
      prismaMock.$queryRaw.mockResolvedValue([entry])
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
      prismaMock.bloomreachOutbox.updateMany.mockResolvedValue({ count: 0 })
      prismaMock.$queryRaw.mockResolvedValue([entry])
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

    it('should fail when API returns success=false', async () => {
      const entry = makeEntry()
      prismaMock.bloomreachOutbox.updateMany.mockResolvedValue({ count: 0 })
      prismaMock.$queryRaw.mockResolvedValue([entry])
      mockedAxios.post.mockResolvedValue({ data: { success: false } })

      await processor.processOutbox()

      expect(prismaMock.bloomreachOutbox.update).toHaveBeenCalledWith({
        where: { id: 'entry-1' },
        data: expect.objectContaining({
          status: BloomreachOutboxStatus.PENDING,
          lastError: expect.stringContaining('success=false'),
        }),
      })
    })

    it('should process multiple entries in a single batch', async () => {
      const entries = [
        makeEntry({ id: 'entry-1' }),
        makeEntry({ id: 'entry-2', commandName: BloomreachCommandNameEnum.CUSTOMERS_EVENTS }),
      ]
      prismaMock.bloomreachOutbox.updateMany.mockResolvedValue({ count: 0 })
      prismaMock.$queryRaw.mockResolvedValue(entries)
      mockedAxios.post.mockResolvedValue({ data: { success: true } })

      await processor.processOutbox()

      expect((mockedAxios.post.mock.calls[0][1] as any).commands).toHaveLength(2)
      expect(prismaMock.bloomreachOutbox.updateMany).toHaveBeenCalledWith({
        where: { id: { in: ['entry-1', 'entry-2'] } },
        data: { status: BloomreachOutboxStatus.COMPLETED },
      })
    })
  })
})

/* eslint-enable @typescript-eslint/no-explicit-any */
