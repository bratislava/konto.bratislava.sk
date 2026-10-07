import {
  ErrorEnum,
  ErrorFactoryService,
  LineLoggerService,
} from '@bratislava/log-nest'
import { createMock } from '@golevelup/ts-vitest'
import { Test, TestingModule } from '@nestjs/testing'

import prismaMock from '../../../test/singleton'
import { PrismaService } from '../../prisma/prisma.service'
import { NORIS_SILENT_CONNECTION_ERRORS_KEY } from '../../utils/constants'
import alertReporting from '../../utils/constants/error.alerts'
import DatabaseSubservice from '../../utils/subservices/database.subservice'
import CityAccountIngestionTasksService from '../subservices/city-account-ingestion.tasks.service'
import NorisSyncTasksService from '../subservices/noris-sync.tasks.service'
import NotificationsEventsService from '../subservices/notifications-events.service'
import ReportingTasksService from '../subservices/reporting.tasks.service'
import TaxImportTasksService from '../subservices/tax-import.tasks.service'
import { TasksService } from '../tasks.service'

describe('TasksService', () => {
  const errorFactoryService = new ErrorFactoryService({ alertReporting })
  let service: TasksService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        { provide: ErrorFactoryService, useValue: errorFactoryService },
        {
          provide: ReportingTasksService,
          useValue: createMock<ReportingTasksService>(),
        },
        {
          provide: NorisSyncTasksService,
          useValue: createMock<NorisSyncTasksService>(),
        },
        {
          provide: CityAccountIngestionTasksService,
          useValue: createMock<CityAccountIngestionTasksService>(),
        },
        {
          provide: TaxImportTasksService,
          useValue: createMock<TaxImportTasksService>(),
        },
        {
          provide: NotificationsEventsService,
          useValue: createMock<NotificationsEventsService>(),
        },
        {
          provide: DatabaseSubservice,
          useValue: createMock<DatabaseSubservice>(),
        },
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile()

    service = module.get<TasksService>(TasksService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('alertSilentNorisConnectionErrors', () => {
    it('should return without throwing when numberOfErrors is 0', async () => {
      vi.mocked(
        service['databaseSubservice'].getConfigByKeys,
      ).mockResolvedValue({
        [NORIS_SILENT_CONNECTION_ERRORS_KEY]: '0',
      })

      const updateManySpy = vi
        .mocked(service['prismaService'].config.updateMany)
        .mockResolvedValue({ count: 0 })
      const errorFactoryServiceSpy = vi.spyOn(
        errorFactoryService,
        'InternalServerErrorException',
      )

      await service.alertSilentNorisConnectionErrors()

      expect(updateManySpy).toHaveBeenCalledWith({
        where: { key: NORIS_SILENT_CONNECTION_ERRORS_KEY },
        data: { value: '0' },
      })
      expect(errorFactoryServiceSpy).not.toHaveBeenCalled()
    })

    it('should return without throwing when numberOfErrors is below threshold', async () => {
      vi.mocked(
        service['databaseSubservice'].getConfigByKeys,
      ).mockResolvedValue({
        [NORIS_SILENT_CONNECTION_ERRORS_KEY]: '19',
      })

      const updateManySpy = vi
        .mocked(service['prismaService'].config.updateMany)
        .mockResolvedValue({ count: 0 })
      const errorFactoryServiceSpy = vi.spyOn(
        errorFactoryService,
        'InternalServerErrorException',
      )

      await service.alertSilentNorisConnectionErrors()

      expect(updateManySpy).toHaveBeenCalledWith({
        where: { key: NORIS_SILENT_CONNECTION_ERRORS_KEY },
        data: { value: '0' },
      })
      expect(errorFactoryServiceSpy).not.toHaveBeenCalled()
    })

    it('should throw when config value is invalid (NaN)', async () => {
      const invalidValue = 'not-a-number'
      vi.mocked(
        service['databaseSubservice'].getConfigByKeys,
      ).mockResolvedValue({
        [NORIS_SILENT_CONNECTION_ERRORS_KEY]: invalidValue,
      })

      // @HandleErrors creates its own logger, so it can only be spied on via the prototype
      const loggerErrorSpy = vi
        .spyOn(LineLoggerService.prototype, 'error')
        .mockImplementation(vi.fn())

      // Method is decorated with @HandleErrors, so it catches the error, logs it and returns null
      await expect(
        service.alertSilentNorisConnectionErrors(),
      ).resolves.toBeNull()
      expect(loggerErrorSpy).toHaveBeenCalledWith(
        errorFactoryService.InternalServerErrorException({
          errorEnum: ErrorEnum.INTERNAL_SERVER_ERROR,
          message: `Invalid ${NORIS_SILENT_CONNECTION_ERRORS_KEY} value: ${invalidValue}. Must be a number.`,
        }),
        { methodName: 'alertSilentNorisConnectionErrors' },
      )
    })

    it('should reset config to 0 and throw when numberOfErrors is at or above threshold', async () => {
      const numberOfErrors = 25
      vi.mocked(
        service['databaseSubservice'].getConfigByKeys,
      ).mockResolvedValue({
        [NORIS_SILENT_CONNECTION_ERRORS_KEY]: numberOfErrors.toString(),
      })

      const updateManySpy = vi
        .mocked(service['prismaService'].config.updateMany)
        .mockResolvedValue({ count: 1 })
      // @HandleErrors creates its own logger, so it can only be spied on via the prototype
      const loggerErrorSpy = vi
        .spyOn(LineLoggerService.prototype, 'error')
        .mockImplementation(vi.fn())

      // Method is decorated with @HandleErrors, so it catches the error, logs it and returns null
      await expect(
        service.alertSilentNorisConnectionErrors(),
      ).resolves.toBeNull()
      expect(updateManySpy).toHaveBeenCalledWith({
        where: { key: NORIS_SILENT_CONNECTION_ERRORS_KEY },
        data: { value: '0' },
      })
      expect(loggerErrorSpy).toHaveBeenCalledWith(
        errorFactoryService.InternalServerErrorException({
          errorEnum: ErrorEnum.INTERNAL_SERVER_ERROR,
          message: `Number of silenced Noris connection errors in last 24 hours is ${numberOfErrors}.`,
        }),
        { methodName: 'alertSilentNorisConnectionErrors' },
      )
    })
  })
})
