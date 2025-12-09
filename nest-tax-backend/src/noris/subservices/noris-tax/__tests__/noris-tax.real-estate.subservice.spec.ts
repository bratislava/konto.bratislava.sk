/* eslint-disable no-secrets/no-secrets */
import { createMock } from '@golevelup/ts-jest'
import { Test, TestingModule } from '@nestjs/testing'
import { TaxAdministrator, TaxPayer, TaxType } from '@prisma/client'
import * as mssql from 'mssql'
import { ResponseUserByBirthNumberDtoTaxDeliveryMethodAtLockDateEnum } from 'openapi-clients/city-account'

import prismaMock from '../../../../../test/singleton'
import { BloomreachService } from '../../../../bloomreach/bloomreach.service'
import { PrismaService } from '../../../../prisma/prisma.service'
import { generateItemizedRealEstateTaxDetail } from '../../../../tax/utils/helpers/tax.helper'
import { createTestingRealEstateTaxMock } from '../../../../tax/utils/testing-tax-mock'
import { getTaxDefinitionByType } from '../../../../tax-definitions/getTaxDefinitionByType'
import { TaxDefinition } from '../../../../tax-definitions/taxDefinitionsTypes'
import { ErrorsEnum } from '../../../../utils/guards/dtos/error.dto'
import ThrowerErrorGuard from '../../../../utils/guards/errors.guard'
import { CityAccountSubservice } from '../../../../utils/subservices/cityaccount.subservice'
import DatabaseSubservice from '../../../../utils/subservices/database.subservice'
import { QrCodeSubservice } from '../../../../utils/subservices/qrcode.subservice'
import { TaxWithTaxPayer } from '../../../../utils/types/types.prisma'
import { CustomErrorNorisTypesEnum } from '../../../noris.errors'
import { AreaTypesEnum } from '../../../types/noris.enums'
import { NorisRealEstateTax } from '../../../types/noris.types'
import { NorisConnectionSubservice } from '../../noris-connection.subservice'
import { NorisPaymentSubservice } from '../../noris-payment.subservice'
import { NorisValidatorSubservice } from '../../noris-validator.subservice'
import { NorisTaxRealEstateSubservice } from '../noris-tax.real-estate.subservice'

jest.mock('../../../../tax-definitions/getTaxDefinitionByType', () => ({
  getTaxDefinitionByType: jest.fn(),
}))

const mockPLimitFn = (fn: any) => fn()
jest.mock('p-limit', () => {
  return jest.fn(() => mockPLimitFn)
})

jest.mock('mssql', () => ({
  Request: jest.fn().mockImplementation(() => ({
    input: jest.fn(),
    query: jest.fn().mockResolvedValue({ recordset: [] }),
  })),
  VarChar: jest.fn(),
  Int: jest.fn(),
}))

describe('NorisTaxRealEstateSubservice', () => {
  let service: NorisTaxRealEstateSubservice
  let connectionService: jest.Mocked<NorisConnectionSubservice>
  let cityAccountSubservice: jest.Mocked<CityAccountSubservice>
  let paymentSubservice: jest.Mocked<NorisPaymentSubservice>
  let throwerErrorGuard: jest.Mocked<ThrowerErrorGuard>

  const mockNorisData: NorisRealEstateTax[] = [
    {
      adresa_tp_sidlo: 'Test Address',
      cislo_poradace: 1,
      cislo_subjektu: 123,
      cislo_konania: 'KON123',
      variabilny_symbol: 'VS123',
      subjekt_refer: 'REF123',
      subjekt_nazev: 'Test Subject',
      rok: 2023,
      ulica_tb_cislo: 'Test Street 1',
      psc_ref_tb: '12345',
      psc_naz_tb: 'Test City',
      stat_nazov_plny: 'Slovakia',
      obec_nazev_tb: 'Test City',
      akt_datum: '2023-01-01',
      datum_platnosti: new Date('2023-12-31'),
      vyb_nazov: 'Test Office',
      vyb_telefon_prace: '+421123456789',
      vyb_email: 'test@test.sk',
      vyb_id: 1,
      dan_spolu: '1_000.00',
      dan_byty: '500.00',
      dan_pozemky: '300.00',
      dan_stavby: '200.00',
      dan_stavby_viac: '0.00',
      dan_stavby_SPOLU: '200.00',
      det_zaklad_dane_byt: '1_000.00',
      det_zaklad_dane_nebyt: '0.00',
      det_dan_byty_byt: '500.00',
      det_dan_byty_nebyt: '0.00',
      det_pozemky_DAN_A: '100.00',
      det_pozemky_DAN_B: '100.00',
      det_pozemky_DAN_C: '100.00',
      det_pozemky_DAN_D: '0.00',
      det_pozemky_DAN_E: '0.00',
      det_pozemky_DAN_F: '0.00',
      det_pozemky_DAN_G: '0.00',
      det_pozemky_DAN_H: '0.00',
      det_pozemky_ZAKLAD_A: '1_000.00',
      det_pozemky_ZAKLAD_B: '1_000.00',
      det_pozemky_ZAKLAD_C: '1_000.00',
      det_pozemky_ZAKLAD_D: '0.00',
      det_pozemky_ZAKLAD_E: '0.00',
      det_pozemky_ZAKLAD_F: '0.00',
      det_pozemky_ZAKLAD_G: '0.00',
      det_pozemky_ZAKLAD_H: '0.00',
      det_pozemky_VYMERA_A: '1000.00',
      det_pozemky_VYMERA_B: '1000.00',
      det_pozemky_VYMERA_C: '1000.00',
      det_pozemky_VYMERA_D: '0.00',
      det_pozemky_VYMERA_E: '0.00',
      det_pozemky_VYMERA_F: '0.00',
      det_pozemky_VYMERA_G: '0.00',
      det_pozemky_VYMERA_H: '0.00',
      det_stavba_DAN_A: '100.00',
      det_stavba_DAN_B: '100.00',
      det_stavba_DAN_C: '0.00',
      det_stavba_DAN_D: '0.00',
      det_stavba_DAN_E: '0.00',
      det_stavba_DAN_F: '0.00',
      det_stavba_DAN_G: '0.00',
      det_stavba_DAN_jH: '0.00',
      det_stavba_DAN_jI: '0.00',
      det_stavba_ZAKLAD_A: '1_000.00',
      det_stavba_ZAKLAD_B: '1_000.00',
      det_stavba_ZAKLAD_C: '0.00',
      det_stavba_ZAKLAD_D: '0.00',
      det_stavba_ZAKLAD_E: '0.00',
      det_stavba_ZAKLAD_F: '0.00',
      det_stavba_ZAKLAD_G: '0.00',
      det_stavba_ZAKLAD_jH: '0.00',
      det_stavba_ZAKLAD_jI: '0.00',
      det_stavba_DAN_H: '0.00',
      det_stavba_ZAKLAD_H: '0.00',
      TXT_MENO: 'Test Name',
      TXT_UL: 'Test Street',
      TYP_USER: 'N',
      ICO_RC: '123456/7890',
      TXTSPL1: 'Test spl 1',
      SPL1: '1',
      TXTSPL4_1: 'Test spl 4.1',
      SPL4_1: '1',
      TXTSPL4_2: 'Test spl 4.2',
      SPL4_2: '2',
      TXTSPL4_3: 'Test spl 4.3',
      SPL4_3: '3',
      TXTSPL4_4: 'Test spl 4.4',
      SPL4_4: '4',
      specificky_symbol: '2024100000',
      uhrazeno: 0,
    },
  ]

  const mockTaxDefinition = {
    type: TaxType.DZN,
    isUnique: true,
    mapNorisToTaxDetailData: jest.fn().mockReturnValue([
      {
        type: AreaTypesEnum.APARTMENT,
        amount: 30_000,
      },
      {
        type: AreaTypesEnum.GROUND,
        amount: 50_000,
      },
      {
        type: AreaTypesEnum.CONSTRUCTION,
        amount: 20_000,
      },
    ]),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NorisTaxRealEstateSubservice,
        {
          provide: NorisConnectionSubservice,
          useValue: createMock<NorisConnectionSubservice>(),
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
          provide: ThrowerErrorGuard,
          useValue: createMock<ThrowerErrorGuard>(),
        },
        {
          provide: BloomreachService,
          useValue: createMock<BloomreachService>(),
        },
        { provide: QrCodeSubservice, useValue: createMock<QrCodeSubservice>() },
        { provide: PrismaService, useValue: prismaMock },
        {
          provide: NorisValidatorSubservice,
          useValue: createMock<NorisValidatorSubservice>(),
        },
        {
          provide: DatabaseSubservice,
          useValue: createMock<DatabaseSubservice>(),
        },
      ],
    }).compile()

    service = module.get<NorisTaxRealEstateSubservice>(
      NorisTaxRealEstateSubservice,
    )
    connectionService = module.get(NorisConnectionSubservice)
    cityAccountSubservice = module.get(CityAccountSubservice)
    paymentSubservice = module.get(NorisPaymentSubservice)
    throwerErrorGuard = module.get(ThrowerErrorGuard)
    ;(getTaxDefinitionByType as jest.Mock).mockReturnValue(mockTaxDefinition)

    Object.defineProperty(service, 'logger', {
      value: {
        log: jest.fn(),
        error: jest.fn(),
        warn: jest.fn(),
      },
      writable: true,
    })

    jest
      .spyOn(service['norisValidatorSubservice'], 'validateNorisData')
      .mockImplementation((schema, data) => {
        if (Array.isArray(data)) {
          return data.map((item) => schema.parse(item))
        }
        return schema.parse(data)
      })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('constructor', () => {
    it('should be defined', () => {
      expect(service).toBeDefined()
    })
  })

  describe('getTaxDataByYearAndBirthNumber', () => {
    it('should fetch tax data from Noris successfully', async () => {
      const mockConnection = {}
      const mockRequest = {
        input: jest.fn(),
        query: jest.fn().mockResolvedValue({ recordset: mockNorisData }),
      }

      connectionService.withConnection.mockImplementation(async (callback) => {
        return callback(mockConnection as any)
      })

      const { Request } = await import('mssql')
      ;(Request as unknown as jest.Mock).mockImplementation(
        () => mockRequest as any,
      )

      const result = await service['getTaxDataByYearAndBirthNumber'](2023, [
        '123456/7890',
      ])

      expect(connectionService.withConnection).toHaveBeenCalled()
      expect(mockRequest.input).toHaveBeenCalledWith('year', mssql.Int, 2023)
      expect(mockRequest.input).toHaveBeenCalledWith(
        'birth_number0',
        mssql.VarChar(expect.any(Number)),
        '123456/7890',
      )
      expect(result).toEqual(mockNorisData)
    })

    it('should handle database connection errors', async () => {
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
        service['getTaxDataByYearAndBirthNumber'](2023, ['123456/7890']),
      ).rejects.toThrow()

      expect(
        throwerErrorGuard.InternalServerErrorException,
      ).toHaveBeenCalledWith(
        ErrorsEnum.INTERNAL_SERVER_ERROR,
        'Failed to get taxes from Noris',
        undefined,
        undefined,
        mockError,
      )
    })

    it('should handle multiple birth numbers correctly', async () => {
      const mockConnection = {}
      const mockRequest = {
        input: jest.fn(),
        query: jest.fn().mockResolvedValue({ recordset: mockNorisData }),
      }

      connectionService.withConnection.mockImplementation(async (callback) => {
        return callback(mockConnection as any)
      })

      const { Request } = await import('mssql')
      ;(Request as unknown as jest.Mock).mockImplementation(
        () => mockRequest as any,
      )

      const birthNumbers = ['123456/7890', '987654/3210']
      await service['getTaxDataByYearAndBirthNumber'](2023, birthNumbers)

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
    })
  })

  describe('getAndProcessNorisTaxDataByBirthNumberAndYear', () => {
    it('should process Noris tax data successfully', async () => {
      jest
        .spyOn(service as any, 'getTaxDataByYearAndBirthNumber')
        .mockResolvedValue(mockNorisData)
      jest
        .spyOn(service as any, 'processNorisTaxData')
        .mockResolvedValue({ birthNumbers: ['123456/7890'] })

      const result =
        await service.getAndProcessNorisTaxDataByBirthNumberAndYear(2023, [
          '123456/7890',
        ])

      expect(result).toEqual({
        birthNumbers: ['123456/7890'],
        foundInNoris: ['123456/7890'],
      })
    })
  })

  describe('processNorisTaxData', () => {
    const mockUserData = {
      '123456/7890': {
        birthNumber: '123456/7890',
        email: 'test@test.sk',
        externalId: 'ext123',
        taxDeliveryMethodAtLockDate:
          ResponseUserByBirthNumberDtoTaxDeliveryMethodAtLockDateEnum.Edesk,
        userAttribute: {},
      },
    }

    beforeEach(() => {
      cityAccountSubservice.getUserDataAdminBatch.mockResolvedValue(
        mockUserData,
      )
      prismaMock.tax.findMany.mockResolvedValue([])
      paymentSubservice.updatePaymentsFromNorisWithData.mockResolvedValue({
        created: 0,
        alreadyCreated: 0,
      })

      jest
        .spyOn(service as any, 'processTaxRecordFromNoris')
        .mockImplementation(() => {})
    })

    it('should process Noris tax data and return birth numbers', async () => {
      jest
        .spyOn(service as any, 'processTaxRecordFromNoris')
        .mockImplementation(
          async (taxDefinition, birthNumbersResult, norisItem) => {
            ;(birthNumbersResult as Set<string>).add((norisItem as any).ICO_RC)
          },
        )

      const result = await service.processNorisTaxData(mockNorisData, 2023, {})

      expect(cityAccountSubservice.getUserDataAdminBatch).toHaveBeenCalledWith(
        mockNorisData.map((record) => record.ICO_RC),
      )
      expect(getTaxDefinitionByType).toHaveBeenCalledWith(TaxType.DZN)
      expect(prismaMock.tax.findMany).toHaveBeenCalledWith({
        select: {
          taxPayer: {
            select: {
              birthNumber: true,
            },
          },
        },
        where: {
          year: 2023,
          taxPayer: {
            birthNumber: {
              in: mockNorisData.map((record) => record.ICO_RC),
            },
          },
          type: TaxType.DZN,
        },
      })
      expect(
        paymentSubservice.updatePaymentsFromNorisWithData,
      ).toHaveBeenCalledWith(mockNorisData)
      expect(result).toEqual({ birthNumbers: ['123456/7890'] })
    })

    it('should filter out existing taxes', async () => {
      const existingTaxes = [
        {
          taxPayer: {
            birthNumber: '123456/7890',
          },
        },
      ] as any
      prismaMock.tax.findMany.mockResolvedValue(existingTaxes)

      const result = await service.processNorisTaxData(mockNorisData, 2023, {})

      expect(service['processTaxRecordFromNoris']).not.toHaveBeenCalled()
      expect(result).toEqual({ birthNumbers: [] })
    })

    it('should handle empty Noris data', async () => {
      const result = await service.processNorisTaxData([], 2023, {})

      expect(cityAccountSubservice.getUserDataAdminBatch).toHaveBeenCalledWith(
        [],
      )
      expect(result).toEqual({ birthNumbers: [] })
    })
  })

  describe('getNorisTaxDataByBirthNumberAndYearAndUpdateExistingRecords', () => {
    const mockUserData = {
      '123456/7890': {
        birthNumber: '123456/7890',
        email: 'test@test.sk',
        externalId: 'ext123',
        taxDeliveryMethodAtLockDate:
          ResponseUserByBirthNumberDtoTaxDeliveryMethodAtLockDateEnum.Edesk,
        userAttribute: {},
      },
    }

    beforeEach(() => {
      cityAccountSubservice.getUserDataAdminBatch.mockResolvedValue(
        mockUserData,
      )
      prismaMock.tax.findMany.mockResolvedValue([
        {
          id: 1,
          taxPayer: {
            birthNumber: '123456/7890',
          },
        },
      ] as any)

      prismaMock.$transaction.mockImplementation(async (callback: any) => {
        const mockTx = {
          taxInstallment: {
            deleteMany: jest.fn().mockResolvedValue({}),
          },
          taxDetail: {
            deleteMany: jest.fn().mockResolvedValue({}),
          },
        }
        return callback(mockTx as any)
      })

      jest.spyOn(service as any, 'insertTaxDataToDatabase').mockResolvedValue({
        id: 1,
        taxPayer: { id: 1 },
      })
    })

    it('should update existing tax records successfully', async () => {
      jest
        .spyOn(service as any, 'getTaxDataByYearAndBirthNumber')
        .mockResolvedValue(mockNorisData)

      const result =
        await service.getNorisTaxDataByBirthNumberAndYearAndUpdateExistingRecords(
          2023,
          ['123456/7890'],
        )

      expect(result).toEqual({ updated: 1 })
      expect(cityAccountSubservice.getUserDataAdminBatch).toHaveBeenCalledWith(
        mockNorisData.map((record) => record.ICO_RC),
      )
      expect(prismaMock.tax.findMany).toHaveBeenCalledWith({
        select: {
          id: true,
          taxPayer: {
            select: {
              birthNumber: true,
            },
          },
        },
        where: {
          year: 2023,
          taxPayer: {
            birthNumber: {
              in: mockNorisData.map((record) => record.ICO_RC),
            },
          },
          type: TaxType.DZN,
        },
      })
    })

    it('should handle errors when fetching Noris data', async () => {
      const mockError = new Error('Noris connection failed')
      jest
        .spyOn(service as any, 'getTaxDataByYearAndBirthNumber')
        .mockRejectedValue(mockError)

      throwerErrorGuard.InternalServerErrorException.mockImplementation(() => {
        throw mockError
      })

      await expect(
        service.getNorisTaxDataByBirthNumberAndYearAndUpdateExistingRecords(
          2023,
          ['123456/7890'],
        ),
      ).rejects.toThrow()

      expect(
        throwerErrorGuard.InternalServerErrorException,
      ).toHaveBeenCalledWith(
        CustomErrorNorisTypesEnum.GET_TAXES_FROM_NORIS_ERROR,
        'Failed to get taxes from Noris',
        undefined,
        undefined,
        mockError,
      )
    })

    it('should skip records that do not exist in database', async () => {
      prismaMock.tax.findMany.mockResolvedValue([])
      jest
        .spyOn(service as any, 'getTaxDataByYearAndBirthNumber')
        .mockResolvedValue(mockNorisData)

      const result =
        await service.getNorisTaxDataByBirthNumberAndYearAndUpdateExistingRecords(
          2023,
          ['123456/7890'],
        )

      expect(result).toEqual({ updated: 0 })
    })

    it('should handle database transaction errors gracefully', async () => {
      const mockLogger = jest.spyOn(service['logger'], 'error')
      const mockError = new Error('Transaction failed')

      prismaMock.$transaction.mockRejectedValue(mockError)
      jest
        .spyOn(service as any, 'getTaxDataByYearAndBirthNumber')
        .mockResolvedValue(mockNorisData)

      const result =
        await service.getNorisTaxDataByBirthNumberAndYearAndUpdateExistingRecords(
          2023,
          ['123456/7890'],
        )

      expect(mockLogger).toHaveBeenCalled()
      expect(result).toEqual({ updated: 0 })
    })
  })

  describe('error handling', () => {
    it('should handle connection service errors properly', async () => {
      const mockError = new Error('Connection failed')

      throwerErrorGuard.InternalServerErrorException.mockImplementation(() => {
        throw mockError
      })

      connectionService.withConnection.mockImplementation(
        async (callback, errorHandler) => {
          return errorHandler(mockError)
        },
      )

      await expect(
        service['getTaxDataByYearAndBirthNumber'](2023, ['123456/7890']),
      ).rejects.toThrow()

      expect(
        throwerErrorGuard.InternalServerErrorException,
      ).toHaveBeenCalledWith(
        ErrorsEnum.INTERNAL_SERVER_ERROR,
        'Failed to get taxes from Noris',
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
        service['getTaxDataByYearAndBirthNumber'](2023, ['123456/7890']),
      ).rejects.toThrow()

      expect(
        throwerErrorGuard.InternalServerErrorException,
      ).toHaveBeenCalledWith(
        ErrorsEnum.INTERNAL_SERVER_ERROR,
        'Failed to get taxes from Noris',
        undefined,
        mockError,
        undefined,
      )
    })
  })

  describe('concurrency handling', () => {
    it('should use concurrency limit for processing', async () => {
      const mockConcurrencyLimit = jest.fn((fn) => fn())

      Object.defineProperty(service, 'concurrencyLimit', {
        value: mockConcurrencyLimit,
        writable: true,
      })

      cityAccountSubservice.getUserDataAdminBatch.mockResolvedValue({
        '123456/7890': {
          birthNumber: '123456/7890',
          email: 'test@test.sk',
          externalId: 'ext123',
          taxDeliveryMethodAtLockDate:
            ResponseUserByBirthNumberDtoTaxDeliveryMethodAtLockDateEnum.Edesk,
          userAttribute: {},
        },
      })
      prismaMock.tax.findMany.mockResolvedValue([])
      paymentSubservice.updatePaymentsFromNorisWithData.mockResolvedValue({
        created: 0,
        alreadyCreated: 0,
      })
      jest
        .spyOn(service as any, 'processTaxRecordFromNoris')
        .mockImplementation(() => {})

      await service.processNorisTaxData(mockNorisData, 2023, {})

      expect(mockConcurrencyLimit).toHaveBeenCalled()
    })
  })

  describe('getNorisTaxDataByBirthNumberAndYearAndUpdateExistingRecords - insertTaxDataToDatabase coverage', () => {
    const mockUserData = {
      '123456/7890': {
        birthNumber: '123456/7890',
        email: 'test@test.sk',
        externalId: 'ext123',
        taxDeliveryMethodAtLockDate:
          ResponseUserByBirthNumberDtoTaxDeliveryMethodAtLockDateEnum.Edesk,
        userAttribute: {},
      },
    }

    beforeEach(() => {
      cityAccountSubservice.getUserDataAdminBatch.mockResolvedValue(
        mockUserData,
      )
      prismaMock.tax.findMany.mockResolvedValue([
        {
          id: 1,
          taxPayer: {
            birthNumber: '123456/7890',
          },
        },
      ] as any)

      prismaMock.$transaction.mockImplementation(async (callback: any) => {
        const mockTx = {
          taxInstallment: {
            deleteMany: jest.fn().mockResolvedValue({}),
          },
          taxDetail: {
            deleteMany: jest.fn().mockResolvedValue({}),
          },
        }
        return callback(mockTx as any)
      })
    })

    it('should call insertTaxDataToDatabase and increment count when tax is returned', async () => {
      const mockTax = {
        id: 1,
        taxPayer: { id: 1 },
        order: 1,
      }

      jest
        .spyOn(service as any, 'getTaxDataByYearAndBirthNumber')
        .mockResolvedValue(mockNorisData)
      jest
        .spyOn(service as any, 'insertTaxDataToDatabase')
        .mockResolvedValue(mockTax)

      const result =
        await service.getNorisTaxDataByBirthNumberAndYearAndUpdateExistingRecords(
          2023,
          ['123456/7890'],
        )

      expect(result).toEqual({ updated: 1 })
      expect(service['insertTaxDataToDatabase']).toHaveBeenCalledWith(
        mockTaxDefinition,
        mockNorisData[0],
        2023,
        expect.any(Object),
        mockUserData['123456/7890'],
      )
    })

    it('should not increment count when insertTaxDataToDatabase returns null', async () => {
      jest
        .spyOn(service as any, 'getTaxDataByYearAndBirthNumber')
        .mockResolvedValue(mockNorisData)
      jest
        .spyOn(service as any, 'insertTaxDataToDatabase')
        .mockResolvedValue(null)

      const result =
        await service.getNorisTaxDataByBirthNumberAndYearAndUpdateExistingRecords(
          2023,
          ['123456/7890'],
        )

      expect(result).toEqual({ updated: 0 })
    })
  })

  describe('AbstractNorisTaxSubservice', () => {
    describe('insertTaxDataToDatabase', () => {
      const mockTaxDefinitionForInsert: TaxDefinition<typeof TaxType.DZN> = {
        type: TaxType.DZN,
        isUnique: true,
        readyToImportFieldName: 'readyToImportDZN',
        paymentCalendarThreshold: 0,
        numberOfInstallments: 3,
        installmentDueDates: {
          second: '09-01',
          third: '11-01',
        },
        generateItemizedTaxDetail: generateItemizedRealEstateTaxDetail,
        createTestingTaxMock: createTestingRealEstateTaxMock,
        mapNorisToTaxDetailData: jest.fn().mockReturnValue([
          {
            type: AreaTypesEnum.GROUND,
            amount: 30_000,
          },
          {
            type: AreaTypesEnum.APARTMENT,
            amount: 50_000,
          },
          {
            type: AreaTypesEnum.CONSTRUCTION,
            amount: 20_000,
          },
        ]),
      }

      const mockUserData = {
        birthNumber: '123456/7890',
        email: 'test@test.sk',
        externalId: 'ext123',
        taxDeliveryMethodAtLockDate:
          ResponseUserByBirthNumberDtoTaxDeliveryMethodAtLockDateEnum.Edesk,
        userAttribute: {},
      }

      beforeEach(() => {
        // eslint-disable-next-line prefer-destructuring
        const qrCodeSubservice = service['qrCodeSubservice']
        qrCodeSubservice.createQrCode = jest.fn().mockResolvedValue('qr-code')

        prismaMock.taxAdministrator.upsert.mockResolvedValue({
          id: 1,
          name: 'Test Administrator',
        } as TaxAdministrator)
        prismaMock.taxPayer.upsert.mockResolvedValue({
          id: 1,
          birthNumber: '123456/7890',
        } as TaxPayer)
        prismaMock.tax.upsert.mockResolvedValue({
          id: 1,
          order: 1,
          taxPayer: { id: 1 },
        } as TaxWithTaxPayer)
        prismaMock.taxInstallment.createMany.mockResolvedValue({ count: 0 })
      })

      it('should insert tax data to database successfully with unique tax', async () => {
        const result = await service['insertTaxDataToDatabase'](
          mockTaxDefinitionForInsert,
          mockNorisData[0],
          2023,
          prismaMock,
          mockUserData,
        )

        expect(result).toEqual({
          id: 1,
          order: 1,
          taxPayer: { id: 1 },
        })
        expect(
          mockTaxDefinitionForInsert.mapNorisToTaxDetailData,
        ).toHaveBeenCalledWith(mockNorisData[0])
      })

      it('should insert tax data to database successfully with non-unique tax', async () => {
        const nonUniqueTaxDefinition = {
          ...mockTaxDefinitionForInsert,
          isUnique: false,
        }

        const result = await service['insertTaxDataToDatabase'](
          nonUniqueTaxDefinition,
          mockNorisData[0],
          2023,
          prismaMock,
          mockUserData,
        )

        expect(result).toEqual({
          id: 1,
          order: 1,
          taxPayer: { id: 1 },
        })
      })

      it('should handle null user data from city account', async () => {
        const result = await service['insertTaxDataToDatabase'](
          mockTaxDefinitionForInsert,
          mockNorisData[0],
          2023,
          prismaMock,
          null,
        )

        expect(result).toEqual({
          id: 1,
          order: 1,
          taxPayer: { id: 1 },
        })
      })
    })

    describe('processTaxRecordFromNoris', () => {
      const mockTaxDefinitionForProcess: TaxDefinition<typeof TaxType.DZN> = {
        type: TaxType.DZN,
        isUnique: true,
        readyToImportFieldName: 'readyToImportDZN',
        paymentCalendarThreshold: 0,
        numberOfInstallments: 3,
        installmentDueDates: {
          second: '09-01',
          third: '11-01',
        },
        generateItemizedTaxDetail: generateItemizedRealEstateTaxDetail,
        createTestingTaxMock: createTestingRealEstateTaxMock,
        mapNorisToTaxDetailData: jest.fn().mockReturnValue([
          {
            type: AreaTypesEnum.GROUND,
            amount: 30_000,
          },
          {
            type: AreaTypesEnum.APARTMENT,
            amount: 50_000,
          },
          {
            type: AreaTypesEnum.CONSTRUCTION,
            amount: 20_000,
          },
        ]),
      }

      const mockUserData = {
        '123456/7890': {
          birthNumber: '123456/7890',
          email: 'test@test.sk',
          externalId: 'ext123',
          taxDeliveryMethodAtLockDate:
            ResponseUserByBirthNumberDtoTaxDeliveryMethodAtLockDateEnum.Edesk,
          userAttribute: {},
        },
      }

      let bloomreachService: any

      beforeEach(() => {
        // eslint-disable-next-line prefer-destructuring
        const qrCodeSubservice = service['qrCodeSubservice']
        qrCodeSubservice.createQrCode = jest.fn().mockResolvedValue('qr-code')

        bloomreachService = service['bloomreachService']
        bloomreachService.trackEventTax = jest.fn().mockResolvedValue(true)

        prismaMock.$transaction.mockImplementation(async (callback: any) => {
          const mockTx = {
            taxAdministrator: {
              upsert: jest.fn().mockResolvedValue({
                id: 1,
                name: 'Test Administrator',
              }),
            },
            taxPayer: {
              upsert: jest.fn().mockResolvedValue({
                id: 1,
                birthNumber: '123456/7890',
              }),
            },
            taxPayerTaxAdministrator: {
              upsert: jest.fn().mockResolvedValue({}),
            },
            tax: {
              upsert: jest.fn().mockResolvedValue({
                id: 1,
                order: 1,
                taxPayer: { id: 1 },
              }),
            },
            taxInstallment: {
              createMany: jest.fn().mockResolvedValue({}),
            },
            taxDetail: {
              createMany: jest.fn().mockResolvedValue({}),
            },
          }
          return callback(mockTx as any)
        })
      })

      it('should process tax record from Noris successfully', async () => {
        const birthNumbersResult = new Set<string>()

        await service['processTaxRecordFromNoris'](
          mockTaxDefinitionForProcess,
          birthNumbersResult,
          mockNorisData[0],
          mockUserData,
          2023,
        )

        expect(birthNumbersResult.has('123456/7890')).toBe(true)
        expect(bloomreachService.trackEventTax).toHaveBeenCalledWith(
          {
            amount: 100_000,
            year: 2023,
            delivery_method:
              ResponseUserByBirthNumberDtoTaxDeliveryMethodAtLockDateEnum.Edesk,
            taxType: TaxType.DZN,
            order: 1,
          },
          'ext123',
        )
      })

      it('should skip processing when user data is not found', async () => {
        const birthNumbersResult = new Set<string>()
        const emptyUserData = {}

        await service['processTaxRecordFromNoris'](
          mockTaxDefinitionForProcess,
          birthNumbersResult,
          mockNorisData[0],
          emptyUserData,
          2023,
        )

        expect(birthNumbersResult.size).toBe(0)
        expect(bloomreachService.trackEventTax).not.toHaveBeenCalled()
      })

      it('should handle bloomreach tracking failure', async () => {
        const birthNumbersResult = new Set<string>()

        bloomreachService.trackEventTax = jest.fn().mockResolvedValue(false)

        await service['processTaxRecordFromNoris'](
          mockTaxDefinitionForProcess,
          birthNumbersResult,
          mockNorisData[0],
          mockUserData,
          2023,
        )

        expect(birthNumbersResult.has('123456/7890')).toBe(false)
        expect(
          throwerErrorGuard.InternalServerErrorException,
        ).toHaveBeenCalledWith(
          ErrorsEnum.INTERNAL_SERVER_ERROR,
          'Error in send Tax data to Bloomreach for tax payer with ID 1 and year 2023',
        )
      })

      it('should handle database transaction errors', async () => {
        const birthNumbersResult = new Set<string>()
        const mockLogger = jest.spyOn(service['logger'], 'error')
        const mockError = new Error('Database error')

        prismaMock.$transaction.mockRejectedValue(mockError)

        await service['processTaxRecordFromNoris'](
          mockTaxDefinitionForProcess,
          birthNumbersResult,
          mockNorisData[0],
          mockUserData,
          2023,
        )

        expect(birthNumbersResult.has('123456/7890')).toBe(false)
        expect(mockLogger).toHaveBeenCalled()
      })

      it('should handle bloomreach tracking errors', async () => {
        const birthNumbersResult = new Set<string>()
        const mockLogger = jest.spyOn(service['logger'], 'error')
        const mockError = new Error('Bloomreach error')

        bloomreachService.trackEventTax = jest.fn().mockRejectedValue(mockError)

        await service['processTaxRecordFromNoris'](
          mockTaxDefinitionForProcess,
          birthNumbersResult,
          mockNorisData[0],
          mockUserData,
          2023,
        )

        expect(birthNumbersResult.has('123456/7890')).toBe(false)
        expect(mockLogger).toHaveBeenCalled()
      })
    })
  })
})

/* eslint-enable no-secrets/no-secrets */
