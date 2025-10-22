import { createMock } from '@golevelup/ts-jest'
import { Test, TestingModule } from '@nestjs/testing'
import { PaymentStatus } from '@prisma/client'
import * as mssql from 'mssql'

import prismaMock from '../../../../test/singleton'
import { BloomreachService } from '../../../bloomreach/bloomreach.service'
import { PrismaService } from '../../../prisma/prisma.service'
import {
  ErrorsEnum,
  ErrorsResponseEnum,
} from '../../../utils/guards/dtos/error.dto'
import ThrowerErrorGuard from '../../../utils/guards/errors.guard'
import { CityAccountSubservice } from '../../../utils/subservices/cityaccount.subservice'
import { TaxWithTaxPayer } from '../../../utils/types/types.prisma'
import { NorisPaymentsDto } from '../../noris.dto'
import { NorisConnectionSubservice } from '../noris-connection.subservice'
import { NorisPaymentSubservice } from '../noris-payment.subservice'

const mockRequest = {
  query: jest.fn(),
  input: jest.fn(),
}

jest.mock('mssql', () => ({
  Request: jest.fn().mockImplementation(() => mockRequest),
}))

jest.mock('currency.js', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation((value) => ({
    intValue: parseInt(value.toString().replace(',', '.'), 10) * 100,
  })),
}))

jest.mock('../../utils/mapping.helper', () => ({
  convertCurrencyToInt: jest.fn().mockImplementation((value) => {
    return parseInt(value.toString().replace(',', '.'), 10) * 100
  }),
}))

describe('NorisPaymentSubservice', () => {
  let service: NorisPaymentSubservice
  let bloomreachService: BloomreachService
  let connectionService: NorisConnectionSubservice
  let throwerErrorGuard: ThrowerErrorGuard

  beforeEach(async () => {
    jest.clearAllMocks()
    jest
      .mocked(mssql.Request)
      .mockReturnValue(mockRequest as unknown as mssql.Request)

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NorisPaymentSubservice,
        { provide: PrismaService, useValue: prismaMock },
        {
          provide: BloomreachService,
          useValue: createMock<BloomreachService>(),
        },
        {
          provide: CityAccountSubservice,
          useValue: createMock<CityAccountSubservice>(),
        },
        {
          provide: NorisConnectionSubservice,
          useValue: createMock<NorisConnectionSubservice>(),
        },
        {
          provide: ThrowerErrorGuard,
          useValue: createMock<ThrowerErrorGuard>(),
        },
      ],
    }).compile()

    service = module.get<NorisPaymentSubservice>(NorisPaymentSubservice)
    bloomreachService = module.get<BloomreachService>(BloomreachService)
    connectionService = module.get<NorisConnectionSubservice>(
      NorisConnectionSubservice,
    )
    throwerErrorGuard = module.get<ThrowerErrorGuard>(ThrowerErrorGuard)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('getOverpaymentsDataFromNorisByDateRange', () => {
    const DEFAULT_TEST_NOW = new Date('2025-01-01T12:00:00.000Z')

    beforeAll(async () => {
      jest.useFakeTimers()
    })

    beforeEach(async () => {
      jest.clearAllMocks()
      jest.setSystemTime(DEFAULT_TEST_NOW)
    })

    afterAll(() => {
      jest.useRealTimers()
    })

    it('should successfully retrieve overpayments data from Noris', async () => {
      const mockData = {
        fromDate: new Date('2024-01-01'),
        toDate: new Date('2024-01-31'),
      }

      const mockRecordset = [
        {
          variabilny_symbol: '1234567890',
          uhrazeno_sum_saldo: 1000,
          uhrazeno_overpayment: 500,
          uhrazeno: '1500',
          specificky_symbol: '9876543210',
        },
        {
          variabilny_symbol: '0987654321',
          uhrazeno_sum_saldo: 2000,
          uhrazeno_overpayment: 300,
          uhrazeno: 2300,
          specificky_symbol: '1234567890',
        },
      ]

      const mockConnectionResult = {
        recordset: mockRecordset,
      }

      mockRequest.query.mockResolvedValue(mockConnectionResult)

      const withConnectionMock = jest
        .spyOn(connectionService, 'withConnection')
        .mockImplementation(async (fn) => {
          return fn({} as any)
        })

      const result =
        await service.getOverpaymentsDataFromNorisByDateRange(mockData)

      expect(withConnectionMock).toHaveBeenCalledWith(
        expect.any(Function),
        expect.any(Function),
      )
      expect(result).toEqual(mockRecordset)
    })

    it('should handle connection errors and throw appropriate exception', async () => {
      const mockData = {
        fromDate: new Date('2024-01-01'),
        toDate: new Date('2024-01-31'),
      }

      const connectionError = new Error('Database connection failed')
      jest
        .spyOn(connectionService, 'withConnection')
        .mockImplementation(async (fn, errorHandler) => {
          errorHandler(connectionError)
          throw connectionError
        })

      const throwerErrorGuardMock = jest
        .spyOn(throwerErrorGuard, 'InternalServerErrorException')
        .mockImplementation(() => {
          throw new Error('Internal Server Error')
        })

      await expect(
        service.getOverpaymentsDataFromNorisByDateRange(mockData),
      ).rejects.toThrow('Internal Server Error')

      expect(throwerErrorGuardMock).toHaveBeenCalledWith(
        ErrorsEnum.INTERNAL_SERVER_ERROR,
        'Failed to get overpayments data from Noris by date range.',
        undefined,
        undefined,
        connectionError,
      )
    })

    it('should handle empty result set', async () => {
      const mockData = {
        fromDate: new Date('2024-01-01'),
        toDate: new Date('2024-01-31'),
      }

      const mockConnectionResult = {
        recordset: [],
      }

      mockRequest.query.mockResolvedValue(mockConnectionResult)

      jest
        .spyOn(connectionService, 'withConnection')
        .mockImplementation(async (fn) => {
          return fn({} as any)
        })

      const result =
        await service.getOverpaymentsDataFromNorisByDateRange(mockData)

      expect(result).toEqual([])
    })

    it('should handle null toDate by using current date', async () => {
      const mockData = {
        fromDate: new Date('2024-01-01'),
        toDate: undefined,
      }

      const mockRecordset = [
        {
          variabilny_symbol: '1234567890',
          uhrazeno_sum_saldo: 1000,
          uhrazeno_overpayment: 500,
          uhrazeno: '1500',
          specificky_symbol: '9876543210',
        },
      ]

      const mockConnectionResult = {
        recordset: mockRecordset,
      }

      mockRequest.query.mockResolvedValue(mockConnectionResult)

      jest
        .spyOn(connectionService, 'withConnection')
        .mockImplementation(async (fn) => {
          return fn({} as any)
        })

      const result =
        await service.getOverpaymentsDataFromNorisByDateRange(mockData)

      expect(mockRequest.input).toHaveBeenCalledWith(
        'fromDate',
        mockData.fromDate,
      )
      expect(mockRequest.input).toHaveBeenCalledWith('toDate', DEFAULT_TEST_NOW)
      expect(result).toEqual(mockRecordset)
    })
  })

  describe('processIndividualPayment', () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })

    it('should return NOT_EXIST when tax data is not found', async () => {
      const mockNorisPayment: Partial<NorisPaymentsDto> = {
        variabilny_symbol: '1234567890',
        uhrazeno: '1000',
        specificky_symbol: '9876543210',
      }

      const taxesDataByVsMap = new Map<string, TaxWithTaxPayer>()
      const userDataFromCityAccount = {}

      const result = await service['processIndividualPayment'](
        mockNorisPayment,
        taxesDataByVsMap,
        userDataFromCityAccount,
      )

      expect(result).toBe('NOT_EXIST')
    })

    it('should return ALREADY_CREATED when payment amount is already paid', async () => {
      const mockNorisPayment: Partial<NorisPaymentsDto> = {
        variabilny_symbol: '1234567890',
        uhrazeno: '1000',
        specificky_symbol: '9876543210',
      }

      const mockTaxData: TaxWithTaxPayer = {
        id: 1,
        year: 2024,
        amount: 1000,
        taxPayer: {
          id: 1,
          birthNumber: '123456/7890',
        },
      } as TaxWithTaxPayer

      const taxesDataByVsMap = new Map<string, TaxWithTaxPayer>()
      taxesDataByVsMap.set('1234567890', mockTaxData)

      const userDataFromCityAccount = {}

      const mockTransaction = jest.fn().mockImplementation(async (callback) => {
        return callback({
          $queryRaw: jest.fn().mockImplementation(() => {
            return Promise.resolve([])
          }),
          taxPayment: {
            aggregate: jest.fn().mockResolvedValue({
              _sum: { amount: 100_000 },
            }),
          },
        })
      })

      jest.spyOn(prismaMock, '$transaction').mockImplementation(mockTransaction)

      const result = await service['processIndividualPayment'](
        mockNorisPayment,
        taxesDataByVsMap,
        userDataFromCityAccount,
      )

      expect(result).toBe('ALREADY_CREATED')
    })

    it('should create new payment when there is a difference', async () => {
      const mockNorisPayment: Partial<NorisPaymentsDto> = {
        variabilny_symbol: '1234567890',
        uhrazeno: '1500',
        specificky_symbol: '9876543210',
      }

      const mockTaxData: TaxWithTaxPayer = {
        id: 1,
        year: 2024,
        amount: 1500,
        taxPayer: {
          id: 1,
          birthNumber: '123456/7890',
        },
      } as TaxWithTaxPayer

      const taxesDataByVsMap = new Map<string, TaxWithTaxPayer>()
      taxesDataByVsMap.set('1234567890', mockTaxData)

      const userDataFromCityAccount = {
        '123456/7890': {
          externalId: 'external-123',
          birthNumber: '123456/7890',
          email: 'test@example.com',
          userAttribute: {},
        },
      }

      const mockCreatedPayment = {
        id: 1,
        amount: 50_000,
        source: 'BANK_ACCOUNT',
        specificSymbol: '9876543210',
        taxId: 1,
        status: PaymentStatus.SUCCESS,
      }

      const createSpyMock = jest.fn().mockResolvedValue(mockCreatedPayment)
      const mockTransaction = jest.fn().mockImplementation(async (callback) => {
        return callback({
          $queryRaw: jest.fn().mockResolvedValue([]),
          taxPayment: {
            aggregate: jest.fn().mockResolvedValue({
              _sum: { amount: 100_000 },
            }),
            create: createSpyMock,
          },
        })
      })

      jest.spyOn(prismaMock, '$transaction').mockImplementation(mockTransaction)

      const trackEventTaxPaymentMock = jest
        .spyOn(bloomreachService, 'trackEventTaxPayment')
        .mockResolvedValue(true)

      const result = await service['processIndividualPayment'](
        mockNorisPayment,
        taxesDataByVsMap,
        userDataFromCityAccount,
      )

      expect(result).toBe('CREATED')
      expect(createSpyMock).toHaveBeenCalledWith({
        data: {
          amount: 50_000,
          source: 'BANK_ACCOUNT',
          specificSymbol: '9876543210',
          taxId: 1,
          status: PaymentStatus.SUCCESS,
        },
      })
      expect(trackEventTaxPaymentMock).toHaveBeenCalledWith(
        {
          amount: 50_000,
          payment_source: 'BANK_ACCOUNT',
          year: 2024,
        },
        'external-123',
      )
    })

    it('should handle case when no existing payments exist', async () => {
      const mockNorisPayment: Partial<NorisPaymentsDto> = {
        variabilny_symbol: '1234567890',
        uhrazeno: '1000',
        specificky_symbol: '9876543210',
      }

      const mockTaxData: TaxWithTaxPayer = {
        id: 1,
        year: 2024,
        amount: 1000,
        taxPayer: {
          id: 1,
          birthNumber: '123456/7890',
        },
      } as TaxWithTaxPayer

      const taxesDataByVsMap = new Map<string, TaxWithTaxPayer>()
      taxesDataByVsMap.set('1234567890', mockTaxData)

      const userDataFromCityAccount = {}

      const mockCreatedPayment = {
        id: 1,
        amount: 1000,
        source: 'BANK_ACCOUNT',
        specificSymbol: '9876543210',
        taxId: 1,
        status: PaymentStatus.SUCCESS,
      }

      const mockTransaction = jest.fn().mockImplementation(async (callback) => {
        return callback({
          $queryRaw: jest.fn().mockResolvedValue([]),
          taxPayment: {
            aggregate: jest.fn().mockResolvedValue({
              _sum: { amount: null },
            }),
            create: jest.fn().mockResolvedValue(mockCreatedPayment),
          },
        })
      })

      jest.spyOn(prismaMock, '$transaction').mockImplementation(mockTransaction)

      const result = await service['processIndividualPayment'](
        mockNorisPayment,
        taxesDataByVsMap,
        userDataFromCityAccount,
      )

      expect(result).toBe('CREATED')
    })

    it('should handle case when user has no external ID for tracking', async () => {
      const mockNorisPayment: Partial<NorisPaymentsDto> = {
        variabilny_symbol: '1234567890',
        uhrazeno: '1000',
        specificky_symbol: '9876543210',
      }

      const mockTaxData: TaxWithTaxPayer = {
        id: 1,
        year: 2024,
        amount: 1000,
        taxPayer: {
          id: 1,
          birthNumber: '123456/7890',
        },
      } as TaxWithTaxPayer

      const taxesDataByVsMap = new Map<string, TaxWithTaxPayer>()
      taxesDataByVsMap.set('1234567890', mockTaxData)

      const userDataFromCityAccount = {
        '123456/7890': {
          externalId: null,
          birthNumber: '123456/7890',
          email: 'test@example.com',
          userAttribute: {},
        },
      }

      const mockCreatedPayment = {
        id: 1,
        amount: 1000,
        source: 'BANK_ACCOUNT',
        specificSymbol: '9876543210',
        taxId: 1,
        status: PaymentStatus.SUCCESS,
      }

      const mockTransaction = jest.fn().mockImplementation(async (callback) => {
        return callback({
          $queryRaw: jest.fn().mockResolvedValue([]),
          taxPayment: {
            aggregate: jest.fn().mockResolvedValue({
              _sum: { amount: null },
            }),
            create: jest.fn().mockResolvedValue(mockCreatedPayment),
          },
        })
      })

      jest.spyOn(prismaMock, '$transaction').mockImplementation(mockTransaction)

      const trackEventTaxPaymentMock = jest
        .spyOn(bloomreachService, 'trackEventTaxPayment')
        .mockResolvedValue(true)

      const result = await service['processIndividualPayment'](
        mockNorisPayment,
        taxesDataByVsMap,
        userDataFromCityAccount,
      )

      expect(result).toBe('CREATED')
      expect(trackEventTaxPaymentMock).not.toHaveBeenCalled()
    })

    it('should handle case when user is not found in city account data', async () => {
      const mockNorisPayment: Partial<NorisPaymentsDto> = {
        variabilny_symbol: '1234567890',
        uhrazeno: '1000',
        specificky_symbol: '9876543210',
      }

      const mockTaxData: TaxWithTaxPayer = {
        id: 1,
        year: 2024,
        amount: 1000,
        taxPayer: {
          id: 1,
          birthNumber: '123456/7890',
        },
      } as TaxWithTaxPayer

      const taxesDataByVsMap = new Map<string, TaxWithTaxPayer>()
      taxesDataByVsMap.set('1234567890', mockTaxData)

      const userDataFromCityAccount = {}

      const mockCreatedPayment = {
        id: 1,
        amount: 1000,
        source: 'BANK_ACCOUNT',
        specificSymbol: '9876543210',
        taxId: 1,
        status: PaymentStatus.SUCCESS,
      }

      const mockTransaction = jest.fn().mockImplementation(async (callback) => {
        return callback({
          $queryRaw: jest.fn().mockResolvedValue([]),
          taxPayment: {
            aggregate: jest.fn().mockResolvedValue({
              _sum: { amount: null },
            }),
            create: jest.fn().mockResolvedValue(mockCreatedPayment),
          },
        })
      })

      jest.spyOn(prismaMock, '$transaction').mockImplementation(mockTransaction)

      const trackEventTaxPaymentMock = jest
        .spyOn(bloomreachService, 'trackEventTaxPayment')
        .mockResolvedValue(true)

      const result = await service['processIndividualPayment'](
        mockNorisPayment,
        taxesDataByVsMap,
        userDataFromCityAccount,
      )

      expect(result).toBe('CREATED')
      expect(trackEventTaxPaymentMock).not.toHaveBeenCalled()
    })

    it('should handle database transaction errors', async () => {
      const mockNorisPayment: Partial<NorisPaymentsDto> = {
        variabilny_symbol: '1234567890',
        uhrazeno: '1000',
        specificky_symbol: '9876543210',
      }

      const mockTaxData: TaxWithTaxPayer = {
        id: 1,
        year: 2024,
        amount: 1000,
        taxPayer: {
          id: 1,
          birthNumber: '123456/7890',
        },
      } as TaxWithTaxPayer

      const taxesDataByVsMap = new Map<string, TaxWithTaxPayer>()
      taxesDataByVsMap.set('1234567890', mockTaxData)

      const userDataFromCityAccount = {}

      const transactionError = new Error('Database transaction failed')
      const mockTransaction = jest.fn().mockRejectedValue(transactionError)

      jest.spyOn(prismaMock, '$transaction').mockImplementation(mockTransaction)

      const throwerErrorGuardMock = jest
        .spyOn(throwerErrorGuard, 'InternalServerErrorException')
        .mockImplementation(() => {
          throw new Error('Internal Server Error')
        })

      await expect(
        service['processIndividualPayment'](
          mockNorisPayment,
          taxesDataByVsMap,
          userDataFromCityAccount,
        ),
      ).rejects.toThrow('Internal Server Error')

      expect(throwerErrorGuardMock).toHaveBeenCalledWith(
        ErrorsEnum.INTERNAL_SERVER_ERROR,
        ErrorsResponseEnum.INTERNAL_SERVER_ERROR,
        undefined,
        undefined,
        transactionError,
      )
    })

    it('should handle string amount values correctly', async () => {
      const mockNorisPayment: Partial<NorisPaymentsDto> = {
        variabilny_symbol: '1234567890',
        uhrazeno: '1500.50',
        specificky_symbol: '9876543210',
      }

      const mockTaxData: TaxWithTaxPayer = {
        id: 1,
        year: 2024,
        amount: 1500,
        taxPayer: {
          id: 1,
          birthNumber: '123456/7890',
        },
      } as TaxWithTaxPayer

      const taxesDataByVsMap = new Map<string, TaxWithTaxPayer>()
      taxesDataByVsMap.set('1234567890', mockTaxData)

      const userDataFromCityAccount = {}

      const mockCreatedPayment = {
        id: 1,
        amount: 150_050, // Converted to cents
        source: 'BANK_ACCOUNT',
        specificSymbol: '9876543210',
        taxId: 1,
        status: PaymentStatus.SUCCESS,
      }

      const mockTransaction = jest.fn().mockImplementation(async (callback) => {
        return callback({
          $queryRaw: jest.fn().mockResolvedValue([]),
          taxPayment: {
            aggregate: jest.fn().mockResolvedValue({
              _sum: { amount: null },
            }),
            create: jest.fn().mockResolvedValue(mockCreatedPayment),
          },
        })
      })

      jest.spyOn(prismaMock, '$transaction').mockImplementation(mockTransaction)

      const result = await service['processIndividualPayment'](
        mockNorisPayment,
        taxesDataByVsMap,
        userDataFromCityAccount,
      )

      expect(result).toBe('CREATED')
    })

    it('should handle zero difference correctly', async () => {
      const mockNorisPayment: Partial<NorisPaymentsDto> = {
        variabilny_symbol: '1234567890',
        uhrazeno: '1000',
        specificky_symbol: '9876543210',
      }

      const mockTaxData: TaxWithTaxPayer = {
        id: 1,
        year: 2024,
        amount: 1000,
        taxPayer: {
          id: 1,
          birthNumber: '123456/7890',
        },
      } as TaxWithTaxPayer

      const taxesDataByVsMap = new Map<string, TaxWithTaxPayer>()
      taxesDataByVsMap.set('1234567890', mockTaxData)

      const userDataFromCityAccount = {}

      const mockTransaction = jest.fn().mockImplementation(async (callback) => {
        return callback({
          $queryRaw: jest.fn().mockImplementation((strings) => {
            // Handle template literal calls
            if (typeof strings === 'string') {
              return Promise.resolve([])
            }
            // Handle tagged template literal calls
            return Promise.resolve([])
          }),
          taxPayment: {
            aggregate: jest.fn().mockResolvedValue({
              _sum: { amount: 100_000 },
            }),
          },
        })
      })

      jest.spyOn(prismaMock, '$transaction').mockImplementation(mockTransaction)

      const result = await service['processIndividualPayment'](
        mockNorisPayment,
        taxesDataByVsMap,
        userDataFromCityAccount,
      )

      expect(result).toBe('ALREADY_CREATED')
    })
  })
})
