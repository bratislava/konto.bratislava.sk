import { createMock } from '@golevelup/ts-jest'
import { Test, TestingModule } from '@nestjs/testing'
import prismaMock from '../../test/singleton'
import { PrismaService } from '../prisma/prisma.service'
import { RfoByBirthnumberService } from '../rfo-by-birthnumber/rfo-by-birthnumber.service'
import { UpvsIdentityByUriService } from '../upvs-identity-by-uri/upvs-identity-by-uri.service'
import ThrowerErrorGuard from '../utils/guards/errors.guard'
import { PhysicalEntityService } from './physical-entity.service'
import { RfoIdentityList } from '../rfo-by-birthnumber/dtos/rfoSchema'
import { PhysicalEntity } from '@prisma/client'
import { LineLoggerSubservice } from '../utils/subservices/line-logger.subservice'

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
  const rfoByBirthnumberServiceMock = createMock<RfoByBirthnumberService>()
  let upvsIdentityByUriService: UpvsIdentityByUriService
  let consoleSpy: jest.SpyInstance;

  beforeEach(async () => {
    jest.clearAllTimers()
    jest.clearAllMocks()
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PhysicalEntityService,
        ThrowerErrorGuard,
        { provide: UpvsIdentityByUriService, useValue: createMock<UpvsIdentityByUriService>() },
        { provide: PrismaService, useValue: prismaMock },
        { provide: RfoByBirthnumberService, useValue: rfoByBirthnumberServiceMock },
      ],
    }).compile()
    service = module.get<PhysicalEntityService>(PhysicalEntityService)
    upvsIdentityByUriService = module.get<UpvsIdentityByUriService>(UpvsIdentityByUriService)
    consoleSpy = jest.spyOn(console, 'log');
    consoleSpy.mockImplementation(() => {});
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  it('should create database records', async () => {
    jest.spyOn(prismaMock.physicalEntity, 'create').mockResolvedValue(mockPhysicalEntity)
    jest.spyOn(prismaMock.physicalEntity, 'findMany').mockResolvedValue([])
    jest.spyOn(rfoByBirthnumberServiceMock, 'create').mockResolvedValue({
      rfoByBirthNumber: null,
      request: RfoIdentityListMockData,
    })

    const upvsIdentityByUriServiceSpy = jest
      .spyOn(upvsIdentityByUriService, 'createMany')
      .mockResolvedValue({
        success: [
          {
            id: 'abcdefgh',
            createdAt: new Date(),
            updatedAt: new Date(),
            physicalEntityId: mockEntityID,
            uri: 'forcefullyTypedResult.uri',
            data: {
              ids: mockString,
              uri: 'forcefullyTypedResult.uri',
              en: mockString,
              type: mockString,
              status: mockString,
              name: mockString,
              suffix: mockString,
              various_ids: mockString,
              upvs: mockString,
              natural_person: mockString,
              addresses: mockString,
              emails: mockString,
              phones: mockString,
            },
          },
        ],
        failed: [],
      })

    expect(await service.createFromBirthNumber(mockBirthNumber)).toEqual(RfoIdentityListMockData)

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
      },
      where: {
        id: mockEntityID,
      },
    })
  })

  it('should fail after getting empty rfo data, but should return them', async () => {
    const rfoSpy = jest.spyOn(rfoByBirthnumberServiceMock, 'create').mockResolvedValue({
      rfoByBirthNumber: null,
      request: [],
    })

    const prismaSpyCreate = jest.spyOn(prismaMock.physicalEntity, 'create').mockResolvedValue({
      id: mockEntityID,
      createdAt: new Date('2024-06-24 14:59:40.524'),
      updatedAt: new Date('2024-06-24 14:59:40.581'),
      userId: null,
      uri: null,
      ifo: null,
      birthNumber: mockBirthNumber,
      activeEdesk: null,
    })
    jest.spyOn(prismaMock.physicalEntity, 'findMany').mockResolvedValue([])

    const loggerSpy = jest.spyOn(LineLoggerSubservice.prototype, 'error')

    const prismaSpyUpdate = jest.spyOn(prismaMock.physicalEntity, 'update')
    const prismaSpyFindMany = jest.spyOn(prismaMock.physicalEntity, 'findMany')

    const result = await service.createFromBirthNumber(mockBirthNumber)

    expect(result).toEqual([])
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
    jest.spyOn(rfoByBirthnumberServiceMock, 'create').mockResolvedValue({
      rfoByBirthNumber: null,
      request: mockData,
    })
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
    })
    const loggerSpy = jest.spyOn(LineLoggerSubservice.prototype, 'error')

    expect(await service.createFromBirthNumber(mockBirthNumber)).toEqual(mockData)
    expect(prismaMock.physicalEntity.findMany).toHaveBeenCalledTimes(1)
    expect(loggerSpy).toHaveBeenCalledWith(
      `PhysicalEntity ${mockBirthNumber} not created. Multiple entries from magproxy.`
    )
  })
})
