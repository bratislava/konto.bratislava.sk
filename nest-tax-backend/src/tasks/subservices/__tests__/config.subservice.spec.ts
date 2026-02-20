import { beforeEach, describe, expect, it } from "vitest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Test, TestingModule } from '@nestjs/testing'

import prismaMock from '../../../../test/singleton.js'
import { PrismaService } from '../../../prisma/prisma.service.js'
import {
  OVERPAYMENTS_LOOKBACK_DAYS,
  OVERPAYMENTS_LOOKBACK_DAYS_DEFAULT,
} from '../../../utils/constants.js'
import { LineLoggerSubservice } from '../../../utils/subservices/line-logger.subservice.js'
import TasksConfigSubservice from '../config.subservice.js'

describe('TasksConfigSubservice', () => {
  let service: TasksConfigSubservice

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksConfigSubservice,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile()

    service = module.get<TasksConfigSubservice>(TasksConfigSubservice)

    vi.spyOn(LineLoggerSubservice.prototype, 'log').mockImplementation()
  })

  describe('resetOverpaymentsLookbackDays', () => {
    it('should reset lookback days to default value', async () => {
      const updateManyMock = vi
        .spyOn(service['prismaService'].config, 'updateMany')
        .mockResolvedValue({ count: 1 })

      await service.resetOverpaymentsLookbackDays()

      expect(updateManyMock).toHaveBeenCalledWith({
        where: {
          key: OVERPAYMENTS_LOOKBACK_DAYS,
        },
        data: {
          value: OVERPAYMENTS_LOOKBACK_DAYS_DEFAULT.toString(),
        },
      })
    })

    it('should handle database errors gracefully', async () => {
      const error = new Error('Database connection failed')
      const updateManyMock = vi
        .spyOn(service['prismaService'].config, 'updateMany')
        .mockRejectedValue(error)

      await expect(service.resetOverpaymentsLookbackDays()).rejects.toThrow(
        'Database connection failed',
      )

      expect(updateManyMock).toHaveBeenCalledWith({
        where: {
          key: OVERPAYMENTS_LOOKBACK_DAYS,
        },
        data: {
          value: OVERPAYMENTS_LOOKBACK_DAYS_DEFAULT.toString(),
        },
      })
    })
  })

  // eslint-disable-next-line no-secrets/no-secrets
  describe('incrementOverpaymentsLookbackDays', () => {
    it('should increment lookback days by 1 when config exists', async () => {
      const mockConfig = { key: OVERPAYMENTS_LOOKBACK_DAYS, value: '5' }
      const mockFindFirst = vi.fn().mockResolvedValue(mockConfig)
      const mockUpdateMany = vi.fn().mockResolvedValue({ count: 1 })

      vi
        .spyOn(service['prismaService'], '$transaction')
        .mockImplementation(async (callback) => {
          const tx = {
            config: {
              findFirst: mockFindFirst,
              updateMany: mockUpdateMany,
            },
          } as any
          return callback(tx)
        })

      await service.incrementOverpaymentsLookbackDays()

      expect(mockFindFirst).toHaveBeenCalledWith({
        where: { key: OVERPAYMENTS_LOOKBACK_DAYS },
      })
      expect(mockUpdateMany).toHaveBeenCalledWith({
        where: { key: OVERPAYMENTS_LOOKBACK_DAYS },
        data: { value: '6' },
      })
    })

    it('should increment lookback days by custom value', async () => {
      const mockConfig = { key: OVERPAYMENTS_LOOKBACK_DAYS, value: '10' }
      const mockFindFirst = vi.fn().mockResolvedValue(mockConfig)
      const mockUpdateMany = vi.fn().mockResolvedValue({ count: 1 })

      vi
        .spyOn(service['prismaService'], '$transaction')
        .mockImplementation(async (callback) => {
          const tx = {
            config: {
              findFirst: mockFindFirst,
              updateMany: mockUpdateMany,
            },
          } as any
          return callback(tx)
        })

      await service.incrementOverpaymentsLookbackDays(3)

      expect(mockUpdateMany).toHaveBeenCalledWith({
        where: { key: OVERPAYMENTS_LOOKBACK_DAYS },
        data: { value: '13' },
      })
    })

    it('should handle case when config does not exist', async () => {
      const mockFindFirst = vi.fn().mockResolvedValue(null)
      const mockUpdateMany = vi.fn().mockResolvedValue({ count: 1 })

      vi
        .spyOn(service['prismaService'], '$transaction')
        .mockImplementation(async (callback) => {
          const tx = {
            config: {
              findFirst: mockFindFirst,
              updateMany: mockUpdateMany,
            },
          } as any
          return callback(tx)
        })

      await service.incrementOverpaymentsLookbackDays(2)

      expect(mockUpdateMany).toHaveBeenCalledWith({
        where: { key: OVERPAYMENTS_LOOKBACK_DAYS },
        data: { value: '2' },
      })
    })

    it('should handle database errors', async () => {
      const error = new Error('Database error')
      vi
        .spyOn(service['prismaService'], '$transaction')
        .mockRejectedValue(error)

      await expect(service.incrementOverpaymentsLookbackDays()).rejects.toThrow(
        'Database error',
      )
    })

    it('should handle invalid configuration', async () => {
      const mockConfig = { key: OVERPAYMENTS_LOOKBACK_DAYS, value: 'invalid' }
      const mockFindFirst = vi.fn().mockResolvedValue(mockConfig)
      const mockUpdateMany = vi.fn().mockResolvedValue({ count: 1 })

      vi
        .spyOn(service['prismaService'], '$transaction')
        .mockImplementation(async (callback) => {
          const tx = {
            config: {
              findFirst: mockFindFirst,
              updateMany: mockUpdateMany,
            },
          } as any
          return callback(tx)
        })

      await expect(service.incrementOverpaymentsLookbackDays()).rejects.toThrow(
        'Invalid OVERPAYMENTS_LOOKBACK_DAYS configuration: invalid, type number expected, got string.',
      )
    })
  })
})
