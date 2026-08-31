import { createMock } from '@golevelup/ts-jest'
import { Test, TestingModule } from '@nestjs/testing'

import prismaMock from '../../../test/singleton'
import { expectObjectContaining } from '../../__tests__/jest-matchers'
import {
  BloomreachCommandName,
  BloomreachOutbox,
  BloomreachOutboxStatus,
  ConsentEnum,
} from '../../generated/prisma/client'
import { PrismaService } from '../../prisma/prisma.service'
import ThrowerErrorGuard from '../../utils/guards/errors.guard'
import * as bloomreachTypes from '../bloomreach.types'
import {
  BloomreachCommandDataKind,
  BloomreachConsentActionEnum,
  BloomreachEventNameEnum,
} from '../bloomreach.types'
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
      kind: BloomreachCommandDataKind.CUSTOMER,
      customer_ids: { city_account_id: externalId, contact_id: contactId },
      properties: { is_identity_verified: true },
      update_timestamp: 100,
    },
    status: BloomreachOutboxStatus.PROCESSING,
    attempts: 0,
    lastError: null,
    isTerminal: false,
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
    prismaMock.bloomreachOutbox.findFirst.mockResolvedValue(null)
    prismaMock.bloomreachOutbox.findMany.mockResolvedValue([])
    prismaMock.$queryRaw.mockResolvedValue([])
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should skip event commands', async () => {
    const isBloomreachCustomerDataSpy = jest.spyOn(bloomreachTypes, 'isBloomreachCustomerData')

    const result = await service.ensureConsentsSurviveMerge(
      makeEntry({ commandName: BloomreachCommandName.CUSTOMERS_EVENTS })
    )

    expect(result).toBe(true)
    expect(exportService.fetchCustomer).not.toHaveBeenCalled()
    expect(isBloomreachCustomerDataSpy).not.toHaveBeenCalled()
  })

  it('should skip when the command itself de-verifies the account', async () => {
    const result = await service.ensureConsentsSurviveMerge(
      makeEntry({
        commandData: {
          kind: BloomreachCommandDataKind.CUSTOMER,
          customer_ids: { city_account_id: externalId, contact_id: contactId },
          properties: { is_identity_verified: false },
          update_timestamp: 100,
        },
      })
    )

    expect(result).toBe(true)
    expect(exportService.fetchCustomer).not.toHaveBeenCalled()
    // couldCauseMerge is the only thing that queries findFirst before this point
    expect(prismaMock.bloomreachOutbox.findFirst).not.toHaveBeenCalled()
  })

  it('should skip customer commands without contact_id', async () => {
    const result = await service.ensureConsentsSurviveMerge(
      makeEntry({
        commandData: {
          kind: BloomreachCommandDataKind.CUSTOMER,
          customer_ids: { city_account_id: externalId },
          properties: {},
          update_timestamp: 100,
        },
      })
    )

    expect(result).toBe(true)
    expect(exportService.fetchCustomer).not.toHaveBeenCalled()
    expect(prismaMock.bloomreachOutbox.findFirst).not.toHaveBeenCalled()
  })

  it('should skip when the contact attachment was already delivered for the customer', async () => {
    prismaMock.bloomreachOutbox.findFirst.mockResolvedValue(
      makeEntry({ status: BloomreachOutboxStatus.COMPLETED })
    )

    const result = await service.ensureConsentsSurviveMerge(makeEntry())

    expect(result).toBe(true)
    expect(exportService.fetchCustomer).not.toHaveBeenCalled()
    expect(prismaMock.bloomreachOutbox.findFirst).toHaveBeenCalledTimes(1)
  })

  it('should skip when a separate anonymize command is racing for this same externalId', async () => {
    prismaMock.bloomreachOutbox.findFirst.mockResolvedValueOnce(null).mockResolvedValueOnce(
      makeEntry({
        id: 'other-entry',
        status: BloomreachOutboxStatus.PENDING,
        commandData: {
          kind: BloomreachCommandDataKind.CUSTOMER,
          customer_ids: { city_account_id: externalId },
          properties: { is_identity_verified: false },
          update_timestamp: 150,
        },
      })
    )

    const result = await service.ensureConsentsSurviveMerge(makeEntry())

    expect(result).toBe(true)
    expect(prismaMock.bloomreachOutbox.findFirst).toHaveBeenNthCalledWith(2, {
      where: expectObjectContaining({
        id: { not: 'entry-1' },
        externalId,
        commandData: { path: ['properties', 'is_identity_verified'], equals: false },
      }),
      select: { id: true },
    })
    expect(exportService.fetchCustomer).not.toHaveBeenCalled()
    expect(outboxWriter.queueConsentEvents).not.toHaveBeenCalled()
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

  it('should queue consent state anchored to now when the export already confirms anonymization, skipping the in-flight lookup entirely', async () => {
    exportService.fetchCustomer.mockResolvedValue(anonymizedProfile)
    exportService.fetchConsentEvents.mockResolvedValue(consentEvents)

    const before = Date.now() / 1000
    const result = await service.ensureConsentsSurviveMerge(makeEntry())
    const after = Date.now() / 1000

    expect(result).toBe(true)
    expect(exportService.fetchConsentEvents).toHaveBeenCalledWith({
      city_account_id: externalId,
    })
    // The export already proves anonymization, so findPossiblyUnmergedCityAccountIds
    // and findAnonymizeInFlightTimestamp must never run
    expect(prismaMock.bloomreachOutbox.findMany).toHaveBeenCalledTimes(1)
    expect(prismaMock.$queryRaw).not.toHaveBeenCalled()
    expect(outboxWriter.queueConsentEvents).toHaveBeenCalledTimes(1)
    const [queuedConsents, queuedExternalId] = outboxWriter.queueConsentEvents.mock.calls[0]
    expect(queuedExternalId).toBe(externalId)
    // Both original timestamps (100, 200) are older than "now", so both get
    // raised to the same now-anchored floor rather than kept as-is.
    for (const consent of queuedConsents) {
      expect(consent.timestamp).toBeGreaterThanOrEqual(before + 10)
      expect(consent.timestamp).toBeLessThanOrEqual(after + 10)
    }
    expect(queuedConsents).toEqual([
      {
        consentType: ConsentEnum.MARKETING,
        isGranted: true,
        timestamp: queuedConsents[0].timestamp,
      },
      {
        consentType: ConsentEnum.GENERAL,
        isGranted: false,
        timestamp: queuedConsents[1].timestamp,
      },
    ])
  })

  it('should anchor consent timestamps to the in-flight anonymize command, only raising ones that would otherwise lose', async () => {
    exportService.fetchCustomer.mockResolvedValue({
      ids: { city_account_id: 'cognito-old', contact_id: contactId },
      properties: { is_identity_verified: true },
    })
    // couldCauseMerge's own-account dedup check - no match, not yet delivered.
    prismaMock.bloomreachOutbox.findFirst.mockResolvedValue(null)
    // findPossiblyUnmergedCityAccountIds - no linked accounts.
    prismaMock.bloomreachOutbox.findMany.mockResolvedValueOnce([])
    // findAnonymizeInFlightTimestamp's raw ORDER BY query, returning
    // update_timestamp: 100 for the sibling account.
    prismaMock.$queryRaw.mockResolvedValueOnce([{ updateTimestamp: 100 }])
    exportService.fetchConsentEvents.mockResolvedValue(consentEvents)

    const result = await service.ensureConsentsSurviveMerge(makeEntry())

    expect(result).toBe(true)
    expect(prismaMock.$queryRaw).toHaveBeenCalledTimes(1)
    expect(outboxWriter.queueConsentEvents).toHaveBeenCalledWith(
      [
        { consentType: ConsentEnum.MARKETING, isGranted: true, timestamp: 110 },
        { consentType: ConsentEnum.GENERAL, isGranted: false, timestamp: 200 },
      ],
      externalId
    )
  })

  it('should prefer a locally-pending consent over a stale export value for the same category', async () => {
    exportService.fetchCustomer.mockResolvedValue({
      ids: { city_account_id: 'cognito-old', contact_id: contactId },
      properties: { is_identity_verified: true },
    })
    prismaMock.bloomreachOutbox.findFirst.mockResolvedValue(null)
    // First findMany is findPossiblyUnmergedCityAccountIds (no linked
    // accounts); second is findPendingConsents, returning a genuine local
    // MARKETING reject the BR hasn't caught up to yet.
    prismaMock.bloomreachOutbox.findMany.mockResolvedValueOnce([]).mockResolvedValueOnce([
      makeEntry({
        commandName: BloomreachCommandName.CUSTOMERS_EVENTS,
        status: BloomreachOutboxStatus.PENDING,
        commandData: {
          kind: BloomreachCommandDataKind.EVENT,
          customer_ids: { city_account_id: externalId },
          properties: {
            action: BloomreachConsentActionEnum.REJECT,
            category: 'ESBS-MARKETING',
            valid_until: 'unlimited',
          },
          event_type: BloomreachEventNameEnum.CONSENT,
          timestamp: 500,
        },
      }),
    ])
    prismaMock.$queryRaw.mockResolvedValueOnce([{ updateTimestamp: 100 }])
    // Export still shows the stale, pre-rejection MARKETING accept from 100.
    exportService.fetchConsentEvents.mockResolvedValue(consentEvents)

    const result = await service.ensureConsentsSurviveMerge(makeEntry())

    expect(result).toBe(true)
    expect(outboxWriter.queueConsentEvents).toHaveBeenCalledWith(
      [
        { consentType: ConsentEnum.MARKETING, isGranted: false, timestamp: 500 },
        { consentType: ConsentEnum.GENERAL, isGranted: false, timestamp: 200 },
      ],
      externalId
    )
  })

  it('should pass every linked city_account_id and the pre-merge timestamp to the anonymize-timestamp query', async () => {
    exportService.fetchCustomer.mockResolvedValue({
      ids: { city_account_id: 'cognito-old', contact_id: contactId },
      properties: { is_identity_verified: true },
    })
    prismaMock.bloomreachOutbox.findFirst.mockResolvedValue(null)
    prismaMock.bloomreachOutbox.findMany.mockResolvedValueOnce([
      makeEntry({ externalId: 'cognito-older' }),
    ])
    // findPossiblyUnmergedCityAccountIds
    prismaMock.$queryRaw.mockResolvedValueOnce([{ updateTimestamp: 90 }])
    exportService.fetchConsentEvents.mockResolvedValue(consentEvents)

    await service.ensureConsentsSurviveMerge(makeEntry())

    const rawQueryArgs = prismaMock.$queryRaw.mock.calls[0]
    expect(rawQueryArgs).toContainEqual(['cognito-old', 'cognito-older'])
    expect(rawQueryArgs).toContain(100)

    expect(outboxWriter.queueConsentEvents).toHaveBeenCalledWith(
      [
        { consentType: ConsentEnum.MARKETING, isGranted: true, timestamp: 100 },
        { consentType: ConsentEnum.GENERAL, isGranted: false, timestamp: 200 },
      ],
      externalId
    )
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
