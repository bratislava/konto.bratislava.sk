import { createMock } from '@golevelup/ts-jest'
import { Test, TestingModule } from '@nestjs/testing'
import prismaMock from '../../test/singleton'
import { MagproxyService } from '../magproxy/magproxy.service'
import { PrismaService } from '../prisma/prisma.service'
import { RfoByBirthnumberService } from './rfo-by-birthnumber.service'
import { RfoIdentityList } from './dtos/rfoSchema'
import { RfoByBirthnumber } from '@prisma/client'
import ThrowerErrorGuard from '../utils/guards/errors.guard'

const birthnumber = '123456/7890'

const RfoIdentityListMockData: RfoIdentityList = [
  {
    ifo: 'Test IFO',
    rodneCislo: birthnumber,
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

describe('RfoByBirthnumberService', () => {
  let service: RfoByBirthnumberService
  const magProxyServiceMock = createMock<MagproxyService>()

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ThrowerErrorGuard,
        RfoByBirthnumberService,
        {
          provide: MagproxyService,
          useValue: magProxyServiceMock,
        },
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile()

    service = module.get<RfoByBirthnumberService>(RfoByBirthnumberService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  it('should create database records', async () => {
    const physicalEntityId = 'abc123'
    const prismaMockResult: RfoByBirthnumber = {
      id: 'abc',
      physicalEntityId: physicalEntityId,
      createdAt: new Date(),
      updatedAt: new Date(),
      birthNumber: birthnumber,
      data: JSON.stringify(RfoIdentityListMockData),
    }

    jest.spyOn(magProxyServiceMock, 'rfoBirthNumberList').mockResolvedValue(RfoIdentityListMockData)
    jest.spyOn(prismaMock.rfoByBirthnumber, 'create').mockResolvedValue(prismaMockResult)

    const { rfoByBirthNumber: resultRfo, request: resultRequest } = await service.create(
      birthnumber,
      physicalEntityId
    )

    expect(resultRfo).toEqual(prismaMockResult)
    expect(resultRequest).toEqual(RfoIdentityListMockData)
    expect(prismaMock.rfoByBirthnumber.create).toHaveBeenCalledWith({
      data: {
        birthNumber: birthnumber,
        physicalEntityId: physicalEntityId,
        data: JSON.stringify(RfoIdentityListMockData),
      },
    })
    expect(magProxyServiceMock.rfoBirthNumberList).toHaveBeenCalledWith(birthnumber)
  })
  it('should return empty request data and not create database records', async () => {
    const physicalEntityId = 'abc123'

    jest.spyOn(magProxyServiceMock, 'rfoBirthNumberList').mockResolvedValue([])

    const result = await service.create(birthnumber, physicalEntityId)
    const resultRfo = result.rfoByBirthNumber
    const resultRequest = result.request

    expect(resultRfo).toEqual(null)
    expect(resultRequest).toEqual([])
    expect(prismaMock.rfoByBirthnumber.create).toHaveBeenCalledTimes(0)
    expect(magProxyServiceMock.rfoBirthNumberList).toHaveBeenCalledWith(birthnumber)
  })
})
