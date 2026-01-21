import { Test, TestingModule } from '@nestjs/testing'

import PrismaService from '../prisma/prisma.service'
import ScannerClientService from '../scanner-client/scanner-client.service'
import ThrowerErrorGuard from '../utils/guards/thrower-error.guard'
import MinioClientSubservice from '../utils/subservices/minio-client.subservice'
import StatusService from './status.service'

jest.mock('../prisma/prisma.service')
jest.mock('../utils/subservices/minio-client.subservice')
jest.mock('../scanner-client/scanner-client.service')

describe('StatusService', () => {
  let service: StatusService

  beforeEach(async () => {
    jest.resetAllMocks()

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StatusService,
        MinioClientSubservice,
        PrismaService,
        ScannerClientService,
        ThrowerErrorGuard,
      ],
    }).compile()

    service = module.get<StatusService>(StatusService)

    Object.defineProperty(service, 'logger', {
      value: { error: jest.fn(), log: jest.fn() },
    })
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('isPrismaRunning', () => {
    it('should return true', async () => {
      service['prismaService'].isRunning = jest.fn().mockResolvedValue(true)
      const result = await service.isPrismaRunning()
      expect(result).toEqual({
        running: true,
      })
    })

    it('should return false', async () => {
      service['prismaService'].isRunning = jest.fn().mockResolvedValue(false)
      const result = await service.isPrismaRunning()
      expect(result).toEqual({
        running: false,
      })
    })

    it('should return false when error', async () => {
      service['prismaService'].isRunning = jest
        .fn()
        .mockRejectedValue(new Error('Error'))
      const result = await service.isPrismaRunning()
      expect(result).toEqual({
        running: false,
      })
    })
  })

  describe('isScannerRunning', () => {
    it('should return true', async () => {
      service['scannerClientService'].isRunning = jest.fn()
      const result = await service.isScannerRunning()
      expect(result).toEqual({
        running: true,
      })
    })

    it('should return false', async () => {
      service['scannerClientService'].isRunning = jest
        .fn()
        .mockRejectedValue(new Error('Error'))
      const spy = jest.spyOn(service['logger'], 'error')

      const result = await service.isScannerRunning()
      expect(result).toEqual({
        running: false,
      })
      expect(spy).toHaveBeenCalled()
    })
  })

  describe('isMinioRunning', () => {
    it('should return true', async () => {
      service['minioClientSubservice'].client = jest.fn()
      const result = await service.isMinioRunning()
      expect(result).toEqual({
        running: true,
      })
    })

    it('should return false', async () => {
      service['minioClientSubservice'].client = jest
        .fn()
        .mockImplementation(() => {
          throw new Error('Error')
        })
      const spy = jest.spyOn(service['logger'], 'error')

      const result = await service.isMinioRunning()
      expect(result).toEqual({
        running: false,
      })
      expect(spy).toHaveBeenCalled()
    })
  })
})
