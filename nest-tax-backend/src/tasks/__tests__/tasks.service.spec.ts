import { createMock } from '@golevelup/ts-jest'
import { Test, TestingModule } from '@nestjs/testing'
import { DeliveryMethodNamed } from '@prisma/client'

import { AdminService } from '../../admin/admin.service'
import { BloomreachService } from '../../bloomreach/bloomreach.service'
import { CardPaymentReportingService } from '../../card-payment-reporting/card-payment-reporting.service'
import { PrismaService } from '../../prisma/prisma.service'
import ThrowerErrorGuard from '../../utils/guards/errors.guard'
import { CityAccountSubservice } from '../../utils/subservices/cityaccount.subservice'
import { TasksService } from '../tasks.service'

describe('TasksService', () => {
  let service: TasksService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        ThrowerErrorGuard,
        { provide: AdminService, useValue: createMock<AdminService>() },
        { provide: PrismaService, useValue: createMock<PrismaService>() },
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

  describe('setUnpaidTaxReminders', () => {
    it('should not do anything when there are no taxes', async () => {
      const findManyMock = jest
        .spyOn(service['prismaService'].tax, 'findMany')
        .mockResolvedValue([])
      const trackEventUnpaidTaxReminderMock = jest.spyOn(
        service['bloomreachService'],
        'trackEventUnpaidTaxReminder',
      )

      await service.setUnpaidTaxReminders()

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
            deliveryMethod: DeliveryMethodNamed.POSTAL,
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

      await service.setUnpaidTaxReminders()

      expect(findManyMock).toHaveBeenCalled()
      expect(trackEventUnpaidTaxReminderMock).toHaveBeenCalledWith(
        {
          year: 2024,
          delivery_method: DeliveryMethodNamed.POSTAL,
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
            deliveryMethod: DeliveryMethodNamed.POSTAL,
            taxPayer: {
              birthNumber: '123456/7890',
            },
          },
          {
            id: 2,
            year: 2024,
            deliveryMethod: DeliveryMethodNamed.CITY_ACCOUNT,
            taxPayer: {
              birthNumber: '123456/7891',
            },
          },
          {
            id: 3,
            year: 2024,
            deliveryMethod: DeliveryMethodNamed.EDESK,
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

      await service.setUnpaidTaxReminders()

      expect(findManyMock).toHaveBeenCalled()
      expect(trackEventUnpaidTaxReminderMock).toHaveBeenCalledTimes(2)
      expect(trackEventUnpaidTaxReminderMock).toHaveBeenCalledWith(
        {
          year: 2024,
          delivery_method: DeliveryMethodNamed.POSTAL,
        },
        'external-id-1',
      )
      expect(trackEventUnpaidTaxReminderMock).toHaveBeenCalledWith(
        {
          year: 2024,
          delivery_method: DeliveryMethodNamed.CITY_ACCOUNT,
        },
        'external-id-2',
      )
    })
  })
})
