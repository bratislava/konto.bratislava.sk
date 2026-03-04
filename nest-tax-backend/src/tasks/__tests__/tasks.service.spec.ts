import { createMock } from '@golevelup/ts-jest'
import { ConfigService } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'

import ThrowerErrorGuard from '../../utils/guards/errors.guard'
import BloomreachMessagingTasksService from '../subservices/bloomreach-messaging.tasks.service'
import CityAccountIngestionTasksService from '../subservices/city-account-ingestion.tasks.service'
import NorisSyncTasksService from '../subservices/noris-sync.tasks.service'
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
          provide: BloomreachMessagingTasksService,
          useValue: createMock<BloomreachMessagingTasksService>(),
        },
        {
          provide: TaxImportTasksService,
          useValue: createMock<TaxImportTasksService>(),
        },
      ],
    }).compile()

    service = module.get<TasksService>(TasksService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
