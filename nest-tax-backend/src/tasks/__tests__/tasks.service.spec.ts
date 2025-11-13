import { createMock } from '@golevelup/ts-jest'
import { HttpException, HttpStatus } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import dayjs from 'dayjs'

import prismaMock from '../../../test/singleton'
import { BloomreachService } from '../../bloomreach/bloomreach.service'
import { CardPaymentReportingService } from '../../card-payment-reporting/card-payment-reporting.service'
import { CustomErrorNorisTypesEnum } from '../../noris/noris.errors'
import { NorisService } from '../../noris/noris.service'
import { PrismaService } from '../../prisma/prisma.service'
import { OVERPAYMENTS_LOOKBACK_DAYS } from '../../utils/constants'
import ThrowerErrorGuard from '../../utils/guards/errors.guard'
import { CityAccountSubservice } from '../../utils/subservices/cityaccount.subservice'
import DatabaseSubservice from '../../utils/subservices/database.subservice'
import { LineLoggerSubservice } from '../../utils/subservices/line-logger.subservice'
import TasksConfigSubservice from '../subservices/config.subservice'
import TaxImportHelperSubservice from '../subservices/tax-import-helper.subservice'
import { TasksService } from '../tasks.service'

describe('TasksService', () => {
  let service: TasksService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        { provide: ConfigService, useValue: createMock<ConfigService>() },
        ThrowerErrorGuard,
        { provide: NorisService, useValue: createMock<NorisService>() },
        { provide: PrismaService, useValue: prismaMock },
        {
          provide: DatabaseSubservice,
          useValue: createMock<DatabaseSubservice>(),
        },
        {
          provide: CardPaymentReportingService,
          useValue: createMock<CardPaymentReportingService>(),
        },
        {
          provide: CityAccountSubservice,
          useValue: createMock<CityAccountSubservice>(),
        },
        {
          provide: TasksConfigSubservice,
          useValue: createMock<TasksConfigSubservice>(),
        },
        {
          provide: BloomreachService,
          useValue: createMock<BloomreachService>(),
        },
        {
          provide: TaxImportHelperSubservice,
          useValue: createMock<TaxImportHelperSubservice>(),
        },
      ],
    }).compile()

    service = module.get<TasksService>(TasksService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('sendUnpaidTaxReminders', () => {
    it('should not do anything when there are no taxes', async () => {
      const findManyMock = jest
        .spyOn(service['prismaService'].tax, 'findMany')
        .mockResolvedValue([])
      const trackEventUnpaidTaxReminderMock = jest.spyOn(
        service['bloomreachService'],
        'trackEventUnpaidTaxReminder',
      )

      await service.sendUnpaidTaxReminders()

      expect(findManyMock).toHaveBeenCalled()
      expect(trackEventUnpaidTaxReminderMock).not.toHaveBeenCalled()
    })

    it('should send payment reminder events when there are taxes', async () => {
      const findManyMock = jest
        .spyOn(service['prismaService'].tax, 'findMany')
        .mockResolvedValue([
          {
            id: 1,
            year: 2024,
            taxPayer: {
              birthNumber: '123456/7890',
            },
          },
        ] as any)
      const trackEventUnpaidTaxReminderMock = jest.spyOn(
        service['bloomreachService'],
        'trackEventUnpaidTaxReminder',
      )
      jest
        .spyOn(service['cityAccountSubservice'], 'getUserDataAdminBatch')
        .mockResolvedValue({
          '123456/7890': {
            externalId: 'external-id-123',
          },
        } as any)
      jest.spyOn(service['logger'], 'log').mockImplementation(() => {})

      await service.sendUnpaidTaxReminders()

      expect(findManyMock).toHaveBeenCalled()
      expect(trackEventUnpaidTaxReminderMock).toHaveBeenCalledWith(
        {
          year: 2024,
        },
        'external-id-123',
      )
    })

    it('should send payment reminder event for each tax where there is user from city account', async () => {
      const findManyMock = jest
        .spyOn(service['prismaService'].tax, 'findMany')
        .mockResolvedValue([
          {
            id: 1,
            year: 2024,
            taxPayer: {
              birthNumber: '123456/7890',
            },
          },
          {
            id: 2,
            year: 2024,
            taxPayer: {
              birthNumber: '123456/7891',
            },
          },
          {
            id: 3,
            year: 2024,
            taxPayer: {
              birthNumber: '123456/7892',
            },
          },
        ] as any)
      const trackEventUnpaidTaxReminderMock = jest.spyOn(
        service['bloomreachService'],
        'trackEventUnpaidTaxReminder',
      )
      jest
        .spyOn(service['cityAccountSubservice'], 'getUserDataAdminBatch')
        .mockResolvedValue({
          '123456/7890': {
            externalId: 'external-id-1',
          },
          '123456/7891': {
            externalId: 'external-id-2',
          },
        } as any)
      jest.spyOn(service['logger'], 'log').mockImplementation(() => {})

      await service.sendUnpaidTaxReminders()

      expect(findManyMock).toHaveBeenCalled()
      expect(trackEventUnpaidTaxReminderMock).toHaveBeenCalledTimes(2)
      expect(trackEventUnpaidTaxReminderMock).toHaveBeenCalledWith(
        {
          year: 2024,
        },
        'external-id-1',
      )
      expect(trackEventUnpaidTaxReminderMock).toHaveBeenCalledWith(
        {
          year: 2024,
        },
        'external-id-2',
      )
    })
  })

  describe('loadOverpaymentsFromNoris', () => {
    let getConfigByKeysMock: jest.SpyInstance

    beforeEach(() => {
      jest.clearAllMocks()
      jest.useFakeTimers()

      getConfigByKeysMock = jest
        .spyOn(service['databaseSubservice'], 'getConfigByKeys')
        .mockResolvedValue({
          OVERPAYMENTS_FROM_NORIS_ENABLED: 'true',
          OVERPAYMENTS_LOOKBACK_DAYS: '3',
        })
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    it('should skip execution when feature toggle is disabled', async () => {
      getConfigByKeysMock = jest
        .spyOn(service['databaseSubservice'], 'getConfigByKeys')
        .mockResolvedValue({
          OVERPAYMENTS_FROM_NORIS_ENABLED: 'false',
          OVERPAYMENTS_LOOKBACK_DAYS: '3',
        })

      await service.loadOverpaymentsFromNoris()

      expect(getConfigByKeysMock).toHaveBeenCalledWith([
        'OVERPAYMENTS_FROM_NORIS_ENABLED',
        OVERPAYMENTS_LOOKBACK_DAYS,
      ])
      expect(
        service['norisService'].updateOverpaymentsDataFromNorisByDateRange,
      ).not.toHaveBeenCalled()
      expect(
        service['norisService'].updatePaymentsFromNorisWithData,
      ).not.toHaveBeenCalled()
    })

    it('should successfully load and process overpayments when feature is enabled', async () => {
      const mockResult = {
        created: 2,
        alreadyCreated: 0,
      }

      jest.setSystemTime(new Date('2025-01-01T12:00:00.000Z'))

      const getOverpaymentsDataMock = jest
        .spyOn(
          service['norisService'],
          'updateOverpaymentsDataFromNorisByDateRange',
        )
        .mockResolvedValue(mockResult)

      await service.loadOverpaymentsFromNoris()

      expect(getConfigByKeysMock).toHaveBeenCalledWith([
        'OVERPAYMENTS_FROM_NORIS_ENABLED',
        OVERPAYMENTS_LOOKBACK_DAYS,
      ])

      const expectedFromDate = dayjs().subtract(3, 'day').toDate()
      expect(getOverpaymentsDataMock).toHaveBeenCalledWith({
        fromDate: expectedFromDate,
      })
    })

    it('should use configurable lookback days from database config', async () => {
      const mockResult = {
        created: 1,
        alreadyCreated: 0,
      }

      jest.setSystemTime(new Date('2025-01-01T12:00:00.000Z'))

      getConfigByKeysMock = jest
        .spyOn(service['databaseSubservice'], 'getConfigByKeys')
        .mockResolvedValue({
          OVERPAYMENTS_FROM_NORIS_ENABLED: 'true',
          OVERPAYMENTS_LOOKBACK_DAYS: '7',
        })

      const getOverpaymentsDataMock = jest
        .spyOn(
          service['norisService'],
          'updateOverpaymentsDataFromNorisByDateRange',
        )
        .mockResolvedValue(mockResult)

      await service.loadOverpaymentsFromNoris()

      expect(getConfigByKeysMock).toHaveBeenCalledWith([
        'OVERPAYMENTS_FROM_NORIS_ENABLED',
        OVERPAYMENTS_LOOKBACK_DAYS,
      ])

      const expectedFromDate = dayjs().subtract(7, 'day').toDate()
      expect(getOverpaymentsDataMock).toHaveBeenCalledWith({
        fromDate: expectedFromDate,
      })
    })

    it('should throw error when config is invalid', async () => {
      getConfigByKeysMock = jest
        .spyOn(service['databaseSubservice'], 'getConfigByKeys')
        .mockResolvedValue({
          OVERPAYMENTS_FROM_NORIS_ENABLED: 'true',
          OVERPAYMENTS_LOOKBACK_DAYS: 'invalid',
        })

      jest
        .spyOn(LineLoggerSubservice.prototype, 'error')
        .mockImplementation(() => {})

      const updateOverpaymentsDataFromNorisByDateRangeSpy = jest.spyOn(
        service['norisService'],
        'updateOverpaymentsDataFromNorisByDateRange',
      )

      const internalServerErrorExceptionSpy = jest
        .spyOn(service['throwerErrorGuard'], 'InternalServerErrorException')
        .mockReturnValue(
          new HttpException(
            'Internal Server Error',
            HttpStatus.INTERNAL_SERVER_ERROR,
          ),
        )

      // The error is caught by @HandleErrors decorator, so we expect it to not throw
      const result = await service.loadOverpaymentsFromNoris()

      expect(result).toBeNull()
      expect(
        updateOverpaymentsDataFromNorisByDateRangeSpy,
      ).not.toHaveBeenCalled()
      expect(internalServerErrorExceptionSpy).toHaveBeenCalled()
      expect(getConfigByKeysMock).toHaveBeenCalledWith([
        'OVERPAYMENTS_FROM_NORIS_ENABLED',
        OVERPAYMENTS_LOOKBACK_DAYS,
      ])
    })

    it('should reset lookback days to default on success', async () => {
      const mockResult = {
        created: 1,
        alreadyCreated: 0,
      }

      jest.setSystemTime(new Date('2025-01-01T12:00:00.000Z'))

      const getOverpaymentsDataMock = jest
        .spyOn(
          service['norisService'],
          'updateOverpaymentsDataFromNorisByDateRange',
        )
        .mockResolvedValue(mockResult)

      const configSubserviceMock = jest
        .spyOn(service['configSubservice'], 'resetOverpaymentsLookbackDays')
        .mockResolvedValue()

      await service.loadOverpaymentsFromNoris()

      expect(getConfigByKeysMock).toHaveBeenCalledWith([
        'OVERPAYMENTS_FROM_NORIS_ENABLED',
        OVERPAYMENTS_LOOKBACK_DAYS,
      ])

      const expectedFromDate = dayjs().subtract(3, 'day').toDate()
      expect(getOverpaymentsDataMock).toHaveBeenCalledWith({
        fromDate: expectedFromDate,
      })

      expect(configSubserviceMock).toHaveBeenCalled()
    })

    it('should increment lookback days on failure', async () => {
      jest.setSystemTime(new Date('2025-01-01T12:00:00.000Z'))

      const error = new Error('Noris service failed')

      const retryWithDelayMock = jest
        .spyOn(service as any, 'retryWithDelay')
        .mockRejectedValue(error)

      const configSubserviceMock = jest
        .spyOn(service['configSubservice'], 'incrementOverpaymentsLookbackDays')
        .mockResolvedValue()

      jest
        .spyOn(LineLoggerSubservice.prototype, 'error')
        .mockImplementation(() => {})

      // The error is caught by @HandleErrors decorator, so we expect it to not throw
      const result = await service.loadOverpaymentsFromNoris()
      expect(result).toBeNull()

      expect(retryWithDelayMock).toHaveBeenCalled()
      expect(configSubserviceMock).toHaveBeenCalled()
    })

    it('should handle error when updating payments fails', async () => {
      jest
        .spyOn(service['databaseSubservice'], 'getConfigByKeys')
        .mockResolvedValue({
          OVERPAYMENTS_FROM_NORIS_ENABLED: 'true',
          OVERPAYMENTS_LOOKBACK_DAYS: '3',
        })

      const error = new Error('Payment update failed')

      jest.spyOn(service as any, 'retryWithDelay').mockRejectedValue(error)

      const configSubserviceMock = jest
        .spyOn(service['configSubservice'], 'incrementOverpaymentsLookbackDays')
        .mockResolvedValue()

      const throwerErrorGuardMock = jest
        .spyOn(service['throwerErrorGuard'], 'InternalServerErrorException')
        .mockReturnValue(
          new HttpException(
            'Internal Server Error',
            HttpStatus.INTERNAL_SERVER_ERROR,
          ),
        )

      jest.spyOn(LineLoggerSubservice.prototype, 'error').mockImplementation()

      // Since the method is decorated with @HandleErrors, it will catch the error and return null
      const result = await service.loadOverpaymentsFromNoris()

      expect(result).toBeNull()
      expect(configSubserviceMock).toHaveBeenCalled()
      expect(throwerErrorGuardMock).toHaveBeenCalledWith(
        CustomErrorNorisTypesEnum.LOAD_OVERPAYMENTS_FROM_NORIS_ERROR,
        expect.any(String),
        undefined,
        undefined,
        error,
      )
    })

    it('should handle error when retryWithDelay fails', async () => {
      jest
        .spyOn(service['databaseSubservice'], 'getConfigByKeys')
        .mockResolvedValue({
          OVERPAYMENTS_FROM_NORIS_ENABLED: 'true',
          OVERPAYMENTS_LOOKBACK_DAYS: '3',
        })

      const error = new Error('Retry failed')

      jest.spyOn(service as any, 'retryWithDelay').mockRejectedValue(error)

      const throwerErrorGuardMock = jest
        .spyOn(service['throwerErrorGuard'], 'InternalServerErrorException')
        .mockReturnValue(
          new HttpException(
            'Internal Server Error',
            HttpStatus.INTERNAL_SERVER_ERROR,
          ),
        )

      jest.spyOn(LineLoggerSubservice.prototype, 'error').mockImplementation()

      // Since the method is decorated with @HandleErrors, it will catch the error and return null
      const result = await service.loadOverpaymentsFromNoris()

      expect(result).toBeNull()
      expect(throwerErrorGuardMock).toHaveBeenCalledWith(
        CustomErrorNorisTypesEnum.LOAD_OVERPAYMENTS_FROM_NORIS_ERROR,
        expect.any(String),
        undefined,
        undefined,
        error,
      )
    })
  })

  describe('retryWithDelay', () => {
    beforeEach(() => {
      jest.clearAllMocks()
      jest.useFakeTimers()
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    it('should succeed on first attempt without retry', async () => {
      const mockFn = jest.fn().mockResolvedValue('success')
      const logMock = jest.spyOn(service['logger'], 'warn').mockImplementation()

      const result = await service['retryWithDelay'](mockFn, 3, 1000)

      expect(result).toBe('success')
      expect(mockFn).toHaveBeenCalledTimes(1)
      expect(logMock).not.toHaveBeenCalled()
    })

    it('should retry specified number of times before succeeding', async () => {
      const mockFn = jest
        .fn()
        .mockRejectedValueOnce(new Error('First attempt failed'))
        .mockRejectedValueOnce(new Error('Second attempt failed'))
        .mockResolvedValue('success')

      const logMock = jest.spyOn(service['logger'], 'warn').mockImplementation()

      const resultPromise = service['retryWithDelay'](mockFn, 3, 1000)

      // Fast-forward through the delays
      await jest.advanceTimersByTimeAsync(2000)

      const result = await resultPromise

      expect(result).toBe('success')
      expect(mockFn).toHaveBeenCalledTimes(3)
      expect(logMock).toHaveBeenCalledTimes(2)
    })

    it('should throw error if all retries fail', async () => {
      jest.useRealTimers()

      const mockFn = jest
        .fn()
        .mockRejectedValue(new Error('First attempt failed'))
        .mockRejectedValue(new Error('Second attempt failed'))
        .mockRejectedValue(new Error('Third attempt failed'))

      await expect(service['retryWithDelay'](mockFn, 3, 10)).rejects.toThrow(
        'Third attempt failed',
      )
    })

    it('should use default retry count and delay when not specified', async () => {
      const mockFn = jest.fn().mockResolvedValue('success')

      const result = await service['retryWithDelay'](mockFn)

      expect(result).toBe('success')
      expect(mockFn).toHaveBeenCalledTimes(1)
    })

    it('should handle zero retries correctly', async () => {
      const error = new Error('Immediate failure')
      const mockFn = jest.fn().mockRejectedValue(error)
      const logMock = jest.spyOn(service['logger'], 'warn').mockImplementation()

      await expect(service['retryWithDelay'](mockFn, 0, 1000)).rejects.toThrow(
        'Immediate failure',
      )

      expect(mockFn).toHaveBeenCalledTimes(1)
      expect(logMock).not.toHaveBeenCalled()
    })

    it('should handle different delay values correctly', async () => {
      const mockFn = jest
        .fn()
        .mockRejectedValueOnce(new Error('First attempt failed'))
        .mockResolvedValue('success')

      jest.spyOn(service['logger'], 'warn').mockImplementation()

      const resultPromise = service['retryWithDelay'](mockFn, 2, 5000)

      // Fast-forward through the delay
      await jest.advanceTimersByTimeAsync(5000)

      const result = await resultPromise

      expect(result).toBe('success')
      expect(mockFn).toHaveBeenCalledTimes(2)
    })

    it('should handle very small delay values', async () => {
      const mockFn = jest
        .fn()
        .mockRejectedValueOnce(new Error('First attempt failed'))
        .mockResolvedValue('success')

      const logMock = jest.spyOn(service['logger'], 'warn').mockImplementation()

      const resultPromise = service['retryWithDelay'](mockFn, 2, 100)

      // Fast-forward through the delay
      await jest.advanceTimersByTimeAsync(100)

      const result = await resultPromise

      expect(result).toBe('success')
      expect(mockFn).toHaveBeenCalledTimes(2)
      expect(logMock).toHaveBeenCalledWith(
        'Retry attempt failed. Retrying in 0.10 seconds. Remaining retries: 1',
        expect.any(String),
      )
    })

    it('should handle function that throws different types of errors', async () => {
      const error1 = new TypeError('Type error')
      const error2 = new ReferenceError('Reference error')
      const mockFn = jest
        .fn()
        .mockRejectedValueOnce(error1)
        .mockRejectedValueOnce(error2)
        .mockResolvedValue('success')

      const logMock = jest.spyOn(service['logger'], 'warn').mockImplementation()

      const resultPromise = service['retryWithDelay'](mockFn, 3, 1000)

      // Fast-forward through the delays
      await jest.advanceTimersByTimeAsync(2000)

      const result = await resultPromise

      expect(result).toBe('success')
      expect(mockFn).toHaveBeenCalledTimes(3)
      expect(logMock).toHaveBeenCalledTimes(2)
    })

    it('should handle function that throws non-Error objects', async () => {
      const mockFn = jest
        .fn()
        .mockRejectedValueOnce('String error')
        .mockRejectedValueOnce({ message: 'Object error' })
        .mockResolvedValue('success')

      const logMock = jest.spyOn(service['logger'], 'warn').mockImplementation()

      const resultPromise = service['retryWithDelay'](mockFn, 3, 1000)

      // Fast-forward through the delays
      await jest.advanceTimersByTimeAsync(2000)

      const result = await resultPromise

      expect(result).toBe('success')
      expect(mockFn).toHaveBeenCalledTimes(3)
      expect(logMock).toHaveBeenCalledTimes(2)
    })

    it('should handle function that throws null or undefined', async () => {
      const mockFn = jest
        .fn()
        .mockRejectedValueOnce(null)
        .mockRejectedValueOnce(null)
        .mockResolvedValue('success')

      const logMock = jest.spyOn(service['logger'], 'warn').mockImplementation()

      const resultPromise = service['retryWithDelay'](mockFn, 3, 1000)

      // Fast-forward through the delays
      await jest.advanceTimersByTimeAsync(2000)

      const result = await resultPromise

      expect(result).toBe('success')
      expect(mockFn).toHaveBeenCalledTimes(3)
      expect(logMock).toHaveBeenCalledTimes(2)
    })

    it('should handle recursive retry calls correctly', async () => {
      const mockFn = jest
        .fn()
        .mockRejectedValueOnce(new Error('First attempt failed'))
        .mockRejectedValueOnce(new Error('Second attempt failed'))
        .mockRejectedValueOnce(new Error('Third attempt failed'))
        .mockResolvedValue('success')

      const logMock = jest.spyOn(service['logger'], 'warn').mockImplementation()

      const resultPromise = service['retryWithDelay'](mockFn, 4, 1000)

      // Fast-forward through all delays
      await jest.advanceTimersByTimeAsync(3000)

      const result = await resultPromise

      expect(result).toBe('success')
      expect(mockFn).toHaveBeenCalledTimes(4)
      expect(logMock).toHaveBeenCalledTimes(3)
    })
  })
})
