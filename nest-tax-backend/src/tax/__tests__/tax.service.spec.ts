import { createMock } from '@golevelup/ts-jest'
import { HttpException, HttpStatus } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { PaymentStatus, Prisma, TaxPayer, TaxType } from '@prisma/client'
import * as ejs from 'ejs'

import prismaMock from '../../../test/singleton'
import { PaymentGateURLGeneratorDto } from '../../payment/dtos/generator.dto'
import { PaymentService } from '../../payment/payment.service'
import * as paymentHelper from '../../payment/utils/payment.helper'
import { PrismaService } from '../../prisma/prisma.service'
import { getTaxDefinitionByType } from '../../tax-definitions/getTaxDefinitionByType'
import ThrowerErrorGuard from '../../utils/guards/errors.guard'
import { QrCodeSubservice } from '../../utils/subservices/qrcode.subservice'
import {
  CustomErrorTaxTypesEnum,
  CustomErrorTaxTypesResponseEnum,
} from '../dtos/error.dto'
import {
  ResponseTaxSummaryDetailDto,
  TaxAvailabilityStatus,
  TaxPaidStatusEnum,
  TaxStatusEnum,
} from '../dtos/response.tax.dto'
import { TaxRealEstateSubservice } from '../subservices/tax/tax.real-estate.subservice'
import { TaxService } from '../tax.service'
import * as pdfHelper from '../utils/helpers/pdf.helper'
import * as taxHelper from '../utils/helpers/tax.helper'
import * as unifiedTaxUtil from '../utils/unified-tax.util'

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
  getTaxDetailPureForOneTimeGenerator: jest.fn(),
  getTaxDetailPureForInstallmentGenerator: jest.fn(),
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

    it('should throw error for KO tax type as it is not implemented yet', async () => {
      const thrownError = new HttpException(
        'Implementation for tax type KO not found',
        HttpStatus.INTERNAL_SERVER_ERROR,
      )
      jest
        .spyOn(service['throwerErrorGuard'], 'InternalServerErrorException')
        .mockReturnValue(thrownError)

      await expect(
        service.getTaxByYearAndType(2023, '123456/789', TaxType.KO, 1),
      ).rejects.toThrow(thrownError)

      expect(
        service['throwerErrorGuard'].InternalServerErrorException,
      ).toHaveBeenCalledWith(
        CustomErrorTaxTypesEnum.TAX_TYPE_NOT_FOUND,
        'Implementation for tax type KO not found',
      )
    })
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

    it('should return KO taxes with payment information', async () => {
      const mockKoTaxes = [
        {
          id: 1,
          uuid: 'tax-uuid-1',
          createdAt: new Date('2023-01-01'),
          amount: 1000,
          year: 2023,
          type: TaxType.KO,
        },
        {
          id: 2,
          uuid: 'tax-uuid-2',
          createdAt: new Date('2022-01-01'),
          amount: 800,
          year: 2022,
          type: TaxType.KO,
        },
      ]

      prismaMock.taxPayment.groupBy.mockResolvedValue(mockTaxPayments as any)
      prismaMock.tax.findMany.mockResolvedValue(mockKoTaxes as any)
      prismaMock.taxPayer.findUnique.mockResolvedValue(mockTaxPayer as any)
      jest
        .spyOn(taxHelper, 'getTaxStatus')
        .mockReturnValue(TaxPaidStatusEnum.PARTIALLY_PAID)
      jest.spyOn(paymentHelper, 'computeIsPayableYear').mockReturnValue(true)

      const result = await service.loadTaxes('123456/789', TaxType.KO)

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

    it('should throw error for missing birth number with KO tax type', async () => {
      const forbiddenExceptionSpy = jest.spyOn(
        service['throwerErrorGuard'],
        'ForbiddenException',
      )

      await expect(service.loadTaxes('', TaxType.KO)).rejects.toThrow()

      expect(forbiddenExceptionSpy).toHaveBeenCalledWith(
        CustomErrorTaxTypesEnum.BIRTHNUMBER_NOT_EXISTS,
        CustomErrorTaxTypesResponseEnum.BIRTHNUMBER_NOT_EXISTS,
      )
    })

    it('should return empty list when no KO taxes found', async () => {
      prismaMock.taxPayment.groupBy.mockResolvedValue([])
      prismaMock.tax.findMany.mockResolvedValue([])
      prismaMock.taxPayer.findUnique.mockResolvedValue(null)

      const result = await service.loadTaxes('123456/789', TaxType.KO)

      expect(result).toEqual({
        isInNoris: false,
        items: [],
        taxAdministrator: null,
      })
    })
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

    it('should throw error when trying to generate PDF for KO tax type', async () => {
      const mockKoTaxData = {
        ...mockTaxData,
        type: TaxType.KO,
      }

      prismaMock.tax.findUnique.mockResolvedValue(mockKoTaxData as any)
      prismaMock.taxPayer.findUnique.mockResolvedValue({
        id: 1,
      } as TaxPayer)
      prismaMock.taxPayment.aggregate.mockResolvedValue({
        _sum: { amount: 200 },
      } as Prisma.GetTaxPaymentAggregateType<{ _sum: { amount: true } }>)
      jest
        .spyOn(taxHelper, 'fixInstallmentTexts')
        .mockReturnValue(mockKoTaxData.taxInstallments as any)
      jest
        .spyOn(taxHelper, 'getTaxStatus')
        .mockReturnValue(TaxPaidStatusEnum.PARTIALLY_PAID)
      jest.spyOn(paymentHelper, 'computeIsPayableYear').mockReturnValue(true)

      const thrownError = new HttpException(
        'PDF generation for tax type KO is not supported',
        HttpStatus.UNPROCESSABLE_ENTITY,
      )
      jest
        .spyOn(service['throwerErrorGuard'], 'UnprocessableEntityException')
        .mockReturnValue(thrownError)

      await expect(
        service.generatePdf(2023, '123456/789', TaxType.KO, 1),
      ).rejects.toThrow(thrownError)

      expect(
        service['throwerErrorGuard'].UnprocessableEntityException,
      ).toHaveBeenCalledWith(
        CustomErrorTaxTypesEnum.PDF_GENERATE_ERROR,
        'PDF generation for tax type KO is not supported',
      )
    })
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

    it('should throw ForbiddenException when birth number is empty for KO tax type', async () => {
      const forbiddenExceptionSpy = jest.spyOn(
        service['throwerErrorGuard'],
        'ForbiddenException',
      )

      await expect(
        service.getListOfTaxesByBirthnumberAndType('', TaxType.KO),
      ).rejects.toThrow()

      expect(forbiddenExceptionSpy).toHaveBeenCalledWith(
        CustomErrorTaxTypesEnum.BIRTHNUMBER_NOT_EXISTS,
        CustomErrorTaxTypesResponseEnum.BIRTHNUMBER_NOT_EXISTS,
      )
    })

    it('should set taxPayerWasUpdated to false when TaxPayer does not exist for KO tax type', async () => {
      // Mock no taxpayer found
      prismaMock.taxPayer.findUnique.mockResolvedValue(null)
      prismaMock.tax.findMany.mockResolvedValue([])

      const result = await service.getListOfTaxesByBirthnumberAndType(
        '123456/789',
        TaxType.KO,
      )

      expect(result.availabilityStatus).toBe(
        TaxAvailabilityStatus.LOOKING_FOR_YOUR_TAX,
      )
      expect(result.taxAdministrator).toBeNull()
    })

    it('should set taxPayerWasUpdated to false when TaxPayer has same createdAt and updatedAt for KO tax type', async () => {
      const mockTaxPayer = createMockTaxPayer({
        createdAt: new Date('2025-01-01T10:00:00.000Z'),
        updatedAt: new Date('2025-01-01T10:00:00.000Z'), // Same as createdAt
      })

      prismaMock.taxPayer.findUnique.mockResolvedValue(mockTaxPayer)
      prismaMock.tax.findMany.mockResolvedValue([])

      const result = await service.getListOfTaxesByBirthnumberAndType(
        '123456/789',
        TaxType.KO,
      )

      expect(result.availabilityStatus).toBe(
        TaxAvailabilityStatus.LOOKING_FOR_YOUR_TAX,
      )
    })

    it('should set taxPayerWasUpdated to true when updatedAt is more than 1 second after createdAt for KO tax type', async () => {
      const mockTaxPayer = createMockTaxPayer({
        createdAt: new Date('2025-01-01T10:00:00.000Z'),
        updatedAt: new Date('2025-01-01T10:00:02.000Z'), // 2000ms later
      })

      prismaMock.taxPayer.findUnique.mockResolvedValue(mockTaxPayer)
      prismaMock.tax.findMany.mockResolvedValue([])

      const result = await service.getListOfTaxesByBirthnumberAndType(
        '123456/789',
        TaxType.KO,
      )

      expect(result.availabilityStatus).toBe(
        TaxAvailabilityStatus.TAX_NOT_ON_RECORD,
      )
    })

    it('should set shouldAddCurrentYear to true when current date is within tax inclusion period for KO tax type', async () => {
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
        TaxType.KO,
      )

      // With no taxes and shouldAddCurrentYear=true => LOOKING_FOR_YOUR_TAX
      expect(result.availabilityStatus).toBe(
        TaxAvailabilityStatus.LOOKING_FOR_YOUR_TAX,
      )
    })

    it('should set shouldAddCurrentYear to false when current date is outside tax inclusion period for KO tax type', async () => {
      jest.setSystemTime(new Date('2025-12-01T12:00:00.000Z'))

      const mockTaxPayer = createMockTaxPayer({
        createdAt: new Date('2025-01-01T10:00:00.000Z'),
        updatedAt: new Date('2025-01-01T10:00:02.000Z'), // updated -> true
      })
      prismaMock.taxPayer.findUnique.mockResolvedValue(mockTaxPayer)
      prismaMock.tax.findMany.mockResolvedValue([])

      const result = await service.getListOfTaxesByBirthnumberAndType(
        '123456/789',
        TaxType.KO,
      )

      expect(result.availabilityStatus).toBe(
        TaxAvailabilityStatus.TAX_NOT_ON_RECORD,
      )
    })

    it('should return LOOKING_FOR_YOUR_TAX when no KO taxes exist and shouldAddCurrentYear is true and taxPayerWasUpdated is true', async () => {
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
        TaxType.KO,
      )
      expect(result.availabilityStatus).toBe(
        TaxAvailabilityStatus.LOOKING_FOR_YOUR_TAX,
      )
    })

    it('should return LOOKING_FOR_YOUR_TAX when no KO taxes exist and shouldAddCurrentYear is false and taxPayerWasUpdated is false', async () => {
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
        TaxType.KO,
      )
      expect(result.availabilityStatus).toBe(
        TaxAvailabilityStatus.LOOKING_FOR_YOUR_TAX,
      )
    })

    it('should return TAX_NOT_ON_RECORD status when no KO taxes exist and shouldAddCurrentYear is false and taxPayerWasUpdated is true', async () => {
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
        TaxType.KO,
      )
      expect(result.availabilityStatus).toBe(
        TaxAvailabilityStatus.TAX_NOT_ON_RECORD,
      )
    })

    it('should process existing taxes and return AVAILABLE status when taxes exist', async () => {
      // Set outside inclusion period to prevent current year tax addition
      jest.setSystemTime(new Date('2025-12-01T12:00:00.000Z'))

      const mockTaxes = [
        {
          id: 1,
          createdAt: new Date('2023-01-01T10:00:00.000Z'),
          amount: 1000,
          year: 2023,
          type: TaxType.DZN,
          order: 1,
        },
        {
          id: 2,
          createdAt: new Date('2022-01-01T10:00:00.000Z'),
          amount: 800,
          year: 2022,
          type: TaxType.DZN,
          order: 1,
        },
      ]

      const mockTaxPayer = createMockTaxPayer({
        createdAt: new Date('2025-01-01T10:00:00.000Z'),
        updatedAt: new Date('2025-01-01T10:00:02.000Z'), // updated to prevent current year addition
      })

      prismaMock.taxPayer.findUnique.mockResolvedValue(mockTaxPayer)
      prismaMock.tax.findMany.mockResolvedValue(mockTaxes as any)

      // Mock getAmountAlreadyPaidByTaxId for each tax
      jest
        .spyOn(service as any, 'getAmountAlreadyPaidByTaxId')
        .mockResolvedValueOnce(200) // For tax id 1
        .mockResolvedValueOnce(0) // For tax id 2

      const result = await service.getListOfTaxesByBirthnumberAndType(
        '123456/789',
        TaxType.DZN,
      )

      expect(result.availabilityStatus).toBe(TaxAvailabilityStatus.AVAILABLE)
      expect(result.items).toHaveLength(2)
      expect(result.items[0]).toEqual({
        createdAt: mockTaxes[0].createdAt,
        year: 2023,
        amountToBePaid: 800, // 1000 - 200
        status: TaxStatusEnum.PARTIALLY_PAID,
        type: TaxType.DZN,
        order: 1,
      })
      expect(result.items[1]).toEqual({
        createdAt: mockTaxes[1].createdAt,
        year: 2022,
        amountToBePaid: 800, // 800 - 0
        status: TaxStatusEnum.NOT_PAID,
        type: TaxType.DZN,
        order: 1,
      })
      expect(result.taxAdministrator).toEqual(mockTaxPayer.taxAdministrator)
    })

    it('should add current year tax when no current year tax exists and shouldAddCurrentYear is true', async () => {
      // Set within inclusion period (March)
      jest.setSystemTime(new Date('2025-03-01T12:00:00.000Z'))

      const mockTaxes = [
        {
          id: 1,
          createdAt: new Date('2023-01-01T10:00:00.000Z'),
          amount: 1000,
          year: 2023, // Not current year (2025)
          type: TaxType.DZN,
          order: 1,
        },
      ]

      const mockTaxPayer = createMockTaxPayer({
        createdAt: new Date('2025-01-01T10:00:00.000Z'),
        updatedAt: new Date('2025-01-01T10:00:00.000Z'), // not updated
      })

      prismaMock.taxPayer.findUnique.mockResolvedValue(mockTaxPayer)
      prismaMock.tax.findMany.mockResolvedValue(mockTaxes as any)
      jest
        .spyOn(service as any, 'getAmountAlreadyPaidByTaxId')
        .mockResolvedValue(0)

      const result = await service.getListOfTaxesByBirthnumberAndType(
        '123456/789',
        TaxType.DZN,
      )

      expect(result.availabilityStatus).toBe(TaxAvailabilityStatus.AVAILABLE)
      expect(result.items).toHaveLength(2) // 1 existing + 1 current year
      expect(result.items[0]).toEqual({
        year: 2025,
        status: TaxStatusEnum.AWAITING_PROCESSING,
        type: TaxType.DZN,
        order: 1,
      })
      expect(result.items[1]).toEqual({
        createdAt: mockTaxes[0].createdAt,
        year: 2023,
        amountToBePaid: 1000,
        status: TaxStatusEnum.NOT_PAID,
        type: TaxType.DZN,
        order: 1,
      })
    })

    it('should not add current year tax when current year tax already exists', async () => {
      jest.setSystemTime(new Date('2025-03-01T12:00:00.000Z'))

      const mockTaxes = [
        {
          id: 1,
          createdAt: new Date('2025-01-01T10:00:00.000Z'),
          amount: 1000,
          year: 2025, // Current year already exists
          type: TaxType.DZN,
          order: 1,
        },
        {
          id: 2,
          createdAt: new Date('2023-01-01T10:00:00.000Z'),
          amount: 800,
          year: 2023,
          type: TaxType.DZN,
          order: 1,
        },
      ]

      const mockTaxPayer = createMockTaxPayer({
        createdAt: new Date('2025-01-01T10:00:00.000Z'),
        updatedAt: new Date('2025-01-01T10:00:00.000Z'),
      })

      prismaMock.taxPayer.findUnique.mockResolvedValue(mockTaxPayer)
      prismaMock.tax.findMany.mockResolvedValue(mockTaxes as any)
      jest
        .spyOn(service as any, 'getAmountAlreadyPaidByTaxId')
        .mockResolvedValue(0)

      const result = await service.getListOfTaxesByBirthnumberAndType(
        '123456/789',
        TaxType.DZN,
      )

      expect(result.availabilityStatus).toBe(TaxAvailabilityStatus.AVAILABLE)
      expect(result.items).toHaveLength(2) // Only existing taxes, no current year added
      expect(result.items[0].year).toBe(2025)
      expect(result.items[1].year).toBe(2023)
    })

    it('should not add current year tax when outside inclusion period and taxPayerWasUpdated is true', async () => {
      // Outside inclusion period (December)
      jest.setSystemTime(new Date('2025-12-01T12:00:00.000Z'))

      const mockTaxes = [
        {
          id: 1,
          createdAt: new Date('2023-01-01T10:00:00.000Z'),
          amount: 1000,
          year: 2023,
          type: TaxType.DZN,
          order: 1,
        },
      ]

      const mockTaxPayer = createMockTaxPayer({
        createdAt: new Date('2025-01-01T10:00:00.000Z'),
        updatedAt: new Date('2025-01-01T10:00:02.000Z'), // updated
      })

      prismaMock.taxPayer.findUnique.mockResolvedValue(mockTaxPayer)
      prismaMock.tax.findMany.mockResolvedValue(mockTaxes as any)
      jest
        .spyOn(service as any, 'getAmountAlreadyPaidByTaxId')
        .mockResolvedValue(0)

      const result = await service.getListOfTaxesByBirthnumberAndType(
        '123456/789',
        TaxType.DZN,
      )

      expect(result.availabilityStatus).toBe(TaxAvailabilityStatus.AVAILABLE)
      expect(result.items).toHaveLength(1) // Only existing tax, no current year added
      expect(result.items[0].year).toBe(2023)
    })

    it('should add current year tax when outside inclusion period but taxPayerWasUpdated is false', async () => {
      // Outside inclusion period (December)
      jest.setSystemTime(new Date('2025-12-01T12:00:00.000Z'))

      const mockTaxes = [
        {
          id: 1,
          createdAt: new Date('2023-01-01T10:00:00.000Z'),
          amount: 1000,
          year: 2023,
          type: TaxType.DZN,
          order: 1,
        },
      ]

      const mockTaxPayer = createMockTaxPayer({
        createdAt: new Date('2025-01-01T10:00:00.000Z'),
        updatedAt: new Date('2025-01-01T10:00:00.500Z'), // not updated (less than 1 second)
      })

      prismaMock.taxPayer.findUnique.mockResolvedValue(mockTaxPayer)
      prismaMock.tax.findMany.mockResolvedValue(mockTaxes as any)
      jest
        .spyOn(service as any, 'getAmountAlreadyPaidByTaxId')
        .mockResolvedValue(0)

      const result = await service.getListOfTaxesByBirthnumberAndType(
        '123456/789',
        TaxType.DZN,
      )

      expect(result.availabilityStatus).toBe(TaxAvailabilityStatus.AVAILABLE)
      expect(result.items).toHaveLength(2) // Existing tax + current year added
      expect(result.items[0]).toEqual({
        year: 2025, // Current year added first
        status: TaxStatusEnum.AWAITING_PROCESSING,
        type: TaxType.DZN,
        order: 1,
      })
      expect(result.items[1].year).toBe(2023)
    })

    it('should process KO taxes correctly when taxes exist', async () => {
      // Set outside inclusion period to prevent current year tax addition
      jest.setSystemTime(new Date('2025-12-01T12:00:00.000Z'))

      const mockKoTaxes = [
        {
          id: 1,
          createdAt: new Date('2023-01-01T10:00:00.000Z'),
          amount: 1500,
          year: 2023,
          type: TaxType.KO,
          order: 1,
        },
      ]

      const mockTaxPayer = createMockTaxPayer({
        createdAt: new Date('2025-01-01T10:00:00.000Z'),
        updatedAt: new Date('2025-01-01T10:00:02.000Z'), // updated to prevent current year addition
      })

      prismaMock.taxPayer.findUnique.mockResolvedValue(mockTaxPayer)
      prismaMock.tax.findMany.mockResolvedValue(mockKoTaxes as any)
      jest
        .spyOn(service as any, 'getAmountAlreadyPaidByTaxId')
        .mockResolvedValue(500)

      const result = await service.getListOfTaxesByBirthnumberAndType(
        '123456/789',
        TaxType.KO,
      )

      expect(result.availabilityStatus).toBe(TaxAvailabilityStatus.AVAILABLE)
      expect(result.items).toHaveLength(1)
      expect(result.items[0]).toEqual({
        createdAt: mockKoTaxes[0].createdAt,
        year: 2023,
        amountToBePaid: 1000, // 1500 - 500
        status: TaxStatusEnum.PARTIALLY_PAID,
        type: TaxType.KO,
        order: 1,
      })
      expect(result.taxAdministrator).toEqual(mockTaxPayer.taxAdministrator)
    })

    it('should process multiple KO taxes for the same year with different orders', async () => {
      // Set outside inclusion period to prevent current year tax addition
      jest.setSystemTime(new Date('2025-12-01T12:00:00.000Z'))

      const mockKoTaxes = [
        {
          id: 1,
          createdAt: new Date('2023-01-01T10:00:00.000Z'),
          amount: 1500,
          year: 2023,
          type: TaxType.KO,
          order: 1,
        },
        {
          id: 2,
          createdAt: new Date('2023-02-01T10:00:00.000Z'),
          amount: 2000,
          year: 2023,
          type: TaxType.KO,
          order: 2,
        },
        {
          id: 3,
          createdAt: new Date('2023-03-01T10:00:00.000Z'),
          amount: 1000,
          year: 2023,
          type: TaxType.KO,
          order: 3,
        },
      ]

      const mockTaxPayer = createMockTaxPayer({
        createdAt: new Date('2025-01-01T10:00:00.000Z'),
        updatedAt: new Date('2025-01-01T10:00:02.000Z'), // updated to prevent current year addition
      })

      prismaMock.taxPayer.findUnique.mockResolvedValue(mockTaxPayer)
      prismaMock.tax.findMany.mockResolvedValue(mockKoTaxes as any)

      // Mock different payment amounts for each tax
      jest
        .spyOn(service as any, 'getAmountAlreadyPaidByTaxId')
        .mockImplementation((...args: unknown[]) => {
          const taxId = args[0] as number
          switch (taxId) {
            case 1:
              return Promise.resolve(500)

            case 2:
              return Promise.resolve(2000)

            case 3:
              return Promise.resolve(0)

            default:
              return Promise.resolve(0)
          }
        })

      const result = await service.getListOfTaxesByBirthnumberAndType(
        '123456/789',
        TaxType.KO,
      )

      expect(result.availabilityStatus).toBe(TaxAvailabilityStatus.AVAILABLE)
      expect(result.items).toHaveLength(3)

      // Check first tax (order 1) - partially paid
      expect(result.items[0]).toEqual({
        createdAt: mockKoTaxes[0].createdAt,
        year: 2023,
        amountToBePaid: 1000, // 1500 - 500
        status: TaxStatusEnum.PARTIALLY_PAID,
        type: TaxType.KO,
        order: 1,
      })

      // Check second tax (order 2) - fully paid
      expect(result.items[1]).toEqual({
        createdAt: mockKoTaxes[1].createdAt,
        year: 2023,
        amountToBePaid: 0, // 2000 - 2000
        status: TaxStatusEnum.PAID,
        type: TaxType.KO,
        order: 2,
      })

      // Check third tax (order 3) - not paid
      expect(result.items[2]).toEqual({
        createdAt: mockKoTaxes[2].createdAt,
        year: 2023,
        amountToBePaid: 1000, // 1000 - 0
        status: TaxStatusEnum.NOT_PAID,
        type: TaxType.KO,
        order: 3,
      })

      expect(result.taxAdministrator).toEqual(mockTaxPayer.taxAdministrator)
    })

    it('should process multiple KO taxes across different years with different orders', async () => {
      // Set outside inclusion period to prevent current year tax addition
      jest.setSystemTime(new Date('2025-12-01T12:00:00.000Z'))

      const mockKoTaxes = [
        {
          id: 4,
          createdAt: new Date('2023-02-01T10:00:00.000Z'),
          amount: 2000,
          year: 2023,
          type: TaxType.KO,
          order: 2,
        },
        {
          id: 3,
          createdAt: new Date('2023-01-01T10:00:00.000Z'),
          amount: 1500,
          year: 2023,
          type: TaxType.KO,
          order: 1,
        },
        {
          id: 2,
          createdAt: new Date('2022-02-01T10:00:00.000Z'),
          amount: 800,
          year: 2022,
          type: TaxType.KO,
          order: 2,
        },
        {
          id: 1,
          createdAt: new Date('2022-01-01T10:00:00.000Z'),
          amount: 1200,
          year: 2022,
          type: TaxType.KO,
          order: 1,
        },
      ]

      const mockTaxPayer = createMockTaxPayer({
        createdAt: new Date('2025-01-01T10:00:00.000Z'),
        updatedAt: new Date('2025-01-01T10:00:02.000Z'), // updated to prevent current year addition
      })

      prismaMock.taxPayer.findUnique.mockResolvedValue(mockTaxPayer)
      prismaMock.tax.findMany.mockResolvedValue(mockKoTaxes as any)

      // Mock different payment amounts for each tax
      jest
        .spyOn(service as any, 'getAmountAlreadyPaidByTaxId')
        .mockImplementation((...args: unknown[]) => {
          const taxId = args[0] as number
          switch (taxId) {
            case 1:
              return Promise.resolve(1200)

            case 2:
              return Promise.resolve(400)

            case 3:
              return Promise.resolve(0)

            case 4:
              return Promise.resolve(2000)

            default:
              return Promise.resolve(0)
          }
        })

      const result = await service.getListOfTaxesByBirthnumberAndType(
        '123456/789',
        TaxType.KO,
      )

      expect(result.availabilityStatus).toBe(TaxAvailabilityStatus.AVAILABLE)
      expect(result.items).toHaveLength(4)

      expect(result.items[0]).toEqual({
        createdAt: mockKoTaxes[0].createdAt,
        year: 2023,
        amountToBePaid: 0, // 2000 - 2000
        status: TaxStatusEnum.PAID,
        type: TaxType.KO,
        order: 2,
      })

      expect(result.items[1]).toEqual({
        createdAt: mockKoTaxes[1].createdAt,
        year: 2023,
        amountToBePaid: 1500, // 1500 - 0
        status: TaxStatusEnum.NOT_PAID,
        type: TaxType.KO,
        order: 1,
      })

      expect(result.items[2]).toEqual({
        createdAt: mockKoTaxes[2].createdAt,
        year: 2022,
        amountToBePaid: 400, // 800 - 400
        status: TaxStatusEnum.PARTIALLY_PAID,
        type: TaxType.KO,
        order: 2,
      })

      expect(result.items[3]).toEqual({
        createdAt: mockKoTaxes[3].createdAt,
        year: 2022,
        amountToBePaid: 0, // 1200 - 1200
        status: TaxStatusEnum.PAID,
        type: TaxType.KO,
        order: 1,
      })

      expect(result.taxAdministrator).toEqual(mockTaxPayer.taxAdministrator)
    })
  })

  describe('getTaxDetail', () => {
    it('should return tax detail from implementation', async () => {
      const mockTaxDetail = {
        paidStatus: TaxPaidStatusEnum.PAID,
        year: 2023,
        overallPaid: 1000,
        overallBalance: 0,
        overallAmount: 1000,
        itemizedDetail: {} as any,
        oneTimePayment: {} as any,
        installmentPayment: {} as any,
        taxAdministrator: null,
        taxPayer: {} as any,
      } as ResponseTaxSummaryDetailDto

      const mockImplementation = {
        getTaxDetail: jest.fn().mockResolvedValue(mockTaxDetail),
      }

      jest
        .spyOn(service as any, 'getImplementationByType')
        .mockReturnValue(mockImplementation)

      const result = await service.getTaxDetail(
        '123456/789',
        2023,
        TaxType.DZN,
        1,
      )

      expect(mockImplementation.getTaxDetail).toHaveBeenCalledWith(
        '123456/789',
        2023,
        1,
      )
      expect(result).toEqual(mockTaxDetail)
    })

    it('should throw error for unsupported tax type', async () => {
      const thrownError = new HttpException(
        'Implementation for tax type UNKNOWN_TYPE not found',
        HttpStatus.INTERNAL_SERVER_ERROR,
      )
      jest
        .spyOn(service['throwerErrorGuard'], 'InternalServerErrorException')
        .mockReturnValue(thrownError)

      await expect(
        service.getTaxDetail('123456/789', 2023, 'UNKNOWN_TYPE' as TaxType, 1),
      ).rejects.toThrow(thrownError)
    })
  })

  describe('getOneTimePaymentGenerator', () => {
    const mockTaxPayerWhereUniqueInput = { birthNumber: '123456/789' }
    const mockOneTimeTaxData = {
      id: 1,
      amount: 1000,
      taxPayments: [
        { amount: 200, status: PaymentStatus.SUCCESS },
        { amount: 100, status: PaymentStatus.NEW },
      ],
    }

    const mockPaymentGeneratorDto = {
      taxId: 1,
      description: 'Test payment',
      amount: 800,
    } as PaymentGateURLGeneratorDto

    it('should return one-time payment generator for valid tax type', async () => {
      const mockImplementation = {
        fetchTaxData: jest.fn().mockResolvedValue(mockOneTimeTaxData),
      }

      jest
        .spyOn(service as any, 'getImplementationByType')
        .mockReturnValue(mockImplementation)
      jest
        .spyOn(unifiedTaxUtil, 'getTaxDetailPureForOneTimeGenerator')
        .mockReturnValue(mockPaymentGeneratorDto)

      const result = await service.getOneTimePaymentGenerator(
        mockTaxPayerWhereUniqueInput,
        2023,
        TaxType.DZN,
        1,
      )

      expect(mockImplementation.fetchTaxData).toHaveBeenCalledWith(
        mockTaxPayerWhereUniqueInput,
        { taxPayments: true },
        2023,
        TaxType.DZN,
        1,
      )
      expect(
        unifiedTaxUtil.getTaxDetailPureForOneTimeGenerator,
      ).toHaveBeenCalledWith({
        taxId: 1,
        overallAmount: 1000,
        taxPayments: mockOneTimeTaxData.taxPayments,
      })
      expect(result).toEqual(mockPaymentGeneratorDto)
    })

    it('should throw error for unsupported tax type', async () => {
      const thrownError = new HttpException(
        'Implementation for tax type KO not found',
        HttpStatus.INTERNAL_SERVER_ERROR,
      )
      jest
        .spyOn(service['throwerErrorGuard'], 'InternalServerErrorException')
        .mockReturnValue(thrownError)

      await expect(
        service.getOneTimePaymentGenerator(
          mockTaxPayerWhereUniqueInput,
          2023,
          TaxType.KO,
          1,
        ),
      ).rejects.toThrow(thrownError)
    })
  })

  describe('getInstallmentPaymentGenerator', () => {
    const mockTaxPayerWhereUniqueInput = { birthNumber: '123456/789' }
    const mockInstallmentTaxData = {
      id: 1,
      amount: 1000,
      variableSymbol: 'VS123',
      dateTaxRuling: new Date('2023-01-01'),
      taxInstallments: [
        { order: 1, amount: 500 },
        { order: 2, amount: 500 },
      ],
      taxPayments: [{ amount: 200, status: PaymentStatus.SUCCESS }],
    }

    const expectedTaxDefinition = getTaxDefinitionByType(TaxType.DZN)

    const mockPaymentGeneratorDto = {
      taxId: 1,
      description: 'Test installment payment',
      amount: 800,
    } as PaymentGateURLGeneratorDto

    beforeEach(() => {
      jest.useFakeTimers()
      jest.setSystemTime(new Date('2023-06-01T12:00:00.000Z'))
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    it('should return installment payment generator for valid tax type', async () => {
      const mockImplementation = {
        fetchTaxData: jest.fn().mockResolvedValue(mockInstallmentTaxData),
      }

      jest
        .spyOn(service as any, 'getImplementationByType')
        .mockReturnValue(mockImplementation)
      jest
        .spyOn(unifiedTaxUtil, 'getTaxDetailPureForInstallmentGenerator')
        .mockReturnValue(mockPaymentGeneratorDto)

      // Note: getTaxDefinitionByType is not mocked, so it will use the real implementation

      const result = await service.getInstallmentPaymentGenerator(
        mockTaxPayerWhereUniqueInput,
        2023,
        TaxType.DZN,
        1,
      )

      expect(mockImplementation.fetchTaxData).toHaveBeenCalledWith(
        mockTaxPayerWhereUniqueInput,
        { taxInstallments: true, taxPayments: true },
        2023,
        TaxType.DZN,
        1,
      )
      expect(
        unifiedTaxUtil.getTaxDetailPureForInstallmentGenerator,
      ).toHaveBeenCalledWith({
        taxId: 1,
        taxDefinition: expectedTaxDefinition,
        taxYear: 2023,
        today: expect.any(Date),
        overallAmount: 1000,
        variableSymbol: 'VS123',
        dateOfValidity: new Date('2023-01-01'),
        installments: mockInstallmentTaxData.taxInstallments,
        specificSymbol: expect.any(String),
        taxPayments: mockInstallmentTaxData.taxPayments,
      })
      expect(result).toEqual(mockPaymentGeneratorDto)
    })

    it('should throw error for unsupported tax type', async () => {
      const thrownError = new HttpException(
        'Implementation for tax type KO not found',
        HttpStatus.INTERNAL_SERVER_ERROR,
      )
      jest
        .spyOn(service['throwerErrorGuard'], 'InternalServerErrorException')
        .mockReturnValue(thrownError)

      await expect(
        service.getInstallmentPaymentGenerator(
          mockTaxPayerWhereUniqueInput,
          2023,
          TaxType.KO,
          1,
        ),
      ).rejects.toThrow(thrownError)
    })

    it('should use current date for today parameter', async () => {
      const fixedDate = new Date('2023-06-15T14:30:00.000Z')
      jest.setSystemTime(fixedDate)

      const mockImplementation = {
        fetchTaxData: jest.fn().mockResolvedValue(mockInstallmentTaxData),
      }

      jest
        .spyOn(service as any, 'getImplementationByType')
        .mockReturnValue(mockImplementation)
      jest
        .spyOn(unifiedTaxUtil, 'getTaxDetailPureForInstallmentGenerator')
        .mockReturnValue(mockPaymentGeneratorDto)

      await service.getInstallmentPaymentGenerator(
        mockTaxPayerWhereUniqueInput,
        2023,
        TaxType.DZN,
        1,
      )

      expect(
        unifiedTaxUtil.getTaxDetailPureForInstallmentGenerator,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          today: expect.any(Date),
        }),
      )
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
