/* eslint-disable no-secrets/no-secrets */

import { createMock } from '@golevelup/ts-jest'
import { Test, TestingModule } from '@nestjs/testing'
import { TaxType } from '@prisma/client'
import isArray from 'lodash/isArray'

import prismaMock from '../../../test/singleton'
import { BloomreachService } from '../../bloomreach/bloomreach.service'
import { NorisService } from '../../noris/noris.service'
import { DeliveryMethod } from '../../noris/types/noris.enums'
import { PrismaService } from '../../prisma/prisma.service'
import { ErrorsEnum } from '../../utils/guards/dtos/error.dto'
import ThrowerErrorGuard from '../../utils/guards/errors.guard'
import { CityAccountSubservice } from '../../utils/subservices/cityaccount.subservice'
import { AdminService } from '../admin.service'
import {
  NorisRequestGeneral,
  RequestAdminCreateTestingTaxDto,
  RequestAdminCreateTestingTaxNorisData,
} from '../dtos/requests.dto'

describe('AdminService', () => {
  let adminService: AdminService
  let norisService: NorisService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
        {
          provide: CityAccountSubservice,
          useValue: createMock<CityAccountSubservice>(),
        },
        {
          provide: BloomreachService,
          useValue: createMock<BloomreachService>(),
        },
        {
          provide: NorisService,
          useValue: createMock<NorisService>(),
        },
        ThrowerErrorGuard,
      ],
    }).compile()

    adminService = module.get<AdminService>(AdminService)
    norisService = module.get<NorisService>(NorisService)
  })

  afterEach(async () => {
    jest.clearAllMocks()
  })

  it('should be defined', () => {
    expect(adminService).toBeDefined()
  })

  describe('updatePaymentsFromNoris', () => {
    it('should call getPaymentDataFromNoris if `type` is `fromToDate`', async () => {
      const request: NorisRequestGeneral = {
        type: 'fromToDate',
        data: {
          year: 2025,
          fromDate: '2022-1-1',
          toDate: '2022-1-2',
          overPayments: false,
        },
      }

      const getPaymentDataFromNorisSpy = jest
        .spyOn(norisService, 'getPaymentDataFromNoris')
        .mockResolvedValue([
          {
            variabilny_symbol: 'mock-1',
            uhrazeno: 1,
            specificky_symbol: 'mock-1',
          },
        ])

      const getPaymentDataFromNorisByVariableSymbolsSpy = jest
        .spyOn(norisService, 'getPaymentDataFromNorisByVariableSymbols')
        .mockResolvedValue([
          {
            variabilny_symbol: 'mock-2',
            uhrazeno: 1,
            specificky_symbol: 'mock-2',
          },
        ])

      const updatePaymentsFromNorisWithDataSpy = jest.spyOn(
        norisService,
        'updatePaymentsFromNorisWithData',
      )

      await adminService.updatePaymentsFromNoris(request)

      expect(getPaymentDataFromNorisSpy).toHaveBeenCalled()
      expect(getPaymentDataFromNorisByVariableSymbolsSpy).not.toHaveBeenCalled()
      expect(updatePaymentsFromNorisWithDataSpy).toHaveBeenCalledWith([
        {
          variabilny_symbol: 'mock-1',
          uhrazeno: 1,
          specificky_symbol: 'mock-1',
        },
      ])
    })

    it('should call getPaymentDataFromNorisByVariableSymbols if `type` is `variableSymbols`', async () => {
      const request: NorisRequestGeneral = {
        type: 'variableSymbols',
        data: {
          years: [2025],
          variableSymbols: ['0101010101'],
        },
      }

      const getPaymentDataFromNorisSpy = jest
        .spyOn(norisService, 'getPaymentDataFromNoris')
        .mockResolvedValue([
          {
            variabilny_symbol: 'mock-1',
            uhrazeno: 1,
            specificky_symbol: 'mock-1',
          },
        ])

      const getPaymentDataFromNorisByVariableSymbolsSpy = jest
        .spyOn(norisService, 'getPaymentDataFromNorisByVariableSymbols')
        .mockResolvedValue([
          {
            variabilny_symbol: 'mock-2',
            uhrazeno: 1,
            specificky_symbol: 'mock-2',
          },
        ])

      const updatePaymentsFromNorisWithDataSpy = jest.spyOn(
        norisService,
        'updatePaymentsFromNorisWithData',
      )

      await adminService.updatePaymentsFromNoris(request)

      expect(getPaymentDataFromNorisSpy).not.toHaveBeenCalled()
      expect(getPaymentDataFromNorisByVariableSymbolsSpy).toHaveBeenCalled()
      expect(updatePaymentsFromNorisWithDataSpy).toHaveBeenCalledWith([
        {
          variabilny_symbol: 'mock-2',
          uhrazeno: 1,
          specificky_symbol: 'mock-2',
        },
      ])
    })
  })

  describe('updateOverPaymentsFromNoris', () => {
    it('should suppress emails', async () => {
      const data = {
        fromDate: new Date('1970-1-1'),
        toDate: new Date('1970-1-2'),
      }
      const norisUpdateOverpaymentsDataFromNorisByDateRangeSpy = jest.spyOn(
        norisService,
        'updateOverpaymentsDataFromNorisByDateRange',
      )

      await adminService.updateOverpaymentsDataFromNorisByDateRange(data)

      expect(
        norisUpdateOverpaymentsDataFromNorisByDateRangeSpy,
      ).toHaveBeenCalledWith(data, { suppressEmail: true })
    })
  })
  describe('createTestingTax', () => {
    const mockTaxAdministrator = {
      name: 'John Doe',
      id: 123,
      createdAt: new Date('1970-1-1'),
      updatedAt: new Date('1970-1-1'),
      externalId: 'mock-external-id',
      phoneNumber: '00421900000000',
      email: 'mock@email.com',
    }

    const mockNorisData: RequestAdminCreateTestingTaxNorisData = {
      variableSymbol: 'mock-vs',
      deliveryMethod: DeliveryMethod.EDESK,
      fakeBirthNumber: '0123456789',
      nameSurname: 'John Doe',
      taxTotal: '300.04',
      alreadyPaid: 10.99,
      dateTaxRuling: new Date('1970-1-1'),
      isCancelled: false,
    }
    const mockRequest: RequestAdminCreateTestingTaxDto = {
      norisData: mockNorisData,
      year: 1970,
    }

    it('should create testing tax successfully for DZN type', async () => {
      prismaMock.tax.findFirst.mockResolvedValue(null)
      const processNorisTaxData = jest.spyOn(
        norisService,
        'processNorisTaxData',
      )
      prismaMock.taxAdministrator.findFirst.mockResolvedValue(
        mockTaxAdministrator,
      )

      await adminService.createTestingTax(mockRequest, TaxType.DZN)

      const processNorisTaxDataCallAgs = processNorisTaxData.mock.calls[0]
      const taxTypeCalled = processNorisTaxDataCallAgs[0]
      const norisDataCalled = processNorisTaxDataCallAgs[1]
      const yearCalled = processNorisTaxDataCallAgs[2]
      const optionsCalled = processNorisTaxDataCallAgs[3]

      expect(taxTypeCalled).toBe(TaxType.DZN)
      expect(
        parseFloat(norisDataCalled[0].SPL4_1.replace(',', '.')) +
          parseFloat(norisDataCalled[0].SPL4_2.replace(',', '.')) +
          parseFloat(norisDataCalled[0].SPL4_3.replace(',', '.')) +
          parseFloat(norisDataCalled[0].SPL4_4.replace(',', '.')),
      ).toEqual(parseFloat(mockNorisData.taxTotal.replace(',', '.')))
      expect(isArray(norisDataCalled)).toBe(true)
      expect(yearCalled).toBe(1970)
      expect(optionsCalled).toStrictEqual({
        prepareOnly: false,
        ignoreBatchLimit: true,
      })
    })

    it('should create testing tax successfully for KO type', async () => {
      prismaMock.tax.findFirst.mockResolvedValue(null)
      const processNorisTaxData = jest.spyOn(
        norisService,
        'processNorisTaxData',
      )
      prismaMock.taxAdministrator.findFirst.mockResolvedValue(
        mockTaxAdministrator,
      )

      await adminService.createTestingTax(mockRequest, TaxType.KO)

      const processNorisTaxDataCallAgs = processNorisTaxData.mock.calls[0]
      const taxTypeCalled = processNorisTaxDataCallAgs[0]
      const norisDataCalled = processNorisTaxDataCallAgs[1]
      const yearCalled = processNorisTaxDataCallAgs[2]
      const optionsCalled = processNorisTaxDataCallAgs[3]

      expect(taxTypeCalled).toBe(TaxType.KO)
      expect(
        parseFloat(norisDataCalled[0].SPL4_1.replace(',', '.')) +
          parseFloat(norisDataCalled[0].SPL4_2.replace(',', '.')) +
          parseFloat(norisDataCalled[0].SPL4_3.replace(',', '.')) +
          parseFloat(norisDataCalled[0].SPL4_4.replace(',', '.')),
      ).toEqual(parseFloat(mockNorisData.taxTotal.replace(',', '.')))
      expect(parseFloat(norisDataCalled[0].SPL4_4.replace(',', '.'))).not.toBe(
        0,
      )
      expect(isArray(norisDataCalled)).toBe(true)
      expect(yearCalled).toBe(1970)
      expect(optionsCalled).toStrictEqual({
        prepareOnly: false,
        ignoreBatchLimit: true,
      })
    })

    it('should throw InternalServerErrorException when no tax administrator found', async () => {
      prismaMock.taxAdministrator.findFirst.mockResolvedValue(null)

      const internalServerErrorSpy = jest.spyOn(
        adminService['throwerErrorGuard'],
        'InternalServerErrorException',
      )

      await expect(
        adminService['createTestingTax'](
          { year: 1970, norisData: mockNorisData as any },
          TaxType.DZN,
        ),
      ).rejects.toThrow()

      expect(prismaMock.taxAdministrator.findFirst).toHaveBeenCalledWith({})
      expect(internalServerErrorSpy).toHaveBeenCalledWith(
        ErrorsEnum.INTERNAL_SERVER_ERROR,
        expect.any(String),
      )
    })

    it('should throw InternalServerErrorException when tax with variable symbol already exists', async () => {
      prismaMock.taxAdministrator.findFirst.mockResolvedValue(
        mockTaxAdministrator,
      )
      prismaMock.tax.findFirst.mockResolvedValue({
        id: 1,
        variableSymbol: mockNorisData.variableSymbol,
      } as any)

      const internalServerErrorSpy = jest.spyOn(
        adminService['throwerErrorGuard'],
        'InternalServerErrorException',
      )

      await expect(
        adminService['createTestingTax'](
          { year: 1970, norisData: mockNorisData as any },
          TaxType.DZN,
        ),
      ).rejects.toThrow()

      expect(prismaMock.tax.findFirst).toHaveBeenCalledWith({
        where: {
          variableSymbol: mockNorisData.variableSymbol,
        },
      })
      expect(internalServerErrorSpy).toHaveBeenCalledWith(
        ErrorsEnum.INTERNAL_SERVER_ERROR,
        expect.any(String),
      )
    })
  })

  describe('deleteTax', () => {
    const mockBirthNumber = '0101010101'
    const mockBirthNumberWithSlash = '010101/0101'
    const mockYear = 2024
    const mockTaxType = TaxType.DZN
    const mockOrder = 1

    const mockTaxPayer = {
      id: 1,
      birthNumber: mockBirthNumberWithSlash,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    }

    const mockTax = {
      id: 100,
      taxPayerId: mockTaxPayer.id,
      year: mockYear,
      type: mockTaxType,
      order: mockOrder,
      variableSymbol: 'VS123',
      amount: 500,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    }

    const mockCityAccountUser = {
      externalId: 'external-123',
      birthNumber: mockBirthNumber,
      email: 'test@example.com',
    }

    it('should successfully delete tax and send Bloomreach event', async () => {
      prismaMock.taxPayer.findUnique.mockResolvedValue(mockTaxPayer as any)
      prismaMock.tax.findUnique.mockResolvedValue(mockTax as any)
      prismaMock.tax.delete.mockResolvedValue(mockTax as any)

      const getUserDataAdminSpy = jest
        .spyOn(adminService['cityAccountSubservice'], 'getUserDataAdmin')
        .mockResolvedValue(mockCityAccountUser as any)

      const trackEventTaxSpy = jest
        .spyOn(adminService['bloomreachService'], 'trackEventTax')
        .mockResolvedValue(true)

      await adminService.deleteTax({
        birthNumber: mockBirthNumber,
        year: mockYear,
        taxType: mockTaxType,
        order: mockOrder,
      })

      expect(prismaMock.taxPayer.findUnique).toHaveBeenCalledWith({
        where: {
          birthNumber: mockBirthNumberWithSlash,
        },
      })

      expect(prismaMock.tax.findUnique).toHaveBeenCalledWith({
        where: {
          taxPayerId_year_type_order: {
            taxPayerId: mockTaxPayer.id,
            year: mockYear,
            type: mockTaxType,
            order: mockOrder,
          },
        },
      })

      expect(prismaMock.tax.delete).toHaveBeenCalledWith({
        where: {
          taxPayerId_year_type_order: {
            taxPayerId: mockTaxPayer.id,
            year: mockYear,
            type: mockTaxType,
            order: mockOrder,
          },
        },
      })

      expect(getUserDataAdminSpy).toHaveBeenCalledWith(mockBirthNumber)

      expect(trackEventTaxSpy).toHaveBeenCalledWith(
        {
          year: mockYear,
          amount: 0,
          delivery_method: null,
          taxType: mockTaxType,
          order: mockOrder,
        },
        mockCityAccountUser.externalId,
      )
    })

    it('should throw InternalServerErrorException when tax payer not found', async () => {
      prismaMock.taxPayer.findUnique.mockResolvedValue(null)

      const internalServerErrorSpy = jest.spyOn(
        adminService['throwerErrorGuard'],
        'InternalServerErrorException',
      )

      await expect(
        adminService.deleteTax({
          birthNumber: mockBirthNumber,
          year: mockYear,
          taxType: mockTaxType,
          order: mockOrder,
        }),
      ).rejects.toThrow()

      expect(prismaMock.taxPayer.findUnique).toHaveBeenCalledWith({
        where: {
          birthNumber: mockBirthNumberWithSlash,
        },
      })

      expect(internalServerErrorSpy).toHaveBeenCalledWith(
        ErrorsEnum.INTERNAL_SERVER_ERROR,
        expect.any(String),
      )

      expect(prismaMock.tax.findUnique).not.toHaveBeenCalled()
      expect(prismaMock.tax.delete).not.toHaveBeenCalled()
    })

    it('should throw InternalServerErrorException when tax not found', async () => {
      prismaMock.taxPayer.findUnique.mockResolvedValue(mockTaxPayer as any)
      prismaMock.tax.findUnique.mockResolvedValue(null)

      const internalServerErrorSpy = jest.spyOn(
        adminService['throwerErrorGuard'],
        'InternalServerErrorException',
      )

      await expect(
        adminService.deleteTax({
          birthNumber: mockBirthNumber,
          year: mockYear,
          taxType: mockTaxType,
          order: mockOrder,
        }),
      ).rejects.toThrow()

      expect(prismaMock.taxPayer.findUnique).toHaveBeenCalledWith({
        where: {
          birthNumber: mockBirthNumberWithSlash,
        },
      })

      expect(prismaMock.tax.findUnique).toHaveBeenCalledWith({
        where: {
          taxPayerId_year_type_order: {
            taxPayerId: mockTaxPayer.id,
            year: mockYear,
            type: mockTaxType,
            order: mockOrder,
          },
        },
      })

      expect(internalServerErrorSpy).toHaveBeenCalledWith(
        ErrorsEnum.INTERNAL_SERVER_ERROR,
        expect.any(String),
      )

      expect(prismaMock.tax.delete).not.toHaveBeenCalled()
    })

    it('should return early when city account user not found', async () => {
      prismaMock.taxPayer.findUnique.mockResolvedValue(mockTaxPayer as any)
      prismaMock.tax.findUnique.mockResolvedValue(mockTax as any)
      prismaMock.tax.delete.mockResolvedValue(mockTax as any)

      const getUserDataAdminSpy = jest
        .spyOn(adminService['cityAccountSubservice'], 'getUserDataAdmin')
        .mockResolvedValue(null)

      const trackEventTaxSpy = jest.spyOn(
        adminService['bloomreachService'],
        'trackEventTax',
      )

      await adminService.deleteTax({
        birthNumber: mockBirthNumber,
        year: mockYear,
        taxType: mockTaxType,
        order: mockOrder,
      })

      expect(prismaMock.tax.delete).toHaveBeenCalled()
      expect(getUserDataAdminSpy).toHaveBeenCalledWith(mockBirthNumber)
      expect(trackEventTaxSpy).not.toHaveBeenCalled()
    })

    it('should log error when Bloomreach tracking fails but still complete deletion', async () => {
      prismaMock.taxPayer.findUnique.mockResolvedValue(mockTaxPayer as any)
      prismaMock.tax.findUnique.mockResolvedValue(mockTax as any)
      prismaMock.tax.delete.mockResolvedValue(mockTax as any)

      jest
        .spyOn(adminService['cityAccountSubservice'], 'getUserDataAdmin')
        .mockResolvedValue(mockCityAccountUser as any)

      jest
        .spyOn(adminService['bloomreachService'], 'trackEventTax')
        .mockResolvedValue(false)

      const loggerErrorSpy = jest
        .spyOn(adminService['logger'], 'error')
        .mockImplementation(() => {})

      await adminService.deleteTax({
        birthNumber: mockBirthNumber,
        year: mockYear,
        taxType: mockTaxType,
        order: mockOrder,
      })

      expect(prismaMock.tax.delete).toHaveBeenCalled()
      expect(loggerErrorSpy).toHaveBeenCalled()
    })

    it('should handle city account user without externalId', async () => {
      prismaMock.taxPayer.findUnique.mockResolvedValue(mockTaxPayer as any)
      prismaMock.tax.findUnique.mockResolvedValue(mockTax as any)
      prismaMock.tax.delete.mockResolvedValue(mockTax as any)

      const cityAccountUserWithoutExternalId = {
        ...mockCityAccountUser,
        externalId: null,
      }

      jest
        .spyOn(adminService['cityAccountSubservice'], 'getUserDataAdmin')
        .mockResolvedValue(cityAccountUserWithoutExternalId as any)

      const trackEventTaxSpy = jest
        .spyOn(adminService['bloomreachService'], 'trackEventTax')
        .mockResolvedValue(true)

      await adminService.deleteTax({
        birthNumber: mockBirthNumber,
        year: mockYear,
        taxType: mockTaxType,
        order: mockOrder,
      })

      expect(trackEventTaxSpy).toHaveBeenCalledWith(
        {
          year: mockYear,
          amount: 0,
          delivery_method: null,
          taxType: mockTaxType,
          order: mockOrder,
        },
        undefined,
      )
    })

    it('should use composite unique key for finding and deleting tax', async () => {
      prismaMock.taxPayer.findUnique.mockResolvedValue(mockTaxPayer as any)
      prismaMock.tax.findUnique.mockResolvedValue(mockTax as any)
      prismaMock.tax.delete.mockResolvedValue(mockTax as any)

      jest
        .spyOn(adminService['cityAccountSubservice'], 'getUserDataAdmin')
        .mockResolvedValue(null)

      await adminService.deleteTax({
        birthNumber: mockBirthNumber,
        year: mockYear,
        taxType: mockTaxType,
        order: mockOrder,
      })

      const expectedCompositeKey = {
        taxPayerId_year_type_order: {
          taxPayerId: mockTaxPayer.id,
          year: mockYear,
          type: mockTaxType,
          order: mockOrder,
        },
      }

      expect(prismaMock.tax.findUnique).toHaveBeenCalledWith({
        where: expectedCompositeKey,
      })

      expect(prismaMock.tax.delete).toHaveBeenCalledWith({
        where: expectedCompositeKey,
      })
    })

    it('should send correct data to Bloomreach with amount 0 and null delivery_method', async () => {
      prismaMock.taxPayer.findUnique.mockResolvedValue(mockTaxPayer as any)
      prismaMock.tax.findUnique.mockResolvedValue(mockTax as any)
      prismaMock.tax.delete.mockResolvedValue(mockTax as any)

      jest
        .spyOn(adminService['cityAccountSubservice'], 'getUserDataAdmin')
        .mockResolvedValue(mockCityAccountUser as any)

      const trackEventTaxSpy = jest
        .spyOn(adminService['bloomreachService'], 'trackEventTax')
        .mockResolvedValue(true)

      await adminService.deleteTax({
        birthNumber: mockBirthNumber,
        year: mockYear,
        taxType: mockTaxType,
        order: mockOrder,
      })

      expect(trackEventTaxSpy).toHaveBeenCalledWith(
        {
          amount: 0,
          delivery_method: null,
          year: mockYear,
          taxType: mockTaxType,
          order: mockOrder,
        },
        'external-123',
      )
    })
  })
})

/* eslint-enable no-secrets/no-secrets */
