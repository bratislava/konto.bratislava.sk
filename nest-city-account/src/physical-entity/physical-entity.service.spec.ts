import { createMock } from '@golevelup/ts-jest'
import { Test, TestingModule } from '@nestjs/testing'
import { PhysicalEntity } from '@prisma/client'

import prismaMock from '../../test/singleton'
import { MagproxyService } from '../magproxy/magproxy.service'
import { PrismaService } from '../prisma/prisma.service'
import ThrowerErrorGuard from '../utils/guards/errors.guard'
import { CognitoSubservice } from '../utils/subservices/cognito.subservice'
import { LineLoggerSubservice } from '../utils/subservices/line-logger.subservice'
import { PhysicalEntityService } from './physical-entity.service'

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
  uriPossiblyOutdated: false,
}

describe('PhysicalEntityService', () => {
  let service: PhysicalEntityService
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
      ],
    }).compile()
    service = module.get<PhysicalEntityService>(PhysicalEntityService)
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
})
