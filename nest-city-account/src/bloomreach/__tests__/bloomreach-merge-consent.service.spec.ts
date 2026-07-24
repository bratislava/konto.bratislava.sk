import { createMock } from '@golevelup/ts-jest'
import { Test, TestingModule } from '@nestjs/testing'

import prismaMock from '../../../test/singleton'
import {
  BloomreachCommandName,
  BloomreachOutbox,
  BloomreachOutboxStatus,
  ConsentEnum,
} from '../../generated/prisma/client'
import { PrismaService } from '../../prisma/prisma.service'
import ThrowerErrorGuard from '../../utils/guards/errors.guard'
import { BloomreachExportService } from '../bloomreach-export.service'
import { BloomreachMergeConsentService } from '../bloomreach-merge-consent.service'
import { BloomreachOutboxWriterService } from '../bloomreach-outbox-writer.service'

describe('BloomreachMergeConsentService', () => {
  let service: BloomreachMergeConsentService
  let exportService: jest.Mocked<BloomreachExportService>
  let outboxWriter: jest.Mocked<BloomreachOutboxWriterService>

  const externalId = 'cognito-new'
  const contactId = 'contact-1'

  const makeEntry = (overrides: Partial<BloomreachOutbox> = {}): BloomreachOutbox => ({
    id: 'entry-1',
    createdAt: new Date('2026-03-26T12:00:00Z'),
    updatedAt: new Date('2026-03-26T12:00:00Z'),
    externalId,
    commandName: BloomreachCommandName.CUSTOMERS,
    commandData: {
      customer_ids: { city_account_id: externalId, contact_id: contactId },
      properties: { is_identity_verified: true },
      update_timestamp: 100,
    },
    status: BloomreachOutboxStatus.PROCESSING,
    attempts: 0,
    lastError: null,
    ...overrides,
  })

  const anonymizedProfile = {
    ids: { city_account_id: 'cognito-old', contact_id: contactId },
    properties: { is_identity_verified: false },
  }

  const consentEvents = [
    {
      type: 'consent',
      timestamp: 100,
      properties: { category: 'ESBS-MARKETING', action: 'accept', valid_until: 'unlimited' },
    },
    {
      type: 'consent',
      timestamp: 200,
      properties: { category: 'ESBS-GENERAL', action: 'reject', valid_until: 'unlimited' },
    },
  ]

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BloomreachMergeConsentService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: BloomreachExportService, useValue: createMock<BloomreachExportService>() },
        {
          provide: BloomreachOutboxWriterService,
          useValue: createMock<BloomreachOutboxWriterService>(),
        },
        { provide: ThrowerErrorGuard, useValue: createMock<ThrowerErrorGuard>() },
      ],
    }).compile()

    service = module.get<BloomreachMergeConsentService>(BloomreachMergeConsentService)
    exportService = module.get(BloomreachExportService)
    outboxWriter = module.get(BloomreachOutboxWriterService)

    // Default: no COMPLETED contact attachment, no anonymize in flight
    prismaMock.$queryRaw.mockResolvedValue([{ exists: false }])
    prismaMock.bloomreachOutbox.findFirst.mockResolvedValue(null)
    prismaMock.bloomreachOutbox.findMany.mockResolvedValue([])
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should skip event commands', async () => {
    const result = await service.ensureConsentsSurviveMerge(
      makeEntry({ commandName: BloomreachCommandName.CUSTOMERS_EVENTS })
    )

    expect(result).toBe(true)
    expect(exportService.fetchCustomer).not.toHaveBeenCalled()
  })

  it('should skip customer commands without contact_id', async () => {
    const result = await service.ensureConsentsSurviveMerge(
      makeEntry({
        commandData: {
          customer_ids: { city_account_id: externalId },
          properties: {},
          update_timestamp: 100,
        },
      })
    )

    expect(result).toBe(true)
    expect(exportService.fetchCustomer).not.toHaveBeenCalled()
  })

  it('should skip when the contact attachment was already delivered for the customer', async () => {
    prismaMock.$queryRaw.mockResolvedValue([{ exists: true }])

    const result = await service.ensureConsentsSurviveMerge(makeEntry())

    expect(result).toBe(true)
    expect(exportService.fetchCustomer).not.toHaveBeenCalled()
  })

  it('should skip when no Bloomreach profile carries the contact_id', async () => {
    exportService.fetchCustomer.mockResolvedValue(null)

    const result = await service.ensureConsentsSurviveMerge(makeEntry())

    expect(result).toBe(true)
    expect(outboxWriter.queueConsentEvents).not.toHaveBeenCalled()
  })

  it('should skip when the profile already carries the customer city_account_id', async () => {
    exportService.fetchCustomer.mockResolvedValue({
      ids: { city_account_id: ['cognito-old', externalId], contact_id: contactId },
      properties: { is_identity_verified: false },
    })

    const result = await service.ensureConsentsSurviveMerge(makeEntry())

    expect(result).toBe(true)
    expect(outboxWriter.queueConsentEvents).not.toHaveBeenCalled()
  })

  it('should skip when the profile is not anonymized and no anonymize is in flight', async () => {
    exportService.fetchCustomer.mockResolvedValue({
      ids: { city_account_id: 'cognito-old', contact_id: contactId },
      properties: { is_identity_verified: true },
    })

    const result = await service.ensureConsentsSurviveMerge(makeEntry())

    expect(result).toBe(true)
    expect(outboxWriter.queueConsentEvents).not.toHaveBeenCalled()
  })

  it('should not treat profiles of other backends without is_identity_verified as anonymized', async () => {
    exportService.fetchCustomer.mockResolvedValue({
      ids: { contact_id: contactId },
      properties: {},
    })

    const result = await service.ensureConsentsSurviveMerge(makeEntry())

    expect(result).toBe(true)
    expect(outboxWriter.queueConsentEvents).not.toHaveBeenCalled()
  })

  it('should queue latest consent state when the profile is anonymized in Bloomreach', async () => {
    exportService.fetchCustomer.mockResolvedValue(anonymizedProfile)
    exportService.fetchConsentEvents.mockResolvedValue(consentEvents)

    const result = await service.ensureConsentsSurviveMerge(makeEntry())

    expect(result).toBe(true)
    expect(exportService.fetchConsentEvents).toHaveBeenCalledWith({
      city_account_id: externalId,
    })
    expect(outboxWriter.queueConsentEvents).toHaveBeenCalledWith(
      [
        { consentType: ConsentEnum.MARKETING, isGranted: true, timestamp: 100 },
        { consentType: ConsentEnum.GENERAL, isGranted: false, timestamp: 200 },
      ],
      externalId
    )
  })

  it('should queue latest consent state when an anonymize command is in flight', async () => {
    exportService.fetchCustomer.mockResolvedValue({
      ids: { city_account_id: 'cognito-old', contact_id: contactId },
      properties: { is_identity_verified: true },
    })
    prismaMock.bloomreachOutbox.findFirst.mockResolvedValue(
      makeEntry({ externalId: 'cognito-old' })
    )
    exportService.fetchConsentEvents.mockResolvedValue(consentEvents)

    const result = await service.ensureConsentsSurviveMerge(makeEntry())

    expect(result).toBe(true)
    expect(prismaMock.bloomreachOutbox.findFirst).toHaveBeenCalledWith({
      where: expect.objectContaining({
        externalId: { in: ['cognito-old'] },
        AND: [
          { commandData: { path: ['properties', 'is_identity_verified'], equals: false } },
          { commandData: { path: ['update_timestamp'], lt: 100 } },
        ],
      }),
    })
    expect(outboxWriter.queueConsentEvents).toHaveBeenCalled()
  })

  it('should not queue anything when the customer has no consent events', async () => {
    exportService.fetchCustomer.mockResolvedValue(anonymizedProfile)
    exportService.fetchConsentEvents.mockResolvedValue([])

    const result = await service.ensureConsentsSurviveMerge(makeEntry())

    expect(result).toBe(true)
    expect(outboxWriter.queueConsentEvents).not.toHaveBeenCalled()
  })

  it('should return false when Bloomreach cannot be read', async () => {
    exportService.fetchCustomer.mockRejectedValue(new Error('Bloomreach down'))

    expect(await service.ensureConsentsSurviveMerge(makeEntry())).toBe(false)
  })

  it('should return false when the consent events cannot be queued', async () => {
    exportService.fetchCustomer.mockResolvedValue(anonymizedProfile)
    exportService.fetchConsentEvents.mockResolvedValue(consentEvents)
    outboxWriter.queueConsentEvents.mockRejectedValue(new Error('DB error'))

    expect(await service.ensureConsentsSurviveMerge(makeEntry())).toBe(false)
  })
})
