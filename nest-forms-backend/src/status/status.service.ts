import { Injectable } from '@nestjs/common'

import { MinioStorageService } from '../minio-storage/minio-storage.service'
import PrismaService from '../prisma/prisma.service'
import ScannerClientService from '../scanner-client/scanner-client.service'
import ThrowerErrorGuard from '../utils/guards/thrower-error.guard'
import { LineLoggerSubservice } from '../utils/subservices/line-logger.subservice'
import { ServiceRunningDto } from './dtos/status.dto'
import {
  StatusErrorsEnum,
  StatusResponseEnum,
} from './errors/status.errors.enum'

@Injectable()
export default class StatusService {
  private readonly logger: LineLoggerSubservice

  constructor(
    private minioStorageService: MinioStorageService,
    private readonly prismaService: PrismaService,
    private readonly scannerClientService: ScannerClientService,
    private readonly throwerErrorGuard: ThrowerErrorGuard,
  ) {
    this.logger = new LineLoggerSubservice('StatusService')
  }

  // function which checks if prisma is running
  public async isPrismaRunning(): Promise<ServiceRunningDto> {
    try {
      await this.prismaService.isRunning()
      return {
        running: true,
      }
    } catch (error) {
      this.logger.error(
        this.throwerErrorGuard.InternalServerErrorException(
          StatusErrorsEnum.PRISMA_NOT_RUNNING,
          StatusResponseEnum.PRISMA_NOT_RUNNING,
          undefined,
          error,
        ),
      )
      return {
        running: false,
      }
    }
  }

  // function which checks if forms is running
  public async isScannerRunning(): Promise<ServiceRunningDto> {
    try {
      const result = await this.scannerClientService.isRunning()
      this.logger.log(result)
      return {
        running: true,
      }
    } catch (error) {
      this.logger.error(
        this.throwerErrorGuard.InternalServerErrorException(
          StatusErrorsEnum.SCANNER_NOT_RUNNING,
          StatusResponseEnum.SCANNER_NOT_RUNNING,
          undefined,
          error,
        ),
      )
      return {
        running: false,
      }
    }
  }

  // function which checks if minio is running
  public isMinioRunning(): ServiceRunningDto {
    try {
      const result = this.minioStorageService.client()
      this.logger.log(result)
      return {
        running: true,
      }
    } catch (error) {
      this.logger.error(
        this.throwerErrorGuard.InternalServerErrorException(
          StatusErrorsEnum.MINIO_NOT_RUNNING,
          StatusResponseEnum.MINIO_NOT_RUNNING,
          undefined,
          error,
        ),
      )
      return {
        running: false,
      }
    }
  }
}
