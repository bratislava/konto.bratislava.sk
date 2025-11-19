import { Test, TestingModule } from '@nestjs/testing'

import prismaMock from '../../../../test/singleton'
import { CreateBirthNumbersResponseDto } from '../../../admin/dtos/responses.dto'
import { NorisService } from '../../../noris/noris.service'
import { PrismaService } from '../../../prisma/prisma.service'
import DatabaseSubservice from '../../../utils/subservices/database.subservice'
import { LineLoggerSubservice } from '../../../utils/subservices/line-logger.subservice'
import TaxImportHelperSubservice from '../tax-import-helper.subservice'

describe('TaxImportHelperSubservice', () => {
  let service: TaxImportHelperSubservice
  let prismaService: PrismaService
  let databaseSubservice: DatabaseSubservice
  let norisService: NorisService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaxImportHelperSubservice,
        { provide: PrismaService, useValue: prismaMock },
        {
          provide: DatabaseSubservice,
          useValue: {
            getConfigByKeys: jest.fn(),
          },
        },
        {
          provide: NorisService,
          useValue: {
            getAndProcessNewNorisTaxDataByBirthNumberAndYear: jest.fn(),
          },
        },
      ],
    }).compile()

    service = module.get<TaxImportHelperSubservice>(TaxImportHelperSubservice)
    prismaService = module.get<PrismaService>(PrismaService)
    databaseSubservice = module.get<DatabaseSubservice>(DatabaseSubservice)
    norisService = module.get<NorisService>(NorisService)

    jest.spyOn(LineLoggerSubservice.prototype, 'log').mockImplementation()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('isWithinImportWindow', () => {
    beforeEach(() => {
      jest.useFakeTimers()
    })

    afterEach(() => {
      jest.useRealTimers()
      jest.clearAllMocks()
    })

    it('should return true when current time is within the window (7-20)', async () => {
      // Set time to 12:00 in Bratislava (UTC+1 in winter, UTC+2 in summer)
      // Using a date in January (winter time, UTC+1)
      // 12:00 CET = 11:00 UTC
      jest.setSystemTime(new Date('2025-01-15T11:00:00.000Z'))

      const mockConfig = {
        TAX_IMPORT_WINDOW_START_HOUR: '7',
        TAX_IMPORT_WINDOW_END_HOUR: '20',
      }
      jest
        .spyOn(databaseSubservice, 'getConfigByKeys')
        .mockResolvedValue(mockConfig as any)

      const result = await service.isWithinImportWindow()

      expect(result).toBe(true)
      expect(databaseSubservice.getConfigByKeys).toHaveBeenCalledWith([
        'TAX_IMPORT_WINDOW_START_HOUR',
        'TAX_IMPORT_WINDOW_END_HOUR',
      ])
    })

    it('should return false when current time is before the window', async () => {
      // Set time to 6:00 in Bratislava (before 7:00 start)
      // 6:00 CET = 5:00 UTC
      jest.setSystemTime(new Date('2025-01-15T05:00:00.000Z'))

      const mockConfig = {
        TAX_IMPORT_WINDOW_START_HOUR: '7',
        TAX_IMPORT_WINDOW_END_HOUR: '20',
      }
      jest
        .spyOn(databaseSubservice, 'getConfigByKeys')
        .mockResolvedValue(mockConfig as any)

      const result = await service.isWithinImportWindow()

      expect(result).toBe(false)
    })

    it('should return false when current time is after the window', async () => {
      // Set time to 21:00 in Bratislava (after 20:00 end)
      // 21:00 CET = 20:00 UTC
      jest.setSystemTime(new Date('2025-01-15T20:00:00.000Z'))

      const mockConfig = {
        TAX_IMPORT_WINDOW_START_HOUR: '7',
        TAX_IMPORT_WINDOW_END_HOUR: '20',
      }
      jest
        .spyOn(databaseSubservice, 'getConfigByKeys')
        .mockResolvedValue(mockConfig as any)

      const result = await service.isWithinImportWindow()

      expect(result).toBe(false)
    })

    it('should return true when current time is exactly at start hour', async () => {
      // Set time to 7:00 in Bratislava (exactly at start)
      // 7:00 CET = 6:00 UTC
      jest.setSystemTime(new Date('2025-01-15T06:00:00.000Z'))

      const mockConfig = {
        TAX_IMPORT_WINDOW_START_HOUR: '7',
        TAX_IMPORT_WINDOW_END_HOUR: '20',
      }
      jest
        .spyOn(databaseSubservice, 'getConfigByKeys')
        .mockResolvedValue(mockConfig as any)

      const result = await service.isWithinImportWindow()

      expect(result).toBe(true)
    })

    it('should return false when current time is exactly at end hour', async () => {
      // Set time to 20:00 in Bratislava (exactly at end, should be excluded)
      // 20:00 CET = 19:00 UTC
      jest.setSystemTime(new Date('2025-01-15T19:00:00.000Z'))

      const mockConfig = {
        TAX_IMPORT_WINDOW_START_HOUR: '7',
        TAX_IMPORT_WINDOW_END_HOUR: '20',
      }
      jest
        .spyOn(databaseSubservice, 'getConfigByKeys')
        .mockResolvedValue(mockConfig as any)

      const result = await service.isWithinImportWindow()

      expect(result).toBe(false)
    })

    it('should handle summer time (CEST) correctly', async () => {
      // Set time to 12:00 in Bratislava during summer (CEST, UTC+2)
      // 12:00 CEST = 10:00 UTC
      // Using a date in July (summer time)
      jest.setSystemTime(new Date('2025-07-15T10:00:00.000Z'))

      const mockConfig = {
        TAX_IMPORT_WINDOW_START_HOUR: '7',
        TAX_IMPORT_WINDOW_END_HOUR: '20',
      }
      jest
        .spyOn(databaseSubservice, 'getConfigByKeys')
        .mockResolvedValue(mockConfig as any)

      const result = await service.isWithinImportWindow()

      expect(result).toBe(true)
    })

    it('should propagate error when getConfigByKeys fails', async () => {
      jest.setSystemTime(new Date('2025-01-15T11:00:00.000Z'))

      const error = new Error('Database connection failed')
      jest.spyOn(databaseSubservice, 'getConfigByKeys').mockRejectedValue(error)

      await expect(service.isWithinImportWindow()).rejects.toThrow(error)
    })
  })

  describe('getTodayTaxCount', () => {
    beforeEach(() => {
      jest.useFakeTimers()
    })

    afterEach(() => {
      jest.useRealTimers()
      jest.clearAllMocks()
    })

    it('should return count of taxes created today', async () => {
      // Set time to 12:00 in Bratislava (UTC+1 in winter, UTC+2 in summer)
      // Using a date in January (winter time, UTC+1)
      // 12:00 CET = 11:00 UTC
      const testDate = new Date('2025-01-15T11:00:00.000Z')
      jest.setSystemTime(testDate)

      const mockCount = 150
      const countSpy = jest
        .spyOn(prismaService.tax, 'count')
        .mockResolvedValue(mockCount)

      const result = await service.getTodayTaxCount()

      expect(result).toBe(mockCount)

      // Verify the exact dates: gte should be start of day, lte should be end of day in Bratislava timezone
      // 2025-01-15 00:00:00 CET = 2025-01-14 23:00:00 UTC
      // 2025-01-15 23:59:59.999 CET = 2025-01-15 22:59:59.999 UTC
      const expectedGte = new Date('2025-01-14T23:00:00.000Z') // Start of day in Bratislava
      const expectedLte = new Date('2025-01-15T22:59:59.999Z') // End of day in Bratislava

      expect(countSpy).toHaveBeenCalledWith({
        where: {
          createdAt: {
            gte: expectedGte,
            lte: expectedLte,
          },
        },
      })
    })

    it('should return 0 when no taxes created today', async () => {
      // Set time to 12:00 in Bratislava
      jest.setSystemTime(new Date('2025-01-15T11:00:00.000Z'))

      jest.spyOn(prismaService.tax, 'count').mockResolvedValue(0)

      const result = await service.getTodayTaxCount()

      expect(result).toBe(0)
    })

    it('should propagate error when database count fails', async () => {
      jest.setSystemTime(new Date('2025-01-15T11:00:00.000Z'))

      const error = new Error('Database query failed')
      jest.spyOn(prismaService.tax, 'count').mockRejectedValue(error)

      await expect(service.getTodayTaxCount()).rejects.toThrow(error)
    })
  })

  describe('markAsReadyToImport', () => {
    it('should mark birth numbers as ready to import', async () => {
      const birthNumbers = ['123456/7890', '987654/3210']
      const updateManySpy = jest
        .spyOn(prismaService.taxPayer, 'updateMany')
        .mockResolvedValue({ count: 2 })

      await service.markAsReadyToImport(birthNumbers)

      expect(updateManySpy).toHaveBeenCalledWith({
        where: {
          birthNumber: { in: birthNumbers },
        },
        data: {
          readyToImport: true,
        },
      })
    })

    it('should not call updateMany when birth numbers array is empty', async () => {
      const updateManySpy = jest.spyOn(prismaService.taxPayer, 'updateMany')

      await service.markAsReadyToImport([])

      expect(updateManySpy).not.toHaveBeenCalled()
    })

    it('should propagate error when updateMany fails', async () => {
      const birthNumbers = ['123456/7890', '987654/3210']
      const error = new Error('Database update failed')
      jest.spyOn(prismaService.taxPayer, 'updateMany').mockRejectedValue(error)

      await expect(service.markAsReadyToImport(birthNumbers)).rejects.toThrow(
        error,
      )
    })
  })

  describe('clearReadyToImport', () => {
    it('should clear readyToImport flag for birth numbers', async () => {
      const birthNumbers = ['123456/7890', '987654/3210']
      const updateManySpy = jest
        .spyOn(prismaService.taxPayer, 'updateMany')
        .mockResolvedValue({ count: 2 })

      await service.clearReadyToImport(birthNumbers)

      expect(updateManySpy).toHaveBeenCalledWith({
        where: {
          birthNumber: { in: birthNumbers },
        },
        data: {
          readyToImport: false,
        },
      })
    })

    it('should not call updateMany when birth numbers array is empty', async () => {
      const updateManySpy = jest.spyOn(prismaService.taxPayer, 'updateMany')

      await service.clearReadyToImport([])

      expect(updateManySpy).not.toHaveBeenCalled()
    })

    it('should propagate error when updateMany fails', async () => {
      const birthNumbers = ['123456/7890', '987654/3210']
      const error = new Error('Database update failed')
      jest.spyOn(prismaService.taxPayer, 'updateMany').mockRejectedValue(error)

      await expect(service.clearReadyToImport(birthNumbers)).rejects.toThrow(
        error,
      )
    })
  })

  describe('getDailyTaxLimit', () => {
    it('should return daily tax limit from config', async () => {
      const mockConfig = {
        TAX_IMPORT_DAILY_LIMIT: '7200',
      }
      jest
        .spyOn(databaseSubservice, 'getConfigByKeys')
        .mockResolvedValue(mockConfig as any)

      const result = await service.getDailyTaxLimit()

      expect(result).toBe(7200)
      expect(databaseSubservice.getConfigByKeys).toHaveBeenCalledWith([
        'TAX_IMPORT_DAILY_LIMIT',
      ])
    })

    it('should parse string config value to number', async () => {
      const mockConfig = {
        TAX_IMPORT_DAILY_LIMIT: '5000',
      }
      jest
        .spyOn(databaseSubservice, 'getConfigByKeys')
        .mockResolvedValue(mockConfig as any)

      const result = await service.getDailyTaxLimit()

      expect(result).toBe(5000)
    })

    it('should propagate error when getConfigByKeys fails', async () => {
      const error = new Error('Database connection failed')
      jest.spyOn(databaseSubservice, 'getConfigByKeys').mockRejectedValue(error)

      await expect(service.getDailyTaxLimit()).rejects.toThrow(error)
    })
  })

  describe('getPrioritizedBirthNumbersWithMetadata', () => {
    it('should return birth numbers and identify newly created users', async () => {
      const year = 2024
      const mockPrioritized = [
        { birthNumber: '123456/7890', isNewlyCreated: true },
        { birthNumber: '987654/3210', isNewlyCreated: false },
        { birthNumber: '111111/2222', isNewlyCreated: true },
      ]
      const queryRawSpy = jest
        .spyOn(prismaService, '$queryRaw')
        .mockResolvedValue(mockPrioritized as any)

      const result = await service.getPrioritizedBirthNumbersWithMetadata(year)

      expect(result.birthNumbers).toEqual([
        '123456/7890',
        '987654/3210',
        '111111/2222',
      ])
      expect(result.newlyCreated).toEqual(['123456/7890', '111111/2222'])
      expect(queryRawSpy).toHaveBeenCalled()
    })

    it('should return empty arrays when no birth numbers found', async () => {
      const year = 2024
      jest.spyOn(prismaService, '$queryRaw').mockResolvedValue([])

      const result = await service.getPrioritizedBirthNumbersWithMetadata(year)

      expect(result.birthNumbers).toEqual([])
      expect(result.newlyCreated).toEqual([])
    })

    it('should return empty newlyCreated array when no newly created users', async () => {
      const year = 2024
      const mockPrioritized = [
        { birthNumber: '123456/7890', isNewlyCreated: false },
        { birthNumber: '987654/3210', isNewlyCreated: false },
      ]
      jest
        .spyOn(prismaService, '$queryRaw')
        .mockResolvedValue(mockPrioritized as any)

      const result = await service.getPrioritizedBirthNumbersWithMetadata(year)

      expect(result.birthNumbers).toEqual(['123456/7890', '987654/3210'])
      expect(result.newlyCreated).toEqual([])
    })

    it('should propagate error when database query fails', async () => {
      const year = 2024
      const error = new Error('Database query failed')
      jest.spyOn(prismaService, '$queryRaw').mockRejectedValue(error)

      await expect(
        service.getPrioritizedBirthNumbersWithMetadata(year),
      ).rejects.toThrow(error)
    })
  })

  describe('importTaxes', () => {
    it('should import taxes and clear readyToImport flags', async () => {
      const birthNumbers = ['123456/7890', '987654/3210']
      const year = 2024
      const mockResult: CreateBirthNumbersResponseDto = {
        birthNumbers: ['123456/7890'],
      }

      jest
        .spyOn(norisService, 'getAndProcessNewNorisTaxDataByBirthNumberAndYear')
        .mockResolvedValue(mockResult)

      const clearReadyToImportSpy = jest
        .spyOn(service, 'clearReadyToImport')
        .mockResolvedValue()

      const updateManySpy = jest
        .spyOn(prismaService.taxPayer, 'updateMany')
        .mockResolvedValue({ count: 1 })

      await service.importTaxes(birthNumbers, year)

      expect(
        norisService.getAndProcessNewNorisTaxDataByBirthNumberAndYear,
      ).toHaveBeenCalledWith({
        year,
        birthNumbers,
        options: {
          prepareOnly: false,
        },
      })
      expect(clearReadyToImportSpy).toHaveBeenCalledWith(['123456/7890'])
      // Only successfully processed birth numbers should have updatedAt updated
      expect(updateManySpy).toHaveBeenCalledWith({
        where: {
          birthNumber: { in: ['123456/7890'] },
        },
        data: {
          updatedAt: expect.any(Date),
        },
      })
    })

    it('should not process when birth numbers array is empty', async () => {
      const getAndProcessSpy = jest.spyOn(
        norisService,
        'getAndProcessNewNorisTaxDataByBirthNumberAndYear',
      )

      await service.importTaxes([], 2024)

      expect(getAndProcessSpy).not.toHaveBeenCalled()
    })

    it('should propagate error when getAndProcessNewNorisTaxDataByBirthNumberAndYear fails', async () => {
      const birthNumbers = ['123456/7890', '987654/3210']
      const year = 2024
      const error = new Error('Noris service failed')
      jest
        .spyOn(norisService, 'getAndProcessNewNorisTaxDataByBirthNumberAndYear')
        .mockRejectedValue(error)

      await expect(service.importTaxes(birthNumbers, year)).rejects.toThrow(
        error,
      )
    })

    it('should propagate error when updateMany fails', async () => {
      const birthNumbers = ['123456/7890', '987654/3210']
      const year = 2024
      const mockResult: CreateBirthNumbersResponseDto = {
        birthNumbers: ['123456/7890'],
      }

      jest
        .spyOn(norisService, 'getAndProcessNewNorisTaxDataByBirthNumberAndYear')
        .mockResolvedValue(mockResult)

      jest.spyOn(service, 'clearReadyToImport').mockResolvedValue()

      const error = new Error('Database update failed')
      jest.spyOn(prismaService.taxPayer, 'updateMany').mockRejectedValue(error)

      await expect(service.importTaxes(birthNumbers, year)).rejects.toThrow(
        error,
      )
    })
  })

  describe('prepareTaxes', () => {
    it('should prepare taxes and mark as ready to import', async () => {
      const birthNumbers = ['123456/7890', '987654/3210']
      const year = 2024
      const mockResult: CreateBirthNumbersResponseDto = {
        birthNumbers: ['123456/7890'],
      }

      jest
        .spyOn(norisService, 'getAndProcessNewNorisTaxDataByBirthNumberAndYear')
        .mockResolvedValue(mockResult)

      const markAsReadySpy = jest
        .spyOn(service, 'markAsReadyToImport')
        .mockResolvedValue()

      await service.prepareTaxes(birthNumbers, year)

      expect(
        norisService.getAndProcessNewNorisTaxDataByBirthNumberAndYear,
      ).toHaveBeenCalledWith({
        year,
        birthNumbers,
        options: {
          prepareOnly: true,
        },
      })
      expect(markAsReadySpy).toHaveBeenCalledWith(['123456/7890'])
    })

    it('should not process when birth numbers array is empty', async () => {
      const getAndProcessSpy = jest.spyOn(
        norisService,
        'getAndProcessNewNorisTaxDataByBirthNumberAndYear',
      )

      await service.prepareTaxes([], 2024)

      expect(getAndProcessSpy).not.toHaveBeenCalled()
    })

    it('should propagate error when getAndProcessNewNorisTaxDataByBirthNumberAndYear fails', async () => {
      const birthNumbers = ['123456/7890', '987654/3210']
      const year = 2024
      const error = new Error('Noris service failed')
      jest
        .spyOn(norisService, 'getAndProcessNewNorisTaxDataByBirthNumberAndYear')
        .mockRejectedValue(error)

      await expect(service.prepareTaxes(birthNumbers, year)).rejects.toThrow(
        error,
      )
    })

    it('should propagate error when markAsReadyToImport fails', async () => {
      const birthNumbers = ['123456/7890', '987654/3210']
      const year = 2024
      const mockResult: CreateBirthNumbersResponseDto = {
        birthNumbers: ['123456/7890'],
      }

      jest
        .spyOn(norisService, 'getAndProcessNewNorisTaxDataByBirthNumberAndYear')
        .mockResolvedValue(mockResult)

      const error = new Error('Database update failed')
      jest.spyOn(service, 'markAsReadyToImport').mockRejectedValue(error)

      await expect(service.prepareTaxes(birthNumbers, year)).rejects.toThrow(
        error,
      )
    })
  })
})
