import { createMock } from '@golevelup/ts-jest'
import { Test, TestingModule } from '@nestjs/testing'
import prismaMock from '../../test/singleton'
import { PrismaService } from '../prisma/prisma.service'
import ThrowerErrorGuard from '../utils/guards/errors.guard'
import { PhysicalEntityService } from './physical-entity.service'
import { PhysicalEntity } from '@prisma/client'
import { LineLoggerSubservice } from '../utils/subservices/line-logger.subservice'
import { MagproxyService } from '../magproxy/magproxy.service'
import { CognitoSubservice } from '../utils/subservices/cognito.subservice'
import { BloomreachService } from '../bloomreach/bloomreach.service'
import { UpvsIdentityByUriSuccessType } from 'src/nases/nases.service'

const mockBirthNumber = '123456/7890'
const mockEntityID = '11cc6139-f660-4173-92e1-0d7b9cfa7a24'

const mockPhysicalEntity: PhysicalEntity = {
  id: mockEntityID,
  createdAt: new Date('2024-06-24 14:59:40.524'),
  updatedAt: new Date('2024-06-24 14:59:40.581'),
  userId: null,
  uri: null,
  ifo: null,
  birthNumber: mockBirthNumber,
  activeEdesk: null,
  activeEdeskUpdatedAt: null,
  activeEdeskUpdateFailedAt: null,
  activeEdeskUpdateFailCount: 0,
  edeskStatusChangedAt: null,
}

describe('PhysicalEntityService', () => {
  let service: PhysicalEntityService
  let bloomreachService: BloomreachService
  const MagproxyServiceMock = createMock<MagproxyService>()
  let consoleSpy: jest.SpyInstance
  beforeEach(async () => {
    jest.clearAllTimers()
    jest.clearAllMocks()
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PhysicalEntityService,
        ThrowerErrorGuard,
        { provide: PrismaService, useValue: prismaMock },
        { provide: MagproxyService, useValue: MagproxyServiceMock },
        { provide: CognitoSubservice, useValue: createMock<CognitoSubservice>() },
        { provide: BloomreachService, useValue: createMock<BloomreachService>() },
      ],
    }).compile()
    service = module.get<PhysicalEntityService>(PhysicalEntityService)
    bloomreachService = module.get<BloomreachService>(BloomreachService)
    consoleSpy = jest.spyOn(console, 'log')
    consoleSpy.mockImplementation(() => {})
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('linkToUserIdByBirthnumber', () => {
    it('should link userId to entity successfully', async () => {
      const mockUserId = 'user123'
      jest.spyOn(prismaMock.physicalEntity, 'findMany').mockResolvedValue([mockPhysicalEntity])
      const updateSpy = jest
        .spyOn(prismaMock.physicalEntity, 'update')
        .mockResolvedValue({ ...mockPhysicalEntity, userId: mockUserId })

      await service.linkToUserIdByBirthnumber(mockUserId, mockBirthNumber)

      expect(prismaMock.physicalEntity.findMany).toHaveBeenCalledWith({
        where: { birthNumber: mockBirthNumber },
      })
      expect(updateSpy).toHaveBeenCalledWith({
        where: { id: mockEntityID },
        data: { userId: mockUserId },
      })
    })

    it('should fail if multiple entities exist for the same birthNumber', async () => {
      const mockUserId = 'user123'
      jest
        .spyOn(prismaMock.physicalEntity, 'findMany')
        .mockResolvedValue([mockPhysicalEntity, { ...mockPhysicalEntity, id: 'another-id' }])
      const loggerSpy = jest.spyOn(LineLoggerSubservice.prototype, 'error')

      await service.linkToUserIdByBirthnumber(mockUserId, mockBirthNumber)

      expect(prismaMock.physicalEntity.findMany).toHaveBeenCalledWith({
        where: { birthNumber: mockBirthNumber },
      })
      expect(loggerSpy).toHaveBeenCalledWith(
        `Multiple physical entities in database with birthnumber: ${mockBirthNumber}.`
      )
    })

    it('should fail if no entity is found for the given birthNumber', async () => {
      const mockUserId = 'user123'
      jest.spyOn(prismaMock.physicalEntity, 'findMany').mockResolvedValue([])
      const loggerSpy = jest.spyOn(LineLoggerSubservice.prototype, 'error')

      await service.linkToUserIdByBirthnumber(mockUserId, mockBirthNumber)

      expect(prismaMock.physicalEntity.findMany).toHaveBeenCalledWith({
        where: { birthNumber: mockBirthNumber },
      })
      expect(loggerSpy).toHaveBeenCalledWith(
        `Entity with birth number ${mockBirthNumber} does not exist.`
      )
    })
  })
  describe('updateSuccessfulActiveEdeskUpdateInDatabase', () => {
    const mockSuccessArray: UpvsIdentityByUriSuccessType[] = [
      {
        uri: 'https://example.com',
        physicalEntityId: mockEntityID,
        data: { upvs: { edesk_status: 'deliverable' } } as UpvsIdentityByUriSuccessType['data'],
      },
    ]

    it('should run a transaction, update physical entity, and enqueue Bloomreach when user has externalId', async () => {
      const userExternalId = 'user-ext-123'
      prismaMock.physicalEntity.findUnique.mockResolvedValue({
        user: { externalId: userExternalId },
      } as never)
      ;(prismaMock.$transaction as unknown as jest.Mock).mockImplementation(
        (callback: (tx: typeof prismaMock) => unknown) => callback(prismaMock)
      )
      prismaMock.physicalEntity.update.mockResolvedValue({
        ...mockPhysicalEntity,
        activeEdesk: true,
      })

      await service.updateSuccessfulActiveEdeskUpdateInDatabase(mockSuccessArray)

      expect(prismaMock.physicalEntity.findUnique).toHaveBeenCalledWith({
        where: { id: mockEntityID },
        select: { user: { select: { externalId: true } } },
      })
      expect(prismaMock.$transaction).toHaveBeenCalled()
      expect(prismaMock.physicalEntity.update).toHaveBeenCalledWith({
        where: { id: mockEntityID },
        data: expect.objectContaining({
          activeEdesk: true,
          activeEdeskUpdateFailedAt: null,
          activeEdeskUpdateFailCount: 0,
        }),
      })
      expect(bloomreachService.enqueueTrackCustomerToBloomreachOutbox).toHaveBeenCalledWith(
        prismaMock,
        userExternalId
      )
    })

    it('should update in a transaction but not enqueue Bloomreach when user has no externalId', async () => {
      prismaMock.physicalEntity.findUnique.mockResolvedValue({ user: null } as never)
      ;(prismaMock.$transaction as unknown as jest.Mock).mockImplementation(
        (callback: (tx: typeof prismaMock) => unknown) => callback(prismaMock)
      )
      prismaMock.physicalEntity.update.mockResolvedValue({
        ...mockPhysicalEntity,
        activeEdesk: true,
      })

      await service.updateSuccessfulActiveEdeskUpdateInDatabase(mockSuccessArray)

      expect(prismaMock.$transaction).toHaveBeenCalled()
      expect(prismaMock.physicalEntity.update).toHaveBeenCalled()
      expect(bloomreachService.enqueueTrackCustomerToBloomreachOutbox).not.toHaveBeenCalled()
    })
  })
})
