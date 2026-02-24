import { createMock } from '@golevelup/ts-jest'
import { Test, TestingModule } from '@nestjs/testing'
import { TaxType } from '@prisma/client'
import dayjs from 'dayjs'
import noop from 'lodash/noop'

import prismaMock from '../../../../test/singleton'
import { BloomreachService } from '../../../bloomreach/bloomreach.service'
import { PrismaService } from '../../../prisma/prisma.service'
import { CityAccountSubservice } from '../../../utils/subservices/cityaccount.subservice'
import BloomreachEventsSubservice from '../bloomreach-events.subservice'

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
