import { createMock } from '@golevelup/ts-jest'
import { Test, TestingModule } from '@nestjs/testing'

import { AdminService } from '../../admin/admin.service'
import { PrismaService } from '../../prisma/prisma.service'
import { TasksService } from '../tasks.service'

describe('TasksService', () => {
  let service: TasksService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        { provide: AdminService, useValue: createMock<AdminService>() },
        { provide: PrismaService, useValue: createMock<PrismaService>() },
      ],
    }).compile()

    service = module.get<TasksService>(TasksService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})