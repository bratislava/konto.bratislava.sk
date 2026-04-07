import { createMock } from '@golevelup/ts-jest'
import { Test, TestingModule } from '@nestjs/testing'
import { PaymentStatus, TaxType, UnpaidReminderSent } from '@prisma/client'
import dayjs, { type Dayjs } from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'

import prismaMock from '../../../../test/singleton'
import { BloomreachService } from '../../../bloomreach/bloomreach.service'
import { PaymentService } from '../../../payment/payment.service'
import { PrismaService } from '../../../prisma/prisma.service'
import ThrowerErrorGuard from '../../../utils/guards/errors.guard'
import { CityAccountSubservice } from '../../../utils/subservices/cityaccount.subservice'
import { INSTALLMENT_DUE_DATE_TYPE } from '../../utils/types'
import NotificationsEventsService from '../notifications-events.service'

dayjs.extend(utc)
dayjs.extend(timezone)

/** Assert taxInstallment.updateMany was called twice with the given alreadyOtherSent and newReminderSent (and BOTH). */
function assertUpdateManyUsesReminderEnums(
  updateManyMock: jest.SpyInstance,
  alreadyOtherSent: UnpaidReminderSent,
  newReminderSent: UnpaidReminderSent,
): void {
  expect(updateManyMock).toHaveBeenCalledTimes(2)
  const [call1, call2] = updateManyMock.mock.calls
  expect(call1[0].where.bloomreachUnpaidReminderSent).toBe(alreadyOtherSent)
  expect(call1[0].data.bloomreachUnpaidReminderSent).toBe(
    UnpaidReminderSent.BOTH,
  )
  expect(call2[0].where.bloomreachUnpaidReminderSent).toEqual({
    not: alreadyOtherSent,
  })
  expect(call2[0].data.bloomreachUnpaidReminderSent).toBe(newReminderSent)
}

/** Calendar May 31, 2025 in the runner's local TZ — matches service's dueDate.getDate()/getMonth() (not UTC instant from Europe/Bratislava midnight, which is prior UTC day on CI). */
const DEFAULT_ELIGIBLE_INSTALLMENT_DUE_DATE = new Date(2025, 4, 31)

function eligibleInstallmentRow(opts: {
  taxId: number
  taxInstallmentId: number
  order?: number
  dueDate?: Date
}) {
  return {
    taxId: opts.taxId,
    dueDate: opts.dueDate ?? DEFAULT_ELIGIBLE_INSTALLMENT_DUE_DATE,
    order: opts.order ?? 2,
    id: opts.taxInstallmentId,
  }
}

describe('NotificationsEventsSubservice', () => {
  let service: NotificationsEventsService
  let bloomreachService: jest.Mocked<BloomreachService>
  let cityAccountSubservice: jest.Mocked<CityAccountSubservice>

  const currentYear = dayjs().year()

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsEventsService,
        { provide: PrismaService, useValue: prismaMock },
        {
          provide: BloomreachService,
          useValue: createMock<BloomreachService>(),
        },
        {
          provide: CityAccountSubservice,
          useValue: createMock<CityAccountSubservice>(),
        },
        {
          provide: PaymentService,
          useValue: createMock<PaymentService>(),
        },

        ThrowerErrorGuard,
      ],
    }).compile()

    service = module.get(NotificationsEventsService)
    bloomreachService = module.get(BloomreachService)
    cityAccountSubservice = module.get(CityAccountSubservice)

    jest.spyOn(service['logger'], 'log').mockImplementation(() => {})
  })

  describe('processInstallmentReminders', () => {
    const year = 2025

    /** Fixed clock: 2025-06-15 12:00 in Bratislava (CEST), so “today” is 2025-06-15 local. */
    const FIXED_NOW_UTC = new Date('2025-06-15T10:00:00.000Z')

    describe('getTaxInstallmentsEligibleForReminder time window', () => {
      beforeEach(() => {
        jest.useFakeTimers()
        jest.setSystemTime(FIXED_NOW_UTC)
      })

      afterEach(() => {
        jest.useRealTimers()
      })

      it('calls getTaxInstallmentsEligibleForReminder with reminderSentFilter [NONE] when dueDateType is NEXT', async () => {
        const getTaxesSpy = jest
          .spyOn(service as any, 'getTaxInstallmentsEligibleForReminder')
          .mockResolvedValue([])
        prismaMock.tax.findMany.mockResolvedValue([])

        await service['processInstallmentReminders'](
          INSTALLMENT_DUE_DATE_TYPE.NEXT,
          year,
        )

        expect(getTaxesSpy).toHaveBeenCalledTimes(1)
        const [filter, y, windowArg] = getTaxesSpy.mock.calls[0] as [
          UnpaidReminderSent[],
          number,
          { start: Dayjs; end: Dayjs },
        ]
        expect(filter).toEqual([UnpaidReminderSent.NONE])
        expect(y).toBe(year)
        expect(windowArg.start.format('YYYY-MM-DDTHH:mm:ss.SSSZ')).toBe(
          '2025-06-15T00:00:00.000+02:00',
        )
        expect(windowArg.end.format('YYYY-MM-DDTHH:mm:ss.SSSZ')).toBe(
          '2025-06-22T23:59:59.999+02:00',
        )
      })

      it('calls getTaxInstallmentsEligibleForReminder with reminderSentFilter [NONE, BEFORE_DUE] when dueDateType is PAST', async () => {
        const getTaxesSpy = jest
          .spyOn(service as any, 'getTaxInstallmentsEligibleForReminder')
          .mockResolvedValue([])
        prismaMock.tax.findMany.mockResolvedValue([])

        await service['processInstallmentReminders'](
          INSTALLMENT_DUE_DATE_TYPE.PAST,
          year,
        )

        expect(getTaxesSpy).toHaveBeenCalledTimes(1)
        const [filter, y, windowArg] = getTaxesSpy.mock.calls[0] as [
          UnpaidReminderSent[],
          number,
          { start: Dayjs; end: Dayjs },
        ]
        expect(filter).toEqual([
          UnpaidReminderSent.NONE,
          UnpaidReminderSent.BEFORE_DUE,
        ])
        expect(y).toBe(year)
        expect(windowArg.start.format('YYYY-MM-DDTHH:mm:ss.SSSZ')).toBe(
          '2025-06-08T00:00:00.000+02:00',
        )
        expect(windowArg.end.format('YYYY-MM-DDTHH:mm:ss.SSSZ')).toBe(
          '2025-06-15T23:59:59.999+02:00',
        )
      })
    })

    it('does not call trackEvent or updateMany when no eligible taxes', async () => {
      jest
        .spyOn(service as any, 'getTaxInstallmentsEligibleForReminder')
        .mockResolvedValue([])
      prismaMock.tax.findMany.mockResolvedValue([])

      await service['processInstallmentReminders'](
        INSTALLMENT_DUE_DATE_TYPE.NEXT,
        year,
      )

      expect(
        bloomreachService.trackEventUnpaidTaxInstallmentReminder,
      ).not.toHaveBeenCalled()
      expect(prismaMock.taxInstallment.updateMany).not.toHaveBeenCalled()
    })

    it('does not call trackEvent or updateMany when eligible taxes have no externalId (user missing)', async () => {
      const birthNumber = '123456/7890'
      jest
        .spyOn(service as any, 'getTaxInstallmentsEligibleForReminder')
        .mockResolvedValue([
          eligibleInstallmentRow({ taxId: 1, taxInstallmentId: 101 }),
        ])
      prismaMock.tax.findMany.mockResolvedValue([
        {
          id: 1,
          year: 2025,
          type: TaxType.KO,
          order: 1,
          taxPayer: { birthNumber },
        } as any,
      ])
      cityAccountSubservice.getUserDataAdminBatch.mockResolvedValue({} as any)

      await service['processInstallmentReminders'](
        INSTALLMENT_DUE_DATE_TYPE.NEXT,
        year,
      )

      expect(
        bloomreachService.trackEventUnpaidTaxInstallmentReminder,
      ).not.toHaveBeenCalled()
      expect(prismaMock.taxInstallment.updateMany).not.toHaveBeenCalled()
    })

    it('does not call trackEvent when externalId is null', async () => {
      const birthNumber = '123456/7890'
      jest
        .spyOn(service as any, 'getTaxInstallmentsEligibleForReminder')
        .mockResolvedValue([
          eligibleInstallmentRow({ taxId: 1, taxInstallmentId: 101 }),
        ])
      prismaMock.tax.findMany.mockResolvedValue([
        {
          id: 1,
          year: 2025,
          type: TaxType.KO,
          order: 1,
          taxPayer: { birthNumber },
        } as any,
      ])
      cityAccountSubservice.getUserDataAdminBatch.mockResolvedValue({
        [birthNumber]: { externalId: null },
      } as any)

      await service['processInstallmentReminders'](
        INSTALLMENT_DUE_DATE_TYPE.NEXT,
        year,
      )

      expect(
        bloomreachService.trackEventUnpaidTaxInstallmentReminder,
      ).not.toHaveBeenCalled()
      expect(prismaMock.taxInstallment.updateMany).not.toHaveBeenCalled()
    })

    it('calls trackEvent with full payload and updates TaxInstallment with newReminderSent=BEFORE_DUE and alreadyOtherSent=AFTER_DUE when one tax has externalId (BEFORE)', async () => {
      const birthNumber = '123456/7890'
      jest
        .spyOn(service as any, 'getTaxInstallmentsEligibleForReminder')
        .mockResolvedValue([
          eligibleInstallmentRow({ taxId: 1, taxInstallmentId: 101 }),
        ])
      prismaMock.tax.findMany.mockResolvedValue([
        {
          id: 1,
          year: 2025,
          type: TaxType.KO,
          order: 1,
          taxPayer: { birthNumber },
        } as any,
      ])
      cityAccountSubservice.getUserDataAdminBatch.mockResolvedValue({
        [birthNumber]: { externalId: 'ext-1' },
      } as any)
      bloomreachService.trackEventUnpaidTaxInstallmentReminder.mockImplementation(
        async () => Promise.resolve(true),
      )
      prismaMock.taxInstallment.updateMany.mockResolvedValue({ count: 1 })

      await service['processInstallmentReminders'](
        INSTALLMENT_DUE_DATE_TYPE.NEXT,
        year,
      )

      const expectedPayload = {
        year: 2025,
        tax_type: TaxType.KO,
        order: 1,
        installment_order: 2,
        due_date_type: INSTALLMENT_DUE_DATE_TYPE.NEXT,
        due_date_month: 5,
        due_date_day: 31,
      }
      expect(
        bloomreachService.trackEventUnpaidTaxInstallmentReminder,
      ).toHaveBeenCalledTimes(1)
      expect(
        bloomreachService.trackEventUnpaidTaxInstallmentReminder,
      ).toHaveBeenCalledWith(expectedPayload, 'ext-1')

      expect(prismaMock.taxInstallment.updateMany).toHaveBeenCalledTimes(2)
      const updateManySpy = jest.spyOn(prismaMock.taxInstallment, 'updateMany')
      assertUpdateManyUsesReminderEnums(
        updateManySpy,
        UnpaidReminderSent.AFTER_DUE,
        UnpaidReminderSent.BEFORE_DUE,
      )
      expect(updateManySpy).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          where: expect.objectContaining({ id: { in: [101] } }),
          data: { bloomreachUnpaidReminderSent: UnpaidReminderSent.BOTH },
        }),
      )
    })

    it('calls trackEvent with full payload and uses newReminderSent=AFTER_DUE and alreadyOtherSent=BEFORE_DUE when AFTER', async () => {
      const birthNumber = '123456/7890'
      jest
        .spyOn(service as any, 'getTaxInstallmentsEligibleForReminder')
        .mockResolvedValue([
          eligibleInstallmentRow({ taxId: 1, taxInstallmentId: 202 }),
        ])
      prismaMock.tax.findMany.mockResolvedValue([
        {
          id: 1,
          year: 2025,
          type: TaxType.KO,
          order: 1,
          taxPayer: { birthNumber },
        } as any,
      ])
      cityAccountSubservice.getUserDataAdminBatch.mockResolvedValue({
        [birthNumber]: { externalId: 'ext-1' },
      } as any)
      bloomreachService.trackEventUnpaidTaxInstallmentReminder.mockResolvedValue(
        Promise.resolve(true),
      )
      prismaMock.taxInstallment.updateMany.mockResolvedValue({ count: 1 })

      await service['processInstallmentReminders'](
        INSTALLMENT_DUE_DATE_TYPE.PAST,
        year,
      )

      const expectedPayload = {
        year: 2025,
        tax_type: TaxType.KO,
        order: 1,
        installment_order: 2,
        due_date_type: INSTALLMENT_DUE_DATE_TYPE.PAST,
        due_date_month: 5,
        due_date_day: 31,
      }
      expect(
        bloomreachService.trackEventUnpaidTaxInstallmentReminder,
      ).toHaveBeenCalledTimes(1)
      expect(
        bloomreachService.trackEventUnpaidTaxInstallmentReminder,
      ).toHaveBeenCalledWith(expectedPayload, 'ext-1')

      expect(prismaMock.taxInstallment.updateMany).toHaveBeenCalledTimes(2)
      const updateManySpy = jest.spyOn(prismaMock.taxInstallment, 'updateMany')
      assertUpdateManyUsesReminderEnums(
        updateManySpy,
        UnpaidReminderSent.BEFORE_DUE,
        UnpaidReminderSent.AFTER_DUE,
      )
      expect(updateManySpy).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          where: expect.objectContaining({ id: { in: [202] } }),
        }),
      )
    })

    it('calls trackEvent for each tax with full payload and updates all with two updateMany calls', async () => {
      const birth1 = '111111/1111'
      const birth2 = '222222/2222'
      jest
        .spyOn(service as any, 'getTaxInstallmentsEligibleForReminder')
        .mockResolvedValue([
          eligibleInstallmentRow({ taxId: 1, taxInstallmentId: 301 }),
          eligibleInstallmentRow({ taxId: 2, taxInstallmentId: 302 }),
        ])
      prismaMock.tax.findMany.mockResolvedValue([
        {
          id: 1,
          year: 2025,
          type: TaxType.KO,
          order: 1,
          taxPayer: { birthNumber: birth1 },
        } as any,
        {
          id: 2,
          year: 2025,
          type: TaxType.KO,
          order: 2,
          taxPayer: { birthNumber: birth2 },
        } as any,
      ])
      cityAccountSubservice.getUserDataAdminBatch.mockResolvedValue({
        [birth1]: { externalId: 'ext-1' },
        [birth2]: { externalId: 'ext-2' },
      } as any)
      bloomreachService.trackEventUnpaidTaxInstallmentReminder.mockResolvedValue(
        Promise.resolve(true),
      )
      prismaMock.taxInstallment.updateMany.mockResolvedValue({ count: 1 })

      await service['processInstallmentReminders'](
        INSTALLMENT_DUE_DATE_TYPE.NEXT,
        year,
      )

      const expectedPayload1 = {
        year: 2025,
        tax_type: TaxType.KO,
        order: 1,
        installment_order: 2,
        due_date_type: INSTALLMENT_DUE_DATE_TYPE.NEXT,
        due_date_month: 5,
        due_date_day: 31,
      }
      const expectedPayload2 = {
        ...expectedPayload1,
        order: 2,
      }
      expect(
        bloomreachService.trackEventUnpaidTaxInstallmentReminder,
      ).toHaveBeenCalledTimes(2)
      expect(
        bloomreachService.trackEventUnpaidTaxInstallmentReminder,
      ).toHaveBeenNthCalledWith(1, expectedPayload1, 'ext-1')
      expect(
        bloomreachService.trackEventUnpaidTaxInstallmentReminder,
      ).toHaveBeenNthCalledWith(2, expectedPayload2, 'ext-2')
      expect(prismaMock.taxInstallment.updateMany).toHaveBeenCalledTimes(2)
      const updateManySpy = jest.spyOn(prismaMock.taxInstallment, 'updateMany')
      expect(updateManySpy).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          where: expect.objectContaining({ id: { in: [301, 302] } }),
        }),
      )
    })

    it('calls getUserDataAdminBatch with all tax payer birth numbers', async () => {
      const birth1 = '111111/1111'
      const birth2 = '222222/2222'
      jest
        .spyOn(service as any, 'getTaxInstallmentsEligibleForReminder')
        .mockResolvedValue([
          eligibleInstallmentRow({ taxId: 1, taxInstallmentId: 401 }),
          eligibleInstallmentRow({ taxId: 2, taxInstallmentId: 402 }),
        ])
      prismaMock.tax.findMany.mockResolvedValue([
        {
          id: 1,
          taxPayer: { birthNumber: birth1 },
        } as any,
        {
          id: 2,
          taxPayer: { birthNumber: birth2 },
        } as any,
      ])
      cityAccountSubservice.getUserDataAdminBatch.mockResolvedValue({
        [birth1]: { externalId: 'ext-1' },
      } as any)

      await service['processInstallmentReminders'](
        INSTALLMENT_DUE_DATE_TYPE.NEXT,
        year,
      )

      expect(cityAccountSubservice.getUserDataAdminBatch).toHaveBeenCalledWith([
        birth1,
        birth2,
      ])
    })
  })

  describe('sendUnpaidTaxInstallmentReminders', () => {
    beforeEach(() => {
      service['processInstallmentReminders'] = jest.fn()
    })

    afterEach(() => {
      jest.restoreAllMocks()
    })

    it('calls processInstallmentReminders twice (NEXT then PAST) with current year', async () => {
      await service.sendUnpaidTaxInstallmentReminders()

      expect(service['processInstallmentReminders']).toHaveBeenCalledTimes(2)
      expect(service['processInstallmentReminders']).toHaveBeenNthCalledWith(
        1,
        INSTALLMENT_DUE_DATE_TYPE.NEXT,
        currentYear,
      )
      expect(service['processInstallmentReminders']).toHaveBeenNthCalledWith(
        2,
        INSTALLMENT_DUE_DATE_TYPE.PAST,
        currentYear,
      )
    })

    it('runs NEXT and PAST again on a second invocation', async () => {
      await service.sendUnpaidTaxInstallmentReminders()
      await service.sendUnpaidTaxInstallmentReminders()

      expect(service['processInstallmentReminders']).toHaveBeenCalledTimes(4)
      expect(service['processInstallmentReminders']).toHaveBeenNthCalledWith(
        3,
        INSTALLMENT_DUE_DATE_TYPE.NEXT,
        currentYear,
      )
      expect(service['processInstallmentReminders']).toHaveBeenNthCalledWith(
        4,
        INSTALLMENT_DUE_DATE_TYPE.PAST,
        currentYear,
      )
    })
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
            type: TaxType.DZN,
            order: 1,
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
          tax_type: TaxType.DZN,
          order: 1,
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
            type: TaxType.DZN,
            order: 1,
            taxPayer: {
              birthNumber: '123456/7890',
            },
          },
          {
            id: 2,
            year: 2024,
            type: TaxType.KO,
            order: 2,
            taxPayer: {
              birthNumber: '123456/7891',
            },
          },
          {
            id: 3,
            year: 2024,
            type: TaxType.DZN,
            order: 1,
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
          tax_type: TaxType.DZN,
          order: 1,
        },
        'external-id-1',
      )
      expect(trackEventUnpaidTaxReminderMock).toHaveBeenCalledWith(
        {
          year: 2024,
          tax_type: TaxType.KO,
          order: 2,
        },
        'external-id-2',
      )
    })
  })

  describe('resendBloomreachEvents', () => {
    beforeEach(() => {
      jest.clearAllMocks()
      jest.spyOn(service['logger'], 'log').mockImplementation(() => {})
      jest.spyOn(service['logger'], 'error').mockImplementation(() => {})
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
        .mockResolvedValue()

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
        .mockResolvedValueOnce()
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
