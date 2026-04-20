import { createMock } from '@golevelup/ts-jest'
import { HttpException, HttpStatus } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'

import prismaMock from '../../../test/singleton'
import { PrismaService } from '../../prisma/prisma.service'
import { NORIS_SILENT_CONNECTION_ERRORS_KEY } from '../../utils/constants'
import { ErrorsEnum } from '../../utils/guards/dtos/error.dto'
import ThrowerErrorGuard from '../../utils/guards/errors.guard'
import DatabaseSubservice from '../../utils/subservices/database.subservice'
import CityAccountIngestionTasksService from '../subservices/city-account-ingestion.tasks.service'
import NorisSyncTasksService from '../subservices/noris-sync.tasks.service'
import NotificationsEventsService from '../subservices/notifications-events.service'
import ReportingTasksService from '../subservices/reporting.tasks.service'
import TaxImportTasksService from '../subservices/tax-import.tasks.service'
import { TasksService } from '../tasks.service'

describe('TasksService', () => {
  let service: TasksService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        { provide: ConfigService, useValue: createMock<ConfigService>() },
        ThrowerErrorGuard,
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
      jest
        .spyOn(service['databaseSubservice'], 'getConfigByKeys')
        .mockResolvedValue({
          [NORIS_SILENT_CONNECTION_ERRORS_KEY]: '0',
        })

      const updateManySpy = jest
        .spyOn(service['prismaService'].config, 'updateMany')
        .mockResolvedValue({ count: 0 })
      const throwerErrorGuardSpy = jest.spyOn(
        service['throwerErrorGuard'],
        'InternalServerErrorException',
      )

      await service.alertSilentNorisConnectionErrors()

      expect(updateManySpy).toHaveBeenCalledWith({
        where: { key: NORIS_SILENT_CONNECTION_ERRORS_KEY },
        data: { value: '0' },
      })
      expect(throwerErrorGuardSpy).not.toHaveBeenCalled()
    })

    it('should return without throwing when numberOfErrors is below threshold', async () => {
      jest
        .spyOn(service['databaseSubservice'], 'getConfigByKeys')
        .mockResolvedValue({
          [NORIS_SILENT_CONNECTION_ERRORS_KEY]: '19',
        })

      const updateManySpy = jest
        .spyOn(service['prismaService'].config, 'updateMany')
        .mockResolvedValue({ count: 0 })
      const throwerErrorGuardSpy = jest.spyOn(
        service['throwerErrorGuard'],
        'InternalServerErrorException',
      )

      await service.alertSilentNorisConnectionErrors()

      expect(updateManySpy).toHaveBeenCalledWith({
        where: { key: NORIS_SILENT_CONNECTION_ERRORS_KEY },
        data: { value: '0' },
      })
      expect(throwerErrorGuardSpy).not.toHaveBeenCalled()
    })

    it('should throw when config value is invalid (NaN)', async () => {
      const invalidValue = 'not-a-number'
      jest
        .spyOn(service['databaseSubservice'], 'getConfigByKeys')
        .mockResolvedValue({
          [NORIS_SILENT_CONNECTION_ERRORS_KEY]: invalidValue,
        })

      const throwerErrorGuardSpy = jest
        .spyOn(service['throwerErrorGuard'], 'InternalServerErrorException')
        .mockReturnValue(
          new HttpException(
            'Internal Server Error',
            HttpStatus.INTERNAL_SERVER_ERROR,
          ),
        )

      // Method is decorated with @HandleErrors, so it catches the error and returns null
      await service.alertSilentNorisConnectionErrors()
      expect(throwerErrorGuardSpy).toHaveBeenCalledWith(
        ErrorsEnum.INTERNAL_SERVER_ERROR,
        `Invalid ${NORIS_SILENT_CONNECTION_ERRORS_KEY} value: ${invalidValue}. Must be a number.`,
      )
    })

    it('should reset config to 0 and throw when numberOfErrors is at or above threshold', async () => {
      jest
        .spyOn(service['databaseSubservice'], 'getConfigByKeys')
        .mockResolvedValue({
          [NORIS_SILENT_CONNECTION_ERRORS_KEY]: '25',
        })

      const updateManySpy = jest
        .spyOn(service['prismaService'].config, 'updateMany')
        .mockResolvedValue({ count: 1 })
      const throwerErrorGuardSpy = jest
        .spyOn(service['throwerErrorGuard'], 'InternalServerErrorException')
        .mockReturnValue(
          new HttpException(
            'Internal Server Error',
            HttpStatus.INTERNAL_SERVER_ERROR,
          ),
        )

      // Method is decorated with @HandleErrors, so it catches the error and returns null
      await service.alertSilentNorisConnectionErrors()
      expect(updateManySpy).toHaveBeenCalledWith({
        where: { key: NORIS_SILENT_CONNECTION_ERRORS_KEY },
        data: { value: '0' },
      })
      expect(throwerErrorGuardSpy).toHaveBeenCalledWith(
        ErrorsEnum.INTERNAL_SERVER_ERROR,
        'Number of silenced Noris connection errors in last 24 hours is 25.',
      )
    })
  })
})
