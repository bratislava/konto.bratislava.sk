import { createMock } from '@golevelup/ts-jest'
import { Test, TestingModule } from '@nestjs/testing'

import { AdminService } from '../../admin/admin.service'
import { PrismaService } from '../../prisma/prisma.service'
import ThrowerErrorGuard from '../../utils/guards/errors.guard'
import { TasksService } from '../tasks.service'
import { CardPaymentReportingService } from '../../card-payment-reporting/card-payment-reporting.service'

describe('TasksService', () => {
  let service: TasksService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        ThrowerErrorGuard,
        { provide: AdminService, useValue: createMock<AdminService>() },
        { provide: PrismaService, useValue: createMock<PrismaService>() },
        { provide: CardPaymentReportingService, useValue: createMock<CardPaymentReportingService>() },
      ],
    }).compile()

    service = module.get<TasksService>(TasksService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
