import { createMock } from '@golevelup/ts-jest'
import { Test, TestingModule } from '@nestjs/testing'
import { PrismaService } from '../../../prisma/prisma.service'
import prismaMock from '../../../../test/singleton'
import { EdeskTasksSubservice } from '../edesk-tasks.subservice'
import { UpvsQueueService } from '../../../upvs-queue/upvs-queue.service'
import { PhysicalEntity } from '@prisma/client'
import { NorisService } from '../../../noris/noris.service'
import ThrowerErrorGuard from '../../../utils/guards/errors.guard'

describe('EdeskTasksSubservice', () => {
  let service: EdeskTasksSubservice
  let upvsQueueService: UpvsQueueService

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
})
