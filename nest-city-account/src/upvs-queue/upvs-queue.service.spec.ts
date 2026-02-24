/* eslint-disable @typescript-eslint/no-explicit-any, sonarjs/no-duplicate-string */
import { createMock } from '@golevelup/ts-jest'
import { Test, TestingModule } from '@nestjs/testing'
import { PrismaService } from '../prisma/prisma.service'
import prismaMock from '../../test/singleton'
import { UpvsQueueService } from './upvs-queue.service'
import { PhysicalEntityService } from '../physical-entity/physical-entity.service'
import { NasesService } from '../nases/nases.service'
import { CognitoSubservice } from '../utils/subservices/cognito.subservice'
import ThrowerErrorGuard from '../utils/guards/errors.guard'
import { PhysicalEntity, QueueItemStatusEnum, ExternalEdeskCheck } from '@prisma/client'

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

      // First call for urgent items, second call for high priority items
      prismaMock.$queryRaw
        .mockResolvedValueOnce([mockUrgentEntity])
        .mockResolvedValueOnce([mockHighPriorityEntity])
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

      // First call for urgent items (empty), second call for high priority items
      prismaMock.$queryRaw.mockResolvedValueOnce([]).mockResolvedValueOnce([mockEntity])
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

      // First call for urgent items, second call for high priority items (empty)
      prismaMock.$queryRaw.mockResolvedValueOnce([mockEntity]).mockResolvedValueOnce([])
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

  describe('batch size limits', () => {
    it('should request max batch size for all if everything returns empty', async () => {
      // Both urgent and high priority return empty
      prismaMock.$queryRaw.mockResolvedValueOnce([]).mockResolvedValueOnce([])
      prismaMock.externalEdeskCheck.findMany.mockResolvedValue([])

      await service.processBatch()

      // Should request full batch size (8) for urgent items (first call)
      const urgentCall = (prismaMock.$queryRaw as jest.Mock).mock.calls[0]
      const highPriorityCall = (prismaMock.$queryRaw as jest.Mock).mock.calls[1]
      expect(urgentCall[urgentCall.length - 1]).toBe(8) // Last parameter is the limit
      expect(highPriorityCall[highPriorityCall.length - 1]).toBe(6) // We take only 6 for high priority
      expect(prismaMock.externalEdeskCheck.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 8,
        })
      )
    })

    it('should reserve 6 slots for high priority items', async () => {
      // 6 high priority items available
      const mockHighPriorityEntities = Array.from({ length: 6 }, (_, i) => ({
        id: `high-${i}`,
        userId: `user${i}`,
        uri: `rc://sk/${i}`,
        activeEdeskUpdatedAt: new Date('2020-01-01'),
      })) as PhysicalEntity[]

      // No urgent items, return high priority items
      prismaMock.$queryRaw.mockResolvedValueOnce([]).mockResolvedValueOnce(mockHighPriorityEntities)

      // Provide external items to fill remaining slots
      const mockExternalItems = Array.from({ length: 5 }, (_, i) => ({
        id: `external-${i}`,
        uri: `rc://sk/external${i}`,
        queueStatus: QueueItemStatusEnum.PENDING,
        createdAt: new Date(),
        updatedAt: new Date(),
        upvsStatus: null,
        edeskStatus: null,
        edeskNumber: null,
        processedAt: null,
        failCount: 0,
      })) as ExternalEdeskCheck[]

      prismaMock.externalEdeskCheck.findMany.mockResolvedValue(mockExternalItems.slice(0, 2))

      jest.spyOn(nasesService, 'createMany').mockResolvedValue({
        success: [],
        failed: [],
      })

      await service.processBatch()

      // Should request up to 6 high priority items (second call)
      const highPriorityCall = (prismaMock.$queryRaw as jest.Mock).mock.calls[1]
      expect(highPriorityCall[highPriorityCall.length - 1]).toBe(6) // Last parameter is the limit

      // Should request 2 external items (8 - 6 high priority)
      expect(prismaMock.externalEdeskCheck.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 2,
        })
      )
    })

    it('should distribute slots correctly when high priority queue is partially filled', async () => {
      // Only 3 high priority items available (less than the 6 reserved)
      const mockHighPriorityEntities = Array.from({ length: 3 }, (_, i) => ({
        id: `high-${i}`,
        userId: `user${i}`,
        uri: `rc://sk/${i}`,
        activeEdeskUpdatedAt: new Date('2020-01-01'),
      })) as PhysicalEntity[]

      // No urgent items, return high priority items
      prismaMock.$queryRaw.mockResolvedValueOnce([]).mockResolvedValueOnce(mockHighPriorityEntities)

      // External items should fill the remaining 5 slots (8 - 3)
      const mockExternalItems = Array.from({ length: 10 }, (_, i) => ({
        id: `external-${i}`,
        uri: `rc://sk/external${i}`,
        queueStatus: QueueItemStatusEnum.PENDING,
        createdAt: new Date(),
        updatedAt: new Date(),
        upvsStatus: null,
        edeskStatus: null,
        edeskNumber: null,
        processedAt: null,
        failCount: 0,
      })) as ExternalEdeskCheck[]

      prismaMock.externalEdeskCheck.findMany.mockResolvedValue(mockExternalItems.slice(0, 5))

      jest.spyOn(nasesService, 'createMany').mockResolvedValue({
        success: [],
        failed: [],
      })

      await service.processBatch()

      // Should request 5 external items to fill remaining slots
      expect(prismaMock.externalEdeskCheck.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 5,
        })
      )

      const callArg = (nasesService.createMany as jest.Mock).mock.calls[0][0]
      expect(callArg.length).toBe(8) // 3 high priority + 5 external
    })

    it('should prioritize urgent items over all other queues', async () => {
      // 8 urgent items (fills entire batch)
      const mockUrgentEntities = Array.from({ length: 8 }, (_, i) => ({
        id: `urgent-${i}`,
        userId: `user${i}`,
        birthNumber: `12345${i}/7890`,
        uri: null,
        createdAt: new Date(),
      })) as PhysicalEntity[]

      // First call returns urgent items, second call returns empty for high priority
      prismaMock.$queryRaw.mockResolvedValueOnce(mockUrgentEntities).mockResolvedValueOnce([])

      prismaMock.externalEdeskCheck.findMany.mockResolvedValue([])

      jest.spyOn(cognitoSubservice, 'getDataFromCognito').mockResolvedValue({
        given_name: 'John',
        family_name: 'Doe',
      } as any)

      jest.spyOn(nasesService, 'createMany').mockResolvedValue({
        success: [],
        failed: [],
      })

      await service.processBatch()

      // Should request 0 high priority slots (second call) since 8 urgent items fill the batch
      const highPriorityCall = (prismaMock.$queryRaw as jest.Mock).mock.calls[1]
      expect(highPriorityCall[highPriorityCall.length - 1]).toBe(0) // Last parameter is the limit

      // Should request 0 external items (batch is full with urgent)
      expect(prismaMock.externalEdeskCheck.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 0,
        })
      )

      const callArg = (nasesService.createMany as jest.Mock).mock.calls[0][0]
      expect(callArg.length).toBe(8)
    })

    it('should handle batch with mixed queue items respecting all constraints', async () => {
      // 2 urgent items
      const mockUrgentEntities = Array.from({ length: 2 }, (_, i) => ({
        id: `urgent-${i}`,
        userId: `user${i}`,
        birthNumber: `12345${i}/7890`,
        uri: null,
        createdAt: new Date(),
      })) as PhysicalEntity[]

      // 4 high priority items
      const mockHighPriorityEntities = Array.from({ length: 4 }, (_, i) => ({
        id: `high-${i}`,
        userId: `user${i}`,
        uri: `rc://sk/${i}`,
        activeEdeskUpdatedAt: new Date('2020-01-01'),
      })) as PhysicalEntity[]

      // First call returns urgent items, second call returns high priority items
      prismaMock.$queryRaw
        .mockResolvedValueOnce(mockUrgentEntities)
        .mockResolvedValueOnce(mockHighPriorityEntities)

      // 2 external items (8 - 2 urgent - 4 high priority = 2)
      const mockExternalItems = Array.from({ length: 2 }, (_, i) => ({
        id: `external-${i}`,
        uri: `rc://sk/external${i}`,
        queueStatus: QueueItemStatusEnum.PENDING,
        createdAt: new Date(),
        updatedAt: new Date(),
        upvsStatus: null,
        edeskStatus: null,
        edeskNumber: null,
        processedAt: null,
        failCount: 0,
      })) as ExternalEdeskCheck[]

      prismaMock.externalEdeskCheck.findMany.mockResolvedValue(mockExternalItems)

      jest.spyOn(cognitoSubservice, 'getDataFromCognito').mockResolvedValue({
        given_name: 'John',
        family_name: 'Doe',
      } as any)

      jest.spyOn(nasesService, 'createMany').mockResolvedValue({
        success: [],
        failed: [],
      })

      await service.processBatch()

      const callArg = (nasesService.createMany as jest.Mock).mock.calls[0][0]
      expect(callArg.length).toBe(8)

      // Verify correct distribution
      const urgentCount = callArg.filter((item: any) =>
        item.physicalEntityId?.startsWith('urgent-')
      ).length
      const highPriorityCount = callArg.filter((item: any) =>
        item.physicalEntityId?.startsWith('high-')
      ).length
      const externalCount = callArg.filter((item: any) => item.uri?.includes('external')).length

      expect(urgentCount).toBe(2)
      expect(highPriorityCount).toBe(4)
      expect(externalCount).toBe(2)
    })
  })
})

/* eslint-enable @typescript-eslint/no-explicit-any, sonarjs/no-duplicate-string */
