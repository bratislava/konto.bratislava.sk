import { ErrorFactoryService, LineLoggerService } from '@bratislava/log-nest'
import { Test, TestingModule } from '@nestjs/testing'

import { MinioStorageService } from '../minio-storage/minio-storage.service'
import PrismaService from '../prisma/prisma.service'
import ScannerClientService from '../scanner-client/scanner-client.service'
import StatusService from './status.service'

vi.mock('../prisma/prisma.service')
vi.mock('../minio-storage/minio-storage.service')
vi.mock('../scanner-client/scanner-client.service')

describe('StatusService', () => {
  let service: StatusService

  beforeEach(async () => {
    vi.resetAllMocks()

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        // TODO we want to mock most of these
        LineLoggerService,
        StatusService,
        MinioStorageService,
        PrismaService,
        ScannerClientService,
        ErrorFactoryService,
      ],
    }).compile()

    service = module.get<StatusService>(StatusService)

    Object.defineProperty(service, 'logger', {
      value: { error: vi.fn(), log: vi.fn() },
    })
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('isPrismaRunning', () => {
    it('should return true', async () => {
      service['prismaService'].isRunning = vi.fn().mockImplementation(vi.fn())
      const result = await service.isPrismaRunning()
      expect(result).toEqual({
        running: true,
      })
    })

    it('should return false', async () => {
      service['prismaService'].isRunning = vi
        .fn()
        .mockRejectedValueOnce(new Error('Query error.'))
      const result = await service.isPrismaRunning()
      expect(result).toEqual({
        running: false,
      })
    })

    it('should return false when error', async () => {
      service['prismaService'].isRunning = vi
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
      service['scannerClientService'].isRunning = vi.fn()
      const result = await service.isScannerRunning()
      expect(result).toEqual({
        running: true,
      })
    })

    it('should return false', async () => {
      service['scannerClientService'].isRunning = vi
        .fn()
        .mockRejectedValue(new Error('Error'))
      const spy = vi.spyOn(service['logger'], 'error')

      const result = await service.isScannerRunning()
      expect(result).toEqual({
        running: false,
      })
      expect(spy).toHaveBeenCalled()
    })
  })

  describe('isMinioRunning', () => {
    it('should return true', () => {
      service['minioStorageService'].client = vi.fn()
      const result = service.isMinioRunning()
      expect(result).toEqual({
        running: true,
      })
    })

    it('should return false', () => {
      service['minioStorageService'].client = vi.fn().mockImplementation(() => {
        throw new Error('Error')
      })
      const spy = vi.spyOn(service['logger'], 'error')

      const result = service.isMinioRunning()
      expect(result).toEqual({
        running: false,
      })
      expect(spy).toHaveBeenCalled()
    })
  })
})
