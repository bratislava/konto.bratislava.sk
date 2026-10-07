import {
  ErrorEnum,
  ErrorFactoryService,
  LineLoggerService,
} from '@bratislava/log-nest'
import { createMock } from '@golevelup/ts-vitest'
import { Test, TestingModule } from '@nestjs/testing'

import prismaMock from '../../../test/singleton'
import { createTestTaxPayment } from '../../__tests__/factories/taxPayment.factory'
import { createTestUserDataFromCityAccount } from '../../__tests__/factories/userDataFromCityAccount.factory'
import { BloomreachService } from '../../bloomreach/bloomreach.service'
import BaConfigService from '../../config/ba-config.service'
import {
  PaymentStatus,
  Prisma,
  TaxPaymentSource,
  TaxType,
} from '../../generated/prisma/client'
import { PrismaService } from '../../prisma/prisma.service'
import { TaxService } from '../../tax/tax.service'
import alertReporting from '../../utils/constants/error.alerts'
import { CityAccountSubservice } from '../../utils/subservices/cityaccount.subservice'
import { RetryService } from '../../utils-module/retry.service'
import {
  CustomErrorNorisTypesResponseEnum,
  CustomErrorPaymentResponseTypesEnum,
  CustomErrorPaymentTypesEnum,
} from '../dtos/error.dto'
import { PaymentResponseQueryDto } from '../dtos/gpwebpay.dto'
import { PaymentRedirectStateEnum } from '../dtos/redirect.payent.dto'
import { PaymentService } from '../payment.service'
import { GpWebpaySubservice } from '../subservices/gpwebpay.subservice'

const createMockBaConfigService = () => ({
  paygate: {
    currency: 'mock-value',
    paymentRedirectUrl: 'mock-value',
    redirectUrl: 'mock-value',
    afterPaymentRedirectFrontend: 'https://frontend.url',
    [TaxType.DZN]: {
      key: 'mock-value',
      signCert: 'mock-value',
      merchantNumber: '12345',
      // eslint-disable-next-line sonarjs/no-hardcoded-passwords -- mock config value for tests, not a real credential
      passphrase: 'mock-value',
    },
    [TaxType.KO]: {
      key: 'mock-value',
      signCert: 'mock-value',
      merchantNumber: '12345',
      // eslint-disable-next-line sonarjs/no-hardcoded-passwords -- mock config value for tests, not a real credential
      passphrase: 'mock-value',
    },
  },
})

describe('PaymentService', () => {
  let service: PaymentService
  let bloomreachService: BloomreachService
  const errorFactoryService = new ErrorFactoryService({ alertReporting })
  let logger: LineLoggerService
  let gpWebpaySubservice: GpWebpaySubservice
  let retryService: RetryService
  let baConfigService: ReturnType<typeof createMockBaConfigService>

  beforeEach(async () => {
    vi.resetModules()
    vi.spyOn(console, 'log').mockImplementation(vi.fn())

    baConfigService = createMockBaConfigService()

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: LineLoggerService,
          useValue: createMock<LineLoggerService>(),
        },
        PaymentService,
        { provide: PrismaService, useValue: prismaMock },
        {
          provide: BloomreachService,
          useValue: createMock<BloomreachService>(),
        },
        { provide: ErrorFactoryService, useValue: errorFactoryService },
        {
          provide: BaConfigService,
          useValue: baConfigService,
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
    logger = module.get(LineLoggerService)
    gpWebpaySubservice = module.get<GpWebpaySubservice>(GpWebpaySubservice)
    retryService = module.get<RetryService>(RetryService)
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('trackPaymentInBloomreach', () => {
    const mockTaxPayment = createTestTaxPayment({
      id: 1,
      amount: 150_000,
      source: TaxPaymentSource.CARD,
      bloomreachEventSent: false,
      tax: {
        year: 2024,
        type: TaxType.DZN,
        order: 1,
      },
    })

    it('should update bloomreachEventSent flag and track event when externalId is provided and tracking succeeds', async () => {
      const externalId = 'external-id-123'
      const mockUpdate = vi.fn()
      const mockTransaction = vi
        .fn()
        .mockImplementation(
          async (
            callback: (tx: Prisma.TransactionClient) => Promise<unknown>,
          ) => {
            const mockTx = createMock<Prisma.TransactionClient>({
              taxPayment: {
                update: mockUpdate,
                aggregate: vi
                  .fn()
                  .mockResolvedValue({ _sum: { amount: 150_000 } }),
              },
              tax: {
                findUnique: vi.fn().mockResolvedValue({ amount: 150_000 }),
              },
            })
            return await callback(mockTx)
          },
        )

      vi.mocked(prismaMock.$transaction).mockImplementation(mockTransaction)
      vi.mocked(bloomreachService.trackEventTaxPayment).mockResolvedValue(true)

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
          tax_type: mockTaxPayment.tax.type,
          order: mockTaxPayment.tax.order,
          is_fully_paid: true,
        },
        externalId,
      )
    })

    it('should use BANK_ACCOUNT as default payment_source when source is null', async () => {
      const externalId = 'external-id-123'
      const taxPaymentWithoutSource = createTestTaxPayment({
        id: 1,
        amount: 150_000,
        source: null,
        bloomreachEventSent: false,
        tax: { year: 2024, type: TaxType.DZN, order: 1 },
      })

      const mockTransaction = vi
        .fn()
        .mockImplementation(
          async (
            callback: (tx: Prisma.TransactionClient) => Promise<unknown>,
          ) => {
            const mockTx = createMock<Prisma.TransactionClient>({
              taxPayment: {
                update: vi.fn(),
                aggregate: vi
                  .fn()
                  .mockResolvedValue({ _sum: { amount: 150_000 } }),
              },
              tax: {
                findUnique: vi.fn().mockResolvedValue({ amount: 150_000 }),
              },
            })
            return await callback(mockTx)
          },
        )

      vi.mocked(prismaMock.$transaction).mockImplementation(mockTransaction)
      vi.mocked(bloomreachService.trackEventTaxPayment).mockResolvedValue(true)

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
          tax_type: mockTaxPayment.tax.type,
          order: mockTaxPayment.tax.order,
          is_fully_paid: true,
        },
        externalId,
      )
    })

    it('should only update bloomreachEventSent flag when externalId is not provided', async () => {
      const mockUpdate = vi.fn()
      const mockTransaction = vi
        .fn()
        .mockImplementation(
          async (
            callback: (tx: Prisma.TransactionClient) => Promise<unknown>,
          ) => {
            const mockTx = createMock<Prisma.TransactionClient>({
              taxPayment: {
                update: mockUpdate,
              },
            })
            return await callback(mockTx)
          },
        )

      vi.mocked(prismaMock.$transaction).mockImplementation(mockTransaction)

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
      const mockTransaction = vi
        .fn()
        .mockImplementation(
          async (
            callback: (tx: Prisma.TransactionClient) => Promise<unknown>,
          ) => {
            const mockTx = createMock<Prisma.TransactionClient>({
              taxPayment: {
                update: vi.fn(),
                aggregate: vi
                  .fn()
                  .mockResolvedValue({ _sum: { amount: 150_000 } }),
              },
              tax: {
                findUnique: vi.fn().mockResolvedValue({ amount: 150_000 }),
              },
            })
            return await callback(mockTx)
          },
        )

      vi.mocked(prismaMock.$transaction).mockImplementation(mockTransaction)
      vi.mocked(bloomreachService.trackEventTaxPayment).mockResolvedValue(false)

      await expect(
        service.trackPaymentInBloomreach(mockTaxPayment, externalId),
      ).rejects.toThrow(
        errorFactoryService.InternalServerErrorException({
          errorEnum: ErrorEnum.INTERNAL_SERVER_ERROR,
          message: 'Failed to track payment in Bloomreach.',
        }),
      )

      expect(bloomreachService.trackEventTaxPayment).toHaveBeenCalled()
    })

    it('should rollback transaction when tracking fails', async () => {
      const externalId = 'external-id-123'
      let transactionThrow = false
      const mockTransaction = vi
        .fn()
        .mockImplementation(
          async (
            callback: (tx: Prisma.TransactionClient) => Promise<unknown>,
          ) => {
            const mockTx = createMock<Prisma.TransactionClient>({
              taxPayment: {
                update: vi.fn(),
                aggregate: vi
                  .fn()
                  .mockResolvedValue({ _sum: { amount: 150_000 } }),
              },
              tax: {
                findUnique: vi.fn().mockResolvedValue({ amount: 150_000 }),
              },
            })
            try {
              const result = await callback(mockTx)
              return result
            } catch {
              transactionThrow = true
              throw new Error('Transaction error')
            }
          },
        )

      vi.mocked(prismaMock.$transaction).mockImplementation(mockTransaction)
      vi.mocked(bloomreachService.trackEventTaxPayment).mockResolvedValue(false)

      await expect(
        service.trackPaymentInBloomreach(mockTaxPayment, externalId),
      ).rejects.toThrow(new Error('Transaction error'))

      expect(mockTransaction).toHaveBeenCalled()
      expect(transactionThrow).toBe(true)
    })

    it('should throw NotFoundException when tax is not found', async () => {
      const externalId = 'external-id-123'
      vi.mocked(prismaMock.$transaction).mockImplementation(
        async (callback) => {
          const mockTx = createMock<Prisma.TransactionClient>({
            taxPayment: {
              update: vi.fn(),
              aggregate: vi.fn(),
            },
            tax: {
              findUnique: vi.fn().mockResolvedValue(null),
            },
          })
          return callback(mockTx)
        },
      )

      await expect(
        service.trackPaymentInBloomreach(mockTaxPayment, externalId),
      ).rejects.toThrow(
        errorFactoryService.NotFoundException({
          errorEnum: ErrorEnum.NOT_FOUND_ERROR,
          message: `Tax with id ${mockTaxPayment.taxId} not found.`,
        }),
      )

      expect(bloomreachService.trackEventTaxPayment).not.toHaveBeenCalled()
    })

    it.each([
      { totalPaid: 150_000, taxAmount: 150_000, expectedIsFullyPaid: true },
      { totalPaid: 150_001, taxAmount: 150_000, expectedIsFullyPaid: true },
      { totalPaid: 200_000, taxAmount: 150_000, expectedIsFullyPaid: true },
      { totalPaid: 149_999, taxAmount: 150_000, expectedIsFullyPaid: false },
      { totalPaid: 100_000, taxAmount: 150_000, expectedIsFullyPaid: false },
      { totalPaid: null, taxAmount: 150_000, expectedIsFullyPaid: false },
    ])(
      'should pass is_fully_paid: $expectedIsFullyPaid when totalPaid=$totalPaid and taxAmount=$taxAmount',
      async ({ totalPaid, taxAmount, expectedIsFullyPaid }) => {
        const externalId = 'external-id-123'
        vi.mocked(prismaMock.$transaction).mockImplementation(
          async (callback) => {
            const tx = createMock<Prisma.TransactionClient>({
              taxPayment: {
                update: vi.fn(),
                aggregate: vi
                  .fn()
                  .mockResolvedValue({ _sum: { amount: totalPaid } }),
              },
              tax: {
                findUnique: vi.fn().mockResolvedValue({ amount: taxAmount }),
              },
            })
            return callback(tx)
          },
        )
        vi.mocked(bloomreachService.trackEventTaxPayment).mockResolvedValue(
          true,
        )

        await service.trackPaymentInBloomreach(mockTaxPayment, externalId)

        expect(bloomreachService.trackEventTaxPayment).toHaveBeenCalledWith(
          expect.objectContaining({ is_fully_paid: expectedIsFullyPaid }),
          externalId,
        )
      },
    )
  })

  describe('processPaymentResponse', () => {
    const mockQuery = {
      OPERATION: 'CREATE_ORDER',
      ORDERNUMBER: '123456789',
      PRCODE: '0',
      SRCODE: '0',
      DIGEST: 'digest',
      DIGEST1: 'digest1',
      RESULTTEXT: 'OK',
    }

    const mockTaxPayment = createTestTaxPayment({
      orderId: '123456789',
      status: PaymentStatus.NEW,
      tax: {
        year: 2024,
        type: TaxType.DZN,
        order: 1,
        taxPayer: { birthNumber: '123456/7890' },
      },
    })

    it.each([
      {
        prCode: '14',
        expectedState: PaymentRedirectStateEnum.PAYMENT_ALREADY_PAID,
      },
      {
        prCode: '152',
        expectedState: PaymentRedirectStateEnum.PAYMENT_ALREADY_PAID,
      },
      {
        prCode: '31',
        expectedState: PaymentRedirectStateEnum.FAILED_TO_VERIFY,
      },
      {
        prCode: '1000',
        expectedState: PaymentRedirectStateEnum.PAYMENT_FAILED,
      },
    ])(
      'should not update TaxPayment for PRCODE $prCode (KEEP_CURRENT dbStatus)',
      async ({ prCode, expectedState }) => {
        vi.spyOn(gpWebpaySubservice, 'getDataToVerify').mockReturnValue('data')
        vi.spyOn(gpWebpaySubservice, 'verifyData').mockReturnValue(true)
        vi.mocked(prismaMock.taxPayment.findUnique).mockResolvedValue(
          mockTaxPayment,
        )
        vi.mocked(retryService.retryWithDelay).mockResolvedValue(
          createTestUserDataFromCityAccount({ externalId: 'ext-123' }),
        )
        const trackSpy = vi
          .spyOn(service, 'trackPaymentInBloomreach')
          .mockResolvedValue(undefined)

        const updateSpy = vi.mocked(prismaMock.taxPayment.update)

        const result = await service.processPaymentResponse(TaxType.DZN, {
          ...mockQuery,
          PRCODE: prCode,
        })

        expect(updateSpy).not.toHaveBeenCalled()
        expect(trackSpy).not.toHaveBeenCalled()
        expect(result).toContain(`status=${expectedState}`)
      },
    )

    it('should return FAILED_TO_VERIFY if ORDERNUMBER is missing', async () => {
      const trackSpy = vi
        .spyOn(service, 'trackPaymentInBloomreach')
        .mockResolvedValue(undefined)

      const result = await service.processPaymentResponse(TaxType.DZN, {
        ...mockQuery,
        ORDERNUMBER: undefined,
      } as unknown as PaymentResponseQueryDto)

      expect(trackSpy).not.toHaveBeenCalled()
      expect(result).toBe(
        `${baConfigService.paygate.afterPaymentRedirectFrontend}?status=${PaymentRedirectStateEnum.FAILED_TO_VERIFY}`,
      )
    })

    it('should return FAILED_TO_VERIFY if DIGEST verification fails', async () => {
      vi.mocked(prismaMock.taxPayment.findUnique).mockResolvedValue(
        mockTaxPayment,
      )
      vi.spyOn(gpWebpaySubservice, 'getDataToVerify').mockReturnValue('data')
      vi.spyOn(gpWebpaySubservice, 'verifyData').mockReturnValue(false)
      const trackSpy = vi
        .spyOn(service, 'trackPaymentInBloomreach')
        .mockResolvedValue(undefined)

      const result = await service.processPaymentResponse(
        TaxType.DZN,
        mockQuery,
      )

      expect(trackSpy).not.toHaveBeenCalled()
      expect(result).toBe(
        `${baConfigService.paygate.afterPaymentRedirectFrontend}?status=${PaymentRedirectStateEnum.FAILED_TO_VERIFY}`,
      )
    })

    it('should return PAYMENT_FAILED if payment is not found in database', async () => {
      vi.spyOn(gpWebpaySubservice, 'getDataToVerify').mockReturnValue('data')
      vi.spyOn(gpWebpaySubservice, 'verifyData').mockReturnValue(true)
      vi.mocked(prismaMock.taxPayment.findUnique).mockResolvedValue(null)
      const trackSpy = vi
        .spyOn(service, 'trackPaymentInBloomreach')
        .mockResolvedValue(undefined)

      const result = await service.processPaymentResponse(
        TaxType.DZN,
        mockQuery,
      )

      expect(trackSpy).not.toHaveBeenCalled()
      expect(vi.mocked(logger.error)).toHaveBeenCalledWith(
        errorFactoryService.InternalServerErrorException({
          errorEnum: CustomErrorPaymentTypesEnum.TAX_NOT_FOUND,
          message: CustomErrorNorisTypesResponseEnum.TAX_NOT_FOUND,
          console: `We received a valid payment response for payment we do not have in our database. ORDERNUMBER: ${mockQuery.ORDERNUMBER}`,
        }),
      )
      expect(result).toBe(
        `${baConfigService.paygate.afterPaymentRedirectFrontend}?status=${PaymentRedirectStateEnum.PAYMENT_FAILED}`,
      )
    })

    it('should process successful payment (PRCODE 0)', async () => {
      vi.spyOn(gpWebpaySubservice, 'getDataToVerify').mockReturnValue('data')
      vi.spyOn(gpWebpaySubservice, 'verifyData').mockReturnValue(true)
      vi.mocked(prismaMock.taxPayment.findUnique).mockResolvedValue(
        mockTaxPayment,
      )
      const afterSuccess = {
        id: mockTaxPayment.id,
        createdAt: mockTaxPayment.createdAt,
        updatedAt: mockTaxPayment.updatedAt,
        orderId: mockTaxPayment.orderId,
        taxId: mockTaxPayment.taxId,
        status: PaymentStatus.SUCCESS,
        amount: mockTaxPayment.amount,
        source: mockTaxPayment.source,
        bloomreachEventSent: mockTaxPayment.bloomreachEventSent,
        tax: {
          year: 2024,
          type: TaxType.DZN,
          order: 1,
        },
      }
      vi.mocked(prismaMock.taxPayment.update).mockResolvedValue(afterSuccess)
      vi.mocked(retryService.retryWithDelay).mockResolvedValue(
        createTestUserDataFromCityAccount({ externalId: 'ext-123' }),
      )
      const trackSpy = vi
        .spyOn(service, 'trackPaymentInBloomreach')
        .mockResolvedValue(undefined)

      const result = await service.processPaymentResponse(
        TaxType.DZN,
        mockQuery,
      )

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
      vi.spyOn(gpWebpaySubservice, 'getDataToVerify').mockReturnValue('data')
      vi.spyOn(gpWebpaySubservice, 'verifyData').mockReturnValue(true)
      vi.mocked(prismaMock.taxPayment.findUnique).mockResolvedValue(
        mockTaxPayment,
      )
      vi.mocked(retryService.retryWithDelay).mockResolvedValue(
        createTestUserDataFromCityAccount({ externalId: 'ext-123' }),
      )
      const updateSpy = vi.spyOn(prismaMock.taxPayment, 'update')
      const trackSpy = vi
        .spyOn(service, 'trackPaymentInBloomreach')
        .mockResolvedValue(undefined)

      const result = await service.processPaymentResponse(TaxType.DZN, {
        ...mockQuery,
        PRCODE: '14',
      })

      expect(updateSpy).not.toHaveBeenCalled()
      expect(trackSpy).not.toHaveBeenCalled()
      expect(result).toContain(
        `status=${PaymentRedirectStateEnum.PAYMENT_ALREADY_PAID}`,
      )
    })

    it('should handle Digest mismatch (PRCODE 31)', async () => {
      vi.spyOn(gpWebpaySubservice, 'getDataToVerify').mockReturnValue('data')
      vi.spyOn(gpWebpaySubservice, 'verifyData').mockReturnValue(true)
      const updateSpy = vi.mocked(prismaMock.taxPayment.update)
      vi.spyOn(prismaMock.taxPayment, 'findUnique').mockResolvedValue(
        mockTaxPayment,
      )
      vi.mocked(retryService.retryWithDelay).mockResolvedValue(
        createTestUserDataFromCityAccount({ externalId: 'ext-123' }),
      )
      const trackSpy = vi
        .spyOn(service, 'trackPaymentInBloomreach')
        .mockResolvedValue(undefined)

      const result = await service.processPaymentResponse(TaxType.DZN, {
        ...mockQuery,
        PRCODE: '31',
      })

      expect(updateSpy).not.toHaveBeenCalled()
      expect(trackSpy).not.toHaveBeenCalled()
      expect(result).toContain(
        `status=${PaymentRedirectStateEnum.FAILED_TO_VERIFY}`,
      )
    })

    it('should transition NEW to FAIL for technical errors (PRCODE 1)', async () => {
      vi.spyOn(gpWebpaySubservice, 'getDataToVerify').mockReturnValue('data')
      vi.spyOn(gpWebpaySubservice, 'verifyData').mockReturnValue(true)
      vi.mocked(prismaMock.taxPayment.findUnique).mockResolvedValue(
        mockTaxPayment,
      )
      const afterFail = {
        id: mockTaxPayment.id,
        createdAt: mockTaxPayment.createdAt,
        updatedAt: mockTaxPayment.updatedAt,
        orderId: mockTaxPayment.orderId,
        taxId: mockTaxPayment.taxId,
        status: PaymentStatus.FAIL,
        amount: mockTaxPayment.amount,
        source: mockTaxPayment.source,
        bloomreachEventSent: mockTaxPayment.bloomreachEventSent,
        tax: {
          year: 2024,
          type: TaxType.DZN,
          order: 1,
        },
      }
      vi.spyOn(prismaMock.taxPayment, 'update').mockResolvedValue(afterFail)
      vi.mocked(retryService.retryWithDelay).mockResolvedValue(
        createTestUserDataFromCityAccount({ externalId: 'ext-123' }),
      )
      const trackSpy = vi
        .spyOn(service, 'trackPaymentInBloomreach')
        .mockResolvedValue(undefined)

      const result = await service.processPaymentResponse(TaxType.DZN, {
        ...mockQuery,
        PRCODE: '1',
      })

      expect(prismaMock.taxPayment.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: PaymentStatus.FAIL,
          }) as Prisma.TaxPaymentUpdateInput,
        }),
      )
      expect(trackSpy).not.toHaveBeenCalled()
      expect(result).toContain(
        `status=${PaymentRedirectStateEnum.PAYMENT_FAILED}`,
      )
    })

    it('should not transition to FAIL for technical errors (PRCODE 1) when current status is not NEW', async () => {
      vi.spyOn(gpWebpaySubservice, 'getDataToVerify').mockReturnValue('data')
      vi.spyOn(gpWebpaySubservice, 'verifyData').mockReturnValue(true)
      vi.mocked(prismaMock.taxPayment.findUnique).mockResolvedValue(
        createTestTaxPayment({
          ...mockTaxPayment,
          status: PaymentStatus.SUCCESS,
        }),
      )
      vi.mocked(retryService.retryWithDelay).mockResolvedValue(
        createTestUserDataFromCityAccount({ externalId: 'ext-123' }),
      )
      const trackSpy = vi
        .spyOn(service, 'trackPaymentInBloomreach')
        .mockResolvedValue(undefined)

      const updateSpy = vi.spyOn(prismaMock.taxPayment, 'update')

      const result = await service.processPaymentResponse(TaxType.DZN, {
        ...mockQuery,
        PRCODE: '1',
      })

      expect(updateSpy).not.toHaveBeenCalled()
      expect(trackSpy).not.toHaveBeenCalled()
      expect(result).toContain(
        `status=${PaymentRedirectStateEnum.PAYMENT_FAILED}`,
      )
    })

    it('should throw UnprocessableEntityException on unexpected error', async () => {
      vi.mocked(prismaMock.taxPayment.findUnique).mockResolvedValue(
        mockTaxPayment,
      )
      vi.spyOn(gpWebpaySubservice, 'getDataToVerify').mockReturnValue('data')
      const unexpectedError = new Error('Unexpected')
      vi.spyOn(gpWebpaySubservice, 'verifyData').mockImplementation(() => {
        throw unexpectedError
      })
      const trackSpy = vi
        .spyOn(service, 'trackPaymentInBloomreach')
        .mockResolvedValue(undefined)

      await expect(
        service.processPaymentResponse(TaxType.DZN, mockQuery),
      ).rejects.toThrow(
        errorFactoryService.UnprocessableEntityException({
          errorEnum: CustomErrorPaymentResponseTypesEnum.PAYMENT_RESPONSE_ERROR,
          message: 'Error to redirect to response',
          error: unexpectedError,
        }),
      )

      expect(trackSpy).not.toHaveBeenCalled()
    })
  })

  describe('getRedirectUrl', () => {
    it('should append taxType to base URL without trailing slash', () => {
      baConfigService.paygate.redirectUrl =
        'http://payments.example.com:3000/payment/cardpay/response'

      const result = service['getRedirectUrl'](TaxType.DZN)

      expect(result).toBe(
        'http://payments.example.com:3000/payment/cardpay/response/DZN',
      )
    })

    it('should append taxType to base URL with trailing slash', () => {
      baConfigService.paygate.redirectUrl =
        'http://payments.example.com:3000/payment/cardpay/response/'

      const result = service['getRedirectUrl'](TaxType.KO)

      expect(result).toBe(
        'http://payments.example.com:3000/payment/cardpay/response/KO',
      )
    })

    it('should handle different TaxType values', () => {
      baConfigService.paygate.redirectUrl =
        'https://example.com/payment/response'

      const resultDZN = service['getRedirectUrl'](TaxType.DZN)
      const resultKO = service['getRedirectUrl'](TaxType.KO)

      expect(resultDZN).toBe('https://example.com/payment/response/DZN')
      expect(resultKO).toBe('https://example.com/payment/response/KO')
    })

    it.each([
      {
        scenario: 'with query parameters',
        redirectUrl: 'https://example.com/payment/response?param=value',
        taxType: TaxType.DZN,
        expected: 'https://example.com/payment/response/DZN',
      },
      {
        scenario: 'with hash',
        redirectUrl: 'https://example.com/payment/response#section',
        taxType: TaxType.DZN,
        expected: 'https://example.com/payment/response/DZN',
      },
      {
        scenario: 'with port number',
        redirectUrl: 'http://payments.example.com:8080/payment/response',
        taxType: TaxType.KO,
        expected: 'http://payments.example.com:8080/payment/response/KO',
      },
      {
        scenario: 'ending with multiple slashes',
        redirectUrl: 'https://example.com/payment/response//',
        taxType: TaxType.DZN,
        expected: 'https://example.com/payment/response//DZN',
      },
    ])(
      'should handle base URL $scenario',
      ({ redirectUrl, taxType, expected }) => {
        baConfigService.paygate.redirectUrl = redirectUrl

        const result = service['getRedirectUrl'](taxType)

        expect(result).toBe(expected)
      },
    )
  })
})
