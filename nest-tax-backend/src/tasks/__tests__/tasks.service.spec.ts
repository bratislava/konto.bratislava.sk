import { createMock } from '@golevelup/ts-jest'
import { Test, TestingModule } from '@nestjs/testing'

import { BloomreachService } from '../../bloomreach/bloomreach.service'
import { CardPaymentReportingService } from '../../card-payment-reporting/card-payment-reporting.service'
import { NorisService } from '../../noris/noris.service'
import { PrismaService } from '../../prisma/prisma.service'
import ThrowerErrorGuard from '../../utils/guards/errors.guard'
import { CityAccountSubservice } from '../../utils/subservices/cityaccount.subservice'
import DatabaseSubservice from '../../utils/subservices/database.subservice'
import { TasksService } from '../tasks.service'

describe('TasksService', () => {
  let service: TasksService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        ThrowerErrorGuard,
        { provide: NorisService, useValue: createMock<NorisService>() },
        { provide: PrismaService, useValue: createMock<PrismaService>() },
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
          provide: BloomreachService,
          useValue: createMock<BloomreachService>(),
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
})
