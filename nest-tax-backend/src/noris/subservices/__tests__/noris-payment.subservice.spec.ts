import { createMock } from '@golevelup/ts-jest'
import { Test, TestingModule } from '@nestjs/testing'
import { PaymentStatus, Tax } from '@prisma/client'
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
import { NorisPaymentWithVariableSymbol } from '../../types/noris.types'
import { NorisConnectionSubservice } from '../noris-connection.subservice'
import { NorisPaymentSubservice } from '../noris-payment.subservice'
import { NorisValidatorSubservice } from '../noris-validator.subservice'

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
  let cityAccountSubservice: CityAccountSubservice

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
        {
          provide: NorisValidatorSubservice,
          useValue: createMock<NorisValidatorSubservice>(),
        },
      ],
    }).compile()

    service = module.get<NorisPaymentSubservice>(NorisPaymentSubservice)
    bloomreachService = module.get<BloomreachService>(BloomreachService)
    connectionService = module.get<NorisConnectionSubservice>(
      NorisConnectionSubservice,
    )
    throwerErrorGuard = module.get<ThrowerErrorGuard>(ThrowerErrorGuard)
    cityAccountSubservice = module.get<CityAccountSubservice>(
      CityAccountSubservice,
    )

    const norisValidatorSubservice = module.get<NorisValidatorSubservice>(
      NorisValidatorSubservice,
    )
    jest
      .spyOn(norisValidatorSubservice, 'validateNorisData')
      .mockImplementation((schema, data) => {
        if (Array.isArray(data)) {
          return data.map((item) => schema.parse(item))
        }
        return schema.parse(data)
      })
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('updateOverpaymentsDataFromNorisByDateRange', () => {
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

    it('should successfully retrieve overpayments data from Noris and create payments', async () => {
      const mockData = {
        fromDate: new Date('2024-01-01'),
        toDate: new Date('2024-01-31'),
      }

      const mockRecordset = [
        {
          variabilny_symbol: '1234567890',
          uhrazeno_sum_saldo: 1000,
          uhrazeno_overpayment: 500,
          uhrazeno: 1500,
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

      const mockTaxData = [
        {
          id: 1,
          variableSymbol: '1234567890',
          taxPayer: {
            id: 1,
            birthNumber: '123456/7890',
          },
        },
        {
          id: 2,
          variableSymbol: '0987654321',
          taxPayer: {
            id: 2,
            birthNumber: '098765/4321',
          },
        },
      ] as unknown as Tax[]
      jest.spyOn(prismaMock.tax, 'findMany').mockResolvedValue(mockTaxData)

      jest
        .spyOn(cityAccountSubservice, 'getUserDataAdminBatch')
        .mockResolvedValue({
          '123456/7890': {
            externalId: 'external-123',
            birthNumber: '123456/7890',
            email: 'test1@example.com',
            userAttribute: {},
          },
          '098765/4321': {
            externalId: 'external-456',
            birthNumber: '098765/4321',
            email: 'test2@example.com',
            userAttribute: {},
          },
        })

      const mockTransaction = jest.fn().mockImplementation(async (callback) => {
        return callback({
          $queryRaw: jest.fn().mockResolvedValue([]),
          taxPayment: {
            aggregate: jest.fn().mockResolvedValue({
              _sum: { amount: 0 },
            }),
            create: jest.fn().mockResolvedValue({
              id: 1,
              amount: 150_000,
              source: 'BANK_ACCOUNT',
              specificSymbol: '9876543210',
              taxId: 1,
              status: PaymentStatus.SUCCESS,
            }),
          },
        })
      })
      jest.spyOn(prismaMock, '$transaction').mockImplementation(mockTransaction)

      jest
        .spyOn(bloomreachService, 'trackEventTaxPayment')
        .mockResolvedValue(true)

      const result =
        await service.updateOverpaymentsDataFromNorisByDateRange(mockData)

      expect(withConnectionMock).toHaveBeenCalledWith(
        expect.any(Function),
        expect.any(Function),
      )
      expect(result).toEqual({
        created: 2,
        alreadyCreated: 0,
      })
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
        service.updateOverpaymentsDataFromNorisByDateRange(mockData),
      ).rejects.toThrow('Internal Server Error')

      expect(throwerErrorGuardMock).toHaveBeenCalledWith(
        ErrorsEnum.INTERNAL_SERVER_ERROR,
        'Failed to get overpayments data from Noris by date range.',
        undefined,
        undefined,
        connectionError,
      )
    })

    it('should handle mixed scenarios with some payments already created', async () => {
      const mockData = {
        fromDate: new Date('2024-01-01'),
        toDate: new Date('2024-01-31'),
      }

      const mockRecordset = [
        {
          variabilny_symbol: '1111111111',
          uhrazeno_sum_saldo: 1000,
          uhrazeno_overpayment: 0,
          uhrazeno: 1000,
          specificky_symbol: '1111111111',
        },
        {
          variabilny_symbol: '2222222222',
          uhrazeno_sum_saldo: 2000,
          uhrazeno_overpayment: 500,
          uhrazeno: 2500,
          specificky_symbol: '2222222222',
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

      const mockTaxData = [
        {
          id: 1,
          variableSymbol: '1111111111',
          taxPayer: {
            id: 1,
            birthNumber: '111111/1111',
          },
        },
        {
          id: 2,
          variableSymbol: '2222222222',
          taxPayer: {
            id: 2,
            birthNumber: '222222/2222',
          },
        },
      ] as unknown as Tax[]
      jest.spyOn(prismaMock.tax, 'findMany').mockResolvedValue(mockTaxData)

      jest
        .spyOn(cityAccountSubservice, 'getUserDataAdminBatch')
        .mockResolvedValue({
          '111111/1111': {
            externalId: 'external-111',
            birthNumber: '111111/1111',
            email: 'test1@example.com',
            userAttribute: {},
          },
          '222222/2222': {
            externalId: 'external-222',
            birthNumber: '222222/2222',
            email: 'test2@example.com',
            userAttribute: {},
          },
        })

      const mockTransaction = jest.fn().mockImplementation(async (callback) => {
        return callback({
          $queryRaw: jest.fn().mockResolvedValue([]),
          taxPayment: {
            aggregate: jest.fn().mockImplementation(({ where }) => {
              // First tax (1111111111) already has full payment
              if (where.taxId === 1) {
                return Promise.resolve({
                  _sum: { amount: 100_000 }, // Already paid 1000
                })
              }
              // Second tax (2222222222) has partial payment
              return Promise.resolve({
                _sum: { amount: 150_000 }, // Already paid 1500, needs 1000 more
              })
            }),
            create: jest.fn().mockResolvedValue({
              id: 2,
              amount: 100_000,
              source: 'BANK_ACCOUNT',
              specificSymbol: '2222222222',
              taxId: 2,
              status: PaymentStatus.SUCCESS,
            }),
          },
        })
      })
      jest.spyOn(prismaMock, '$transaction').mockImplementation(mockTransaction)

      jest
        .spyOn(bloomreachService, 'trackEventTaxPayment')
        .mockResolvedValue(true)

      const result =
        await service.updateOverpaymentsDataFromNorisByDateRange(mockData)

      expect(result).toEqual({
        created: 1,
        alreadyCreated: 1,
      })
    })

    it('should handle null toDate by using current date and process payments', async () => {
      const mockData = {
        fromDate: new Date('2024-01-01'),
        toDate: undefined,
      }

      const mockRecordset = [
        {
          variabilny_symbol: '3333333333',
          uhrazeno_sum_saldo: 500,
          uhrazeno_overpayment: 200,
          uhrazeno: 700,
          specificky_symbol: '3333333333',
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

      const mockTaxData = [
        {
          id: 3,
          variableSymbol: '3333333333',
          taxPayer: {
            id: 3,
            birthNumber: '333333/3333',
          },
        },
      ] as unknown as Tax[]
      jest.spyOn(prismaMock.tax, 'findMany').mockResolvedValue(mockTaxData)

      jest
        .spyOn(cityAccountSubservice, 'getUserDataAdminBatch')
        .mockResolvedValue({
          '333333/3333': {
            externalId: 'external-333',
            birthNumber: '333333/3333',
            email: 'test3@example.com',
            userAttribute: {},
          },
        })

      const mockTransaction = jest.fn().mockImplementation(async (callback) => {
        return callback({
          $queryRaw: jest.fn().mockResolvedValue([]),
          taxPayment: {
            aggregate: jest.fn().mockResolvedValue({
              _sum: { amount: 0 },
            }),
            create: jest.fn().mockResolvedValue({
              id: 3,
              amount: 70_000,
              source: 'BANK_ACCOUNT',
              specificSymbol: '3333333333',
              taxId: 3,
              status: PaymentStatus.SUCCESS,
            }),
          },
        })
      })
      jest.spyOn(prismaMock, '$transaction').mockImplementation(mockTransaction)

      jest
        .spyOn(bloomreachService, 'trackEventTaxPayment')
        .mockResolvedValue(true)

      const result =
        await service.updateOverpaymentsDataFromNorisByDateRange(mockData)

      expect(mockRequest.input).toHaveBeenCalledWith(
        'fromDate',
        mssql.SmallDateTime,
        mockData.fromDate,
      )
      expect(mockRequest.input).toHaveBeenCalledWith(
        'toDate',
        mssql.SmallDateTime,
        DEFAULT_TEST_NOW,
      )
      expect(result).toEqual({
        created: 1,
        alreadyCreated: 0,
      })
    })

    it('should handle case where no matching taxes exist (both created and alreadyCreated are 0)', async () => {
      const mockData = {
        fromDate: new Date('2024-01-01'),
        toDate: new Date('2024-01-31'),
      }

      const mockRecordset = [
        {
          variabilny_symbol: '9999999999',
          uhrazeno_sum_saldo: 1000,
          uhrazeno_overpayment: 0,
          uhrazeno: 1000,
          specificky_symbol: '9999999999',
        },
        {
          variabilny_symbol: '8888888888',
          uhrazeno_sum_saldo: 2000,
          uhrazeno_overpayment: 500,
          uhrazeno: 2500,
          specificky_symbol: '8888888888',
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

      jest.spyOn(prismaMock.tax, 'findMany').mockResolvedValue([])

      jest
        .spyOn(cityAccountSubservice, 'getUserDataAdminBatch')
        .mockResolvedValue({})

      const result =
        await service.updateOverpaymentsDataFromNorisByDateRange(mockData)

      expect(result).toEqual({
        created: 0,
        alreadyCreated: 0,
      })
    })

    it('should handle empty recordset from Noris database', async () => {
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

      jest.spyOn(prismaMock.tax, 'findMany').mockResolvedValue([])
      jest
        .spyOn(cityAccountSubservice, 'getUserDataAdminBatch')
        .mockResolvedValue({})

      const result =
        await service.updateOverpaymentsDataFromNorisByDateRange(mockData)

      expect(result).toEqual({
        created: 0,
        alreadyCreated: 0,
      })

      expect(prismaMock.tax.findMany).toHaveBeenCalledWith({
        where: {
          variableSymbol: {
            in: [],
          },
        },
        include: {
          taxPayer: true,
        },
      })

      expect(cityAccountSubservice.getUserDataAdminBatch).toHaveBeenCalledWith(
        [],
      )
    })
  })

  describe('processIndividualPayment', () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })

    it('should return NOT_EXIST when tax data is not found', async () => {
      const mockNorisPayment: NorisPaymentWithVariableSymbol = {
        variabilny_symbol: '1234567890',
        uhrazeno: 1000,
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
      const mockNorisPayment: NorisPaymentWithVariableSymbol = {
        variabilny_symbol: '1234567890',
        uhrazeno: 1000,
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
      const mockNorisPayment: NorisPaymentWithVariableSymbol = {
        variabilny_symbol: '1234567890',
        uhrazeno: 1500,
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
          suppress_email: false,
        },
        'external-123',
      )
    })

    it('should handle case when no existing payments exist', async () => {
      const mockNorisPayment: NorisPaymentWithVariableSymbol = {
        variabilny_symbol: '1234567890',
        uhrazeno: 1000,
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
      const mockNorisPayment: NorisPaymentWithVariableSymbol = {
        variabilny_symbol: '1234567890',
        uhrazeno: 1000,
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
      const mockNorisPayment: NorisPaymentWithVariableSymbol = {
        variabilny_symbol: '1234567890',
        uhrazeno: 1000,
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
      const mockNorisPayment: NorisPaymentWithVariableSymbol = {
        variabilny_symbol: '1234567890',
        uhrazeno: 1000,
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
      const mockNorisPayment: NorisPaymentWithVariableSymbol = {
        variabilny_symbol: '1234567890',
        uhrazeno: 1500.5,
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
        amount: 150_050,
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
      const mockNorisPayment: NorisPaymentWithVariableSymbol = {
        variabilny_symbol: '1234567890',
        uhrazeno: 1000,
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
  })
})
