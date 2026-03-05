import { createMock } from '@golevelup/ts-jest'
import { Test, TestingModule } from '@nestjs/testing'
import { TaxType, UnpaidReminderSent } from '@prisma/client'
import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
import noop from 'lodash/noop'

import prismaMock from '../../../../test/singleton'
import { BloomreachService } from '../../../bloomreach/bloomreach.service'
import { PrismaService } from '../../../prisma/prisma.service'
import { getTaxDefinitionByType } from '../../../tax-definitions/getTaxDefinitionByType'
import ThrowerErrorGuard from '../../../utils/guards/errors.guard'
import { CityAccountSubservice } from '../../../utils/subservices/cityaccount.subservice'
import { INSTALLMENT_DUE_DATE_TYPE } from '../../utils/types'
import NotificationsEventsSubservice from '../notifications-events.subservice'

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

/** Assert $executeRaw was called with SQL that uses the given alreadyOtherSent and newReminderSent enums (and BOTH). */
function assertExecuteRawUsesReminderEnums(
  executeRawMock: jest.Mock,
  alreadyOtherSent: UnpaidReminderSent,
  newReminderSent: UnpaidReminderSent,
): void {
  const rawCallArgs = executeRawMock.mock.calls[0] as unknown[]
  const first = rawCallArgs[0]
  const values: unknown[] = Array.isArray(
    (first as { values?: unknown[] })?.values,
  )
    ? (first as { values: unknown[] }).values
    : [...rawCallArgs].slice(1)
  expect(values).toContain(alreadyOtherSent)
  expect(values).toContain(newReminderSent)
  expect(values).toContain(UnpaidReminderSent.BOTH)
}

describe('NotificationsEventsSubservice', () => {
  let service: NotificationsEventsSubservice
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
        NotificationsEventsSubservice,
        { provide: PrismaService, useValue: prismaMock },
        {
          provide: BloomreachService,
          useValue: createMock<BloomreachService>(),
        },
        {
          provide: CityAccountSubservice,
          useValue: createMock<CityAccountSubservice>(),
        },
        ThrowerErrorGuard,
      ],
    }).compile()

    service = module.get(NotificationsEventsSubservice)
    bloomreachService = module.get(BloomreachService)
    cityAccountSubservice = module.get(CityAccountSubservice)

    jest.spyOn(service['logger'], 'log').mockImplementation(noop)
    ;(getTaxDefinitionByType as jest.Mock).mockImplementation((taxType) => {
      if (taxType === TaxType.KO) {
        return mockTaxDefinitionKO
      }
      return mockTaxDefinitionDZN
    })
  })

  describe('getNextInstallment', () => {
    beforeEach(() => {
      jest.useFakeTimers()
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    it('returns null when no installment falls in the (now, now+1 week) window', () => {
      // Now = start of year, all KO due dates (May 31, Aug 31, Oct 31) are far away
      setNowBratislava('2025-01-01T12:00:00')

      const result = service['getNextInstallment'](TaxType.KO)

      expect(result).toBeNull()
    })

    it('returns second installment when its due date is within (now, now+1 week)', () => {
      // KO: second = 05-31. Set now = 2025-05-25 10:00 Bratislava → May 31 is after now and before June 1 10:00
      setNowBratislava('2025-05-25T10:00:00')

      const result = service['getNextInstallment'](TaxType.KO)

      expect(result).not.toBeNull()
      expect(result!.installmentNumber).toBe(2)
      expect(result!.installmentDate.format('YYYY-MM-DD')).toBe('2025-05-31')
    })

    it('returns third installment when third is in window and second is already past', () => {
      // KO: second 05-31, third 08-31. Now = 2025-08-25 10:00 → Aug 31 in window
      setNowBratislava('2025-08-25T10:00:00')

      const result = service['getNextInstallment'](TaxType.KO)

      expect(result).not.toBeNull()
      expect(result!.installmentNumber).toBe(3)
      expect(result!.installmentDate.format('YYYY-MM-DD')).toBe('2025-08-31')
    })

    it('returns fourth installment when fourth is in window', () => {
      // KO: fourth 10-31. Now = 2025-10-25 10:00 → Oct 31 in window
      setNowBratislava('2025-10-25T10:00:00')

      const result = service['getNextInstallment'](TaxType.KO)

      expect(result).not.toBeNull()
      expect(result!.installmentNumber).toBe(4)
      expect(result!.installmentDate.format('YYYY-MM-DD')).toBe('2025-10-31')
    })

    it('returns null when next due date is after now but more than 1 week away', () => {
      // KO second = 05-31. Now = 2025-05-20 10:00 → May 31 is after now but after May 27 (now+1 week)
      setNowBratislava('2025-05-20T10:00:00')

      const result = service['getNextInstallment'](TaxType.KO)

      expect(result).toBeNull()
    })

    it('returns null when all installments are already in the past', () => {
      // Now = Dec 1, all KO due dates (May 31, Aug 31, Oct 31) are past
      setNowBratislava('2025-12-01T12:00:00')

      const result = service['getNextInstallment'](TaxType.KO)

      expect(result).toBeNull()
    })

    it('skips installment when its date is before now and returns next one in window', () => {
      // KO: second 05-31 (past), third 08-31. Now = 2025-08-30 10:00 → third in window
      setNowBratislava('2025-08-30T10:00:00')

      const result = service['getNextInstallment'](TaxType.KO)

      expect(result).not.toBeNull()
      expect(result!.installmentNumber).toBe(3)
      expect(result!.installmentDate.format('YYYY-MM-DD')).toBe('2025-08-31')
    })

    it('returns second installment for DZN when Sep 1 is in window', () => {
      // DZN: second 09-01, third 11-01 (no fourth). Now = 2025-08-26 10:00
      setNowBratislava('2025-08-26T10:00:00')

      const result = service['getNextInstallment'](TaxType.DZN)

      expect(result).not.toBeNull()
      expect(result!.installmentNumber).toBe(2)
      expect(result!.installmentDate.format('YYYY-MM-DD')).toBe('2025-09-01')
    })

    it('returns third installment for DZN when Nov 1 is in window', () => {
      // DZN: second 09-01 (past), third 11-01. Now = 2025-10-26 10:00
      setNowBratislava('2025-10-26T10:00:00')

      const result = service['getNextInstallment'](TaxType.DZN)

      expect(result).not.toBeNull()
      expect(result!.installmentNumber).toBe(3)
      expect(result!.installmentDate.format('YYYY-MM-DD')).toBe('2025-11-01')
    })

    it('returns null for DZN when no installment in window (no fourth installment)', () => {
      // DZN has only second and third. Now = Jan 1
      setNowBratislava('2025-01-01T12:00:00')

      const result = service['getNextInstallment'](TaxType.DZN)

      expect(result).toBeNull()
    })

    it('returns first matching installment in order (second before third before fourth)', () => {
      // When second is in window, we must get second, not third. Now = May 25 → second May 31 in window
      setNowBratislava('2025-05-25T10:00:00')

      const result = service['getNextInstallment'](TaxType.KO)

      expect(result!.installmentNumber).toBe(2)
    })
  })

  describe('getPastInstallment', () => {
    beforeEach(() => {
      jest.useFakeTimers()
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    it('returns fourth installment when fourth due date + 1 week is before now', () => {
      // KO: fourth 10-31. Due + 1 week = Nov 7. Now = 2025-11-15 → Nov 7 before Nov 15
      setNowBratislava('2025-11-15T12:00:00')

      const result = service['getPastInstallment'](TaxType.KO)

      expect(result).not.toBeNull()
      expect(result!.installmentNumber).toBe(4)
      expect(result!.installmentDate.format('YYYY-MM-DD')).toBe('2025-10-31')
    })

    it('returns third installment when third is past (due+1week < now) and fourth not yet', () => {
      // KO: fourth 10-31, third 08-31. Now = 2025-09-15 → Aug 31+1week=Sep 7 before Sep 15; Oct 31+1week=Nov 7 not before Sep 15
      setNowBratislava('2025-09-15T12:00:00')

      const result = service['getPastInstallment'](TaxType.KO)

      expect(result).not.toBeNull()
      expect(result!.installmentNumber).toBe(3)
      expect(result!.installmentDate.format('YYYY-MM-DD')).toBe('2025-08-31')
    })

    it('returns third installment when third is past (due+1week < now) even if fourth is past but less than a week', () => {
      // KO: fourth 10-31, third 08-31. Now = 2025-11-01
      setNowBratislava('2025-11-01T12:00:00')

      const result = service['getPastInstallment'](TaxType.KO)

      expect(result).not.toBeNull()
      expect(result!.installmentNumber).toBe(3)
      expect(result!.installmentDate.format('YYYY-MM-DD')).toBe('2025-08-31')
    })

    it('returns second installment when second due date + 1 week is before now', () => {
      // KO: second 05-31. Due + 1 week = June 7. Now = 2025-06-15
      setNowBratislava('2025-06-15T12:00:00')

      const result = service['getPastInstallment'](TaxType.KO)

      expect(result).not.toBeNull()
      expect(result!.installmentNumber).toBe(2)
      expect(result!.installmentDate.format('YYYY-MM-DD')).toBe('2025-05-31')
    })

    it('returns null when no installment is more than 1 week past due', () => {
      // KO second 05-31. Due + 1 week = June 7. Now = 2025-06-01 → June 7 not before June 1
      setNowBratislava('2025-06-01T12:00:00')

      const result = service['getPastInstallment'](TaxType.KO)

      expect(result).toBeNull()
    })

    it('returns null when all installments are in the future', () => {
      // Now = start of year, no KO due date + 1 week is before Jan 1
      setNowBratislava('2025-01-01T12:00:00')

      const result = service['getPastInstallment'](TaxType.KO)

      expect(result).toBeNull()
    })

    it('returns first in reverse order when multiple are past (fourth before third before second)', () => {
      // KO: all due dates past. Now = Dec 1 → fourth (Oct 31) returned first (loop order: fourth, third, second)
      setNowBratislava('2025-12-01T12:00:00')

      const result = service['getPastInstallment'](TaxType.KO)

      expect(result).not.toBeNull()
      expect(result!.installmentNumber).toBe(4)
      expect(result!.installmentDate.format('YYYY-MM-DD')).toBe('2025-10-31')
    })

    it('returns second installment for DZN when Sep 1 + 1 week is before now', () => {
      // DZN: second 09-01. Due + 1 week = Sep 8. Now = 2025-09-15
      setNowBratislava('2025-09-15T12:00:00')

      const result = service['getPastInstallment'](TaxType.DZN)

      expect(result).not.toBeNull()
      expect(result!.installmentNumber).toBe(2)
      expect(result!.installmentDate.format('YYYY-MM-DD')).toBe('2025-09-01')
    })

    it('returns third installment for DZN when Nov 1 + 1 week is before now', () => {
      // DZN: third 11-01 (no fourth). Due + 1 week = Nov 8. Now = 2025-11-15
      setNowBratislava('2025-11-15T12:00:00')

      const result = service['getPastInstallment'](TaxType.DZN)

      expect(result).not.toBeNull()
      expect(result!.installmentNumber).toBe(3)
      expect(result!.installmentDate.format('YYYY-MM-DD')).toBe('2025-11-01')
    })

    it('returns null for DZN when no installment is more than 1 week past', () => {
      setNowBratislava('2025-01-01T12:00:00')

      const result = service['getPastInstallment'](TaxType.DZN)

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

    it('does not call trackEvent or $executeRaw when no eligible taxes', async () => {
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
      expect(prismaMock.$executeRaw).not.toHaveBeenCalled()
    })

    it('does not call trackEvent or $executeRaw when eligible taxes have no externalId (user missing)', async () => {
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
      expect(prismaMock.$executeRaw).not.toHaveBeenCalled()
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
      expect(prismaMock.$executeRaw).not.toHaveBeenCalled()
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
        () => Promise.resolve(true),
      )
      prismaMock.$executeRaw.mockResolvedValue(1)

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

      expect(prismaMock.$executeRaw).toHaveBeenCalledTimes(1)
      assertExecuteRawUsesReminderEnums(
        prismaMock.$executeRaw as jest.Mock,
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
      prismaMock.$executeRaw.mockResolvedValue(1)

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

      expect(prismaMock.$executeRaw).toHaveBeenCalledTimes(1)
      assertExecuteRawUsesReminderEnums(
        prismaMock.$executeRaw as jest.Mock,
        UnpaidReminderSent.BEFORE_DUE,
        UnpaidReminderSent.AFTER_DUE,
      )
    })

    it('calls trackEvent for each tax with full payload and updates all in one $executeRaw', async () => {
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
      prismaMock.$executeRaw.mockResolvedValue(1)

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
      expect(prismaMock.$executeRaw).toHaveBeenCalledTimes(1)
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
      jest.spyOn(service as any, 'getNextInstallment').mockReturnValue(null)
      jest.spyOn(service as any, 'getPastInstallment').mockReturnValue(null)
      service['processInstallmentReminders'] = jest.fn()
    })

    afterEach(() => {
      jest.restoreAllMocks()
    })

    it('does not call processInstallmentReminders when both getNext and getPast return null', async () => {
      jest.spyOn(service as any, 'getNextInstallment').mockReturnValue(null)
      jest.spyOn(service as any, 'getPastInstallment').mockReturnValue(null)

      await service.sendUnpaidTaxInstallmentReminders()

      expect(service['processInstallmentReminders']).not.toHaveBeenCalled()
    })

    it('calls processInstallmentReminders with INSTALLMENT_DUE_DATE_TYPE.NEXT only when getNextInstallment returns an installment', async () => {
      jest.spyOn(service as any, 'getPastInstallment').mockReturnValue(null)
      jest
        .spyOn(service as any, 'getNextInstallment')
        .mockReturnValue(mockNextInstallment)

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

    it('calls processInstallmentReminders with INSTALLMENT_DUE_DATE_TYPE.PAST only when getPastInstallment returns an installment', async () => {
      jest.spyOn(service as any, 'getNextInstallment').mockReturnValue(null)
      jest
        .spyOn(service as any, 'getPastInstallment')
        .mockReturnValue(mockPastInstallment)

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

    it('calls processInstallmentReminders with INSTALLMENT_DUE_DATE_TYPE.NEXT and INSTALLMENT_DUE_DATE_TYPE.PAST when both getNext and getPast return an installment', async () => {
      jest
        .spyOn(service as any, 'getNextInstallment')
        .mockReturnValue(mockNextInstallment)
      jest
        .spyOn(service as any, 'getPastInstallment')
        .mockReturnValue(mockPastInstallment)

      await service.sendUnpaidTaxInstallmentReminders()

      expect(service['processInstallmentReminders']).toHaveBeenCalledTimes(2)
    })

    it('uses toggled tax type (DZN -> KO on first run)', async () => {
      await service.sendUnpaidTaxInstallmentReminders()

      expect(service['getNextInstallment']).toHaveBeenCalledWith(TaxType.KO)
      expect(service['getPastInstallment']).toHaveBeenCalledWith(TaxType.KO)
    })

    it('uses DZN on second run after toggle', async () => {
      jest.spyOn(service as any, 'getNextInstallment').mockReturnValue(null)
      jest.spyOn(service as any, 'getPastInstallment').mockReturnValue(null)

      await service.sendUnpaidTaxInstallmentReminders()
      await service.sendUnpaidTaxInstallmentReminders()

      expect(service['getNextInstallment']).toHaveBeenLastCalledWith(
        TaxType.DZN,
      )
      expect(service['getPastInstallment']).toHaveBeenLastCalledWith(
        TaxType.DZN,
      )
    })
  })
})
