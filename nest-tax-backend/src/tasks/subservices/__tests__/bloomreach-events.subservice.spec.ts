import { createMock } from '@golevelup/ts-jest'
import { Test, TestingModule } from '@nestjs/testing'
import { TaxType } from '@prisma/client'
import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
import noop from 'lodash/noop'

import prismaMock from '../../../../test/singleton'
import { BloomreachService } from '../../../bloomreach/bloomreach.service'
import { PrismaService } from '../../../prisma/prisma.service'
import { getTaxDefinitionByType } from '../../../tax-definitions/getTaxDefinitionByType'
import { CityAccountSubservice } from '../../../utils/subservices/cityaccount.subservice'
import BloomreachEventsSubservice from '../bloomreach-events.subservice'

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

describe('BloomreachEventsSubservice', () => {
  let service: BloomreachEventsSubservice

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
        BloomreachEventsSubservice,
        { provide: PrismaService, useValue: prismaMock },
        {
          provide: BloomreachService,
          useValue: createMock<BloomreachService>(),
        },
        {
          provide: CityAccountSubservice,
          useValue: createMock<CityAccountSubservice>(),
        },
      ],
    }).compile()

    service = module.get(BloomreachEventsSubservice)

    jest.spyOn(service['logger'], 'log').mockImplementation(noop)
  })

  describe('getNextInstallment', () => {
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

    beforeEach(() => {
      jest.useFakeTimers()
      ;(getTaxDefinitionByType as jest.Mock).mockImplementation((taxType) => {
        if (taxType === TaxType.KO) {
          return mockTaxDefinitionKO
        }
        return mockTaxDefinitionDZN
      })
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

  describe('sendUnpaidTaxInstallmentReminders', () => {
    beforeEach(() => {
      jest.spyOn(service as any, 'getNextInstallment').mockReturnValue(null)
      jest.spyOn(service as any, 'getPastInstallment').mockReturnValue(null)
      service['processNextInstallment'] = jest.fn()
      service['processPastInstallment'] = jest.fn()
    })

    afterEach(() => {
      jest.restoreAllMocks()
    })

    it('calls neither processNextInstallment nor processPastInstallment when both getNext and getPast return null', async () => {
      jest.spyOn(service as any, 'getNextInstallment').mockReturnValue(null)
      jest.spyOn(service as any, 'getPastInstallment').mockReturnValue(null)

      await service.sendUnpaidTaxInstallmentReminders()

      expect(service['processNextInstallment']).not.toHaveBeenCalled()
      expect(service['processPastInstallment']).not.toHaveBeenCalled()
    })

    it('calls processNextInstallment only when getNextInstallment returns an installment', async () => {
      jest.spyOn(service as any, 'getPastInstallment').mockReturnValue(null)
      jest
        .spyOn(service as any, 'getNextInstallment')
        .mockReturnValue(mockNextInstallment)

      await service.sendUnpaidTaxInstallmentReminders()

      expect(service['processNextInstallment']).toHaveBeenCalledTimes(1)
      expect(service['processNextInstallment']).toHaveBeenCalledWith(
        mockNextInstallment,
        TaxType.KO,
        currentYear,
      )
      expect(service['processPastInstallment']).not.toHaveBeenCalled()
    })

    it('calls processPastInstallment only when getPastInstallment returns an installment', async () => {
      jest.spyOn(service as any, 'getNextInstallment').mockReturnValue(null)
      jest
        .spyOn(service as any, 'getPastInstallment')
        .mockReturnValue(mockPastInstallment)

      await service.sendUnpaidTaxInstallmentReminders()

      expect(service['processPastInstallment']).toHaveBeenCalledTimes(1)
      expect(service['processPastInstallment']).toHaveBeenCalledWith(
        mockPastInstallment,
        TaxType.KO,
        currentYear,
      )
      expect(service['processNextInstallment']).not.toHaveBeenCalled()
    })

    it('calls both processNextInstallment and processPastInstallment when both return an installment', async () => {
      jest
        .spyOn(service as any, 'getNextInstallment')
        .mockReturnValue(mockNextInstallment)
      jest
        .spyOn(service as any, 'getPastInstallment')
        .mockReturnValue(mockPastInstallment)

      await service.sendUnpaidTaxInstallmentReminders()

      expect(service['processNextInstallment']).toHaveBeenCalledTimes(1)
      expect(service['processNextInstallment']).toHaveBeenCalledWith(
        mockNextInstallment,
        TaxType.KO,
        currentYear,
      )
      expect(service['processPastInstallment']).toHaveBeenCalledTimes(1)
      expect(service['processPastInstallment']).toHaveBeenCalledWith(
        mockPastInstallment,
        TaxType.KO,
        currentYear,
      )
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
