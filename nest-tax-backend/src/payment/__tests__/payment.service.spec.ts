import { createMock } from '@golevelup/ts-jest'
import { ConfigService } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import { PaymentStatus, TaxPaymentSource, TaxType } from '@prisma/client'

import prismaMock from '../../../test/singleton'
import { BloomreachService } from '../../bloomreach/bloomreach.service'
import { PrismaService } from '../../prisma/prisma.service'
import { TaxService } from '../../tax/tax.service'
import ThrowerErrorGuard from '../../utils/guards/errors.guard'
import { CityAccountSubservice } from '../../utils/subservices/cityaccount.subservice'
import { PaymentResponseQueryDto } from '../../utils/subservices/dtos/gpwebpay.dto'
import { GpWebpaySubservice } from '../../utils/subservices/gpwebpay.subservice'
import { TaxPaymentWithTaxInfo } from '../../utils/types/types.prisma'
import { RetryService } from '../../utils-module/retry.service'
import { PaymentRedirectStateEnum } from '../dtos/redirect.payent.dto'
import { PaymentService } from '../payment.service'

describe('PaymentService', () => {
  let service: PaymentService
  let bloomreachService: BloomreachService
  let throwerErrorGuard: ThrowerErrorGuard
  let gpWebpaySubservice: GpWebpaySubservice
  let retryService: RetryService

  const originalEnv = process.env

  beforeEach(async () => {
    jest.resetModules()
    process.env = { ...originalEnv }
    process.env.PAYGATE_AFTER_PAYMENT_REDIRECT_FRONTEND = 'https://frontend.url'
    process.env.PAYGATE_MERCHANT_NUMBER = '12345'

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentService,
        { provide: PrismaService, useValue: prismaMock },
        {
          provide: BloomreachService,
          useValue: createMock<BloomreachService>(),
        },
        {
          provide: ThrowerErrorGuard,
          useValue: createMock<ThrowerErrorGuard>(),
        },
        {
          provide: ConfigService,
          useValue: createMock<ConfigService>(),
        },
        GpWebpaySubservice,
        {
          provide: CityAccountSubservice,
          useValue: createMock<CityAccountSubservice>(),
        },
        {
          provide: RetryService,
          useValue: createMock<RetryService>(),
        },
        {
          provide: TaxService,
          useValue: createMock<TaxService>(),
        },
      ],
    }).compile()

    service = module.get<PaymentService>(PaymentService)
    bloomreachService = module.get<BloomreachService>(BloomreachService)
    throwerErrorGuard = module.get<ThrowerErrorGuard>(ThrowerErrorGuard)
    gpWebpaySubservice = module.get<GpWebpaySubservice>(GpWebpaySubservice)
    retryService = module.get<RetryService>(RetryService)
  })

  describe('trackPaymentInBloomreach', () => {
    const mockTaxPayment: TaxPaymentWithTaxInfo = {
      id: 1,
      amount: 150_000,
      source: TaxPaymentSource.CARD,
      bloomreachEventSent: false,
      tax: {
        year: 2024,
        type: TaxType.DZN,
        order: 1,
      },
    } as TaxPaymentWithTaxInfo

    it('should update bloomreachEventSent flag and track event when externalId is provided and tracking succeeds', async () => {
      const externalId = 'external-id-123'
      const mockUpdate = jest.fn()
      const mockTransaction = jest.fn().mockImplementation(async (callback) => {
        const mockTx = {
          taxPayment: {
            update: mockUpdate,
          },
        }
        return callback(mockTx)
      })

      jest.spyOn(prismaMock, '$transaction').mockImplementation(mockTransaction)
      jest
        .spyOn(bloomreachService, 'trackEventTaxPayment')
        .mockResolvedValue(true)

      await service.trackPaymentInBloomreach(mockTaxPayment, externalId)

      expect(prismaMock.$transaction).toHaveBeenCalled()
      expect(mockUpdate).toHaveBeenCalledWith({
        where: { id: mockTaxPayment.id },
        data: { bloomreachEventSent: true },
      })

      expect(bloomreachService.trackEventTaxPayment).toHaveBeenCalledWith(
        {
          amount: mockTaxPayment.amount,
          payment_source: mockTaxPayment.source,
          year: mockTaxPayment.tax.year,
          suppress_email: false,
          taxType: mockTaxPayment.tax.type,
          order: mockTaxPayment.tax.order,
        },
        externalId,
      )
    })

    it('should use BANK_ACCOUNT as default payment_source when source is null', async () => {
      const externalId = 'external-id-123'
      const taxPaymentWithoutSource = {
        ...mockTaxPayment,
        source: null,
      } as TaxPaymentWithTaxInfo

      const mockTransaction = jest.fn().mockImplementation(async (callback) => {
        const mockTx = {
          taxPayment: {
            update: jest.fn(),
          },
        }
        return callback(mockTx)
      })

      jest.spyOn(prismaMock, '$transaction').mockImplementation(mockTransaction)
      jest
        .spyOn(bloomreachService, 'trackEventTaxPayment')
        .mockResolvedValue(true)

      await service.trackPaymentInBloomreach(
        taxPaymentWithoutSource,
        externalId,
      )

      expect(bloomreachService.trackEventTaxPayment).toHaveBeenCalledWith(
        {
          amount: taxPaymentWithoutSource.amount,
          payment_source: TaxPaymentSource.BANK_ACCOUNT,
          year: taxPaymentWithoutSource.tax.year,
          suppress_email: false,
          taxType: mockTaxPayment.tax.type,
          order: mockTaxPayment.tax.order,
        },
        externalId,
      )
    })

    it('should only update bloomreachEventSent flag when externalId is not provided', async () => {
      const mockUpdate = jest.fn()
      const mockTransaction = jest.fn().mockImplementation(async (callback) => {
        const mockTx = {
          taxPayment: {
            update: mockUpdate,
          },
        }
        return callback(mockTx)
      })

      jest.spyOn(prismaMock, '$transaction').mockImplementation(mockTransaction)

      await service.trackPaymentInBloomreach(mockTaxPayment)

      expect(prismaMock.$transaction).toHaveBeenCalled()
      expect(mockUpdate).toHaveBeenCalledWith({
        where: { id: mockTaxPayment.id },
        data: { bloomreachEventSent: true },
      })

      expect(bloomreachService.trackEventTaxPayment).not.toHaveBeenCalled()
    })

    it('should throw InternalServerErrorException when tracking fails (returns false)', async () => {
      const externalId = 'external-id-123'
      const mockInternalServerError = new Error('Internal Server Error')
      const mockTransaction = jest.fn().mockImplementation(async (callback) => {
        const mockTx = {
          taxPayment: {
            update: jest.fn(),
          },
        }
        return callback(mockTx)
      })

      jest.spyOn(prismaMock, '$transaction').mockImplementation(mockTransaction)
      jest
        .spyOn(bloomreachService, 'trackEventTaxPayment')
        .mockResolvedValue(false)
      jest
        .spyOn(throwerErrorGuard, 'InternalServerErrorException')
        .mockReturnValue(mockInternalServerError as any)

      await expect(
        service.trackPaymentInBloomreach(mockTaxPayment, externalId),
      ).rejects.toThrow(mockInternalServerError)

      expect(bloomreachService.trackEventTaxPayment).toHaveBeenCalled()
    })

    it('should rollback transaction when tracking fails', async () => {
      const externalId = 'external-id-123'
      let transactionThrow = false
      const mockTransaction = jest.fn().mockImplementation(async (callback) => {
        const mockTx = {
          taxPayment: {
            update: jest.fn(),
          },
        }
        try {
          const result = await callback(mockTx)
          return result
        } catch (error) {
          transactionThrow = true
          throw new Error('Transaction error')
        }
      })

      jest.spyOn(prismaMock, '$transaction').mockImplementation(mockTransaction)
      jest
        .spyOn(bloomreachService, 'trackEventTaxPayment')
        .mockResolvedValue(false)
      jest
        .spyOn(throwerErrorGuard, 'InternalServerErrorException')
        .mockImplementation(() => {
          throw new Error('Internal Server Error')
        })

      await expect(
        service.trackPaymentInBloomreach(mockTaxPayment, externalId),
      ).rejects.toThrow()

      expect(mockTransaction).toHaveBeenCalled()
      expect(transactionThrow).toBe(true)
    })
  })

  describe('processPaymentResponse', () => {
    const mockQuery: PaymentResponseQueryDto = {
      OPERATION: 'CREATE_ORDER',
      ORDERNUMBER: '123456789',
      PRCODE: '0',
      SRCODE: '0',
      DIGEST: 'digest',
      DIGEST1: 'digest1',
      RESULTTEXT: 'OK',
    }

    const mockTaxPayment = {
      id: 1,
      orderId: '123456789',
      status: PaymentStatus.NEW,
      tax: {
        year: 2024,
        type: TaxType.DZN,
        order: 1,
        taxPayer: { birthNumber: '123456/7890' },
      },
    }

    it('should return FAILED_TO_VERIFY if ORDERNUMBER is missing', async () => {
      const result = await service.processPaymentResponse({
        ...mockQuery,
        ORDERNUMBER: undefined,
      } as any)
      expect(result).toBe(
        `${process.env.PAYGATE_AFTER_PAYMENT_REDIRECT_FRONTEND}?status=${PaymentRedirectStateEnum.FAILED_TO_VERIFY}`,
      )
    })

    it('should return FAILED_TO_VERIFY if DIGEST verification fails', async () => {
      jest.spyOn(gpWebpaySubservice, 'getDataToVerify').mockReturnValue('data')
      jest.spyOn(gpWebpaySubservice, 'verifyData').mockReturnValue(false)

      const result = await service.processPaymentResponse(mockQuery)
      expect(result).toBe(
        `${process.env.PAYGATE_AFTER_PAYMENT_REDIRECT_FRONTEND}?status=${PaymentRedirectStateEnum.FAILED_TO_VERIFY}`,
      )
    })

    it('should return PAYMENT_FAILED if payment is not found in database', async () => {
      const redirectUrl = 'https://frontend.url'
      process.env.PAYGATE_AFTER_PAYMENT_REDIRECT_FRONTEND = redirectUrl

      jest.spyOn(gpWebpaySubservice, 'verifyData').mockReturnValue(true)
      jest.spyOn(prismaMock.taxPayment, 'findUnique').mockResolvedValue(null)

      const result = await service.processPaymentResponse(mockQuery)
      expect(result).toBe(
        `${process.env.PAYGATE_AFTER_PAYMENT_REDIRECT_FRONTEND}?status=${PaymentRedirectStateEnum.PAYMENT_FAILED}`,
      )
    })

    it('should process successful payment (PRCODE 0)', async () => {
      jest.spyOn(gpWebpaySubservice, 'verifyData').mockReturnValue(true)
      jest
        .spyOn(prismaMock.taxPayment, 'findUnique')
        .mockResolvedValue(mockTaxPayment as any)
      jest.spyOn(prismaMock.taxPayment, 'update').mockResolvedValue({
        ...mockTaxPayment,
        status: PaymentStatus.SUCCESS,
      } as any)
      jest
        .spyOn(retryService, 'retryWithDelay')
        .mockResolvedValue({ externalId: 'ext-123' })
      const trackSpy = jest
        .spyOn(service, 'trackPaymentInBloomreach')
        .mockResolvedValue()

      const result = await service.processPaymentResponse(mockQuery)

      expect(prismaMock.taxPayment.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { orderId: mockQuery.ORDERNUMBER },
          data: {
            status: PaymentStatus.SUCCESS,
            source: TaxPaymentSource.CARD,
          },
        }),
      )
      expect(trackSpy).toHaveBeenCalled()
      expect(result).toContain(
        `status=${PaymentRedirectStateEnum.PAYMENT_SUCCESS}`,
      )
    })

    it('should handle "Already Paid" response (PRCODE 14)', async () => {
      jest.spyOn(gpWebpaySubservice, 'verifyData').mockReturnValue(true)
      jest
        .spyOn(prismaMock.taxPayment, 'findUnique')
        .mockResolvedValue(mockTaxPayment as any)
      const updateSpy = jest.spyOn(prismaMock.taxPayment, 'update')

      const result = await service.processPaymentResponse({
        ...mockQuery,
        PRCODE: '14',
      })

      expect(updateSpy).not.toHaveBeenCalled()
      expect(result).toContain(
        `status=${PaymentRedirectStateEnum.PAYMENT_ALREADY_PAID}`,
      )
    })

    it('should handle Digest mismatch (PRCODE 31)', async () => {
      jest.spyOn(gpWebpaySubservice, 'verifyData').mockReturnValue(true)
      jest
        .spyOn(prismaMock.taxPayment, 'findUnique')
        .mockResolvedValue(mockTaxPayment as any)

      const result = await service.processPaymentResponse({
        ...mockQuery,
        PRCODE: '31',
      })

      expect(result).toContain(
        `status=${PaymentRedirectStateEnum.FAILED_TO_VERIFY}`,
      )
    })

    it('should transition NEW to FAIL for technical errors (PRCODE 1)', async () => {
      jest.spyOn(gpWebpaySubservice, 'verifyData').mockReturnValue(true)
      jest
        .spyOn(prismaMock.taxPayment, 'findUnique')
        .mockResolvedValue(mockTaxPayment as any)
      jest.spyOn(prismaMock.taxPayment, 'update').mockResolvedValue({
        ...mockTaxPayment,
        status: PaymentStatus.FAIL,
      } as any)

      const result = await service.processPaymentResponse({
        ...mockQuery,
        PRCODE: '1',
      })

      expect(prismaMock.taxPayment.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: PaymentStatus.FAIL }),
        }),
      )
      expect(result).toContain(
        `status=${PaymentRedirectStateEnum.PAYMENT_FAILED}`,
      )
    })

    it('should throw UnprocessableEntityException on unexpected error', async () => {
      jest.spyOn(gpWebpaySubservice, 'verifyData').mockImplementation(() => {
        throw new Error('Unexpected')
      })
      const mockError = new Error('Mapped Error')
      jest
        .spyOn(throwerErrorGuard, 'UnprocessableEntityException')
        .mockReturnValue(mockError as any)

      await expect(service.processPaymentResponse(mockQuery)).rejects.toThrow(
        'Mapped Error',
      )
    })
  })
})
