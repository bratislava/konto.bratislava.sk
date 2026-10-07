import { ErrorFactoryService, LineLoggerService } from '@bratislava/log-nest'
import { createMock } from '@golevelup/ts-vitest'
import { Test, TestingModule } from '@nestjs/testing'

import { MinioStorageService } from '../minio-storage/minio-storage.service'
import PrismaService from '../prisma/prisma.service'
import ScannerClientService from '../scanner-client/scanner-client.service'
import alertReporting from '../utils/constants/error.alerts'
import {
  StatusErrorsEnum,
  StatusResponseEnum,
} from './errors/status.errors.enum'
import StatusService from './status.service'

vi.mock('../prisma/prisma.service')
vi.mock('../minio-storage/minio-storage.service')
vi.mock('../scanner-client/scanner-client.service')

describe('StatusService', () => {
  let service: StatusService
  let logger: LineLoggerService
  const errorFactory = new ErrorFactoryService({ alertReporting })

  beforeEach(async () => {
    vi.resetAllMocks()

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        // TODO we want to mock most of these
        {
          provide: LineLoggerService,
          useValue: createMock<LineLoggerService>(),
        },
        StatusService,
        MinioStorageService,
        PrismaService,
        ScannerClientService,
        { provide: ErrorFactoryService, useValue: errorFactory },
      ],
    }).compile()

    service = module.get<StatusService>(StatusService)
    logger = module.get(LineLoggerService)
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
      const prismaError = new Error('Query error.')
      service['prismaService'].isRunning = vi
        .fn()
        .mockRejectedValueOnce(prismaError)
      const result = await service.isPrismaRunning()
      expect(result).toEqual({
        running: false,
      })
      expect(vi.mocked(logger.error)).toHaveBeenCalledWith(
        errorFactory.InternalServerErrorException({
          errorEnum: StatusErrorsEnum.PRISMA_NOT_RUNNING,
          message: StatusResponseEnum.PRISMA_NOT_RUNNING,
          error: prismaError,
        }),
      )
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
      const scannerError = new Error('Error')
      service['scannerClientService'].isRunning = vi
        .fn()
        .mockRejectedValue(scannerError)

      const result = await service.isScannerRunning()
      expect(result).toEqual({
        running: false,
      })
      expect(vi.mocked(logger.error)).toHaveBeenCalledWith(
        errorFactory.InternalServerErrorException({
          errorEnum: StatusErrorsEnum.SCANNER_NOT_RUNNING,
          message: StatusResponseEnum.SCANNER_NOT_RUNNING,
          error: scannerError,
        }),
      )
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
      const minioError = new Error('Error')
      service['minioStorageService'].client = vi.fn().mockImplementation(() => {
        throw minioError
      })

      const result = service.isMinioRunning()
      expect(result).toEqual({
        running: false,
      })
      expect(vi.mocked(logger.error)).toHaveBeenCalledWith(
        errorFactory.InternalServerErrorException({
          errorEnum: StatusErrorsEnum.MINIO_NOT_RUNNING,
          message: StatusResponseEnum.MINIO_NOT_RUNNING,
          error: minioError,
        }),
      )
    })
  })
})
