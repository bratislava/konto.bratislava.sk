import { createMock } from '@golevelup/ts-jest'
import { Test, TestingModule } from '@nestjs/testing'
import { TaxType } from '@prisma/client'
import dayjs from 'dayjs'

import prismaMock from '../../../../test/singleton'
import { NorisService } from '../../../noris/noris.service'
import { PrismaService } from '../../../prisma/prisma.service'
import { OVERPAYMENTS_LOOKBACK_DAYS } from '../../../utils/constants'
import ThrowerErrorGuard from '../../../utils/guards/errors.guard'
import DatabaseSubservice from '../../../utils/subservices/database.subservice'
import { RetryService } from '../../../utils-module/retry.service'
import TasksConfigSubservice from '../config.service'
import TaxImportTasksService from '../tax-import.tasks.service'
import TaxImportHelperService from '../tax-import-helper.service'

describe('TaxImportTasksService', () => {
  let service: TaxImportTasksService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaxImportTasksService,
        ThrowerErrorGuard,
        { provide: NorisService, useValue: createMock<NorisService>() },
        { provide: PrismaService, useValue: prismaMock },
        {
          provide: DatabaseSubservice,
          useValue: createMock<DatabaseSubservice>(),
        },
        {
          provide: TasksConfigSubservice,
          useValue: createMock<TasksConfigSubservice>(),
        },
        {
          provide: TaxImportHelperService,
          useValue: createMock<TaxImportHelperService>(),
        },
        {
          provide: RetryService,
          useValue: createMock<RetryService>(),
        },
      ],
    }).compile()

    service = module.get<TaxImportTasksService>(TaxImportTasksService)
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

  describe('loadTaxesForUsers', () => {
    const currentYear = new Date().getFullYear()

    beforeEach(() => {
      // Reset the lastLoadedTaxType to a known state before each test
      service['lastLoadedTaxType'] = TaxType.KO
    })

    it('should alternate between DZN and KO on subsequent calls', async () => {
      const mockTaxImportHelper = service['taxImportHelperService']

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

      // First call should use DZN (because lastLoadedTaxType starts as KO)
      await service.loadTaxesForUsers()
      expect(
        mockTaxImportHelper.getPrioritizedBirthNumbersWithMetadata,
      ).toHaveBeenCalledWith(TaxType.DZN, currentYear, 2020, true)

      // Second call should use KO
      await service.loadTaxesForUsers()
      expect(
        mockTaxImportHelper.getPrioritizedBirthNumbersWithMetadata,
      ).toHaveBeenCalledWith(TaxType.KO, currentYear, 2020, true)

      // Third call should use DZN again
      await service.loadTaxesForUsers()
      expect(
        mockTaxImportHelper.getPrioritizedBirthNumbersWithMetadata,
      ).toHaveBeenCalledWith(TaxType.DZN, currentYear, 2020, true)
    })

    it('should import newly created users immediately regardless of window or limit', async () => {
      const mockTaxImportHelper = service['taxImportHelperService']
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

      // Newly created users should be imported immediately for all years
      expect(importTaxesSpy).toHaveBeenCalledWith(
        TaxType.DZN,
        newlyCreated,
        currentYear,
      )
      // Other users should be prepared (since outside window and over limit)
      expect(prepareTaxesSpy).toHaveBeenCalledWith(
        TaxType.DZN,
        birthNumbers,
        currentYear,
      )
      // Import called for both DZN and KO for each year from 2020 to current year
      const yearCount = currentYear - 2020 + 1
      expect(importTaxesSpy).toHaveBeenCalledTimes(yearCount * 2)
    })

    it('should import newly created users immediately when outside window and under limit', async () => {
      const mockTaxImportHelper = service['taxImportHelperService']
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
      expect(importTaxesSpy).toHaveBeenCalledWith(
        TaxType.DZN,
        newlyCreated,
        currentYear,
      )
      // Other users should be prepared (since outside window and under limit)
      expect(prepareTaxesSpy).toHaveBeenCalledWith(
        TaxType.DZN,
        birthNumbers,
        currentYear,
      )
      // Import called for both DZN and KO for each year from 2020 to current year
      const yearCount = currentYear - 2020 + 1
      expect(importTaxesSpy).toHaveBeenCalledTimes(yearCount * 2)
    })

    it('should import newly created users immediately when within window and over limit', async () => {
      const mockTaxImportHelper = service['taxImportHelperService']
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
      expect(importTaxesSpy).toHaveBeenCalledWith(
        TaxType.DZN,
        newlyCreated,
        currentYear,
      )
      // Other users should be prepared (since within window and over limit)
      expect(prepareTaxesSpy).toHaveBeenCalledWith(
        TaxType.DZN,
        birthNumbers,
        currentYear,
      )
      // Import called for both DZN and KO for each year from 2020 to current year
      const yearCount = currentYear - 2020 + 1
      expect(importTaxesSpy).toHaveBeenCalledTimes(yearCount * 2)
    })

    it('should import newly created users even when within window and under limit', async () => {
      const mockTaxImportHelper = service['taxImportHelperService']
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
        TaxType.DZN,
        newlyCreated,
        expect.any(Number),
      )
      expect(importTaxesSpy).toHaveBeenCalledWith(
        TaxType.DZN,
        birthNumbers,
        expect.any(Number),
      )
      // Import called for both DZN and KO for each year from 2020 to current year, plus one import for birthNumbers
      const yearCount = currentYear - 2020 + 1
      expect(importTaxesSpy).toHaveBeenCalledTimes(yearCount * 2 + 1)
      expect(prepareTaxesSpy).not.toHaveBeenCalled()
    })

    it('should process remaining users based on window and limit when no newly created users', async () => {
      const mockTaxImportHelper = service['taxImportHelperService']
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
        TaxType.DZN,
        birthNumbers,
        expect.any(Number),
      )
      expect(importTaxesSpy).toHaveBeenCalledTimes(1)
    })

    it('should prepare remaining users when outside window or over limit', async () => {
      const mockTaxImportHelper = service['taxImportHelperService']
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
      expect(importTaxesSpy).toHaveBeenCalledWith(
        TaxType.DZN,
        newlyCreated,
        currentYear,
      )
      // Other users should be prepared (outside window)
      expect(prepareTaxesSpy).toHaveBeenCalledWith(
        TaxType.DZN,
        birthNumbers,
        currentYear,
      )
    })

    it('should return early when no birth numbers found', async () => {
      const mockTaxImportHelper = service['taxImportHelperService']

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
      const mockTaxImportHelper = service['taxImportHelperService']
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

      expect(importTaxesSpy).toHaveBeenCalledWith(
        TaxType.DZN,
        newlyCreated,
        currentYear,
      )
      // Import called for both DZN and KO for each year from 2020 to current year
      const yearCount = currentYear - 2020 + 1
      expect(importTaxesSpy).toHaveBeenCalledTimes(yearCount * 2)
      expect(prepareTaxesSpy).not.toHaveBeenCalled()
    })

    it('should handle KO tax type on second call', async () => {
      const mockTaxImportHelper = service['taxImportHelperService']
      const birthNumbers = ['987654/3210']

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

      // First call (DZN)
      await service.loadTaxesForUsers()

      // Second call should use KO
      await service.loadTaxesForUsers()

      expect(importTaxesSpy).toHaveBeenCalledWith(
        TaxType.KO,
        birthNumbers,
        currentYear,
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

      const updateOverpaymentsDataFromNorisByDateRangeSpy = jest.spyOn(
        service['norisService'],
        'updateOverpaymentsDataFromNorisByDateRange',
      )

      await expect(service.loadOverpaymentsFromNoris()).rejects.toThrow()

      expect(
        updateOverpaymentsDataFromNorisByDateRangeSpy,
      ).not.toHaveBeenCalled()
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

      await expect(service.loadOverpaymentsFromNoris()).rejects.toThrow()

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

      await expect(service.loadOverpaymentsFromNoris()).rejects.toThrow()

      expect(configSubserviceMock).toHaveBeenCalled()
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

      await expect(service.loadOverpaymentsFromNoris()).rejects.toThrow(
        'Failed to load overpayments from Noris after all retry attempts',
      )
    })
  })
})
