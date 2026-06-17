import { createMock } from '@golevelup/ts-jest'
import { Test, TestingModule } from '@nestjs/testing'
import { QueueItemStatusEnum } from '@prisma/client'

import prismaMock from '../../../test/singleton'
import { PrismaService } from '../../prisma/prisma.service'
import { EdeskBatchUpdateService } from '../edesk-batch-update.service'
import { EdeskUriUpdateService } from '../edesk-uri-update.service'
import { UpvsQueueService } from '../upvs-queue.service'
import { UrgentLookupService } from '../urgent-lookup.service'

describe('UpvsQueueService', () => {
  let service: UpvsQueueService
  let urgentLookupService: UrgentLookupService
  let edeskUriUpdateService: EdeskUriUpdateService
  let edeskBatchUpdateService: EdeskBatchUpdateService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpvsQueueService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: UrgentLookupService, useValue: createMock<UrgentLookupService>() },
        { provide: EdeskUriUpdateService, useValue: createMock<EdeskUriUpdateService>() },
        { provide: EdeskBatchUpdateService, useValue: createMock<EdeskBatchUpdateService>() },
      ],
    }).compile()

    service = module.get(UpvsQueueService)
    urgentLookupService = module.get(UrgentLookupService)
    edeskUriUpdateService = module.get(EdeskUriUpdateService)
    edeskBatchUpdateService = module.get(EdeskBatchUpdateService)

    // Quiet, no-work defaults; individual tests override what they exercise.
    jest
      .spyOn(urgentLookupService, 'processUrgentItems')
      .mockResolvedValue({ attempted: 0, rateLimited: false, failures: [] })
    jest.spyOn(edeskUriUpdateService, 'getUriToUpdateInternal').mockResolvedValue(null)
    jest.spyOn(edeskUriUpdateService, 'getUriToUpdateExternal').mockResolvedValue(null)
    jest
      .spyOn(edeskBatchUpdateService, 'processBatchedSearch')
      .mockResolvedValue({ highPriorityProcessed: 0, externalProcessed: 0 })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('public queue API', () => {
    it('addExternalItemsToQueue inserts the records, skipping duplicates', async () => {
      const records = [{ uri: 'rc://sk/1', norisId: 1, newUri: undefined }]
      await service.addExternalItemsToQueue(records)

      expect(prismaMock.externalEdeskCheck.createMany).toHaveBeenCalledWith({
        data: records,
        skipDuplicates: true,
      })
    })

    it('getNumberOfPendingExternalItemsInQueue counts PENDING rows', async () => {
      prismaMock.externalEdeskCheck.count.mockResolvedValue(7)

      await expect(service.getNumberOfPendingExternalItemsInQueue()).resolves.toBe(7)
      expect(prismaMock.externalEdeskCheck.count).toHaveBeenCalledWith({
        where: { queueStatus: QueueItemStatusEnum.PENDING },
      })
    })

    it('retrieveCompletedAndFailedExternalItems queries COMPLETED/FAILED up to the limit', async () => {
      prismaMock.externalEdeskCheck.findMany.mockResolvedValue([])

      await service.retrieveCompletedAndFailedExternalItems(500)
      expect(prismaMock.externalEdeskCheck.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            queueStatus: { in: [QueueItemStatusEnum.COMPLETED, QueueItemStatusEnum.FAILED] },
          },
          take: 500,
        })
      )
    })
  })

  describe('processBatch orchestration', () => {
    it('skips the run when another is already in progress', async () => {
      ;(service as any).isProcessingBatch = true
      const logSpy = jest.spyOn((service as any).logger, 'log').mockImplementation(() => {})

      await service.processBatch()

      expect(urgentLookupService.processUrgentItems).not.toHaveBeenCalled()
      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('skipped'))
    })

    it('runs urgent first, then (no URI work) the batched search', async () => {
      await service.processBatch()

      expect(urgentLookupService.processUrgentItems).toHaveBeenCalledTimes(1)
      expect(edeskUriUpdateService.getUriToUpdateInternal).toHaveBeenCalledTimes(1)
      expect(edeskUriUpdateService.getUriToUpdateExternal).toHaveBeenCalledTimes(1)
      expect(edeskBatchUpdateService.processBatchedSearch).toHaveBeenCalledTimes(1)
    })

    it('short-circuits the whole tick when urgent is rate-limited', async () => {
      jest
        .spyOn(urgentLookupService, 'processUrgentItems')
        .mockResolvedValue({ attempted: 3, rateLimited: true, failures: [] })

      await service.processBatch()

      expect(edeskUriUpdateService.getUriToUpdateInternal).not.toHaveBeenCalled()
      expect(edeskUriUpdateService.getUriToUpdateExternal).not.toHaveBeenCalled()
      expect(edeskBatchUpdateService.processBatchedSearch).not.toHaveBeenCalled()
    })

    it('repairs one internal URI and skips the batched search', async () => {
      jest
        .spyOn(edeskUriUpdateService, 'getUriToUpdateInternal')
        .mockResolvedValue({ uri: 'rc://sk/old', id: 'id-1' })

      await service.processBatch()

      expect(edeskUriUpdateService.handleUriUpdateInternal).toHaveBeenCalledWith({
        uri: 'rc://sk/old',
        id: 'id-1',
      })
      expect(edeskUriUpdateService.getUriToUpdateExternal).not.toHaveBeenCalled()
      expect(edeskBatchUpdateService.processBatchedSearch).not.toHaveBeenCalled()
    })

    it('repairs one external URI (when no internal is due) and skips the batched search', async () => {
      jest
        .spyOn(edeskUriUpdateService, 'getUriToUpdateExternal')
        .mockResolvedValue({ uri: 'rc://sk/ext' })

      await service.processBatch()

      expect(edeskUriUpdateService.handleUriUpdateExternal).toHaveBeenCalledWith('rc://sk/ext')
      expect(edeskBatchUpdateService.processBatchedSearch).not.toHaveBeenCalled()
    })

    it('reports the combined counts from the tiers', async () => {
      jest
        .spyOn(urgentLookupService, 'processUrgentItems')
        .mockResolvedValue({ attempted: 2, rateLimited: false, failures: [] })
      jest
        .spyOn(edeskBatchUpdateService, 'processBatchedSearch')
        .mockResolvedValue({ highPriorityProcessed: 3, externalProcessed: 1 })
      const logSpy = jest.spyOn((service as any).logger, 'log').mockImplementation(() => {})

      await service.processBatch()

      expect(logSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          urgentProcessed: 2,
          highPriorityProcessed: 3,
          externalProcessed: 1,
          totalProcessed: 6,
        })
      )
    })

    it('folds urgent per-entity failures into the batch report', async () => {
      jest.spyOn(urgentLookupService, 'processUrgentItems').mockResolvedValue({
        attempted: 1,
        rateLimited: false,
        failures: [{ entityId: 'e1', reason: 'Lookup failed' }],
      })
      const logSpy = jest.spyOn((service as any).logger, 'log').mockImplementation(() => {})

      await service.processBatch()

      expect(logSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          errors: [expect.stringContaining('urgentFailures')],
        })
      )
    })
  })
})
