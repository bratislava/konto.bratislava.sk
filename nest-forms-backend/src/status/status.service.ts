import { ErrorFactoryService, LineLoggerSubservice } from '@bratislava/log-nest'
import { Injectable } from '@nestjs/common'

import { MinioStorageService } from '../minio-storage/minio-storage.service'
import PrismaService from '../prisma/prisma.service'
import ScannerClientService from '../scanner-client/scanner-client.service'
import { ServiceRunningDto } from './dtos/status.dto'
import {
  StatusErrorsEnum,
  StatusResponseEnum,
} from './errors/status.errors.enum'

@Injectable()
export default class StatusService {
  constructor(
    private minioStorageService: MinioStorageService,
    private readonly prismaService: PrismaService,
    private readonly scannerClientService: ScannerClientService,
    private readonly errorFactoryService: ErrorFactoryService,
    private readonly logger: LineLoggerSubservice,
  ) {}

  // function which checks if prisma is running
  public async isPrismaRunning(): Promise<ServiceRunningDto> {
    try {
      await this.prismaService.isRunning()
      return {
        running: true,
      }
    } catch (error) {
      this.logger.error(
        this.errorFactoryService.InternalServerErrorException({
          errorEnum: StatusErrorsEnum.PRISMA_NOT_RUNNING,
          message: StatusResponseEnum.PRISMA_NOT_RUNNING,
          error,
        }),
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
        this.errorFactoryService.InternalServerErrorException({
          errorEnum: StatusErrorsEnum.SCANNER_NOT_RUNNING,
          message: StatusResponseEnum.SCANNER_NOT_RUNNING,
          error,
        }),
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
        this.errorFactoryService.InternalServerErrorException({
          errorEnum: StatusErrorsEnum.MINIO_NOT_RUNNING,
          message: StatusResponseEnum.MINIO_NOT_RUNNING,
          error,
        }),
      )
      return {
        running: false,
      }
    }
  }
}
