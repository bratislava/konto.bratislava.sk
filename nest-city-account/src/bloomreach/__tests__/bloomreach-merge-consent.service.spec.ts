import { createMock } from '@golevelup/ts-jest'
import { Test, TestingModule } from '@nestjs/testing'
import { BloomreachOutbox, BloomreachOutboxStatus, ConsentEnum } from '@prisma/client'

import prismaMock from '../../../test/singleton'
import { PrismaService } from '../../prisma/prisma.service'
import { BloomreachCommandNameEnum } from '../bloomreach.types'
import { BloomreachExportService } from '../bloomreach-export.service'
import { BloomreachMergeConsentService } from '../bloomreach-merge-consent.service'
import { BloomreachOutboxService } from '../bloomreach-outbox.service'

describe('BloomreachMergeConsentService', () => {
  let service: BloomreachMergeConsentService
  let exportService: jest.Mocked<BloomreachExportService>
  let outboxService: jest.Mocked<BloomreachOutboxService>

  const externalId = 'cognito-new'
  const contactId = 'contact-1'

  const makeEntry = (overrides: Partial<BloomreachOutbox> = {}): BloomreachOutbox => ({
    id: 'entry-1',
    createdAt: new Date('2026-03-26T12:00:00Z'),
    updatedAt: new Date('2026-03-26T12:00:00Z'),
    externalId,
    commandName: BloomreachCommandNameEnum.CUSTOMERS,
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
        { provide: BloomreachOutboxService, useValue: createMock<BloomreachOutboxService>() },
      ],
    }).compile()

    service = module.get<BloomreachMergeConsentService>(BloomreachMergeConsentService)
    exportService = module.get(BloomreachExportService)
    outboxService = module.get(BloomreachOutboxService)

    // Default: no COMPLETED contact attachment, no anonymize in flight
    prismaMock.$queryRaw.mockResolvedValue([{ exists: false }])
    prismaMock.bloomreachOutbox.findFirst.mockResolvedValue(null)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should skip event commands', async () => {
    await service.ensureConsentsSurviveMerge(
      makeEntry({ commandName: BloomreachCommandNameEnum.CUSTOMERS_EVENTS })
    )

    expect(exportService.exportCustomer).not.toHaveBeenCalled()
  })

  it('should skip customer commands without contact_id', async () => {
    await service.ensureConsentsSurviveMerge(
      makeEntry({
        commandData: {
          customer_ids: { city_account_id: externalId },
          properties: {},
          update_timestamp: 100,
        },
      })
    )

    expect(exportService.exportCustomer).not.toHaveBeenCalled()
  })

  it('should skip when a contact attachment was already delivered for the customer', async () => {
    prismaMock.$queryRaw.mockResolvedValue([{ exists: true }])

    await service.ensureConsentsSurviveMerge(makeEntry())

    expect(exportService.exportCustomer).not.toHaveBeenCalled()
  })

  it('should skip when no Bloomreach profile carries the contact_id', async () => {
    exportService.exportCustomer.mockResolvedValue(null)

    await service.ensureConsentsSurviveMerge(makeEntry())

    expect(outboxService.queueConsentEvents).not.toHaveBeenCalled()
  })

  it('should skip when the profile already carries the customer city_account_id', async () => {
    exportService.exportCustomer.mockResolvedValue({
      ids: { city_account_id: ['cognito-old', externalId], contact_id: contactId },
      properties: { is_identity_verified: false },
    })

    await service.ensureConsentsSurviveMerge(makeEntry())

    expect(outboxService.queueConsentEvents).not.toHaveBeenCalled()
  })

  it('should skip when the profile is not anonymized and no anonymize is in flight', async () => {
    exportService.exportCustomer.mockResolvedValue({
      ids: { city_account_id: 'cognito-old', contact_id: contactId },
      properties: { is_identity_verified: true },
    })

    await service.ensureConsentsSurviveMerge(makeEntry())

    expect(outboxService.queueConsentEvents).not.toHaveBeenCalled()
  })

  it('should not treat profiles of other backends without is_identity_verified as anonymized', async () => {
    exportService.exportCustomer.mockResolvedValue({
      ids: { contact_id: contactId },
      properties: {},
    })

    await service.ensureConsentsSurviveMerge(makeEntry())

    expect(outboxService.queueConsentEvents).not.toHaveBeenCalled()
  })

  it('should queue latest consent state when the profile is anonymized in Bloomreach', async () => {
    exportService.exportCustomer.mockResolvedValue(anonymizedProfile)
    exportService.exportConsentEvents.mockResolvedValue(consentEvents)

    await service.ensureConsentsSurviveMerge(makeEntry())

    expect(exportService.exportConsentEvents).toHaveBeenCalledWith({
      city_account_id: externalId,
    })
    expect(outboxService.queueConsentEvents).toHaveBeenCalledWith(
      [
        { consentType: ConsentEnum.MARKETING, isGranted: true },
        { consentType: ConsentEnum.GENERAL, isGranted: false },
      ],
      externalId
    )
  })

  it('should queue latest consent state when an anonymize command is in flight', async () => {
    exportService.exportCustomer.mockResolvedValue({
      ids: { city_account_id: 'cognito-old', contact_id: contactId },
      properties: { is_identity_verified: true },
    })
    prismaMock.bloomreachOutbox.findFirst.mockResolvedValue(
      makeEntry({ externalId: 'cognito-old' })
    )
    exportService.exportConsentEvents.mockResolvedValue(consentEvents)

    await service.ensureConsentsSurviveMerge(makeEntry())

    expect(prismaMock.bloomreachOutbox.findFirst).toHaveBeenCalledWith({
      where: expect.objectContaining({
        externalId: { in: ['cognito-old'] },
        commandData: { path: ['properties', 'is_identity_verified'], equals: false },
      }),
    })
    expect(outboxService.queueConsentEvents).toHaveBeenCalled()
  })

  it('should not queue anything when the customer has no consent events', async () => {
    exportService.exportCustomer.mockResolvedValue(anonymizedProfile)
    exportService.exportConsentEvents.mockResolvedValue([])

    await service.ensureConsentsSurviveMerge(makeEntry())

    expect(outboxService.queueConsentEvents).not.toHaveBeenCalled()
  })

  it('should propagate export failures', async () => {
    exportService.exportCustomer.mockRejectedValue(new Error('Bloomreach down'))

    await expect(service.ensureConsentsSurviveMerge(makeEntry())).rejects.toThrow('Bloomreach down')
  })

  it('should propagate consent queueing failures', async () => {
    exportService.exportCustomer.mockResolvedValue(anonymizedProfile)
    exportService.exportConsentEvents.mockResolvedValue(consentEvents)
    outboxService.queueConsentEvents.mockRejectedValue(new Error('DB error'))

    await expect(service.ensureConsentsSurviveMerge(makeEntry())).rejects.toThrow('DB error')
  })
})
