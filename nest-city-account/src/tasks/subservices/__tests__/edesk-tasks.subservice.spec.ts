import { createMock } from '@golevelup/ts-jest'
import { Test, TestingModule } from '@nestjs/testing'
import { ExternalEdeskCheck, PhysicalEntity, QueueItemStatusEnum } from '@prisma/client'

import prismaMock from '../../../../test/singleton'
import { NorisService } from '../../../noris/noris.service'
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
    failCount: 0,
    ...overrides,
  } as ExternalEdeskCheck
}

describe('EdeskTasksSubservice', () => {
  let service: EdeskTasksSubservice
  let upvsQueueService: UpvsQueueService
  let norisService: NorisService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EdeskTasksSubservice,
        { provide: PrismaService, useValue: prismaMock },
        { provide: UpvsQueueService, useValue: createMock<UpvsQueueService>() },
        { provide: NorisService, useValue: createMock<NorisService>() },
        { provide: ThrowerErrorGuard, useValue: createMock<ThrowerErrorGuard>() },
      ],
    }).compile()

    service = module.get<EdeskTasksSubservice>(EdeskTasksSubservice)
    upvsQueueService = module.get<UpvsQueueService>(UpvsQueueService)
    norisService = module.get<NorisService>(NorisService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('updateEdesk', () => {
    it('should delegate to UpvsQueueService.processBatch', async () => {
      const processBatchSpy = jest.spyOn(upvsQueueService, 'processBatch')

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
      const getNumberOfPendingExternalItemsInQueueSpy = jest
        .spyOn(upvsQueueService, 'getNumberOfPendingExternalItemsInQueue')
        .mockResolvedValue(0)
      const retrieveNewRecordsSpy = jest
        .spyOn(service, 'retrieveNewRecordsFromNorisToUpdate')
        .mockResolvedValue(undefined)
      jest.spyOn(upvsQueueService, 'retrieveCompletedAndFailedExternalItems').mockResolvedValue([])
      const updateEdeskChecksSpy = jest.spyOn(norisService, 'updateEdeskChecks')

      await service.updateEdeskInNoris()

      expect(getNumberOfPendingExternalItemsInQueueSpy).toHaveBeenCalledTimes(1)
      expect(retrieveNewRecordsSpy).toHaveBeenCalledTimes(1)
      expect(updateEdeskChecksSpy).not.toHaveBeenCalled()
    })

    it('should not call retrieveNewRecordsFromNorisToUpdate when queue has items (numberOfExternalItemsInQueue !== 0)', async () => {
      jest.spyOn(upvsQueueService, 'getNumberOfPendingExternalItemsInQueue').mockResolvedValue(100)
      const retrieveNewRecordsSpy = jest
        .spyOn(service, 'retrieveNewRecordsFromNorisToUpdate')
        .mockResolvedValue(undefined)
      jest.spyOn(upvsQueueService, 'retrieveCompletedAndFailedExternalItems').mockResolvedValue([])

      await service.updateEdeskInNoris()

      expect(retrieveNewRecordsSpy).not.toHaveBeenCalled()
    })

    it('should return early when completedExternalItems.length === 0 (norisService.updateEdeskChecks and deleteMany not called)', async () => {
      jest.spyOn(upvsQueueService, 'getNumberOfPendingExternalItemsInQueue').mockResolvedValue(0)
      jest.spyOn(service, 'retrieveNewRecordsFromNorisToUpdate').mockResolvedValue(undefined)
      jest.spyOn(upvsQueueService, 'retrieveCompletedAndFailedExternalItems').mockResolvedValue([])

      const updateEdeskChecksSpy = jest.spyOn(norisService, 'updateEdeskChecks')
      const deleteManySpy = jest.spyOn(prismaMock.externalEdeskCheck, 'deleteMany')

      await service.updateEdeskInNoris()

      expect(updateEdeskChecksSpy).not.toHaveBeenCalled()
      expect(deleteManySpy).not.toHaveBeenCalled()
    })

    it('should return early when completedExternalItems.length < batch size AND numberOfExternalItemsInQueue !== 0', async () => {
      const completedCount = EXTERNAL_ITEMS_PROCESS_BATCH_SIZE - 1
      const itemsInQueue = 50
      jest
        .spyOn(upvsQueueService, 'getNumberOfPendingExternalItemsInQueue')
        .mockResolvedValue(itemsInQueue)
      jest.spyOn(service, 'retrieveNewRecordsFromNorisToUpdate').mockResolvedValue(undefined)
      jest
        .spyOn(upvsQueueService, 'retrieveCompletedAndFailedExternalItems')
        .mockResolvedValue(
          Array.from({ length: completedCount }, (_, i) =>
            createMockCompletedItem({ id: `id-${i}`, norisId: i })
          )
        )

      const updateEdeskChecksSpy = jest.spyOn(norisService, 'updateEdeskChecks')
      const deleteManySpy = jest.spyOn(prismaMock.externalEdeskCheck, 'deleteMany')

      await service.updateEdeskInNoris()

      expect(updateEdeskChecksSpy).not.toHaveBeenCalled()
      expect(deleteManySpy).not.toHaveBeenCalled()
    })

    it('should not return early when completedExternalItems.length >= batch size (full batch); should call updateEdeskChecks and deleteMany', async () => {
      const fullBatch = Array.from({ length: EXTERNAL_ITEMS_PROCESS_BATCH_SIZE }, (_, i) =>
        createMockCompletedItem({ id: `id-${i}`, norisId: i })
      )
      jest.spyOn(upvsQueueService, 'getNumberOfPendingExternalItemsInQueue').mockResolvedValue(100)
      const retrieveNewRecordsFromNorisToUpdateSpy = jest
        .spyOn(service, 'retrieveNewRecordsFromNorisToUpdate')
        .mockResolvedValue(undefined)
      jest
        .spyOn(upvsQueueService, 'retrieveCompletedAndFailedExternalItems')
        .mockResolvedValue(fullBatch)

      const updateEdeskChecksSpy = jest.spyOn(norisService, 'updateEdeskChecks').mockResolvedValue()
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
      jest.spyOn(upvsQueueService, 'getNumberOfPendingExternalItemsInQueue').mockResolvedValue(0)
      const retrieveNewRecordsFromNorisToUpdateSpy = jest
        .spyOn(service, 'retrieveNewRecordsFromNorisToUpdate')
        .mockResolvedValue(undefined)
      jest
        .spyOn(upvsQueueService, 'retrieveCompletedAndFailedExternalItems')
        .mockResolvedValue(partialBatch)

      const updateEdeskChecksSpy = jest.spyOn(norisService, 'updateEdeskChecks').mockResolvedValue()
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
      jest.spyOn(upvsQueueService, 'getNumberOfPendingExternalItemsInQueue').mockResolvedValue(0)
      const retrieveNewRecordsFromNorisToUpdateSpy = jest
        .spyOn(service, 'retrieveNewRecordsFromNorisToUpdate')
        .mockResolvedValue(undefined)
      jest
        .spyOn(upvsQueueService, 'retrieveCompletedAndFailedExternalItems')
        .mockResolvedValue(partialBatch)

      const updateEdeskChecksSpy = jest.spyOn(norisService, 'updateEdeskChecks').mockResolvedValue()
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
      jest.spyOn(upvsQueueService, 'getNumberOfPendingExternalItemsInQueue').mockResolvedValue(1)
      jest.spyOn(service, 'retrieveNewRecordsFromNorisToUpdate').mockResolvedValue(undefined)
      jest
        .spyOn(upvsQueueService, 'retrieveCompletedAndFailedExternalItems')
        .mockResolvedValue([createMockCompletedItem()])

      const updateEdeskChecksSpy = jest.spyOn(norisService, 'updateEdeskChecks')
      const deleteManySpy = jest.spyOn(prismaMock.externalEdeskCheck, 'deleteMany')

      await service.updateEdeskInNoris()

      expect(updateEdeskChecksSpy).not.toHaveBeenCalled()
      expect(deleteManySpy).not.toHaveBeenCalled()
    })

    it('should call retrieveCompletedAndFailedExternalItems with EXTERNAL_ITEMS_PROCESS_BATCH_SIZE', async () => {
      jest.spyOn(upvsQueueService, 'getNumberOfPendingExternalItemsInQueue').mockResolvedValue(0)
      jest.spyOn(service, 'retrieveNewRecordsFromNorisToUpdate').mockResolvedValue(undefined)
      const retrieveProcessedSpy = jest
        .spyOn(upvsQueueService, 'retrieveCompletedAndFailedExternalItems')
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
        failCount: 3,
        newUri: null,
      }

      jest.spyOn(upvsQueueService, 'getNumberOfPendingExternalItemsInQueue').mockResolvedValue(0)
      jest.spyOn(service, 'retrieveNewRecordsFromNorisToUpdate').mockResolvedValue(undefined)
      jest
        .spyOn(upvsQueueService, 'retrieveCompletedAndFailedExternalItems')
        .mockResolvedValue([failedItem])

      const updateEdeskChecksSpy = jest.spyOn(norisService, 'updateEdeskChecks').mockResolvedValue()
      prismaMock.externalEdeskCheck.deleteMany.mockResolvedValue({ count: 1 })

      await service.updateEdeskInNoris()

      expect(updateEdeskChecksSpy).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            idNoris: 99,
            edeskStatus: 'NONEXISTENT',
            edeskNumber: null,
            uri: null,
          }),
        ])
      )
    })
  })
})
