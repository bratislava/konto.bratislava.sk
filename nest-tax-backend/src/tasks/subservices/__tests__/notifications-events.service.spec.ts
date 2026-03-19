import { createMock } from '@golevelup/ts-jest'
import { Test, TestingModule } from '@nestjs/testing'
import { PaymentStatus, TaxType, UnpaidReminderSent } from '@prisma/client'
import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'

import prismaMock from '../../../../test/singleton'
import { BloomreachService } from '../../../bloomreach/bloomreach.service'
import { PaymentService } from '../../../payment/payment.service'
import { PrismaService } from '../../../prisma/prisma.service'
import { getTaxDefinitionByType } from '../../../tax-definitions/getTaxDefinitionByType'
import ThrowerErrorGuard from '../../../utils/guards/errors.guard'
import { CityAccountSubservice } from '../../../utils/subservices/cityaccount.subservice'
import { INSTALLMENT_DUE_DATE_TYPE } from '../../utils/types'
import NotificationsEventsService from '../notifications-events.service'

jest.mock('../../../tax-definitions/getTaxDefinitionByType', () => ({
  getTaxDefinitionByType: jest.fn(),
}))

dayjs.extend(utc)
dayjs.extend(timezone)

const TZ = 'Europe/Bratislava'

/** Set fake "now" to a given local date-time in Bratislava (e.g. '2025-05-25 10:00:00'). */
function setNowBratislava(localDateTime: string): void {
  jest.setSystemTime(dayjs.tz(localDateTime, TZ).toDate())
}

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

describe('NotificationsEventsSubservice', () => {
  let service: NotificationsEventsService
  let bloomreachService: jest.Mocked<BloomreachService>
  let cityAccountSubservice: jest.Mocked<CityAccountSubservice>

  const mockTaxDefinitionKO = {
    type: TaxType.KO,
    numberOfInstallments: 4,
    installmentDueDates: {
      second: '05-31',
      third: '08-31',
      fourth: '10-31',
    },
  }

  const mockTaxDefinitionDZN = {
    type: TaxType.DZN,
    numberOfInstallments: 3,
    installmentDueDates: {
      second: '09-01',
      third: '11-01',
    },
  }

  const mockNextInstallment = {
    installmentNumber: 3 as const,
    installmentDate: dayjs('2025-06-01'),
  }
  const mockPastInstallment = {
    installmentNumber: 2 as const,
    installmentDate: dayjs('2025-05-01'),
  }
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
    ;(getTaxDefinitionByType as jest.Mock).mockImplementation((taxType) => {
      if (taxType === TaxType.KO) {
        return mockTaxDefinitionKO
      }
      return mockTaxDefinitionDZN
    })
  })

  describe('findInstallment (next week)', () => {
    beforeEach(() => {
      jest.useFakeTimers()
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    it('returns null when no installment falls in the (now, now+1 week) window', () => {
      // Now = start of year, all KO due dates (May 31, Aug 31, Oct 31) are far away
      setNowBratislava('2025-01-01T12:00:00')

      const result = service['findInstallment'](
        TaxType.KO,
        service['isWithinNextWeek'],
      )

      expect(result).toBeNull()
    })

    it('returns second installment when its due date is within (now, now+1 week)', () => {
      // KO: second = 05-31. Set now = 2025-05-25 10:00 Bratislava → May 31 is after now and before June 1 10:00
      setNowBratislava('2025-05-25T10:00:00')

      const result = service['findInstallment'](
        TaxType.KO,
        service['isWithinNextWeek'],
      )

      expect(result).not.toBeNull()
      expect(result!.installmentNumber).toBe(2)
      expect(result!.installmentDate.format('YYYY-MM-DD')).toBe('2025-05-31')
    })

    it('returns third installment when third is in window and second is already past', () => {
      // KO: second 05-31, third 08-31. Now = 2025-08-25 10:00 → Aug 31 in window
      setNowBratislava('2025-08-25T10:00:00')

      const result = service['findInstallment'](
        TaxType.KO,
        service['isWithinNextWeek'],
      )

      expect(result).not.toBeNull()
      expect(result!.installmentNumber).toBe(3)
      expect(result!.installmentDate.format('YYYY-MM-DD')).toBe('2025-08-31')
    })

    it('returns fourth installment when fourth is in window', () => {
      // KO: fourth 10-31. Now = 2025-10-25 10:00 → Oct 31 in window
      setNowBratislava('2025-10-25T10:00:00')

      const result = service['findInstallment'](
        TaxType.KO,
        service['isWithinNextWeek'],
      )

      expect(result).not.toBeNull()
      expect(result!.installmentNumber).toBe(4)
      expect(result!.installmentDate.format('YYYY-MM-DD')).toBe('2025-10-31')
    })

    it('returns null when next due date is after now but more than 1 week away', () => {
      // KO second = 05-31. Now = 2025-05-20 10:00 → May 31 is after now but after May 27 (now+1 week)
      setNowBratislava('2025-05-20T10:00:00')

      const result = service['findInstallment'](
        TaxType.KO,
        service['isWithinNextWeek'],
      )

      expect(result).toBeNull()
    })

    it('returns null when all installments are already in the past', () => {
      // Now = Dec 1, all KO due dates (May 31, Aug 31, Oct 31) are past
      setNowBratislava('2025-12-01T12:00:00')

      const result = service['findInstallment'](
        TaxType.KO,
        service['isWithinNextWeek'],
      )

      expect(result).toBeNull()
    })

    it('skips installment when its date is before now and returns next one in window', () => {
      // KO: second 05-31 (past), third 08-31. Now = 2025-08-30 10:00 → third in window
      setNowBratislava('2025-08-30T10:00:00')

      const result = service['findInstallment'](
        TaxType.KO,
        service['isWithinNextWeek'],
      )

      expect(result).not.toBeNull()
      expect(result!.installmentNumber).toBe(3)
      expect(result!.installmentDate.format('YYYY-MM-DD')).toBe('2025-08-31')
    })

    it('returns second installment for DZN when Sep 1 is in window', () => {
      // DZN: second 09-01, third 11-01 (no fourth). Now = 2025-08-26 10:00
      setNowBratislava('2025-08-26T10:00:00')

      const result = service['findInstallment'](
        TaxType.DZN,
        service['isWithinNextWeek'],
      )

      expect(result).not.toBeNull()
      expect(result!.installmentNumber).toBe(2)
      expect(result!.installmentDate.format('YYYY-MM-DD')).toBe('2025-09-01')
    })

    it('returns third installment for DZN when Nov 1 is in window', () => {
      // DZN: second 09-01 (past), third 11-01. Now = 2025-10-26 10:00
      setNowBratislava('2025-10-26T10:00:00')

      const result = service['findInstallment'](
        TaxType.DZN,
        service['isWithinNextWeek'],
      )

      expect(result).not.toBeNull()
      expect(result!.installmentNumber).toBe(3)
      expect(result!.installmentDate.format('YYYY-MM-DD')).toBe('2025-11-01')
    })

    it('returns null for DZN when no installment in window (no fourth installment)', () => {
      // DZN has only second and third. Now = Jan 1
      setNowBratislava('2025-01-01T12:00:00')

      const result = service['findInstallment'](
        TaxType.DZN,
        service['isWithinNextWeek'],
      )

      expect(result).toBeNull()
    })

    it('returns first matching installment in order (second before third before fourth)', () => {
      // When second is in window, we must get second, not third. Now = May 25 → second May 31 in window
      setNowBratislava('2025-05-25T10:00:00')

      const result = service['findInstallment'](
        TaxType.KO,
        service['isWithinNextWeek'],
      )

      expect(result!.installmentNumber).toBe(2)
    })
  })

  describe('findInstallment (past week)', () => {
    beforeEach(() => {
      jest.useFakeTimers()
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    it('returns fourth installment when fourth due date is within the past week', () => {
      // KO: fourth 10-31. Now = 2025-11-05 → (now-1week, now) contains Oct 31
      setNowBratislava('2025-11-05T12:00:00')

      const result = service['findInstallment'](
        TaxType.KO,
        service['isWithinPastWeek'],
      )

      expect(result).not.toBeNull()
      expect(result!.installmentNumber).toBe(4)
      expect(result!.installmentDate.format('YYYY-MM-DD')).toBe('2025-10-31')
    })

    it('returns third installment when third due date is within the past week', () => {
      // KO: third 08-31. Now = 2025-09-05 → (now-1week, now) contains Aug 31
      setNowBratislava('2025-09-05T12:00:00')

      const result = service['findInstallment'](
        TaxType.KO,
        service['isWithinPastWeek'],
      )

      expect(result).not.toBeNull()
      expect(result!.installmentNumber).toBe(3)
      expect(result!.installmentDate.format('YYYY-MM-DD')).toBe('2025-08-31')
    })

    it('returns third installment when only third is in past week (fourth not yet in window)', () => {
      // KO: third 08-31, fourth 10-31. Now = 2025-09-05 → only Aug 31 in (now-1week, now)
      setNowBratislava('2025-09-05T12:00:00')

      const result = service['findInstallment'](
        TaxType.KO,
        service['isWithinPastWeek'],
      )

      expect(result).not.toBeNull()
      expect(result!.installmentNumber).toBe(3)
      expect(result!.installmentDate.format('YYYY-MM-DD')).toBe('2025-08-31')
    })

    it('returns second installment when second due date is within the past week', () => {
      // KO: second 05-31. Now = 2025-06-05 → (now-1week, now) contains May 31
      setNowBratislava('2025-06-05T12:00:00')

      const result = service['findInstallment'](
        TaxType.KO,
        service['isWithinPastWeek'],
      )

      expect(result).not.toBeNull()
      expect(result!.installmentNumber).toBe(2)
      expect(result!.installmentDate.format('YYYY-MM-DD')).toBe('2025-05-31')
    })

    it('returns null when no installment due date falls in the past week', () => {
      // KO second 05-31, third 08-31. Now = 2025-06-15 → (now-1week, now) = (Jun 8, Jun 15); May 31 and Aug 31 outside
      setNowBratislava('2025-06-15T12:00:00')

      const result = service['findInstallment'](
        TaxType.KO,
        service['isWithinPastWeek'],
      )

      expect(result).toBeNull()
    })

    it('returns null when all installments are in the future', () => {
      // Now = start of year, no KO due date + 1 week is before Jan 1
      setNowBratislava('2025-01-01T12:00:00')

      const result = service['findInstallment'](
        TaxType.KO,
        service['isWithinPastWeek'],
      )

      expect(result).toBeNull()
    })

    it('returns fourth when it is the only one whose due date is in the past week', () => {
      // KO: fourth 10-31. Now = 2025-11-05 → (now-1week, now) contains Oct 31; second/third outside
      setNowBratislava('2025-11-05T12:00:00')

      const result = service['findInstallment'](
        TaxType.KO,
        service['isWithinPastWeek'],
      )

      expect(result).not.toBeNull()
      expect(result!.installmentNumber).toBe(4)
      expect(result!.installmentDate.format('YYYY-MM-DD')).toBe('2025-10-31')
    })

    it('returns second installment for DZN when Sep 1 is within the past week', () => {
      // DZN: second 09-01. Now = 2025-09-05 → (now-1week, now) contains Sep 1
      setNowBratislava('2025-09-05T12:00:00')

      const result = service['findInstallment'](
        TaxType.DZN,
        service['isWithinPastWeek'],
      )

      expect(result).not.toBeNull()
      expect(result!.installmentNumber).toBe(2)
      expect(result!.installmentDate.format('YYYY-MM-DD')).toBe('2025-09-01')
    })

    it('returns third installment for DZN when Nov 1 is within the past week', () => {
      // DZN: third 11-01 (no fourth). Now = 2025-11-05 → (now-1week, now) contains Nov 1
      setNowBratislava('2025-11-05T12:00:00')

      const result = service['findInstallment'](
        TaxType.DZN,
        service['isWithinPastWeek'],
      )

      expect(result).not.toBeNull()
      expect(result!.installmentNumber).toBe(3)
      expect(result!.installmentDate.format('YYYY-MM-DD')).toBe('2025-11-01')
    })

    it('returns null for DZN when no installment is more than 1 week past', () => {
      setNowBratislava('2025-01-01T12:00:00')

      const result = service['findInstallment'](
        TaxType.DZN,
        service['isWithinPastWeek'],
      )

      expect(result).toBeNull()
    })
  })

  describe('processInstallmentReminders', () => {
    const installment = {
      installmentNumber: 2 as const,
      installmentDate: dayjs.tz('2025-05-31', 'Europe/Bratislava'),
    }
    const year = 2025

    it('calls getTaxesEligibleForInstallmentReminder with reminderSentFilter [NONE] when dueDateTiming is BEFORE', async () => {
      const getTaxesSpy = jest
        .spyOn(service as any, 'getTaxesEligibleForInstallmentReminder')
        .mockResolvedValue([])
      prismaMock.tax.findMany.mockResolvedValue([])

      await service['processInstallmentReminders'](
        installment,
        TaxType.KO,
        INSTALLMENT_DUE_DATE_TYPE.NEXT,
        year,
      )

      expect(getTaxesSpy).toHaveBeenCalledTimes(1)
      expect(getTaxesSpy).toHaveBeenCalledWith(
        TaxType.KO,
        installment.installmentNumber,
        [UnpaidReminderSent.NONE],
        year,
      )
    })

    it('calls getTaxesEligibleForInstallmentReminder with reminderSentFilter [NONE, BEFORE_DUE] when dueDateTiming is AFTER', async () => {
      const getTaxesSpy = jest
        .spyOn(service as any, 'getTaxesEligibleForInstallmentReminder')
        .mockResolvedValue([])
      prismaMock.tax.findMany.mockResolvedValue([])

      await service['processInstallmentReminders'](
        installment,
        TaxType.KO,
        INSTALLMENT_DUE_DATE_TYPE.PAST,
        year,
      )

      expect(getTaxesSpy).toHaveBeenCalledTimes(1)
      expect(getTaxesSpy).toHaveBeenCalledWith(
        TaxType.KO,
        installment.installmentNumber,
        [UnpaidReminderSent.NONE, UnpaidReminderSent.BEFORE_DUE],
        year,
      )
    })

    it('does not call trackEvent or updateMany when no eligible taxes', async () => {
      jest
        .spyOn(service as any, 'getTaxesEligibleForInstallmentReminder')
        .mockResolvedValue([])
      prismaMock.tax.findMany.mockResolvedValue([])

      await service['processInstallmentReminders'](
        installment,
        TaxType.KO,
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
        .spyOn(service as any, 'getTaxesEligibleForInstallmentReminder')
        .mockResolvedValue([{ id: 1 }])
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
        installment,
        TaxType.KO,
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
        .spyOn(service as any, 'getTaxesEligibleForInstallmentReminder')
        .mockResolvedValue([{ id: 1 }])
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
        installment,
        TaxType.KO,
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
        .spyOn(service as any, 'getTaxesEligibleForInstallmentReminder')
        .mockResolvedValue([{ id: 1 }])
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
        installment,
        TaxType.KO,
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
    })

    it('calls trackEvent with full payload and uses newReminderSent=AFTER_DUE and alreadyOtherSent=BEFORE_DUE when AFTER', async () => {
      const birthNumber = '123456/7890'
      jest
        .spyOn(service as any, 'getTaxesEligibleForInstallmentReminder')
        .mockResolvedValue([{ id: 1 }])
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
        installment,
        TaxType.KO,
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
    })

    it('calls trackEvent for each tax with full payload and updates all with two updateMany calls', async () => {
      const birth1 = '111111/1111'
      const birth2 = '222222/2222'
      jest
        .spyOn(service as any, 'getTaxesEligibleForInstallmentReminder')
        .mockResolvedValue([{ id: 1 }, { id: 2 }])
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
        installment,
        TaxType.KO,
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
    })

    it('calls getUserDataAdminBatch with all tax payer birth numbers', async () => {
      const birth1 = '111111/1111'
      const birth2 = '222222/2222'
      jest
        .spyOn(service as any, 'getTaxesEligibleForInstallmentReminder')
        .mockResolvedValue([{ id: 1 }, { id: 2 }])
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
        installment,
        TaxType.KO,
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
      jest.spyOn(service as any, 'findInstallment').mockReturnValue(null)
      service['processInstallmentReminders'] = jest.fn()
    })

    afterEach(() => {
      jest.restoreAllMocks()
    })

    it('does not call processInstallmentReminders when both findInstallment calls return null', async () => {
      await service.sendUnpaidTaxInstallmentReminders()

      expect(service['processInstallmentReminders']).not.toHaveBeenCalled()
    })

    it('calls processInstallmentReminders with INSTALLMENT_DUE_DATE_TYPE.NEXT only when findInstallment returns an installment for next week', async () => {
      jest
        .spyOn(service as any, 'findInstallment')
        .mockImplementation((_taxType: unknown, predicate: unknown) =>
          predicate === service['isWithinNextWeek']
            ? mockNextInstallment
            : null,
        )

      await service.sendUnpaidTaxInstallmentReminders()

      expect(service['processInstallmentReminders']).toHaveBeenCalledTimes(1)
      expect(service['processInstallmentReminders']).toHaveBeenCalledWith(
        mockNextInstallment,
        TaxType.KO,
        INSTALLMENT_DUE_DATE_TYPE.NEXT,
        currentYear,
      )
      expect(service['processInstallmentReminders']).not.toHaveBeenCalledWith(
        mockNextInstallment,
        TaxType.KO,
        INSTALLMENT_DUE_DATE_TYPE.PAST,
        currentYear,
      )
    })

    it('calls processInstallmentReminders with INSTALLMENT_DUE_DATE_TYPE.PAST only when findInstallment returns an installment for past week', async () => {
      jest
        .spyOn(service as any, 'findInstallment')
        .mockImplementation((_taxType: unknown, predicate: unknown) =>
          predicate === service['isWithinPastWeek']
            ? mockPastInstallment
            : null,
        )

      await service.sendUnpaidTaxInstallmentReminders()

      expect(service['processInstallmentReminders']).toHaveBeenCalledTimes(1)
      expect(service['processInstallmentReminders']).toHaveBeenCalledWith(
        mockPastInstallment,
        TaxType.KO,
        INSTALLMENT_DUE_DATE_TYPE.PAST,
        currentYear,
      )
      expect(service['processInstallmentReminders']).not.toHaveBeenCalledWith(
        mockPastInstallment,
        TaxType.KO,
        INSTALLMENT_DUE_DATE_TYPE.NEXT,
        currentYear,
      )
    })

    it('calls processInstallmentReminders with INSTALLMENT_DUE_DATE_TYPE.NEXT and INSTALLMENT_DUE_DATE_TYPE.PAST when both findInstallment calls return an installment', async () => {
      jest
        .spyOn(service as any, 'findInstallment')
        .mockImplementation((_taxType: unknown, predicate: unknown) =>
          predicate === service['isWithinNextWeek']
            ? mockNextInstallment
            : mockPastInstallment,
        )

      await service.sendUnpaidTaxInstallmentReminders()

      expect(service['processInstallmentReminders']).toHaveBeenCalledTimes(2)
    })

    it('uses toggled tax type (DZN -> KO on first run)', async () => {
      await service.sendUnpaidTaxInstallmentReminders()

      expect(service['findInstallment']).toHaveBeenCalledWith(
        TaxType.KO,
        service['isWithinNextWeek'],
      )
      expect(service['findInstallment']).toHaveBeenCalledWith(
        TaxType.KO,
        service['isWithinPastWeek'],
      )
    })

    it('uses DZN on second run after toggle', async () => {
      await service.sendUnpaidTaxInstallmentReminders()
      await service.sendUnpaidTaxInstallmentReminders()

      expect(service['findInstallment']).toHaveBeenLastCalledWith(
        TaxType.DZN,
        service['isWithinPastWeek'],
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
