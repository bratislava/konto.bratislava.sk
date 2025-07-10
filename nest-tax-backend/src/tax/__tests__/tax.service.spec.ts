import { createMock } from '@golevelup/ts-jest'
import { HttpException, HttpStatus } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { PaymentStatus, Prisma } from '@prisma/client'
import * as ejs from 'ejs'

import prismaMock from '../../../test/singleton'
import { PaymentService } from '../../payment/payment.service'
import { PrismaService } from '../../prisma/prisma.service'
import ThrowerErrorGuard from '../../utils/guards/errors.guard'
import * as paymentHelper from '../../utils/helpers/payment.helper'
import { QrCodeSubservice } from '../../utils/subservices/qrcode.subservice'
import {
  CustomErrorTaxTypesEnum,
  CustomErrorTaxTypesResponseEnum,
} from '../dtos/error.dto'
import {
  OneTimePaymentTypeEnum,
  TaxPaidStatusEnum,
} from '../dtos/response.tax.dto'
import { TaxService } from '../tax.service'
import * as pdfHelper from '../utils/helpers/pdf.helper'
import * as taxHelper from '../utils/helpers/tax.helper'
import * as unifiedTaxUtil from '../utils/unified-tax.util'

jest.mock('ejs', () => ({
  renderFile: jest.fn(),
}))

jest.mock('../utils/helpers/tax.helper', () => ({
  fixInstallmentTexts: jest.fn(),
  getTaxStatus: jest.fn(),
}))

jest.mock('../utils/unified-tax.util', () => ({
  getTaxDetailPure: jest.fn(),
}))

jest.mock('../../utils/helpers/payment.helper', () => ({
  computeIsPayableYear: jest.fn(),
}))

jest.mock('../utils/helpers/pdf.helper', () => ({
  taxDetailsToPdf: jest.fn(),
  taxTotalsToPdf: jest.fn(),
}))

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

  describe('getTaxByYear', () => {
    it('should return tax data for valid year and birth number', async () => {
      prismaMock.tax.findFirst.mockResolvedValue(mockTaxData as any)
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

      const result = await service.getTaxByYear(2023, '123456/789')

      expect(prismaMock.tax.findFirst).toHaveBeenCalledWith({
        where: {
          year: 2023,
          taxPayer: { birthNumber: '123456/789' },
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

      await expect(service.getTaxByYear(2023, '')).rejects.toThrow()

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
        service.getTaxByYear(null as any, '123456/789'),
      ).rejects.toThrow()

      expect(notFoundExceptionSpy).toHaveBeenCalledWith(
        CustomErrorTaxTypesEnum.TAX_YEAR_OR_USER_NOT_FOUND,
        CustomErrorTaxTypesResponseEnum.TAX_YEAR_OR_USER_NOT_FOUND,
      )
    })

    it('should generate QR code when partially paid', async () => {
      prismaMock.tax.findFirst.mockResolvedValue(mockTaxData as any)
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

      const result = await service.getTaxByYear(2023, '123456/789')

      expect(createQrCodeSpy).toHaveBeenCalledWith({
        amount: 800, // 1000 - 200
        variableSymbol: 'VS123',
        specificSymbol: '2023200000',
      })
      expect(result.qrCodeWeb).toBe('qr-code-data')
    })

    it('should not generate QR code when fully paid', async () => {
      mockTaxData.qrCodeWeb = null
      prismaMock.tax.findFirst.mockResolvedValue(mockTaxData as any)
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

      const result = await service.getTaxByYear(2023, '123456/789')

      expect(createQrCodeSpy).not.toHaveBeenCalled()
      expect(result.qrCodeWeb).toBeNull()
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

      const result = await service.loadTaxes('123456/789')

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

      await expect(service.loadTaxes('')).rejects.toThrow()

      expect(forbiddenExceptionSpy).toHaveBeenCalledWith(
        CustomErrorTaxTypesEnum.BIRTHNUMBER_NOT_EXISTS,
        CustomErrorTaxTypesResponseEnum.BIRTHNUMBER_NOT_EXISTS,
      )
    })

    it('should return empty list when no taxes found', async () => {
      prismaMock.taxPayment.groupBy.mockResolvedValue([])
      prismaMock.tax.findMany.mockResolvedValue([])
      prismaMock.taxPayer.findUnique.mockResolvedValue(null)

      const result = await service.loadTaxes('123456/789')

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
      prismaMock.tax.findFirst.mockResolvedValue(mockTaxData as any)
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
      jest.spyOn(pdfHelper, 'taxDetailsToPdf').mockReturnValue(mockTaxDetails)
      jest.spyOn(pdfHelper, 'taxTotalsToPdf').mockReturnValue(mockTaxTotals)
      const renderFileSpy = jest
        .spyOn(ejs, 'renderFile')
        .mockResolvedValue('<html>PDF content</html>')

      const result = await service.generatePdf(2023, '123456/789')

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

      prismaMock.tax.findFirst.mockRejectedValue(mockError)
      jest
        .spyOn(service['throwerErrorGuard'], 'UnprocessableEntityException')
        .mockReturnValue(thrownError)

      await expect(service.generatePdf(2023, '123456/789')).rejects.toThrow(
        thrownError,
      )

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
  })

  describe('getTaxDetail', () => {
    beforeEach(() => {
      jest.useFakeTimers().setSystemTime(new Date('2023-05-01'))
    })

    const mockTaxDetailPure = {
      oneTimePayment: {
        isPossible: true,
        type: OneTimePaymentTypeEnum.ONE_TIME_PAYMENT,
        amount: 800,
        qrCode: {
          amount: 800,
          variableSymbol: 'VS123',
          specificSymbol: '2025200000',
        },
      },
      installmentPayment: {
        isPossible: true,
        activeInstallment: {
          remainingAmount: 300,
          variableSymbol: 'VS123',
          qrCode: {
            amount: 300,
            variableSymbol: 'VS123',
            specificSymbol: '2025200000',
          },
        },
      },
      taxYear: 2023,
      overallAmount: 1000,
      paidAmount: 200,
      overallPaid: 800,
    }

    it('should return detailed tax information with QR codes', async () => {
      prismaMock.tax.findFirst.mockResolvedValue(mockTaxData as any)
      const taxDetailPure = jest
        .spyOn(unifiedTaxUtil, 'getTaxDetailPure')
        .mockReturnValue(mockTaxDetailPure as any)
      jest
        .spyOn(unifiedTaxUtil, 'getTaxDetailPure')
        .mockReturnValue(mockTaxDetailPure as any)
      jest
        .spyOn(service['paymentService'], 'getPayGateUrlByUserAndYear')
        .mockResolvedValue('https://payment.gateway/pay')
      jest
        .spyOn(service['qrCodeSubservice'], 'createQrCode')
        .mockResolvedValueOnce('one-time-qr-code')
      jest
        .spyOn(service['qrCodeSubservice'], 'createQrCode')
        .mockResolvedValueOnce('installment-qr-code')

      const result = await service.getTaxDetail('123456/789', 2023)

      expect(taxDetailPure).toHaveBeenCalledWith({
        taxYear: 2023,
        today: expect.any(Date),
        overallAmount: 1000,
        paymentCalendarThreshold: 6600,
        variableSymbol: 'VS123',
        dateOfValidity: mockTaxData.dateTaxRuling,
        installments: mockTaxData.taxInstallments,
        taxDetails: mockTaxData.taxDetails,
        taxConstructions: 0,
        taxFlat: 0,
        taxLand: 0,
        specificSymbol: '2025200000',
        taxPayments: mockTaxData.taxPayments,
      })

      expect(result).toEqual(
        expect.objectContaining({
          oneTimePayment: expect.objectContaining({
            qrCode: 'one-time-qr-code',
            paymentGatewayLink: 'https://payment.gateway/pay',
          }),
          installmentPayment: expect.objectContaining({
            activeInstallment: expect.objectContaining({
              qrCode: 'installment-qr-code',
            }),
          }),
          taxAdministrator: mockTaxData.taxPayer.taxAdministrator,
        }),
      )
    })

    it('should handle case when one-time payment is not possible', async () => {
      const mockTaxDetailPureNotPossible = {
        ...mockTaxDetailPure,
        oneTimePayment: {
          isPossible: false,
          type: OneTimePaymentTypeEnum.ONE_TIME_PAYMENT,
          amount: 0,
          qrCode: null,
        },
      }

      prismaMock.tax.findFirst.mockResolvedValue(mockTaxData as any)
      jest
        .spyOn(unifiedTaxUtil, 'getTaxDetailPure')
        .mockReturnValue(mockTaxDetailPureNotPossible as any)

      const result = await service.getTaxDetail('123456/789', 2023)

      const getPayGateSpy = jest.spyOn(
        PaymentService.prototype,
        'getPayGateUrlByUserAndYear',
      )
      expect(getPayGateSpy).not.toHaveBeenCalled()
      expect(result.oneTimePayment).toEqual(
        expect.objectContaining({
          qrCode: undefined,
          paymentGatewayLink: undefined,
        }),
      )
    })

    it('should handle case when installment payment has no active installment', async () => {
      const mockTaxDetailPureNoInstallment = {
        ...mockTaxDetailPure,
        installmentPayment: {
          isPossible: false,
          activeInstallment: null,
        },
      }

      jest
        .spyOn(service['qrCodeSubservice'], 'createQrCode')
        .mockResolvedValue('one-time-qr-code')

      prismaMock.tax.findFirst.mockResolvedValue(mockTaxData as any)
      jest
        .spyOn(unifiedTaxUtil, 'getTaxDetailPure')
        .mockReturnValue(mockTaxDetailPureNoInstallment as any)

      const result = await service.getTaxDetail('123456/789', 2023)

      expect(result.installmentPayment.activeInstallment).toBeUndefined()
    })
  })

  describe('private methods', () => {
    describe('fetchTaxData', () => {
      it('should fetch tax data successfully', async () => {
        prismaMock.tax.findFirst.mockResolvedValue(mockTaxData as any)

        const result = await service['fetchTaxData']('123456/789', 2023)

        expect(prismaMock.tax.findFirst).toHaveBeenCalledWith({
          where: {
            year: 2023,
            taxPayer: { birthNumber: '123456/789' },
          },
          include: {
            taxInstallments: true,
            taxPayer: { include: { taxAdministrator: true } },
            taxDetails: true,
            taxPayments: true,
          },
        })
        expect(result).toEqual(mockTaxData)
      })

      it('should throw error when tax not found', async () => {
        prismaMock.tax.findFirst.mockResolvedValue(null)
        const notFoundExceptionSpy = jest.spyOn(
          service['throwerErrorGuard'],
          'NotFoundException',
        )
        await expect(
          service['fetchTaxData']('123456/789', 2023),
        ).rejects.toThrow()

        expect(notFoundExceptionSpy).toHaveBeenCalledWith(
          CustomErrorTaxTypesEnum.TAX_YEAR_OR_USER_NOT_FOUND,
          CustomErrorTaxTypesResponseEnum.TAX_YEAR_OR_USER_NOT_FOUND,
        )
      })
    })

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
