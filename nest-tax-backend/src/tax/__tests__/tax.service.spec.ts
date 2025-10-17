import { todo } from 'node:test'

import { createMock } from '@golevelup/ts-jest'
import { HttpException, HttpStatus } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { PaymentStatus, Prisma, TaxPayer, TaxType } from '@prisma/client'
import * as ejs from 'ejs'

import prismaMock from '../../../test/singleton'
import { PaymentService } from '../../payment/payment.service'
import * as paymentHelper from '../../payment/utils/payment.helper'
import { PrismaService } from '../../prisma/prisma.service'
import ThrowerErrorGuard from '../../utils/guards/errors.guard'
import { QrCodeSubservice } from '../../utils/subservices/qrcode.subservice'
import {
  CustomErrorTaxTypesEnum,
  CustomErrorTaxTypesResponseEnum,
} from '../dtos/error.dto'
import { TaxPaidStatusEnum } from '../dtos/response.tax.dto'
import { TaxRealEstateSubservice } from '../subservices/tax/tax.real-estate.subservice'
import { TaxService } from '../tax.service'
import * as pdfHelper from '../utils/helpers/pdf.helper'
import * as taxHelper from '../utils/helpers/tax.helper'

jest.mock('ejs', () => ({
  renderFile: jest.fn(),
}))

jest.mock('../utils/helpers/tax.helper', () => {
  const actual = jest.requireActual('../utils/helpers/tax.helper')
  return {
    ...actual,
    fixInstallmentTexts: jest.fn(),
    getTaxStatus: jest.fn(),
  }
})

jest.mock('../utils/unified-tax.util', () => ({
  getTaxDetailPure: jest.fn(),
}))

jest.mock('../../payment/utils/payment.helper', () => ({
  computeIsPayableYear: jest.fn(),
}))

jest.mock('../utils/helpers/pdf.helper', () => ({
  RealEstatePdfHelper: {
    taxDetailsToPdf: jest.fn(),
    taxTotalsToPdf: jest.fn(),
  },
}))

// Type definitions for the mock objects
type MockTaxPayer = Prisma.TaxPayerGetPayload<{
  include: { taxAdministrator: true }
}>

// Helper function to create base mock TaxPayer
const createMockTaxPayer = (
  overrides?: Partial<MockTaxPayer>,
): MockTaxPayer => {
  const baseDate = new Date('2023-01-01T10:00:00.000Z')

  return {
    id: 1,
    uuid: '550e8400-e29b-41d4-a716-446655440000',
    createdAt: baseDate,
    updatedAt: baseDate,
    birthNumber: '123456/789',
    taxAdministratorId: 1,
    taxAdministrator: {
      id: 1,
      createdAt: baseDate,
      updatedAt: baseDate,
      externalId: 'ext-admin-1',
      name: 'Test Tax Administrator',
      phoneNumber: '+421123456789',
      email: 'admin@test.sk',
    },
    permanentResidenceAddress: 'Test Address 123',
    externalId: 'ext-taxpayer-1',
    name: 'John Doe',
    nameTxt: 'John Doe',
    permanentResidenceStreetTxt: 'Test Street 123',
    permanentResidenceStreet: 'Test Street',
    permanentResidenceZip: '12345',
    permanentResidenceCity: 'Test City',
    ...overrides,
  }
}

describe('TaxService', () => {
  let service: TaxService

  const mockTaxData = {
    id: 1,
    uuid: 'tax-uuid',
    year: 2023,
    amount: 1000,
    variableSymbol: 'VS123',
    dateTaxRuling: new Date('2023-01-01'),
    qrCodeWeb: null,
    taxConstructions: 0,
    taxFlat: 0,
    taxLand: 0,
    taxInstallments: [
      {
        id: 1,
        installmentNumber: 1,
        amount: 500,
        dueDate: new Date('2023-06-01'),
        text: 'First installment',
        order: 1,
      },
      {
        id: 2,
        installmentNumber: 2,
        amount: 500,
        dueDate: new Date('2023-09-01'),
        text: 'Second installment',
        order: 2,
      },
    ],
    taxPayer: {
      id: 1,
      birthNumber: '123456/789',
      taxAdministrator: {
        id: 1,
        name: 'Test Administrator',
        email: 'admin@test.sk',
      },
    },
    taxDetails: [
      {
        id: 1,
        type: 'LAND',
        amount: 500,
      },
    ],
    taxPayments: [
      {
        id: 1,
        amount: 200,
        status: PaymentStatus.SUCCESS,
        createdAt: new Date('2023-05-01'),
      },
    ],
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaxService,
        { provide: PrismaService, useValue: prismaMock },
        ThrowerErrorGuard,
        { provide: QrCodeSubservice, useValue: createMock<QrCodeSubservice>() },
        { provide: PaymentService, useValue: createMock<PaymentService>() },
        TaxRealEstateSubservice,
      ],
    }).compile()

    service = module.get<TaxService>(TaxService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('getTaxByYearAndType', () => {
    it('should return tax data for valid year and birth number', async () => {
      prismaMock.tax.findUnique.mockResolvedValue(mockTaxData as any)
      prismaMock.taxPayer.findUnique.mockResolvedValue({
        id: 1,
      } as TaxPayer)
      prismaMock.taxPayment.aggregate.mockResolvedValue({
        _sum: { amount: 200 },
      } as Prisma.GetTaxPaymentAggregateType<{ _sum: { amount: true } }>)
      jest
        .spyOn(service['qrCodeSubservice'], 'createQrCode')
        .mockResolvedValue('qr-code-data')
      jest
        .spyOn(taxHelper, 'fixInstallmentTexts')
        .mockReturnValue(mockTaxData.taxInstallments as any)
      jest
        .spyOn(taxHelper, 'getTaxStatus')
        .mockReturnValue(TaxPaidStatusEnum.PARTIALLY_PAID)
      jest.spyOn(paymentHelper, 'computeIsPayableYear').mockReturnValue(true)

      const result = await service.getTaxByYearAndType(
        2023,
        '123456/789',
        TaxType.DZN,
        1,
      )

      expect(prismaMock.tax.findUnique).toHaveBeenCalledWith({
        where: {
          taxPayerId_year_type_order: {
            taxPayerId: 1,
            year: 2023,
            order: 1,
            type: TaxType.DZN,
          },
        },
        include: {
          taxInstallments: true,
          taxPayer: { include: { taxAdministrator: true } },
          taxDetails: true,
          taxPayments: true,
        },
      })

      expect(result).toEqual(
        expect.objectContaining({
          id: 1,
          amount: 1000,
          paidAmount: 200,
          paidStatus: TaxPaidStatusEnum.PARTIALLY_PAID,
          pdfExport: false,
          isPayable: true,
          taxAdministrator: mockTaxData.taxPayer.taxAdministrator,
        }),
      )
    })

    it('should throw error for missing birth number', async () => {
      const notFoundExceptionSpy = jest.spyOn(
        service['throwerErrorGuard'],
        'NotFoundException',
      )

      await expect(
        service.getTaxByYearAndType(2023, '', TaxType.DZN, 1),
      ).rejects.toThrow()

      expect(notFoundExceptionSpy).toHaveBeenCalledWith(
        CustomErrorTaxTypesEnum.TAX_YEAR_OR_USER_NOT_FOUND,
        CustomErrorTaxTypesResponseEnum.TAX_YEAR_OR_USER_NOT_FOUND,
      )
    })

    it('should throw error for missing year', async () => {
      const notFoundExceptionSpy = jest.spyOn(
        service['throwerErrorGuard'],
        'NotFoundException',
      )

      await expect(
        service.getTaxByYearAndType(null as any, '123456/789', TaxType.DZN, 1),
      ).rejects.toThrow()

      expect(notFoundExceptionSpy).toHaveBeenCalledWith(
        CustomErrorTaxTypesEnum.TAX_YEAR_OR_USER_NOT_FOUND,
        CustomErrorTaxTypesResponseEnum.TAX_YEAR_OR_USER_NOT_FOUND,
      )
    })

    it('should generate QR code when partially paid', async () => {
      prismaMock.tax.findUnique.mockResolvedValue(mockTaxData as any)
      prismaMock.taxPayer.findUnique.mockResolvedValue({
        id: 1,
      } as TaxPayer)
      prismaMock.taxPayment.aggregate.mockResolvedValue({
        _sum: { amount: 200 },
      } as Prisma.GetTaxPaymentAggregateType<{ _sum: { amount: true } }>)
      const createQrCodeSpy = jest
        .spyOn(service['qrCodeSubservice'], 'createQrCode')
        .mockResolvedValue('qr-code-data')
      jest
        .spyOn(taxHelper, 'fixInstallmentTexts')
        .mockReturnValue(mockTaxData.taxInstallments as any)
      jest
        .spyOn(taxHelper, 'getTaxStatus')
        .mockReturnValue(TaxPaidStatusEnum.PARTIALLY_PAID)
      jest.spyOn(paymentHelper, 'computeIsPayableYear').mockReturnValue(true)

      const result = await service.getTaxByYearAndType(
        2023,
        '123456/789',
        TaxType.DZN,
        1,
      )

      expect(createQrCodeSpy).toHaveBeenCalledWith({
        amount: 800, // 1000 - 200
        variableSymbol: 'VS123',
        specificSymbol: '2023200000',
      })
      expect(result.qrCodeWeb).toBe('qr-code-data')
    })

    it('should not generate QR code when fully paid', async () => {
      mockTaxData.qrCodeWeb = null
      prismaMock.tax.findUnique.mockResolvedValue(mockTaxData as any)
      prismaMock.taxPayer.findUnique.mockResolvedValue({
        id: 1,
      } as TaxPayer)
      prismaMock.taxPayment.aggregate.mockResolvedValue({
        _sum: { amount: 1000 },
      } as Prisma.GetTaxPaymentAggregateType<{ _sum: { amount: true } }>)
      jest
        .spyOn(taxHelper, 'fixInstallmentTexts')
        .mockReturnValue(mockTaxData.taxInstallments as any)
      jest
        .spyOn(taxHelper, 'getTaxStatus')
        .mockReturnValue(TaxPaidStatusEnum.PAID)
      jest.spyOn(paymentHelper, 'computeIsPayableYear').mockReturnValue(true)
      const createQrCodeSpy = jest.spyOn(
        service['qrCodeSubservice'],
        'createQrCode',
      )

      const result = await service.getTaxByYearAndType(
        2023,
        '123456/789',
        TaxType.DZN,
        1,
      )

      expect(createQrCodeSpy).not.toHaveBeenCalled()
      expect(result.qrCodeWeb).toBeNull()
    })

    todo('test also other types of taxes')
  })

  describe('loadTaxes', () => {
    const mockTaxes = [
      {
        id: 1,
        uuid: 'tax-uuid-1',
        createdAt: new Date('2023-01-01'),
        amount: 1000,
        year: 2023,
      },
      {
        id: 2,
        uuid: 'tax-uuid-2',
        createdAt: new Date('2022-01-01'),
        amount: 800,
        year: 2022,
      },
    ]

    const mockTaxPayments = [
      {
        taxId: 1,
        _sum: { amount: 200 },
      },
    ]

    const mockTaxPayer = {
      id: 1,
      birthNumber: '123456/789',
      taxAdministrator: {
        id: 1,
        name: 'Test Administrator',
        email: 'admin@test.sk',
      },
    }

    it('should return taxes with payment information', async () => {
      prismaMock.taxPayment.groupBy.mockResolvedValue(mockTaxPayments as any)
      prismaMock.tax.findMany.mockResolvedValue(mockTaxes as any)
      prismaMock.taxPayer.findUnique.mockResolvedValue(mockTaxPayer as any)
      jest
        .spyOn(taxHelper, 'getTaxStatus')
        .mockReturnValue(TaxPaidStatusEnum.PARTIALLY_PAID)
      jest.spyOn(paymentHelper, 'computeIsPayableYear').mockReturnValue(true)

      const result = await service.loadTaxes('123456/789', TaxType.DZN)

      expect(result).toEqual({
        isInNoris: true,
        items: [
          expect.objectContaining({
            id: 1,
            amount: 1000,
            paidAmount: 200,
            paidStatus: TaxPaidStatusEnum.PARTIALLY_PAID,
            isPayable: true,
          }),
          expect.objectContaining({
            id: 2,
            amount: 800,
            paidAmount: 0,
            paidStatus: TaxPaidStatusEnum.PARTIALLY_PAID,
            isPayable: true,
          }),
        ],
        taxAdministrator: mockTaxPayer.taxAdministrator,
      })
    })

    it('should throw error for missing birth number', async () => {
      const forbiddenExceptionSpy = jest.spyOn(
        service['throwerErrorGuard'],
        'ForbiddenException',
      )

      await expect(service.loadTaxes('', TaxType.DZN)).rejects.toThrow()

      expect(forbiddenExceptionSpy).toHaveBeenCalledWith(
        CustomErrorTaxTypesEnum.BIRTHNUMBER_NOT_EXISTS,
        CustomErrorTaxTypesResponseEnum.BIRTHNUMBER_NOT_EXISTS,
      )
    })

    it('should return empty list when no taxes found', async () => {
      prismaMock.taxPayment.groupBy.mockResolvedValue([])
      prismaMock.tax.findMany.mockResolvedValue([])
      prismaMock.taxPayer.findUnique.mockResolvedValue(null)

      const result = await service.loadTaxes('123456/789', TaxType.DZN)

      expect(result).toEqual({
        isInNoris: false,
        items: [],
        taxAdministrator: null,
      })
    })

    todo('test also other types of taxes')
  })

  describe('generatePdf', () => {
    const mockTaxDetails = {
      LAND: {
        AREA: {
          area: null,
          base: '500,00',
          amount: '500,00',
        },
      },
    } as any
    const mockTaxTotals = {
      total: 'formatted-tax-totals',
      taxFlat: '0',
      taxConstructions: '0',
      taxLand: '0',
      taxInstallments: [
        {
          text: 'First installment',
          amount: '500,00',
        },
      ],
    } as any

    it('should generate PDF successfully', async () => {
      prismaMock.tax.findUnique.mockResolvedValue(mockTaxData as any)
      prismaMock.taxPayer.findUnique.mockResolvedValue({
        id: 1,
      } as TaxPayer)
      prismaMock.taxPayment.aggregate.mockResolvedValue({
        _sum: { amount: 200 },
      } as Prisma.GetTaxPaymentAggregateType<{ _sum: { amount: true } }>)
      jest
        .spyOn(taxHelper, 'fixInstallmentTexts')
        .mockReturnValue(mockTaxData.taxInstallments as any)
      jest
        .spyOn(taxHelper, 'getTaxStatus')
        .mockReturnValue(TaxPaidStatusEnum.PARTIALLY_PAID)
      jest.spyOn(paymentHelper, 'computeIsPayableYear').mockReturnValue(true)
      jest
        .spyOn(pdfHelper.RealEstatePdfHelper, 'taxDetailsToPdf')
        .mockReturnValue(mockTaxDetails)
      jest
        .spyOn(pdfHelper.RealEstatePdfHelper, 'taxTotalsToPdf')
        .mockReturnValue(mockTaxTotals)
      const renderFileSpy = jest
        .spyOn(ejs, 'renderFile')
        .mockResolvedValue('<html>PDF content</html>')

      const result = await service.generatePdf(
        2023,
        '123456/789',
        TaxType.DZN,
        1,
      )

      expect(renderFileSpy).toHaveBeenCalledWith(
        'public/tax-pdf.ejs',
        expect.objectContaining({
          user: expect.any(Object),
          logo: expect.stringContaining('logoBaTax.png'),
          taxDetails: mockTaxDetails,
          totals: mockTaxTotals,
        }),
      )
      expect(result).toBe('<html>PDF content</html>')
    })

    it('should handle PDF generation error', async () => {
      const mockError = new Error('PDF generation failed')
      const thrownError = new HttpException(
        'PDF create error',
        HttpStatus.UNPROCESSABLE_ENTITY,
      )

      prismaMock.taxPayer.findUnique.mockResolvedValue({
        id: 1,
      } as TaxPayer)
      prismaMock.tax.findUnique.mockRejectedValue(mockError)
      jest
        .spyOn(service['throwerErrorGuard'], 'UnprocessableEntityException')
        .mockReturnValue(thrownError)

      await expect(
        service.generatePdf(2023, '123456/789', TaxType.DZN, 1),
      ).rejects.toThrow(thrownError)

      expect(
        service['throwerErrorGuard'].UnprocessableEntityException,
      ).toHaveBeenCalledWith(
        expect.any(String),
        'Error to create pdf',
        'Error to create pdf',
        undefined,
        mockError,
      )
    })

    todo('test also other types of taxes')
  })

  describe('getListOfTaxesByBirthnumberAndType', () => {
    const DEFAULT_TEST_NOW = new Date('2025-01-01T12:00:00.000Z')

    beforeAll(async () => {
      jest.useFakeTimers()
    })
    beforeEach(async () => {
      jest.setSystemTime(DEFAULT_TEST_NOW)
    })
    afterAll(() => {
      jest.useRealTimers()
    })

    it('should throw ForbiddenException when birth number is empty', async () => {
      const forbiddenExceptionSpy = jest.spyOn(
        service['throwerErrorGuard'],
        'ForbiddenException',
      )

      await expect(
        service.getListOfTaxesByBirthnumberAndType('', TaxType.DZN),
      ).rejects.toThrow()

      expect(forbiddenExceptionSpy).toHaveBeenCalledWith(
        CustomErrorTaxTypesEnum.BIRTHNUMBER_NOT_EXISTS,
        CustomErrorTaxTypesResponseEnum.BIRTHNUMBER_NOT_EXISTS,
      )
    })

    it('should set taxPayerWasUpdated to false when TaxPayer does not exist', async () => {
      // Mock no taxpayer found
      prismaMock.taxPayer.findUnique.mockResolvedValue(null)
      prismaMock.tax.findMany.mockResolvedValue([])

      const result = await service.getListOfTaxesByBirthnumberAndType(
        '123456/789',
        TaxType.DZN,
      )

      expect(result.availabilityStatus).toBe('LOOKING_FOR_YOUR_TAX')
      expect(result.taxAdministrator).toBeNull()
    })

    it('should set taxPayerWasUpdated to false when TaxPayer has same createdAt and updatedAt', async () => {
      const mockTaxPayer = createMockTaxPayer({
        createdAt: new Date('2025-01-01T10:00:00.000Z'),
        updatedAt: new Date('2025-01-01T10:00:00.000Z'), // Same as createdAt
      })

      prismaMock.taxPayer.findUnique.mockResolvedValue(mockTaxPayer)
      prismaMock.tax.findMany.mockResolvedValue([])

      const result = await service.getListOfTaxesByBirthnumberAndType(
        '123456/789',
        TaxType.DZN,
      )

      expect(result.availabilityStatus).toBe('LOOKING_FOR_YOUR_TAX')
    })

    it('should set taxPayerWasUpdated to false when updatedAt is exactly 1 second after createdAt', async () => {
      const mockTaxPayer = createMockTaxPayer({
        createdAt: new Date('2025-01-01T10:00:00.000Z'),
        updatedAt: new Date('2025-01-01T10:00:01.000Z'), // Exactly 1000ms later
      })

      prismaMock.taxPayer.findUnique.mockResolvedValue(mockTaxPayer)
      prismaMock.tax.findMany.mockResolvedValue([])

      const result = await service.getListOfTaxesByBirthnumberAndType(
        '123456/789',
        TaxType.DZN,
      )

      expect(result.availabilityStatus).toBe('LOOKING_FOR_YOUR_TAX')
    })

    it('should set taxPayerWasUpdated to true when updatedAt is more than 1 second after createdAt', async () => {
      const mockTaxPayer = createMockTaxPayer({
        createdAt: new Date('2025-01-01T10:00:00.000Z'),
        updatedAt: new Date('2025-01-01T10:00:02.000Z'), // 2000ms later
      })

      prismaMock.taxPayer.findUnique.mockResolvedValue(mockTaxPayer)
      prismaMock.tax.findMany.mockResolvedValue([])

      const result = await service.getListOfTaxesByBirthnumberAndType(
        '123456/789',
        TaxType.DZN,
      )

      expect(result.availabilityStatus).toBe('TAX_NOT_ON_RECORD')
    })

    it('should set taxPayerWasUpdated to false when updatedAt is less than 1 second after createdAt', async () => {
      const mockTaxPayer = createMockTaxPayer({
        createdAt: new Date('2025-01-01T10:00:00.000Z'),
        updatedAt: new Date('2025-01-01T10:00:00.500Z'), // 500ms later
      })

      prismaMock.taxPayer.findUnique.mockResolvedValue(mockTaxPayer)
      prismaMock.tax.findMany.mockResolvedValue([])

      const result = await service.getListOfTaxesByBirthnumberAndType(
        '123456/789',
        TaxType.DZN,
      )

      expect(result.availabilityStatus).toBe('LOOKING_FOR_YOUR_TAX')
    })

    it('should set shouldAddCurrentYear to true when current date is within tax inclusion period', async () => {
      // Within period: between Feb 1 and Jul 1 (exclusive). Use March 1st.
      jest.setSystemTime(new Date('2025-03-01T12:00:00.000Z'))

      const mockTaxPayer = createMockTaxPayer({
        createdAt: new Date('2025-01-01T10:00:00.000Z'),
        updatedAt: new Date('2025-01-01T10:00:00.000Z'), // not updated
      })
      prismaMock.taxPayer.findUnique.mockResolvedValue(mockTaxPayer)
      prismaMock.tax.findMany.mockResolvedValue([])

      const result = await service.getListOfTaxesByBirthnumberAndType(
        '123456/789',
        TaxType.DZN,
      )

      // With no taxes and shouldAddCurrentYear=true => LOOKING_FOR_YOUR_TAX
      expect(result.availabilityStatus).toBe('LOOKING_FOR_YOUR_TAX')
    })

    it('should set shouldAddCurrentYear to false when current date is outside tax inclusion period', async () => {
      jest.setSystemTime(new Date('2025-12-01T12:00:00.000Z'))

      const mockTaxPayer = createMockTaxPayer({
        createdAt: new Date('2025-01-01T10:00:00.000Z'),
        updatedAt: new Date('2025-01-01T10:00:02.000Z'), // updated -> true
      })
      prismaMock.taxPayer.findUnique.mockResolvedValue(mockTaxPayer)
      prismaMock.tax.findMany.mockResolvedValue([])

      const result = await service.getListOfTaxesByBirthnumberAndType(
        '123456/789',
        TaxType.DZN,
      )

      expect(result.availabilityStatus).toBe('TAX_NOT_ON_RECORD')
    })

    // Empty Taxes Array Scenarios
    it('should return LOOKING_FOR_YOUR_TAX when no taxes exist and shouldAddCurrentYear is true and taxPayerWasUpdated is true', async () => {
      // Set within inclusion period
      jest.setSystemTime(new Date('2025-03-10T12:00:00.000Z'))
      const mockTaxPayer = createMockTaxPayer({
        createdAt: new Date('2025-01-01T10:00:00.000Z'),
        updatedAt: new Date('2025-01-01T10:00:02.000Z'), // updated => true
      })
      prismaMock.taxPayer.findUnique.mockResolvedValue(mockTaxPayer)
      prismaMock.tax.findMany.mockResolvedValue([])

      const result = await service.getListOfTaxesByBirthnumberAndType(
        '123456/789',
        TaxType.DZN,
      )
      expect(result.availabilityStatus).toBe('LOOKING_FOR_YOUR_TAX')
    })

    it('should return LOOKING_FOR_YOUR_TAX when no taxes exist and shouldAddCurrentYear is false and taxPayerWasUpdated is false', async () => {
      // Outside inclusion period
      jest.setSystemTime(new Date('2025-12-10T12:00:00.000Z'))
      const mockTaxPayer = createMockTaxPayer({
        createdAt: new Date('2025-01-01T10:00:00.000Z'),
        updatedAt: new Date('2025-01-01T10:00:00.500Z'), // not updated
      })
      prismaMock.taxPayer.findUnique.mockResolvedValue(mockTaxPayer)
      prismaMock.tax.findMany.mockResolvedValue([])

      const result = await service.getListOfTaxesByBirthnumberAndType(
        '123456/789',
        TaxType.DZN,
      )
      expect(result.availabilityStatus).toBe('LOOKING_FOR_YOUR_TAX')
    })

    it('should return TAX_NOT_ON_RECORD status when no taxes exist and shouldAddCurrentYear is false and taxPayerWasUpdated is true', async () => {
      // Outside inclusion period
      jest.setSystemTime(new Date('2025-12-10T12:00:00.000Z'))
      const mockTaxPayer = createMockTaxPayer({
        createdAt: new Date('2025-01-01T10:00:00.000Z'),
        updatedAt: new Date('2025-01-01T10:00:02.000Z'), // updated
      })
      prismaMock.taxPayer.findUnique.mockResolvedValue(mockTaxPayer)
      prismaMock.tax.findMany.mockResolvedValue([])

      const result = await service.getListOfTaxesByBirthnumberAndType(
        '123456/789',
        TaxType.DZN,
      )
      expect(result.availabilityStatus).toBe('TAX_NOT_ON_RECORD')
    })
  })

  describe('private methods', () => {
    describe('getAmountAlreadyPaidByTaxId', () => {
      it('should return total paid amount', async () => {
        prismaMock.taxPayment.aggregate.mockResolvedValue({
          _sum: { amount: 500 },
        } as Prisma.GetTaxPaymentAggregateType<{ _sum: { amount: true } }>)

        const result = await service['getAmountAlreadyPaidByTaxId'](1)

        expect(prismaMock.taxPayment.aggregate).toHaveBeenCalledWith({
          where: {
            taxId: 1,
            status: PaymentStatus.SUCCESS,
          },
          _sum: { amount: true },
        })
        expect(result).toBe(500)
      })

      it('should return 0 when no payments found', async () => {
        prismaMock.taxPayment.aggregate.mockResolvedValue({
          _sum: { amount: null },
        } as Prisma.GetTaxPaymentAggregateType<{ _sum: { amount: true } }>)

        const result = await service['getAmountAlreadyPaidByTaxId'](1)

        expect(result).toBe(0)
      })
    })
  })
})
