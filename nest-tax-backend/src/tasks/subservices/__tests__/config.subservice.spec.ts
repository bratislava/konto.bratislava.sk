import { Test, TestingModule } from '@nestjs/testing'

import prismaMock from '../../../../test/singleton'
import { PrismaService } from '../../../prisma/prisma.service'
import { OVERPAYMENTS_LOOKBACK_DAYS_DEFAULT } from '../../../utils/constants'
import { LineLoggerSubservice } from '../../../utils/subservices/line-logger.subservice'
import ConfigSubservice from '../config.subservice'

describe('ConfigSubservice', () => {
  let service: ConfigSubservice

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConfigSubservice,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile()

    service = module.get<ConfigSubservice>(ConfigSubservice)

    jest.spyOn(LineLoggerSubservice.prototype, 'log').mockImplementation()
  })

  describe('resetOverpaymentsLookbackDays', () => {
    it('should reset lookback days to default value', async () => {
      const updateManyMock = jest
        .spyOn(service['prismaService'].config, 'updateMany')
        .mockResolvedValue({ count: 1 })

      await service.resetOverpaymentsLookbackDays()

      expect(updateManyMock).toHaveBeenCalledWith({
        where: {
          key: 'OVERPAYMENTS_LOOKBACK_DAYS',
        },
        data: {
          value: OVERPAYMENTS_LOOKBACK_DAYS_DEFAULT.toString(),
        },
      })
    })

    it('should handle database errors gracefully', async () => {
      const error = new Error('Database connection failed')
      const updateManyMock = jest
        .spyOn(service['prismaService'].config, 'updateMany')
        .mockRejectedValue(error)

      await expect(service.resetOverpaymentsLookbackDays()).rejects.toThrow(
        'Database connection failed',
      )

      expect(updateManyMock).toHaveBeenCalledWith({
        where: {
          key: 'OVERPAYMENTS_LOOKBACK_DAYS',
        },
        data: {
          value: OVERPAYMENTS_LOOKBACK_DAYS_DEFAULT.toString(),
        },
      })
    })
  })

  describe('incrementOverpaymentsLookbackDays', () => {
    it('should increment lookback days by 1', async () => {
      const updateManyMock = jest
        .spyOn(service['prismaService'].config, 'updateMany')
        .mockResolvedValue({ count: 1 })

      await service.incrementOverpaymentsLookbackDays(3)

      expect(updateManyMock).toHaveBeenCalledWith({
        where: {
          key: 'OVERPAYMENTS_LOOKBACK_DAYS',
        },
        data: {
          value: '4',
        },
      })
    })

    it('should handle database errors gracefully', async () => {
      const error = new Error('Database connection failed')
      const updateManyMock = jest
        .spyOn(service['prismaService'].config, 'updateMany')
        .mockRejectedValue(error)

      await expect(
        service.incrementOverpaymentsLookbackDays(5),
      ).rejects.toThrow('Database connection failed')

      expect(updateManyMock).toHaveBeenCalledWith({
        where: {
          key: 'OVERPAYMENTS_LOOKBACK_DAYS',
        },
        data: {
          value: '6',
        },
      })
    })

    it('should handle large increment values', async () => {
      const updateManyMock = jest
        .spyOn(service['prismaService'].config, 'updateMany')
        .mockResolvedValue({ count: 1 })

      await service.incrementOverpaymentsLookbackDays(29)

      expect(updateManyMock).toHaveBeenCalledWith({
        where: {
          key: 'OVERPAYMENTS_LOOKBACK_DAYS',
        },
        data: {
          value: '30',
        },
      })
    })
  })
})
