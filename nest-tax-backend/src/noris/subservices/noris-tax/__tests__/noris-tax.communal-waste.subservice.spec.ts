/* eslint-disable no-secrets/no-secrets */
import { createMock } from '@golevelup/ts-jest'
import { Test, TestingModule } from '@nestjs/testing'
import { TaxType } from '@prisma/client'
import * as mssql from 'mssql'

import { BloomreachService } from '../../../../bloomreach/bloomreach.service'
import { PrismaService } from '../../../../prisma/prisma.service'
import { ErrorsEnum } from '../../../../utils/guards/dtos/error.dto'
import ThrowerErrorGuard from '../../../../utils/guards/errors.guard'
import { CityAccountSubservice } from '../../../../utils/subservices/cityaccount.subservice'
import DatabaseSubservice from '../../../../utils/subservices/database.subservice'
import { QrCodeSubservice } from '../../../../utils/subservices/qrcode.subservice'
import {
  NorisCommunalWasteTax,
  NorisCommunalWasteTaxGrouped,
} from '../../../types/noris.types'
import {
  testCommunalWasteTax1,
  testCommunalWasteTax2,
  testCommunalWasteTax3,
  testCommunalWasteTax4,
  testCommunalWasteTax5,
  testCommunalWasteTax6,
} from '../../__tests__/data/test.communal-waste-tax'
import { NorisConnectionSubservice } from '../../noris-connection.subservice'
import { NorisPaymentSubservice } from '../../noris-payment.subservice'
import { NorisValidatorSubservice } from '../../noris-validator.subservice'
import { NorisTaxCommunalWasteSubservice } from '../noris-tax.communal-waste.subservice'

jest.mock('mssql', () => ({
  Request: jest.fn().mockImplementation(() => ({
    input: jest.fn(),
    query: jest.fn().mockResolvedValue({ recordset: [] }),
  })),
  VarChar: jest.fn(),
  Int: jest.fn(),
}))

describe('NorisTaxCommunalWasteSubservice', () => {
  let service: NorisTaxCommunalWasteSubservice
  let connectionService: jest.Mocked<NorisConnectionSubservice>
  let norisValidatorSubservice: jest.Mocked<NorisValidatorSubservice>
  let throwerErrorGuard: jest.Mocked<ThrowerErrorGuard>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NorisTaxCommunalWasteSubservice,
        {
          provide: NorisConnectionSubservice,
          useValue: createMock<NorisConnectionSubservice>(),
        },
        {
          provide: NorisValidatorSubservice,
          useValue: createMock<NorisValidatorSubservice>(),
        },
        {
          provide: QrCodeSubservice,
          useValue: createMock<QrCodeSubservice>(),
        },
        {
          provide: ThrowerErrorGuard,
          useValue: createMock<ThrowerErrorGuard>(),
        },
        {
          provide: PrismaService,
          useValue: createMock<PrismaService>(),
        },
        {
          provide: BloomreachService,
          useValue: createMock<BloomreachService>(),
        },
        {
          provide: CityAccountSubservice,
          useValue: createMock<CityAccountSubservice>(),
        },
        {
          provide: NorisPaymentSubservice,
          useValue: createMock<NorisPaymentSubservice>(),
        },
        {
          provide: DatabaseSubservice,
          useValue: createMock<DatabaseSubservice>(),
        },
      ],
    }).compile()

    service = module.get<NorisTaxCommunalWasteSubservice>(
      NorisTaxCommunalWasteSubservice,
    )
    connectionService = module.get(NorisConnectionSubservice)
    norisValidatorSubservice = module.get(NorisValidatorSubservice)
    throwerErrorGuard = module.get(ThrowerErrorGuard)

    // Mock validator to return data as-is
    norisValidatorSubservice.validateNorisData.mockImplementation(
      (schema, data) => {
        if (Array.isArray(data)) {
          return data.map((item) => schema.parse(item))
        }
        return schema.parse(data)
      },
    )
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('constructor', () => {
    it('should be defined', () => {
      expect(service).toBeDefined()
    })

    it('should have all dependencies injected', () => {
      expect(service['connectionService']).toBeDefined()
      expect(service['norisValidatorSubservice']).toBeDefined()
      expect(service['qrCodeSubservice']).toBeDefined()
      expect(service['throwerErrorGuard']).toBeDefined()
      expect(service['prismaService']).toBeDefined()
      expect(service['bloomreachService']).toBeDefined()
      expect(service['cityAccountSubservice']).toBeDefined()
      expect(service['paymentSubservice']).toBeDefined()
      expect(service['databaseSubservice']).toBeDefined()
    })

    it('should create logger with correct name', () => {
      expect(service['logger']).toBeDefined()
    })
  })

  describe('getTaxType', () => {
    it('should return TaxType.KO', () => {
      const result = service['getTaxType']()
      expect(result).toBe(TaxType.KO)
    })
  })

  describe('getTaxDataByYearAndBirthNumber', () => {
    it('should call getCommunalWasteTaxDataByBirthNumberAndYear with correct parameters', async () => {
      const mockData: NorisCommunalWasteTax[] = [testCommunalWasteTax1]
      const mockGroupedData: NorisCommunalWasteTaxGrouped[] = [
        {
          type: TaxType.KO,
          ...testCommunalWasteTax1,
          addresses: [],
        } as any,
      ]

      jest
        .spyOn(service as any, 'getCommunalWasteTaxDataByBirthNumberAndYear')
        .mockResolvedValue(mockData)
      jest
        .spyOn(service as any, 'groupCommunalWasteTaxRecords')
        .mockReturnValue(mockGroupedData)

      const result = await service['getTaxDataByYearAndBirthNumber'](2025, [
        '123456/7890',
      ])

      expect(
        service['getCommunalWasteTaxDataByBirthNumberAndYear'],
      ).toHaveBeenCalledWith(2025, ['123456/7890'])
      expect(service['groupCommunalWasteTaxRecords']).toHaveBeenCalledWith(
        mockData,
      )
      expect(result).toEqual(mockGroupedData)
    })

    it('should call groupCommunalWasteTaxRecords with the fetched data', async () => {
      const mockData: NorisCommunalWasteTax[] = [
        testCommunalWasteTax1,
        testCommunalWasteTax2,
      ]

      jest
        .spyOn(service as any, 'getCommunalWasteTaxDataByBirthNumberAndYear')
        .mockResolvedValue(mockData)
      const groupSpy = jest
        .spyOn(service as any, 'groupCommunalWasteTaxRecords')
        .mockReturnValue([])

      await service['getTaxDataByYearAndBirthNumber'](2025, ['123456/7890'])

      expect(groupSpy).toHaveBeenCalledWith(mockData)
      expect(groupSpy).toHaveBeenCalledTimes(1)
    })

    it('should return the grouped result', async () => {
      const mockGroupedData: NorisCommunalWasteTaxGrouped[] = [
        {
          type: TaxType.KO,
          variabilny_symbol: '3425030151',
          addresses: [
            {
              addressDetail: {
                street: 'Hlavná ulica',
                orientationNumber: '22',
              },
              containers: [],
            },
          ],
        } as any,
      ]

      jest
        .spyOn(service as any, 'getCommunalWasteTaxDataByBirthNumberAndYear')
        .mockResolvedValue([])
      jest
        .spyOn(service as any, 'groupCommunalWasteTaxRecords')
        .mockReturnValue(mockGroupedData)

      const result = await service['getTaxDataByYearAndBirthNumber'](2025, [
        '123456/7890',
      ])

      expect(result).toEqual(mockGroupedData)
    })
  })

  describe('getCommunalWasteTaxDataByBirthNumberAndYear', () => {
    it('should fetch data from Noris via connection service successfully', async () => {
      const mockData: NorisCommunalWasteTax[] = [testCommunalWasteTax1]
      const mockConnection = {}
      const mockRequest = {
        input: jest.fn(),
        query: jest.fn().mockResolvedValue({ recordset: mockData }),
      }

      connectionService.withConnection.mockImplementation(async (callback) => {
        return callback(mockConnection as any)
      })

      const { Request } = await import('mssql')
      ;(Request as unknown as jest.Mock).mockImplementation(
        () => mockRequest as any,
      )

      const result = await service[
        'getCommunalWasteTaxDataByBirthNumberAndYear'
      ](2025, ['123456/7890'])

      expect(connectionService.withConnection).toHaveBeenCalled()
      expect(norisValidatorSubservice.validateNorisData).toHaveBeenCalledWith(
        expect.any(Object),
        mockData,
      )
      expect(result).toEqual(mockData)
    })

    it('should build SQL query with correct birth number placeholders', async () => {
      const mockConnection = {}
      const mockRequest = {
        input: jest.fn(),
        query: jest.fn().mockResolvedValue({ recordset: [] }),
      }

      connectionService.withConnection.mockImplementation(async (callback) => {
        return callback(mockConnection as any)
      })

      const { Request } = await import('mssql')
      ;(Request as unknown as jest.Mock).mockImplementation(
        () => mockRequest as any,
      )

      await service['getCommunalWasteTaxDataByBirthNumberAndYear'](2025, [
        '123456/7890',
        '987654/3210',
      ])

      expect(mockRequest.query).toHaveBeenCalledWith(
        expect.stringContaining('@birth_number0,@birth_number1'),
      )
    })

    it('should pass year and birth numbers as parameters to the SQL request', async () => {
      const mockConnection = {}
      const mockRequest = {
        input: jest.fn(),
        query: jest.fn().mockResolvedValue({ recordset: [] }),
      }

      connectionService.withConnection.mockImplementation(async (callback) => {
        return callback(mockConnection as any)
      })

      const { Request } = await import('mssql')
      ;(Request as unknown as jest.Mock).mockImplementation(
        () => mockRequest as any,
      )

      await service['getCommunalWasteTaxDataByBirthNumberAndYear'](2025, [
        '123456/7890',
      ])

      expect(mockRequest.input).toHaveBeenCalledWith('year', mssql.Int, 2025)
      expect(mockRequest.input).toHaveBeenCalledWith(
        'birth_number0',
        mssql.VarChar(expect.any(Number)),
        '123456/7890',
      )
    })

    it('should handle multiple birth numbers correctly', async () => {
      const mockConnection = {}
      const mockRequest = {
        input: jest.fn(),
        query: jest.fn().mockResolvedValue({ recordset: [] }),
      }

      connectionService.withConnection.mockImplementation(async (callback) => {
        return callback(mockConnection as any)
      })

      const { Request } = await import('mssql')
      ;(Request as unknown as jest.Mock).mockImplementation(
        () => mockRequest as any,
      )

      const birthNumbers = ['123456/7890', '987654/3210', '111111/1111']
      await service['getCommunalWasteTaxDataByBirthNumberAndYear'](
        2025,
        birthNumbers,
      )

      expect(mockRequest.input).toHaveBeenCalledWith(
        'birth_number0',
        mssql.VarChar(expect.any(Number)),
        '123456/7890',
      )
      expect(mockRequest.input).toHaveBeenCalledWith(
        'birth_number1',
        mssql.VarChar(expect.any(Number)),
        '987654/3210',
      )
      expect(mockRequest.input).toHaveBeenCalledWith(
        'birth_number2',
        mssql.VarChar(expect.any(Number)),
        '111111/1111',
      )
    })

    it('should validate returned data using norisValidatorSubservice', async () => {
      const mockData: NorisCommunalWasteTax[] = [testCommunalWasteTax1]
      const mockConnection = {}
      const mockRequest = {
        input: jest.fn(),
        query: jest.fn().mockResolvedValue({ recordset: mockData }),
      }

      connectionService.withConnection.mockImplementation(async (callback) => {
        return callback(mockConnection as any)
      })

      const { Request } = await import('mssql')
      ;(Request as unknown as jest.Mock).mockImplementation(
        () => mockRequest as any,
      )

      await service['getCommunalWasteTaxDataByBirthNumberAndYear'](2025, [
        '123456/7890',
      ])

      expect(norisValidatorSubservice.validateNorisData).toHaveBeenCalledWith(
        expect.any(Object),
        mockData,
      )
    })

    it('should throw InternalServerErrorException with correct error message on database connection failure', async () => {
      const mockError = new Error('Database connection failed')

      throwerErrorGuard.InternalServerErrorException.mockImplementation(() => {
        throw mockError
      })

      connectionService.withConnection.mockImplementation(
        async (callback, errorHandler) => {
          return errorHandler(mockError)
        },
      )

      await expect(
        service['getCommunalWasteTaxDataByBirthNumberAndYear'](2025, [
          '123456/7890',
        ]),
      ).rejects.toThrow()

      expect(
        throwerErrorGuard.InternalServerErrorException,
      ).toHaveBeenCalledWith(
        ErrorsEnum.INTERNAL_SERVER_ERROR,
        'Failed to get communal waste tax data from Noris',
        undefined,
        undefined,
        mockError,
      )
    })

    it('should handle non-Error objects in connection failures', async () => {
      const mockError = 'String error'

      throwerErrorGuard.InternalServerErrorException.mockImplementation(() => {
        throw new Error('Mocked error')
      })

      connectionService.withConnection.mockImplementation(
        async (callback, errorHandler) => {
          return errorHandler(mockError)
        },
      )

      await expect(
        service['getCommunalWasteTaxDataByBirthNumberAndYear'](2025, [
          '123456/7890',
        ]),
      ).rejects.toThrow()

      expect(
        throwerErrorGuard.InternalServerErrorException,
      ).toHaveBeenCalledWith(
        ErrorsEnum.INTERNAL_SERVER_ERROR,
        'Failed to get communal waste tax data from Noris',
        undefined,
        mockError,
        undefined,
      )
    })
  })

  describe('groupCommunalWasteTaxRecords', () => {
    describe('grouping by variable symbol', () => {
      it('should group records by variabilny_symbol', () => {
        const records: NorisCommunalWasteTax[] = [
          testCommunalWasteTax1,
          testCommunalWasteTax2,
          testCommunalWasteTax3,
        ]

        const result = service['groupCommunalWasteTaxRecords'](records)

        expect(result).toHaveLength(2)
        expect(result[0].variabilny_symbol).toBe('3425030150')
        expect(result[1].variabilny_symbol).toBe('3425030151')
      })

      it('should handle multiple records with same variable symbol', () => {
        const records: NorisCommunalWasteTax[] = [
          testCommunalWasteTax1,
          testCommunalWasteTax2,
        ]

        const result = service['groupCommunalWasteTaxRecords'](records)

        expect(result).toHaveLength(1)
        expect(result[0].variabilny_symbol).toBe('3425030151')
        expect(result[0].addresses).toHaveLength(2)
      })
    })

    describe('grouping by address within variable symbol', () => {
      it('should group containers by address (street + orientation number)', () => {
        const records: NorisCommunalWasteTax[] = [
          testCommunalWasteTax1,
          testCommunalWasteTax2,
        ]

        const result = service['groupCommunalWasteTaxRecords'](records)

        expect(result[0].addresses).toHaveLength(2)
        expect(result[0].addresses[0].addressDetail).toEqual({
          street: 'Hlavná ulica',
          orientationNumber: '22',
        })
        expect(result[0].addresses[1].addressDetail).toEqual({
          street: 'Hlavná ulica',
          orientationNumber: '18',
        })
      })

      it('should handle multiple addresses for one variable symbol', () => {
        const records: NorisCommunalWasteTax[] = [
          testCommunalWasteTax1,
          testCommunalWasteTax2,
          testCommunalWasteTax4,
        ]

        const result = service['groupCommunalWasteTaxRecords'](records)

        const firstGroup = result.find(
          (r) => r.variabilny_symbol === '3425030151',
        )
        expect(firstGroup?.addresses).toHaveLength(2)

        const secondGroup = result.find(
          (r) => r.variabilny_symbol === '3425030152',
        )
        expect(secondGroup?.addresses).toHaveLength(1)
      })

      it('should handle records with same variable symbol but different addresses', () => {
        const records: NorisCommunalWasteTax[] = [
          testCommunalWasteTax1,
          {
            ...testCommunalWasteTax1,
            ulica: 'Iná ulica',
            orientacne_cislo: '99',
          },
        ]

        const result = service['groupCommunalWasteTaxRecords'](records)

        expect(result).toHaveLength(1)
        expect(result[0].addresses).toHaveLength(2)
        expect(result[0].addresses[0].addressDetail.street).toBe('Hlavná ulica')
        expect(result[0].addresses[1].addressDetail.street).toBe('Iná ulica')
      })
    })

    describe('container data', () => {
      it('should map container properties correctly', () => {
        const records: NorisCommunalWasteTax[] = [testCommunalWasteTax1]

        const result = service['groupCommunalWasteTaxRecords'](records)

        const container = result[0].addresses[0].containers[0]
        expect(container).toEqual({
          objem_nadoby: 120,
          pocet_nadob: 1,
          pocet_odvozov: 52,
          sadzba: 4.314,
          poplatok: 224.33,
          druh_nadoby: 'N12',
        })
      })

      it('should handle multiple containers at same address', () => {
        const records: NorisCommunalWasteTax[] = [
          testCommunalWasteTax1,
          {
            ...testCommunalWasteTax1,
            objem_nadoby: 240,
            druh_nadoby: 'N24',
            poplatok: 500,
          },
        ]

        const result = service['groupCommunalWasteTaxRecords'](records)

        expect(result[0].addresses[0].containers).toHaveLength(2)
        expect(result[0].addresses[0].containers[0].objem_nadoby).toBe(120)
        expect(result[0].addresses[0].containers[1].objem_nadoby).toBe(240)
      })
    })

    describe('base data extraction', () => {
      it('should extract base tax data from first record in group', () => {
        const records: NorisCommunalWasteTax[] = [
          testCommunalWasteTax1,
          testCommunalWasteTax2,
        ]

        const result = service['groupCommunalWasteTaxRecords'](records)

        expect(result[0].cislo_poradace).toBe(
          testCommunalWasteTax1.cislo_poradace,
        )
        expect(result[0].cislo_subjektu).toBe(
          testCommunalWasteTax1.cislo_subjektu,
        )
        expect(result[0].rok).toBe(testCommunalWasteTax1.rok)
        expect(result[0].dan_spolu).toBe(testCommunalWasteTax1.dan_spolu)
        expect(result[0].subjekt_nazev).toBe(
          testCommunalWasteTax1.subjekt_nazev,
        )
      })

      it('should include all fields from NorisBaseTaxSchema', () => {
        const records: NorisCommunalWasteTax[] = [testCommunalWasteTax1]

        const result = service['groupCommunalWasteTaxRecords'](records)

        // Check that base fields are present
        expect(result[0]).toHaveProperty('cislo_poradace')
        expect(result[0]).toHaveProperty('cislo_subjektu')
        expect(result[0]).toHaveProperty('adresa_tp_sidlo')
        expect(result[0]).toHaveProperty('cislo_konania')
        expect(result[0]).toHaveProperty('datum_platnosti')
        expect(result[0]).toHaveProperty('variabilny_symbol')
        expect(result[0]).toHaveProperty('specificky_symbol')
        expect(result[0]).toHaveProperty('rok')
        expect(result[0]).toHaveProperty('dan_spolu')
        expect(result[0]).toHaveProperty('uhrazeno')
        expect(result[0]).toHaveProperty('subjekt_refer')
        expect(result[0]).toHaveProperty('subjekt_nazev')
        expect(result[0]).toHaveProperty('akt_datum')
        expect(result[0]).toHaveProperty('vyb_nazov')
      })

      it('should add type: TaxType.KO to grouped data', () => {
        const records: NorisCommunalWasteTax[] = [testCommunalWasteTax1]

        const result = service['groupCommunalWasteTaxRecords'](records)

        expect(result[0].type).toBe(TaxType.KO)
      })
    })

    describe('edge cases', () => {
      it('should handle empty array', () => {
        const result = service['groupCommunalWasteTaxRecords']([])

        expect(result).toEqual([])
      })

      it('should handle single record', () => {
        const records: NorisCommunalWasteTax[] = [testCommunalWasteTax1]

        const result = service['groupCommunalWasteTaxRecords'](records)

        expect(result).toHaveLength(1)
        expect(result[0].addresses).toHaveLength(1)
        expect(result[0].addresses[0].containers).toHaveLength(1)
      })

      it('should handle null/undefined street and orientation number values', () => {
        const records: NorisCommunalWasteTax[] = [testCommunalWasteTax5]

        const result = service['groupCommunalWasteTaxRecords'](records)

        expect(result).toHaveLength(1)
        expect(result[0].addresses[0].addressDetail).toEqual({
          street: null,
          orientationNumber: null,
        })
      })

      it('should handle records with only one address', () => {
        const records: NorisCommunalWasteTax[] = [testCommunalWasteTax3]

        const result = service['groupCommunalWasteTaxRecords'](records)

        expect(result).toHaveLength(1)
        expect(result[0].addresses).toHaveLength(1)
      })

      it('should preserve all base data fields correctly', () => {
        const records: NorisCommunalWasteTax[] = [testCommunalWasteTax6]

        const result = service['groupCommunalWasteTaxRecords'](records)

        expect(result[0].TXTSPL1).toBe(testCommunalWasteTax6.TXTSPL1)
        expect(result[0].SPL1).toBe(testCommunalWasteTax6.SPL1)
        expect(result[0].TXTSPL4_1).toBe(testCommunalWasteTax6.TXTSPL4_1)
        expect(result[0].SPL4_1).toBe(testCommunalWasteTax6.SPL4_1)
        expect(result[0].vyb_email).toBe(testCommunalWasteTax6.vyb_email)
        expect(result[0].vyb_telefon_prace).toBe(
          testCommunalWasteTax6.vyb_telefon_prace,
        )
        expect(result[0].ICO_RC).toBe(testCommunalWasteTax6.ICO_RC)
      })

      it('should group multiple containers at the same address correctly', () => {
        const sameAddress: NorisCommunalWasteTax[] = [
          testCommunalWasteTax1,
          {
            ...testCommunalWasteTax1,
            objem_nadoby: 60,
            druh_nadoby: 'N6',
            poplatok: 150,
          },
          {
            ...testCommunalWasteTax1,
            objem_nadoby: 240,
            druh_nadoby: 'N24',
            poplatok: 450,
          },
        ]

        const result = service['groupCommunalWasteTaxRecords'](sameAddress)

        expect(result).toHaveLength(1)
        expect(result[0].addresses).toHaveLength(1)
        expect(result[0].addresses[0].containers).toHaveLength(3)
        expect(result[0].addresses[0].containers[0].objem_nadoby).toBe(120)
        expect(result[0].addresses[0].containers[1].objem_nadoby).toBe(60)
        expect(result[0].addresses[0].containers[2].objem_nadoby).toBe(240)
      })

      it('should handle complex scenario with multiple variable symbols and addresses', () => {
        const records: NorisCommunalWasteTax[] = [
          testCommunalWasteTax1,
          testCommunalWasteTax2,
          testCommunalWasteTax3,
          testCommunalWasteTax4,
          testCommunalWasteTax5,
          testCommunalWasteTax6,
        ]

        const result = service['groupCommunalWasteTaxRecords'](records)

        expect(result).toHaveLength(5) // 5 unique variable symbols
        expect(
          result.find((r) => r.variabilny_symbol === '3425030151')?.addresses,
        ).toHaveLength(2)
        expect(
          result.find((r) => r.variabilny_symbol === '3425030150')?.addresses,
        ).toHaveLength(1)
        expect(
          result.find((r) => r.variabilny_symbol === '3425030152')?.addresses,
        ).toHaveLength(1)
        expect(
          result.find((r) => r.variabilny_symbol === '9876543210')?.addresses,
        ).toHaveLength(1)
        expect(
          result.find((r) => r.variabilny_symbol === '4567890123')?.addresses,
        ).toHaveLength(1)
      })
    })
  })
})

/* eslint-enable no-secrets/no-secrets */
