import { createMock } from '@golevelup/ts-jest'
import { Test, TestingModule } from '@nestjs/testing'
import { PrismaService } from '../prisma/prisma.service'
import prismaMock from '../../test/singleton'
import { UpvsQueueService } from './upvs-queue.service'
import { PhysicalEntityService } from '../physical-entity/physical-entity.service'
import { NasesService } from '../nases/nases.service'
import { CognitoSubservice } from '../utils/subservices/cognito.subservice'
import ThrowerErrorGuard from '../utils/guards/errors.guard'
import { PhysicalEntity, QueueItemStatusEnum } from '@prisma/client'

describe('UpvsQueueService', () => {
  let service: UpvsQueueService
  let physicalEntityService: PhysicalEntityService
  let nasesService: NasesService
  let cognitoSubservice: CognitoSubservice

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpvsQueueService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: PhysicalEntityService, useValue: createMock<PhysicalEntityService>() },
        { provide: NasesService, useValue: createMock<NasesService>() },
        { provide: CognitoSubservice, useValue: createMock<CognitoSubservice>() },
        { provide: ThrowerErrorGuard, useValue: createMock<ThrowerErrorGuard>() },
      ],
    }).compile()

    service = module.get<UpvsQueueService>(UpvsQueueService)
    physicalEntityService = module.get<PhysicalEntityService>(PhysicalEntityService)
    nasesService = module.get<NasesService>(NasesService)
    cognitoSubservice = module.get<CognitoSubservice>(CognitoSubservice)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('processBatch', () => {
    it('should process urgent, high priority, and external items and handle success', async () => {
      const mockUrgentEntity = {
        id: 'urgent-1',
        userId: 'user1',
        birthNumber: '123456/7890',
        uri: null,
        createdAt: new Date('2024-01-01'),
      } as PhysicalEntity

      const mockHighPriorityEntity = {
        id: 'high-1',
        userId: 'user2',
        uri: 'rc://sk/1234567890_doe_john',
        activeEdeskUpdatedAt: new Date('2020-01-01'),
        activeEdeskUpdateFailedAt: null,
        activeEdeskUpdateFailCount: 0,
      } as PhysicalEntity

      const mockExternalItem = {
        id: 'external-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        uri: 'rc://sk/external',
        queueStatus: QueueItemStatusEnum.PENDING,
        upvsStatus: null,
        edeskStatus: null,
        edeskNumber: null,
        processedAt: null,
        failCount: 0,
      }

      prismaMock.physicalEntity.findMany.mockResolvedValue([mockUrgentEntity])
      prismaMock.$queryRaw.mockResolvedValue([mockHighPriorityEntity])
      prismaMock.externalEdeskCheck.findMany.mockResolvedValue([mockExternalItem])

      jest.spyOn(cognitoSubservice, 'getDataFromCognito').mockResolvedValue({
        given_name: 'John',
        family_name: 'Doe',
      } as any)

      jest.spyOn(nasesService, 'createMany').mockResolvedValue({
        success: [
          {
            physicalEntityId: 'urgent-1',
            uri: 'rc://sk/1234567890_doe_john',
            data: { status: 'activated', upvs: { edesk_status: 'active', edesk_number: '123' } },
          },
          {
            physicalEntityId: 'high-1',
            uri: 'rc://sk/1234567890_doe_john',
            data: { status: 'activated', upvs: { edesk_status: 'active', edesk_number: '456' } },
          },
          {
            physicalEntityId: null,
            uri: 'rc://sk/external',
            data: { status: 'activated', upvs: { edesk_status: 'active', edesk_number: '789' } },
          },
        ],
        failed: [],
      })

      await service.processBatch()

      expect(physicalEntityService.updateSuccessfulActiveEdeskUpdateInDatabase).toHaveBeenCalled()
      expect(prismaMock.externalEdeskCheck.updateMany).toHaveBeenCalledWith({
        where: { uri: 'rc://sk/external' },
        data: expect.objectContaining({
          queueStatus: QueueItemStatusEnum.COMPLETED,
          upvsStatus: 'activated',
          edeskStatus: 'active',
          edeskNumber: '789',
        }),
      })
    })

    it('should handle failures for both internal and external items', async () => {
      const mockEntity = {
        id: 'entity-1',
        userId: 'user1',
        uri: 'rc://sk/1234567890_doe_john',
        activeEdeskUpdatedAt: new Date('2020-01-01'),
      } as PhysicalEntity

      const mockExternalItem = {
        id: 'external-fail-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        uri: 'rc://sk/external-fail',
        queueStatus: QueueItemStatusEnum.PENDING,
        upvsStatus: null,
        edeskStatus: null,
        edeskNumber: null,
        processedAt: null,
        failCount: 0,
      }

      prismaMock.physicalEntity.findMany.mockResolvedValue([])
      prismaMock.$queryRaw.mockResolvedValue([mockEntity])
      prismaMock.externalEdeskCheck.findMany.mockResolvedValue([mockExternalItem])

      jest.spyOn(nasesService, 'createMany').mockResolvedValue({
        success: [],
        failed: [
          { physicalEntityId: 'entity-1', uri: 'rc://sk/1234567890_doe_john' },
          { uri: 'rc://sk/external-fail' },
        ],
      })

      await service.processBatch()

      expect(physicalEntityService.updateFailedActiveEdeskUpdateInDatabase).toHaveBeenCalledWith([
        'entity-1',
      ])

      expect(prismaMock.externalEdeskCheck.updateMany).toHaveBeenCalledWith({
        where: {
          uri: { in: ['rc://sk/external-fail'] },
          queueStatus: QueueItemStatusEnum.PENDING,
        },
        data: {
          queueStatus: QueueItemStatusEnum.FAILED,
          failCount: { increment: 1 },
        },
      })
    })

    it('should construct URIs from birthNumber and Cognito data with diacritics', async () => {
      const mockEntity = {
        id: 'entity-1',
        userId: 'user1',
        birthNumber: '123456/7890',
        uri: null,
      } as PhysicalEntity

      prismaMock.physicalEntity.findMany.mockResolvedValue([mockEntity])
      prismaMock.$queryRaw.mockResolvedValue([])
      prismaMock.externalEdeskCheck.findMany.mockResolvedValue([])

      jest.spyOn(cognitoSubservice, 'getDataFromCognito').mockResolvedValue({
        given_name: 'Ján',
        family_name: 'Novák',
      } as any)

      jest.spyOn(nasesService, 'createMany').mockResolvedValue({
        success: [],
        failed: [],
      })

      await service.processBatch()

      expect(nasesService.createMany).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            uri: 'rc://sk/1234567890_novak_jan',
            physicalEntityId: 'entity-1',
          }),
        ])
      )
    })
  })
})
