import { createMock } from '@golevelup/ts-jest'
import { HttpException, HttpStatus } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import { PaymentStatus } from '@prisma/client'
import dayjs from 'dayjs'
import noop from 'lodash/noop'

import prismaMock from '../../../test/singleton'
import { BloomreachService } from '../../bloomreach/bloomreach.service'
import { CardPaymentReportingService } from '../../card-payment-reporting/card-payment-reporting.service'
import { CustomErrorNorisTypesEnum } from '../../noris/noris.errors'
import { NorisService } from '../../noris/noris.service'
import { PaymentService } from '../../payment/payment.service'
import { PrismaService } from '../../prisma/prisma.service'
import { OVERPAYMENTS_LOOKBACK_DAYS } from '../../utils/constants'
import ThrowerErrorGuard from '../../utils/guards/errors.guard'
import { CityAccountSubservice } from '../../utils/subservices/cityaccount.subservice'
import DatabaseSubservice from '../../utils/subservices/database.subservice'
import { LineLoggerSubservice } from '../../utils/subservices/line-logger.subservice'
import { RetryService } from '../../utils-module/retry.service'
import TasksConfigSubservice from '../subservices/config.subservice'
import TaxImportHelperSubservice from '../subservices/tax-import-helper.subservice'
import { TasksService } from '../tasks.service'

// Mock p-limit to return a function that executes the passed function immediately
const mockPLimitFn = (fn: () => Promise<any>) => fn()
jest.mock('p-limit', () => {
  return jest.fn(() => mockPLimitFn)
})

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
        {
          provide: PaymentService,
          useValue: createMock<PaymentService>(),
        },
        {
          provide: RetryService,
          useValue: createMock<RetryService>(),
        },
      ],
    }).compile()

    service = module.get<TasksService>(TasksService)
    const retryServiceInstance = new RetryService()
    jest
      .spyOn(service['retryService'], 'retryWithDelay')
      .mockImplementation(
        retryServiceInstance.retryWithDelay.bind(retryServiceInstance),
      )
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
      jest.spyOn(service['logger'], 'log').mockImplementation(noop)

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
      jest.spyOn(service['logger'], 'log').mockImplementation(noop)

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
        .mockImplementation(noop)

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
        .spyOn(service['retryService'], 'retryWithDelay')
        .mockRejectedValue(error)

      const configSubserviceMock = jest
        .spyOn(service['configSubservice'], 'incrementOverpaymentsLookbackDays')
        .mockResolvedValue()

      jest
        .spyOn(LineLoggerSubservice.prototype, 'error')
        .mockImplementation(noop)

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

      jest
        .spyOn(service['retryService'], 'retryWithDelay')
        .mockRejectedValue(error)

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

      jest
        .spyOn(LineLoggerSubservice.prototype, 'error')
        .mockImplementation(noop)

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

      jest
        .spyOn(service['retryService'], 'retryWithDelay')
        .mockRejectedValue(error)

      const throwerErrorGuardMock = jest
        .spyOn(service['throwerErrorGuard'], 'InternalServerErrorException')
        .mockReturnValue(
          new HttpException(
            'Internal Server Error',
            HttpStatus.INTERNAL_SERVER_ERROR,
          ),
        )

      jest
        .spyOn(LineLoggerSubservice.prototype, 'error')
        .mockImplementation(noop)

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

  describe('loadTaxesForUsers', () => {
    const currentYear = new Date().getFullYear()

    it('should import newly created users immediately regardless of window or limit', async () => {
      const mockTaxImportHelper = service['taxImportHelperSubservice']
      const newlyCreated = ['123456/7890', '111111/2222']
      const birthNumbers = ['987654/3210']

      jest
        .spyOn(mockTaxImportHelper, 'isWithinImportWindow')
        .mockResolvedValue(false) // Outside window
      jest
        .spyOn(mockTaxImportHelper, 'getTodayTaxCount')
        .mockResolvedValue(8000) // Over limit
      jest
        .spyOn(mockTaxImportHelper, 'getDailyTaxLimit')
        .mockResolvedValue(7200)
      jest
        .spyOn(mockTaxImportHelper, 'getPrioritizedBirthNumbersWithMetadata')
        .mockResolvedValue({
          birthNumbers,
          newlyCreated,
        })
      const importTaxesSpy = jest
        .spyOn(mockTaxImportHelper, 'importTaxes')
        .mockResolvedValue()
      const prepareTaxesSpy = jest
        .spyOn(mockTaxImportHelper, 'prepareTaxes')
        .mockResolvedValue()

      await service.loadTaxesForUsers()

      // Newly created users should be imported immediately
      expect(importTaxesSpy).toHaveBeenCalledWith(newlyCreated, currentYear)
      // Other users should be prepared (since outside window and over limit)
      expect(prepareTaxesSpy).toHaveBeenCalledWith(birthNumbers, currentYear)
      expect(importTaxesSpy).toHaveBeenCalledTimes(1) // Only for newly created
    })

    it('should import newly created users immediately when outside window and under limit', async () => {
      const mockTaxImportHelper = service['taxImportHelperSubservice']
      const newlyCreated = ['123456/7890']
      const birthNumbers = ['987654/3210']

      jest
        .spyOn(mockTaxImportHelper, 'isWithinImportWindow')
        .mockResolvedValue(false) // Outside window
      jest
        .spyOn(mockTaxImportHelper, 'getTodayTaxCount')
        .mockResolvedValue(1000) // Under limit
      jest
        .spyOn(mockTaxImportHelper, 'getDailyTaxLimit')
        .mockResolvedValue(7200)
      jest
        .spyOn(mockTaxImportHelper, 'getPrioritizedBirthNumbersWithMetadata')
        .mockResolvedValue({
          birthNumbers,
          newlyCreated,
        })
      const importTaxesSpy = jest
        .spyOn(mockTaxImportHelper, 'importTaxes')
        .mockResolvedValue()
      const prepareTaxesSpy = jest
        .spyOn(mockTaxImportHelper, 'prepareTaxes')
        .mockResolvedValue()

      await service.loadTaxesForUsers()

      // Newly created users should be imported immediately
      expect(importTaxesSpy).toHaveBeenCalledWith(newlyCreated, currentYear)
      // Other users should be prepared (since outside window and under limit)
      expect(prepareTaxesSpy).toHaveBeenCalledWith(birthNumbers, currentYear)
      expect(importTaxesSpy).toHaveBeenCalledTimes(1) // Only for newly created
    })

    it('should import newly created users immediately when within window and over limit', async () => {
      const mockTaxImportHelper = service['taxImportHelperSubservice']
      const newlyCreated = ['123456/7890']
      const birthNumbers = ['987654/3210']

      jest
        .spyOn(mockTaxImportHelper, 'isWithinImportWindow')
        .mockResolvedValue(true) // Within window
      jest
        .spyOn(mockTaxImportHelper, 'getTodayTaxCount')
        .mockResolvedValue(8000) // Over limit
      jest
        .spyOn(mockTaxImportHelper, 'getDailyTaxLimit')
        .mockResolvedValue(7200)
      jest
        .spyOn(mockTaxImportHelper, 'getPrioritizedBirthNumbersWithMetadata')

        .mockResolvedValue({
          birthNumbers,
          newlyCreated,
        })
      const importTaxesSpy = jest
        .spyOn(mockTaxImportHelper, 'importTaxes')
        .mockResolvedValue()
      const prepareTaxesSpy = jest
        .spyOn(mockTaxImportHelper, 'prepareTaxes')
        .mockResolvedValue()

      await service.loadTaxesForUsers()

      // Newly created users should be imported immediately
      expect(importTaxesSpy).toHaveBeenCalledWith(newlyCreated, currentYear)
      // Other users should be prepared (since within window and over limit)
      expect(prepareTaxesSpy).toHaveBeenCalledWith(birthNumbers, currentYear)
      expect(importTaxesSpy).toHaveBeenCalledTimes(1) // Only for newly created
    })

    it('should import newly created users even when within window and under limit', async () => {
      const mockTaxImportHelper = service['taxImportHelperSubservice']
      const newlyCreated = ['123456/7890']
      const birthNumbers = ['987654/3210']

      jest
        .spyOn(mockTaxImportHelper, 'isWithinImportWindow')
        .mockResolvedValue(true) // Within window
      jest
        .spyOn(mockTaxImportHelper, 'getTodayTaxCount')
        .mockResolvedValue(1000) // Under limit
      jest
        .spyOn(mockTaxImportHelper, 'getDailyTaxLimit')
        .mockResolvedValue(7200)
      jest
        .spyOn(mockTaxImportHelper, 'getPrioritizedBirthNumbersWithMetadata')
        .mockResolvedValue({
          birthNumbers,
          newlyCreated,
        })
      const importTaxesSpy = jest
        .spyOn(mockTaxImportHelper, 'importTaxes')
        .mockResolvedValue()
      const prepareTaxesSpy = jest
        .spyOn(mockTaxImportHelper, 'prepareTaxes')
        .mockResolvedValue()

      await service.loadTaxesForUsers()

      // Both newly created and other users should be imported
      expect(importTaxesSpy).toHaveBeenCalledWith(
        newlyCreated,
        expect.any(Number),
      )
      expect(importTaxesSpy).toHaveBeenCalledWith(
        birthNumbers,
        expect.any(Number),
      )
      expect(importTaxesSpy).toHaveBeenCalledTimes(2)
      expect(prepareTaxesSpy).not.toHaveBeenCalled()
    })

    it('should process remaining users based on window and limit when no newly created users', async () => {
      const mockTaxImportHelper = service['taxImportHelperSubservice']
      const birthNumbers = ['987654/3210', '555555/6666']

      jest
        .spyOn(mockTaxImportHelper, 'isWithinImportWindow')
        .mockResolvedValue(true)
      jest
        .spyOn(mockTaxImportHelper, 'getTodayTaxCount')
        .mockResolvedValue(1000)
      jest
        .spyOn(mockTaxImportHelper, 'getDailyTaxLimit')
        .mockResolvedValue(7200)
      jest
        .spyOn(mockTaxImportHelper, 'getPrioritizedBirthNumbersWithMetadata')
        .mockResolvedValue({
          birthNumbers,
          newlyCreated: [],
        })
      const importTaxesSpy = jest
        .spyOn(mockTaxImportHelper, 'importTaxes')
        .mockResolvedValue()

      await service.loadTaxesForUsers()

      // Only other users should be imported (no newly created)
      expect(importTaxesSpy).toHaveBeenCalledWith(
        birthNumbers,
        expect.any(Number),
      )
      expect(importTaxesSpy).toHaveBeenCalledTimes(1)
    })

    it('should prepare remaining users when outside window or over limit', async () => {
      const mockTaxImportHelper = service['taxImportHelperSubservice']
      const newlyCreated = ['123456/7890']
      const birthNumbers = ['987654/3210']

      jest
        .spyOn(mockTaxImportHelper, 'isWithinImportWindow')
        .mockResolvedValue(false) // Outside window
      jest
        .spyOn(mockTaxImportHelper, 'getTodayTaxCount')
        .mockResolvedValue(1000)
      jest
        .spyOn(mockTaxImportHelper, 'getDailyTaxLimit')
        .mockResolvedValue(7200)
      jest
        .spyOn(mockTaxImportHelper, 'getPrioritizedBirthNumbersWithMetadata')
        .mockResolvedValue({
          birthNumbers,
          newlyCreated,
        })
      const importTaxesSpy = jest
        .spyOn(mockTaxImportHelper, 'importTaxes')
        .mockResolvedValue()
      const prepareTaxesSpy = jest
        .spyOn(mockTaxImportHelper, 'prepareTaxes')
        .mockResolvedValue()

      await service.loadTaxesForUsers()

      // Newly created should be imported
      expect(importTaxesSpy).toHaveBeenCalledWith(newlyCreated, currentYear)
      // Other users should be prepared (outside window)
      expect(prepareTaxesSpy).toHaveBeenCalledWith(birthNumbers, currentYear)
    })

    it('should return early when no birth numbers found', async () => {
      const mockTaxImportHelper = service['taxImportHelperSubservice']

      jest
        .spyOn(mockTaxImportHelper, 'isWithinImportWindow')
        .mockResolvedValue(true)
      jest
        .spyOn(mockTaxImportHelper, 'getTodayTaxCount')
        .mockResolvedValue(1000)
      jest
        .spyOn(mockTaxImportHelper, 'getDailyTaxLimit')
        .mockResolvedValue(7200)
      jest
        .spyOn(mockTaxImportHelper, 'getPrioritizedBirthNumbersWithMetadata')
        .mockResolvedValue({
          birthNumbers: [],
          newlyCreated: [],
        })
      const importTaxesSpy = jest
        .spyOn(mockTaxImportHelper, 'importTaxes')
        .mockResolvedValue()
      const prepareTaxesSpy = jest
        .spyOn(mockTaxImportHelper, 'prepareTaxes')
        .mockResolvedValue()

      await service.loadTaxesForUsers()

      expect(importTaxesSpy).not.toHaveBeenCalled()
      expect(prepareTaxesSpy).not.toHaveBeenCalled()
    })

    it('should only import newly created users when no other users are found', async () => {
      const mockTaxImportHelper = service['taxImportHelperSubservice']
      const newlyCreated = ['123456/7890']
      const birthNumbers: string[] = []

      jest
        .spyOn(mockTaxImportHelper, 'isWithinImportWindow')
        .mockResolvedValue(true)
      jest
        .spyOn(mockTaxImportHelper, 'getTodayTaxCount')
        .mockResolvedValue(1000)
      jest
        .spyOn(mockTaxImportHelper, 'getDailyTaxLimit')
        .mockResolvedValue(7200)
      jest
        .spyOn(mockTaxImportHelper, 'getPrioritizedBirthNumbersWithMetadata')
        .mockResolvedValue({
          birthNumbers,
          newlyCreated,
        })
      const importTaxesSpy = jest
        .spyOn(mockTaxImportHelper, 'importTaxes')
        .mockResolvedValue()
      const prepareTaxesSpy = jest
        .spyOn(mockTaxImportHelper, 'prepareTaxes')
        .mockResolvedValue()

      await service.loadTaxesForUsers()

      expect(importTaxesSpy).toHaveBeenCalledWith(newlyCreated, currentYear)
      expect(importTaxesSpy).toHaveBeenCalledTimes(1)
      expect(prepareTaxesSpy).not.toHaveBeenCalled()
    })
  })

  describe('resendBloomreachEvents', () => {
    beforeEach(() => {
      jest.clearAllMocks()
      jest.spyOn(service['logger'], 'log').mockImplementation(noop)
      jest.spyOn(service['logger'], 'error').mockImplementation(noop)
    })

    it('should not process anything when there are no payments', async () => {
      jest
        .spyOn(service['prismaService'].taxPayment, 'findMany')
        .mockResolvedValue([])

      const getUserDataAdminBatchSpy = jest.spyOn(
        service['cityAccountSubservice'],
        'getUserDataAdminBatch',
      )
      const trackPaymentInBloomreachSpy = jest.spyOn(
        service['paymentService'],
        'trackPaymentInBloomreach',
      )

      await service.resendBloomreachEvents()

      expect(getUserDataAdminBatchSpy).not.toHaveBeenCalled()
      expect(trackPaymentInBloomreachSpy).not.toHaveBeenCalled()
    })

    it('should successfully resend bloomreach events for all payments', async () => {
      const mockPayments = [
        {
          id: 1,
          status: PaymentStatus.SUCCESS,
          bloomreachEventSent: false,
          tax: {
            taxPayer: {
              birthNumber: '123456/7890',
            },
          },
        },
        {
          id: 2,
          status: PaymentStatus.SUCCESS,
          bloomreachEventSent: false,
          tax: {
            taxPayer: {
              birthNumber: '234567/8901',
            },
          },
        },
      ] as any

      jest
        .spyOn(service['prismaService'].taxPayment, 'findMany')
        .mockResolvedValue(mockPayments)

      const mockUserData = {
        '123456/7890': {
          externalId: 'external-id-1',
        },
        '234567/8901': {
          externalId: 'external-id-2',
        },
      }

      jest
        .spyOn(service['cityAccountSubservice'], 'getUserDataAdminBatch')
        .mockResolvedValue(mockUserData as any)

      const trackPaymentInBloomreachSpy = jest.spyOn(
        service['paymentService'],
        'trackPaymentInBloomreach',
      )

      await service.resendBloomreachEvents()

      expect(trackPaymentInBloomreachSpy).toHaveBeenCalledTimes(2)
      expect(trackPaymentInBloomreachSpy).toHaveBeenCalledWith(
        mockPayments[0],
        'external-id-1',
      )
      expect(trackPaymentInBloomreachSpy).toHaveBeenCalledWith(
        mockPayments[1],
        'external-id-2',
      )

      expect(service['logger'].log).toHaveBeenCalledWith(
        expect.stringContaining('2'),
      )
      expect(service['logger'].log).toHaveBeenCalledWith(
        expect.stringContaining('0'),
      )
    })

    it('should handle payments without user data from city account', async () => {
      const mockPayments = [
        {
          id: 1,
          status: PaymentStatus.SUCCESS,
          bloomreachEventSent: false,
          tax: {
            taxPayer: {
              birthNumber: '123456/7890',
            },
          },
        },
      ] as any

      jest
        .spyOn(service['prismaService'].taxPayment, 'findMany')
        .mockResolvedValue(mockPayments)

      jest
        .spyOn(service['cityAccountSubservice'], 'getUserDataAdminBatch')
        .mockResolvedValue({} as any)

      const trackPaymentInBloomreachSpy = jest
        .spyOn(service['paymentService'], 'trackPaymentInBloomreach')
        .mockResolvedValue()

      await service.resendBloomreachEvents()

      expect(trackPaymentInBloomreachSpy).toHaveBeenCalledWith(
        mockPayments[0],
        undefined,
      )
    })

    it('should handle partial failures and log errors', async () => {
      const mockPayments = [
        {
          id: 1,
          status: PaymentStatus.SUCCESS,
          bloomreachEventSent: false,
          tax: {
            taxPayer: {
              birthNumber: '123456/7890',
            },
          },
        },
        {
          id: 2,
          status: PaymentStatus.SUCCESS,
          bloomreachEventSent: false,
          tax: {
            taxPayer: {
              birthNumber: '234567/8901',
            },
          },
        },
      ] as any

      jest
        .spyOn(service['prismaService'].taxPayment, 'findMany')
        .mockResolvedValue(mockPayments)

      jest
        .spyOn(service['cityAccountSubservice'], 'getUserDataAdminBatch')
        .mockResolvedValue({
          '123456/7890': { externalId: 'external-id-1' },
          '234567/8901': { externalId: 'external-id-2' },
        } as any)

      const error = new Error('Tracking failed')
      const trackPaymentInBloomreachSpy = jest
        .spyOn(service['paymentService'], 'trackPaymentInBloomreach')
        .mockResolvedValueOnce()
        .mockRejectedValueOnce(error)

      await service.resendBloomreachEvents()

      expect(trackPaymentInBloomreachSpy).toHaveBeenCalledTimes(2)
      expect(service['logger'].error).toHaveBeenCalledWith(error)
      expect(service['logger'].log).toHaveBeenCalledWith(
        expect.stringContaining('1'),
      )
      expect(service['logger'].log).toHaveBeenCalledWith(
        expect.stringContaining('1'),
      )
    })

    it('should handle all failures', async () => {
      const mockPayments = [
        {
          id: 1,
          status: PaymentStatus.SUCCESS,
          bloomreachEventSent: false,
          tax: {
            taxPayer: {
              birthNumber: '123456/7890',
            },
          },
        },
        {
          id: 2,
          status: PaymentStatus.SUCCESS,
          bloomreachEventSent: false,
          tax: {
            taxPayer: {
              birthNumber: '234567/8901',
            },
          },
        },
      ] as any

      jest
        .spyOn(service['prismaService'].taxPayment, 'findMany')
        .mockResolvedValue(mockPayments)

      jest
        .spyOn(service['cityAccountSubservice'], 'getUserDataAdminBatch')
        .mockResolvedValue({
          '123456/7890': { externalId: 'external-id-1' },
          '234567/8901': { externalId: 'external-id-2' },
        } as any)

      const error1 = new Error('Tracking failed 1')
      const error2 = new Error('Tracking failed 2')
      const trackPaymentInBloomreachSpy = jest
        .spyOn(service['paymentService'], 'trackPaymentInBloomreach')
        .mockRejectedValueOnce(error1)
        .mockRejectedValueOnce(error2)

      await service.resendBloomreachEvents()

      expect(trackPaymentInBloomreachSpy).toHaveBeenCalledTimes(2)
      expect(service['logger'].error).toHaveBeenCalledWith(error1)
      expect(service['logger'].error).toHaveBeenCalledWith(error2)
      expect(service['logger'].log).toHaveBeenCalledWith(
        expect.stringContaining('0'),
      )
      expect(service['logger'].log).toHaveBeenCalledWith(
        expect.stringContaining('2'),
      )
    })
  })
})
