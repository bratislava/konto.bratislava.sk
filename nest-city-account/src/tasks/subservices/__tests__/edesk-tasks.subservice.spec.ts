import { createMock } from '@golevelup/ts-vitest'
import { Test, TestingModule } from '@nestjs/testing'

import prismaMock from '../../../../test/singleton'
import { expectArrayContaining, expectObjectContaining } from '../../../__tests__/jest-matchers'
import {
  ExternalEdeskCheck,
  PhysicalEntity,
  QueueItemStatusEnum,
} from '../../../generated/prisma/client'
import { NorisEdeskService } from '../../../noris/services/noris-edesk.service'
import { PrismaService } from '../../../prisma/prisma.service'
import { UpvsQueueService } from '../../../upvs-queue/upvs-queue.service'
import ThrowerErrorGuard from '../../../utils/guards/errors.guard'
import { EdeskTasksSubservice } from '../edesk-tasks.subservice'

const EXTERNAL_ITEMS_PROCESS_BATCH_SIZE = 500

const createMockCompletedItem = (
  overrides: Partial<ExternalEdeskCheck> = {}
): ExternalEdeskCheck => {
  return {
    id: 'check-1',
    uri: 'rc://sk/123',
    norisId: 1,
    queueStatus: QueueItemStatusEnum.COMPLETED,
    processedAt: new Date('2024-01-01T00:00:00.000Z'),
    createdAt: new Date(),
    updatedAt: new Date(),
    upvsStatus: null,
    edeskStatus: 'active',
    edeskNumber: '12345',
    edeskDeathDate: null,
    failCount: 0,
    newUri: null,
    ...overrides,
  }
}

describe('EdeskTasksSubservice', () => {
  let service: EdeskTasksSubservice
  let upvsQueueService: UpvsQueueService
  let norisEdeskService: NorisEdeskService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EdeskTasksSubservice,
        { provide: PrismaService, useValue: prismaMock },
        { provide: UpvsQueueService, useValue: createMock<UpvsQueueService>() },
        { provide: NorisEdeskService, useValue: createMock<NorisEdeskService>() },
        { provide: ThrowerErrorGuard, useValue: createMock<ThrowerErrorGuard>() },
      ],
    }).compile()

    service = module.get<EdeskTasksSubservice>(EdeskTasksSubservice)
    upvsQueueService = module.get<UpvsQueueService>(UpvsQueueService)
    norisEdeskService = module.get<NorisEdeskService>(NorisEdeskService)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('updateEdesk', () => {
    it('should delegate to UpvsQueueService.processBatch', async () => {
      const processBatchSpy = vi.mocked(upvsQueueService.processBatch)

      await service.updateEdesk()

      expect(processBatchSpy).toHaveBeenCalledTimes(1)
    })
  })

  describe('alertFailingEdeskUpdate', () => {
    it('should log error for entities that failed 7 or more times', async () => {
      const mockFailedEntities: Pick<
        PhysicalEntity,
        'id' | 'birthNumber' | 'activeEdeskUpdateFailCount'
      >[] = [
        {
          id: '1',
          birthNumber: '1234567890',
          activeEdeskUpdateFailCount: 7,
        },
        {
          id: '2',
          birthNumber: '0987654321',
          activeEdeskUpdateFailCount: 10,
        },
      ]

      prismaMock.physicalEntity.findMany.mockResolvedValue(mockFailedEntities as PhysicalEntity[])

      await service.alertFailingEdeskUpdate()

      expect(prismaMock.physicalEntity.findMany).toHaveBeenCalledWith({
        where: { activeEdeskUpdateFailCount: { gte: 7 } },
        select: {
          id: true,
          birthNumber: true,
          activeEdeskUpdateFailCount: true,
        },
      })
    })

    it('should not log anything if there are no failing entities', async () => {
      prismaMock.physicalEntity.findMany.mockResolvedValue([])

      await service.alertFailingEdeskUpdate()

      expect(prismaMock.physicalEntity.findMany).toHaveBeenCalled()
    })
  })

  describe('updateEdeskInNoris', () => {
    it('should call retrieveNewRecordsFromNorisToUpdate when queue is empty (numberOfExternalItemsInQueue === 0)', async () => {
      const getNumberOfPendingExternalItemsInQueueSpy = vi
        .mocked(upvsQueueService.getNumberOfPendingExternalItemsInQueue)
        .mockResolvedValue(0)
      const retrieveNewRecordsSpy = vi
        .spyOn(service, 'retrieveNewRecordsFromNorisToUpdate')
        .mockResolvedValue(undefined)
      vi.mocked(upvsQueueService.retrieveCompletedAndFailedExternalItems).mockResolvedValue([])
      const updateEdeskChecksSpy = vi.mocked(norisEdeskService.updateEdeskChecks)

      await service.updateEdeskInNoris()

      expect(getNumberOfPendingExternalItemsInQueueSpy).toHaveBeenCalledTimes(1)
      expect(retrieveNewRecordsSpy).toHaveBeenCalledTimes(1)
      expect(updateEdeskChecksSpy).not.toHaveBeenCalled()
    })

    it('should not call retrieveNewRecordsFromNorisToUpdate when queue has items (numberOfExternalItemsInQueue !== 0)', async () => {
      vi.mocked(upvsQueueService.getNumberOfPendingExternalItemsInQueue).mockResolvedValue(100)
      const retrieveNewRecordsSpy = vi
        .spyOn(service, 'retrieveNewRecordsFromNorisToUpdate')
        .mockResolvedValue(undefined)
      vi.mocked(upvsQueueService.retrieveCompletedAndFailedExternalItems).mockResolvedValue([])

      await service.updateEdeskInNoris()

      expect(retrieveNewRecordsSpy).not.toHaveBeenCalled()
    })

    it('should return early when completedExternalItems.length === 0 (norisEdeskService.updateEdeskChecks and deleteMany not called)', async () => {
      vi.mocked(upvsQueueService.getNumberOfPendingExternalItemsInQueue).mockResolvedValue(0)
      vi.spyOn(service, 'retrieveNewRecordsFromNorisToUpdate').mockResolvedValue(undefined)
      vi.mocked(upvsQueueService.retrieveCompletedAndFailedExternalItems).mockResolvedValue([])

      const updateEdeskChecksSpy = vi.mocked(norisEdeskService.updateEdeskChecks)
      const deleteManySpy = vi.mocked(prismaMock.externalEdeskCheck.deleteMany)

      await service.updateEdeskInNoris()

      expect(updateEdeskChecksSpy).not.toHaveBeenCalled()
      expect(deleteManySpy).not.toHaveBeenCalled()
    })

    it('should return early when completedExternalItems.length < batch size AND numberOfExternalItemsInQueue !== 0', async () => {
      const completedCount = EXTERNAL_ITEMS_PROCESS_BATCH_SIZE - 1
      const itemsInQueue = 50
      vi.mocked(upvsQueueService.getNumberOfPendingExternalItemsInQueue).mockResolvedValue(
        itemsInQueue
      )
      vi.spyOn(service, 'retrieveNewRecordsFromNorisToUpdate').mockResolvedValue(undefined)
      vi.mocked(upvsQueueService.retrieveCompletedAndFailedExternalItems).mockResolvedValue(
        Array.from({ length: completedCount }, (_, i) =>
          createMockCompletedItem({ id: `id-${i}`, norisId: i })
        )
      )

      const updateEdeskChecksSpy = vi.mocked(norisEdeskService.updateEdeskChecks)
      const deleteManySpy = vi.mocked(prismaMock.externalEdeskCheck.deleteMany)

      await service.updateEdeskInNoris()

      expect(updateEdeskChecksSpy).not.toHaveBeenCalled()
      expect(deleteManySpy).not.toHaveBeenCalled()
    })

    it('should not return early when completedExternalItems.length >= batch size (full batch); should call updateEdeskChecks and deleteMany', async () => {
      const fullBatch = Array.from({ length: EXTERNAL_ITEMS_PROCESS_BATCH_SIZE }, (_, i) =>
        createMockCompletedItem({ id: `id-${i}`, norisId: i })
      )
      vi.mocked(upvsQueueService.getNumberOfPendingExternalItemsInQueue).mockResolvedValue(100)
      const retrieveNewRecordsFromNorisToUpdateSpy = vi
        .spyOn(service, 'retrieveNewRecordsFromNorisToUpdate')
        .mockResolvedValue(undefined)
      vi.mocked(upvsQueueService.retrieveCompletedAndFailedExternalItems).mockResolvedValue(
        fullBatch
      )

      const updateEdeskChecksSpy = vi
        .mocked(norisEdeskService.updateEdeskChecks)
        .mockResolvedValue(undefined)
      prismaMock.externalEdeskCheck.deleteMany.mockResolvedValue({ count: fullBatch.length })

      await service.updateEdeskInNoris()

      expect(updateEdeskChecksSpy).toHaveBeenCalledTimes(1)
      expect(prismaMock.externalEdeskCheck.deleteMany).toHaveBeenCalledWith({
        where: { id: { in: fullBatch.map((item) => item.id) } },
      })
      expect(retrieveNewRecordsFromNorisToUpdateSpy).not.toHaveBeenCalled()
    })

    it('should not return early when completedExternalItems.length < batch size AND numberOfExternalItemsInQueue === 0; should call updateEdeskChecks and deleteMany', async () => {
      const partialBatch = [
        createMockCompletedItem({ id: 'id-1', norisId: 1 }),
        createMockCompletedItem({ id: 'id-2', norisId: 2 }),
      ]
      vi.mocked(upvsQueueService.getNumberOfPendingExternalItemsInQueue).mockResolvedValue(0)
      const retrieveNewRecordsFromNorisToUpdateSpy = vi
        .spyOn(service, 'retrieveNewRecordsFromNorisToUpdate')
        .mockResolvedValue(undefined)
      vi.mocked(upvsQueueService.retrieveCompletedAndFailedExternalItems).mockResolvedValue(
        partialBatch
      )

      const updateEdeskChecksSpy = vi
        .mocked(norisEdeskService.updateEdeskChecks)
        .mockResolvedValue(undefined)
      prismaMock.externalEdeskCheck.deleteMany.mockResolvedValue({ count: partialBatch.length })

      await service.updateEdeskInNoris()

      expect(updateEdeskChecksSpy).toHaveBeenCalledTimes(1)
      expect(prismaMock.externalEdeskCheck.deleteMany).toHaveBeenCalledWith({
        where: { id: { in: ['id-1', 'id-2'] } },
      })
      expect(retrieveNewRecordsFromNorisToUpdateSpy).toHaveBeenCalled()
    })

    it('should call retrieveNewRecordsFromNorisToUpdateSpy after updateEdeskChecks and deleteMany', async () => {
      const partialBatch = [
        createMockCompletedItem({ id: 'id-1', norisId: 1 }),
        createMockCompletedItem({ id: 'id-2', norisId: 2 }),
      ]
      vi.mocked(upvsQueueService.getNumberOfPendingExternalItemsInQueue).mockResolvedValue(0)
      const retrieveNewRecordsFromNorisToUpdateSpy = vi
        .spyOn(service, 'retrieveNewRecordsFromNorisToUpdate')
        .mockResolvedValue(undefined)
      vi.mocked(upvsQueueService.retrieveCompletedAndFailedExternalItems).mockResolvedValue(
        partialBatch
      )

      const updateEdeskChecksSpy = vi
        .mocked(norisEdeskService.updateEdeskChecks)
        .mockResolvedValue(undefined)
      prismaMock.externalEdeskCheck.deleteMany.mockResolvedValue({ count: partialBatch.length })

      await service.updateEdeskInNoris()

      const deleteManyOrder = prismaMock.externalEdeskCheck.deleteMany.mock.invocationCallOrder[0]
      const updateEdeskChecksOrder = updateEdeskChecksSpy.mock.invocationCallOrder[0]
      const retrieveNewRecordsFromNorisToUpdateOrder =
        retrieveNewRecordsFromNorisToUpdateSpy.mock.invocationCallOrder[0]

      expect(updateEdeskChecksOrder).toBeLessThan(deleteManyOrder)
      expect(deleteManyOrder).toBeLessThan(retrieveNewRecordsFromNorisToUpdateOrder)
    })

    it('should return early when exactly one completed item but queue has items (length 1 < 500 and queue !== 0)', async () => {
      vi.mocked(upvsQueueService.getNumberOfPendingExternalItemsInQueue).mockResolvedValue(1)
      vi.spyOn(service, 'retrieveNewRecordsFromNorisToUpdate').mockResolvedValue(undefined)
      vi.mocked(upvsQueueService.retrieveCompletedAndFailedExternalItems).mockResolvedValue([
        createMockCompletedItem(),
      ])

      const updateEdeskChecksSpy = vi.mocked(norisEdeskService.updateEdeskChecks)
      const deleteManySpy = vi.spyOn(prismaMock.externalEdeskCheck, 'deleteMany')

      await service.updateEdeskInNoris()

      expect(updateEdeskChecksSpy).not.toHaveBeenCalled()
      expect(deleteManySpy).not.toHaveBeenCalled()
    })

    it('should call retrieveCompletedAndFailedExternalItems with EXTERNAL_ITEMS_PROCESS_BATCH_SIZE', async () => {
      vi.mocked(upvsQueueService.getNumberOfPendingExternalItemsInQueue).mockResolvedValue(0)
      vi.spyOn(service, 'retrieveNewRecordsFromNorisToUpdate').mockResolvedValue(undefined)
      const retrieveProcessedSpy = vi
        .mocked(upvsQueueService.retrieveCompletedAndFailedExternalItems)
        .mockResolvedValue([])

      await service.updateEdeskInNoris()

      expect(retrieveProcessedSpy).toHaveBeenCalledWith(EXTERNAL_ITEMS_PROCESS_BATCH_SIZE)
    })

    it('should send FAILED items to Noris with NONEXISTENT status', async () => {
      const failedItem: ExternalEdeskCheck = {
        id: 'failed-1',
        uri: 'rc://sk/failed',
        norisId: 99,
        queueStatus: QueueItemStatusEnum.FAILED,
        processedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        upvsStatus: null,
        edeskStatus: null,
        edeskNumber: null,
        edeskDeathDate: null,
        failCount: 3,
        newUri: null,
      }

      vi.mocked(upvsQueueService.getNumberOfPendingExternalItemsInQueue).mockResolvedValue(0)
      vi.spyOn(service, 'retrieveNewRecordsFromNorisToUpdate').mockResolvedValue(undefined)
      vi.mocked(upvsQueueService.retrieveCompletedAndFailedExternalItems).mockResolvedValue([
        failedItem,
      ])

      const updateEdeskChecksSpy = vi
        .mocked(norisEdeskService.updateEdeskChecks)
        .mockResolvedValue(undefined)
      prismaMock.externalEdeskCheck.deleteMany.mockResolvedValue({ count: 1 })

      await service.updateEdeskInNoris()

      expect(updateEdeskChecksSpy).toHaveBeenCalledWith(
        expectArrayContaining([
          expectObjectContaining({
            idNoris: 99,
            edeskStatus: 'NONEXISTENT',
            edeskNumber: null,
            uri: null,
            deathDate: null,
          }),
        ])
      )
    })

    it('should pass edeskDeathDate as deathDate for completed items', async () => {
      const deathDate = '2023-06-15'
      const completedItem = createMockCompletedItem({
        id: 'id-1',
        norisId: 1,
        edeskDeathDate: deathDate,
      })

      vi.mocked(upvsQueueService.getNumberOfPendingExternalItemsInQueue).mockResolvedValue(0)
      vi.spyOn(service, 'retrieveNewRecordsFromNorisToUpdate').mockResolvedValue(undefined)
      vi.mocked(upvsQueueService.retrieveCompletedAndFailedExternalItems).mockResolvedValue([
        completedItem,
      ])

      const updateEdeskChecksSpy = vi
        .mocked(norisEdeskService.updateEdeskChecks)
        .mockResolvedValue(undefined)
      prismaMock.externalEdeskCheck.deleteMany.mockResolvedValue({ count: 1 })

      await service.updateEdeskInNoris()

      expect(updateEdeskChecksSpy).toHaveBeenCalledWith(
        expectArrayContaining([
          expectObjectContaining({
            idNoris: 1,
            deathDate,
          }),
        ])
      )
    })

    it('should pass null as deathDate for completed items without a death date', async () => {
      const completedItem = createMockCompletedItem({
        id: 'id-1',
        norisId: 1,
        edeskDeathDate: null,
      })

      vi.mocked(upvsQueueService.getNumberOfPendingExternalItemsInQueue).mockResolvedValue(0)
      vi.spyOn(service, 'retrieveNewRecordsFromNorisToUpdate').mockResolvedValue(undefined)
      vi.mocked(upvsQueueService.retrieveCompletedAndFailedExternalItems).mockResolvedValue([
        completedItem,
      ])

      const updateEdeskChecksSpy = vi
        .mocked(norisEdeskService.updateEdeskChecks)
        .mockResolvedValue(undefined)
      prismaMock.externalEdeskCheck.deleteMany.mockResolvedValue({ count: 1 })

      await service.updateEdeskInNoris()

      expect(updateEdeskChecksSpy).toHaveBeenCalledWith(
        expectArrayContaining([
          expectObjectContaining({
            idNoris: 1,
            deathDate: null,
          }),
        ])
      )
    })
  })
})
