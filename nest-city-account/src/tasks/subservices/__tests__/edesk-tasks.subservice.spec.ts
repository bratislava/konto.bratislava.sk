import { createMock } from '@golevelup/ts-jest'
import { Test, TestingModule } from '@nestjs/testing'
import { PrismaService } from '../../../prisma/prisma.service'
import prismaMock from '../../../../test/singleton'
import { EdeskTasksSubservice } from '../edesk-tasks.subservice'
import { PhysicalEntityService } from '../../../physical-entity/physical-entity.service'
import { PhysicalEntity } from '@prisma/client'

describe('EdeskTasksSubservice', () => {
  let service: EdeskTasksSubservice
  let physicalEntityService: PhysicalEntityService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EdeskTasksSubservice,
        { provide: PrismaService, useValue: prismaMock },
        { provide: PhysicalEntityService, useValue: createMock<PhysicalEntityService>() },
      ],
    }).compile()

    service = module.get<EdeskTasksSubservice>(EdeskTasksSubservice)
    physicalEntityService = module.get<PhysicalEntityService>(PhysicalEntityService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('updateEdesk', () => {
    it('should update edesk for entities with exponential backoff logic', async () => {
      const mockEntities = [
        {
          id: '1',
          userId: 'user1',
          uri: 'uri1',
          activeEdeskUpdatedAt: null,
          activeEdeskUpdateFailedAt: null,
          activeEdeskUpdateFailCount: 0,
        },
        {
          id: '2',
          userId: 'user2',
          uri: 'uri2',
          activeEdeskUpdatedAt: new Date('2020-01-01'),
          activeEdeskUpdateFailedAt: null,
          activeEdeskUpdateFailCount: 0,
        },
      ] as PhysicalEntity[]

      prismaMock.$queryRaw.mockResolvedValue(mockEntities)
      const updateSpy = jest.spyOn(physicalEntityService, 'updateEdeskFromUpvs')

      await service.updateEdesk()

      expect(prismaMock.$queryRaw).toHaveBeenCalled()
      expect(updateSpy).toHaveBeenCalledWith(mockEntities)
    })

    it('should not update if there are no entities to update', async () => {
      prismaMock.$queryRaw.mockResolvedValue([])
      const updateSpy = jest.spyOn(physicalEntityService, 'updateEdeskFromUpvs')

      await service.updateEdesk()

      expect(prismaMock.$queryRaw).toHaveBeenCalled()
      expect(updateSpy).not.toHaveBeenCalled()
    })

    it('should limit updates to 5 entities', async () => {
      const mockEntities = Array.from({ length: 5 }, (_, i) => ({
        id: `${i + 1}`,
        userId: `user${i + 1}`,
        uri: `uri${i + 1}`,
        activeEdeskUpdatedAt: null,
        activeEdeskUpdateFailedAt: null,
        activeEdeskUpdateFailCount: 0,
      })) as PhysicalEntity[]

      prismaMock.$queryRaw.mockResolvedValue(mockEntities)
      const updateSpy = jest.spyOn(physicalEntityService, 'updateEdeskFromUpvs')

      await service.updateEdesk()

      expect(updateSpy).toHaveBeenCalledWith(expect.arrayContaining(mockEntities))
      expect(updateSpy).toHaveBeenCalledWith(expect.any(Array))
      expect(updateSpy.mock.calls[0][0]).toHaveLength(5)
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

      prismaMock.physicalEntity.findMany.mockResolvedValue(
        mockFailedEntities as PhysicalEntity[]
      )

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
