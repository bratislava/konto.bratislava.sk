import { createMock } from '@golevelup/ts-jest'
import { ConfigService } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import { TaxPaymentSource } from '@prisma/client'

import prismaMock from '../../../test/singleton'
import { BloomreachService } from '../../bloomreach/bloomreach.service'
import { PrismaService } from '../../prisma/prisma.service'
import { TaxService } from '../../tax/tax.service'
import ThrowerErrorGuard from '../../utils/guards/errors.guard'
import { CityAccountSubservice } from '../../utils/subservices/cityaccount.subservice'
import { GpWebpaySubservice } from '../../utils/subservices/gpwebpay.subservice'
import { RetrySubservice } from '../../utils/subservices/retry.subservice'
import { TaxPaymentWithTaxYear } from '../../utils/types/types.prisma'
import { PaymentService } from '../payment.service'

describe('PaymentService - trackPaymentInBloomreach', () => {
  let service: PaymentService
  let bloomreachService: BloomreachService
  let throwerErrorGuard: ThrowerErrorGuard

  beforeEach(async () => {
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
        {
          provide: GpWebpaySubservice,
          useValue: createMock<GpWebpaySubservice>(),
        },
        {
          provide: CityAccountSubservice,
          useValue: createMock<CityAccountSubservice>(),
        },
        {
          provide: RetrySubservice,
          useValue: createMock<RetrySubservice>(),
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
  })

  describe('trackPaymentInBloomreach', () => {
    const mockTaxPayment: TaxPaymentWithTaxYear = {
      id: 1,
      amount: 150_000,
      source: TaxPaymentSource.CARD,
      bloomreachEventSent: false,
      tax: {
        year: 2024,
      },
    } as TaxPaymentWithTaxYear

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
        },
        externalId,
      )
    })

    it('should use BANK_ACCOUNT as default payment_source when source is null', async () => {
      const externalId = 'external-id-123'
      const taxPaymentWithoutSource = {
        ...mockTaxPayment,
        source: null,
      } as TaxPaymentWithTaxYear

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
})
