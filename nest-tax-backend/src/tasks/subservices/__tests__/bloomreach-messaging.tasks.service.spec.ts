/* eslint-disable no-secrets/no-secrets */
import { createMock } from '@golevelup/ts-jest'
import { Test, TestingModule } from '@nestjs/testing'
import { PaymentStatus } from '@prisma/client'
import noop from 'lodash/noop'

import prismaMock from '../../../../test/singleton'
import { BloomreachService } from '../../../bloomreach/bloomreach.service'
import { PaymentService } from '../../../payment/payment.service'
import { PrismaService } from '../../../prisma/prisma.service'
import { CityAccountSubservice } from '../../../utils/subservices/cityaccount.subservice'
import BloomreachMessagingTasksService from '../bloomreach-messaging.tasks.service'

// Mock p-limit to return a function that executes the passed function immediately
const mockPLimitFn = (fn: () => Promise<any>) => fn()
jest.mock('p-limit', () => {
  return jest.fn(() => mockPLimitFn)
})

describe('BloomreachMessagingTasksService', () => {
  let service: BloomreachMessagingTasksService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BloomreachMessagingTasksService,
        { provide: PrismaService, useValue: prismaMock },
        {
          provide: CityAccountSubservice,
          useValue: createMock<CityAccountSubservice>(),
        },
        {
          provide: BloomreachService,
          useValue: createMock<BloomreachService>(),
        },
        {
          provide: PaymentService,
          useValue: createMock<PaymentService>(),
        },
      ],
    }).compile()

    service = module.get<BloomreachMessagingTasksService>(
      BloomreachMessagingTasksService,
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
        .mockResolvedValue(undefined)

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
        .mockResolvedValueOnce(undefined)
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

/* eslint-enable no-secrets/no-secrets */
