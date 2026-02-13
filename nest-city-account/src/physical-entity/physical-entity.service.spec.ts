import { createMock } from '@golevelup/ts-jest'
import { Test, TestingModule } from '@nestjs/testing'
import prismaMock from '../../test/singleton'
import { PrismaService } from '../prisma/prisma.service'
import {
  UpvsCreateManyResult,
  UpvsIdentityByUriService,
} from '../upvs-identity-by-uri/upvs-identity-by-uri.service'
import ThrowerErrorGuard from '../utils/guards/errors.guard'
import { PhysicalEntityService } from './physical-entity.service'
import { RfoIdentityList } from '../rfo-by-birthnumber/dtos/rfoSchema'
import { PhysicalEntity } from '@prisma/client'
import { LineLoggerSubservice } from '../utils/subservices/line-logger.subservice'
import { MagproxyService } from '../magproxy/magproxy.service'
import { ErrorsEnum, ErrorsResponseEnum } from '../utils/guards/dtos/error.dto'
import { AdminErrorsEnum, AdminErrorsResponseEnum } from '../admin/admin.errors.enum'
import { CognitoSubservice } from '../utils/subservices/cognito.subservice'

const mockBirthNumber = '123456/7890'
const mockString = 'mockString'
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

const RfoIdentityListMockData: RfoIdentityList = [
  {
    ifo: 'Test IFO',
    rodneCislo: mockBirthNumber,
    datumNarodenia: '2024-04-07',
    rokNarodenia: 2024,
    miestoNarodeniaKod: 123,
    miestoNarodenia: 'Test Birth Place',
    statNarodeniaKod: 321,
    statNarodenia: 'Test Birth State',
    okresNarodeniaKod: 789,
    okresNarodenia: 'Test Birth District',
    rodnaMatrikaKod: null,
    rodnaMatrika: null,
    datumUmrtia: null,
    pohlavieOsobyKod: 100,
    pohlavieOsoby: 'mužské',
    rodinnyStavKod: 200,
    rodinnyStav: 'slobodný / slobodná',
    narodnost: 'slovenská',
    stupenZverejneniaUdajovKod: 300,
    stupenZverejneniaUdajov: 'Test Degree Of Data Disclosure',
    typOsobyKod: 400,
    typOsoby: 'Občan s trvalým pobytom na území SR',
    menaOsoby: [
      {
        meno: 'Test',
        poradieMena: 1,
      },
      {
        meno: 'Mock',
        poradieMena: 2,
      },
    ],
    priezviskaOsoby: [
      {
        meno: 'LastName',
        poradiePriezviska: 1,
      },
      {
        meno: 'AnotherLastName',
        poradiePriezviska: 2,
      },
    ],
    rodnePriezviskaOsoby: [],
    titulyOsoby: [],
    statnePrislusnosti: [],
    rodinniPrislusnici: [],
    pobytyOsoby: [],
    zakazyPobytu: null,
    zruseniaVyhlaseniaOsobyZaMrtvu: null,
    doklady: [],
    statneObcianstva: null,
    obmedzeniaPravnejSposobilosti: null,
    systemyModifikujuceUdajeOsoby: null,
    zaujmovaOsoba: false,
  },
]

describe('PhysicalEntityService', () => {
  let service: PhysicalEntityService
  const MagproxyServiceMock = createMock<MagproxyService>()
  let upvsIdentityByUriService: UpvsIdentityByUriService
  let consoleSpy: jest.SpyInstance
  beforeEach(async () => {
    jest.clearAllTimers()
    jest.clearAllMocks()
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PhysicalEntityService,
        ThrowerErrorGuard,
        { provide: UpvsIdentityByUriService, useValue: createMock<UpvsIdentityByUriService>() },
        { provide: PrismaService, useValue: prismaMock },
        { provide: MagproxyService, useValue: MagproxyServiceMock },
        { provide: CognitoSubservice, useValue: createMock<CognitoSubservice>() },
      ],
    }).compile()
    service = module.get<PhysicalEntityService>(PhysicalEntityService)
    upvsIdentityByUriService = module.get<UpvsIdentityByUriService>(UpvsIdentityByUriService)
    consoleSpy = jest.spyOn(console, 'log')
    consoleSpy.mockImplementation(() => {})
  })
  describe('checkUriAndUpdateEdeskFromUpvs', () => {
    const mockUpvsInput = [
      { uri: 'mock-uri1', physicalEntityId: 'mock-entity-id1' },
      { uri: 'mock-uri2', physicalEntityId: 'mock-entity-id2' },
      { uri: 'mock-uri3', physicalEntityId: 'mock-entity-id3' },
    ]

    it('should successfully update a PhysicalEntity with UPVS success result', async () => {
      const mockUpvsResult: UpvsCreateManyResult = {
        success: [
          {
            physicalEntityId: 'mock-entity-id',
            uri: 'mock-uri',
            data: { upvs: { edesk_status: 'deliverable' } },
          },
        ],
        failed: [],
      }
      const mockUpdated = {
        id: 'mock-entity-id',
        uri: 'mock-uri',
        activeEdesk: true,
        ifo: 'mock-ifo',
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: 'mock-user-id',
        birthNumber: 'mock-birth-number',
        activeEdeskUpdatedAt: null,
        activeEdeskUpdateFailedAt: null,
        activeEdeskUpdateFailCount: 0,
        edeskStatusChangedAt: null,
      }
      const updateSpy = jest.spyOn(service, 'update').mockResolvedValue(mockUpdated)
      jest.spyOn(upvsIdentityByUriService, 'createMany').mockResolvedValue(mockUpvsResult)

      const result = await service.checkUriAndUpdateEdeskFromUpvs(mockUpvsInput)

      expect(result.updatedEntities).toEqual([mockUpdated])
      expect(updateSpy).toHaveBeenCalledWith({
        id: 'mock-entity-id',
        uri: 'mock-uri',
        activeEdesk: true,
      })
    })

    it('should return multiple when UPVS success results are returned', async () => {
      const mockUpvsResult: UpvsCreateManyResult = {
        success: [
          {
            physicalEntityId: 'id1',
            uri: 'uri1',
            data: { upvs: { edesk_status: 'deliverable' } },
          },
          {
            physicalEntityId: 'id2',
            uri: 'uri2',
            data: { upvs: { edesk_status: 'deliverable' } },
          },
        ],
        failed: [],
      }

      const mockUpdatedEntities = [
        {
          id: 'mock-entity-id1',
          uri: 'mock-uri1',
          activeEdesk: true,
          ifo: 'mock-ifo1',
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: 'mock-user-id1',
          birthNumber: 'mock-birth-number1',
          activeEdeskUpdatedAt: null,
          activeEdeskUpdateFailedAt: null,
          activeEdeskUpdateFailCount: 0,
          edeskStatusChangedAt: null,
        },
        {
          id: 'mock-entity-id2',
          uri: 'mock-uri2',
          activeEdesk: true,
          ifo: 'mock-ifo2',
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: 'mock-user-id2',
          birthNumber: 'mock-birth-number2',
          activeEdeskUpdatedAt: null,
          activeEdeskUpdateFailedAt: null,
          activeEdeskUpdateFailCount: 0,
          edeskStatusChangedAt: null,
        },
      ]

      jest.spyOn(upvsIdentityByUriService, 'createMany').mockResolvedValue(mockUpvsResult)
      const updateSpy = jest
        .spyOn(service, 'update')
        .mockResolvedValueOnce(mockUpdatedEntities[0])
        .mockResolvedValueOnce(mockUpdatedEntities[1])

      const result = await service.checkUriAndUpdateEdeskFromUpvs(mockUpvsInput)

      expect(result.updatedEntities).toEqual(mockUpdatedEntities)
      expect(result.upvsResult).toEqual(mockUpvsResult)
      expect(updateSpy).toHaveBeenCalledTimes(2)
      expect(updateSpy).toHaveBeenCalledWith({
        id: 'id1',
        uri: 'uri1',
        activeEdesk: true,
      })
      expect(updateSpy).toHaveBeenCalledWith({
        id: 'id2',
        uri: 'uri2',
        activeEdesk: true,
      })
    })

    it('should return only failed if all UPVS results failed', async () => {
      const mockUpvsResult = { success: [], failed: mockUpvsInput }
      jest.spyOn(upvsIdentityByUriService, 'createMany').mockResolvedValue(mockUpvsResult)

      const loggerSpy = jest.spyOn(LineLoggerSubservice.prototype, 'error')

      const result = await service.checkUriAndUpdateEdeskFromUpvs(mockUpvsInput)

      expect(result).toEqual({ updatedEntities: [], upvsResult: mockUpvsResult })
      expect(loggerSpy).toHaveBeenCalledTimes(0)
    })

    it('should log an error if an exception is thrown during createMany', async () => {
      jest
        .spyOn(upvsIdentityByUriService, 'createMany')
        .mockRejectedValue(new Error('Test Exception'))

      const loggerSpy = jest.spyOn(LineLoggerSubservice.prototype, 'error')

      const result = await service.checkUriAndUpdateEdeskFromUpvs(mockUpvsInput)

      expect(result).toEqual({
        updatedEntities: [],
        upvsResult: { success: [], failed: mockUpvsInput },
      })
      expect(loggerSpy).toHaveBeenCalledWith(
        expect.stringContaining('An error occurred while requesting data from UPVS'),
        { upvsInput: mockUpvsInput },
        expect.any(Error)
      )
    })
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

  describe('createFromBirthNumber', () => {
    it('should create database records', async () => {
      jest.spyOn(prismaMock.physicalEntity, 'create').mockResolvedValue(mockPhysicalEntity)
      jest.spyOn(prismaMock.physicalEntity, 'findMany').mockResolvedValue([])
      jest
        .spyOn(MagproxyServiceMock, 'rfoBirthNumberList')
        .mockResolvedValue({ success: true, data: RfoIdentityListMockData })

      const upvsIdentityByUriServiceSpy = jest
        .spyOn(upvsIdentityByUriService, 'createMany')
        .mockResolvedValue({
          success: [
            {
              physicalEntityId: mockEntityID,
              uri: 'forcefullyTypedResult.uri',
              data: {
                ids: [],
                uri: 'forcefullyTypedResult.uri',
                en: mockString,
                type: 'natural_person',
                status: 'verified',
                name: mockString,
                suffix: mockString,
                various_ids: [],
                upvs: {},
                natural_person: {},
                addresses: [],
                emails: [],
                phones: [],
              },
            },
          ],
          failed: [],
        })

      expect(await service.createFromBirthNumber(mockBirthNumber)).toEqual({
        success: true,
        data: RfoIdentityListMockData,
      })

      expect(prismaMock.physicalEntity.create).toHaveBeenCalledWith({
        data: { birthNumber: mockBirthNumber },
      })
      expect(prismaMock.physicalEntity.findMany).toHaveBeenCalledWith({
        where: { birthNumber: mockBirthNumber },
      })
      expect(upvsIdentityByUriServiceSpy).toHaveBeenCalledTimes(1)
      expect(prismaMock.physicalEntity.update).toHaveBeenCalledTimes(1)
      expect(prismaMock.physicalEntity.update).toHaveBeenCalledWith({
        data: {
          id: mockEntityID,
          uri: 'forcefullyTypedResult.uri',
          activeEdesk: false,
          activeEdeskUpdateFailCount: 0,
          activeEdeskUpdateFailedAt: null,
          activeEdeskUpdatedAt: expect.any(Date),
        },
        where: {
          id: mockEntityID,
        },
      })
    })

    it('should fail after getting empty rfo data, but should return them', async () => {
      const rfoSpy = jest
        .spyOn(MagproxyServiceMock, 'rfoBirthNumberList')
        .mockResolvedValue({ success: true, data: [] })

      const prismaSpyCreate = jest.spyOn(prismaMock.physicalEntity, 'create').mockResolvedValue({
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
      })
      jest.spyOn(prismaMock.physicalEntity, 'findMany').mockResolvedValue([])

      const loggerSpy = jest.spyOn(LineLoggerSubservice.prototype, 'error')

      const prismaSpyUpdate = jest.spyOn(prismaMock.physicalEntity, 'update')
      const prismaSpyFindMany = jest.spyOn(prismaMock.physicalEntity, 'findMany')

      const result = await service.createFromBirthNumber(mockBirthNumber)

      expect(result).toEqual({ data: [], success: true })
      expect(rfoSpy).toHaveBeenCalledTimes(1)
      expect(prismaSpyCreate).toHaveBeenCalledTimes(1)
      expect(prismaSpyUpdate).toHaveBeenCalledTimes(0)
      expect(prismaSpyFindMany).toHaveBeenCalledTimes(1)
      expect(loggerSpy).toHaveBeenCalledWith(
        `PhysicalEntity ${mockBirthNumber} not created. No entries from magproxy.`
      )
    })

    it('should fail after getting multiple RFO entries, but should return them.', async () => {
      const mockData = RfoIdentityListMockData.concat(RfoIdentityListMockData)
      jest
        .spyOn(MagproxyServiceMock, 'rfoBirthNumberList')
        .mockResolvedValue({ success: true, data: mockData })
      jest.spyOn(prismaMock.physicalEntity, 'findMany').mockResolvedValue([])
      jest.spyOn(prismaMock.physicalEntity, 'create').mockResolvedValue({
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
      })
      const loggerSpy = jest.spyOn(LineLoggerSubservice.prototype, 'error')

      expect(await service.createFromBirthNumber(mockBirthNumber)).toEqual({
        data: mockData,
        success: true,
      })
      expect(prismaMock.physicalEntity.findMany).toHaveBeenCalledTimes(1)
      expect(loggerSpy).toHaveBeenCalledWith(
        `PhysicalEntity ${mockBirthNumber} not created. Multiple entries from magproxy.`
      )
    })
  })

  describe('updateFromRFO', () => {
    it('should throw BadRequestException if entity with the given ID does not exist', async () => {
      jest.spyOn(prismaMock.physicalEntity, 'findUnique').mockResolvedValue(null)

      await expect(service.updateFromRFO('non-existent-id')).rejects.toThrow(
        new ThrowerErrorGuard().BadRequestException(
          ErrorsEnum.BAD_REQUEST_ERROR,
          'PhysicalEntity with id non-existent-id not found'
        )
      )
    })

    it('should throw NotFoundException if entity does not have a birthNumber', async () => {
      jest.spyOn(prismaMock.physicalEntity, 'findUnique').mockResolvedValue({
        ...mockPhysicalEntity,
        birthNumber: null,
      })

      await expect(service.updateFromRFO(mockEntityID)).rejects.toThrow(
        new ThrowerErrorGuard().NotFoundException(
          AdminErrorsEnum.BIRTH_NUMBER_NOT_FOUND,
          AdminErrorsResponseEnum.BIRTH_NUMBER_NOT_FOUND
        )
      )
    })

    it('should throw InternalServerErrorException if RFO data is incorrect or empty', async () => {
      jest.spyOn(prismaMock.physicalEntity, 'findUnique').mockResolvedValue(mockPhysicalEntity)
      jest
        .spyOn(MagproxyServiceMock, 'rfoBirthNumberList')
        .mockResolvedValue({ success: true, data: [] })

      await expect(service.updateFromRFO(mockEntityID)).rejects.toThrow(
        new ThrowerErrorGuard().InternalServerErrorException(
          ErrorsEnum.INTERNAL_SERVER_ERROR,
          ErrorsResponseEnum.INTERNAL_SERVER_ERROR,
          `Incorrect or no data returned from RFO for birthnumber ${mockBirthNumber} entityId: ${mockEntityID}, data: []`
        )
      )
    })

    it('should successfully update physical entity with data from RFO', async () => {
      jest.spyOn(prismaMock.physicalEntity, 'findUnique').mockResolvedValue(mockPhysicalEntity)
      jest
        .spyOn(MagproxyServiceMock, 'rfoBirthNumberList')
        .mockResolvedValue({ success: true, data: RfoIdentityListMockData })

      const upvsSpy = jest.spyOn(service, 'checkUriAndUpdateEdeskFromUpvs').mockResolvedValue({
        updatedEntities: [{ ...mockPhysicalEntity, uri: 'mock-uri', activeEdesk: true }],
        upvsResult: {
          success: [
            {
              uri: 'mock-uri',
              physicalEntityId: mockEntityID,
              data: {},
            },
          ],
          failed: [],
        },
      })

      const result = await service.updateFromRFO(mockEntityID)

      expect(result.physicalEntity).toEqual({
        ...mockPhysicalEntity,
        uri: 'mock-uri',
        activeEdesk: true,
      })
      expect(result.rfoData).toEqual(RfoIdentityListMockData)
      expect(upvsSpy).toHaveBeenCalledTimes(1)
    })

    it('should log an error and return multiple RFO entries if found', async () => {
      const mockData = RfoIdentityListMockData.concat(RfoIdentityListMockData)
      jest.spyOn(prismaMock.physicalEntity, 'findUnique').mockResolvedValue(mockPhysicalEntity)
      jest
        .spyOn(MagproxyServiceMock, 'rfoBirthNumberList')
        .mockResolvedValue({ success: true, data: mockData })
      const loggerSpy = jest.spyOn(LineLoggerSubservice.prototype, 'error')

      const result = await service.updateFromRFO(mockEntityID)

      expect(result.physicalEntity).toEqual(mockPhysicalEntity)
      expect(result.rfoData).toEqual(mockData)
      expect(loggerSpy).toHaveBeenCalledWith(
        `Found multiple RFO records for birthnumber ${mockBirthNumber} entityId: ${mockEntityID}`
      )
    })

    it('should handle parsing failure gracefully and return the entity and RFO data', async () => {
      jest.spyOn(prismaMock.physicalEntity, 'findUnique').mockResolvedValue(mockPhysicalEntity)
      jest
        .spyOn(MagproxyServiceMock, 'rfoBirthNumberList')
        .mockResolvedValue({ success: true, data: RfoIdentityListMockData })

      const result = await service.updateFromRFO(mockEntityID)

      expect(result.physicalEntity).toEqual(mockPhysicalEntity)
      expect(result.rfoData).toEqual(RfoIdentityListMockData)
    })
  })
})
