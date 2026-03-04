import { createMock } from '@golevelup/ts-jest'
import { Test, TestingModule } from '@nestjs/testing'
import { PrismaService } from '../../../prisma/prisma.service'
import prismaMock from '../../../../test/singleton'
import { EdeskTasksSubservice } from '../edesk-tasks.subservice'
import { UpvsQueueService } from '../../../upvs-queue/upvs-queue.service'
import { PhysicalEntity, ExternalEdeskCheck, QueueItemStatusEnum } from '@prisma/client'
import { NorisService } from '../../../noris/noris.service'
import ThrowerErrorGuard from '../../../utils/guards/errors.guard'

const EXTERNAL_ITEMS_PROCESS_BATCH_SIZE = 500

const createMockCompletedItem = (overrides: Partial<ExternalEdeskCheck> = {}): ExternalEdeskCheck => {
  return {
    id: 'check-1',
    uri: 'rc://sk/123',
    norisId: 'noris-1',
    queueStatus: QueueItemStatusEnum.COMPLETED,
    processedAt: new Date('2024-01-01T00:00:00.000Z'),
    createdAt: new Date(),
    updatedAt: new Date(),
    upvsStatus: null,
    edeskStatus: 'Active',
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
      const getNumberOfExternalItemsInQueueSpy = jest
        .spyOn(upvsQueueService, 'getNumberOfExternalItemsInQueue')
        .mockResolvedValue(0)
      const retrieveNewRecordsSpy = jest
        .spyOn(service, 'retrieveNewRecordsFromNorisToUpdate')
        .mockResolvedValue(undefined)
      jest
        .spyOn(upvsQueueService, 'retrieveCompletedExternalItems')
        .mockResolvedValue([])
      const updateEdeskChecksSpy = jest.spyOn(norisService, 'updateEdeskChecks')

      await service.updateEdeskInNoris()

      expect(getNumberOfExternalItemsInQueueSpy).toHaveBeenCalledTimes(1)
      expect(retrieveNewRecordsSpy).toHaveBeenCalledTimes(1)
      expect(updateEdeskChecksSpy).not.toHaveBeenCalled()
    })

    it('should not call retrieveNewRecordsFromNorisToUpdate when queue has items (numberOfExternalItemsInQueue !== 0)', async () => {
      jest.spyOn(upvsQueueService, 'getNumberOfExternalItemsInQueue').mockResolvedValue(100)
      const retrieveNewRecordsSpy = jest
        .spyOn(service, 'retrieveNewRecordsFromNorisToUpdate')
        .mockResolvedValue(undefined)
      jest.spyOn(upvsQueueService, 'retrieveCompletedExternalItems').mockResolvedValue([])

      await service.updateEdeskInNoris()

      expect(retrieveNewRecordsSpy).not.toHaveBeenCalled()
    })

    it('should return early when completedExternalItems.length === 0 (norisService.updateEdeskChecks and deleteMany not called)', async () => {
      jest.spyOn(upvsQueueService, 'getNumberOfExternalItemsInQueue').mockResolvedValue(0)
      jest.spyOn(service, 'retrieveNewRecordsFromNorisToUpdate').mockResolvedValue(undefined)
      jest.spyOn(upvsQueueService, 'retrieveCompletedExternalItems').mockResolvedValue([])

      const updateEdeskChecksSpy = jest.spyOn(norisService, 'updateEdeskChecks')
      const deleteManySpy = jest.spyOn(prismaMock.externalEdeskCheck, 'deleteMany')

      await service.updateEdeskInNoris()

      expect(updateEdeskChecksSpy).not.toHaveBeenCalled()
      expect(deleteManySpy).not.toHaveBeenCalled()
    })

    it('should return early when completedExternalItems.length < batch size AND numberOfExternalItemsInQueue !== 0', async () => {
      const completedCount = EXTERNAL_ITEMS_PROCESS_BATCH_SIZE - 1
      const itemsInQueue = 50
      jest.spyOn(upvsQueueService, 'getNumberOfExternalItemsInQueue').mockResolvedValue(itemsInQueue)
      jest.spyOn(service, 'retrieveNewRecordsFromNorisToUpdate').mockResolvedValue(undefined)
      jest
        .spyOn(upvsQueueService, 'retrieveCompletedExternalItems')
        .mockResolvedValue(
          Array.from({ length: completedCount }, (_, i) =>
            createMockCompletedItem({ id: `id-${i}`, norisId: `noris-${i}` })
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
        createMockCompletedItem({ id: `id-${i}`, norisId: `noris-${i}` })
      )
      jest.spyOn(upvsQueueService, 'getNumberOfExternalItemsInQueue').mockResolvedValue(100)
      const retrieveNewRecordsFromNorisToUpdateSpy = jest.spyOn(service, 'retrieveNewRecordsFromNorisToUpdate').mockResolvedValue(undefined)
      jest.spyOn(upvsQueueService, 'retrieveCompletedExternalItems').mockResolvedValue(fullBatch)

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
        createMockCompletedItem({ id: 'id-1', norisId: 'noris-1' }),
        createMockCompletedItem({ id: 'id-2', norisId: 'noris-2' }),
      ]
      jest.spyOn(upvsQueueService, 'getNumberOfExternalItemsInQueue').mockResolvedValue(0)
      const retrieveNewRecordsFromNorisToUpdateSpy = jest.spyOn(service, 'retrieveNewRecordsFromNorisToUpdate').mockResolvedValue(undefined)
      jest.spyOn(upvsQueueService, 'retrieveCompletedExternalItems').mockResolvedValue(partialBatch)

      const updateEdeskChecksSpy = jest.spyOn(norisService, 'updateEdeskChecks').mockResolvedValue()
      prismaMock.externalEdeskCheck.deleteMany.mockResolvedValue({ count: partialBatch.length })

      await service.updateEdeskInNoris()

      expect(updateEdeskChecksSpy).toHaveBeenCalledTimes(1)
      expect(prismaMock.externalEdeskCheck.deleteMany).toHaveBeenCalledWith({
        where: { id: { in: ['id-1', 'id-2'] } },
      })
      expect(retrieveNewRecordsFromNorisToUpdateSpy).toHaveBeenCalled()
    })

    it('should return early when exactly one completed item but queue has items (length 1 < 500 and queue !== 0)', async () => {
      jest.spyOn(upvsQueueService, 'getNumberOfExternalItemsInQueue').mockResolvedValue(1)
      jest.spyOn(service, 'retrieveNewRecordsFromNorisToUpdate').mockResolvedValue(undefined)
      jest
        .spyOn(upvsQueueService, 'retrieveCompletedExternalItems')
        .mockResolvedValue([createMockCompletedItem()])

      const updateEdeskChecksSpy = jest.spyOn(norisService, 'updateEdeskChecks')
      const deleteManySpy = jest.spyOn(prismaMock.externalEdeskCheck, 'deleteMany')

      await service.updateEdeskInNoris()

      expect(updateEdeskChecksSpy).not.toHaveBeenCalled()
      expect(deleteManySpy).not.toHaveBeenCalled()
    })

    it('should call retrieveCompletedExternalItems with EXTERNAL_ITEMS_PROCESS_BATCH_SIZE', async () => {
      jest.spyOn(upvsQueueService, 'getNumberOfExternalItemsInQueue').mockResolvedValue(0)
      jest.spyOn(service, 'retrieveNewRecordsFromNorisToUpdate').mockResolvedValue(undefined)
      const retrieveCompletedSpy = jest
        .spyOn(upvsQueueService, 'retrieveCompletedExternalItems')
        .mockResolvedValue([])

      await service.updateEdeskInNoris()

      expect(retrieveCompletedSpy).toHaveBeenCalledWith(EXTERNAL_ITEMS_PROCESS_BATCH_SIZE)
    })
  })
})
